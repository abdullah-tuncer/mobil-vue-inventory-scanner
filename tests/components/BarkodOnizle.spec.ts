import {afterEach, beforeEach, describe, expect, it, Mock, vi} from "vitest";
import {flushPromises, mount} from "@vue/test-utils";
import BarkodOnizle from "../../src/components/BarkodOnizle.vue";
import {createPinia, setActivePinia} from "pinia";
import {useSettingsStore} from "../../src/store/settingsStore";
import {BarkodOlusturucu} from "../../src/services/BarkodOlusturucu";

const mockCokluBarkodPdfIndir = vi.fn().mockResolvedValue(undefined);
const mockSayfayaSigacakBarkodPdfIndir = vi.fn().mockResolvedValue(undefined);

vi.mock("../../src/services/BarkodOlusturucu.ts", () => ({
    BarkodOlusturucu: vi.fn().mockImplementation(() => ({
        barkodCanvas: document.createElement('canvas'),
        barkodGenislikMm: 10,
        barkodYukseklikMm: 10,
        barkodInit: vi.fn().mockReturnValue(document.createElement('canvas')),
        cokluBarkodPdfIndir: mockCokluBarkodPdfIndir,
        sayfayaSigacakBarkodPdfIndir: mockSayfayaSigacakBarkodPdfIndir
    }))
}))

describe("BarkodOnizle.vue", () => {
    const props = {
        barkodData: "111100001111",
        barkodType: "Test"
    }

    beforeEach(() => {
        setActivePinia(createPinia());
        const settingsStore = useSettingsStore();
        settingsStore.getAyarByKey = vi.fn();
    })

    afterEach(() => {
        document.body.innerHTML = "";
    })

    it('dialog açıldığında barkod oluşur ve ölçüleri getirilir', async () => {
        const wrapper = mount(BarkodOnizle, {
            props,
            attachTo: document.body
        });
        await wrapper.find("i").trigger("click");
        expect(BarkodOlusturucu).toHaveBeenCalled();
        expect(document.querySelector(".v-dialog #barkodContainer").innerHTML).toContain("<canvas>");
        expect(document.querySelector(".v-dialog #barkodOlculeri").textContent).toContain("10x10 mm");
    });

    it('boyut değişikliği sonrası yeni barkod oluşur ve ölçüleri getirilir', async () => {
        const wrapper = mount(BarkodOnizle, {
            props,
            attachTo: document.body
        });
        await wrapper.find("i").trigger("click");
        document.querySelector('.v-radio-group input[value="small"]').dispatchEvent(new MouseEvent("click"));
        expect(BarkodOlusturucu).toHaveBeenCalled();
    });

    it('yazı görünürlüğü değişikliği sonrası yeni barkod oluşur ve ölçüleri getirilir', async () => {
        const wrapper = mount(BarkodOnizle, {
            props,
            attachTo: document.body
        });
        await wrapper.find("i").trigger("click");
        document.querySelector('.v-checkbox input').dispatchEvent(new MouseEvent("click"));
        expect(BarkodOlusturucu).toHaveBeenCalled();
    });

    it('adet değişikliği sonrası istenilen adet kadar barkod oluşturulur', async () => {
        const wrapper = mount(BarkodOnizle, {
            props,
            attachTo: document.body
        });
        await wrapper.find("i").trigger("click");
        document.querySelector('.v-checkbox input').setAttribute("value", "10");
        document.querySelector('button[data-test="adetIndir"]').dispatchEvent(new MouseEvent("click"));
        expect(mockCokluBarkodPdfIndir).toHaveBeenCalled();
    });

    it('sayfaya sığacak kadar barkod indir', async () => {
        const wrapper = mount(BarkodOnizle, {
            props,
            attachTo: document.body
        });
        await wrapper.find("i").trigger("click");
        document.querySelector('button[data-test="fullIndir"]').dispatchEvent(new MouseEvent("click"));
        expect(mockSayfayaSigacakBarkodPdfIndir).toHaveBeenCalled();
    });
})