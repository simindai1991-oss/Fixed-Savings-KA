// 【核心修复】移除 import，改用全局 Vue 对象
const { ref, computed, watch } = Vue;
import { formatNumber, formatShortNumber, formatDateTime, calculateMaturityDate } from '../utils.js';

export default {
    props: ['currentTime', 'branchName'],
    template: `
    <div class="fade-in">
        <!-- Header Section -->
        <div class="mb-5 flex justify-between items-center">
            <div class="flex items-center">
                <!-- Back Button for Branch View -->
                <div v-if="branchName" @click="$emit('back-to-list')" 
                     class="mr-4 w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 hover:text-opay hover:shadow-sm cursor-pointer transition-all border border-transparent hover:border-green-100">
                    <i class="fa-solid fa-arrow-left"></i>
                </div>
                
                <!-- Dynamic Title -->
                <h1 class="text-2xl font-bold text-gray-800">
                    {{ branchName ? 'Fixed Savings — ' + branchName : 'Fixed Savings' }}
                </h1>
            </div>
            <span class="text-xs text-gray-400">Server Time: {{ formatDateTime(currentTime) }}</span>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-[#e4e7ed] mb-5">
            <div v-for="tab in tabs" :key="tab"
                 @click="activeTab = tab"
                 class="px-5 py-2.5 cursor-pointer text-sm font-medium relative"
                 :class="activeTab === tab ? 'text-opay' : 'text-gray-400'">
                 {{ tab }}
                 <div v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-0.5 bg-opay"></div>
            </div>
        </div>

        <!-- Tab 1: Overview -->
        <div v-if="activeTab === 'Overview'" class="space-y-6">
            <!-- Asset Card -->
            <div class="bg-gradient-to-br from-[#27B665] to-[#1e9e48] rounded-xl p-6 text-white shadow-lg shadow-green-100">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-green-100 text-xs mb-1">Total Fixed Balance</div>
                        <div class="text-3xl font-bold mb-4">₦{{ formatNumber(dashboardStats.totalBalance) }}</div>
                        <div class="flex gap-8">
                            <div>
                                <div class="text-green-100 text-xs mb-0.5 flex items-center">Total Interest <i class="fa-solid fa-circle-info ml-1 opacity-70" title="Accumulated interest"></i></div>
                                <div class="text-lg font-bold">₦{{ formatNumber(dashboardStats.totalInterest) }}</div>
                            </div>
                            <div>
                                <div class="text-green-100 text-xs mb-0.5 flex items-center">Next Payout Date <span class="ml-2 text-white/50 scale-90 origin-left">(Interest + Principal paid at maturity)</span></div>
                                <div class="text-lg font-bold">{{ dashboardStats.nextMaturity || '--' }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"><i class="fa-solid fa-chart-line"></i></div>
                </div>
            </div>

            <!-- Portfolio List -->
            <div>
                <h3 class="text-base font-bold text-gray-700 pl-2 border-l-4 border-opay mb-4">My Portfolios</h3>
                <div v-if="activePortfolioList.length" class="space-y-4">
                    <div v-for="item in activePortfolioList" :key="item.id" 
                         @click="openPortfolioDetails(item)"
                         class="bg-white border border-gray-100 rounded-xl overflow-hidden hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer">
                        <div class="bg-[#f9fdfb] px-5 py-3 flex justify-between items-center border-b border-gray-50">
                            <div class="flex items-center gap-3">
                                <div class="w-6 h-6 rounded bg-green-100 flex items-center justify-center text-opay"><i class="fa-solid fa-lock text-xs"></i></div>
                                <span class="font-bold text-gray-700 text-sm">{{ item.productName }}</span>
                            </div>
                            <span class="px-2 py-0.5 rounded text-[11px] font-medium"
                                  :class="item.status === 'Liquidating' ? 'bg-orange-50 text-orange-500' : 'bg-[#e6f4ff] text-[#1677ff]'">
                                {{ item.status }}
                            </span>
                        </div>
                        <div class="p-4 grid grid-cols-4 gap-4 text-sm">
                            <div><div class="text-xs text-gray-400 mb-1">Amount (₦)</div><div class="font-bold text-gray-800">{{ formatNumber(item.amount) }}</div></div>
                            <div><div class="text-xs text-gray-400 mb-1">Total Interest (₦)</div><div class="font-bold text-gray-800">{{ formatNumber(item.interest) }}</div></div>
                            <div><div class="text-xs text-gray-400 mb-1">Maturity Date</div><div class="font-bold text-gray-800">{{ item.maturityDate }}</div></div>
                            <div class="flex items-center justify-end"><i class="fa-solid fa-chevron-right text-gray-300"></i></div>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-10 bg-white rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm">No active plans currently.</div>
            </div>

            <!-- Standard Plans (Hidden in Branch View) -->
            <div v-if="!branchName">
                <h3 class="text-base font-bold text-gray-700 pl-2 border-l-4 border-blue-500 mb-4">Fixed Plans</h3>
                <div class="grid grid-cols-4 gap-4">
                    <div v-for="plan in standardProducts" :key="plan.id" 
                         @click="openBuyModal(plan)"
                         class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-green-200">
                        <div class="flex justify-between items-start mb-2">
                            <div><div class="text-gray-400 text-xs">Lock for</div><div class="text-xl font-bold text-gray-800">{{ plan.days }} Days</div></div>
                            <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-green-50 group-hover:text-opay transition-colors"><i class="fa-solid fa-plus"></i></div>
                        </div>
                        <div class="flex items-baseline"><span class="text-2xl font-bold text-opay">{{ plan.rate }}%</span><span class="text-xs text-gray-400 ml-1">p.a.</span></div>
                        <div class="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-xs">
                            <span class="text-gray-400">Min ₦1,000</span>
                            <span class="text-opay font-medium group-hover:underline">Create Plan</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab 2: Special Offers (Hidden in Branch View by logic below, but v-if safeguard here too) -->
        <div v-if="activeTab === 'Special Offers'">
            <div class="flex items-center mb-6">
                <h3 class="text-base font-bold text-gray-700 pl-2 border-l-4 border-orange-400">Limited Time Offers</h3>
                <span class="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-bold">High Yield</span>
            </div>
            <div v-if="visibleSpecialProducts.length" class="grid grid-cols-3 gap-6">
                <div v-for="product in visibleSpecialProducts" :key="product.id" 
                     class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="bg-green-50 px-4 py-2 flex justify-between items-center text-xs">
                        <span class="text-gray-600 font-medium">Internal Beta Product</span>
                        <span :class="product.status === 'sold_out' ? 'text-gray-400' : 'text-red-500 font-bold'">
                            {{ product.status === 'sold_out' ? 'Ended' : product.countdown + ' left' }}
                        </span>
                    </div>
                    <div class="p-5">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <div class="text-3xl font-extrabold text-opay">{{ product.rate }}% <span class="text-sm font-normal text-gray-400 line-through">{{ product.benchmarkRate }}%</span></div>
                                <div class="text-xs text-gray-400 mt-1">Interest p.a.</div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-gray-800">{{ product.duration }}d</div>
                                <div class="text-xs text-gray-400 mt-1">Duration</div>
                            </div>
                        </div>
                        <!-- Quota Bar -->
                        <div class="mb-4">
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-gray-500">Quota: <span class="font-mono">{{ formatShortNumber(product.remainingQuota) }}</span> / <span class="text-gray-300">{{ formatShortNumber(product.totalSize) }}</span></span>
                                <span :class="getQuotaColor(product)">{{ getQuotaText(product) }}</span>
                            </div>
                            <div class="bg-gray-100 rounded-full h-1.5 w-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-500" :class="getQuotaBarColor(product)" :style="{ width: getQuotaPercentage(product) + '%' }"></div>
                            </div>
                        </div>
                        <button @click="openBuyModal(product)" :disabled="product.status === 'sold_out'" class="w-full py-2.5 rounded-lg font-bold text-sm transition-colors"
                            :class="product.status === 'sold_out' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-opay text-white hover:bg-green-600 shadow-md shadow-green-100'">
                            {{ product.status === 'sold_out' ? 'Sold Out' : 'Save Now' }}
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-20 bg-white rounded-lg border border-dashed border-gray-200">
                <div class="text-6xl text-gray-200 mb-4"><i class="fa-regular fa-clock"></i></div>
                <p class="text-gray-500 font-medium">No Special Offers Available</p>
                <p class="text-gray-400 text-xs mt-2">All limited time offers have expired.</p>
            </div>
        </div>

        <!-- Tab 3: History -->
        <div v-if="activeTab === 'History'">
            <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table class="custom-table w-full text-left border-collapse">
                    <thead><tr><th class="p-3 bg-gray-50 text-xs font-medium text-gray-500 border-b">ID</th><th class="p-3 bg-gray-50 text-xs font-medium text-gray-500 border-b">Type</th><th class="p-3 bg-gray-50 text-xs font-medium text-gray-500 border-b">Product</th><th class="p-3 bg-gray-50 text-xs font-medium text-gray-500 border-b">Amount</th><th class="p-3 bg-gray-50 text-xs font-medium text-gray-500 border-b">Status</th><th class="p-3 bg-gray-50 text-xs font-medium text-gray-500 border-b">Date</th></tr></thead>
                    <tbody>
                        <tr v-for="log in historyList" :key="log.id" class="hover:bg-gray-50">
                            <td class="p-3 border-b text-xs font-mono text-gray-600">{{ log.id }}</td>
                            <td class="p-3 border-b text-xs text-gray-600">{{ log.type }}</td>
                            <td class="p-3 border-b text-xs text-gray-600">{{ log.product }}</td>
                            <td class="p-3 border-b text-sm font-medium" :class="log.type === 'Payout' ? 'text-green-600' : 'text-gray-800'">{{ log.type === 'Payout' ? '+' : '' }}₦{{ formatNumber(log.amount) }}</td>
                            <td class="p-3 border-b"><span class="px-2 py-0.5 rounded text-xs" :class="log.status === 'Success' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">{{ log.status }}</span></td>
                            <td class="p-3 border-b text-xs text-gray-500">{{ log.date }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- === Modals === -->
        
        <!-- Buy Modal -->
        <div v-if="showBuyModal" class="modal-mask" @click.self="closeBuyModal">
            <div class="modal-content overflow-hidden">
                <div class="bg-opay p-4 text-white relative">
                    <i class="fa-solid fa-xmark absolute top-4 right-4 cursor-pointer" @click="closeBuyModal"></i>
                    <h3 class="text-lg font-bold">Save Amount (₦)</h3>
                    <div class="text-xs opacity-80 mt-1">
                        <span v-if="selectedProduct?.isStandard">Unlimited Quota</span>
                        <span v-else>Min: ₦10,000.00 - Max: ₦{{ formatNumber(selectedProduct.remainingUserLimit) }}</span>
                    </div>
                </div>

                <!-- Limit Reached View -->
                <div v-if="!selectedProduct.isStandard && selectedProduct.remainingUserLimit < 10000" class="p-8 text-center">
                    <div class="text-4xl text-gray-300 mb-4"><i class="fa-solid fa-ban"></i></div>
                    <h3 class="font-bold text-gray-700 mb-2">Purchase Limit Reached</h3>
                    <p class="text-gray-500 text-sm mb-6">You have reached your purchase limit for this product.</p>
                    <button @click="closeBuyModal" class="w-full bg-gray-100 text-gray-600 py-3 rounded-full font-bold hover:bg-gray-200">Close</button>
                </div>

                <!-- Normal Buy View -->
                <div v-else class="p-6">
                    <input type="number" v-model.number="investmentAmount" @input="validateInput" class="w-full text-3xl font-bold text-gray-800 border-b-2 border-green-500 focus:outline-none py-2 mb-1" placeholder="0.00">
                    <div v-if="inputError" class="text-red-500 text-xs mb-6 font-medium">{{ inputError }}</div>
                    <div v-else class="mb-6"></div>
                    
                    <div class="bg-gray-50 rounded-lg p-4 mb-4" v-if="selectedProduct">
                        <div class="text-xs font-bold text-gray-500 uppercase mb-3">Expected Return on {{ calculateMaturityDate(selectedProduct.duration) }}</div>
                        <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">Principal</span><span class="font-bold">₦{{ formatNumber(investmentAmount || 0) }}</span></div>
                        <div v-if="!selectedProduct.isStandard" class="flex justify-between text-sm mb-2"><span class="text-gray-500">Interest (normal offer)</span><span class="font-medium line-through text-gray-400">₦{{ formatNumber(calculations.normalInterest) }}</span></div>
                        <div class="flex justify-between text-sm mb-3"><span class="text-gray-500">Interest {{ !selectedProduct.isStandard ? '(special offer)' : '' }}</span><span class="font-bold text-gray-800">₦{{ formatNumber(calculations.totalInterest) }}</span></div>
                        <div class="border-t border-dashed border-gray-300 pt-2 flex justify-between items-center text-opay"><span class="font-medium">Total Return</span><span class="font-bold text-xl">₦{{ formatNumber((investmentAmount || 0) + calculations.totalInterest) }}</span></div>
                    </div>

                    <div class="text-[10px] text-gray-400 leading-tight mb-6 bg-yellow-50/50 p-2 rounded border border-yellow-100">
                        ₦{{ formatNumber(investmentAmount || 0) }} will be deposited until {{ calculateMaturityDate(selectedProduct.duration) }}. Actual duration and interest may vary based on the maturity date. If you wish to liquidate your funds, 100% of interest earned will be deducted, the payout amount will be paid to your OWealth balance within 48 hours after you submitted your liquidation application.
                    </div>

                    <button @click="processPayment" :disabled="!!inputError || !investmentAmount || investmentAmount <= 0" class="w-full bg-opay text-white py-3 rounded-full font-bold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">Save Now</button>
                </div>
            </div>
        </div>

        <!-- Success Modal -->
        <div v-if="showSuccessModal" class="modal-mask">
            <div class="modal-content p-8 text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-opay text-3xl"><i class="fa-solid fa-check"></i></div>
                <div class="text-2xl font-bold text-gray-800 mb-2">₦{{ formatNumber(investmentAmount) }}</div>
                <div class="text-gray-500 mb-8">Deposit Successful</div>
                <button @click="closeSuccessModal" class="w-full bg-opay text-white py-3 rounded-full font-bold">Done</button>
            </div>
        </div>

        <!-- Portfolio Details Modal -->
        <div v-if="showPortfolioModal && selectedPortfolioItem" class="modal-mask" @click.self="showPortfolioModal = false">
            <div class="modal-content overflow-hidden">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center font-bold text-gray-800">
                    <i class="fa-solid fa-chevron-left text-gray-400 cursor-pointer" @click="showPortfolioModal = false"></i>
                    <span>Fixed {{ selectedPortfolioItem.productName }}</span>
                    <i class="fa-solid fa-xmark text-gray-400 cursor-pointer" @click="showPortfolioModal = false"></i>
                </div>
                <div class="p-5 overflow-y-auto max-h-[70vh]">
                    <div class="flex justify-between items-center mb-6"><span class="text-gray-500">Amount</span><span class="text-xl font-bold text-gray-800">₦{{ formatNumber(selectedPortfolioItem.amount) }}</span></div>
                    <div class="space-y-4 text-sm text-gray-600">
                        <div class="flex justify-between"><span>Duration (Days)</span><span class="text-gray-800">{{ selectedPortfolioItem.duration }}</span></div>
                        <div class="flex justify-between"><span>Maturity Date</span><span class="text-gray-800">{{ selectedPortfolioItem.maturityDate }}</span></div>
                        <div class="flex justify-between"><span>Interest Rate</span><span class="text-gray-800 text-right">{{ selectedPortfolioItem.rate }}% annually</span></div>
                        <div class="flex justify-between items-center pt-2"><span>Payback to your</span><span class="text-opay font-medium">OWealth <i class="fa-solid fa-chevron-right text-xs ml-1"></i></span></div>
                        
                        <div v-if="selectedPortfolioItem.status === 'Investing'">
                             <div class="flex justify-between"><span>Interest (before tax)</span><span class="text-gray-800 font-medium">₦{{ formatNumber(selectedPortfolioItem.interest * 1.1) }}</span></div>
                             <div class="flex justify-between"><span>Withholding Tax <i class="fa-regular fa-circle-question text-gray-400"></i></span><span class="text-gray-800">₦{{ formatNumber(selectedPortfolioItem.interest * 0.1) }}</span></div>
                             <div class="flex justify-between"><span>Interest (after tax)</span><span class="text-gray-800 font-bold">₦{{ formatNumber(selectedPortfolioItem.interest) }}</span></div>
                             <div class="border-t border-gray-100 my-3 pt-3 flex justify-between items-center">
                                 <span class="font-medium text-gray-800">Total Payback(₦)</span>
                                 <div class="text-right"><div class="text-opay font-bold text-lg">₦{{ formatNumber(selectedPortfolioItem.amount + selectedPortfolioItem.interest) }}</div></div>
                             </div>
                        </div>
                    </div>
                    <!-- Liquidate Button (Hidden in branch view) -->
                    <button v-if="selectedPortfolioItem.status === 'Investing' && !branchName" @click="openLiquidateModal" class="w-full mt-6 py-3 border border-opay text-opay rounded-full font-bold hover:bg-green-50 transition-colors">Liquidate</button>
                    <div v-if="selectedPortfolioItem.status === 'Liquidating'" class="w-full mt-6 py-3 bg-orange-50 text-orange-500 rounded-full font-bold text-center">Processing Liquidation...</div>
                </div>
            </div>
        </div>

        <!-- Liquidate Modal -->
        <div v-if="showLiquidateModal" class="modal-mask" @click.self="showLiquidateModal = false">
             <div class="modal-content overflow-hidden">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center font-bold text-gray-800">
                    <div></div><span>Liquidate</span><i class="fa-solid fa-xmark text-gray-400 cursor-pointer" @click="showLiquidateModal = false"></i>
                </div>
                <div class="p-6 text-center">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">₦{{ formatNumber(selectedPortfolioItem.amount) }}</h2>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between"><span class="text-gray-500">Payback to your</span><span class="text-opay">OWealth</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Amount</span><span class="text-gray-800 font-medium">₦{{ formatNumber(selectedPortfolioItem.amount) }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Interest</span><span class="text-gray-800">+₦{{ formatNumber(liquidateCalc.accruedInterest) }}</span></div>
                        <div class="flex justify-between text-red-500 font-medium"><span>Interest lost</span><span>-₦{{ formatNumber(liquidateCalc.accruedInterest) }}</span></div>
                    </div>
                    <div class="mt-6 bg-yellow-50 text-yellow-600 text-xs p-3 rounded text-left">If you liquidate before {{ selectedPortfolioItem.maturityDate }}, you will lose all the interest accrued.</div>
                    <button @click="processLiquidation" class="w-full mt-6 bg-opay text-white py-3 rounded-lg font-bold hover:bg-green-600">Confirm</button>
                </div>
             </div>
        </div>

        <!-- Liquidate Success Modal -->
        <div v-if="showLiquidateSuccessModal" class="modal-mask">
            <div class="modal-content overflow-hidden">
                <div class="p-4 flex justify-between items-center border-none"><div></div><div class="text-lg font-bold">Submitted</div><i class="fa-solid fa-xmark text-gray-400 cursor-pointer" @click="closeLiquidateSuccess"></i></div>
                <div class="p-6">
                    <div class="space-y-4 text-sm mb-6">
                        <div class="flex justify-between"><span class="text-gray-500">Payback to your</span><span class="text-opay">OWealth</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Amount</span><span class="font-bold text-gray-800">₦{{ formatNumber(selectedPortfolioItem.amount) }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Payback Date</span><span class="text-gray-800">{{ paybackDate }}</span></div>
                    </div>
                    <div class="bg-green-50 p-3 rounded text-xs text-gray-600 leading-relaxed mb-6">You can make transactions directly from your OWealth, just like your normal OPay balance. Withdrawals are free and instant.</div>
                    <button @click="closeLiquidateSuccess" class="w-full bg-opay text-white py-3 rounded-lg font-bold hover:bg-green-600">Done</button>
                </div>
            </div>
        </div>
    </div>
    `,
    setup(props) {
        const activeTab = ref('Overview');
        const standardProducts = [
            { id: 'std-7', name: 'Standard 7 Days', days: 7, rate: 12, isStandard: true, duration: 7, benchmarkRate: 12, minAmount: 1000 },
            { id: 'std-60', name: 'Standard 60 Days', days: 60, rate: 13, isStandard: true, duration: 60, benchmarkRate: 13, minAmount: 1000 },
            { id: 'std-180', name: 'Standard 180 Days', days: 180, rate: 14, isStandard: true, duration: 180, benchmarkRate: 14, minAmount: 1000 },
            { id: 'std-365', name: 'Standard 365 Days', days: 365, rate: 15, isStandard: true, duration: 365, benchmarkRate: 15, minAmount: 1000 }
        ];
        
        const specialProducts = ref([
            { id: 2026, code: '2026-JAN', name: 'Fixed January 2026 Special', rate: 22.0, benchmarkRate: 15.0, duration: 30, minAmount: 10000, totalSize: 5000000000, remainingQuota: 3500000000, status: 'open', endDate: new Date(Date.now() + 29*24*3600*1000), isStandard: false, maxUserLimit: 300000, currentUserInvested: 0 },
            { id: 2027, code: 'STARTER', name: 'Starter Special Offer', rate: 20.0, benchmarkRate: 15.0, duration: 14, minAmount: 10000, totalSize: 50000000, remainingQuota: 2000000, status: 'open', endDate: new Date(Date.now() + 2*24*3600*1000), isStandard: false, maxUserLimit: 300000, currentUserInvested: 0 },
            { id: 2028, code: 'SOLD-OUT', name: 'Flash Sale', rate: 25.0, benchmarkRate: 15.0, duration: 7, minAmount: 1000, totalSize: 10000000, remainingQuota: 0, status: 'sold_out', endDate: new Date(Date.now() + 7*24*3600*1000), isStandard: false, maxUserLimit: 300000, currentUserInvested: 0 }
        ]);

        const portfolioList = ref([{ id: 1, productName: 'Fixed 27/01/2026', status: 'Investing', amount: 301000, interest: 864.16, rate: 15, duration: 7, createTime: '27 Jan 2026 19:58:16', maturityDate: '03 Feb 2026', rawMaturityDate: new Date('2026-02-03T00:00:00'), payoutProcessed: false }]);
        const historyList = ref([{ id: 'TXN8839201', type: 'Deposit', product: 'Fixed 27/01/2026', amount: 301000, status: 'Success', date: '2026-01-27 10:30:00' }]);

        // Computed
        const visibleSpecialProducts = computed(() => specialProducts.value.filter(p => p.endDate > props.currentTime || p.status === 'sold_out')); // Keep sold out visible until user refreshes or we want to hide them
        const activePortfolioList = computed(() => portfolioList.value.filter(item => item.status === 'Investing' || item.status === 'Liquidating'));
        
        // Computed: Dynamic tabs
        const tabs = computed(() => {
            return props.branchName 
                ? ['Overview', 'History'] 
                : ['Overview', 'Special Offers', 'History'];
        });

        const dashboardStats = computed(() => {
            let totalBalance = 0, totalInterest = 0, nextMaturity = null, minDate = null;
            portfolioList.value.forEach(item => {
                if (item.status === 'Investing' || item.status === 'Liquidating') {
                    totalBalance += item.amount;
                    totalInterest += item.interest;
                    if (item.rawMaturityDate && item.status === 'Investing') {
                        if (!minDate || item.rawMaturityDate < minDate) {
                            minDate = item.rawMaturityDate;
                            nextMaturity = item.maturityDate;
                        }
                    }
                } else if (item.status === 'Completed') {
                    totalInterest += item.interest; 
                }
            });
            return { totalBalance, totalInterest, nextMaturity };
        });

        // Modals & Forms
        const showBuyModal = ref(false), showSuccessModal = ref(false), showPortfolioModal = ref(false), showLiquidateModal = ref(false), showLiquidateSuccessModal = ref(false);
        const selectedProduct = ref(null), selectedPortfolioItem = ref(null), investmentAmount = ref(null), inputError = ref(null), paybackDate = ref('');
        
        const calculateUserRemainingQuota = (prod) => {
            if (prod.isStandard) return 9999999999;
            return Math.max(0, prod.maxUserLimit - prod.currentUserInvested);
        };

        const calculations = computed(() => {
            if (!investmentAmount.value || !selectedProduct.value) return { normalInterest: 0, totalInterest: 0 };
            const p = investmentAmount.value, t = selectedProduct.value.duration;
            const normal = p * (selectedProduct.value.benchmarkRate / 100) * (t / 365);
            const special = p * (selectedProduct.value.rate / 100) * (t / 365);
            return { normalInterest: Math.floor(normal), totalInterest: Math.floor(special) };
        });

        const liquidateCalc = computed(() => {
            if (!selectedPortfolioItem.value) return { accruedInterest: 0 };
            const accrued = (selectedPortfolioItem.value.amount * (selectedPortfolioItem.value.rate/100) * 1 / 365).toFixed(2);
            return { accruedInterest: accrued };
        });

        // Actions
        const openBuyModal = (prod) => { 
            selectedProduct.value = prod; 
            investmentAmount.value = null; 
            inputError.value = null;
            showBuyModal.value = true; 
        };
        const openStandardBuyModal = (plan) => { 
            selectedProduct.value = { ...plan }; 
            investmentAmount.value = null; 
            inputError.value = null;
            showBuyModal.value = true; 
        };
        const closeBuyModal = () => { showBuyModal.value = false; };
        
        const validateInput = () => {
            inputError.value = null;
            if (!investmentAmount.value) return;
            const min = selectedProduct.value.minAmount;
            const max = calculateUserRemainingQuota(selectedProduct.value);
            if (investmentAmount.value < min) inputError.value = `Minimum investment amount is ₦${formatNumber(min)}.`;
            else if (investmentAmount.value > max) {
                if(!selectedProduct.value.isStandard) inputError.value = `Maximum investment amount is ₦${formatNumber(max)}.`;
                else inputError.value = `Amount exceeds limit.`;
            }
        };

        const processPayment = () => {
            setTimeout(() => {
                showBuyModal.value = false; showSuccessModal.value = true;
                const now = new Date(props.currentTime);
                const maturity = new Date(props.currentTime);
                maturity.setDate(maturity.getDate() + selectedProduct.value.duration);
                if (!selectedProduct.value.isStandard) {
                    const target = specialProducts.value.find(p => p.id === selectedProduct.value.id);
                    if(target) target.currentUserInvested += investmentAmount.value;
                }
                portfolioList.value.unshift({
                    id: Date.now(), productName: selectedProduct.value.name, status: 'Investing', amount: investmentAmount.value,
                    rate: selectedProduct.value.rate, duration: selectedProduct.value.duration, createTime: formatDateTime(now),
                    interest: calculations.value.totalInterest, maturityDate: calculateMaturityDate(selectedProduct.value.duration, now),
                    rawMaturityDate: maturity, payoutProcessed: false
                });
                historyList.value.unshift({ id: 'TXN'+Math.floor(Math.random()*1000000), type: 'Deposit', product: selectedProduct.value.name, amount: investmentAmount.value, status: 'Success', date: formatDateTime(now) });
            }, 1000);
        };

        const openPortfolioDetails = (item) => { selectedPortfolioItem.value = item; showPortfolioModal.value = true; };
        const openLiquidateModal = () => { showPortfolioModal.value = false; showLiquidateModal.value = true; };
        
        const processLiquidation = () => {
            selectedPortfolioItem.value.status = 'Liquidating';
            const compDate = new Date(props.currentTime);
            compDate.setDate(compDate.getDate() + 1);
            selectedPortfolioItem.value.liquidationCompletionDate = compDate;
            paybackDate.value = calculateMaturityDate(1, props.currentTime);
            showLiquidateModal.value = false; showLiquidateSuccessModal.value = true;
        };

        const closeSuccessModal = () => { showSuccessModal.value = false; activeTab.value = 'Overview'; };
        const closeLiquidateSuccess = () => { showLiquidateSuccessModal.value = false; activeTab.value = 'Overview'; };

        // Watchers
        watch(() => props.currentTime, (newTime) => {
            // Maturity Check
            portfolioList.value.forEach(item => {
                if (item.status === 'Investing' && !item.payoutProcessed && newTime >= item.rawMaturityDate) {
                    item.status = 'Completed'; item.payoutProcessed = true;
                    historyList.value.unshift({ id: 'PAY'+Math.floor(Math.random()*1000000), type: 'Payout', product: item.productName, amount: item.amount + item.interest, status: 'Success', date: formatDateTime(newTime) });
                }
            });
            // Liquidation Check
            portfolioList.value.forEach(item => {
                if (item.status === 'Liquidating' && !item.payoutProcessed && newTime >= item.liquidationCompletionDate) {
                    item.status = 'Liquidated'; item.payoutProcessed = true;
                    historyList.value.unshift({ id: 'LIQ_PAY'+Math.floor(Math.random()*1000000), type: 'Payout', product: item.productName, amount: item.amount, status: 'Success', date: formatDateTime(newTime) });
                }
            });
            // Countdowns
            specialProducts.value.forEach(p => {
                if (p.status === 'sold_out') { p.countdown = ''; return; }
                const diff = p.endDate - newTime;
                if (diff > 0) {
                    const d = Math.floor(diff/(1000*60*60*24)), h = Math.floor((diff%(1000*60*60*24))/(1000*60*60)), m = Math.floor((diff%(1000*60*60))/(1000*60));
                    p.countdown = `${d}d ${h}h ${m}m`;
                } else p.countdown = 'Expired';
            });
        });

        return {
            activeTab, standardProducts, specialProducts, visibleSpecialProducts, portfolioList, activePortfolioList, historyList, dashboardStats,
            showBuyModal, showSuccessModal, showPortfolioModal, showLiquidateModal, showLiquidateSuccessModal, selectedProduct, selectedPortfolioItem, investmentAmount, inputError, paybackDate, calculations, liquidateCalc,
            formatNumber, formatShortNumber, formatDateTime, calculateMaturityDate, calculateUserRemainingQuota,
            openBuyModal, openStandardBuyModal, closeBuyModal, validateInput, processPayment, closeSuccessModal,
            openPortfolioDetails, openLiquidateModal, processLiquidation, closeLiquidateSuccess,
            getQuotaPercentage: (prod) => prod.status==='sold_out'?0:(prod.remainingQuota/prod.totalSize)*100,
            getQuotaText: (prod) => prod.status==='sold_out'?'Sold Out':((prod.remainingQuota/prod.totalSize)*100 < 15 ? 'Almost Sold Out' : 'Sufficient'),
            getQuotaColor: (prod) => prod.status==='sold_out'?'text-gray-400':((prod.remainingQuota/prod.totalSize)*100 < 15 ? 'text-orange-500 font-bold' : 'text-gray-400'),
            getQuotaBarColor: (prod) => (prod.remainingQuota/prod.totalSize)*100 < 15 ? 'bg-orange-400' : 'bg-opay',
            tabs
        };
    }
}