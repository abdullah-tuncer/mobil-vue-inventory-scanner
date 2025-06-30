import {afterEach, describe, expect, it, vi} from "vitest";
import {createRouter, createWebHistory} from "vue-router";
import {flushPromises, mount} from "@vue/test-utils";
import EnvanterHareketiGecmis from "../../src/components/EnvanterHareketiGecmis.vue";
import inventoryService, {Tables} from "../../src/services/inventoryService";
import {VChip} from "vuetify/components";
import {EnvanteHareketiIslemTipiColor, EnvanteHareketiIslemTipiLabel} from "../../src/types/inventory";
import Helper from "../../src/services/Helper";
import {toast} from "vue3-toastify";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: "/", component: EnvanterHareketiGecmis},
        {path: "/satis-detay/:id", component: {template: "<div>Satış Detay</div>"}},
        {
            path: "/envanter-hareketi-gecmis-detay/:id",
            component: {template: "<div>Envanter Hareketi Geçmiş Detay</div>"}
        }
    ]
})

vi.mock("../../src/services/inventoryService.ts", () => ({
    default: {
        getItems: vi.fn().mockResolvedValue([
            {
                id: 3,
                islem_tipi: "satis",
                aciklama: "Deneme3",
                satis_id: 1,
                created_at: "2025-06-28 13:50:38"
            },
            {
                id: 2,
                islem_tipi: "sayim",
                aciklama: "Deneme2",
                satis_id: null,
                created_at: "2025-06-27 09:50:38"
            },
            {
                id: 1,
                islem_tipi: "giris",
                aciklama: "Deneme",
                satis_id: null,
                created_at: "2025-06-27 09:26:38"
            }
        ]),
        deleteEnvanterHareketi: vi.fn()
    },
    Tables: {
        ENVANTER_HAREKETLERI: "envanter_hareketleri",
    }
}))

describe("EnvanterHareketiGecmis.vue", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    })

    it("Geri gitme butonu", async () => {
        const backSpy = vi.spyOn(router, "back");
        const wrapper = mount(EnvanterHareketiGecmis, {
            global: {plugins: [router]}
        })
        await wrapper.find('[data-test="geri-buton"]').trigger("click");
        expect(backSpy).toHaveBeenCalled();
    })

    it('Başlangıçta değerler gelip listelenir', async () => {
        const wrapper = mount(EnvanterHareketiGecmis, {
            global: {plugins: [router]}
        })
        await flushPromises();
        expect(inventoryService.getItems).toHaveBeenCalled();
        expect(inventoryService.getItems).toHaveBeenCalledWith(Tables.ENVANTER_HAREKETLERI, "*", {
            field: "created_at",
            type: "DESC"
        });
        const items = wrapper.vm.items;

        const chips = wrapper.findAllComponents(VChip);
        items.forEach((item, i) => {
            expect(chips[i].props()).toMatchObject({
                color: EnvanteHareketiIslemTipiColor[item.islem_tipi],
                text: EnvanteHareketiIslemTipiLabel[item.islem_tipi]
            });
        });

        wrapper.findAll("tbody tr").forEach((tr, i) => {
            expect(tr.html()).contain(items[i].aciklama);
            expect(tr.html()).contain(Helper.dateFormat(items[i].created_at));
        });
    });

    it('Bir değerin başarılı şekilde silinmesi', async () => {
        vi.mocked(inventoryService.deleteEnvanterHareketi).mockResolvedValue(undefined);
        const wrapper = mount(EnvanterHareketiGecmis, {
            global: {plugins: [router]},
            attachTo: document.body
        })
        await flushPromises();
        await wrapper.find("tbody tr button").trigger("click");
        document.querySelector(".v-dialog button.text-red").dispatchEvent(new MouseEvent("click", {bubbles: true}))
        expect(inventoryService.deleteEnvanterHareketi).toHaveBeenCalled();
        expect(inventoryService.deleteEnvanterHareketi).toHaveBeenCalledWith(wrapper.vm.items[0]);
    });

    it('Bir değerin silinememesi ve hatanın gösterimi', async () => {
        vi.mocked(inventoryService.deleteEnvanterHareketi).mockRejectedValue(new Error("Test Hatası"));
        const spyConsole = vi.spyOn(console, "error").mockReturnValue(undefined);
        const wrapper = mount(EnvanterHareketiGecmis, {
            global: {plugins: [router]},
            attachTo: document.body
        })
        await flushPromises();
        await wrapper.find("tbody tr button").trigger("click");
        document.querySelector(".v-dialog button.text-red").dispatchEvent(new MouseEvent("click", {bubbles: true}))
        await flushPromises();
        expect(spyConsole).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith("Bir hata oluştu: Test Hatası");
    });

    it('Envanter Hareketi Geçmişi detayına yönlendirme', async () => {
        const spyPush = vi.spyOn(router, "push");
        const wrapper = mount(EnvanterHareketiGecmis, {
            global: {plugins: [router]}
        })
        await flushPromises();
        const itemIndex = wrapper.vm.items.findIndex(v => !v.satis_id)
        await wrapper.findAll("tbody tr")[itemIndex].trigger("click");
        expect(spyPush).toHaveBeenCalled();
        expect(spyPush).toHaveBeenCalledWith("/envanter-hareketi-gecmis-detay/" + wrapper.vm.items[itemIndex].id);
    });

    it('Satış detayına yönlendirme', async () => {
        const spyPush = vi.spyOn(router, "push");
        const wrapper = mount(EnvanterHareketiGecmis, {
            global: {plugins: [router]}
        })
        await flushPromises();
        const itemIndex = wrapper.vm.items.findIndex(v => v.satis_id)
        await wrapper.findAll("tbody tr")[itemIndex].trigger("click");
        expect(spyPush).toHaveBeenCalled();
        expect(spyPush).toHaveBeenCalledWith("/satis-detay/" + wrapper.vm.items[itemIndex].satis_id);
    });
})