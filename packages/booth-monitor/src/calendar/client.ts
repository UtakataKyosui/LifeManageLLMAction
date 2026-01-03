import { google, calendar_v3 } from 'googleapis';

export interface CalendarEventData {
    summary: string;
    description?: string;
    start: { dateTime: Date };
    end: { dateTime: Date };
    extendedProperties?: {
        private: {
            [key: string]: string;
        };
    };
}

export class CalendarClient {
    private calendar: calendar_v3.Calendar;
    private calendarId: string;

    constructor() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
        const calendarId = process.env.GOOGLE_CALENDAR_ID;

        if (!clientId || !clientSecret || !refreshToken || !calendarId) {
            throw new Error(
                'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN or GOOGLE_CALENDAR_ID is not set'
            );
        }

        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        // @ts-expect-error auth type mismatch in googleapis, but this works
        this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        this.calendarId = calendarId;
    }

    /**
     * イベントを作成
     * @param eventData イベントデータ
     * @returns 作成されたイベントID
     */
    async createEvent(eventData: CalendarEventData): Promise<string | null | undefined> {
        const response = await this.calendar.events.insert({
            calendarId: this.calendarId,
            requestBody: {
                summary: eventData.summary,
                description: eventData.description,
                start: { dateTime: eventData.start.dateTime.toISOString() },
                end: { dateTime: eventData.end.dateTime.toISOString() },
                extendedProperties: eventData.extendedProperties,
            },
        });

        return response.data.id;
    }

    /**
     * URLでイベントを検索 (extendedPropertiesを使用)
     * @param url BOOTH商品URL
     * @returns イベントオブジェクト、見つからない場合はnull
     */
    async searchEventByUrl(url: string): Promise<calendar_v3.Schema$Event | null> {
        const response = await this.calendar.events.list({
            calendarId: this.calendarId,
            privateExtendedProperty: [`boothUrl=${url}`],
        });

        if (response.data.items && response.data.items.length > 0) {
            return response.data.items[0];
        }

        return null;
    }

    /**
     * イベントを更新
     * @param eventId イベントID
     * @param eventData 更新するイベントデータ
     */
    async updateEvent(eventId: string, eventData: Partial<CalendarEventData>): Promise<void> {
        const requestBody: calendar_v3.Schema$Event = {};

        if (eventData.summary) requestBody.summary = eventData.summary;
        if (eventData.description) requestBody.description = eventData.description;
        if (eventData.start) requestBody.start = { dateTime: eventData.start.dateTime.toISOString() };
        if (eventData.end) requestBody.end = { dateTime: eventData.end.dateTime.toISOString() };
        if (eventData.extendedProperties) requestBody.extendedProperties = eventData.extendedProperties;

        await this.calendar.events.update({
            calendarId: this.calendarId,
            eventId: eventId,
            requestBody,
        });
    }

    /**
     * 期間内のイベント一覧を取得
     * @param timeMin 開始日時
     * @param timeMax 終了日時
     */
    async listEvents(timeMin: Date, timeMax: Date): Promise<calendar_v3.Schema$Event[]> {
        const response = await this.calendar.events.list({
            calendarId: this.calendarId,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items || [];
    }
}
