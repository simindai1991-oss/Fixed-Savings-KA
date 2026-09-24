import { OWEALTH_COMPOUND_RATE, OWEALTH_SIMPLE_RATE } from './config.js';

/**
 * 全局 Interest Setting（两项独立配置，互不改写对方）
 * - interestEnabled: 是否计息（有利息 / 无利息）；关利息不重置 isolationEnabled
 * - isolationEnabled: 是否本息隔离（仅利息开启时在 UI 展示/可改）
 *   - false → Compound 5%
 *   - true  → Isolation Simple 4.87%
 */
export const interestSettings = Vue.reactive({
    interestEnabled: true,
    isolationEnabled: false,
    /** Interest Isolation Account 余额；>0 时禁止关闭隔离或切换到无息 */
    isolatedInterestBalance: 0
});

export const MODE_SWITCH_BLOCK_MESSAGE =
    'Interest Account still has a balance. Please transfer Interest to Principal on the OWealth page before turning off Interest Isolation or switching to Non-Interest.';

export function hasIsolatedInterestBalance() {
    return Number(interestSettings.isolatedInterestBalance) > 0;
}

/**
 * 目标配置是否允许提交。
 * - 关闭本息隔离 → Interest 余额须为 0
 * - 切换到无息 → Interest 余额须为 0（不改写隔离开关）
 */
export function canApplyInterestSettings({ interestEnabled, isolationEnabled }) {
    if (!hasIsolatedInterestBalance()) return true;

    const turningOffIsolation =
        interestSettings.isolationEnabled &&
        !isolationEnabled;
    const switchingToNonInterest =
        interestSettings.interestEnabled &&
        !interestEnabled;

    if (turningOffIsolation || switchingToNonInterest) {
        return false;
    }
    return true;
}

/** @deprecated 兼容旧三态调用；prefer canApplyInterestSettings */
export function canSwitchToMode(mode) {
    if (mode === 'simple') {
        return canApplyInterestSettings({ interestEnabled: true, isolationEnabled: true });
    }
    if (mode === 'compound') {
        return canApplyInterestSettings({ interestEnabled: true, isolationEnabled: false });
    }
    if (mode === 'none') {
        return canApplyInterestSettings({
            interestEnabled: false,
            isolationEnabled: interestSettings.isolationEnabled
        });
    }
    return true;
}

export function applyInterestSettings(payload) {
    let interestEnabled;
    let isolationEnabled;

    // 兼容旧三态字符串
    if (typeof payload === 'string') {
        interestEnabled = payload !== 'none';
        isolationEnabled = payload === 'simple';
    } else {
        interestEnabled = !!payload.interestEnabled;
        // 两项独立：关利息不强制清空隔离设置
        isolationEnabled = !!payload.isolationEnabled;
    }

    if (!canApplyInterestSettings({ interestEnabled, isolationEnabled })) {
        return false;
    }

    const wasIsolated = isSimpleAccrualMode();
    interestSettings.interestEnabled = interestEnabled;
    interestSettings.isolationEnabled = isolationEnabled;

    // DEMO：首次进入「计息 + 隔离」且余额为 0 时写入样例利息
    if (interestEnabled && isolationEnabled && !wasIsolated && interestSettings.isolatedInterestBalance <= 0) {
        interestSettings.isolatedInterestBalance = 687.25;
    }
    return true;
}

export function setIsolatedInterestBalance(amount) {
    const n = Number(amount);
    interestSettings.isolatedInterestBalance = Number.isFinite(n) && n > 0 ? n : 0;
}

export function isInterestEnabled() {
    return !!interestSettings.interestEnabled;
}

/** 计息且开启本息隔离 */
export function isSimpleAccrualMode() {
    return !!interestSettings.interestEnabled && !!interestSettings.isolationEnabled;
}

/** 计息且未隔离（复利） */
export function isCompoundAccrualMode() {
    return !!interestSettings.interestEnabled && !interestSettings.isolationEnabled;
}

export function isNonInterestMode() {
    return !interestSettings.interestEnabled;
}

/** 兼容旧 UI：推导三态标签 */
export function getLegacyMode() {
    if (!interestSettings.interestEnabled) return 'none';
    if (interestSettings.isolationEnabled) return 'simple';
    return 'compound';
}

export function getActiveRate() {
    if (!interestSettings.interestEnabled) return 0;
    if (interestSettings.isolationEnabled) return OWEALTH_SIMPLE_RATE;
    return OWEALTH_COMPOUND_RATE;
}

export function getActiveRateLabel() {
    const rate = getActiveRate();
    return rate > 0 ? `${rate}%` : '0%';
}

export function getCompoundDailyRate() {
    return Math.pow(1 + OWEALTH_COMPOUND_RATE / 100, 1 / 365) - 1;
}

export function getSimpleDailyRate() {
    return OWEALTH_SIMPLE_RATE / 100 / 365;
}
