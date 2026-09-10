const { ref, computed, onMounted, watch } = Vue;
import { OWEALTH_COMPOUND_RATE, OWEALTH_SIMPLE_RATE } from '../config.js';
import {
    interestSettings,
    applyInterestSettings,
    canApplyInterestSettings,
    hasIsolatedInterestBalance,
    MODE_SWITCH_BLOCK_MESSAGE,
    isSimpleAccrualMode
} from '../interestSettings.js';
import PinVerification from '../components/PinVerification.js';

const SETTINGS_TABS = [
    { id: 'payment-pin', label: 'Payment PIN', enabled: false },
    { id: 'pos-config', label: 'POS Configuration', enabled: false },
    { id: 'settlement', label: 'Settlement', enabled: false },
    { id: 'interest-setting', label: 'Interest Setting', enabled: true }
];

export default {
    components: { PinVerification },
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
                <div v-if="interestBalanceBlocked"
                     class="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700 leading-relaxed">
                    <div class="flex items-start gap-2">
                        <i class="fa-solid fa-triangle-exclamation mt-0.5 text-orange-500"></i>
                        <div>
                            <strong class="block mb-1">Cannot turn off Interest Isolation</strong>
                            Interest Account balance:
                            <strong>₦{{ formatMoney(interestSettings.isolatedInterestBalance) }}</strong>.
                            Please go to <strong>OWealth</strong> and use <strong>Transfer to Principal</strong> before turning off Interest Isolation.
                            Switching to Non-Interest is still allowed.
                        </div>
                    </div>
                </div>

                <!-- Setting A: Interest on / off -->
                <section class="mb-8">
                    <h3 class="text-sm font-bold text-gray-800 mb-1">1. Interest Accrual</h3>
                    <p class="text-xs text-gray-400 mb-4">
                        Whether savings products accrue interest (applies to both OWealth and Fixed Savings).
                    </p>

                    <div class="space-y-3">
                        <div class="block border rounded-lg p-5 transition-all cursor-pointer"
                             :class="draftInterestEnabled
                                 ? 'border-opay bg-opay-light shadow-sm'
                                 : 'border-gray-200 hover:border-gray-300 bg-white'"
                             @click="setInterestEnabled(true)">
                            <div class="flex items-start gap-3">
                                <input type="radio" name="interest-enabled" :checked="draftInterestEnabled"
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
                             :class="!draftInterestEnabled
                                 ? 'border-opay bg-opay-light shadow-sm'
                                 : 'border-gray-200 hover:border-gray-300 bg-white'"
                             @click="setInterestEnabled(false)">
                            <div class="flex items-start gap-3">
                                <input type="radio" name="interest-enabled" :checked="!draftInterestEnabled"
                                       class="mt-1 w-4 h-4 accent-[#27B665] pointer-events-none">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-medium text-gray-800">Interest Disabled (Non-Interest)</span>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                                        Neither OWealth nor Fixed Savings will accrue interest. Intended for merchants who do not accept interest (e.g. Islamic finance compliance).
                                        Independent from OWealth Interest Isolation balance checks.
                                    </p>
                                    <p class="text-xs text-orange-500 mt-2 leading-relaxed">
                                        Existing accrued interest remains per policy; no new interest will be generated.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Setting B: Isolation (only when interest on) -->
                <section :class="draftInterestEnabled ? '' : 'opacity-50 pointer-events-none'">
                    <h3 class="text-sm font-bold text-gray-800 mb-1">
                        2. OWealth Interest Isolation
                        <span v-if="!draftInterestEnabled" class="text-xs font-normal text-gray-400 ml-2">(available when Interest is Enabled)</span>
                    </h3>
                    <p class="text-xs text-gray-400 mb-4">
                        Separates OWealth principal and interest into different accounts. Applies to OWealth only (not Fixed Savings). Independent from enabling/disabling interest.
                    </p>

                    <div class="space-y-3">
                        <div class="block border rounded-lg p-5 transition-all cursor-pointer"
                             :class="draftInterestEnabled && !draftIsolationEnabled
                                 ? 'border-opay bg-opay-light shadow-sm'
                                 : 'border-gray-200 hover:border-gray-300 bg-white'"
                             @click="setIsolationEnabled(false)">
                            <div class="flex items-start gap-3">
                                <input type="radio" name="isolation-enabled"
                                       :checked="draftInterestEnabled && !draftIsolationEnabled"
                                       class="mt-1 w-4 h-4 accent-[#27B665] pointer-events-none">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-medium text-gray-800">Off — Compound Interest</span>
                                        <span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-opay text-white">Recommended</span>
                                        <span v-if="turnOffIsolationBlocked"
                                              class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-orange-100 text-orange-600">
                                            Transfer Interest first
                                        </span>
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
                             :class="draftInterestEnabled && draftIsolationEnabled
                                 ? 'border-opay bg-opay-light shadow-sm'
                                 : 'border-gray-200 hover:border-gray-300 bg-white'"
                             @click="setIsolationEnabled(true)">
                            <div class="flex items-start gap-3">
                                <input type="radio" name="isolation-enabled"
                                       :checked="draftInterestEnabled && draftIsolationEnabled"
                                       class="mt-1 w-4 h-4 accent-[#27B665] pointer-events-none">
                                <div class="flex-1">
                                    <div class="text-sm font-medium text-gray-800">On — OWealth Interest Isolation (Simple Interest)</div>
                                    <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                                        Daily interest is credited to a dedicated Interest Isolation Account and does not earn further interest.
                                        You can manually transfer interest to Principal via Transfer to Principal.
                                    </p>
                                    <div class="mt-3 flex items-center gap-4 flex-wrap">
                                        <span class="text-lg font-bold text-gray-700">
                                            {{ simpleRate }}% <span class="text-xs font-normal text-gray-400">p.a. (pre-tax)</span>
                                        </span>
                                    </div>
                                    <p class="text-xs text-orange-500 mt-3 leading-relaxed">
                                        Rate is lower than compound because interest is no longer reinvested. This is not a product rate cut — it reflects giving up compound reinvestment for clearer principal/interest separation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div v-if="draftInterestEnabled" class="mt-6 p-4 bg-opay-light border border-green-100 rounded-lg text-xs text-green-700 leading-relaxed">
                    <i class="fa-solid fa-circle-info mr-1.5 text-opay"></i>
                    <strong>Rate note:</strong>
                    Compound ({{ compoundRate }}% p.a.) vs Isolation ({{ simpleRate }}% p.a.) differs by about
                    <strong>{{ rateDiff }} bps</strong> over one year, because isolation forgoes reinvestment of daily interest.
                </div>

                <div class="flex justify-center gap-4 mt-12 pt-6">
                    <button @click="handleCancel"
                            class="px-10 py-2.5 rounded border border-opay text-opay text-sm font-medium hover:bg-opay-light transition-colors">
                        Cancel
                    </button>
                    <button @click="handleSubmit"
                            :disabled="isSubmitting"
                            class="px-10 py-2.5 rounded bg-opay text-white text-sm font-medium hover:bg-opay-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-green-100">
                        <span v-if="!isSubmitting">Submit</span>
                        <span v-else><i class="fa-solid fa-circle-notch fa-spin mr-1"></i> Submitting...</span>
                    </button>
                </div>
            </div>
        </div>

        <pin-verification v-model="showPinModal" @confirm="onPinConfirm" @cancel="onPinCancel" />

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
        const draftInterestEnabled = ref(true);
        const draftIsolationEnabled = ref(false);
        const isSubmitting = ref(false);
        const showToast = ref(false);
        const toastMessage = ref('');
        const toastIsError = ref(false);
        const showPinModal = ref(false);

        const compoundRate = OWEALTH_COMPOUND_RATE;
        const simpleRate = OWEALTH_SIMPLE_RATE;
        const rateDiff = computed(() => Math.round((compoundRate - simpleRate) * 100));

        const interestBalanceBlocked = computed(() =>
            hasIsolatedInterestBalance() && isSimpleAccrualMode()
        );
        const turnOffIsolationBlocked = computed(() => interestBalanceBlocked.value);

        const formatMoney = (num) =>
            new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);

        const showTip = (message, isError = false) => {
            toastMessage.value = message;
            toastIsError.value = isError;
            showToast.value = true;
            setTimeout(() => { showToast.value = false; }, isError ? 4500 : 3000);
        };

        const syncFromStore = () => {
            draftInterestEnabled.value = interestSettings.interestEnabled;
            draftIsolationEnabled.value = interestSettings.isolationEnabled;
        };

        const draftPayload = () => ({
            interestEnabled: draftInterestEnabled.value,
            isolationEnabled: draftInterestEnabled.value ? draftIsolationEnabled.value : false
        });

        const setInterestEnabled = (enabled) => {
            // 非息与隔离校验解耦：关闭计息不检查 Interest 余额
            draftInterestEnabled.value = enabled;
            if (!enabled) draftIsolationEnabled.value = false;
        };

        const setIsolationEnabled = (enabled) => {
            if (!draftInterestEnabled.value) return;
            if (!enabled && !canApplyInterestSettings({ interestEnabled: true, isolationEnabled: false })) {
                showTip(MODE_SWITCH_BLOCK_MESSAGE, true);
                return;
            }
            draftIsolationEnabled.value = enabled;
        };

        const handleCancel = () => syncFromStore();

        const handleSubmit = () => {
            if (!canApplyInterestSettings(draftPayload())) {
                showTip(MODE_SWITCH_BLOCK_MESSAGE, true);
                syncFromStore();
                return;
            }
            showPinModal.value = true;
        };

        const applySettings = () => {
            const payload = draftPayload();
            if (!canApplyInterestSettings(payload)) {
                showTip(MODE_SWITCH_BLOCK_MESSAGE, true);
                syncFromStore();
                return;
            }
            isSubmitting.value = true;
            setTimeout(() => {
                const ok = applyInterestSettings(payload);
                isSubmitting.value = false;
                if (!ok) {
                    showTip(MODE_SWITCH_BLOCK_MESSAGE, true);
                    syncFromStore();
                    return;
                }
                if (!payload.interestEnabled) {
                    showTip('Settings saved: Interest Disabled — OWealth and Fixed Savings will not accrue interest.');
                } else if (payload.isolationEnabled) {
                    showTip(`Settings saved: OWealth Interest Isolation On (Simple) at ${simpleRate}% p.a. (pre-tax).`);
                } else {
                    showTip(`Settings saved: Interest Enabled + OWealth Compound at ${compoundRate}% p.a. (pre-tax).`);
                }
            }, 500);
        };

        const onPinConfirm = () => applySettings();
        const onPinCancel = () => {};

        watch(
            () => [interestSettings.interestEnabled, interestSettings.isolationEnabled],
            () => {
                // 外部变更时保持草稿同步（DEMO 一般不会）
            }
        );

        onMounted(syncFromStore);

        return {
            tabs,
            activeTab,
            draftInterestEnabled,
            draftIsolationEnabled,
            isSubmitting,
            showToast,
            toastMessage,
            toastIsError,
            showPinModal,
            compoundRate,
            simpleRate,
            rateDiff,
            interestBalanceBlocked,
            turnOffIsolationBlocked,
            interestSettings,
            formatMoney,
            setInterestEnabled,
            setIsolationEnabled,
            handleCancel,
            handleSubmit,
            onPinConfirm,
            onPinCancel
        };
    }
};
