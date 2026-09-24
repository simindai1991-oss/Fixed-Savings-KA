const { ref, computed, onMounted } = Vue;
import { OWEALTH_COMPOUND_RATE, OWEALTH_SIMPLE_RATE } from '../config.js';
import {
    interestSettings,
    applyInterestSettings,
    canApplyInterestSettings,
    MODE_SWITCH_BLOCK_MESSAGE
} from '../interestSettings.js';

const SETTINGS_TABS = [
    { id: 'payment-pin', label: 'Payment PIN', enabled: false },
    { id: 'pos-config', label: 'POS Configuration', enabled: false },
    { id: 'settlement', label: 'Settlement', enabled: false },
    { id: 'interest-setting', label: 'Interest Setting', enabled: true }
];

export default {
    template: `
    <div class="fade-in max-w-5xl mx-auto">
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm min-h-[560px] flex flex-col">
            <div class="flex border-b border-gray-200 px-6 pt-2">
                <div v-for="tab in tabs" :key="tab.id"
                     class="px-6 py-4 text-sm font-medium relative select-none"
                     :class="tab.enabled && tab.id === activeTab
                         ? 'text-opay cursor-default'
                         : 'text-gray-400 cursor-not-allowed opacity-60'">
                    {{ tab.label }}
                    <div v-if="tab.enabled && tab.id === activeTab"
                         class="absolute bottom-0 left-0 w-full h-0.5 bg-opay"></div>
                </div>
            </div>

            <div class="p-8 flex-1">
                <section class="mb-8">
                    <h3 class="text-sm font-bold text-gray-800 mb-4">Interest Accrual</h3>
                    <div class="space-y-3">
                        <div class="block border rounded-lg p-5 transition-all cursor-pointer"
                             :class="interestEnabled
                                 ? 'border-opay bg-opay-light shadow-sm'
                                 : 'border-gray-200 hover:border-gray-300 bg-white'"
                             @click="requestInterestEnabled(true)">
                            <div class="flex items-start gap-3">
                                <input type="radio" name="interest-enabled" :checked="interestEnabled"
                                       class="mt-1 w-4 h-4 accent-[#27B665] pointer-events-none">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-medium text-gray-800">Interest Enabled</span>
                                        <span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-opay text-white">Default</span>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                                        OWealth and Fixed Savings accrue interest. For OWealth, accrual style is controlled by OWealth Interest Isolation below.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="block border rounded-lg p-5 transition-all cursor-pointer"
                             :class="!interestEnabled
                                 ? 'border-opay bg-opay-light shadow-sm'
                                 : 'border-gray-200 hover:border-gray-300 bg-white'"
                             @click="requestInterestEnabled(false)">
                            <div class="flex items-start gap-3">
                                <input type="radio" name="interest-enabled" :checked="!interestEnabled"
                                       class="mt-1 w-4 h-4 accent-[#27B665] pointer-events-none">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-medium text-gray-800">Interest Disabled (Non-Interest)</span>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                                        Neither OWealth nor Fixed Savings will accrue interest.
                                    </p>
                                    <p class="text-xs text-orange-500 mt-2 leading-relaxed">
                                        Existing interest will not be affected; no new interest will be generated.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section v-if="interestEnabled" class="mb-2">
                    <h3 class="text-sm font-bold text-gray-800 mb-4">OWealth Interest Isolation</h3>
                    <div class="space-y-3">
                        <div class="block border rounded-lg p-5 transition-all cursor-pointer"
                             :class="!isolationEnabled
                                 ? 'border-opay bg-opay-light shadow-sm'
                                 : 'border-gray-200 hover:border-gray-300 bg-white'"
                             @click="requestIsolationEnabled(false)">
                            <div class="flex items-start gap-3">
                                <input type="radio" name="isolation-enabled"
                                       :checked="!isolationEnabled"
                                       class="mt-1 w-4 h-4 accent-[#27B665] pointer-events-none">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-medium text-gray-800">Off — Compound Interest</span>
                                        <span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-opay text-white">Recommended</span>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                                        Daily interest is auto-credited to OWealth principal and continues to earn interest (compound).
                                    </p>
                                    <div class="mt-3 flex items-center gap-4 flex-wrap">
                                        <span class="text-lg font-bold text-opay">
                                            {{ compoundRate }}% <span class="text-xs font-normal text-gray-400">p.a. (pre-tax)</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="block border rounded-lg p-5 transition-all cursor-pointer"
                             :class="isolationEnabled
                                 ? 'border-opay bg-opay-light shadow-sm'
                                 : 'border-gray-200 hover:border-gray-300 bg-white'"
                             @click="requestIsolationEnabled(true)">
                            <div class="flex items-start gap-3">
                                <input type="radio" name="isolation-enabled"
                                       :checked="isolationEnabled"
                                       class="mt-1 w-4 h-4 accent-[#27B665] pointer-events-none">
                                <div class="flex-1">
                                    <div class="text-sm font-medium text-gray-800">On — OWealth Interest Isolation (Simple Interest)</div>
                                    <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                                        Daily interest is credited to a dedicated Interest Isolation Account and does not earn further interest.
                                        You can manually transfer interest to Principal via Transfer to Principal.
                                    </p>
                                    <div class="mt-3 flex items-center gap-4 flex-wrap">
                                        <span class="text-lg font-bold text-gray-700">
                                            ≈ {{ simpleRate }}% <span class="text-xs font-normal text-gray-400">p.a. (pre-tax)</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <!-- Confirm modal -->
        <div v-if="showConfirmModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 class="text-base font-bold text-gray-800 mb-2">Confirm change</h3>
                <p class="text-sm text-gray-600 leading-relaxed mb-6">{{ confirmMessage }}</p>
                <div class="flex justify-end gap-3">
                    <button @click="cancelConfirm"
                            :disabled="isSubmitting"
                            class="px-5 py-2 rounded border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60">
                        Cancel
                    </button>
                    <button @click="confirmApply"
                            :disabled="isSubmitting"
                            class="px-5 py-2 rounded bg-opay text-white text-sm font-medium hover:bg-opay-dark transition-colors disabled:opacity-60">
                        <span v-if="!isSubmitting">Confirm</span>
                        <span v-else><i class="fa-solid fa-circle-notch fa-spin mr-1"></i> Saving...</span>
                    </button>
                </div>
            </div>
        </div>

        <transition name="fade-slide">
            <div v-if="showToast"
                 class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-xl">
                <i class="fa-solid" :class="toastIsError ? 'fa-triangle-exclamation text-orange-400' : 'fa-check-circle text-opay'"></i>
                {{ toastMessage }}
            </div>
        </transition>
    </div>
    `,
    setup() {
        const tabs = SETTINGS_TABS;
        const activeTab = 'interest-setting';
        const isSubmitting = ref(false);
        const showToast = ref(false);
        const toastMessage = ref('');
        const toastIsError = ref(false);
        const showConfirmModal = ref(false);
        const confirmMessage = ref('');
        const pendingPayload = ref(null);

        const compoundRate = OWEALTH_COMPOUND_RATE;
        const simpleRate = OWEALTH_SIMPLE_RATE;

        const interestEnabled = computed(() => !!interestSettings.interestEnabled);
        const isolationEnabled = computed(() => !!interestSettings.isolationEnabled);

        const showTip = (message, isError = false) => {
            toastMessage.value = message;
            toastIsError.value = isError;
            showToast.value = true;
            setTimeout(() => { showToast.value = false; }, isError ? 4500 : 3000);
        };

        const describePayload = (payload) => {
            const interestChanged = payload.interestEnabled !== interestSettings.interestEnabled;
            const isolationChanged = payload.isolationEnabled !== interestSettings.isolationEnabled;

            // 计息开关：与隔离独立，文案只描述 Non-Interest 开/关
            if (interestChanged && !payload.interestEnabled) {
                return 'Turn on Non-Interest mode? OWealth and Fixed Savings will stop accruing new interest.';
            }
            if (interestChanged && payload.interestEnabled) {
                return 'Turn off Non-Interest mode?';
            }

            // 隔离开关：单独变更
            if (isolationChanged && payload.isolationEnabled) {
                return `Turn on OWealth Interest Isolation (Simple Interest, ≈ ${simpleRate}% p.a. pre-tax)?`;
            }
            if (isolationChanged && !payload.isolationEnabled) {
                return `Turn off OWealth Interest Isolation and use Compound Interest (${compoundRate}% p.a. pre-tax)?`;
            }

            return 'Confirm this change?';
        };

        const openConfirm = (payload) => {
            const same =
                payload.interestEnabled === interestSettings.interestEnabled &&
                payload.isolationEnabled === interestSettings.isolationEnabled;
            if (same) return;

            // 前置判断：利息账户有余额时，禁止关隔离 / 切无息
            if (!canApplyInterestSettings(payload)) {
                showTip(MODE_SWITCH_BLOCK_MESSAGE, true);
                return;
            }

            pendingPayload.value = payload;
            confirmMessage.value = describePayload(payload);
            showConfirmModal.value = true;
        };

        const requestInterestEnabled = (enabled) => {
            // 关/开利息不改写隔离设置
            openConfirm({
                interestEnabled: enabled,
                isolationEnabled: interestSettings.isolationEnabled
            });
        };

        const requestIsolationEnabled = (enabled) => {
            if (!interestSettings.interestEnabled) return;
            openConfirm({
                interestEnabled: interestSettings.interestEnabled,
                isolationEnabled: enabled
            });
        };

        const cancelConfirm = () => {
            if (isSubmitting.value) return;
            showConfirmModal.value = false;
            pendingPayload.value = null;
        };

        const confirmApply = () => {
            const payload = pendingPayload.value;
            if (!payload || isSubmitting.value) return;

            const interestChanged = payload.interestEnabled !== interestSettings.interestEnabled;
            const isolationChanged = payload.isolationEnabled !== interestSettings.isolationEnabled;

            isSubmitting.value = true;
            // DEMO：模拟接口提交；余额校验在提交链路再次校验
            setTimeout(() => {
                const ok = applyInterestSettings(payload);
                isSubmitting.value = false;
                showConfirmModal.value = false;
                pendingPayload.value = null;

                if (!ok) {
                    showTip(MODE_SWITCH_BLOCK_MESSAGE, true);
                    return;
                }

                if (interestChanged && !payload.interestEnabled) {
                    showTip('Settings saved: Non-Interest mode on — OWealth and Fixed Savings will not accrue interest.');
                } else if (interestChanged && payload.interestEnabled) {
                    showTip('Settings saved: Non-Interest mode off.');
                } else if (isolationChanged && payload.isolationEnabled) {
                    showTip(`Settings saved: OWealth Interest Isolation On (Simple) at ≈ ${simpleRate}% p.a. (pre-tax).`);
                } else if (isolationChanged && !payload.isolationEnabled) {
                    showTip(`Settings saved: OWealth Interest Isolation Off — Compound at ${compoundRate}% p.a. (pre-tax).`);
                } else {
                    showTip('Settings saved.');
                }
            }, 400);
        };

        return {
            tabs,
            activeTab,
            interestEnabled,
            isolationEnabled,
            isSubmitting,
            showToast,
            toastMessage,
            toastIsError,
            showConfirmModal,
            confirmMessage,
            compoundRate,
            simpleRate,
            requestInterestEnabled,
            requestIsolationEnabled,
            cancelConfirm,
            confirmApply
        };
    }
};
