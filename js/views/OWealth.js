const { ref, reactive, watch, computed, onMounted } = Vue;
import { formatNumber, formatDateTime } from '../utils.js';
import { OWEALTH_COMPOUND_RATE, OWEALTH_SIMPLE_RATE } from '../config.js';
import {
    interestSettings,
    isSimpleAccrualMode,
    isInterestEnabled,
    isNonInterestMode,
    getActiveRateLabel,
    getCompoundDailyRate,
    getSimpleDailyRate,
    setIsolatedInterestBalance
} from '../interestSettings.js';
import PinVerification from '../components/PinVerification.js';

const BRANCH_NAME = 'OPAY DIGITAL SERVICES LIMITED';
const DISCLAIMER = '*OWealth related services are powered by OPay MicroFinance Bank, which is fully licensed by the CBN and insured by the NDIC.';

export default {
    components: { PinVerification },
    props: ['currentTime', 'branchName'],
    emits: ['back-to-list'],
    template: `
    <div class="fade-in space-y-6 relative">
        <div class="flex items-center">
            <div v-if="branchName" @click="$emit('back-to-list')"
                 class="mr-4 w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 hover:text-opay hover:shadow-sm cursor-pointer transition-all border border-transparent hover:border-green-100">
                <i class="fa-solid fa-arrow-left"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-800">{{ pageTitle }}</h1>
        </div>

        <div v-if="toastMsg" class="fixed top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded shadow-2xl z-[9999] transition-all flex items-center gap-3 w-max pointer-events-none">
            <i class="fa-solid" :class="isProcessing ? 'fa-circle-notch fa-spin text-white' : 'fa-circle-check text-[#27B665]'"></i>
            <span class="font-medium text-sm">{{ toastMsg }}</span>
        </div>

        <!-- Top Asset Cards -->
        <div class="grid grid-cols-1 gap-6 items-stretch" :class="isNonInterestMode ? '' : 'lg:grid-cols-3'">
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full"
                 :class="isNonInterestMode ? 'col-span-1' : 'col-span-1 lg:col-span-2'">

                <!-- Compound / Non-interest: Single OWealth Card (fills white shell) -->
                <div v-if="!isSimpleMode" class="bg-green-50/50 border border-green-100/50 rounded-xl p-5 relative overflow-hidden group hover:bg-green-50 transition-colors flex flex-col justify-between flex-1 h-full min-h-[180px]">
                    <div class="absolute -right-4 -top-4 w-20 h-20 bg-green-200/20 rounded-full blur-xl group-hover:bg-green-300/30 transition-all"></div>
                    <div class="relative z-10 mb-6">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-gray-500 text-sm font-medium">OWealth</span>
                            <span v-if="interestEnabled" class="bg-[#27B665]/10 text-[#27B665] px-2 py-0.5 rounded text-xs font-bold">{{ compoundRateLabel }} p.a.</span>
                            <span v-else class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-bold">Interest Disabled</span>
                        </div>
                        <div class="text-[32px] leading-none font-bold text-gray-800">
                            ₦{{ formatNumber(accountData.principalBalance) }}
                        </div>
                    </div>
                    <div class="flex gap-3 relative z-10 mt-auto" :class="isNonInterestMode ? 'w-1/3 max-w-md' : 'w-2/3'">
                        <button @click.stop="openDeposit" class="flex-1 bg-[#27B665] hover:bg-[#219e56] text-white text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm shadow-green-200">Deposit</button>
                        <button @click.stop="openWithdraw" class="flex-1 bg-white hover:bg-green-50 border border-green-200 text-[#27B665] text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm">Withdraw</button>
                    </div>
                </div>

                <!-- Simple Isolation: Dual Cards (equal height) -->
                <div v-else class="flex flex-col md:flex-row gap-4 flex-1 h-full items-stretch">
                    <div class="w-full md:w-2/3 bg-green-50/50 border border-green-100/50 rounded-xl p-5 relative overflow-hidden group hover:bg-green-50 transition-colors flex flex-col justify-between h-full min-h-[200px]">
                        <div class="absolute -right-4 -top-4 w-20 h-20 bg-green-200/20 rounded-full blur-xl group-hover:bg-green-300/30 transition-all"></div>
                        <div class="relative z-10 mb-6">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-gray-500 text-sm font-medium">Principal Account</span>
                                <span class="bg-[#27B665]/10 text-[#27B665] px-2 py-0.5 rounded text-xs font-bold">{{ simpleRateLabel }} p.a.</span>
                            </div>
                            <div class="text-[32px] leading-none font-bold text-gray-800">
                                ₦{{ formatNumber(accountData.principalBalance) }}
                            </div>
                        </div>
                        <div class="flex gap-3 relative z-10 mt-auto">
                            <button @click.stop="openDeposit" class="flex-1 bg-[#27B665] hover:bg-[#219e56] text-white text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm shadow-green-200">Deposit</button>
                            <button @click.stop="openWithdraw" class="flex-1 bg-white hover:bg-green-50 border border-green-200 text-[#27B665] text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm">Withdraw</button>
                        </div>
                    </div>

                    <div class="w-full md:w-1/3 bg-blue-50/50 border border-blue-100/50 rounded-xl p-5 relative overflow-hidden group hover:bg-blue-50 transition-colors flex flex-col justify-between h-full min-h-[200px]">
                        <div class="absolute -right-4 -top-4 w-20 h-20 bg-blue-200/20 rounded-full blur-xl group-hover:bg-blue-300/30 transition-all"></div>
                        <div class="relative z-10 mb-6">
                            <div class="text-gray-500 text-sm font-medium mb-3">Interest Account</div>
                            <div class="text-[32px] font-bold text-[#1677ff] leading-none">
                                ₦{{ formatNumber(accountData.isolatedInterest) }}
                            </div>
                            <p class="text-[10px] text-gray-400 mt-2 leading-relaxed">Not payable / not interest-bearing. Transfer to Principal before use.</p>
                        </div>
                        <div class="relative z-10 mt-auto">
                            <button @click.stop="processTransferInterest"
                                    :disabled="accountData.isolatedInterest <= 0 || isProcessing"
                                    class="w-full bg-[#1677ff] hover:bg-[#0958d9] text-white text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200 whitespace-nowrap">
                                Transfer to Principal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Interest stats (hidden in Non-Interest mode) -->
            <div v-if="!isNonInterestMode" class="flex flex-col gap-6 col-span-1">
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col justify-center relative overflow-hidden">
                    <i class="fa-solid fa-arrow-trend-up absolute -right-6 -bottom-6 text-green-50 text-[100px] opacity-60 pointer-events-none"></i>
                    <div class="relative z-10">
                        <div class="text-gray-500 text-sm font-medium mb-2">Yesterday's interest</div>
                        <div class="text-[28px] font-bold text-gray-800">₦{{ formatNumber(accountData.yesterdayInterest) }}</div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col justify-center relative overflow-hidden">
                    <i class="fa-solid fa-coins absolute -right-6 -bottom-6 text-yellow-50 text-[100px] opacity-60 pointer-events-none"></i>
                    <div class="relative z-10">
                        <div class="text-gray-500 text-sm font-medium mb-2">Total Interest</div>
                        <div class="text-[28px] font-bold text-gray-800">₦{{ formatNumber(accountData.totalInterest) }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Auto-deposit (hidden in Non-Interest mode) -->
        <div v-if="!isNonInterestMode"
             class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 shadow-sm border border-blue-100 flex justify-between items-center relative overflow-hidden">
            <div class="z-10 relative">
                <h3 class="text-lg font-bold text-gray-800 mb-1">Auto-deposit</h3>
                <p class="text-xs text-gray-500 mb-4">Turn on Auto-deposit to automatically move funds from your Balance to OWealth</p>
                <button class="bg-[#27B665] hover:bg-[#219e56] text-white text-sm font-medium px-6 py-2 rounded transition-colors shadow-sm shadow-green-200 relative z-10">Turn on</button>
            </div>
            <div class="flex items-center gap-4 z-10 bg-white/60 p-4 rounded-lg backdrop-blur-sm border border-white relative hidden md:flex">
                <div class="text-center px-4">
                    <div class="font-bold text-gray-800 text-sm">Balance</div>
                    <div class="text-xs text-gray-400">0%</div>
                </div>
                <div class="text-[#27B665] text-xl"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>
                <div class="text-center px-4 bg-green-50 rounded-lg p-2 border border-green-100">
                    <div class="font-bold text-gray-800 text-sm">OWealth</div>
                    <div class="text-green-600 font-bold text-sm">{{ displayRate }} p.a.</div>
                </div>
            </div>
        </div>

        <!-- Detail / Statements -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative z-10">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-800">Detail</h3>
            </div>

            <div v-if="isSimpleMode" class="flex border-b border-gray-200 mb-4">
                <button v-for="tab in detailTabs" :key="tab.id"
                        @click="activeDetailTab = tab.id"
                        class="px-5 py-2.5 text-sm font-medium relative"
                        :class="activeDetailTab === tab.id ? 'text-opay' : 'text-gray-400 hover:text-gray-600'">
                    {{ tab.label }}
                    <div v-if="activeDetailTab === tab.id" class="absolute bottom-0 left-0 w-full h-0.5 bg-opay"></div>
                </button>
            </div>

            <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div class="flex items-center gap-2">
                    <div class="flex items-center border border-gray-200 rounded overflow-hidden bg-white">
                        <span class="px-2 text-gray-400 text-xs"><i class="fa-regular fa-calendar"></i></span>
                        <input type="date" v-model="filterStart" class="text-xs py-2 pr-2 outline-none">
                    </div>
                    <span class="text-sm text-gray-500">To</span>
                    <div class="flex items-center border border-gray-200 rounded overflow-hidden bg-white">
                        <input type="date" v-model="filterEnd" class="text-xs py-2 px-2 outline-none">
                    </div>
                    <button v-if="filterStart || filterEnd" @click="clearFilters" class="text-xs text-gray-400 hover:text-opay">Clear</button>
                </div>

                <div class="relative" @click.stop>
                    <button @click="showDownloadMenu = !showDownloadMenu"
                            class="bg-[#27B665] text-white text-xs font-medium px-4 py-2 rounded flex items-center gap-2">
                        Download <i class="fa-solid fa-chevron-down text-[10px]"></i>
                    </button>
                    <div v-if="showDownloadMenu"
                         class="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-sm">
                        <button @click="downloadStatement('csv')" class="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700">csv</button>
                        <button @click="downloadStatement('pdf')" class="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700">pdf</button>
                    </div>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="text-gray-500 border-b border-gray-100">
                        <tr>
                            <th class="py-4 font-medium">Transaction Date</th>
                            <th class="py-4 font-medium">Transaction Type</th>
                            <th class="py-4 font-medium">Balance Before(₦)</th>
                            <th class="py-4 font-medium">Inflow(₦)</th>
                            <th class="py-4 font-medium">Outflow(₦)</th>
                            <th class="py-4 font-medium">Balance After(₦)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filteredTransactions.length === 0">
                            <td colspan="6" class="py-8 text-center text-gray-400 text-sm">No transactions in this range.</td>
                        </tr>
                        <tr v-for="txn in filteredTransactions" :key="txn.id" class="border-b border-gray-50 text-gray-600 hover:bg-gray-50">
                            <td class="py-4">{{ txn.date }}</td>
                            <td class="py-4">{{ txn.type }}</td>
                            <td class="py-4">₦{{ formatNumber(txn.before) }}</td>
                            <td class="py-4 font-medium" :class="txn.inflow ? 'text-green-600' : ''">{{ txn.inflow != null ? formatNumber(txn.inflow) : '-' }}</td>
                            <td class="py-4 font-medium text-gray-800">{{ txn.outflow != null ? formatNumber(txn.outflow) : '-' }}</td>
                            <td class="py-4">₦{{ formatNumber(txn.after) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Deposit Modal -->
        <div v-if="showDeposit" class="modal-mask" @click.self="closeModals">
            <div class="modal-content overflow-hidden w-[420px] rounded-2xl relative z-50">
                <div class="p-5 flex justify-between items-center">
                    <span class="text-lg font-bold text-gray-800">Deposit</span>
                    <i class="fa-solid fa-xmark text-gray-400 cursor-pointer hover:text-gray-600 text-lg relative z-10" @click.stop="closeModals"></i>
                </div>
                <div class="px-6 pb-6 pt-2">
                    <label class="block text-xs font-bold text-gray-800 mb-4">Amount</label>
                    <div class="flex items-center border-b-2 border-[#27B665] pb-2 mb-4 relative z-10">
                        <span class="text-gray-800 font-bold mr-2 text-xl">₦</span>
                        <input type="number" v-model.number="actionAmount" class="w-full outline-none text-2xl font-bold text-gray-800 placeholder-gray-300 relative z-10" placeholder="0.00">
                        <span @click.stop="actionAmount = accountData.mainBalance" class="text-[#27B665] text-sm cursor-pointer ml-2 font-medium relative z-10">All</span>
                    </div>
                    <div class="text-xs text-gray-500 mb-8 flex items-center">
                        <i class="fa-solid fa-circle-dot text-[#27B665] mr-2"></i>
                        <span class="text-[#27B665] font-medium">Balance ₦{{ formatNumber(accountData.mainBalance) }}</span>
                    </div>
                    <div class="flex justify-between items-center mt-8">
                        <span @click.stop="closeModals" class="text-[#27B665] text-sm font-medium cursor-pointer hover:opacity-80 relative z-10">Cancel</span>
                        <button @click.stop="processDeposit" :disabled="!actionAmount || actionAmount <= 0 || actionAmount > accountData.mainBalance || isProcessing"
                                class="bg-[#9ae5b6] text-white text-sm font-bold px-10 py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                                :class="{'!bg-[#27B665] hover:!bg-[#219e56]': actionAmount > 0 && actionAmount <= accountData.mainBalance}">
                            Deposit
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Withdraw Modal -->
        <div v-if="showWithdraw" class="modal-mask" @click.self="closeModals">
            <div class="modal-content overflow-hidden w-[420px] rounded-2xl relative z-50">
                <div class="p-5 flex justify-between items-center">
                    <span class="text-lg font-bold text-gray-800">Withdraw</span>
                    <i class="fa-solid fa-xmark text-gray-400 cursor-pointer hover:text-gray-600 text-lg relative z-10" @click.stop="closeModals"></i>
                </div>
                <div class="px-6 pb-6 pt-2">
                    <label class="block text-xs font-bold text-gray-800 mb-4">Amount</label>
                    <div class="flex items-center border-b border-gray-200 focus-within:border-green-500 focus-within:border-b-2 transition-colors pb-2 mb-2 relative z-10">
                        <span class="text-gray-800 font-bold mr-2 text-xl">₦</span>
                        <input type="number" v-model.number="actionAmount" class="w-full outline-none text-2xl font-bold text-gray-800 placeholder-gray-300 relative z-10" placeholder="0.00">
                        <span @click.stop="actionAmount = withdrawableBalance" class="text-[#27B665] text-sm cursor-pointer ml-2 font-medium relative z-10">All</span>
                    </div>
                    <div class="text-xs text-gray-400 mb-6">
                        {{ isSimpleMode ? 'Principal Account' : 'OWealth' }} ₦{{ formatNumber(withdrawableBalance) }}
                    </div>
                    <div class="flex items-center text-sm text-gray-800 mb-8 mt-2">
                        <span class="mr-4 text-xs font-medium">Withdraw to</span>
                        <span class="flex items-center text-[#27B665] font-bold"><i class="fa-solid fa-circle-dot mr-2"></i> Balance</span>
                    </div>
                    <div class="flex justify-between items-center mt-8">
                        <span @click.stop="closeModals" class="text-[#27B665] text-sm font-medium cursor-pointer hover:opacity-80 relative z-10">Cancel</span>
                        <button @click.stop="processWithdraw" :disabled="!actionAmount || actionAmount <= 0 || actionAmount > withdrawableBalance || isProcessing"
                                class="bg-[#9ae5b6] text-white text-sm font-bold px-10 py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                                :class="{'!bg-[#27B665] hover:!bg-[#219e56]': actionAmount > 0 && actionAmount <= withdrawableBalance}">
                            Withdraw
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <pin-verification v-model="showPinModal" @confirm="onPinConfirm" @cancel="onPinCancel" />
    </div>
    `,
    setup(props) {
        const compoundRateLabel = `${OWEALTH_COMPOUND_RATE}%`;
        const simpleRateLabel = `${OWEALTH_SIMPLE_RATE}%`;
        const pageTitle = computed(() =>
            props.branchName ? `OWealth-${props.branchName}` : 'OWealth'
        );

        const isSimpleMode = computed(() => isSimpleAccrualMode());
        const interestEnabled = computed(() => isInterestEnabled());
        const isNonInterestModeView = computed(() => isNonInterestMode());
        const displayRate = computed(() => getActiveRateLabel());

        const accountData = reactive({
            principalBalance: 6278.16,
            isolatedInterest: 687.25,
            yesterdayInterest: 0.00,
            mainBalance: 5513.62,
            totalInterest: 687.25
        });

        const withdrawableBalance = computed(() => accountData.principalBalance);

        const detailTabs = [
            { id: 'principal', label: 'Principal Account' },
            { id: 'interest', label: 'Interest Account' }
        ];
        const activeDetailTab = ref('principal');
        const filterStart = ref('');
        const filterEnd = ref('');
        const showDownloadMenu = ref(false);

        const transactions = ref([
            { id: 'p1', account: 'principal', date: 'Aug 6, 2026 12:54:04', type: 'Payment Withdraw', before: 4113.54, inflow: null, outflow: 100.00, after: 4013.54, ts: Date.parse('2026-08-06T12:54:04') },
            { id: 'p2', account: 'principal', date: 'Aug 6, 2026 12:37:26', type: 'Payment Withdraw', before: 4126.54, inflow: null, outflow: 13.00, after: 4113.54, ts: Date.parse('2026-08-06T12:37:26') },
            { id: 'p3', account: 'principal', date: 'Aug 6, 2026 11:20:00', type: 'Deposit', before: 3126.54, inflow: 1000.00, outflow: null, after: 4126.54, ts: Date.parse('2026-08-06T11:20:00') },
            { id: 'i1', account: 'interest', date: 'Aug 6, 2026 00:05:00', type: 'Interest', before: 650.00, inflow: 37.25, outflow: null, after: 687.25, ts: Date.parse('2026-08-06T00:05:00') },
            { id: 'i2', account: 'interest', date: 'Aug 5, 2026 00:05:00', type: 'Interest', before: 612.80, inflow: 37.20, outflow: null, after: 650.00, ts: Date.parse('2026-08-05T00:05:00') },
            { id: 'o1', account: 'owealth', date: 'Aug 6, 2026 12:54:04', type: 'Payment Withdraw', before: 4113.54, inflow: null, outflow: 100.00, after: 4013.54, ts: Date.parse('2026-08-06T12:54:04') },
            { id: 'o2', account: 'owealth', date: 'Aug 6, 2026 00:05:00', type: 'Interest', before: 4080.00, inflow: 33.54, outflow: null, after: 4113.54, ts: Date.parse('2026-08-06T00:05:00') }
        ]);

        const parseFilterBound = (dateStr, endOfDay) => {
            if (!dateStr) return null;
            return new Date(dateStr + (endOfDay ? 'T23:59:59' : 'T00:00:00')).getTime();
        };

        const currentAccountKey = computed(() => {
            if (isSimpleMode.value) {
                return activeDetailTab.value === 'interest' ? 'interest' : 'principal';
            }
            return 'owealth';
        });

        const accountLabel = computed(() => {
            if (currentAccountKey.value === 'interest') return 'Interest Account';
            if (currentAccountKey.value === 'principal') return 'Principal Account';
            return 'OWealth';
        });

        const filteredTransactions = computed(() => {
            const account = currentAccountKey.value;
            const start = parseFilterBound(filterStart.value, false);
            const end = parseFilterBound(filterEnd.value, true);
            return transactions.value
                .filter(t => t.account === account)
                .filter(t => {
                    if (start != null && t.ts < start) return false;
                    if (end != null && t.ts > end) return false;
                    return true;
                })
                .slice()
                .sort((a, b) => b.ts - a.ts);
        });

        const clearFilters = () => {
            filterStart.value = '';
            filterEnd.value = '';
        };

        const mergeInterestIntoPrincipal = () => {
            if (accountData.isolatedInterest > 0) {
                accountData.principalBalance += accountData.isolatedInterest;
                accountData.isolatedInterest = 0;
            }
            setIsolatedInterestBalance(0);
        };

        const syncIsolatedInterestToStore = () => {
            setIsolatedInterestBalance(accountData.isolatedInterest);
        };

        watch(() => accountData.isolatedInterest, syncIsolatedInterestToStore);

        watch(
            () => [interestSettings.interestEnabled, interestSettings.isolationEnabled],
            () => {
                // Settings 已拦截有余额时关闭隔离/计息；此处仅做兜底同步
                if (!isSimpleAccrualMode()) {
                    if (accountData.isolatedInterest > 0) {
                        syncIsolatedInterestToStore();
                        return;
                    }
                    setIsolatedInterestBalance(0);
                } else {
                    activeDetailTab.value = 'principal';
                    const storeBal = Number(interestSettings.isolatedInterestBalance) || 0;
                    if (storeBal > 0 && accountData.isolatedInterest <= 0) {
                        if (accountData.principalBalance >= storeBal) {
                            accountData.principalBalance -= storeBal;
                        }
                        accountData.isolatedInterest = storeBal;
                    } else if (accountData.isolatedInterest <= 0 && accountData.principalBalance > 1000) {
                        const seed = 687.25;
                        accountData.principalBalance -= seed;
                        accountData.isolatedInterest = seed;
                    }
                    syncIsolatedInterestToStore();
                }
                showDownloadMenu.value = false;
            }
        );

        onMounted(() => {
            if (!isSimpleAccrualMode()) {
                mergeInterestIntoPrincipal();
            } else {
                const storeBal = Number(interestSettings.isolatedInterestBalance) || 0;
                if (storeBal > 0) {
                    accountData.isolatedInterest = storeBal;
                }
                syncIsolatedInterestToStore();
            }
            document.addEventListener('click', () => { showDownloadMenu.value = false; });
        });

        const showDeposit = ref(false);
        const showWithdraw = ref(false);
        const actionAmount = ref(null);
        const toastMsg = ref('');
        const isProcessing = ref(false);
        let toastTimer = null;

        const triggerToast = (msg, persistent = false) => {
            toastMsg.value = msg;
            if (toastTimer) clearTimeout(toastTimer);
            if (!persistent) toastTimer = setTimeout(() => { toastMsg.value = ''; }, 3000);
        };

        const closeModals = () => { showDeposit.value = false; showWithdraw.value = false; };
        const openDeposit = () => { actionAmount.value = null; showDeposit.value = true; };
        const openWithdraw = () => { actionAmount.value = null; showWithdraw.value = true; };

        const showPinModal = ref(false);
        const pendingAuth = ref(null);

        const executeWithAuth = (actionCallback, successMsg) => {
            pendingAuth.value = { actionCallback, successMsg };
            showPinModal.value = true;
        };

        const onPinConfirm = () => {
            const pending = pendingAuth.value;
            pendingAuth.value = null;
            if (!pending) return;
            isProcessing.value = true;
            triggerToast('Processing verification...', true);
            setTimeout(() => {
                isProcessing.value = false;
                pending.actionCallback();
                closeModals();
                triggerToast(pending.successMsg);
            }, 600);
        };

        const onPinCancel = () => {
            pendingAuth.value = null;
        };

        const pushTxn = ({ account, type, before, after, inflow, outflow }) => {
            transactions.value.unshift({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                account,
                date: formatDateTime(props.currentTime),
                type,
                before,
                after,
                inflow: inflow ?? null,
                outflow: outflow ?? null,
                ts: props.currentTime.getTime()
            });
        };

        const principalAccountKey = computed(() =>
            isSimpleMode.value ? 'principal' : 'owealth'
        );

        const processDeposit = () => {
            const amt = actionAmount.value;
            executeWithAuth(() => {
                const before = accountData.principalBalance;
                accountData.principalBalance += amt;
                accountData.mainBalance -= amt;
                pushTxn({
                    account: principalAccountKey.value,
                    type: 'Deposit',
                    before,
                    after: accountData.principalBalance,
                    inflow: amt
                });
            }, 'Deposit successfully completed');
        };

        const processWithdraw = () => {
            const amt = actionAmount.value;
            executeWithAuth(() => {
                const before = accountData.principalBalance;
                accountData.principalBalance -= amt;
                accountData.mainBalance += amt;
                pushTxn({
                    account: principalAccountKey.value,
                    type: 'Payment Withdraw',
                    before,
                    after: accountData.principalBalance,
                    outflow: amt
                });
            }, 'Withdraw successfully completed');
        };

        const processTransferInterest = () => {
            const amt = accountData.isolatedInterest;
            executeWithAuth(() => {
                const interestBefore = accountData.isolatedInterest;
                const principalBefore = accountData.principalBalance;
                accountData.isolatedInterest = 0;
                accountData.principalBalance += amt;
                pushTxn({
                    account: 'interest',
                    type: 'Interest Transfer to Principal',
                    before: interestBefore,
                    after: 0,
                    outflow: amt
                });
                pushTxn({
                    account: 'principal',
                    type: 'Interest Transfer to Principal',
                    before: principalBefore,
                    after: accountData.principalBalance,
                    inflow: amt
                });
            }, 'Interest successfully transferred to Principal');
        };

        const lastProcessedDate = ref(new Date(props.currentTime));

        watch(() => props.currentTime, (newDate) => {
            if (!isInterestEnabled()) return;
            const timeDiff = newDate.getTime() - lastProcessedDate.value.getTime();
            const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));

            if (daysPassed > 0) {
                let dailyInterest = 0;
                for (let i = 0; i < daysPassed; i++) {
                    if (isSimpleAccrualMode()) {
                        dailyInterest = accountData.principalBalance * getSimpleDailyRate();
                        const before = accountData.isolatedInterest;
                        accountData.isolatedInterest += dailyInterest;
                        pushTxn({
                            account: 'interest',
                            type: 'Interest',
                            before,
                            after: accountData.isolatedInterest,
                            inflow: dailyInterest
                        });
                    } else {
                        dailyInterest = accountData.principalBalance * getCompoundDailyRate();
                        const before = accountData.principalBalance;
                        accountData.principalBalance += dailyInterest;
                        pushTxn({
                            account: 'owealth',
                            type: 'Interest',
                            before,
                            after: accountData.principalBalance,
                            inflow: dailyInterest
                        });
                    }
                    accountData.totalInterest += dailyInterest;
                }
                accountData.yesterdayInterest = dailyInterest;
                lastProcessedDate.value = new Date(lastProcessedDate.value.getTime() + daysPassed * 24 * 3600 * 1000);
            } else if (daysPassed < 0) {
                lastProcessedDate.value = new Date(newDate);
                accountData.yesterdayInterest = 0;
            }
        });

        const buildStatementRows = () => {
            const account = currentAccountKey.value;
            const start = parseFilterBound(filterStart.value, false);
            const end = parseFilterBound(filterEnd.value, true);
            return transactions.value
                .filter(t => t.account === account)
                .filter(t => {
                    if (start != null && t.ts < start) return false;
                    if (end != null && t.ts > end) return false;
                    return true;
                })
                .sort((a, b) => b.ts - a.ts);
        };

        const buildSummary = (rows) => {
            const opening = rows.length
                ? rows[rows.length - 1].before
                : (currentAccountKey.value === 'interest' ? accountData.isolatedInterest : accountData.principalBalance);
            const closing = rows.length
                ? rows[0].after
                : (currentAccountKey.value === 'interest' ? accountData.isolatedInterest : accountData.principalBalance);
            const inflows = rows.filter(r => r.inflow != null).reduce((s, r) => s + r.inflow, 0);
            const outflows = rows.filter(r => r.outflow != null).reduce((s, r) => s + r.outflow, 0);
            return {
                opening,
                closing,
                inflows,
                outflows,
                inflowCount: rows.filter(r => r.inflow != null).length,
                outflowCount: rows.filter(r => r.outflow != null).length,
                summaryDates: `${filterStart.value || 'N/A'} - ${filterEnd.value || 'N/A'}`
            };
        };

        const formatAmt = (n) => formatNumber(n);
        const cellIn = (r) => (r.inflow != null ? formatAmt(r.inflow) : '-');
        const cellOut = (r) => (r.outflow != null ? formatAmt(r.outflow) : '-');

        const makeFileId = () => {
            const d = props.currentTime;
            const pad = (n) => String(n).padStart(2, '0');
            const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
            return `TS${stamp}${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`;
        };

        const statementTitle = () => {
            const key = currentAccountKey.value;
            if (key === 'interest') return 'Transaction Statements - Interest Account';
            if (key === 'principal') return 'Transaction Statements - Principal Account';
            return 'Transaction Statements - OWealth';
        };

        const pad2 = (n) => String(n).padStart(2, '0');
        const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formatIssuingDate = (d) =>
            `${pad2(d.getDate())} ${monthsShort[d.getMonth()]} ${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

        const downloadCsv = (rows, summary, fileId) => {
            const title = statementTitle();
            const lines = [
                title,
                `Branch Name,${BRANCH_NAME}`,
                `File ID,${fileId}`,
                `Issuing Date,${formatIssuingDate(props.currentTime)}`,
                '',
                'Account Summary',
                `Opening Balance(₦),${formatAmt(summary.opening)}`,
                `Closing Balance(₦),${formatAmt(summary.closing)}`,
                `Money In,${formatAmt(summary.inflows)}`,
                `Money Out,${formatAmt(summary.outflows)}`,
                `Inflow Count,${summary.inflowCount}`,
                `Outflow Count,${summary.outflowCount}`,
                '',
                'Transaction Details',
                'Transaction Date,Transaction Type,Balance Before(₦),Inflow(₦),Outflow(₦),Balance After(₦)',
                ...rows.map(r => [
                    `"${r.date}"`,
                    `"${r.type}"`,
                    formatAmt(r.before),
                    r.inflow != null ? formatAmt(r.inflow) : '-',
                    r.outflow != null ? formatAmt(r.outflow) : '-',
                    formatAmt(r.after)
                ].join(',')),
                '',
                DISCLAIMER
            ];

            const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileId}_OWealthDetails.csv`;
            a.click();
            URL.revokeObjectURL(url);
        };

        const downloadPdf = (rows, summary, fileId) => {
            const title = statementTitle();
            const issued = formatIssuingDate(props.currentTime);
            const pageSize = 18;
            const pages = [];
            for (let i = 0; i < Math.max(rows.length, 1); i += pageSize) {
                pages.push(rows.slice(i, i + pageSize));
            }

            const tableRows = (chunk) => chunk.map(r => `
                <tr>
                    <td>${r.date}</td>
                    <td>${r.type}</td>
                    <td class="num">${formatAmt(r.before)}</td>
                    <td class="num">${cellIn(r)}</td>
                    <td class="num">${cellOut(r)}</td>
                    <td class="num">${formatAmt(r.after)}</td>
                </tr>`).join('');

            const htmlPages = pages.map((chunk, idx) => `
              <section class="page">
                <div class="header">
                  <div class="brand">
                    <div class="logo">O</div>
                    <div class="brand-name">OPay</div>
                  </div>
                  <div class="meta">
                    <div><span class="label">Branch Name: </span><span class="value">${BRANCH_NAME}</span></div>
                    <div><span class="label">File ID: </span><span class="value">${fileId}</span></div>
                    <div><span class="label">Issuing Date: </span><span class="value">${issued}</span></div>
                  </div>
                </div>

                <h1>${title}</h1>

                ${idx === 0 ? `
                <div class="section-title">Account Summary</div>
                <div class="summary-box">
                  <div class="summary-grid">
                    <div class="summary-row"><span class="k">Opening Balance</span><span class="v">${formatAmt(summary.opening)}</span></div>
                    <div class="summary-row"><span class="k">Closing Balance</span><span class="v">${formatAmt(summary.closing)}</span></div>
                    <div class="summary-row"><span class="k">Money In</span><span class="v">${formatAmt(summary.inflows)}</span></div>
                    <div class="summary-row"><span class="k">Inflow Count</span><span class="v">${summary.inflowCount}</span></div>
                    <div class="summary-row"><span class="k">Money Out</span><span class="v">${formatAmt(summary.outflows)}</span></div>
                    <div class="summary-row"><span class="k">Outflow Count</span><span class="v">${summary.outflowCount}</span></div>
                  </div>
                </div>` : ''}

                <div class="section-title">Transaction Details</div>
                <table class="details">
                  <thead>
                    <tr>
                      <th>Transaction Date</th>
                      <th>Transaction Type</th>
                      <th class="num">Balance Before(₦)</th>
                      <th class="num">Inflow(₦)</th>
                      <th class="num">Outflow(₦)</th>
                      <th class="num">Balance After(₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${chunk.length ? tableRows(chunk) : '<tr><td colspan="6" class="empty">No transactions in this range.</td></tr>'}
                  </tbody>
                </table>

                <p class="disclaimer">${DISCLAIMER}</p>
                <div class="page-footer">
                  <span>${fileId}</span>
                  <span>Page ${idx + 1} of ${pages.length}</span>
                </div>
              </section>`).join('');

            const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${fileId}_OWealthDetailsPdf</title>
<style>
  @page { size: A4; margin: 14mm 12mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, "Segoe UI", sans-serif;
    color: #1f2937;
    font-size: 11px;
    margin: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { page-break-after: always; padding-bottom: 28px; }
  .page:last-child { page-break-after: auto; }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 18px;
  }
  .brand { display: flex; align-items: center; gap: 8px; }
  .logo {
    width: 28px; height: 28px; border-radius: 6px;
    background: #27B665; color: #fff; font-weight: 800; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
  }
  .brand-name { font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.02em; }
  .meta { text-align: right; font-size: 11px; line-height: 1.55; color: #374151; }
  .meta .label { color: #6b7280; }
  .meta .value { font-weight: 600; color: #111827; }
  h1 { font-size: 18px; font-weight: 700; margin: 0 0 16px; color: #111827; }
  .section-title { font-size: 13px; font-weight: 700; margin: 0 0 8px; color: #111827; }
  .summary-box {
    border: 1px solid #e5e7eb; border-radius: 4px;
    padding: 12px 14px 10px; margin-bottom: 20px;
  }
  .summary-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    column-gap: 40px; row-gap: 6px;
  }
  .summary-row { display: flex; justify-content: space-between; gap: 16px; padding: 2px 0; }
  .summary-row .k { color: #6b7280; }
  .summary-row .v { font-weight: 600; color: #111827; text-align: right; }
  table.details { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 10.5px; }
  table.details thead th {
    text-align: left; font-weight: 600; color: #6b7280;
    padding: 8px 6px; border-bottom: 1px solid #e5e7eb; white-space: nowrap;
  }
  table.details thead th.num, table.details td.num { text-align: right; }
  table.details tbody td {
    padding: 8px 6px; border-bottom: 1px solid #f3f4f6;
    color: #374151; vertical-align: top;
  }
  .empty { text-align: center; color: #9ca3af; padding: 24px 0; }
  .disclaimer { margin-top: 22px; font-size: 10px; color: #6b7280; line-height: 1.45; }
  .page-footer {
    margin-top: 16px; padding-top: 8px; border-top: 1px solid #f3f4f6;
    font-size: 10px; color: #9ca3af;
    display: flex; justify-content: space-between;
  }
</style>
</head>
<body>
${htmlPages}
<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script>
</body>
</html>`;

            const w = window.open('', '_blank');
            if (!w) {
                triggerToast('Please allow pop-ups to download PDF');
                return;
            }
            w.document.open();
            w.document.write(html);
            w.document.close();
        };

        const downloadStatement = (format) => {
            showDownloadMenu.value = false;
            const rows = buildStatementRows();
            const summary = buildSummary(rows);
            const fileId = makeFileId();

            if (format === 'csv') {
                downloadCsv(rows, summary, fileId);
                triggerToast(`${accountLabel.value} CSV downloaded`);
            } else {
                downloadPdf(rows, summary, fileId);
                triggerToast(`${accountLabel.value} PDF ready to print/save`);
            }
        };

        return {
            pageTitle,
            interestSettings,
            isSimpleMode,
            isNonInterestMode: isNonInterestModeView,
            interestEnabled,
            compoundRateLabel,
            simpleRateLabel,
            displayRate,
            withdrawableBalance,
            accountData,
            detailTabs,
            activeDetailTab,
            filterStart,
            filterEnd,
            clearFilters,
            filteredTransactions,
            showDownloadMenu,
            downloadStatement,
            showDeposit,
            showWithdraw,
            actionAmount,
            toastMsg,
            isProcessing,
            openDeposit,
            openWithdraw,
            closeModals,
            processDeposit,
            processWithdraw,
            processTransferInterest,
            showPinModal,
            onPinConfirm,
            onPinCancel,
            formatNumber
        };
    }
};
