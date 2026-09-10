import { OWEALTH_COMPOUND_RATE, OWEALTH_SIMPLE_RATE } from './config.js';

/**
 * 全局 Interest Setting 状态（Settings 写入，OWealth 读取）
 * mode:
 *   - compound: 复利 5%（系统默认）
 *   - simple:   本息隔离单利 4.87%
 *   - none:     非利息模式
 */
export const interestSettings = Vue.reactive({
    mode: 'compound'
});

export function applyInterestSettings(mode) {
    interestSettings.mode = mode;
}

export function isInterestEnabled() {
    return interestSettings.mode !== 'none';
}

export function isSimpleAccrualMode() {
    return interestSettings.mode === 'simple';
}

export function isCompoundAccrualMode() {
    return interestSettings.mode === 'compound';
}

export function getActiveRate() {
    if (interestSettings.mode === 'none') return 0;
    if (interestSettings.mode === 'simple') return OWEALTH_SIMPLE_RATE;
    return OWEALTH_COMPOUND_RATE;
}

export function getActiveRateLabel() {
    const rate = getActiveRate();
    return rate > 0 ? `${rate}%` : '0%';
}

/** 复利日利率：(1+r)^(1/365)-1 */
export function getCompoundDailyRate() {
    return Math.pow(1 + OWEALTH_COMPOUND_RATE / 100, 1 / 365) - 1;
}

/** 单利日利率：名义年化 / 365 */
export function getSimpleDailyRate() {
    return OWEALTH_SIMPLE_RATE / 100 / 365;
}
