import {defineStore} from "pinia";
import {computed, ref} from "vue";

export const useScannerStore = defineStore("scanner", () => {
    const isScanning = ref(false);
    const getIsScanning = computed(() => isScanning.value);

    function startScanning() {
        isScanning.value = true;
    }

    function stopScanning() {
        isScanning.value = false;
    }

    return {isScanning, getIsScanning, startScanning, stopScanning};
})