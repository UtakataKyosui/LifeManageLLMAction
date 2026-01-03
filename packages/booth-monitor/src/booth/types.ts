/**
 * BOOTH商品情報の型定義
 */
export interface BoothProduct {
    /** 商品URL */
    url: string;
    /** 商品タイトル */
    title: string;
    /** 出品者名 */
    shopName: string;
    /** 購入期間 */
    purchasePeriod: {
        start: Date;
        end: Date;
    } | null;
    /** 商品画像URL (オプション) */
    imageUrl?: string;
}
