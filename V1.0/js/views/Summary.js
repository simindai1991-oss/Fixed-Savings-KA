// 关键修正：使用全局 Vue 对象，避免模块冲突
const { ref } = Vue;
import { formatNumber, formatShortNumber } from '../utils.js';

export default {
    template: `
    <div class="fade-in">
        <!-- Page Header Row (新增的标题行与按钮) -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800 flex items-center">
                Savings Summary
            </h1>
            <button @click="openAddBranchModal" class="bg-[#27B665] hover:bg-[#219e56] text-white text-sm font-medium px-4 py-2 rounded-md flex items-center transition-colors shadow-sm shadow-green-200">
                <i class="fa-solid fa-plus mr-2"></i>ADD Branch Savings
            </button>
        </div>

        <div class="space-y-6">
            <!-- 1. Top Cards Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <!-- Total Assets Card -->
                <div class="bg-[#27B665] rounded-xl p-6 text-white shadow-lg shadow-green-100 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                    <div class="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div class="relative z-10">
                        <div class="text-green-100 text-xs font-medium mb-2">Total Assets (Saving)</div>
                        <div class="text-3xl font-bold tracking-tight">₦ {{ formatNumber(summaryData.totalAssets) }}</div>
                    </div>
                    <div class="relative z-10 flex items-center justify-between text-xs text-green-50 border-t border-white/20 pt-4 mt-2">
                        <div class="flex items-center gap-1">
                            <span>OWealth:</span>
                            <span class="font-bold text-white">₦ {{ formatShortNumber(summaryData.owealthBalance) }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <span>Fixed:</span>
                            <span class="font-bold text-white">₦ {{ formatShortNumber(summaryData.fixedBalance) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Yesterday's Interest Card -->
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow">
                    <div>
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-gray-500 text-xs font-medium">Yesterday's Interest</span>
                            <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-[#27B665]">
                                <i class="fa-solid fa-arrow-trend-up"></i>
                            </div>
                        </div>
                        <div class="text-2xl font-bold text-gray-800">+ ₦ {{ formatNumber(summaryData.yesterdayInterest) }}</div>
                    </div>
                    <div class="text-xs flex items-center gap-1">
                        <span class="text-[#27B665] font-bold bg-green-50 px-1.5 py-0.5 rounded">
                            <i class="fa-solid fa-caret-up mr-0.5"></i>{{ summaryData.interestGrowth }}%
                        </span>
                        <span class="text-gray-400">vs last Monday</span>
                    </div>
                </div>

                <!-- Total Interest Earned Card -->
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow">
                    <div>
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-gray-500 text-xs font-medium">Total Interest Earned</span>
                            <div class="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-500">
                                <i class="fa-solid fa-coins"></i>
                            </div>
                        </div>
                        <div class="text-2xl font-bold text-gray-800">₦ {{ formatNumber(summaryData.totalInterestEarned) }}</div>
                    </div>
                </div>
            </div>

            <!-- 2. Interest Trend Chart -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="font-bold text-gray-800 text-base">Interest Trend (7 Days)</h3>
                    <div class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">2026/01/24 - 2026/01/30</div>
                </div>
                
                <div class="h-64 w-full flex justify-between gap-2 sm:gap-4 relative px-2">
                    <!-- Background Grid Lines -->
                    <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 select-none">
                        <div class="border-b border-gray-50 h-0 w-full"></div>
                        <div class="border-b border-gray-50 h-0 w-full"></div>
                        <div class="border-b border-gray-50 h-0 w-full"></div>
                        <div class="border-b border-gray-50 h-0 w-full"></div>
                    </div>

                    <!-- Bars -->
                    <div v-for="(day, index) in trendData" :key="index" 
                         class="flex flex-col items-center flex-1 group relative z-10 cursor-pointer h-full justify-end">
                        
                        <!-- Tooltip -->
                        <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20">
                            ₦{{ formatNumber(day.amount) }}
                        </div>

                        <!-- Value Label -->
                        <div v-if="index === trendData.length - 1" class="mb-2 text-xs font-bold text-[#27B665] transition-all group-hover:-translate-y-1">
                            ₦{{ day.amount }}
                        </div>
                        <div v-else class="mb-2 h-4 w-full"></div>

                        <!-- The Bar -->
                        <div class="w-full max-w-[60px] rounded-t-sm transition-all duration-500 ease-out hover:brightness-95"
                             :class="index === trendData.length - 1 ? 'bg-[#27B665]' : 'bg-[#dcfce7] group-hover:bg-[#86efac]'"
                             :style="{ height: (day.amount / maxAmount * 100) + '%' }">
                        </div>
                        
                        <!-- X-Axis Label -->
                        <div class="mt-3 text-xs text-gray-400 font-medium">{{ day.label }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Branch Savings Modal -->
        <div v-if="showAddBranchModal" class="modal-mask" @click.self="showAddBranchModal = false">
            <div class="modal-content overflow-hidden !w-[900px] !max-w-[95vw] !rounded-lg">
                <!-- Header -->
                <div class="p-5 border-b border-gray-100 flex justify-between items-center">
                    <span class="text-xl font-medium text-gray-800">Add Branch Savings</span>
                    <i class="fa-solid fa-xmark text-gray-400 cursor-pointer hover:text-gray-600 text-lg" @click="showAddBranchModal = false"></i>
                </div>
                
                <div class="p-6">
                    <!-- Filter -->
                    <div class="mb-5">
                        <label class="block text-sm text-gray-500 mb-1.5">Branch</label>
                        <div class="w-72 border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-400 flex justify-between items-center cursor-not-allowed bg-white">
                            <span>Select</span>
                            <i class="fa-solid fa-chevron-down text-xs"></i>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="border border-gray-100 rounded-lg overflow-hidden mb-4">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-50 text-gray-500 font-normal">
                                <tr>
                                    <th class="p-4 w-12 border-b border-gray-100"><input type="checkbox" disabled class="cursor-not-allowed w-4 h-4 rounded border-gray-300"></th>
                                    <th class="p-4 font-normal border-b border-gray-100">Branch ID</th>
                                    <th class="p-4 font-normal border-b border-gray-100">Branch Name</th>
                                    <th class="p-4 font-normal border-b border-gray-100">Balance</th>
                                    <th class="p-4 font-normal border-b border-gray-100">Settlement Method</th>
                                </tr>
                            </thead>
                            <tbody class="text-gray-600">
                                <tr v-for="branch in mockBranchList" :key="branch.id" class="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                                    <td class="p-4"><input type="checkbox" v-model="branch.selected" class="accent-[#27B665] w-4 h-4 cursor-pointer rounded"></td>
                                    <td class="p-4">{{ branch.id }}</td>
                                    <td class="p-4 text-gray-800">{{ branch.name }}</td>
                                    <td class="p-4">₦{{ formatNumber(branch.balance) }}</td>
                                    <td class="p-4">{{ branch.method }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination Mock -->
                    <div class="flex justify-end items-center text-sm text-gray-500 gap-6 mb-8">
                        <span>Total {{ mockBranchList.length }}</span>
                        <div class="flex gap-2 items-center border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer">50/page <i class="fa-solid fa-chevron-down text-xs ml-1"></i></div>
                        <div class="flex gap-2 items-center">
                            <span class="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded text-gray-400"><i class="fa-solid fa-chevron-left text-xs"></i></span>
                            <span class="w-8 h-8 flex items-center justify-center text-[#27B665] font-bold">1</span>
                            <span class="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded text-gray-400"><i class="fa-solid fa-chevron-right text-xs"></i></span>
                            <span class="ml-2">Go to</span>
                            <input type="text" value="1" class="w-10 h-8 border border-gray-300 rounded text-center focus:outline-none focus:border-green-500 ml-1">
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="flex justify-end gap-3">
                        <button @click="showAddBranchModal = false" class="px-6 py-2 border border-gray-300 text-gray-600 rounded-md text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                        <button @click="handleSubmit" class="px-6 py-2 bg-[#27B665] text-white rounded-md text-sm font-medium hover:bg-[#219e56] transition-colors shadow-sm shadow-green-100">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        // Summary Data
        const summaryData = ref({
            totalAssets: 8540230.50,
            owealthBalance: 5200000,
            fixedBalance: 3340230.50,
            yesterdayInterest: 3550.00, 
            interestGrowth: 12,
            totalInterestEarned: 850120.00
        });

        const trendData = ref([
            { label: 'Mon', amount: 2850 },
            { label: 'Tue', amount: 2920 },
            { label: 'Wed', amount: 3100 },
            { label: 'Thu', amount: 2980 },
            { label: 'Fri', amount: 3350 },
            { label: 'Sat', amount: 3100 },
            { label: 'Sun', amount: 3550 }
        ]);

        const maxAmount = 4000; 

        // Modal Logic
        const showAddBranchModal = ref(false);
        const mockBranchList = ref([
            { id: '1200067054', name: 'test merchant', balance: 27353, method: 'Balance', selected: false },
            { id: '1200067056', name: 'new branch', balance: 13918.8, method: 'Balance', selected: false },
            { id: '1200134929', name: 'test merchant 222', balance: 50, method: 'Sweep-cash', selected: false },
            { id: '1200067060', name: 'test new branch33333333', balance: 0, method: 'Balance', selected: false },
            { id: '1200135484', name: 'test merhcant iiiii', balance: 0, method: 'Balance', selected: false },
            { id: '1200136099', name: 'xiaoshuang', balance: 9.49, method: 'Balance', selected: false },
        ]);

        const openAddBranchModal = () => {
            // Reset selection
            mockBranchList.value.forEach(b => b.selected = false);
            showAddBranchModal.value = true;
        };

        const handleSubmit = () => {
            showAddBranchModal.value = false;
            
            if (window.ElementPlus && window.ElementPlus.ElMessage) {
                window.ElementPlus.ElMessage({
                    message: '进入分支开户流程',
                    type: 'success',
                    offset: 60,
                    duration: 2000
                });
            } else {
                alert('进入分支开户流程');
            }
        };

        return {
            summaryData,
            trendData,
            maxAmount,
            formatNumber,
            formatShortNumber,
            showAddBranchModal,
            openAddBranchModal,
            mockBranchList,
            handleSubmit
        };
    }
}