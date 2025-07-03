import {beforeEach, describe, expect, it, vi} from "vitest";
import {mount} from "@vue/test-utils";
import UrunDuzenle from "../../src/components/UrunDuzenle.vue";
import {createTestingPinia} from "@pinia/testing";
import {setActivePinia} from "pinia";
import {useSettingsStore} from "../../src/store/settingsStore";
import inventoryService, {Tables} from "../../src/services/inventoryService";
import barkodTaramaService from "../../src/services/BarkodTaramaService";
import {toast} from "vue3-toastify";
import {VBtn, VBtnToggle} from "vuetify/components";

vi.mock("../../src/services/inventoryService.ts", () => ({
    default: {
        updateItem: vi.fn(),
        deleteItem: vi.fn(),
        addItem: vi.fn()
    },
    Tables: {
        URUNLER: "urunler",
        BARKODLAR: "barkodlar"
    }
}))

describe("UrunDuzenle.vue", () => {
    let model, urun = undefined;
    let pinia: ReturnType<typeof createTestingPinia>;

    beforeEach(() => {
        pinia = createTestingPinia({
            stubActions: false,
            createSpy: vi.fn,
        });
        setActivePinia(pinia);
        const settingsStore = useSettingsStore();
        // @ts-ignore
        settingsStore.indirimOranlari = [10, 20, 30];
        model = {
            "id": 1,
            "ad": "Test Ürün 1",
            "aciklama": "Test açıklama22",
            "fiyat": 50,
            "indirimli_fiyat": null,
            "minMaxStok": 0,
            "minStok": 0,
            "maxStok": 1,
            "created_at": "2025-06-28 05:53:39",
            "updated_at": null,
            "is_deleted": 0,
            "barkodlar": [{
                "id": 1,
                "urun_id": 1,
                "data": "1-1751355081897",
                "type": "CODE_128",
                "created_at": "2025-07-01T07:31:22.577Z",
                "isDeleted": false
            }]
        };
        urun = {
            "id": 1,
            "ad": "Test Ürün 1",
            "aciklama": "Test açıklama22",
            "fiyat": 50,
            "indirimli_fiyat": null,
            "minMaxStok": 0,
            "minStok": 0,
            "maxStok": 1,
            "created_at": "2025-06-28 05:53:39",
            "updated_at": null,
            "is_deleted": 0,
            "barkodlar": [{
                "id": 1,
                "urun_id": 1,
                "data": "1-1751355081897",
                "type": "CODE_128",
                "created_at": "2025-07-01T07:31:22.577Z"
            }]
        };
    })

    it("Ürün bilgileri ilgili alanlara girilir", () => {
        const wrapper = mount(UrunDuzenle, {
            global: {plugins: [pinia]},
            props: {modelValue: model, urun: urun}
        });
        const inputs = wrapper.findAll(".v-field__input");
        expect(inputs[0].attributes("value")).toContain("Test Ürün 1");
        expect(inputs[1].attributes("value")).toContain("Test açıklama22");
        expect(inputs[2].attributes("value")).toContain("50");
        expect(wrapper.find(".v-list .v-list-item .v-list-item-title").text()).toContain("1-1751355081897");
        expect(wrapper.find(".v-list .v-list-item .v-list-item-subtitle").text()).toContain("CODE_128");
    })

    it("Ürün bilgileri güncellenir ve kaydedilir", async () => {
        const wrapper = mount(UrunDuzenle, {
            global: {plugins: [pinia]},
            props: {modelValue: model, urun: urun}
        });
        const inputs = wrapper.findAll(".v-field__input");
        await inputs[0].setValue("Güncellenmiş Test Ürün");
        await inputs[1].setValue("Güncellenmiş Test Açıklama");
        await inputs[2].setValue("100");
        await wrapper.find(".v-card-actions button.text-primary").trigger("click");
        expect(inventoryService.updateItem).toHaveBeenCalled()
        expect(wrapper.emitted()).toHaveProperty("success");
        expect(wrapper.emitted()).toHaveProperty("close");
    })

    it("Düzenlemeden vazgeçilir", async () => {
        const wrapper = mount(UrunDuzenle, {
            global: {plugins: [pinia]},
            props: {modelValue: model, urun: urun}
        });
        await wrapper.find(".v-field__input").setValue("Güncellenmiş Test Ürün");   // Ad değiştirildi
        await wrapper.find(".v-card-actions button.text-secondary").trigger("click");   // vazgeç
        expect(wrapper.vm.urunDuzenleData.ad).toContain("Test Ürün 1");
        expect(wrapper.emitted()).toHaveProperty("close");
    })

    it("Barkod silinir", async () => {
        const wrapper = mount(UrunDuzenle, {
            global: {plugins: [pinia]},
            props: {modelValue: model, urun: urun}
        });
        await wrapper.find(".v-list .v-list-item i").trigger("click");
        expect(wrapper.vm.urunDuzenleData.barkodlar[0].isDeleted).toBe(true);
        expect(wrapper.find(".v-list .v-list-item .v-list-item-title").text()).toContain("Ürüne tanımlı barkod bulunamadı.")
    })

    it("Barkod eklenir", async () => {
        vi.mocked(barkodTaramaService.scanBarcode).mockResolvedValue({data: "1111", type: "test"});
        const wrapper = mount(UrunDuzenle, {
            global: {plugins: [pinia]},
            props: {modelValue: model, urun: urun}
        });
        await wrapper.find('[data-test="barkod-ekle-buton"]').trigger("click");
        expect(barkodTaramaService.scanBarcode).toHaveBeenCalled();
        expect(wrapper.vm.urunDuzenleData.barkodlar).toContainEqual({data: "1111", type: "test", isDeleted: false});
        expect(wrapper.find(".v-list").html()).toContain("1111");
        expect(wrapper.find(".v-list").html()).toContain("test");
    })

    it("Barkod eklenirken hata oluşur ve bildirim verilir", async () => {
        vi.mocked(barkodTaramaService.scanBarcode).mockRejectedValue(new Error("Test Hata"));
        const wrapper = mount(UrunDuzenle, {
            global: {plugins: [pinia]},
            props: {modelValue: model, urun: urun}
        });
        await wrapper.find('[data-test="barkod-ekle-buton"]').trigger("click");
        expect(barkodTaramaService.scanBarcode).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith("Test Hata");
    })

    it("Özel barkod eklenir", async () => {
        const wrapper = mount(UrunDuzenle, {
            global: {plugins: [pinia]},
            props: {modelValue: model, urun: urun}
        });
        const barkodlarLength = wrapper.vm.urunDuzenleData.barkodlar.length;
        await wrapper.find('.v-alert button').trigger("click");
        expect(wrapper.vm.urunDuzenleData.barkodlar.length).toBe(barkodlarLength + 1)
    })

    it("İndirim uygulama butonuna tıklandığında indirim uygular", async () => {
        const wrapper = mount(UrunDuzenle, {
            global: {plugins: [pinia]},
            props: {modelValue: model, urun: urun}
        });
        const indirimButonlari = wrapper.findComponent(VBtnToggle).findAllComponents(VBtn);
        expect(indirimButonlari.length).toBe(4);
        // %10 indirim uygula
        await indirimButonlari[1].trigger("click");
        expect(wrapper.findAll(".v-field__input")[3].attributes("value")).toContain("45");
    })
})