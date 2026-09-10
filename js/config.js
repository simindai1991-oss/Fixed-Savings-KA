// 全局演示配置

// 1. OWealth 基础利率 (用于宣传页)
export const OWEALTH_RATE = "5%";
export const FIXED_MAX_RATE = "15%";

// 1.1 OWealth Interest Setting 利率配置（对齐事实陈述）
// 复利模式：利息自动进入本金，按日复利，年化 5.00% 税前
// 单利隔离：利息进入独立账户，不生息，年化 4.87% 税前
// 非利息模式：不计息（穆斯林等客群）
// 验算：₦1,000,000 × 5.00% = ₦50,000 vs ₦1,000,000 × 4.87% = ₦48,700，差约 13 bps
export const OWEALTH_COMPOUND_RATE = 5.00;
export const OWEALTH_SIMPLE_RATE = 4.87;

// 2. Savings Summary 页面的 Mock 数据
export const MOCK_SUMMARY_DATA = {
    totalAssets: 8540230.50,
    owealthBalance: 5200000,
    // 本息隔离时拆开展示（合计仍等于 owealthBalance）
    owealthPrincipal: 4512750,
    owealthInterest: 687250,
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

// 2.5 OWealth 页面 Mock 数据
export const MOCK_OWEALTH_DATA = {
    principalBalance: 4013.54, // 本金余额
    isolatedInterest: 687.25,  // 隔离的利息余额
    yesterdayInterest: 0.00,
    mainBalance: 5513.62       // 用户的普通余额 (用于充值时的展示)
};

export const MOCK_OWEALTH_TRANSACTIONS = [
    { id: '1', date: 'Aug 6, 2026 12:54:04', type: 'Payment Withdraw', before: 4113.54, inflow: null, outflow: 100.00, after: 4013.54 },
    { id: '2', date: 'Aug 6, 2026 12:37:26', type: 'Payment Withdraw', before: 4126.54, inflow: null, outflow: 13.00, after: 4113.54 },
    { id: '3', date: 'Aug 6, 2026 12:37:25', type: 'Payment Withdraw', before: 4139.54, inflow: null, outflow: 13.00, after: 4126.54 },
    { id: '4', date: 'Aug 6, 2026 12:31:30', type: 'Payment Withdraw', before: 4189.64, inflow: null, outflow: 50.10, after: 4139.54 },
    { id: '5', date: 'Aug 6, 2026 11:23:55', type: 'Payment Withdraw', before: 4202.64, inflow: null, outflow: 13.00, after: 4189.64 }
];

// 3. Fixed Savings - 标准产品列表 (涵盖各个天数区间)
export const STANDARD_PRODUCTS = [
    // 7-60 区间
    { id: 'std-7', name: 'Standard 7 Days', days: 7, rate: 12.0, isStandard: true, duration: 7, benchmarkRate: 12.0, minAmount: 1000, maxUserLimit: -1, currentUserInvested: 0 },
    { id: 'std-30', name: 'Standard 30 Days', days: 30, rate: 12.5, isStandard: true, duration: 30, benchmarkRate: 12.5, minAmount: 1000, maxUserLimit: -1, currentUserInvested: 0 },
    { id: 'std-60', name: 'Standard 60 Days', days: 60, rate: 13.0, isStandard: true, duration: 60, benchmarkRate: 13.0, minAmount: 1000, maxUserLimit: -1, currentUserInvested: 0 },
    // 61-180 区间
    { id: 'std-90', name: 'Standard 90 Days', days: 90, rate: 13.5, isStandard: true, duration: 90, benchmarkRate: 13.5, minAmount: 1000, maxUserLimit: -1, currentUserInvested: 0 },
    { id: 'std-180', name: 'Standard 180 Days', days: 180, rate: 14.0, isStandard: true, duration: 180, benchmarkRate: 14.0, minAmount: 1000, maxUserLimit: -1, currentUserInvested: 0 },
    // 181-365 区间
    { id: 'std-270', name: 'Standard 270 Days', days: 270, rate: 14.5, isStandard: true, duration: 270, benchmarkRate: 14.5, minAmount: 1000, maxUserLimit: -1, currentUserInvested: 0 },
    { id: 'std-365', name: 'Standard 365 Days', days: 365, rate: 15.0, isStandard: true, duration: 365, benchmarkRate: 15.0, minAmount: 1000, maxUserLimit: -1, currentUserInvested: 0 },
    // 366-1000 区间
    { id: 'std-730', name: 'Standard 730 Days', days: 730, rate: 16.0, isStandard: true, duration: 730, benchmarkRate: 16.0, minAmount: 1000, maxUserLimit: -1, currentUserInvested: 0 },
    { id: 'std-1000', name: 'Standard 1000 Days', days: 1000, rate: 18.0, isStandard: true, duration: 1000, benchmarkRate: 18.0, minAmount: 1000, maxUserLimit: -1, currentUserInvested: 0 }
];

// 4. Fixed Savings - 特惠产品列表 (Special Offers)
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
        endDate: new Date(Date.now() + 29 * 24 * 3600 * 1000), 
        isStandard: false, 
        maxUserLimit: 1000000000, 
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
        endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000), 
        isStandard: false, 
        maxUserLimit: 1000000000, 
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
    },
    // 新增：无总额度限制（不展示进度条）的特殊产品
    { 
        id: 2029, 
        code: 'UNLIMITED-BONUS', 
        name: 'Weekend Bonus Offer', 
        rate: 18.0, 
        benchmarkRate: 14.0, 
        duration: 21, 
        minAmount: 5000, 
        totalSize: -1, // -1 表示无总额度限制
        remainingQuota: -1, 
        status: 'open', 
        endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000), // 5 days left
        isStandard: false, 
        maxUserLimit: 500000, // 单个用户仍可以有限额
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
    { id: '1200067054', name: 'test merchant', balance: 27353, method: 'Balance', selected: false, isNew: true },
    { id: '1200067056', name: 'new branch', balance: 13918.8, method: 'Balance', selected: false, isNew: true },
    { id: '1200134929', name: 'test merchant 222', balance: 50, method: 'Sweep-cash', selected: false, isNew: true },
    { id: '1200067060', name: 'test new branch33333333', balance: 0, method: 'Balance', selected: false, isNew: true },
    { id: '1200135484', name: 'test merhcant iiiii', balance: 0, method: 'Balance', selected: false, isNew: true },
    { id: '1200136099', name: 'xiaoshuang', balance: 9.49, method: 'Balance', selected: false, isNew: true }
];

