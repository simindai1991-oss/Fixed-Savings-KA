const { ref, computed, onMounted } = Vue;
import { OWEALTH_COMPOUND_RATE, OWEALTH_SIMPLE_RATE } from '../config.js';
import { interestSettings, applyInterestSettings } from '../interestSettings.js';

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
                <h2 class="text-base font-bold text-gray-800 mb-2">
                    <span class="text-red-500 mr-0.5">*</span> Interest Setting
                </h2>
                <p class="text-xs text-gray-400 mb-8">
                    Configure how OWealth interest is accrued. Isolation is optional — HQ Admin only; applies to headquarters and all branches when saved.
                </p>

                <div class="space-y-4">
                    <!-- Mode 1: Compound -->
                    <label class="block border rounded-lg p-5 cursor-pointer transition-all"
                           :class="selectedMode === 'compound'
                               ? 'border-opay bg-opay-light shadow-sm'
                               : 'border-gray-200 hover:border-gray-300 bg-white'">
                        <div class="flex items-start gap-3">
                            <input type="radio" name="interest-mode" value="compound"
                                   v-model="selectedMode"
                                   class="mt-1 w-4 h-4 accent-[#27B665]">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="text-sm font-medium text-gray-800">Compound Interest (Default)</span>
                                    <span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-opay text-white">Recommended</span>
                                </div>
                                <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                                    Daily interest is auto-credited to your OWealth principal and continues to earn interest (compound).
                                </p>
                                <div class="mt-3 flex items-center gap-4 flex-wrap">
                                    <span class="text-lg font-bold text-opay">
                                        {{ compoundRate }}% <span class="text-xs font-normal text-gray-400">p.a. (pre-tax)</span>
                                    </span>
                                    <span class="text-xs text-gray-400">
                                        Example: ₦1,000,000 / year ≈ ₦{{ formatExample(compoundExample) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </label>

                    <!-- Mode 2: Simple Isolation -->
                    <label class="block border rounded-lg p-5 cursor-pointer transition-all"
                           :class="selectedMode === 'simple'
                               ? 'border-opay bg-opay-light shadow-sm'
                               : 'border-gray-200 hover:border-gray-300 bg-white'">
                        <div class="flex items-start gap-3">
                            <input type="radio" name="interest-mode" value="simple"
                                   v-model="selectedMode"
                                   class="mt-1 w-4 h-4 accent-[#27B665]">
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-800">
                                    Interest Isolation (Simple Interest)
                                </div>
                                <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                                    Daily interest is credited to a dedicated Interest Isolation Account and does not earn further interest.
                                    You can manually transfer interest to Principal via Transfer to Principal.
                                </p>
                                <div class="mt-3 flex items-center gap-4 flex-wrap">
                                    <span class="text-lg font-bold text-gray-700">
                                        {{ simpleRate }}% <span class="text-xs font-normal text-gray-400">p.a. (pre-tax)</span>
                                    </span>
                                    <span class="text-xs text-gray-400">
                                        Example: ₦1,000,000 / year ≈ ₦{{ formatExample(simpleExample) }}
                                    </span>
                                </div>
                                <p class="text-xs text-orange-500 mt-3 leading-relaxed">
                                    Rate is lower than compound mode because interest is no longer reinvested. This is not a product rate cut — it reflects giving up compound reinvestment for clearer principal/interest separation.
                                </p>
                            </div>
                        </div>
                    </label>

                    <!-- Mode 3: Non-interest -->
                    <label class="block border rounded-lg p-5 cursor-pointer transition-all"
                           :class="selectedMode === 'none'
                               ? 'border-opay bg-opay-light shadow-sm'
                               : 'border-gray-200 hover:border-gray-300 bg-white'">
                        <div class="flex items-start gap-3">
                            <input type="radio" name="interest-mode" value="none"
                                   v-model="selectedMode"
                                   class="mt-1 w-4 h-4 accent-[#27B665]">
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-800">Non-Interest Mode</div>
                                <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                                    OWealth will not accrue interest. Intended for merchants who do not accept interest (e.g. Islamic finance compliance).
                                </p>
                                <p class="text-xs text-orange-500 mt-2 leading-relaxed">
                                    Existing accrued interest remains in account per policy; no new interest will be generated.
                                </p>
                            </div>
                        </div>
                    </label>
                </div>

                <div class="mt-6 p-4 bg-opay-light border border-green-100 rounded-lg text-xs text-green-700 leading-relaxed">
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

        <transition name="fade-slide">
            <div v-if="showToast"
                 class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <i class="fa-solid fa-check-circle text-opay"></i>
                {{ toastMessage }}
            </div>
        </transition>
    </div>
    `,
    setup() {
        const tabs = SETTINGS_TABS;
        const activeTab = 'interest-setting';
        const selectedMode = ref('compound');
        const isSubmitting = ref(false);
        const showToast = ref(false);
        const toastMessage = ref('');

        const compoundRate = OWEALTH_COMPOUND_RATE;
        const simpleRate = OWEALTH_SIMPLE_RATE;
        const compoundExample = computed(() => 1_000_000 * (compoundRate / 100));
        const simpleExample = computed(() => 1_000_000 * (simpleRate / 100));
        const rateDiff = computed(() => Math.round((compoundRate - simpleRate) * 100));

        const formatExample = (num) =>
            new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);

        const syncFromStore = () => {
            selectedMode.value = interestSettings.mode;
        };

        const handleCancel = () => syncFromStore();

        const handleSubmit = () => {
            isSubmitting.value = true;
            setTimeout(() => {
                applyInterestSettings(selectedMode.value);
                isSubmitting.value = false;
                if (selectedMode.value === 'none') {
                    toastMessage.value = 'Settings saved: Non-Interest mode — OWealth will not accrue interest.';
                } else if (selectedMode.value === 'compound') {
                    toastMessage.value = `Settings saved: Compound Interest at ${compoundRate}% p.a. (pre-tax).`;
                } else {
                    toastMessage.value = `Settings saved: Interest Isolation (Simple) at ${simpleRate}% p.a. (pre-tax).`;
                }
                showToast.value = true;
                setTimeout(() => { showToast.value = false; }, 3000);
            }, 800);
        };

        onMounted(syncFromStore);

        return {
            tabs,
            activeTab,
            selectedMode,
            isSubmitting,
            showToast,
            toastMessage,
            compoundRate,
            simpleRate,
            compoundExample,
            simpleExample,
            rateDiff,
            formatExample,
            handleCancel,
            handleSubmit
        };
    }
};
