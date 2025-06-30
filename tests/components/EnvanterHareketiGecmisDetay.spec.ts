import {describe, expect, it, vi} from "vitest";
import {createRouter, createWebHistory} from "vue-router";
import EnvanterHareketiGecmisDetay from "../../src/components/EnvanterHareketiGecmisDetay.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {EnvanteHareketiIslemTipiLabel, type IEnvanterHareketi} from "../../src/types/inventory";
import Helper from "../../src/services/Helper";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: "/", component: EnvanterHareketiGecmisDetay},
        {path: "/satis-detay/:id", component: {template: "<div>Satış Detay</div>"}},
        {
            path: "/urun/:id",
            component: {template: "<div>Ürün Detay</div>"}
        }
    ]
})

vi.mock("../../src/services/inventoryService.ts", () => ({
    default: {
        getItemById: vi.fn().mockResolvedValue({
            "id": 1,
            "islem_tipi": "sayim",
            "aciklama": "Deneme",
            "satis_id": null,
            "created_at": "2025-06-27 09:26:38",
            "urunler": [
                {
                    "id": 1,
                    "envanter_hareketi_id": 1,
                    "urun_id": 1,
                    "adet": -2,
                    "urun": {
                        "id": 1,
                        "ad": "Test1",
                        "aciklama": "Deneme",
                        "fiyat": 10,
                        "indirimli_fiyat": 8,
                        "created_at": "2025-06-27 09:25:51",
                        "updated_at": null
                    }
                },
                {
                    "id": 2,
                    "envanter_hareketi_id": 1,
                    "urun_id": 2,
                    "adet": 4,
                    "urun": {
                        "id": 2,
                        "ad": "Test2",
                        "aciklama": "deneme deneme aciklama",
                        "fiyat": 35,
                        "indirimli_fiyat": null,
                        "created_at": "2025-06-27 09:26:17",
                        "updated_at": null
                    }
                }
            ]
        })
    },
    Tables: {ENVANTER_HAREKETLERI: "envanter_hareketleri"}
}))
describe("EnvanterHareketiGecmisDetay.vue", () => {
    it("Geri gitme butonu", async () => {
        const backSpy = vi.spyOn(router, "back");
        const wrapper = mount(EnvanterHareketiGecmisDetay, {
            global: {plugins: [router]}
        })
        await wrapper.find('[data-test="geri-buton"]').trigger("click");
        expect(backSpy).toHaveBeenCalled();
    })

    it("Detay bilgileri doğru şekilde gösterilir", async () => {
        const helperDateFormatSpy = vi.spyOn(Helper, "dateFormat");
        const wrapper = mount(EnvanterHareketiGecmisDetay, {
            global: {plugins: [router]}
        })
        await flushPromises();
        const envanterHareketi: IEnvanterHareketi = wrapper.vm.envanterHareketi
        expect(helperDateFormatSpy).toHaveBeenCalled();
        expect(helperDateFormatSpy).toHaveBeenCalledWith(envanterHareketi.created_at);
        expect(wrapper.find(".v-chip").html()).toContain(EnvanteHareketiIslemTipiLabel[envanterHareketi.islem_tipi]);
        expect(wrapper.find(".v-alert").html()).toContain(envanterHareketi.aciklama);
        const list = wrapper.findAll(".v-list .v-list-item");
        if (list.length == 0) {
            expect(wrapper.find('.v-alert[type="warning"]')).toContain("Bu işlemde ürün bulunmamaktadır.")
        } else {
            list.forEach((listItem, index) => {
                expect(listItem.find(".v-list-item-title").text()).toContain(envanterHareketi.urunler[index].urun.ad);
                if (envanterHareketi.urunler[index].adet > 0)
                    expect(listItem.find(".v-chip").classes()).toContain("text-success");
                else
                    expect(listItem.find(".v-chip").classes()).toContain("text-error");
                expect(listItem.find(".v-chip").html()).toContain(envanterHareketi.urunler[index].adet);
            });
        }
        const islemBilgileri = wrapper.findAll('[data-test="islem-bilgileri"] .v-row>.v-col:nth-of-type(2)')
        expect(islemBilgileri.length).toBe(3);
        expect(islemBilgileri[0].html()).toContain(EnvanteHareketiIslemTipiLabel[envanterHareketi.islem_tipi]);
        expect(islemBilgileri[1].text()).toContain(Helper.dateFormat(envanterHareketi.created_at));
        expect(islemBilgileri[2].text()).toContain(envanterHareketi.id);
    })

    it("Ürüne tıklandığında ürün detayına gider", async () => {
        const pushSpy = vi.spyOn(router, "push");
        const wrapper = mount(EnvanterHareketiGecmisDetay, {
            global: {plugins: [router]}
        })
        await flushPromises();
        await wrapper.find(".v-list .v-list-item").trigger("click");
        expect(pushSpy).toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalledWith("/urun/" + wrapper.vm.envanterHareketi.urunler[0].urun.id);
    })
})