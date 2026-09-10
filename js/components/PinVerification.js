const { ref, watch, nextTick } = Vue;

/**
 * Mock Employees Payment PIN Verification — layout aligned to product modal.
 * Confirm always passes (DEMO).
 */
export default {
    name: 'PinVerification',
    props: {
        modelValue: { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'confirm', 'cancel'],
    template: `
    <div v-if="modelValue" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-4" @click.self="handleCancel">
        <div class="bg-white rounded-md shadow-[0_8px_28px_rgba(0,0,0,0.18)] w-[520px] max-w-full relative overflow-hidden"
             role="dialog" aria-modal="true">
            <!-- Header -->
            <div class="h-14 px-6 flex items-center justify-between border-b border-[#f0f0f0]">
                <span class="text-[16px] font-medium text-[#1f2937] leading-none">Employees Payment PIN Verification</span>
                <button type="button"
                        class="w-8 h-8 flex items-center justify-center text-[#9ca3af] hover:text-[#6b7280] text-xl leading-none"
                        aria-label="Close"
                        @click="handleCancel">×</button>
            </div>

            <!-- Body: label / input / forgot — centered column -->
            <div class="px-10 pt-12 pb-8 flex flex-col items-center">
                <div class="text-[14px] text-[#374151] mb-3 text-center leading-none">
                    Employees Payment PIN <span class="text-[#ff4d4f]">*</span>
                </div>
                <input ref="pinInput"
                       type="password"
                       inputmode="numeric"
                       autocomplete="one-time-code"
                       maxlength="12"
                       :value="pin"
                       @input="onPinInput"
                       @keydown.enter.prevent="handleConfirm"
                       placeholder="Numbers only"
                       class="w-[300px] max-w-full h-10 border border-[#d9d9d9] rounded-[4px] px-3 text-[14px] text-center text-[#1f2937] placeholder:text-[#bfbfbf] outline-none focus:border-[#27B665] focus:shadow-[0_0_0_2px_rgba(39,182,101,0.15)] transition-shadow">
                <button type="button"
                        class="mt-3 text-[14px] text-[#27B665] hover:text-[#219e56] leading-none"
                        @click="onForgot">
                    Forgot Employees Payment PIN
                </button>
            </div>

            <!-- Footer: Cancel left / Confirm right -->
            <div class="px-6 pb-6 flex items-center justify-between">
                <button type="button"
                        class="text-[14px] text-[#27B665] hover:text-[#219e56] font-normal px-1 py-1"
                        @click="handleCancel">
                    Cancel
                </button>
                <button type="button"
                        class="min-w-[96px] h-9 px-5 rounded-[4px] bg-[#27B665] hover:bg-[#219e56] text-white text-[14px] font-medium transition-colors"
                        @click="handleConfirm">
                    Confirm
                </button>
            </div>
        </div>
    </div>
    `,
    setup(props, { emit }) {
        const pin = ref('');
        const pinInput = ref(null);

        watch(() => props.modelValue, async (open) => {
            if (open) {
                pin.value = '';
                await nextTick();
                pinInput.value && pinInput.value.focus();
            }
        });

        const onPinInput = (e) => {
            pin.value = String(e.target.value || '').replace(/\D/g, '').slice(0, 12);
            e.target.value = pin.value;
        };

        const close = () => emit('update:modelValue', false);

        const handleCancel = () => {
            close();
            emit('cancel');
        };

        const handleConfirm = () => {
            const value = pin.value;
            close();
            emit('confirm', value);
        };

        const onForgot = () => {
            if (window.ElementPlus && window.ElementPlus.ElMessage) {
                window.ElementPlus.ElMessage({
                    message: 'Please contact HQ Admin to reset Employees Payment PIN. (DEMO)',
                    type: 'info',
                    offset: 60
                });
            }
        };

        return { pin, pinInput, onPinInput, handleCancel, handleConfirm, onForgot };
    }
};
