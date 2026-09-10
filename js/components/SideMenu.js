const { ref, watch } = Vue;

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
        
        <!-- 修复点：放宽了 maxHeight -->
        <div class="overflow-hidden transition-all duration-300 ease-in-out bg-white" :style="{ maxHeight: open.saving ? '500px' : '0' }">
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay" 
                 :class="{'text-opay font-medium bg-[#f0f9f4]': currentPage === 'savings-summary'}"
                 @click="$emit('navigate', 'savings-summary')">
                Summary
            </div>
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay"
                 :class="{'text-opay font-medium bg-[#f0f9f4]': currentPage === 'open-account'}"
                 @click="$emit('navigate', 'open-account')">
                 Open Account Case
            </div>
            <!-- 修复点：添加了 OWealth 的点击导航事件 -->
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay"
                 :class="{'text-opay font-medium bg-[#f0f9f4]': currentPage === 'owealth'}"
                 @click="$emit('navigate', 'owealth')">
                 OWealth
            </div>
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
        <div class="overflow-hidden transition-all duration-300 ease-in-out bg-white" :style="{ maxHeight: open.branch ? '300px' : '0' }">
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay"
                 :class="{'text-opay font-medium bg-[#f0f9f4]': currentPage === 'branch-owealth' || currentPage === 'owealth-branch'}"
                 @click="$emit('navigate', 'branch-owealth')">
                 Branch OWealth
            </div>
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay"
                 :class="{'text-opay font-medium bg-[#f0f9f4]': currentPage === 'branch-fixed' || currentPage === 'fixed-savings-branch'}"
                 @click="$emit('navigate', 'branch-fixed')">
                 Branch Fixed Savings
            </div>
        </div>

        <!-- Settings Group -->
        <div class="h-12 flex items-center px-5 text-gray-600 text-sm hover:bg-[#f5f7fa] cursor-pointer" @click="toggle('settings')">
            <div class="w-6 text-center mr-2"><i class="fa-solid fa-gear"></i></div>
            <span class="flex-1">Settings</span>
            <i class="fa-solid fa-chevron-down text-xs transition-transform" :class="{'rotate-180': open.settings}"></i>
        </div>
        <div class="overflow-hidden transition-all duration-300 ease-in-out bg-white" :style="{ maxHeight: open.settings ? '200px' : '0' }">
            <div class="pl-[52px] h-10 flex items-center text-[13px] text-gray-600 cursor-pointer hover:text-opay"
                 :class="{'text-opay font-medium bg-[#f0f9f4]': currentPage === 'settings'}"
                 @click="$emit('navigate', 'settings')">
                 Setting
            </div>
        </div>
    </div>
    `,
    setup(props) {
        const open = ref({ saving: true, branch: false, settings: true });

        const toggle = (key) => {
            open.value[key] = !open.value[key];
        };

        watch(
            () => props.currentPage,
            (page) => {
                if (page === 'branch-owealth' || page === 'branch-fixed' || page === 'owealth-branch' || page === 'fixed-savings-branch') {
                    open.value.branch = true;
                }
            },
            { immediate: true }
        );

        return { open, toggle };
    }
}
