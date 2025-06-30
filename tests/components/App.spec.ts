import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount, flushPromises} from '@vue/test-utils'
import {createRouter, createWebHistory} from 'vue-router'
import {createPinia, setActivePinia} from 'pinia'
import App from '../../src/App.vue'
import {useScannerStore} from '../../src/store/scannerStore'
import {useSettingsStore} from '../../src/store/settingsStore'
import {NavLocation} from '../../src/router'
import {nextTick} from "vue";

// Basit bir router oluşturalım
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Anasayfa',
            component: {template: '<div>Anasayfa</div>'},
            meta: {navLocation: NavLocation.ANASAYFA}
        },
        {
            path: '/ayarlar',
            name: 'Ayarlar',
            component: {template: '<div>Ayarlar</div>'},
            meta: {navLocation: NavLocation.AYARLAR}
        },
        {
            path: '/envanter',
            name: 'Envanter',
            component: {template: '<div>Envanter</div>'},
            meta: {navLocation: NavLocation.ENVANTER}
        },
        {
            path: '/satis',
            name: 'Satis',
            component: {template: '<div>Satis</div>'},
            meta: {navLocation: NavLocation.SATIS}
        }
    ]
})

describe('App.vue', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        const store = useSettingsStore();
        store.getAyarByKey = vi.fn().mockImplementation((key) => {
            if (key === 'tema') return 'light';
            return null;
        });
    })

    it('tema değerini store\'dan alır', async () => {
        const wrapper = mount(App, {
            global: {
                plugins: [router]
            }
        })
        await flushPromises();
        console.log(wrapper.vm.theme);
        expect(wrapper.vm.theme).toBe('light');
    })

    it('tarama durumuna göre doğru bileşenleri gösterir', async () => {
        const scannerStore = useScannerStore();
        const wrapper = mount(App, {
            global: {
                plugins: [router]
            }
        });
        expect(wrapper.find('.v-container').exists()).toBe(true);
        expect(wrapper.find('.scanner-container').exists()).toBe(true);
        expect(wrapper.find('.scanner-container').attributes('style')).toContain('display: none');
        scannerStore.startScanning();
        await nextTick();
        expect(wrapper.find('.v-container').attributes('style')).toContain('display: none');
        expect(wrapper.find('.scanner-container').attributes('style')).not.toContain('display: none');
    })

    it('taramayı durdur butonuna tıklandığında tarama durdurulur', async () => {
        const scannerStore = useScannerStore();
        const wrapper = mount(App, {
            global: {
                plugins: [router]
            }
        });
        scannerStore.startScanning();
        await flushPromises();
        await wrapper.find('.scanner-container .v-btn').trigger('click');
        const barkodTaramaService = (await import('../../src/services/BarkodTaramaService')).default;
        expect(barkodTaramaService.stopContinuousScan).toHaveBeenCalled();
        expect(scannerStore.getIsScanning).toBe(false);
    })

    it('route değiştiğinde activeTab değeri güncellenir', async () => {
        const wrapper = mount(App, {
            global: {
                plugins: [router, createPinia()]
            }
        });
        expect(wrapper.vm.activeTab).toBe(NavLocation.ANASAYFA);
        await router.push('/ayarlar');
        await flushPromises();
        expect(wrapper.vm.activeTab).toBe(NavLocation.AYARLAR);
    })

    it.each([
        ["/ayarlar", 0],
        ["/envanter", 1],
        ["/", 2],
        ["/satis", 3]
    ])('$1 . indexli bottom navigation buton $0 rotasına yönlendirir', async (path, index) => {
        const wrapper = mount(App, {
            global: {
                plugins: [router, createPinia()]
            }
        });
        await wrapper.findAll('.v-bottom-navigation .v-btn')[index].trigger('click');
        await flushPromises();
        expect(router.currentRoute.value.path).toBe(path);
    })
})