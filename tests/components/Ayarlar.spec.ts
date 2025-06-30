import {describe, expect, it} from "vitest";
import {mount} from "@vue/test-utils";
import Ayarlar from "../../src/components/Ayarlar.vue";
import SistemAyarlari from "../../src/components/SistemAyarlari.vue";
import AnasayfaAyarlari from "../../src/components/AnasayfaAyarlari.vue";
import UrunAyarlari from "../../src/components/UrunAyarlari.vue";
import {createPinia} from "pinia";

describe("Ayarlar.vue", ()=>{
    it('should ', () => {
        const wrapper = mount(Ayarlar,{
            global:{plugins:[createPinia()]}
        });
        expect(wrapper.findComponent(SistemAyarlari).exists()).toBe(true);
        expect(wrapper.findComponent(AnasayfaAyarlari).exists()).toBe(true);
        expect(wrapper.findComponent(UrunAyarlari).exists()).toBe(true);
    });
})