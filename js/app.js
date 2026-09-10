// 关键修复：移除 import { ... } from '...vue.esm-browser.js'，统一使用全局 Vue
const { createApp, ref, onMounted, onUnmounted, computed } = Vue;

// Components
import TopNavbar from './components/TopNavbar.js';
import SideMenu from './components/SideMenu.js';
import TimeTravelDebugger from './components/TimeTravel.js';
import ServiceFooter from './components/ServiceFooter.js';

// Views
import FixedSavingsView from './views/FixedSavings.js';
import SavingsSummaryView from './views/Summary.js';
import BranchFixedView from './views/BranchFixedSavings.js';
import OpenAccountCaseView from './views/OpenAccountCase.js';
import OWealthView from './views/OWealth.js'; // 引入 OWealth 视图
import SettingsView from './views/Settings.js';

const app = createApp({
    components: {
        'top-navbar': TopNavbar,
        'side-menu': SideMenu,
        'time-travel-debugger': TimeTravelDebugger,
        'service-footer': ServiceFooter
    },
    setup() {
        const currentPage = ref('fixed-savings');
        const currentBranchName = ref(null);
        const globalTime = ref(new Date());

        const handleNavigation = (page) => {
            currentPage.value = page;
            if (page !== 'fixed-savings-branch') {
                currentBranchName.value = null;
            }
        };

        const handleViewBranch = (branch) => {
            currentBranchName.value = branch.name;
            currentPage.value = 'fixed-savings-branch';
        };

        const updateGlobalTime = (newTime) => {
            globalTime.value = newTime;
        };
        
        const currentViewComponent = computed(() => {
            // 路由映射
            if (currentPage.value === 'fixed-savings' || currentPage.value === 'fixed-savings-branch') return FixedSavingsView;
            if (currentPage.value === 'savings-summary') return SavingsSummaryView;
            if (currentPage.value === 'branch-fixed') return BranchFixedView;
            if (currentPage.value === 'open-account') return OpenAccountCaseView; 
            if (currentPage.value === 'owealth') return OWealthView; // 配置 OWealth 路由
            if (currentPage.value === 'settings') return SettingsView;
            
            return FixedSavingsView;
        });

        const currentViewProps = computed(() => {
            const props = { currentTime: globalTime.value };
            
            if (currentPage.value === 'fixed-savings-branch') {
                props.branchName = currentBranchName.value;
                props.onBackToList = () => {
                    currentPage.value = 'branch-fixed';
                    currentBranchName.value = null;
                };
            }
            if (currentPage.value === 'branch-fixed') {
                props.onViewBranch = handleViewBranch;
            }
            
            return props;
        });

        let timer;
        onMounted(() => {
            // 保持时钟空转以维持框架完整性
            timer = setInterval(() => {}, 1000);
        });

        onUnmounted(() => {
            clearInterval(timer);
        });

        return {
            currentPage,
            globalTime,
            handleNavigation,
            updateGlobalTime,
            currentViewComponent,
            currentViewProps
        };
    }
});

// 如果环境中有 ElementPlus，进行挂载
if (window.ElementPlus) {
    app.use(window.ElementPlus);
}

app.mount('#app');