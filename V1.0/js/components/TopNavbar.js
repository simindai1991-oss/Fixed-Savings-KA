export default {
    template: `
    <div class="h-[60px] bg-white border-b border-[#e6e6e6] flex items-center justify-between px-5 shadow-sm z-20 shrink-0">
        <div class="flex items-center">
            <span class="text-3xl font-bold text-opay mr-1">O</span>
            <span class="text-3xl font-bold text-gray-800">Pay</span>
        </div>
        <div class="flex items-center gap-3">
            <button class="px-3 py-1.5 rounded text-xs font-medium text-white bg-[#2ebea6]">Go Online MD</button>
            <button class="px-3 py-1.5 rounded text-xs font-medium text-white bg-opay"><i class="fa-regular fa-gem mr-1"></i> KA VVIP</button>
            <button class="px-3 py-1.5 rounded text-xs font-medium text-white bg-opay"><i class="fa-solid fa-headset mr-1"></i> Opay Manager</button>
            <i class="fa-solid fa-clipboard-list text-lg text-opay ml-2 cursor-pointer" title="Orders"></i>
            <i class="fa-regular fa-bell text-lg text-opay cursor-pointer" title="Notifications"></i>
            <div class="flex items-center ml-4 border-l pl-4 h-8">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-2">OD</div>
                <span class="text-xs text-gray-600 font-medium truncate max-w-[120px]">OPAY DIGITAL SERVICES LIMITED</span>
            </div>
        </div>
    </div>
    `
}