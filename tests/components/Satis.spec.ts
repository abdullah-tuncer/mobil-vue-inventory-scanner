import {beforeEach, describe, expect, it, vi} from "vitest";
import {flushPromises, mount} from "@vue/test-utils";
import Satis from "../../src/components/Satis.vue";
import UrunPicker from "../../src/components/UrunPicker.vue";
import {createPinia, setActivePinia} from "pinia";
import {useSettingsStore} from "../../src/store/settingsStore";
import BarkodTaramaService from "../../src/services/BarkodTaramaService";
import {toast} from "vue3-toastify";
import inventoryService, {Tables} from "../../src/services/inventoryService";
import {VBtn, VBtnToggle} from "vuetify/components";
import {createTestingPinia} from "@pinia/testing";
import {EnvanteHareketiIslemTipi, IUrun} from "../../src/types/inventory";


vi.mock("../../src/services/inventoryService.ts", () => ({
    default: {
        getItems: vi.fn().mockResolvedValue([
            {id: 1, ad: "Ürün A"},
            {id: 2, ad: "Ürün B"},
        ]),
        addItem: vi.fn().mockResolvedValue(3),
        getUrunByBarkod: vi.fn().mockResolvedValue({id: 1, ad: "Test Ürün", fiyat: 10, indirimli_fiyat: null})
    },
    Tables: {
        URUNLER: "urunler",
        ENVANTER_HAREKETLERI: "envanter_hareketleri",
        SATIS_URUNLERI: "satis_urunleri",
        ENVANTER_HAREKETI_URUN: "envanter_hareketi_urun"
    }
}))

vi.mock("../../src/services/BarkodTaramaService.ts", () => ({
    default: {
        startContinuousScan: vi.fn(),
        stopContinuousScan: vi.fn(),
    }
}))

