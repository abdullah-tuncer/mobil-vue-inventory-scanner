import {beforeEach, describe, expect, it, vi} from "vitest";
import {flushPromises, mount} from "@vue/test-utils";
import UrunPicker from "../../src/components/UrunPicker.vue";
import {toast} from "vue3-toastify";
import inventoryService from "../../src/services/inventoryService";
import barkodTaramaService from "../../src/services/BarkodTaramaService";


vi.mock("../../src/services/inventoryService.ts", () => ({
    default: {
        getItems: vi.fn(),
        getUrunByBarkod: vi.fn().mockResolvedValue({id: 1, ad: "Ürün A"})
    },
    Tables: {
        URUNLER: "urunler"
    }
}))

describe("UrunPicker", () => {
    it("bileşen yüklendiğinde ürünleri çeker", async () => {
        const urunListesi = [
            {id: 1, ad: "Ürün A"},
            {id: 2, ad: "Ürün B"},
        ];
        // @ts-ignore
        vi.mocked(inventoryService.getItems).mockResolvedValue(urunListesi);
        const wrapper = mount(UrunPicker, {
            props: {rules: []},
        });

        await flushPromises();

        const items = wrapper.findComponent({name: "v-autocomplete"}).props("items");
        expect(items).toEqual(urunListesi);
    });

    it("barkod başarıyla tarandığında ürün seçilir", async () => {
        vi.mocked(inventoryService.getItems).mockResolvedValue([]);
        vi.mocked(barkodTaramaService.scanBarcode).mockResolvedValue({type: "test", data: "12345"});

        const wrapper = mount(UrunPicker, {
            props: {rules: []},
        });

        await flushPromises();

        await wrapper.find("i.mdi-barcode-scan").trigger("click");
        await flushPromises();

        expect(inventoryService.getUrunByBarkod).toHaveBeenCalledWith("12345");

        const selectedItem = wrapper.vm.selectedItem;
        expect(selectedItem).toEqual({id: 1, ad: "Ürün A"});
    });

    it("barkod bulunamazsa uyarı verir", async () => {
        vi.mocked(barkodTaramaService.scanBarcode).mockResolvedValue({type: "test", data: "notfound"});
        vi.mocked(inventoryService.getUrunByBarkod).mockResolvedValue(null);

        const wrapper = mount(UrunPicker, {props: {rules: []}});

        await wrapper.find("i.mdi-barcode-scan").trigger("click");
        await flushPromises();

        expect(toast.warning).toHaveBeenCalledWith("Bu barkoda sahip ürün bulunamadı");
    });

    it("hata durumunda toast error çağrılır", async () => {
        vi.mocked(barkodTaramaService.scanBarcode).mockRejectedValue(new Error("Tarama hatası"));

        const wrapper = mount(UrunPicker, {props: {rules: []}});

        await wrapper.find("i.mdi-barcode-scan").trigger("click");
        await flushPromises();

        expect(toast.error).toHaveBeenCalledWith("Tarama hatası");
    });
});
