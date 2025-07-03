import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import inventoryService, {Tables} from "../../src/services/inventoryService";
import {flushPromises, mount, shallowMount} from "@vue/test-utils";
import Envanter from "../../src/components/Envanter.vue";
import {VTextField} from "vuetify/components";
import {nextTick} from "vue";
import {toast} from "vue3-toastify";
import Helper from "../../src/services/Helper";

const mockRoute = {
    query: {}
};

const push = vi.fn();

vi.mock("vue-router", () => ({
        useRouter: () => ({push}),
        useRoute: () => mockRoute
    }
))

const envanterResolve = [
    {
        id: 1,
        ad: "Test Urun1",
        adet: 3,
        urun: {
            minMaxStok: 1,
            minStok: 1,
            maxStok: 5
        }
    },
    {id: 2, ad: "Test Urun2", adet: 5}
];

const urunlerResolve = [
    {id: 1, ad: "Test Urun1", fiyat: 6},
    {id: 2, ad: "Test Urun2", fiyat: 15},
    {id: 3, ad: "Test Urun3", fiyat: 8},
    {id: 4, ad: "Test Urun4", fiyat: 35, indirimli_fiyat: 28}
];

vi.mock("../../src/services/inventoryService.ts", () => {
    const Tables = {URUNLER: "urunler", ENVANTER: "envanter"};
    return {
        default: {
            initializeDatabase: vi.fn().mockResolvedValue(undefined),
            getItems: vi.fn().mockImplementation((table) => {
                if (table === Tables.ENVANTER) {
                    return Promise.resolve(envanterResolve);
                } else if (table === Tables.URUNLER) {
                    return Promise.resolve(urunlerResolve);
                }
                return Promise.resolve([]);
            }),
            deleteItem: vi.fn().mockResolvedValue(undefined),
            deleteUrun: vi.fn().mockResolvedValue(undefined),
            getUrunByBarkod: vi.fn().mockResolvedValue(null),
        },
        Tables,
    };
});

