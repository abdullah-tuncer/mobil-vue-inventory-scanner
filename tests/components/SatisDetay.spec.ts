import {describe, expect, it, vi} from "vitest";
import {flushPromises, mount} from "@vue/test-utils";
import SatisDetay from "../../src/components/SatisDetay.vue";
import {createRouter, createWebHistory} from "vue-router";
import Helper from "../../src/services/Helper";
import {EnvanteHareketiIslemTipi, EnvanteHareketiIslemTipiLabel} from "../../src/types/inventory";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: "/", component: SatisDetay},
    ]
})

vi.mock("../../src/services/inventoryService.ts", () => ({
    default: {
        getItemById: vi.fn().mockResolvedValue({
            "id": 1,
            "toplam_tutar": 45,
            "ekstra_indirim_tutari": 0,
            "created_at": "2025-06-29 07:55:09",
            "satis_urunleri": [{
                "id": 1,
                "satis_id": 1,
                "urun_id": 1,
                "adet": 1,
                "birim_fiyat": 50,
                "indirimli_birim_fiyat": 45,
                "tutar": 45,
                "created_at": "2025-06-29 07:55:10",
                "urun": {
                    "id": 1,
                    "ad": "Test Ürün 1",
                    "aciklama": "Test açıklama",
                    "fiyat": 50,
                    "indirimli_fiyat": 45,
                    "created_at": "2025-06-28 05:53:39",
                    "updated_at": null
                }
            }]
        })
    },
    Tables: {SATISLAR: "satislar"}
}))

describe("SatisDetay.vue", () => {
    it("Geri gitme butonu", async () => {
        const backSpy = vi.spyOn(router, "back");
        const wrapper = mount(SatisDetay, {
            global: {plugins: [router]}
        })
        await flushPromises();
        await wrapper.find('[data-test="geri-buton"]').trigger("click");
        expect(backSpy).toHaveBeenCalled();
    })

    it("Detay bilgileri doğru şekilde gösterilir", async () => {
        const helperDateFormatSpy = vi.spyOn(Helper, "dateFormat");
        const wrapper = mount(SatisDetay, {
            global: {plugins: [router]}
        })
        await flushPromises();
        const satis = wrapper.vm.satis;
        expect(helperDateFormatSpy).toHaveBeenCalled();
        expect(helperDateFormatSpy).toHaveBeenCalledWith(satis.created_at);
        expect(wrapper.find(".v-chip").html()).toContain(EnvanteHareketiIslemTipiLabel[EnvanteHareketiIslemTipi.SATIS]);
        const list = wrapper.findAll(".v-list .v-list-item");
            list.forEach((listItem, index) => {
                const satis_urunleri = satis.satis_urunleri[index];
                expect(listItem.find(".v-list-item-title").text()).toContain(satis_urunleri.urun.ad);
                expect(listItem.find(".v-list-item-subtitle").html()).toContain(satis_urunleri.adet + " Adet x");
                expect(listItem.find(".v-list-item-subtitle").html()).toContain(satis_urunleri.birim_fiyat);
                expect(listItem.find(".v-list-item-subtitle").html()).toContain(satis_urunleri.indirimli_birim_fiyat);
            });

        const islemBilgileri = wrapper.findAll('[data-test="hesap-bilgileri"] .v-row>.v-col:nth-of-type(2)')
        expect(islemBilgileri.length).toBe(2);
        expect(islemBilgileri[0].html()).toContain("45");
        expect(islemBilgileri[1].text()).toContain("45");
    })
})