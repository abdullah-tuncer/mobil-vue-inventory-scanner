import {describe, expect, it, vi} from "vitest";
import {flushPromises, mount} from "@vue/test-utils";
import EnvanterHareketi from "../../src/components/EnvanterHareketi.vue";
import UrunPicker from "../../src/components/UrunPicker.vue";
import {createRouter, createWebHistory} from "vue-router";
import {VBtn, VNumberInput, VTextarea} from "vuetify/components";
import inventoryService, {Tables} from "../../src/services/inventoryService";
import {EnvanteHareketiIslemTipi} from "../../src/types/inventory";
import {toast} from "vue3-toastify";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: "/", component: EnvanterHareketi},
        {path: "/envanter", component: {template: "<div>Envanter</div>"}}
    ]
})

vi.mock("../../src/services/inventoryService.ts", () => ({
    default: {
        getItems: vi.fn().mockResolvedValue([
            {id: 1, ad: "Ürün A"},
            {id: 2, ad: "Ürün B"},
        ]),
        addItem: vi.fn().mockResolvedValue(3),
    },
    Tables: {
        URUNLER: "urunler",
        ENVANTER: "envanter",
        ENVANTER_HAREKETLERI: "envanter_hareketleri",
        ENVANTER_HAREKETI_URUN: "envanter_hareketi_urun"
    }
}))

describe("EnvanterHareketi.vue", () => {
    it("Listeye ürün eklenir ve listelenir", async () => {
        const wrapper = mount(EnvanterHareketi, {
            global: {plugins: [router]}
        });
        await wrapper.find(".v-form").findComponent(UrunPicker).setValue({id: 1, ad: "Ürün A"});
        await wrapper.find(".v-form").findComponent(VNumberInput).setValue(3);
        await wrapper.find('button[data-test="ekle-btn"]').trigger("click");
        await flushPromises();
        expect(wrapper.find(".v-table tbody tr").html()).toContain("Ürün A");
        expect(wrapper.find(".v-table tbody tr").html()).toContain(3);
    })

    it("Listeden ürün silinir", async () => {
        const wrapper = mount(EnvanterHareketi, {
            global: {plugins: [router]}
        })
        wrapper.vm.list.push({ urun: { id: 1, ad: 'Ürün A' }, adet: 5 });
        await flushPromises();
        await wrapper.find(".v-table tbody tr").findComponent(VBtn).trigger("click");
        expect(wrapper.findAll(".v-table tbody tr").length).toEqual(0);
    })

    it("Vazgeç butonu doğru yola yönlendirir", async () => {
        const routerPushSpy = vi.spyOn(router, 'push');
        const wrapper = mount(EnvanterHareketi, {
            global: {plugins: [router]}
        })
        await wrapper.find('.v-card-actions button.text-secondary').trigger("click");
        expect(routerPushSpy).toHaveBeenCalled();
        expect(routerPushSpy).toHaveBeenCalledWith('/envanter');
    })

    it("Envanter hareketi kaydedilir", async () => {
        const routerPushSpy = vi.spyOn(router, 'push');
        const wrapper = mount(EnvanterHareketi, {
            global: {plugins: [router]}
        })
        wrapper.vm.list.push({ urun: { id: 1, ad: 'Ürün A' }, adet: 5 });
        wrapper.vm.list.push({ urun: { id: 2, ad: 'Ürün B' }, adet: 3 });
        await wrapper.find(".v-btn-toggle").findAllComponents(VBtn)[1].trigger("click");
        await wrapper.findComponent(VTextarea).setValue("Test Açıklama");
        await wrapper.find('.v-card-actions button.text-primary').trigger("click");
        await flushPromises();
        expect(inventoryService.addItem).toHaveBeenCalled();
        expect(inventoryService.addItem).toHaveBeenCalledWith(Tables.ENVANTER_HAREKETLERI, {
            islem_tipi: EnvanteHareketiIslemTipi.GIRIS,
            aciklama: "Test Açıklama"
        });
        expect(inventoryService.addItem).toHaveBeenCalledTimes(3);
        expect(routerPushSpy).toHaveBeenCalledWith('/envanter');
    })

    it("Listede ürün olmadığı için envanter hareketi kaydedilemez", async () => {
        const wrapper = mount(EnvanterHareketi, {
            global: {plugins: [router]}
        })
        await wrapper.find(".v-btn-toggle").findAllComponents(VBtn)[1].trigger("click");
        await wrapper.findComponent(VTextarea).setValue("Test Açıklama");
        await wrapper.find('.v-card-actions button.text-primary').trigger("click");
        await flushPromises();
        expect(toast.warning).toHaveBeenCalled();
        expect(toast.warning).toHaveBeenCalledWith("Listeye ürün eklenmedi.");
    })
})