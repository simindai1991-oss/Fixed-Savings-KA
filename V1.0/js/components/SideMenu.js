const { ref } = Vue;

export default {
    props: ['currentPage'],
    template: `
    <div class="w-[220px] bg-white border-r border-[#e6e6e6] flex flex-col overflow-y-auto shrink-0 py-2 select-none">
        <!-- Common Menus -->
        <div class="h-12 flex items-center px-5 text-gray-600 text-sm hover:bg-[#f5f7fa] cursor-pointer"><div class="w-6 text-center mr-2"><i class="fa-solid fa-gauge"></i></div>Overview</div>
        <div class="h-12 flex items-center px-5 text-gray-600 text-sm hover:bg-[#f5f7fa] cursor-pointer"><div class="w-6 text-center mr-2"><i class="fa-solid fa-wallet"></i></div>Balance</div>
        
        <!-- Savings Group -->
        <div class="h-12 flex items-center px-5 text-gray-600 text-sm hover:bg-[#f5f7fa] cursor-pointer" @click="toggle('saving')">
            <div class="w-6 text-center mr-2"><i class="fa-solid fa-piggy-bank"></i></div>
            <span class="flex-1">Saving</span>
            <i class="fa-solid fa-chevron-down text-xs transition-transform" :class="{'rotate-180': open.saving}"></i>
        </div>
        <div class="overflow-hidden transition-all bg-white" :style="{ maxHeight: open.saving ? '200px' : '0' }">
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay" 
                 :class="{'text-opay font-medium bg-[#f0f9f4]': currentPage === 'savings-summary'}"
                 @click="$emit('navigate', 'savings-summary')">
                Summary
            </div>
            <!-- 新增：Open Account Case -->
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay"
                 :class="{'text-opay font-medium bg-[#f0f9f4]': currentPage === 'open-account'}"
                 @click="$emit('navigate', 'open-account')">
                 Open Account Case
            </div>
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay">OWealth</div>
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay" 
                 :class="{'text-opay font-medium bg-[#f0f9f4]': currentPage === 'fixed-savings'}"
                 @click="$emit('navigate', 'fixed-savings')">
                Fixed Savings
            </div>
        </div>

        <!-- Branch Savings Group -->
        <div class="h-12 flex items-center px-5 text-gray-600 text-sm hover:bg-[#f5f7fa] cursor-pointer" @click="toggle('branch')">
            <div class="w-6 text-center mr-2"><i class="fa-solid fa-shop"></i></div>
            <span class="flex-1">Branch Savings</span>
            <i class="fa-solid fa-chevron-down text-xs transition-transform" :class="{'rotate-180': open.branch}"></i>
        </div>
        <div class="overflow-hidden transition-all bg-white" :style="{ maxHeight: open.branch ? '100px' : '0' }">
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay">Branch OWealth</div>
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay"
                 :class="{'text-opay font-medium bg-[#f0f9f4]': currentPage === 'branch-fixed'}"
                 @click="$emit('navigate', 'branch-fixed')">
                 Branch Fixed Savings
            </div>
        </div>
    </div>
    `,
    setup() {
        const open = ref({ saving: true, branch: false });
        
        const toggle = (key) => { 
            open.value[key] = !open.value[key]; 
        };
        
        return { open, toggle };
    }
}