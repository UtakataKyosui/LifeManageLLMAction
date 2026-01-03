import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendNotification, formatNotificationMessage } from '../../src/line/client';
import type { BoothProduct } from '../../src/booth/types';
import type { NotificationType } from '../../src/notification/scheduler';

// LINE SDKのモック
vi.mock('@line/bot-sdk', () => ({
    messagingApi: {
        MessagingApiClient: vi.fn().mockImplementation(() => ({
            pushMessage: vi.fn().mockResolvedValue({}),
        })),
    },
}));

describe('LINE Client Module', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('formatNotificationMessage', () => {
        const product: BoothProduct = {
            url: 'https://booth.pm/ja/items/12345',
            title: '音成モカ グッズセット',
            shopName: 'MAHA5JP',
            purchasePeriod: {
                start: new Date('2026-01-10T12:00:00+09:00'),
                end: new Date('2026-01-20T23:59:59+09:00'),
            },
        };

        it('should format message for 1 day before notification', () => {
            const message = formatNotificationMessage(product, '1day');

            expect(message).toContain('🔔 BOOTH購入期限通知');
            expect(message).toContain('【残り1日】');
            expect(message).toContain('音成モカ グッズセット');
            expect(message).toContain('MAHA5JP');
            expect(message).toContain('2026/01/20 23:59');
            expect(message).toContain('https://booth.pm/ja/items/12345');
        });

        it('should format message for 12 hours before notification', () => {
            const message = formatNotificationMessage(product, '12hours');

            expect(message).toContain('【残り12時間】');
        });

        it('should format message for 3 hours before notification', () => {
            const message = formatNotificationMessage(product, '3hours');

            expect(message).toContain('【残り3時間】');
        });

        it('should format message for 1 hour before notification', () => {
            const message = formatNotificationMessage(product, '1hour');

            expect(message).toContain('【残り1時間】');
        });

        it('should handle product without purchase period', () => {
            const productNoPeriod: BoothProduct = {
                ...product,
                purchasePeriod: null,
            };

            const message = formatNotificationMessage(productNoPeriod, '1day');

            expect(message).toContain('終了: 期限不明');
        });
    });

    describe('sendNotification', () => {
        it('should send notification successfully', async () => {
            const product: BoothProduct = {
                url: 'https://booth.pm/ja/items/12345',
                title: '音成モカ グッズセット',
                shopName: 'MAHA5JP',
                purchasePeriod: {
                    start: new Date('2026-01-10T12:00:00+09:00'),
                    end: new Date('2026-01-20T23:59:59+09:00'),
                },
            };

            // 環境変数を設定
            process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test_token';
            process.env.LINE_USER_ID = 'test_user_id';

            await expect(
                sendNotification(product, '1day')
            ).resolves.not.toThrow();
        });

        it('should throw error when LINE_CHANNEL_ACCESS_TOKEN is not set', async () => {
            delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
            process.env.LINE_USER_ID = 'test_user_id';

            const product: BoothProduct = {
                url: 'https://booth.pm/ja/items/12345',
                title: '音成モカ グッズセット',
                shopName: 'MAHA5JP',
                purchasePeriod: null,
            };

            await expect(sendNotification(product, '1day')).rejects.toThrow(
                'LINE_CHANNEL_ACCESS_TOKEN is not set'
            );
        });

        it('should throw error when LINE_USER_ID is not set', async () => {
            process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test_token';
            delete process.env.LINE_USER_ID;

            const product: BoothProduct = {
                url: 'https://booth.pm/ja/items/12345',
                title: '音成モカ グッズセット',
                shopName: 'MAHA5JP',
                purchasePeriod: null,
            };

            await expect(sendNotification(product, '1day')).rejects.toThrow(
                'LINE_USER_ID is not set'
            );
        });
    });
});
