const { ref } = Vue;

export default {
    template: `
    <div class="fade-in flex flex-col h-full items-center justify-center py-10">
        <!-- Hero Section -->
        <div class="text-center mb-10">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Grow Your Wealth with OPay</h1>
            <p class="text-gray-500">Choose the plan that fits your cashflow. Flexible daily interest or high fixed returns.</p>
        </div>

        <!-- Product Comparison Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-10 px-4">
            
            <!-- OWealth Card -->
            <div class="bg-white rounded-2xl p-8 border-2 border-transparent hover:border-blue-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                <div class="absolute top-0 right-0 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-bl-lg">Flexible</div>
                <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl mb-6 group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-wallet"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">OWealth</h3>
                <div class="text-3xl font-extrabold text-blue-600 mb-4">5% <span class="text-sm font-normal text-gray-400">p.a.</span></div>
                <ul class="space-y-3 text-sm text-gray-600">
                    <li class="flex items-center"><i class="fa-solid fa-check text-green-500 mr-2"></i> Use it like your regular balance</li>
                    <li class="flex items-center"><i class="fa-solid fa-check text-green-500 mr-2"></i> Interests paid DAILY</li>
                    <li class="flex items-center"><i class="fa-solid fa-check text-green-500 mr-2"></i> Deposit & withdraw anytime</li>
                </ul>
            </div>

            <!-- Fixed Savings Card (样式调整：去掉绿色边框，保持风格统一) -->
            <div class="bg-white rounded-2xl p-8 border-2 border-transparent hover:border-green-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                <div class="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">High Yield</div>
                <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl mb-6 group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-piggy-bank"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Fixed Savings</h3>
                <div class="text-3xl font-extrabold text-green-600 mb-4">Up to 15% <span class="text-sm font-normal text-gray-400">p.a.</span></div>
                <ul class="space-y-3 text-sm text-gray-600">
                    <li class="flex items-center"><i class="fa-solid fa-check text-green-500 mr-2"></i> Massive returns for locked funds</li>
                    <li class="flex items-center"><i class="fa-solid fa-check text-green-500 mr-2"></i> Duration: 7 days to 1 year</li>
                    <li class="flex items-center"><i class="fa-solid fa-check text-green-500 mr-2"></i> Longer duration = Higher rate</li>
                </ul>
            </div>
        </div>

        <!-- Action Section -->
        <div class="text-center w-full max-w-md">
            <div class="flex items-center justify-center gap-2 mb-6">
                <input type="checkbox" id="agree" v-model="isChecked" class="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer">
                <label for="agree" class="text-sm text-gray-500 select-none cursor-pointer">
                    I have read and agree to the <span class="text-green-600 hover:underline">Terms & Conditions</span> and <span class="text-green-600 hover:underline">Privacy Policy</span>
                </label>
            </div>

            <button @click="openAccount" 
                    :disabled="!isChecked || isProcessing"
                    class="w-full bg-opay text-white py-4 rounded-full font-bold text-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-200">
                <span v-if="!isProcessing">Get Interest Now</span>
                <span v-else><i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Opening...</span>
            </button>
        </div>
    </div>
    `,
    setup() {
        const isChecked = ref(false);
        const isProcessing = ref(false);

        const openAccount = () => {
            isProcessing.value = true;
            setTimeout(() => {
                isProcessing.value = false;
                // 模拟开户成功
                alert('开户申请提交流程与原来一致，跳转去开户流程即可。');
            }, 1500);
        };

        return {
            isChecked,
            isProcessing,
            openAccount
        };
    }
}