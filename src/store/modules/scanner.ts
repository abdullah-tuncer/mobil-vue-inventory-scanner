export default {
  namespaced: true,
  state: {
    isScanning: false
  },
  mutations: {
    SET_SCANNING(state: any, value: boolean) {
      state.isScanning = value;
    }
  },
  actions: {
    startScanning({ commit }: any) {
      commit('SET_SCANNING', true);
    },
    stopScanning({ commit }: any) {
      commit('SET_SCANNING', false);
    }
  },
  getters: {
    isScanning: (state: any) => state.isScanning
  }
};