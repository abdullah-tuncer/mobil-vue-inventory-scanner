import {createApp} from 'vue'
import App from './App.vue'
import store from './store';
import router from './router'
import inventoryService from "./services/inventoryService.ts";
import initVuetify from "./plugins/vuetify";

const app = createApp(App).use(router).use(store);

inventoryService.initializeDatabase().then(() => {
    store.dispatch("settings/loadAllSettings").then(()=>{
        let data = store.getters["settings/getSistemAyarlari"];
        const settings = {
            tema: data.find((v: any) => v.anahtar == "tema")?.deger ?? "dark",
            mobil_tablo: data.find((v: any) => v.anahtar == "tablo_gorunumu")?.deger == "mobil"
        }
        app.use(initVuetify(settings));
        app.mount('#app');
    });
})