import {defineStore} from "pinia";
import {computed, ref} from "vue";
import type {IAyar} from "../types/inventory.ts";
import inventoryService from "../services/inventoryService.ts";

export const useSettingsStore = defineStore("settings", () => {
    const sistemAyarlari = ref<Array<IAyar>>([]);
    const anasayfaAyarlari = ref<Array<IAyar>>([]);
    const urunAyarlari = ref<Array<IAyar>>([]);
    const loaded = ref(false);

    const indirimOranlari = computed(()=>[
        Number(getAyarByKey("indirim_oran_1")),
        Number(getAyarByKey("indirim_oran_2")),
        Number(getAyarByKey("indirim_oran_3"))
    ]);

    function getAyarByKey(key: string): string|null {
        const allSettings = [
            ...sistemAyarlari.value,
            ...anasayfaAyarlari.value,
            ...urunAyarlari.value
        ];
        const settings = allSettings.find(s => s.anahtar === key);
        return settings ? settings.deger : null;
    }

    async function loadAllSettings() {
        try {
            const sistemAyarlariRes = await inventoryService.getAyarlar('sistem');
            const anasayfaAyarlariRes = await inventoryService.getAyarlar('anasayfa');
            const urunAyarlariRes = await inventoryService.getAyarlar('urun');
            sistemAyarlari.value = sistemAyarlariRes;
            anasayfaAyarlari.value = anasayfaAyarlariRes;
            urunAyarlari.value = urunAyarlariRes;
            loaded.value = true;
        } catch (error) {
            console.error('Ayarlar yüklenirken hata oluştu:', error);
        }
    }

    async function updateSetting(key: string, value: string) {
        try {
            await inventoryService.setAyar(key, value);
            await loadAllSettings();
        } catch (error) {
            console.error(`Ayar güncellenirken hata oluştu (${key}):`, error);
        }
    }

    return {
        // state
        sistemAyarlari,
        anasayfaAyarlari,
        urunAyarlari,
        loaded,
        // getters
        indirimOranlari,
        // actions
        getAyarByKey,
        loadAllSettings,
        updateSetting
    };
});