import { createStore } from 'vuex';
import settings from './modules/settings';
import scanner from './modules/scanner';

export default createStore({
  modules: {
    settings,
    scanner
  }
});