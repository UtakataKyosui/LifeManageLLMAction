import type { BoothProduct } from './types';

/**
 * 出品者名でフィルタリング
 * @param product BOOTH商品情報
 * @param targetShopName 対象出品者名
 * @returns マッチする場合true
 */
export function filterByShopName(
    product: BoothProduct,
    targetShopName: string
): boolean {
    if (!product.shopName || !targetShopName) {
        return false;
    }

    return product.shopName.toLowerCase() === targetShopName.toLowerCase();
}

/**
 * キーワードでフィルタリング
 * @param product BOOTH商品情報
 * @param keywords カンマ区切りのキーワード
 * @returns いずれかのキーワードにマッチする場合true、空文字列の場合true
 */
export function filterByKeyword(
    product: BoothProduct,
    keywords: string
): boolean {
    // 空文字列の場合はフィルタリングしない
    if (!keywords.trim()) {
        return true;
    }

    // カンマで分割してトリム
    const keywordList = keywords.split(',').map((k) => k.trim()).filter((k) => k);

    // いずれかのキーワードがタイトルに含まれているかチェック
    return keywordList.some((keyword) => product.title.includes(keyword));
}
