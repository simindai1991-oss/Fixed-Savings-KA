// 全局演示配置

// 1. OWealth 基础利率 (用于宣传页)
export const OWEALTH_RATE = "5%";
export const FIXED_MAX_RATE = "15%";

// 2. Savings Summary 页面的 Mock 数据
export const MOCK_SUMMARY_DATA = {
    totalAssets: 8540230.50,
    owealthBalance: 5200000,
    fixedBalance: 3340230.50,
    yesterdayInterest: 3550.00,
    interestGrowth: 12,
    totalInterestEarned: 850120.00
};

export const MOCK_TREND_DATA = [
    { label: 'Mon', amount: 2850 },
    { label: 'Tue', amount: 2920 },
    { label: 'Wed', amount: 3100 },
    { label: 'Thu', amount: 2980 },
    { label: 'Fri', amount: 3350 },
    { label: 'Sat', amount: 3100 },
    { label: 'Sun', amount: 3550 }
];

// 3. Fixed Savings - 标准产品列表
export const STANDARD_PRODUCTS = [
    { id: 'std-7', name: 'Standard 7 Days', days: 7, rate: 12, isStandard: true, duration: 7, benchmarkRate: 12, minAmount: 1000 },
    { id: 'std-60', name: 'Standard 60 Days', days: 60, rate: 13, isStandard: true, duration: 60, benchmarkRate: 13, minAmount: 1000 },
    { id: 'std-180', name: 'Standard 180 Days', days: 180, rate: 14, isStandard: true, duration: 180, benchmarkRate: 14, minAmount: 1000 },
    { id: 'std-365', name: 'Standard 365 Days', days: 365, rate: 15, isStandard: true, duration: 365, benchmarkRate: 15, minAmount: 1000 }
];

// 4. Fixed Savings - 特惠产品列表 (Special Offers)
// 注意：为了演示效果，这里使用函数生成日期，确保每次刷新都是最新的相对时间
export const getSpecialProducts = () => [
    { 
        id: 2026, 
        code: '2026-JAN', 
        name: 'Fixed January 2026 Special', 
        rate: 22.0, 
        benchmarkRate: 15.0, 
        duration: 30, 
        minAmount: 10000, 
        totalSize: 5000000000, 
        remainingQuota: 3500000000, 
        status: 'open', 
        endDate: new Date(Date.now() + 29 * 24 * 3600 * 1000), // 29 days left
        isStandard: false, 
        maxUserLimit: 300000, 
        currentUserInvested: 0 
    },
    { 
        id: 2027, 
        code: 'STARTER', 
        name: 'Starter Special Offer', 
        rate: 20.0, 
        benchmarkRate: 15.0, 
        duration: 14, 
        minAmount: 10000, 
        totalSize: 50000000, 
        remainingQuota: 2000000, 
        status: 'open', 
        endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000), // 2 days left
        isStandard: false, 
        maxUserLimit: 300000, 
        currentUserInvested: 0 
    },
    { 
        id: 2028, 
        code: 'SOLD-OUT', 
        name: 'Flash Sale', 
        rate: 25.0, 
        benchmarkRate: 15.0, 
        duration: 7, 
        minAmount: 1000, 
        totalSize: 10000000, 
        remainingQuota: 0, 
        status: 'sold_out', 
        endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000), 
        isStandard: false, 
        maxUserLimit: 300000, 
        currentUserInvested: 0 
    }
];

// 5. Branch Fixed Savings - 分支机构列表
export const MOCK_BRANCH_LIST = [
    { id: '1100000003', name: 'OPAY DIGITAL SERVICES LIMITED', balance: 42.35, yesterdayInterest: 0, totalInterest: 567.77 },
    { id: '1200000172', name: 'test merchant 001', balance: 30.00, yesterdayInterest: 0, totalInterest: 0 },
    { id: '1200000575', name: 'SELECT ALL', balance: 0, yesterdayInterest: 0, totalInterest: 0 },
    { id: '2200394013', name: 'ONE1029001', balance: 0, yesterdayInterest: 0, totalInterest: 0 },
    { id: '1200000008', name: 'New Michael Branch', balance: 0, yesterdayInterest: 0, totalInterest: 0 },
    { id: '1200000010', name: 'michael test', balance: 0, yesterdayInterest: 0, totalInterest: 0 },
    { id: '2200394015', name: 'ONE1031', balance: 0, yesterdayInterest: 0, totalInterest: 0 },
    { id: '1200426151', name: 'TWO1030', balance: 0, yesterdayInterest: 0, totalInterest: 0 },
    // 模拟数据供“添加分支”弹窗使用
    { id: '1200067054', name: 'test merchant', balance: 27353, method: 'Balance', selected: false, isNew: true },
    { id: '1200067056', name: 'new branch', balance: 13918.8, method: 'Balance', selected: false, isNew: true },
    { id: '1200134929', name: 'test merchant 222', balance: 50, method: 'Sweep-cash', selected: false, isNew: true },
    { id: '1200067060', name: 'test new branch33333333', balance: 0, method: 'Balance', selected: false, isNew: true },
    { id: '1200135484', name: 'test merhcant iiiii', balance: 0, method: 'Balance', selected: false, isNew: true },
    { id: '1200136099', name: 'xiaoshuang', balance: 9.49, method: 'Balance', selected: false, isNew: true }
];