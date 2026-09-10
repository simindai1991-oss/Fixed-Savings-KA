const { ref, reactive, watch, computed, onMounted } = Vue;
import { formatNumber, formatDateTime } from '../utils.js';
import { OWEALTH_COMPOUND_RATE, OWEALTH_SIMPLE_RATE } from '../config.js';
import {
    interestSettings,
    isSimpleAccrualMode,
    isInterestEnabled,
    getActiveRateLabel,
    getCompoundDailyRate,
    getSimpleDailyRate
} from '../interestSettings.js';

export default {
    props: ['currentTime'],
    template: `
    <div class="fade-in space-y-6 relative">
        <h1 class="text-2xl font-bold text-gray-800">OWealth</h1>

        <div v-if="toastMsg" class="fixed top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded shadow-2xl z-[9999] transition-all flex items-center gap-3 w-max pointer-events-none">
            <i class="fa-solid" :class="isProcessing ? 'fa-circle-notch fa-spin text-white' : 'fa-circle-check text-[#27B665]'"></i>
            <span class="font-medium text-sm">{{ toastMsg }}</span>
        </div>

        <!-- Top Asset Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between col-span-1 lg:col-span-2">

                <!-- Compound / Non-interest: Single OWealth Card -->
                <div v-if="!isSimpleMode" class="bg-green-50/50 border border-green-100/50 rounded-xl p-5 relative overflow-hidden group hover:bg-green-50 transition-colors flex flex-col justify-between min-h-[180px]">
                    <div class="absolute -right-4 -top-4 w-20 h-20 bg-green-200/20 rounded-full blur-xl group-hover:bg-green-300/30 transition-all"></div>
                    <div class="relative z-10 mb-6">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-gray-500 text-sm font-medium">OWealth</span>
                            <span v-if="interestEnabled" class="bg-[#27B665]/10 text-[#27B665] px-2 py-0.5 rounded text-xs font-bold">{{ compoundRateLabel }} p.a.</span>
                            <span v-else class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-bold">Non-Interest</span>
                        </div>
                        <div class="text-[32px] leading-none font-bold text-gray-800">
                            ₦{{ formatNumber(accountData.principalBalance) }}
                        </div>
                    </div>
                    <div class="flex gap-3 relative z-10 mt-auto w-2/3">
                        <button @click.stop="openDeposit" class="flex-1 bg-[#27B665] hover:bg-[#219e56] text-white text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm shadow-green-200">Deposit</button>
                        <button @click.stop="openWithdraw" class="flex-1 bg-white hover:bg-green-50 border border-green-200 text-[#27B665] text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm">Withdraw</button>
                    </div>
                </div>

                <!-- Simple Isolation: Dual Cards -->
                <div v-else class="flex flex-col md:flex-row gap-4 h-full">
                    <div class="w-full md:w-2/3 bg-green-50/50 border border-green-100/50 rounded-xl p-5 relative overflow-hidden group hover:bg-green-50 transition-colors flex flex-col justify-between">
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

                    <div class="w-full md:w-1/3 bg-blue-50/50 border border-blue-100/50 rounded-xl p-5 relative overflow-hidden group hover:bg-blue-50 transition-colors flex flex-col justify-between">
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

            <div class="flex flex-col gap-6 col-span-1">
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col justify-center relative overflow-hidden">
                    <i class="fa-solid fa-arrow-trend-up absolute -right-6 -bottom-6 text-green-50 text-[100px] opacity-60 pointer-events-none"></i>
                    <div class="relative z-10">
                        <div class="flex items-center gap-1 mb-2">
                            <span class="text-gray-500 text-sm font-medium">Yesterday's interest</span>
                        </div>
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

        <!-- Auto-deposit -->
        <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 shadow-sm border border-blue-100 flex justify-between items-center relative overflow-hidden">
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

            <!-- Isolation: dual tabs -->
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
                         class="absolute right-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-sm">
                        <template v-if="isSimpleMode">
                            <button @click="downloadStatement('principal')" class="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700">
                                OWealth Transaction Statements — Principal Account (CSV)
                            </button>
                            <button @click="downloadStatement('interest')" class="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700">
                                OWealth Transaction Statements — Interest Account (CSV)
                            </button>
                        </template>
                        <button v-else @click="downloadStatement('owealth')" class="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700">
                            OWealth Transaction Statements (CSV)
                        </button>
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
                            <td class="py-4 font-medium" :class="txn.inflow ? 'text-green-600' : ''">{{ txn.inflow ? '+' + formatNumber(txn.inflow) : '-' }}</td>
                            <td class="py-4 font-medium text-gray-800">{{ txn.outflow ? formatNumber(txn.outflow) : '-' }}</td>
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
    </div>
    `,
    setup(props) {
        const compoundRateLabel = `${OWEALTH_COMPOUND_RATE}%`;
        const simpleRateLabel = `${OWEALTH_SIMPLE_RATE}%`;

        const isSimpleMode = computed(() => isSimpleAccrualMode());
        const interestEnabled = computed(() => isInterestEnabled());
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

        // account: 'principal' | 'interest' | 'owealth'
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
            const d = new Date(dateStr + (endOfDay ? 'T23:59:59' : 'T00:00:00'));
            return d.getTime();
        };

        const filteredTransactions = computed(() => {
            let account;
            if (isSimpleMode.value) {
                account = activeDetailTab.value === 'interest' ? 'interest' : 'principal';
            } else {
                account = 'owealth';
            }
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
        };

        watch(() => interestSettings.mode, (mode) => {
            if (mode === 'compound' || mode === 'none') mergeInterestIntoPrincipal();
            if (mode === 'simple') activeDetailTab.value = 'principal';
            showDownloadMenu.value = false;
        });

        onMounted(() => {
            if (!isSimpleAccrualMode()) mergeInterestIntoPrincipal();
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

        const executeWithAuth = (actionCallback, successMsg) => {
            isProcessing.value = true;
            triggerToast('Processing verification...', true);
            setTimeout(() => {
                isProcessing.value = false;
                actionCallback();
                closeModals();
                triggerToast(successMsg);
            }, 1000);
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

                // Interest Account: Outflow
                pushTxn({
                    account: 'interest',
                    type: 'Interest Transfer to Principal',
                    before: interestBefore,
                    after: 0,
                    outflow: amt
                });
                // Principal Account: Inflow
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

        const downloadStatement = (scope) => {
            showDownloadMenu.value = false;
            const account = scope === 'interest' ? 'interest'
                : scope === 'principal' ? 'principal'
                : 'owealth';

            const rows = transactions.value
                .filter(t => t.account === account)
                .filter(t => {
                    const start = parseFilterBound(filterStart.value, false);
                    const end = parseFilterBound(filterEnd.value, true);
                    if (start != null && t.ts < start) return false;
                    if (end != null && t.ts > end) return false;
                    return true;
                })
                .sort((a, b) => a.ts - b.ts);

            const title = scope === 'interest'
                ? 'OWealth Transaction Statements - Interest Account'
                : scope === 'principal'
                    ? 'OWealth Transaction Statements - Principal Account'
                    : 'OWealth Transaction Statements';

            const opening = rows.length ? rows[0].before : 0;
            const closing = rows.length ? rows[rows.length - 1].after
                : (scope === 'interest' ? accountData.isolatedInterest : accountData.principalBalance);
            const inflows = rows.filter(r => r.inflow).reduce((s, r) => s + r.inflow, 0);
            const outflows = rows.filter(r => r.outflow).reduce((s, r) => s + r.outflow, 0);
            const inflowCount = rows.filter(r => r.inflow).length;
            const outflowCount = rows.filter(r => r.outflow).length;

            const lines = [
                title,
                'OWealth related services are powered by OPay MicroFinance Bank, which is fully licensed by the CBN and insured by the NDIC.',
                '',
                'Account Summary',
                `Branch Name,OPAY DIGITAL SERVICES LIMITED`,
                `Summary Dates,${filterStart.value || 'N/A'} ~ ${filterEnd.value || 'N/A'}`,
                `Opening Balance(₦),${opening.toFixed(2)}`,
                `Closing Balance(₦),${closing.toFixed(2)}`,
                `Inflow Count,${inflowCount}`,
                `Outflow Count,${outflowCount}`,
                `Total Inflows,${inflows.toFixed(2)}`,
                `Total Outflows,${outflows.toFixed(2)}`,
                '',
                'Transaction Date,Transaction Type,Balance Before(₦),Inflow(₦),Outflow(₦),Balance After(₦)',
                ...rows.map(r => [
                    `"${r.date}"`,
                    `"${r.type}"`,
                    r.before.toFixed(2),
                    r.inflow != null ? r.inflow.toFixed(2) : '',
                    r.outflow != null ? r.outflow.toFixed(2) : '',
                    r.after.toFixed(2)
                ].join(','))
            ];

            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/\s+/g, '_')}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            triggerToast(`${title} downloaded`);
        };

        return {
            interestSettings,
            isSimpleMode,
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
            formatNumber
        };
    }
};
