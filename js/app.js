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
import BranchOWealthView from './views/BranchOWealth.js';
import OpenAccountCaseView from './views/OpenAccountCase.js';
import OWealthView from './views/OWealth.js';
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
            currentBranchName.value = null;
        };

        const handleViewBranch = (branch) => {
            currentBranchName.value = branch.name;
            currentPage.value = 'fixed-savings-branch';
        };

        const handleViewBranchOWealth = (branch) => {
            currentBranchName.value = branch.name;
            currentPage.value = 'owealth-branch';
        };

        const updateGlobalTime = (newTime) => {
            globalTime.value = newTime;
        };

        const currentViewComponent = computed(() => {
            if (currentPage.value === 'fixed-savings' || currentPage.value === 'fixed-savings-branch') return FixedSavingsView;
            if (currentPage.value === 'savings-summary') return SavingsSummaryView;
            if (currentPage.value === 'branch-fixed') return BranchFixedView;
            if (currentPage.value === 'branch-owealth') return BranchOWealthView;
            if (currentPage.value === 'open-account') return OpenAccountCaseView;
            if (currentPage.value === 'owealth' || currentPage.value === 'owealth-branch') return OWealthView;
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
            if (currentPage.value === 'branch-owealth') {
                props.onViewBranch = handleViewBranchOWealth;
            }
            if (currentPage.value === 'owealth-branch') {
                props.branchName = currentBranchName.value;
                props.onBackToList = () => {
                    currentPage.value = 'branch-owealth';
                    currentBranchName.value = null;
                };
            }

            return props;
        });

        let timer;
        onMounted(() => {
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
