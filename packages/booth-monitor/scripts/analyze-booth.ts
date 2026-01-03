// BOOTH商品ページの実際の構造を確認するスクリプト
import { chromium } from 'playwright';

async function analyzeBooth() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://maha5.booth.pm/items/7795996', {
        waitUntil: 'networkidle',
    });

    console.log('=== ページタイトル ===');
    const title = await page.title();
    console.log(title);

    console.log('\n=== 商品名 ===');
    const productName = await page.textContent('h1');
    console.log(productName);

    console.log('\n=== ショップ名 ===');
    const shopName = await page.textContent('.shop-name, .user-info-name');
    console.log(shopName);

    console.log('\n=== ページ本文（販売期間を含む） ===');
    const description = await page.textContent('.description, .booth-description');
    console.log(description);

    console.log('\n=== 全テキストから販売期間を検索 ===');
    const bodyText = await page.textContent('body');
    const periodMatch = bodyText?.match(
        /(\d{4})\/(\d{1,2})\/(\d{1,2})\([^)]+\)\s*[～〜-]\s*(\d{4})\/(\d{1,2})\/(\d{1,2})\([^)]+\)/
    );
    if (periodMatch) {
        console.log('販売期間マッチ:', periodMatch[0]);
        console.log('開始:', `${periodMatch[1]}/${periodMatch[2]}/${periodMatch[3]}`);
        console.log('終了:', `${periodMatch[4]}/${periodMatch[5]}/${periodMatch[6]}`);
    }

    console.log('\n=== 画像URL ===');
    const imageUrl = await page.getAttribute('.item-image img, img[alt]', 'src');
    console.log(imageUrl);

    await browser.close();
}

analyzeBooth().catch(console.error);
