import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalendarClient } from '../../src/calendar/client';
import { google } from 'googleapis';

// Google APIのモック
vi.mock('googleapis', () => {
    const mockInsert = vi.fn().mockResolvedValue({
        data: { id: 'new-event-id' },
    });
    const mockUpdate = vi.fn().mockResolvedValue({
        data: { id: 'updated-event-id' },
    });
    const mockList = vi.fn().mockResolvedValue({
        data: {
            items: [],
        },
    });

    return {
        google: {
            calendar: vi.fn().mockReturnValue({
                events: {
                    insert: mockInsert,
                    update: mockUpdate,
                    list: mockList,
                },
            }),
            auth: {
                fromJSON: vi.fn(),
            },
        },
    };
});

describe('Calendar Client Module', () => {
    let client: CalendarClient;
    const mockCalendarId = 'test-calendar-id';
    const mockServiceAccountKey = JSON.stringify({
        type: 'service_account',
        project_id: 'test-project',
    });

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GOOGLE_CALENDAR_ID = mockCalendarId;
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY = mockServiceAccountKey;
        client = new CalendarClient();
    });

    describe('createEvent', () => {
        it('should create an event successfully', async () => {
            const eventData = {
                summary: '[BOOTH] Test Item',
                description: 'Shop: Test Shop\nURL: https://example.com',
                start: { dateTime: new Date('2026-01-01T10:00:00Z') },
                end: { dateTime: new Date('2026-01-01T11:00:00Z') },
                extendedProperties: {
                    private: {
                        boothUrl: 'https://example.com',
                        shopName: 'Test Shop',
                    },
                },
            };

            const result = await client.createEvent(eventData);

            expect(result).toEqual('new-event-id');
            const calendar = google.calendar('v3');
            expect(calendar.events.insert).toHaveBeenCalledWith({
                calendarId: mockCalendarId,
                requestBody: expect.objectContaining({
                    summary: eventData.summary,
                }),
            });
        });
    });

    describe('searchEventByUrl', () => {
        it('should return event when found', async () => {
            const mockEvent = {
                id: 'existing-event-id',
                extendedProperties: {
                    private: {
                        boothUrl: 'https://example.com',
                    },
                },
            };

            const calendar = google.calendar('v3');
            // @ts-expect-error mock implementation
            calendar.events.list.mockResolvedValueOnce({
                data: {
                    items: [mockEvent],
                },
            });

            const result = await client.searchEventByUrl('https://example.com');

            expect(result).toEqual(mockEvent);
            expect(calendar.events.list).toHaveBeenCalledWith({
                calendarId: mockCalendarId,
                privateExtendedProperty: ['boothUrl=https://example.com'],
            });
        });

        it('should return null when not found', async () => {
            const result = await client.searchEventByUrl('https://not-found.com');
            expect(result).toBeNull();
        });
    });

    describe('updateEvent', () => {
        it('should update an event successfully', async () => {
            const eventId = 'existing-event-id';
            const eventData = {
                summary: '[BOOTH] Updated Item',
                description: 'Updated Description',
                start: { dateTime: new Date('2026-01-01T12:00:00Z') },
                end: { dateTime: new Date('2026-01-01T13:00:00Z') },
            };

            await client.updateEvent(eventId, eventData);

            const calendar = google.calendar('v3');
            expect(calendar.events.update).toHaveBeenCalledWith({
                calendarId: mockCalendarId,
                eventId: eventId,
                requestBody: expect.objectContaining({
                    summary: eventData.summary,
                }),
            });
        });
    });
});