// 5.1 Branch OWealth - 分支活期列表（隔离模式下拆 Principal / Interest）
export const MOCK_BRANCH_OWEALTH_LIST = [
    { id: '1100000003', name: 'OPAY DIGITAL SERVICES LIMITED', owealthBalance: 4024.35, principalBalance: 3337.10, interestBalance: 687.25, yesterdayInterest: 0.47, totalInterest: 698.06 },
    { id: '1200000172', name: 'test merchant 001', owealthBalance: 120.00, principalBalance: 100.00, interestBalance: 20.00, yesterdayInterest: 0.02, totalInterest: 20.00 },
    { id: '1200000575', name: 'SELECT ALL', owealthBalance: 100.73, principalBalance: 100.73, interestBalance: 0, yesterdayInterest: 0, totalInterest: 0 },
    { id: '2200394013', name: 'ONE1029001', owealthBalance: 0, principalBalance: 0, interestBalance: 0, yesterdayInterest: 0, totalInterest: 0 },
    { id: '1200000008', name: 'New Michael Branch', owealthBalance: 0, principalBalance: 0, interestBalance: 0, yesterdayInterest: 0, totalInterest: 0 },
    { id: '1200000010', name: 'michael test', owealthBalance: 56.20, principalBalance: 50.00, interestBalance: 6.20, yesterdayInterest: 0.01, totalInterest: 6.20 },
    { id: '2200394015', name: 'ONE1031', owealthBalance: 0, principalBalance: 0, interestBalance: 0, yesterdayInterest: 0, totalInterest: 0 },
    { id: '1200426151', name: 'TWO1030', owealthBalance: 880.50, principalBalance: 800.00, interestBalance: 80.50, yesterdayInterest: 0.11, totalInterest: 80.50 },
    { id: '1200136099', name: 'xiaoshuang', owealthBalance: 9.49, principalBalance: 9.49, interestBalance: 0, yesterdayInterest: 0, totalInterest: 0 }
];