describe("Envanter.vue", () => {
    beforeEach(() => {
        mockRoute.query = {};
    })

    afterEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = ""; // attachTo ile mount edilen DOM temizlenir
    })

    it('başlık doğru şekilde render edilir', () => {
        expect(mount(Envanter).find("h2").text()).toBe("Envanter Yönetimi");
    })

    it('varsayılan tab envanter olmalı', () => {
        expect(mount(Envanter).vm.tab).toBe("envanter");
    })

    it('route.query.tab = urunler ise tab urunler olmalı', () => {
        mockRoute.query = {tab: 'urunler'};
        expect(mount(Envanter).vm.tab).toBe("urunler")
    })

    it('ürünler sekmesine tıklanınca tab değeri değişir', async () => {
        const wrapper = mount(Envanter);
        const urunlerTabBtn = wrapper.find('.v-tabs button[value="urunler"]');
        await urunlerTabBtn.trigger("click");
        expect(wrapper.vm.tab).toBe("urunler");
    })

    it('envanter tablosu doğru props almalı', async () => {
        const wrapper = mount(Envanter);
        await flushPromises();
        const table = wrapper.findComponent({ref: "envanterTable"});
        expect(table.props().headers).toEqual(wrapper.vm.envanterHeaders);
        expect(table.props().items).toEqual(wrapper.vm.envanterItems);
    })

    it('ürünler tablosu doğru props almalı', async () => {
        const wrapper = mount(Envanter);
        await flushPromises();
        await wrapper.find('.v-tabs button[value="urunler"]').trigger("click");
        const table = wrapper.findComponent({ref: "urunlerTable"});
        expect(table.props().headers).toBe(wrapper.vm.urunlerHeaders)
        expect(table.props().items).toBe(wrapper.vm.urunlerItems)
    })

    it('envanter arama alanına yazınca model güncellenmeli', async () => {
        const text = "Test"
        const wrapper = mount(Envanter);
        const table = wrapper.findComponent({ref: "envanterTable"});
        await table.findComponent(VTextField).setValue(text);
        expect(wrapper.vm.search).toBe(text);
    })

    it('ürünler arama alanı ayrı çalışmalı', async () => {
        const text = "Test"
        const wrapper = mount(Envanter);
        await wrapper.find('.v-tabs button[value="urunler"]').trigger("click");
        const table = wrapper.findComponent({ref: "urunlerTable"});
        await table.findComponent(VTextField).setValue(text);
        expect(wrapper.vm.search).toBe(text);
    })

    it('envanter satırına tıklanınca detay sayfasına yönlendirilmeli', async () => {
        const wrapper = mount(Envanter);
        await flushPromises();
        const table = wrapper.findComponent({ref: "envanterTable"});
        await table.find("tbody tr").trigger("click");
        expect(push).toHaveBeenCalled();
    })

    it('ürün satırına tıklanınca detay sayfasına yönlendirilmeli', async () => {
        const wrapper = mount(Envanter);
        await flushPromises();
        await wrapper.find('.v-tabs button[value="urunler"]').trigger("click");
        const table = wrapper.findComponent({ref: "urunlerTable"});
        await table.find("tbody tr").trigger("click");
        expect(push).toHaveBeenCalled();
    })

    it('envanter ekle/çıkar butonu doğru rotaya yönlendirir', async () => {
        const wrapper = mount(Envanter);
        await wrapper.find("[data-test='btn-ekle-cikar']").trigger("click");
        expect(push).toHaveBeenCalled();
        expect(push).toHaveBeenCalledWith("/envanter-hareketi");
    })

    it('ürünler ekle butonu doğru rotaya yönlendirir', async () => {
        const wrapper = mount(Envanter);
        await wrapper.find('.v-tabs button[value="urunler"]').trigger("click");
        await wrapper.find("[data-test='btn-urun-ekle']").trigger("click");
        expect(push).toHaveBeenCalled();
        expect(push).toHaveBeenCalledWith("urun-ekle")
    })

    it('fiyat alanı indirimli ise üstü çizili fiyat gösterilmeli', async () => {
        const wrapper = mount(Envanter);
        await wrapper.find('.v-tabs button[value="urunler"]').trigger("click");
        const rows = wrapper.findComponent({ref: "urunlerTable"}).findAll("tbody tr");
        const indirimliIndex = urunlerResolve.findIndex(u => u.indirimli_fiyat);
        expect(rows[indirimliIndex].html()).toContain("<del>")
        expect(rows[indirimliIndex].html()).toContain(urunlerResolve[indirimliIndex].indirimli_fiyat);
    })

    it('sil butonuna tıklanınca dialog açılır', async () => {
        const wrapper = mount(Envanter, {
            attachTo: document.body
        });
        await wrapper.find('.v-tabs button[value="urunler"]').trigger("click");
        const btn = wrapper.findComponent({ref: "urunlerTable"}).find("tbody tr button");
        await btn.trigger("click");
        await nextTick();
        const dialog = document.querySelector('.v-dialog');
        expect(dialog).toBeTruthy();
        expect(dialog?.classList.contains('v-overlay--active')).toBe(true);
    })

    it('silme onaylanınca deleteUrun çağrılır ve tablo yeniden yüklenir', async () => {
        const wrapper = mount(Envanter, {
            attachTo: document.body
        });
        await wrapper.find('.v-tabs button[value="urunler"]').trigger("click");
        const btn = wrapper.findComponent({ref: "urunlerTable"}).find("tbody tr button");
        await btn.trigger("click");
        await nextTick();
        const dialogSilBtn = document.querySelector('.v-dialog button.text-red');
        dialogSilBtn?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
        await flushPromises();
        expect(inventoryService.deleteItem).toHaveBeenCalled();
        expect(inventoryService.getItems).toHaveBeenCalledWith(Tables.URUNLER);
    });

    it('silme hatasında toast.error çalışmalı', async () => {
        (inventoryService.deleteItem as any).mockRejectedValue(new Error("Test Hata."));
        const wrapper = mount(Envanter, {
            attachTo: document.body
        });
        await wrapper.find('.v-tabs button[value="urunler"]').trigger("click");
        const btn = wrapper.findComponent({ref: "urunlerTable"}).find("tbody tr button");
        await btn.trigger("click");
        await nextTick();
        const dialogSilBtn = document.querySelector('.v-dialog button.text-red');
        dialogSilBtn.dispatchEvent(new MouseEvent("click", {bubbles: true}));
        expect(inventoryService.deleteItem).toHaveBeenCalled();
        await flushPromises();
        expect(toast.error).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith("Bir hata oluştu.Test Hata.");
    })

    it('adet değerinde chip doğru renk gösterir', async () => {
        // Helper.redToGreen mock'lanıp chip'in rengi kontrol edilir
        const data = "rgb(35,35,61)"
        const redToGreenSpy = vi.spyOn(Helper, "redToGreen").mockReturnValue(data);
        const wrapper = mount(Envanter);
        await flushPromises();
        const chip = wrapper.findComponent({ref: "envanterTable"}).find("tbody tr .v-chip");
        expect(redToGreenSpy).toHaveBeenCalled();
        expect(chip.attributes("style")).toContain(data);
    })
})