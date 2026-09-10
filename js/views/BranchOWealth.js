const { ref, computed } = Vue;
import { formatNumber } from '../utils.js';
import { MOCK_BRANCH_OWEALTH_LIST } from '../config.js';
import { isSimpleAccrualMode } from '../interestSettings.js';

export default {
    emits: ['viewBranch'],
    template: `
    <div class="fade-in flex flex-col h-full">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Branch OWealth</h1>
        </div>

        <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-4">
            <div class="text-sm font-medium text-gray-700 mb-2">Branch</div>
            <div class="w-[420px] max-w-full">
                <el-select v-model="selectedBranchId" placeholder="Select" clearable filterable>
                    <el-option label="All Branches" value=""></el-option>
                    <el-option
                        v-for="item in branchOptions"
                        :key="item.id"
                        :label="item.id + '-' + item.name"
                        :value="item.id">
                    </el-option>
                </el-select>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0">
            <div class="overflow-auto flex-1">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th class="p-4 text-xs font-medium text-gray-500 border-b border-gray-100">Branch ID</th>
                            <th class="p-4 text-xs font-medium text-gray-500 border-b border-gray-100">Branch Name</th>
                            <template v-if="isIsolationMode">
                                <th class="p-4 text-xs font-medium text-gray-500 border-b border-gray-100">OWealth Principal</th>
                                <th class="p-4 text-xs font-medium text-gray-500 border-b border-gray-100">Interest Account</th>
                            </template>
                            <th v-else class="p-4 text-xs font-medium text-gray-500 border-b border-gray-100">OWealth Balance</th>
                            <th class="p-4 text-xs font-medium text-gray-500 border-b border-gray-100">Yesterday's Interest</th>
                            <th class="p-4 text-xs font-medium text-gray-500 border-b border-gray-100">Total Interest</th>
                            <th class="p-4 text-xs font-medium text-gray-500 border-b border-gray-100">Operations</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm">
                        <tr v-for="branch in filteredBranchList" :key="branch.id"
                            class="hover:bg-gray-50 border-b border-gray-50 last:border-none transition-colors">
                            <td class="p-4 text-gray-600 font-mono">{{ branch.id }}</td>
                            <td class="p-4 text-gray-800 font-medium">{{ branch.name }}</td>
                            <template v-if="isIsolationMode">
                                <td class="p-4 text-gray-600">₦{{ formatNumber(branch.principalBalance) }}</td>
                                <td class="p-4 text-gray-600">₦{{ formatNumber(branch.interestBalance) }}</td>
                            </template>
                            <td v-else class="p-4 text-gray-600">₦{{ formatNumber(branch.owealthBalance) }}</td>
                            <td class="p-4 text-gray-600">₦{{ formatNumber(branch.yesterdayInterest) }}</td>
                            <td class="p-4 text-gray-600">₦{{ formatNumber(branch.totalInterest) }}</td>
                            <td class="p-4">
                                <button @click="$emit('viewBranch', branch)"
                                        class="text-opay hover:text-green-700 font-medium text-sm transition-colors">
                                    View
                                </button>
                            </td>
                        </tr>
                        <tr v-if="filteredBranchList.length === 0">
                            <td :colspan="colSpan" class="p-8 text-center text-gray-400">No branches found</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="p-4 border-t border-gray-100 flex justify-end items-center gap-4 text-sm text-gray-500 bg-white rounded-b-lg">
                <span>Total {{ filteredBranchList.length }}</span>
                <div class="flex items-center gap-2">
                    <span>10/page</span>
                    <i class="fa-solid fa-chevron-down text-xs"></i>
                </div>
                <div class="flex items-center gap-1">
                    <button class="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50">
                        <i class="fa-solid fa-chevron-left text-xs"></i>
                    </button>
                    <span class="text-opay font-bold">1</span>
                    <button class="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
                        <i class="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                </div>
                <div class="flex items-center gap-2">
                    <span>Go to</span>
                    <input type="text" value="1" class="w-10 h-7 border border-gray-300 rounded text-center focus:outline-none focus:border-green-500">
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const selectedBranchId = ref('');
        const branchList = ref(MOCK_BRANCH_OWEALTH_LIST);
        const isIsolationMode = computed(() => isSimpleAccrualMode());
        const colSpan = computed(() => (isIsolationMode.value ? 7 : 6));

        const branchOptions = computed(() =>
            branchList.value.map(b => ({ id: b.id, name: b.name }))
        );

        const filteredBranchList = computed(() => {
            if (!selectedBranchId.value) return branchList.value;
            return branchList.value.filter(b => b.id === selectedBranchId.value);
        });

        return {
            selectedBranchId,
            branchList,
            branchOptions,
            filteredBranchList,
            isIsolationMode,
            colSpan,
            formatNumber
        };
    }
};
