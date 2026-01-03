import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    calculateNotificationTimes,
    shouldNotify,
    type NotificationTiming,
} from '../../src/notification/scheduler';

describe('Notification Scheduler Module', () => {
    beforeEach(() => {
        // タイムゾーンをJSTに設定
        vi.setSystemTime(new Date('2026-01-10T12:00:00+09:00'));
    });

    describe('calculateNotificationTimes', () => {
        it('should calculate all notification times correctly', () => {
            const endDate = new Date('2026-01-15T23:59:59+09:00');

            const result = calculateNotificationTimes(endDate);

            expect(result).toHaveLength(4);
            expect(result[0].type).toBe('1day');
            expect(result[0].time).toEqual(new Date('2026-01-14T23:59:59+09:00'));
            expect(result[1].type).toBe('12hours');
            expect(result[1].time).toEqual(new Date('2026-01-15T11:59:59+09:00'));
            expect(result[2].type).toBe('3hours');
            expect(result[2].time).toEqual(new Date('2026-01-15T20:59:59+09:00'));
            expect(result[3].type).toBe('1hour');
            expect(result[3].time).toEqual(new Date('2026-01-15T22:59:59+09:00'));
        });

        it('should handle dates in the past', () => {
            const endDate = new Date('2026-01-01T12:00:00+09:00');

            const result = calculateNotificationTimes(endDate);

            expect(result).toHaveLength(4);
            // 過去の日付でも計算は行われる
            expect(result[0].time.getTime()).toBeLessThan(Date.now());
        });
    });

    describe('shouldNotify', () => {
        it('should return true when current time is within notification window', () => {
            // 現在時刻: 2026-01-10T12:00:00+09:00
            // 通知時刻: 2026-01-10T12:15:00+09:00 (15分後)
            const notificationTime: NotificationTiming = {
                type: '1hour',
                time: new Date('2026-01-10T12:15:00+09:00'),
            };

            const result = shouldNotify(notificationTime);
            expect(result).toBe(true);
        });

        it('should return false when notification time is too far in the future', () => {
            // 現在時刻: 2026-01-10T12:00:00+09:00
            // 通知時刻: 2026-01-10T13:00:00+09:00 (1時間後)
            const notificationTime: NotificationTiming = {
                type: '1hour',
                time: new Date('2026-01-10T13:00:00+09:00'),
            };

            const result = shouldNotify(notificationTime);
            expect(result).toBe(false);
        });

        it('should return false when notification time is too far in the past', () => {
            // 現在時刻: 2026-01-10T12:00:00+09:00
            // 通知時刻: 2026-01-10T11:00:00+09:00 (1時間前)
            const notificationTime: NotificationTiming = {
                type: '1hour',
                time: new Date('2026-01-10T11:00:00+09:00'),
            };

            const result = shouldNotify(notificationTime);
            expect(result).toBe(false);
        });

        it('should return true when exactly at notification time', () => {
            // 現在時刻: 2026-01-10T12:00:00+09:00
            // 通知時刻: 2026-01-10T12:00:00+09:00
            const notificationTime: NotificationTiming = {
                type: '1hour',
                time: new Date('2026-01-10T12:00:00+09:00'),
            };

            const result = shouldNotify(notificationTime);
            expect(result).toBe(true);
        });

        it('should handle notification window edge cases', () => {
            // 現在時刻: 2026-01-10T12:00:00+09:00
            // 通知時刻: 2026-01-10T12:30:00+09:00 (30分後、ウィンドウギリギリ)
            const notificationTime: NotificationTiming = {
                type: '1hour',
                time: new Date('2026-01-10T12:30:00+09:00'),
            };

            const result = shouldNotify(notificationTime);
            expect(result).toBe(true);
        });

        it('should return false when notification time is just outside window', () => {
            // 現在時刻: 2026-01-10T12:00:00+09:00
            // 通知時刻: 2026-01-10T12:31:00+09:00 (31分後、ウィンドウ外)
            const notificationTime: NotificationTiming = {
                type: '1hour',
                time: new Date('2026-01-10T12:31:00+09:00'),
            };

            const result = shouldNotify(notificationTime);
            expect(result).toBe(false);
        });
    });

    describe('Integration: calculateNotificationTimes + shouldNotify', () => {
        it('should correctly identify which notifications to send', () => {
            // 現在時刻: 2026-01-10T12:00:00+09:00
            // 終了時刻: 2026-01-10T13:00:00+09:00 (1時間後)
            const endDate = new Date('2026-01-10T13:00:00+09:00');

            const timings = calculateNotificationTimes(endDate);
            const shouldSend = timings.filter((timing) => shouldNotify(timing));

            // 1時間前の通知のみが送信対象
            expect(shouldSend).toHaveLength(1);
            expect(shouldSend[0].type).toBe('1hour');
        });

        it('should handle multiple notifications within window', () => {
            // 現在時刻: 2026-01-10T12:00:00+09:00
            // 終了時刻: 2026-01-10T15:00:00+09:00 (3時間後)
            const endDate = new Date('2026-01-10T15:00:00+09:00');

            const timings = calculateNotificationTimes(endDate);
            const shouldSend = timings.filter((timing) => shouldNotify(timing));

            // 3時間前の通知が送信対象
            expect(shouldSend).toHaveLength(1);
            expect(shouldSend[0].type).toBe('3hours');
        });
    });
});
