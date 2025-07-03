import {beforeEach, describe, expect, it, vi} from "vitest";
import {createTestingPinia} from "@pinia/testing";
import {setActivePinia} from "pinia";
import {useSettingsStore} from "../../src/store/settingsStore";
import {flushPromises, mount} from "@vue/test-utils";
import SistemAyarlari from "../../src/components/SistemAyarlari.vue";

describe("SistemAyarlari.vue", () => {
    let settingsStore: ReturnType<typeof useSettingsStore>;

    beforeEach(() => {
        setActivePinia(
            createTestingPinia({
                stubActions: false,
                createSpy: vi.fn
            })
        );

        settingsStore = useSettingsStore();
        settingsStore.getAyarByKey = vi.fn((key) => {
            if (key === "tema") return "dark";
            if (key === "tablo_gorunumu") return "varsayilan";
            return null;
        });
        settingsStore.updateSetting = vi.fn();
    });

    it("Tema Switchi temayı doğru şekilde gösterir", () => {
        const wrapper = mount(SistemAyarlari);
        const switchler = wrapper.findAll("input");
        expect(switchler[0].attributes()).toHaveProperty("checked");
    });

    it("Tema Switchine tıklandığında tema değişir", async () => {
        const wrapper = mount(SistemAyarlari);
        const switchler = wrapper.findAll("input");
        await switchler[0].setValue(false);
        await flushPromises();
        expect(settingsStore.updateSetting).toHaveBeenCalled();
        expect(settingsStore.updateSetting).toHaveBeenCalledWith("tema", "light");
    });

    it("Tablo görünüm Switchi tablo görünümünü doğru şekilde gösterir", () => {
        const wrapper = mount(SistemAyarlari);
        const switchler = wrapper.findAll("input");
        expect(switchler[1].attributes()).not.toHaveProperty("checked");
    });

    it("Tablo görünüm Switchine tıklandığında tablo görünümü değişir", async () => {
        const wrapper = mount(SistemAyarlari);
        const switchler = wrapper.findAll("input");
        await switchler[1].setValue(true);
        await flushPromises();
        expect(settingsStore.updateSetting).toHaveBeenCalled();
        expect(settingsStore.updateSetting).toHaveBeenCalledWith("tablo_gorunumu", "mobil");
    });
})