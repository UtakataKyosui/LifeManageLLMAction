import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GmailClient } from '../../src/gmail/client';
import { google } from 'googleapis';

// Google APIのモック
vi.mock('googleapis', () => {
    const mockList = vi.fn().mockResolvedValue({
        data: {
            messages: [
                { id: 'msg1', threadId: 'thread1' },
                { id: 'msg2', threadId: 'thread2' },
            ],
        },
    });

    const mockGet = vi.fn().mockImplementation(({ id }) => {
        if (id === 'msg1') {
            return Promise.resolve({
                data: {
                    id: 'msg1',
                    snippet: 'BOOTHの新着商品のお知らせ...',
                    payload: {
                        body: {
                            data: Buffer.from(
                                'BOOTHで新着商品が出品されました。\nhttps://maha5.booth.pm/items/12345'
                            ).toString('base64'),
                        },
                    },
                },
            });
        }
        return Promise.resolve({ data: {} });
    });

    const mockModify = vi.fn().mockResolvedValue({});

    return {
        google: {
            gmail: vi.fn().mockReturnValue({
                users: {
                    messages: {
                        list: mockList,
                        get: mockGet,
                        modify: mockModify,
                    },
                },
            }),
            auth: {
                fromJSON: vi.fn(),
            },
        },
    };
});

describe('Gmail Client Module', () => {
    let client: GmailClient;
    const mockServiceAccountKey = JSON.stringify({
        type: 'service_account',
        project_id: 'test-project',
    });

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY = mockServiceAccountKey;
        client = new GmailClient();
    });

    describe('searchBoothEmails', () => {
        it('should search for unread emails from BOOTH', async () => {
            const messages = await client.searchBoothEmails();

            const gmail = google.gmail('v1');
            expect(gmail.users.messages.list).toHaveBeenCalledWith({
                userId: 'me',
                q: 'from:no-reply@booth.pm is:unread',
            });
            expect(messages).toHaveLength(2);
        });
    });

    describe('extractProductUrls', () => {
        it('should extract BOOTH item URLs from email body', async () => {
            const messageId = 'msg1';
            const urls = await client.extractProductUrls(messageId);

            expect(urls).toContain('https://maha5.booth.pm/items/12345');
        });
    });

    describe('markAsRead', () => {
        it('should remove UNREAD label from message', async () => {
            const messageId = 'msg1';
            await client.markAsRead(messageId);

            const gmail = google.gmail('v1');
            expect(gmail.users.messages.modify).toHaveBeenCalledWith({
                userId: 'me',
                id: messageId,
                requestBody: {
                    removeLabelIds: ['UNREAD'],
                },
            });
        });
    });
});
