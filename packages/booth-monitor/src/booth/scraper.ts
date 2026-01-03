import { chromium, type Browser, type Page } from 'playwright';
import type { BoothProduct } from './types';

/**
 * BOOTH商品ページから情報をスクレイピング
 * @param url 商品URL
 * @returns 商品情報
 */
export async function scrapeProductInfo(url: string): Promise<BoothProduct> {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        browser = await chromium.launch({ headless: true });
        page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle' });

        // 商品タイトルを取得
        const title =
            (await page.textContent('h1.item-name')) ||
            (await page.textContent('.item-basic-info h1')) ||
            '';

        // 出品者名を取得
        const shopName =
            (await page.textContent('.shop-name')) ||
            (await page.textContent('.user-info-name')) ||
            '';

        // 商品画像URLを取得
        const imageElement = await page.$('.item-image img, .main-info-images img');
        const imageUrl = imageElement
            ? await imageElement.getAttribute('src')
            : undefined;

        // ページ全体のテキストから購入期間を抽出
        const bodyText = (await page.textContent('body')) || '';
        const purchasePeriod = parsePurchasePeriod(bodyText);

        return {
            url,
            title: title.trim(),
            shopName: shopName.trim(),
            purchasePeriod,
            imageUrl: imageUrl || undefined,
        };
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
}

/**
 * テキストから購入期間をパース
 * @param text テキスト
 * @returns 購入期間、見つからない場合null
 */
export function parsePurchasePeriod(text: string): {
    start: Date;
    end: Date;
} | null {
    // パターン1: "2026/1/1(木) ～ 2026/1/31(水)" (実際のBOOTHフォーマット)
    const pattern1 =
        /(\d{4})\/(\d{1,2})\/(\d{1,2})\([^)]+\)\s*[～〜-]\s*(\d{4})\/(\d{1,2})\/(\d{1,2})\([^)]+\)/;
    const match1 = text.match(pattern1);

    if (match1) {
        const [, startYear, startMonth, startDay, endYear, endMonth, endDay] =
            match1;

        // BOOTHの販売期間は通常、開始日の00:00から終了日の23:59まで
        const start = new Date(
            parseInt(startYear),
            parseInt(startMonth) - 1,
            parseInt(startDay),
            0,
            0,
            0
        );

        const end = new Date(
            parseInt(endYear),
            parseInt(endMonth) - 1,
            parseInt(endDay),
            23,
            59,
            59
        );

        return { start, end };
    }

    // パターン2: "2026年1月10日 12:00 〜 2026年1月20日 23:59" (時刻付き)
    const pattern2 =
        /(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})\s*[〜～-]\s*(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})/;
    const match2 = text.match(pattern2);

    if (match2) {
        const [
            ,
            startYear,
            startMonth,
            startDay,
            startHour,
            startMinute,
            endYear,
            endMonth,
            endDay,
            endHour,
            endMinute,
        ] = match2;

        const start = new Date(
            parseInt(startYear),
            parseInt(startMonth) - 1,
            parseInt(startDay),
            parseInt(startHour),
            parseInt(startMinute)
        );

        const end = new Date(
            parseInt(endYear),
            parseInt(endMonth) - 1,
            parseInt(endDay),
            parseInt(endHour),
            parseInt(endMinute)
        );

        return { start, end };
    }

    // パターン3: "2026/01/10 12:00 - 2026/01/20 23:59" (時刻付き、スラッシュ区切り)
    const pattern3 =
        /(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})\s*[-]\s*(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/;
    const match3 = text.match(pattern3);

    if (match3) {
        const [
            ,
            startYear,
            startMonth,
            startDay,
            startHour,
            startMinute,
            endYear,
            endMonth,
            endDay,
            endHour,
            endMinute,
        ] = match3;

        const start = new Date(
            parseInt(startYear),
            parseInt(startMonth) - 1,
            parseInt(startDay),
            parseInt(startHour),
            parseInt(startMinute)
        );

        const end = new Date(
            parseInt(endYear),
            parseInt(endMonth) - 1,
            parseInt(endDay),
            parseInt(endHour),
            parseInt(endMinute)
        );

        return { start, end };
    }

    return null;
}
