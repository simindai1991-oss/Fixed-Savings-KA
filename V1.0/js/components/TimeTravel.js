import { formatDateTime } from '../utils.js';

export default {
    props: ['currentTime'],
    template: `
    <div class="debug-panel">
        <div class="flex justify-between items-center mb-3">
            <div class="font-bold text-green-400"><i class="fa-solid fa-bug mr-1"></i>Time Travel</div>
            <button @click="$emit('update:time', new Date())" class="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded hover:bg-red-500/40">Reset</button>
        </div>
        <div class="mb-3 text-gray-300 font-mono text-center bg-black/30 py-2 rounded border border-gray-700">
            {{ formatDateTime(currentTime) }}
        </div>
        <div class="grid grid-cols-3 gap-2">
            <button @click="advance(1)" class="bg-gray-700 hover:bg-gray-600 px-1 py-2 rounded text-[10px]">+1 Day</button>
            <button @click="advance(7)" class="bg-gray-700 hover:bg-gray-600 px-1 py-2 rounded text-[10px]">+7 Days</button>
            <button @click="advance(30)" class="bg-gray-700 hover:bg-gray-600 px-1 py-2 rounded text-[10px]">+30 Days</button>
        </div>
        <div class="mt-3 text-[10px] text-gray-500 leading-tight">
            * Advancing time affects maturity, liquidation processing, and offer expiry.
        </div>
    </div>
    `,
    setup(props, { emit }) {
        const advance = (days) => {
            const newDate = new Date(props.currentTime);
            newDate.setDate(newDate.getDate() + days);
            emit('update:time', newDate);
        };
        return { advance, formatDateTime };
    }
}