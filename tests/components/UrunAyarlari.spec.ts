import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {createTestingPinia} from "@pinia/testing";
import {setActivePinia} from "pinia";
import {useSettingsStore} from "../../src/store/settingsStore";
import {flushPromises, mount} from "@vue/test-utils";
import UrunAyarlari from "../../src/components/UrunAyarlari.vue";
import inventoryService from "../../src/services/inventoryService";
import {nextTick} from "vue";

vi.mock("../../src/services/inventoryService.ts", () => ({
    default: {
        deletedUrunler: vi.fn().mockResolvedValue([
            {id: 1, ad: "Test Ürün1"},
            {id: 2, ad: "Test Ürün2"},
        ]),
        restoreUrun: vi.fn(),
    }
}))

describe("UrunAyarlari.vue", () => {
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
            if (key === "barkod_yazi_aktif") return "true";
            if (key === "barkod_yazi") return "TestBarkod";
            if (key === "indirim_oran_1") return "10";
            if (key === "indirim_oran_2") return "20";
            if (key === "indirim_oran_3") return "30";
            return null;
        });
        settingsStore.updateSetting = vi.fn();
    });

    afterEach(() => {
        document.body.innerHTML = "";
    })

    it("Barkod ayarlarını doğru şekilde gösterir ve bilgiler değiştirildiğinde günceller", async () => {
        const wrapper = mount(UrunAyarlari);
        const barkodChecbox = wrapper.find(".v-checkbox input");
        expect(barkodChecbox.attributes("value")).toContain("true");
        await barkodChecbox.setValue(false)
        expect(settingsStore.updateSetting).toHaveBeenCalledWith("barkod_yazi_aktif", "false");
        const barkodTextField = wrapper.find(".v-text-field input");
        expect(barkodTextField.attributes("value")).toContain("TestBarkod");
        await barkodTextField.setValue("DenemeBarkod")
        expect(settingsStore.updateSetting).toHaveBeenCalledWith("barkod_yazi", "DenemeBarkod");
    });

    it("İndirim butonu ayarlarını doğru şekilde gösterir ve bilgiler değiştirildiğinde günceller", async () => {
        const wrapper = mount(UrunAyarlari);
        const indirimInputs = wrapper.findAll(".v-number-input input");
        const indirimler = [["indirim_oran_1", "10"], ["indirim_oran_2", "20"], ["indirim_oran_3", "30"]];
        for (const [index, input] of indirimInputs.entries()) {
            expect(input.attributes("value")).toContain(indirimler[index][1]);
            await input.setValue("50");
            expect(settingsStore.updateSetting).toHaveBeenCalledWith(indirimler[index][0], "50");
        }
    });

    it('Geri Dönüşüm Kutusuna tıklanır ve silinen ürünler getirilir', async () => {
        const wrapper = mount(UrunAyarlari, {attachTo: document.body});
        await wrapper.find("i.mdi-delete").trigger("click");
        await flushPromises();
        const table = document.querySelector(".v-dialog .v-data-table tbody");
        expect(table.querySelectorAll("tr").length).toBe(2);
        expect(table.innerHTML).toContain("Test Ürün1");
        expect(table.innerHTML).toContain("Test Ürün2");
    });

    it('Geri Dönüşüm Kutusundan ürün geri alınır ve dialog kapatılır', async () => {
        const wrapper = mount(UrunAyarlari, {attachTo: document.body});
        await wrapper.find("i.mdi-delete").trigger("click");
        await flushPromises();
        const table = document.querySelector(".v-dialog .v-data-table tbody");
        table.querySelector("tr button").dispatchEvent(new MouseEvent("click"));
        expect(inventoryService.restoreUrun).toHaveBeenCalledWith(1);
        expect(inventoryService.deletedUrunler).toHaveBeenCalled();
        document.querySelector(".v-dialog .v-card-actions button").dispatchEvent(new MouseEvent("click", {bubbles: true}));
        await nextTick();
        // @ts-ignore
        expect(document.querySelector(".v-dialog .v-overlay__content").style.display).toBe("none");
    });
})