describe("Satis.vue", () => {
    let pinia: ReturnType<typeof createTestingPinia>;
    const sepetUrun = {
        "urun": {
            "id": 1,
            "ad": "Test Ürün 1",
            "aciklama": "Test açıklama",
            "fiyat": 50,
            "indirimli_fiyat": 45,
            "created_at": "2025-06-28 05:53:39"
        },
        "adet": 1,
        "birim_fiyat": 50,
        "indirimli_birim_fiyat": 45,
        "tutar": 45,
        "urun_id": 1
    };

    beforeEach(() => {
        pinia = createTestingPinia({
            stubActions: false,
            createSpy: vi.fn,
        });

        setActivePinia(pinia);
        const settingsStore = useSettingsStore();
        // @ts-ignore
        settingsStore.indirimOranlari = [10, 20, 30];
    })

    it('Ürün seçilip listeye eklenir', async () => {
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        await flushPromises();
        await wrapper.findComponent(UrunPicker).setValue({id: 1, ad: "Ürün A"});
        await wrapper.findComponent(UrunPicker).find("button").trigger("click");
        expect(wrapper.find(".v-list").html()).toContain("Ürün A");
    });

    it('Çoklu tarama ile ürün listeye eklenir', async () => {
        const scanSpy = vi.mocked(BarkodTaramaService.startContinuousScan).mockImplementation(async (callback) => {
            callback({barcode: {rawValue: "123456"}});
            return true;
        });
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        await flushPromises();
        await wrapper.find('button[data-test="coklu-tarama-buton"]').trigger("click");
        await flushPromises();
        expect(scanSpy).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith("Test Ürün eklendi");
        expect(wrapper.find(".v-list").html()).toContain("Test Ürün");
    });

    it('Çoklu tarama ile ürün bulunamaz uyarı gösterir', async () => {
        const scanSpy = vi.mocked(BarkodTaramaService.startContinuousScan).mockImplementation(async (callback) => {
            callback({barcode: {rawValue: "123456"}});
            return true;
        });
        vi.mocked(inventoryService.getUrunByBarkod).mockResolvedValue(null)
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        await flushPromises();
        await wrapper.find('button[data-test="coklu-tarama-buton"]').trigger("click");
        await flushPromises();
        expect(scanSpy).toHaveBeenCalled();
        expect(toast.warning).toHaveBeenCalledWith("Barkod (123456) için ürün bulunamadı");
    });

    it('Çoklu tarama başlatılamaz', async () => {
        const scanSpy = vi.mocked(BarkodTaramaService.startContinuousScan).mockImplementation(async (callback) => {
            callback({barcode: {rawValue: "123456"}});
            return false;
        });
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        await flushPromises();
        await wrapper.find('button[data-test="coklu-tarama-buton"]').trigger("click");
        await flushPromises();
        expect(scanSpy).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith("Tarama başlatılamadı. Kamera izinlerini kontrol edin.");
    });

    it('Çoklu tarama esnasında bilinmeyen hata', async () => {
        const scanSpy = vi.mocked(BarkodTaramaService.startContinuousScan).mockRejectedValue(new Error("Test Hata"));
        const consoleSpy = vi.spyOn(console, "error").mockReturnValue(undefined);
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        await flushPromises();
        await wrapper.find('button[data-test="coklu-tarama-buton"]').trigger("click");
        await flushPromises();
        expect(scanSpy).toHaveBeenCalled();
        expect(BarkodTaramaService.stopContinuousScan).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith("Error - Satis.vue - cokluTarama():", new Error("Test Hata"));
        expect(toast.error).toHaveBeenCalledWith("Test Hata");
    });

    it('Çoklu tarama esnasında bilinmeyen hata', async () => {
        const scanSpy = vi.mocked(BarkodTaramaService.startContinuousScan).mockRejectedValue(new Error("Test Hata"));
        const consoleSpy = vi.spyOn(console, "error").mockReturnValue(undefined);
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        await flushPromises();
        await wrapper.find('button[data-test="coklu-tarama-buton"]').trigger("click");
        await flushPromises();
        expect(scanSpy).toHaveBeenCalled();
        expect(BarkodTaramaService.stopContinuousScan).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith("Error - Satis.vue - cokluTarama():", new Error("Test Hata"));
        expect(toast.error).toHaveBeenCalledWith("Test Hata");
    });

    it('Sepette ürün yoksa uyarı gösterir', async () => {
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        await flushPromises();
        expect(wrapper.find('[data-test="sepet"] .v-alert').html()).toContain("Henüz sepete ürün eklenmedi");
    });

    it('Sepetteki bilgiler doğru şekilde gösterilir', async () => {
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        wrapper.vm.satis.urunler.push(sepetUrun)
        await flushPromises();
        const list = wrapper.find('[data-test="sepet"] .v-list')
        expect(list.html()).toContain("Test Ürün 1");
        expect(list.html()).toContain("50₺");
        expect(list.html()).toContain("45₺");
        expect(list.find("input").attributes("value")).toContain("1");
    });

    it('İndirim uygulama butonuna tıklandığında indirim uygular', async () => {
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        wrapper.vm.satis.urunler.push(sepetUrun)
        await flushPromises();
        const indirimButonlari = wrapper.findComponent(VBtnToggle).findAllComponents(VBtn);
        expect(indirimButonlari.length).toBe(4);
        // %10 indirim uygula
        await indirimButonlari[1].trigger("click");
        await flushPromises()
        expect(wrapper.findAll('[data-test="hesap-bilgileri"] .v-row>.v-col:nth-of-type(2)')[1].html()).toContain((sepetUrun.tutar * 0.1).toString())
    });

    it('Özel indirim tutarı girildikten sonra indirim uygular', async () => {
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        wrapper.vm.satis.urunler.push(sepetUrun)
        await flushPromises();
        const indirimTutariInput = wrapper.findAll(".v-number-input").find(value => value.html().includes("Ekstra İndirim Tutarı")).find("input");
        await indirimTutariInput.setValue("3");
        expect(wrapper.findAll('[data-test="hesap-bilgileri"] .v-row>.v-col:nth-of-type(2)')[1].html()).toContain("3");
    });

    it('Hesap bilgileri doğru şekilde gelir', async () => {
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        wrapper.vm.satis.urunler.push(sepetUrun)
        wrapper.vm.satis.ekstra_indirim_tutari = 3;
        await flushPromises();
        expect(wrapper.findAll('[data-test="hesap-bilgileri"] .v-row>.v-col:nth-of-type(2)')[0].html()).toContain("45");
        expect(wrapper.findAll('[data-test="hesap-bilgileri"] .v-row>.v-col:nth-of-type(2)')[1].html()).toContain("3");
        expect(wrapper.findAll('[data-test="hesap-bilgileri"] .v-row>.v-col:nth-of-type(2)')[2].html()).toContain("42");
    });


    it('Sıfırla butonu satışı sıfırlar', async () => {
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        wrapper.vm.satis.urunler.push(sepetUrun)
        await flushPromises();
        await wrapper.find('.v-card-actions button.text-secondary').trigger("click");
        expect(wrapper.vm.satis.urunler.length).toBe(0);
    });

    it('Kaydet butonu satışı kaydeder ve formu temizler', async () => {
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        wrapper.vm.satis.urunler.push(sepetUrun)
        await flushPromises();
        await wrapper.find('.v-card-actions button.text-primary').trigger("click");
        await flushPromises();
        expect(inventoryService.addItem).toHaveBeenCalledWith(Tables.SATISLAR, {
            toplam_tutar: 45,
            ekstra_indirim_tutari: 0
        });
        expect(inventoryService.addItem).toHaveBeenCalledWith(Tables.ENVANTER_HAREKETLERI, {
            islem_tipi: EnvanteHareketiIslemTipi.SATIS,
            aciklama: `Satış kaydı`,
            satis_id: 3
        });
        expect(inventoryService.addItem).toHaveBeenCalledWith(Tables.SATIS_URUNLERI, {
            satis_id: 3,
            urun_id: 1,
            adet: 1,
            birim_fiyat: 50,
            indirimli_birim_fiyat: 45,
            tutar: 45
        });
        expect(inventoryService.addItem).toHaveBeenCalledWith(Tables.ENVANTER_HAREKETI_URUN, {
            envanter_hareketi_id: 3,
            urun_id: 1,
            adet: -1
        });
        expect(toast.success).toHaveBeenCalledWith("Satış başarıyla kaydedildi!")
    });

    it('Hata alındığı için satış kaydedilemez', async () => {
        const consoleSpy = vi.spyOn(console, "error").mockReturnValue(undefined);
        const hata = new Error("Test Hata");
        vi.mocked(inventoryService.addItem).mockRejectedValue(hata);
        const wrapper = mount(Satis, {global: {plugins: [pinia]}});
        wrapper.vm.satis.urunler.push(sepetUrun);
        await flushPromises();
        await wrapper.find('.v-card-actions button.text-primary').trigger("click");
        await flushPromises();
        expect(consoleSpy).toHaveBeenCalledWith("Error - Satis.vue - kaydet():", hata);
        expect(toast.error).toHaveBeenCalledWith("Satış kaydedilirken bir hata oluştu!");
    });
})