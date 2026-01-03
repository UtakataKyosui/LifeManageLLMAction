import { messagingApi } from '@line/bot-sdk';
import type { BoothProduct } from '../booth/types';
import type { NotificationType } from '../notification/scheduler';

/**
 * LINE通知メッセージをフォーマット
 * @param product BOOTH商品情報
 * @param notificationType 通知タイプ
 * @returns フォーマット済みメッセージ
 */
export function formatNotificationMessage(
    product: BoothProduct,
    notificationType: NotificationType
): string {
    const timeLabels: Record<NotificationType, string> = {
        '1day': '残り1日',
        '12hours': '残り12時間',
        '3hours': '残り3時間',
        '1hour': '残り1時間',
    };

    const endDateStr = product.purchasePeriod
        ? `${product.purchasePeriod.end.getFullYear()}/${String(
            product.purchasePeriod.end.getMonth() + 1
        ).padStart(2, '0')}/${String(product.purchasePeriod.end.getDate()).padStart(
            2,
            '0'
        )} ${String(product.purchasePeriod.end.getHours()).padStart(
            2,
            '0'
        )}:${String(product.purchasePeriod.end.getMinutes()).padStart(2, '0')}`
        : '期限不明';

    return `🔔 BOOTH購入期限通知

【${timeLabels[notificationType]}】
商品: ${product.title}
出品者: ${product.shopName}
終了: ${endDateStr}

🔗 ${product.url}`;
}

/**
 * LINE通知を送信
 * @param product BOOTH商品情報
 * @param notificationType 通知タイプ
 */
export async function sendNotification(
    product: BoothProduct,
    notificationType: NotificationType
): Promise<void> {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const userId = process.env.LINE_USER_ID;

    if (!channelAccessToken) {
        throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set');
    }

    if (!userId) {
        throw new Error('LINE_USER_ID is not set');
    }

    const client = new messagingApi.MessagingApiClient({
        channelAccessToken,
    });

    const message = formatNotificationMessage(product, notificationType);

    await client.pushMessage({
        to: userId,
        messages: [
            {
                type: 'text',
                text: message,
            },
        ],
    });
}
