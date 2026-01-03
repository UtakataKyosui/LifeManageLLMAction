import { google, gmail_v1 } from 'googleapis';

export class GmailClient {
    private gmail: gmail_v1.Gmail;

    constructor() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            throw new Error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN is not set');
        }

        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        // @ts-expect-error auth type mismatch
        this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    }

    /**
     * BOOTHからの未読メールを検索
     * @returns メッセージリスト
     */
    async searchBoothEmails(): Promise<gmail_v1.Schema$Message[]> {
        const response = await this.gmail.users.messages.list({
            userId: 'me',
            q: 'from:no-reply@booth.pm is:unread',
        });

        return response.data.messages || [];
    }

    /**
     * メール本文からBOOTH商品URLを抽出
     * @param messageId メッセージID
     * @returns 商品URLの配列
     */
    async extractProductUrls(messageId: string): Promise<string[]> {
        const response = await this.gmail.users.messages.get({
            userId: 'me',
            id: messageId,
        });

        const payload = response.data.payload;
        if (!payload || !payload.body || !payload.body.data) {
            return [];
        }

        const body = Buffer.from(payload.body.data, 'base64').toString('utf-8');

        // BOOTH商品URLの正規表現 (https://*.booth.pm/items/*)
        const urlPattern = /https:\/\/[a-zA-Z0-9-]+\.booth\.pm\/items\/\d+/g;
        const matches = body.match(urlPattern);

        return matches ? Array.from(new Set(matches)) : [];
    }

    /**
     * メールを既読にする（UNREADラベルを削除）
     * @param messageId メッセージID
     */
    async markAsRead(messageId: string): Promise<void> {
        await this.gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['UNREAD'],
            },
        });
    }
}
