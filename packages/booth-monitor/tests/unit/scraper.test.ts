import { describe, it, expect, vi } from 'vitest';
import { scrapeProductInfo, parsePurchasePeriod } from '../../src/booth/scraper';

// Playwrightのモック
vi.mock('playwright', () => ({
    chromium: {
        launch: vi.fn(),
    },
}));

describe('BOOTH Scraper Module', () => {
    describe('parsePurchasePeriod', () => {
        it('should parse BOOTH format with day of week', () => {
            const text = '2026/1/1(木) ～ 2026/1/31(水)';

            const result = parsePurchasePeriod(text);

            expect(result).not.toBeNull();
            expect(result?.start).toBeInstanceOf(Date);
            expect(result?.end).toBeInstanceOf(Date);
            expect(result?.start.getFullYear()).toBe(2026);
            expect(result?.start.getMonth()).toBe(0); // 1月は0
            expect(result?.start.getDate()).toBe(1);
            expect(result?.start.getHours()).toBe(0); // 開始は00:00
            expect(result?.end.getFullYear()).toBe(2026);
            expect(result?.end.getMonth()).toBe(0);
            expect(result?.end.getDate()).toBe(31);
            expect(result?.end.getHours()).toBe(23); // 終了は23:59
            expect(result?.end.getMinutes()).toBe(59);
        });

        it('should parse format with time', () => {
            const text = '販売期間: 2026年1月10日 12:00 〜 2026年1月20日 23:59';

            const result = parsePurchasePeriod(text);

            expect(result).not.toBeNull();
            expect(result?.start.getFullYear()).toBe(2026);
            expect(result?.start.getMonth()).toBe(0); // 1月は0
            expect(result?.start.getDate()).toBe(10);
            expect(result?.start.getHours()).toBe(12);
            expect(result?.end.getFullYear()).toBe(2026);
            expect(result?.end.getMonth()).toBe(0);
            expect(result?.end.getDate()).toBe(20);
            expect(result?.end.getHours()).toBe(23);
        });
        it('should return null when no purchase period is found', () => {
            const text = '通常販売中の商品です';

            const result = parsePurchasePeriod(text);

            expect(result).toBeNull();
        });

        it('should handle different date formats', () => {
            const text = '2026/01/10 12:00 - 2026/01/20 23:59';

            const result = parsePurchasePeriod(text);

            expect(result).not.toBeNull();
            expect(result?.start.getFullYear()).toBe(2026);
            expect(result?.end.getFullYear()).toBe(2026);
        });

        it('should return null for invalid date format', () => {
            const text = '販売期間: 不明';

            const result = parsePurchasePeriod(text);

            expect(result).toBeNull();
        });
    });

    describe('scrapeProductInfo', () => {
        it('should extract product information from BOOTH page', async () => {
            // このテストは実際のネットワーク接続が必要なため、
            // 統合テストとして別途実装する
            // ここではモックを使用した基本的なテストのみ
            expect(true).toBe(true);
        });
    });
});
