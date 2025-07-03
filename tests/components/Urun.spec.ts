import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {createRouter, createWebHistory} from "vue-router";
import Urun from "../../src/components/Urun.vue";
import {flushPromises, mount} from "@vue/test-utils";
import UrunDuzenle from "../../src/components/UrunDuzenle.vue";
import {EnvanteHareketiIslemTipiLabel} from "../../src/types/inventory";
import Helper from "../../src/services/Helper";
import {createTestingPinia} from "@pinia/testing";
import {setActivePinia} from "pinia";
import {useSettingsStore} from "../../src/store/settingsStore";
import {VBtn} from "vuetify/components";
import inventoryService from "../../src/services/inventoryService";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: "/", component: Urun},
    ]
})

vi.mock("../../src/services/inventoryService.ts", () => ({
    default: {
        getItemById: vi.fn().mockResolvedValue({
            "id": 1,
            "ad": "Test Ürün 1",
            "aciklama": "Test açıklama",
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
        }),
        urunSatisBilgileri: vi.fn().mockResolvedValue([{
            "id": 3,
            "envanter_hareketi_id": 2,
            "urun_id": 1,
            "adet": -1,
            "islem_tipi": "satis",
            "created_at": "2025-06-29 07:55:09",
            "satis_id": 1
        }, {
            "id": 1,
            "envanter_hareketi_id": 1,
            "urun_id": 1,
            "adet": 25,
            "islem_tipi": "giris",
            "created_at": "2025-06-28 05:54:56",
            "satis_id": null
        }]),
    },
    Tables: {
        URUNLER: "urunler"
    }
}))

describe("Urun.vue", () => {
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

    afterEach(() => {
        document.body.innerHTML = "";
    })

    it("Geri gitme butonu", async () => {
        const backSpy = vi.spyOn(router, "back");
        const wrapper = mount(Urun, {
            global: {plugins: [router, pinia]}
        })
        await wrapper.find('[data-test="geri-buton"]').trigger("click");
        expect(backSpy).toHaveBeenCalled();
    })

    it("Düzenle butonu düzenleme formunu açar", async () => {
        const wrapper = mount(Urun, {
            global: {plugins: [router, pinia]}
        })
        await flushPromises();
        await wrapper.findAllComponents(VBtn).find(value => value.html().includes("mdi-pen")).trigger("click");
        expect(wrapper.findComponent(UrunDuzenle).exists()).toBe(true);
    })

    it('Ürün bilgileri alınır ve gösterilir', async () => {
        const wrapper = mount(Urun, {
            global: {plugins: [router, pinia]}
        })
        await flushPromises();
        const urunBilgileri = wrapper.find('[data-test="urun-bilgileri"]');
        expect(urunBilgileri.html()).toContain("Test Ürün 1");
        expect(urunBilgileri.html()).toContain("Test açıklama");
        expect(urunBilgileri.html()).toContain("50");
        expect(urunBilgileri.html()).toContain("1-1751355081897");
        expect(urunBilgileri.html()).toContain("CODE_128");
    });

    it('Ürün işlem bilgileri gösterilir ve tıklandığında dialog açılır', async () => {
        const wrapper = mount(Urun, {
            global: {plugins: [router, pinia]},
            attachTo: document.body
        })
        await flushPromises();
        const urunIslemBilgisi = wrapper.find('[data-test="urun-bilgileri"] .v-data-table tbody tr');
        expect(urunIslemBilgisi.html()).toContain("-1");
        expect(urunIslemBilgisi.html()).toContain(EnvanteHareketiIslemTipiLabel["satis"]);
        expect(urunIslemBilgisi.html()).toContain(Helper.dateFormat("2025-06-29 07:55:09"));
        vi.mocked(inventoryService.getItemById).mockReturnValue(undefined)
        await urunIslemBilgisi.trigger("click")
        const dialog = document.querySelector('.v-dialog');
        expect(dialog).not.toBe(null);
    });


})