import inventoryService from "../../services/inventoryService.ts";
import type {IAyar} from "../../types/inventory.ts";

interface SettingsState {
  sistemAyarlari: IAyar[];
  anasayfaAyarlari: IAyar[];
  urunAyarlari: IAyar[];
  loaded: boolean;
}

const state: SettingsState = {
  sistemAyarlari: [],
  anasayfaAyarlari: [],
  urunAyarlari: [],
  loaded: false
};

const getters = {
  getAyarByKey: (state: SettingsState) => (key: string): string | null => {
    // Tüm ayar gruplarını birleştir ve anahtara göre ara
    const allSettings = [
      ...state.sistemAyarlari,
      ...state.anasayfaAyarlari,
      ...state.urunAyarlari
    ];
    const setting = allSettings.find(s => s.anahtar === key);
    return setting ? setting.deger : null;
  },
  
  getSistemAyarlari: (state: SettingsState) => state.sistemAyarlari,
  getAnasayfaAyarlari: (state: SettingsState) => state.anasayfaAyarlari,
  getUrunAyarlari: (state: SettingsState) => state.urunAyarlari,
  isLoaded: (state: SettingsState) => state.loaded
};

const actions = {
  async loadAllSettings({ commit }: any) {
    try {
      const sistemAyarlari = await inventoryService.getAyarlar('sistem');
      const anasayfaAyarlari = await inventoryService.getAyarlar('anasayfa');
      const urunAyarlari = await inventoryService.getAyarlar('urun');
      
      commit('SET_SISTEM_AYARLARI', sistemAyarlari);
      commit('SET_ANASAYFA_AYARLARI', anasayfaAyarlari);
      commit('SET_URUN_AYARLARI', urunAyarlari);
      commit('SET_LOADED', true);
    } catch (error) {
      console.error('Ayarlar yüklenirken hata oluştu:', error);
    }
  },

  // @ts-ignore
  async updateSetting({ commit, dispatch }: any, { key, value }: { key: string, value: string }) {
    try {
      await inventoryService.setAyar(key, value);
      // Ayarları tekrar yükle
      await dispatch('loadAllSettings');
    } catch (error) {
      console.error(`Ayar güncellenirken hata oluştu (${key}):`, error);
    }
  }
};

const mutations = {
  SET_SISTEM_AYARLARI(state: SettingsState, ayarlar: IAyar[]) {
    state.sistemAyarlari = ayarlar;
  },
  SET_ANASAYFA_AYARLARI(state: SettingsState, ayarlar: IAyar[]) {
    state.anasayfaAyarlari = ayarlar;
  },
  SET_URUN_AYARLARI(state: SettingsState, ayarlar: IAyar[]) {
    state.urunAyarlari = ayarlar;
  },
  SET_LOADED(state: SettingsState, loaded: boolean) {
    state.loaded = loaded;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};