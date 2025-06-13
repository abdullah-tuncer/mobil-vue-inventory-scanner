import {createApp} from 'vue'
import App from './App.vue'
import {createPinia} from "pinia";
import router from './router'
import inventoryService from "./services/inventoryService.ts";
import initVuetify from "./plugins/vuetify";
import 'vue3-toastify/dist/index.css';
import Vue3Toastify, {type ToastContainerOptions} from 'vue3-toastify';
import {SplashScreen} from "@capacitor/splash-screen";
import {useSettingsStore} from "./store/settingsStore.ts";

const pinia = createPinia();
const app = createApp(App).use(router).use(pinia);
const settingsStore = useSettingsStore();

inventoryService.initializeDatabase().then(() => {
    settingsStore.loadAllSettings().then(async () => {
        let data = settingsStore.sistemAyarlari;
        const theme = data.find((v: any) => v.anahtar == "tema")?.deger ?? "dark";
        const settings = {
            tema: theme,
            mobil_tablo: data.find((v: any) => v.anahtar == "tablo_gorunumu")?.deger == "mobil"
        }
        app.use(initVuetify(settings));
        app.use(Vue3Toastify, {
            theme: theme,
            autoClose: 3000,
            position: "top-center",
            transition: "slide"
        } as ToastContainerOptions);
        app.mount('#app');
        await SplashScreen.hide();
    });
})