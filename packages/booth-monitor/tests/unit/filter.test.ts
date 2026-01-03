import { describe, it, expect } from 'vitest';
import { filterByShopName, filterByKeyword } from '../../src/booth/filter';

describe('BOOTH Filter Module', () => {
    describe('filterByShopName', () => {
        it('should return true when shop name matches exactly', () => {
            const product = {
                url: 'https://booth.pm/ja/items/12345',
                title: '音成モカ グッズ',
                shopName: 'MAHA5JP',
                purchasePeriod: null,
            };

            const result = filterByShopName(product, 'MAHA5JP');
            expect(result).toBe(true);
        });

        it('should return false when shop name does not match', () => {
            const product = {
                url: 'https://booth.pm/ja/items/12345',
                title: '音成モカ グッズ',
                shopName: 'OtherShop',
                purchasePeriod: null,
            };

            const result = filterByShopName(product, 'MAHA5JP');
            expect(result).toBe(false);
        });

        it('should be case-insensitive', () => {
            const product = {
                url: 'https://booth.pm/ja/items/12345',
                title: '音成モカ グッズ',
                shopName: 'maha5jp',
                purchasePeriod: null,
            };

            const result = filterByShopName(product, 'MAHA5JP');
            expect(result).toBe(true);
        });

        it('should handle empty shop name', () => {
            const product = {
                url: 'https://booth.pm/ja/items/12345',
                title: '音成モカ グッズ',
                shopName: '',
                purchasePeriod: null,
            };

            const result = filterByShopName(product, 'MAHA5JP');
            expect(result).toBe(false);
        });
    });

    describe('filterByKeyword', () => {
        it('should return true when title contains keyword', () => {
            const product = {
                url: 'https://booth.pm/ja/items/12345',
                title: '音成モカ グッズ',
                shopName: 'MAHA5JP',
                purchasePeriod: null,
            };

            const result = filterByKeyword(product, '音成モカ');
            expect(result).toBe(true);
        });

        it('should return false when title does not contain keyword', () => {
            const product = {
                url: 'https://booth.pm/ja/items/12345',
                title: '他のキャラクター グッズ',
                shopName: 'MAHA5JP',
                purchasePeriod: null,
            };

            const result = filterByKeyword(product, '音成モカ');
            expect(result).toBe(false);
        });

        it('should support multiple keywords (comma-separated)', () => {
            const product = {
                url: 'https://booth.pm/ja/items/12345',
                title: 'オトナリモカ グッズ',
                shopName: 'MAHA5JP',
                purchasePeriod: null,
            };

            const result = filterByKeyword(product, '音成モカ,オトナリモカ');
            expect(result).toBe(true);
        });

        it('should return false when none of the keywords match', () => {
            const product = {
                url: 'https://booth.pm/ja/items/12345',
                title: '他のキャラクター グッズ',
                shopName: 'MAHA5JP',
                purchasePeriod: null,
            };

            const result = filterByKeyword(product, '音成モカ,オトナリモカ');
            expect(result).toBe(false);
        });

        it('should handle empty keyword string', () => {
            const product = {
                url: 'https://booth.pm/ja/items/12345',
                title: '音成モカ グッズ',
                shopName: 'MAHA5JP',
                purchasePeriod: null,
            };

            const result = filterByKeyword(product, '');
            expect(result).toBe(true); // Empty keyword means no filtering
        });

        it('should trim whitespace from keywords', () => {
            const product = {
                url: 'https://booth.pm/ja/items/12345',
                title: '音成モカ グッズ',
                shopName: 'MAHA5JP',
                purchasePeriod: null,
            };

            const result = filterByKeyword(product, ' 音成モカ , オトナリモカ ');
            expect(result).toBe(true);
        });
    });
});
