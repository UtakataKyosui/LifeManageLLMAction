import * as core from '@actions/core';
import { GmailClient } from './gmail/client';
import { scrapeProductInfo } from './booth/scraper';
import { filterByShopName, filterByKeyword } from './booth/filter';
import { CalendarClient } from './calendar/client';
import { sendNotification } from './discord/client';
import {
    calculateNotificationTimes,
    shouldNotify,
    type NotificationTiming,
} from './notification/scheduler';

async function run(): Promise<void> {
    try {
        const shopName = process.env.BOOTH_SHOP_NAME;
        const keywords = process.env.BOOTH_KEYWORDS;

        if (!shopName || !keywords) {
            throw new Error('BOOTH_SHOP_NAME or BOOTH_KEYWORDS is not set');
        }

        core.info('🚀 Starting BOOTH Monitor...');

        // Debug: Check if keys are present (masked)
        if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
            core.info('🔑 GOOGLE_SERVICE_ACCOUNT_KEY is set');
            try {
                const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
                core.info(`   Project ID: ${key.project_id}`);
                core.info(`   Client Email: ${key.client_email}`);
            } catch (e) {
                core.error('❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON');
            }
        } else {
            core.error('❌ GOOGLE_SERVICE_ACCOUNT_KEY is NOT set');
        }

        // 1. Gmail Initialization
        let gmailClient;
        try {
            core.info('🔹 Initializing Gmail Client...');
            gmailClient = new GmailClient();
            core.info('   Gmail Client initialized.');
        } catch (error) {
            throw new Error(`Failed to initialize Gmail Client: ${error}`);
        }

        // 2. Gmail Search
        let messages;
        try {
            core.info('🔹 Searching Gmail...');
            messages = await gmailClient.searchBoothEmails();
            core.info(`📧 Found ${messages.length} unread BOOTH emails`);
        } catch (error) {
            // @ts-expect-error error typing
            throw new Error(`Failed to search Gmail: ${error.message || error}`);
        }

        // 3. Calendar Initialization
        let calendarClient;
        try {
            core.info('🔹 Initializing Calendar Client...');
            calendarClient = new CalendarClient();
            core.info('   Calendar Client initialized.');
        } catch (error) {
            throw new Error(`Failed to initialize Calendar Client: ${error}`);
        }

        // 2. メールからURLを抽出して処理
        for (const message of messages) {
            if (!message.id) continue;

            try {
                const urls = await gmailClient.extractProductUrls(message.id);
                core.info(`  Message ${message.id}: Found ${urls.length} URLs`);

                for (const url of urls) {
                    // 3. スクレイピングとフィルタリング
                    core.info(`  🔍 Checking: ${url}`);
                    const product = await scrapeProductInfo(url);

                    if (!filterByShopName(product, shopName)) {
                        core.info(`    ❌ Shop name mismatch: ${product.shopName}`);
                        continue;
                    }

                    if (!filterByKeyword(product, keywords)) {
                        core.info(`    ❌ Keyword mismatch: ${product.title}`);
                        continue;
                    }

                    if (!product.purchasePeriod) {
                        core.info('    ⚠️ No purchase period found');
                        continue;
                    }

                    core.info(`    ✅ Found matching item: ${product.title}`);
                    core.info(`       Period: ${product.purchasePeriod.start} - ${product.purchasePeriod.end}`);

                    // 4. カレンダー登録/更新
                    const existingEvent = await calendarClient.searchEventByUrl(url);

                    if (existingEvent) {
                        core.info('    📅 Event already exists, updating...');
                        if (existingEvent.id) {
                            await calendarClient.updateEvent(existingEvent.id, {
                                summary: `[BOOTH] ${product.title}`,
                                description: `出品者: ${product.shopName}\nURL: ${product.url}`,
                                start: { dateTime: product.purchasePeriod.start },
                                end: { dateTime: product.purchasePeriod.end },
                            });
                        }
                    } else {
                        core.info('    📅 Creating new calendar event...');
                        await calendarClient.createEvent({
                            summary: `[BOOTH] ${product.title}`,
                            description: `出品者: ${product.shopName}\nURL: ${product.url}`,
                            start: { dateTime: product.purchasePeriod.start },
                            end: { dateTime: product.purchasePeriod.end },
                            extendedProperties: {
                                private: {
                                    boothUrl: url,
                                    shopName: product.shopName,
                                },
                            },
                        });
                    }
                }

                // メールを既読にする
                await gmailClient.markAsRead(message.id);
                core.info(`  ✅ Marked message ${message.id} as read`);

            } catch (error) {
                core.error(`  ❌ Error processing message ${message.id}: ${error}`);
            }
        }

        // 5. 通知処理
        core.info('🔔 Checking for notifications...');
        const now = new Date();
        // 前後1ヶ月くらいのイベントを取得して確認（範囲は調整可能）
        const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1日前
        const timeMax = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2日後

        // 通知対象となりうるイベントを取得
        // 実際にはlistEventsの実装に合わせて、期間指定でイベントを取得するアプローチが必要
        // ここではCalendarClientにlistEventsを追加した前提で
        const events = await calendarClient.listEvents(timeMin, timeMax);

        for (const event of events) {
            // BOOTHイベントかチェック
            if (!event.extendedProperties?.private?.['boothUrl']) continue;

            const endStr = event.end?.dateTime;
            if (!endStr) continue;

            const endDate = new Date(endStr);
            const timings = calculateNotificationTimes(endDate);

            for (const timing of timings) {
                if (shouldNotify(timing, now)) {
                    // 商品情報を再構築（あるいは保存された情報を使用）
                    const productMock = {
                        url: event.extendedProperties.private['boothUrl'],
                        title: event.summary?.replace('[BOOTH] ', '') || 'Unknown',
                        shopName: event.extendedProperties.private['shopName'] || 'Unknown',
                        purchasePeriod: {
                            start: new Date(event.start?.dateTime || now),
                            end: endDate
                        }
                    };

                    core.info(`    📲 Sending Discord notification for: ${productMock.title} (${timing.type})`);
                    await sendNotification(productMock, timing.type);
                }
            }
        }

        core.info('✅ BOOTH Monitor finished successfully');
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            core.setFailed('An unexpected error occurred');
        }
    }
}

run();
