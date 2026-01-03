import type { BoothProduct } from '../booth/types';
import type { NotificationType } from '../notification/scheduler';

interface DiscordEmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

interface DiscordEmbed {
    title: string;
    description?: string;
    url?: string;
    color?: number;
    fields: DiscordEmbedField[];
    thumbnail?: {
        url: string;
    };
    footer?: {
        text: string;
    };
    timestamp?: string;
}

interface DiscordPayload {
    username?: string;
    avatar_url?: string;
    content?: string;
    embeds: DiscordEmbed[];
}

/**
 * 通知タイプごとの設定
 */
const NOTIFICATION_CONFIG: Record<
    NotificationType,
    { label: string; color: number }
> = {
    '1day': { label: '残り1日', color: 0xffff00 }, // Yellow
    '12hours': { label: '残り12時間', color: 0xffa500 }, // Orange
    '3hours': { label: '残り3時間', color: 0xff4500 }, // OrangeRed
    '1hour': { label: '残り1時間', color: 0xff0000 }, // Red
};

/**
 * Discord通知用のペイロードを作成
 * @param product 商品情報
 * @param notificationType 通知タイプ
 * @returns Discord Webhookペイロード
 */
export function formatDiscordPayload(
    product: BoothProduct,
    notificationType: NotificationType
): DiscordPayload {
    const config = NOTIFICATION_CONFIG[notificationType];

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

    const embed: DiscordEmbed = {
        title: `🔔 BOOTH購入期限通知: ${product.title}`,
        url: product.url,
        color: config.color,
        fields: [
            { name: '残り時間', value: config.label, inline: true },
            { name: '出品者', value: product.shopName, inline: true },
            { name: '終了日時', value: endDateStr, inline: false },
        ],
        footer: {
            text: 'LifeManageLLMAction',
        },
        timestamp: new Date().toISOString(),
    };

    if (product.imageUrl) {
        embed.thumbnail = { url: product.imageUrl };
    }

    return {
        username: 'BOOTH Monitor',
        embeds: [embed],
    };
}

/**
 * Discord Webhookに通知を送信
 * @param product 商品情報
 * @param notificationType 通知タイプ
 */
export async function sendNotification(
    product: BoothProduct,
    notificationType: NotificationType
): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        throw new Error('DISCORD_WEBHOOK_URL is not set');
    }

    const payload = formatDiscordPayload(product, notificationType);

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to send Discord notification: ${response.statusText}`);
    }
}
