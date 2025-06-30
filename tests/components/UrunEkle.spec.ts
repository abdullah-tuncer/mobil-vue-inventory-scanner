import {beforeEach, describe, expect, it, vi} from "vitest";
import barkodTaramaService from "../../src/services/BarkodTaramaService";
import {flushPromises, mount} from "@vue/test-utils";
import UrunEkle from "../../src/components/UrunEkle.vue";
import {createRouter, createWebHistory} from "vue-router";
import {createTestingPinia} from "@pinia/testing";
import {setActivePinia} from "pinia";
import {useSettingsStore} from "../../src/store/settingsStore";
import {VBtn, VBtnToggle} from "vuetify/components";
import {toast} from "vue3-toastify";
import inventoryService, {Tables} from "../../src/services/inventoryService";
import {Urun} from "../../src/classes/Urun";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: "/", component: UrunEkle},
        {path: "/envanter", component: {template: "<div>Envanter</div>"}}
    ]
})

describe("UrunEkle.vue", () => {
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
    })

    it('Ürüne barkod ekler', async () => {
        vi.mocked(barkodTaramaService.scanBarcode).mockResolvedValue({
            type: "test",
            data: "123456"
        });
        const wrapper = mount(UrunEkle, {global: {plugins: [router, pinia]}});
        await wrapper.findAllComponents(VBtn).find(value => value.html().includes("mdi-barcode-scan")).trigger("click");
        expect(barkodTaramaService.scanBarcode).toHaveBeenCalled();
        expect(wrapper.find(".v-list .v-list-item-title").html()).toContain("123456");
        expect(wrapper.find(".v-list .v-list-item-subtitle").html()).toContain("test");
    });

    it('Ürüne barkod eklenen barkodu siler', async () => {
        vi.mocked(barkodTaramaService.scanBarcode).mockResolvedValue({
            type: "test",
            data: "123456"
        });
        const wrapper = mount(UrunEkle, {global: {plugins: [router, pinia]}});
        await wrapper.findAllComponents(VBtn).find(value => value.html().includes("mdi-barcode-scan")).trigger("click");
        expect(barkodTaramaService.scanBarcode).toHaveBeenCalled();
        await wrapper.find(".v-list i.mdi-close").trigger("click");
        expect(wrapper.vm.barkodlar.length).toBe(0);
    });

    it('Barkod taramada hata oluşursa ve bildirim verir', async () => {
        vi.mocked(barkodTaramaService.scanBarcode).mockRejectedValue(new Error("Test Hata"));
        const wrapper = mount(UrunEkle, {global: {plugins: [router, pinia]}});
        await wrapper.findAllComponents(VBtn).find(value => value.html().includes("mdi-barcode-scan")).trigger("click");
        expect(barkodTaramaService.scanBarcode).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith("Test Hata");
    });

    it('Vazgeç butonu envanter ekranına gönderir', async () => {
        const pushSpy = vi.spyOn(router, "push");
        const wrapper = mount(UrunEkle, {global: {plugins: [router, pinia]}});
        await wrapper.find(".v-card-actions button.text-secondary").trigger("click");
        expect(pushSpy).toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalledWith("/envanter?tab=urunler");
    });

    it('Kaydet butonu ürünü kaydeder', async () => {
        const addItemSpy = vi.spyOn(inventoryService, "addItem").mockResolvedValue(3);
        const wrapper = mount(UrunEkle, {global: {plugins: [router, pinia]}});
        const inputs = wrapper.findAll(".v-form .v-field__input");
        await inputs[0].setValue("Test Ürün");      // ad
        await inputs[1].setValue("Test Açıklama");  // aciklama
        await inputs[2].setValue(50);               // fiyat
        await wrapper.find(".v-card-actions button.text-primary").trigger("click");
        await flushPromises();
        expect(addItemSpy).toHaveBeenCalled();
        let urun = new Urun();
        urun.ad = "Test Ürün"
        urun.aciklama = "Test Açıklama"
        // @ts-ignore
        urun.fiyat = "50"
        expect(addItemSpy).toHaveBeenCalledWith(Tables.URUNLER, urun);
    });

    it('İndirim uygulama butonuna tıklandığında indirim uygular', async () => {
        const wrapper = mount(UrunEkle, {global: {plugins: [router, pinia]}});
        const indirimButonlari = wrapper.findComponent(VBtnToggle).findAllComponents(VBtn);
        const inputs = wrapper.findAll(".v-form .v-field__input");
        await inputs[2].setValue(50);               // fiyat
        expect(indirimButonlari.length).toBe(4);
        // %10 indirim uygula
        await indirimButonlari[1].trigger("click");
        expect(inputs[3].attributes("value")).toContain((50 * 0.1).toString());
    });
})