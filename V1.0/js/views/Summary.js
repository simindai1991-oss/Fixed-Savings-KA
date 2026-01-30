const { ref } = Vue;
import { formatNumber, formatShortNumber } from '../utils.js';

export default {
    template: `
    <div class="fade-in space-y-6">
        <!-- 1. Top Cards Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Total Assets Card (Green) -->
            <div class="bg-[#27B665] rounded-xl p-6 text-white shadow-lg shadow-green-100 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                <!-- Background decoration -->
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
            
            <!-- CSS Bar Chart -->
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
                    
                    <!-- Tooltip (Hover) -->
                    <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20">
                        ₦{{ formatNumber(day.amount) }}
                    </div>

                    <!-- Value Label (Visible for the last one/Highest) -->
                    <div v-if="index === trendData.length - 1" class="mb-2 text-xs font-bold text-[#27B665] transition-all group-hover:-translate-y-1">
                        ₦{{ day.amount }}
                    </div>
                    <div v-else class="mb-2 h-4 w-full"></div> <!-- Spacer -->

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
    `,
    setup() {
        // Mock data
        const summaryData = ref({
            totalAssets: 8540230.50,
            owealthBalance: 5200000,
            fixedBalance: 3340230.50,
            yesterdayInterest: 3550.00,
            interestGrowth: 12,
            totalInterestEarned: 850120.00
        });

        // Mock trend data
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

        return {
            summaryData,
            trendData,
            maxAmount,
            formatNumber,
            formatShortNumber
        };
    }
}