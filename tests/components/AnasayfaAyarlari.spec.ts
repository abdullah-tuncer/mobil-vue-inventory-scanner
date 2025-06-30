import {beforeEach, describe, expect, it, vi} from "vitest";
import {createPinia, setActivePinia} from "pinia";
import {mount} from "@vue/test-utils";
import AnasayfaAyarlari from "../../src/components/AnasayfaAyarlari.vue";
import {useSettingsStore} from "../../src/store/settingsStore";
import {nextTick} from "vue";
import {VBtn, VTextField} from "vuetify/components";

describe("AnasayfaAyarlari.vue", ()=>{
    beforeEach(() => {
        setActivePinia(createPinia());
        const settingsStore = useSettingsStore();
        settingsStore.getAyarByKey = vi.fn().mockImplementation((key) => {
            if (key == "sirket_adi")
                return "Test Şirket Ad";
            else if (key == "sirket_aciklama")
                return "Test Şirket Açıklama";
            else if (key == "sirket_liste")
                return '["Test1","Test2"]';
            else
                return null;
        });
        settingsStore.updateSetting = vi.fn();
    })

    it("Şirket Adı doğru şekilde gelir", ()=>{
        const wrapper = mount(AnasayfaAyarlari);
        expect(wrapper.find("[data-test='sirket-ad'] input").attributes("value")).toContain("Test Şirket Ad");
    })

    it("Şirket Adı doğru şekilde değiştirilir", async ()=>{
        const settingsStore = useSettingsStore();
        const wrapper = mount(AnasayfaAyarlari);
        const sirketAdInput = wrapper.find("[data-test='sirket-ad'] input");
        await sirketAdInput.setValue("Değiştirilmiş Şirket Adı");
        await nextTick();
        expect(settingsStore.updateSetting).toHaveBeenCalled();
        expect(settingsStore.updateSetting).toHaveBeenCalledWith('sirket_adi', 'Değiştirilmiş Şirket Adı');
    })

    it("Şirket Açıklaması doğru şekilde gelir", ()=>{
        const wrapper = mount(AnasayfaAyarlari);
        expect(wrapper.find("[data-test='sirket-aciklama'] textarea").attributes("value")).toContain("Test Şirket Açıklama");
    })

    it("Şirket Açıklaması doğru şekilde değiştirilir", async ()=>{
        const settingsStore = useSettingsStore();
        const wrapper = mount(AnasayfaAyarlari);
        const sirketAciklamaInput = wrapper.find("[data-test='sirket-aciklama'] textarea");
        await sirketAciklamaInput.setValue("Değiştirişmiş Şirket Açıklaması");
        await nextTick();
        expect(settingsStore.updateSetting).toHaveBeenCalled();
        expect(settingsStore.updateSetting).toHaveBeenCalledWith('sirket_aciklama', "Değiştirişmiş Şirket Açıklaması");
    })

    it("Kopyalanabilir veya Paylaşılabilir Liste doğru şekilde listelenir", ()=>{
        const wrapper = mount(AnasayfaAyarlari);
        expect(wrapper.find(".v-list .v-list-item .v-list").html()).toContain("Test1");
        expect(wrapper.find(".v-list .v-list-item .v-list").html()).toContain("Test2");
    })

    it('Kopyalanabilir veya Paylaşılabilir Liste doğru şekilde yeni değer ekler', async () => {
        const settingsStore = useSettingsStore();
        const wrapper = mount(AnasayfaAyarlari);
        await wrapper.find(".v-list .v-list-item .v-list .v-list-item").findComponent(VTextField).setValue("Yeni Test Değeri");
        await wrapper.find(".v-list .v-list-item .v-list .v-list-item").findComponent(VBtn).trigger("click");
        expect(settingsStore.updateSetting).toHaveBeenCalled();
        expect(settingsStore.updateSetting).toHaveBeenCalledWith("sirket_liste",'["Test1","Test2","Yeni Test Değeri"]');
    });

    it('Kopyalanabilir veya Paylaşılabilir Liste doğru şekilde bir değeri siler', async () => {
        const settingsStore = useSettingsStore();
        const wrapper = mount(AnasayfaAyarlari);
        await wrapper.findAll(".v-list .v-list-item .v-list .v-list-item")[1].findComponent(VBtn).trigger("click");
        expect(settingsStore.updateSetting).toHaveBeenCalled();
        expect(settingsStore.updateSetting).toHaveBeenCalledWith("sirket_liste",'["Test2"]');
    })
})