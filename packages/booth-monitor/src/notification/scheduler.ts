/**
 * 通知タイミングの種類
 */
export type NotificationType = '1day' | '12hours' | '3hours' | '1hour';

/**
 * 通知タイミング情報
 */
export interface NotificationTiming {
    /** 通知種別 */
    type: NotificationType;
    /** 通知時刻 */
    time: Date;
}

/**
 * 通知ウィンドウ（分）
 * 1時間ごとの実行を想定し、通知タイミング ± 30分の範囲内なら通知
 */
const NOTIFICATION_WINDOW_MINUTES = 30;

/**
 * 購入期限から通知タイミングを計算
 * @param endDate 購入期限
 * @returns 通知タイミングの配列
 */
export function calculateNotificationTimes(endDate: Date): NotificationTiming[] {
    const timings: NotificationTiming[] = [];

    // 1日前 (24時間前)
    const oneDayBefore = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    timings.push({ type: '1day', time: oneDayBefore });

    // 12時間前
    const twelveHoursBefore = new Date(endDate.getTime() - 12 * 60 * 60 * 1000);
    timings.push({ type: '12hours', time: twelveHoursBefore });

    // 3時間前
    const threeHoursBefore = new Date(endDate.getTime() - 3 * 60 * 60 * 1000);
    timings.push({ type: '3hours', time: threeHoursBefore });

    // 1時間前
    const oneHourBefore = new Date(endDate.getTime() - 1 * 60 * 60 * 1000);
    timings.push({ type: '1hour', time: oneHourBefore });

    return timings;
}

/**
 * 現在時刻が通知タイミングに該当するか判定
 * @param timing 通知タイミング
 * @param now 現在時刻（テスト用、省略時は現在時刻）
 * @returns 通知すべき場合true
 */
export function shouldNotify(
    timing: NotificationTiming,
    now: Date = new Date()
): boolean {
    const windowMs = NOTIFICATION_WINDOW_MINUTES * 60 * 1000;
    const diff = Math.abs(now.getTime() - timing.time.getTime());

    return diff <= windowMs;
}
