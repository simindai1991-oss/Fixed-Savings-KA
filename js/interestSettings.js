import { OWEALTH_COMPOUND_RATE, OWEALTH_SIMPLE_RATE } from './config.js';

/**
 * 全局 Interest Setting（两项解耦）
 * - interestEnabled: 是否计息（有利息 / 无利息）
 * - isolationEnabled: 是否本息隔离（仅在计息开启时生效）
 *   - false → Compound 5%
 *   - true  → Isolation Simple 4.87%
 */
export const interestSettings = Vue.reactive({
    interestEnabled: true,
    isolationEnabled: false,
    /** Interest Isolation Account 余额；>0 时仅禁止关闭本息隔离（与是否免息解耦） */
    isolatedInterestBalance: 0
});

export const MODE_SWITCH_BLOCK_MESSAGE =
    'Interest Account still has a balance. Please transfer Interest to Principal on the OWealth page before turning off Interest Isolation.';

export function hasIsolatedInterestBalance() {
    return Number(interestSettings.isolatedInterestBalance) > 0;
}

/**
 * 目标配置是否允许提交。
 * 仅「关闭本息隔离」且仍保持计息时，要求 Interest 余额为 0。
 * 切换非息（Interest Disabled）不校验利息余额。
 */
export function canApplyInterestSettings({ interestEnabled, isolationEnabled }) {
    const turningOffIsolation =
        !!interestEnabled &&
        interestSettings.isolationEnabled &&
        !isolationEnabled;
    if (turningOffIsolation && hasIsolatedInterestBalance()) {
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
        return canApplyInterestSettings({ interestEnabled: false, isolationEnabled: false });
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
        isolationEnabled = interestEnabled ? !!payload.isolationEnabled : false;
    }

    if (!canApplyInterestSettings({ interestEnabled, isolationEnabled })) {
        return false;
    }

    const wasIsolated = isSimpleAccrualMode();
    interestSettings.interestEnabled = interestEnabled;
    interestSettings.isolationEnabled = isolationEnabled;

    // DEMO：首次打开隔离且余额为 0 时写入样例利息
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
