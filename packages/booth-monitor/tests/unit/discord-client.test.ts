import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendNotification, formatDiscordPayload } from '../../src/discord/client';
import type { BoothProduct } from '../../src/booth/types';

describe('Discord Client Module', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', mockFetch);
        process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const product: BoothProduct = {
        url: 'https://booth.pm/ja/items/12345',
        title: '音成モカ グッズセット',
        shopName: 'MAHA5JP',
        purchasePeriod: {
            start: new Date('2026-01-10T12:00:00+09:00'),
            end: new Date('2026-01-20T23:59:59+09:00'),
        },
        imageUrl: 'https://booth.pm/image.jpg',
    };

    describe('formatDiscordPayload', () => {
        it('should format payload for 1 day before notification', () => {
            const payload = formatDiscordPayload(product, '1day');

            expect(payload.embeds[0].title).toContain('BOOTH購入期限通知');
            expect(payload.embeds[0].color).toBe(0xFFFF00); // Yellow
            expect(payload.embeds[0].thumbnail?.url).toBe(product.imageUrl);

            // フィールドのチェック
            const fields = payload.embeds[0].fields;
            expect(fields).toEqual(expect.arrayContaining([
                { name: '残り時間', value: '残り1日', inline: true },
                { name: '出品者', value: 'MAHA5JP', inline: true },
            ]));
        });

        it('should format payload for 1 hour before notification (Urgent)', () => {
            const payload = formatDiscordPayload(product, '1hour');

            expect(payload.embeds[0].color).toBe(0xFF0000); // Red
            expect(payload.embeds[0].fields).toContainEqual({ name: '残り時間', value: '残り1時間', inline: true });
        });
    });

    describe('sendNotification', () => {
        it('should send webhook request successfully', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true });

            await sendNotification(product, '1day');

            expect(mockFetch).toHaveBeenCalledWith(
                'https://discord.com/api/webhooks/test',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        });

        it('should throw error when DISCORD_WEBHOOK_URL is not set', async () => {
            delete process.env.DISCORD_WEBHOOK_URL;

            await expect(sendNotification(product, '1day')).rejects.toThrow(
                'DISCORD_WEBHOOK_URL is not set'
            );
        });

        it('should throw error when fetch fails', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Internal Server Error'
            });

            await expect(sendNotification(product, '1day')).rejects.toThrow(
                'Failed to send Discord notification: Internal Server Error'
            );
        });
    });
});
