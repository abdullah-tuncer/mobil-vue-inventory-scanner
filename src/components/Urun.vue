<template>
  <v-row class="ma-auto">
    <v-col cols="10" class="py-0">
      <h2>
        <v-btn @click="router.back()" variant="text" icon="mdi-arrow-left" class="mt-n1 ml-n4"/>
        {{ urun?.ad }}
      </h2>
    </v-col>
    <v-col align="right" cols="2" class="py-0">
      <v-btn v-if="!duzenleAktif" @click="duzenleAktif=true" icon="mdi-pen" variant="text" class="mt-n1 mr-n2"/>
    </v-col>
    <v-col cols="12">
      <v-card v-if="duzenleAktif">
        <v-row class="ma-auto">
          <v-col cols="12">
            <v-text-field
                v-model="urunDuzenle.ad"
                :rules="[v=>!!v||'Lütfen burayı doldurun.']"
                label="Ad"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
                v-model="urunDuzenle.aciklama"
                label="Açıklama"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
                v-model="urunDuzenle.fiyat"
                :rules="[v=>!!v||'Lütfen burayı doldurun.']"
                label="Fiyat"
                type="number"
            />
          </v-col>
          <v-col cols="12">
            <v-label>İndirim Uygula</v-label>
            <br>
            <v-btn-toggle rounded="1" variant="outlined" class="mb-2" color="primary" divided>
              <v-btn @click="indirimUygula(0)">Yok</v-btn>
              <v-btn v-for="oran in indirimOranlari" @click="indirimUygula(oran)">%{{ oran }}</v-btn>
            </v-btn-toggle>
            <v-text-field
                v-model="urunDuzenle.indirimli_fiyat"
                label="İndirimli Fiyat"
                type="number"
                class="my-2"
                hide-details
            />
          </v-col>
          <v-col cols="12">
            <v-alert variant="outlined" type="info">
              Bazı ürünlerde barkod bulunmayabilir. Bu durumda, uygulamanın tanıyabileceği özel bir barkod
              oluşturabilirsiniz.
              Oluşturduğunuz barkodu yazdırabilir ve ürüne yapıştırabilirsiniz. Bu barkod, ürünü hızlıca taramanıza ve
              bulmanıza yardımcı olacaktır.

              <v-btn @click="createCustomBarcode" prepend-icon="mdi-barcode" rounded="1" variant="outlined" block>
                Özel Barkod Oluştur
              </v-btn>
            </v-alert>
          </v-col>
          <v-col cols="12">
            <v-btn @click="addBarcode" prepend-icon="mdi-barcode-scan" rounded="1" variant="outlined" block>
              Barkod Ekle
            </v-btn>
            <v-card
                class="border-t-0 rounded-t-0 mx-3"
                variant="outlined"
                color="primary"
            >
              <v-list>
                <v-list-item v-if="filteredBarkodlar.length>0" v-for="(barkod,index) in filteredBarkodlar">
                  <v-list-item-title>
                    {{ barkod.data }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ barkod.type }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-icon @click="removeBarcode(index)">mdi-close</v-icon>
                  </template>
                </v-list-item>
                <v-list-item v-else>
                  <v-list-item-title>
                    Ürüne tanımlı barkod bulunamadı.
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn @click="cancel" color="secondary" block>Vazgeç</v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn @click="save" color="primary" block>Kaydet</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
      <v-card v-else>
        <v-row class="ma-auto">
          <v-col cols="12">
            <v-label>Ad:</v-label>
            {{ urun?.ad }}
          </v-col>
          <v-col cols="12">
            <v-label>Açıklama:</v-label>
            <br>
            {{ urun?.aciklama }}
          </v-col>
          <v-col cols="12">
            <v-card variant="outlined" color="secondary" align="center">
              <v-card-title class="pt-0">Fiyat</v-card-title>
              <v-divider/>
              <v-card-text>
                <v-row v-if="urun?.indirimli_fiyat">
                  <v-col cols="4">
                    <v-row>
                      <v-col align-self="center" cols="12" class="border-e border-b">
                        <h3>
                          <del>{{ urun.fiyat }}₺</del>
                        </h3>
                      </v-col>
                      <v-col align-self="center" cols="12" class="border-e">
                        <h3>
                          <v-icon icon="mdi-arrow-down" size="x-small"/>
                          %{{ indirimOrani(urun) }}
                        </h3>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col align-self="center" cols="8">
                    <h1>{{ urun.indirimli_fiyat }}₺</h1>
                  </v-col>
                </v-row>
                <v-row v-else>
                  <v-col align-self="center" cols="12">
                    <h1>{{ urun?.fiyat }}₺</h1>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card variant="outlined" color="secondary">
              <v-card-title class="pt-0" align="center">Barkodlar</v-card-title>
              <v-divider/>
              <v-list>
                <v-list-item v-if="urun?.barkodlar.length>0" v-for="barkod in urun.barkodlar">
                  <v-list-item-title>
                    {{ barkod.data }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ barkod.type }}
                  </v-list-item-subtitle>
                  <template #append>
                    <barkod-onizle :barkod-data="barkod.data" :barkod-type="barkod.type"/>
                  </template>
                </v-list-item>
                <v-list-item v-else>
                  <v-list-item-title>
                    Ürüne tanımlı barkod bulunamadı.
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-data-table
                @click:row="detay"
                :headers="headers"
                :items="urunHareketiBilgileri"
            >
              <template #[`item.tarih`]="{item}">
                {{ Helper.dateFormat(item.created_at) }}
              </template>
              <template #[`item.islem`]="{item}">
                <v-chip
                    :color="EnvanteHareketiIslemTipiColor[item.islem_tipi]"
                    :text="EnvanteHareketiIslemTipiLabel[item.islem_tipi]"
                    size="small"
                    dark
                />
              </template>
            </v-data-table>
          </v-col>

          <!-- İşlem Detay Dialog -->
          <v-dialog v-model="dialogVisible">
            <v-card>
              <component
                  :is="currentComponent"
                  :satis-id="selectedItem?.satis_id"
                  :hareket-id="selectedItem?.id"
                  class="mt-2"
                  hide-back-button
              />
              <v-card-actions>
                <v-btn @click="dialogVisible=false" color="secondary">Kapat</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import inventoryService, {Tables} from "../services/inventoryService.ts";
import {useStore} from "vuex";
import barkodTaramaService from "../services/BarkodTaramaService.ts";
import {toast} from "vue3-toastify";
import Helper from "../services/Helper.ts";
import {
  EnvanteHareketiIslemTipi,
  EnvanteHareketiIslemTipiColor, EnvanteHareketiIslemTipiLabel,
  type IEnvanterHareketiUrun
} from "../types/inventory.ts";
import SatisDetay from "./SatisDetay.vue";
import EnvanterHareketiGecmisDetay from "./EnvanterHareketiGecmisDetay.vue";
import BarkodOnizle from "./BarkodOnizle.vue";

const router = useRouter();
const route = useRoute();
const store = useStore();
const duzenleAktif = ref(false);

const urun = ref<any>(null);
const urunDuzenle = ref<any>(null);
const headers = ref([
  {title: "Tarih", key: "tarih"},
  {title: "İşlem", key: "islem"},
  {title: "Adet", value: "adet"}
]);
const urunHareketiBilgileri = ref<Array<IEnvanterHareketiUrun & {
  islem_tipi: EnvanteHareketiIslemTipi,
  created_at: string,
  satis_id: number | null
}>>([]);

const selectedItem=ref<(IEnvanterHareketiUrun & {
  islem_tipi: EnvanteHareketiIslemTipi,
  created_at: string,
  satis_id: number | null
}) | null>(null);
const dialogVisible = ref(false);

// @ts-ignore
const detay = (event: Event, row: any) => {
  const item: IEnvanterHareketiUrun & {
    islem_tipi: EnvanteHareketiIslemTipi,
    created_at: string,
    satis_id: number | null
  } = row.item;
  selectedItem.value = item;
  dialogVisible.value = true;
}

const currentComponent = computed(() => {
  if (selectedItem.value?.satis_id) {
    return SatisDetay;
  } else {
    return EnvanterHareketiGecmisDetay;
  }
});

const indirimOranlari = computed(() => [
  Number(store.getters["settings/getAyarByKey"]("indirim_oran_1")),
  Number(store.getters["settings/getAyarByKey"]("indirim_oran_2")),
  Number(store.getters["settings/getAyarByKey"]("indirim_oran_3")),
])

const indirimUygula = (oran: number) => {
  if (oran == 0)
    urunDuzenle.value.indirimli_fiyat = undefined;
  else
    urunDuzenle.value.indirimli_fiyat = urunDuzenle.value.fiyat - (urunDuzenle.value.fiyat * (oran / 100));
}

onMounted(async () => {
  await load();
})

const load = async () => {
  const id = route.params.id as string;
  urun.value = await inventoryService.getItemById(Tables.URUNLER, id);
  urunDuzenle.value = JSON.parse(JSON.stringify(urun.value));
  if (urunDuzenle.value?.barkodlar) {
    urunDuzenle.value.barkodlar.forEach((barkod: any) => barkod.isDeleted = false);
  }
  urunHareketiBilgileri.value = await inventoryService.urunSatisBilgileri(id);
}

const indirimOrani = (urun: any) => {
  let oran = Helper.indirimOraniHesapla(urun.fiyat, urun.indirimli_fiyat);
  return Number(oran).toFixed(1);
}

const filteredBarkodlar = computed(() => {
  return urunDuzenle.value.barkodlar.filter((barkod: any) => !barkod.isDeleted);
});

const addBarcode = async () => {
  try {
    const barkod = await barkodTaramaService.scanBarcode();
    if (barkod)
      urunDuzenle.value.barkodlar.push({...barkod, isDeleted: false});
  } catch (e: any) {
    toast.error(e.message);
  }
}

const removeBarcode = (index: number) => {
  let barkod = filteredBarkodlar.value[index];
  if (barkod.id) {
    urunDuzenle.value.barkodlar.find((v: any) => v.id == barkod.id).isDeleted = true;
  } else {
    let findedIndex = urunDuzenle.value.barkodlar.findIndex((v: any) => v == barkod);
    urunDuzenle.value.barkodlar.splice(findedIndex, 1);
  }
}

const save = async () => {
  try {
    let barkodlar = [...urunDuzenle.value.barkodlar];
    let newData = urunDuzenle.value;
    delete newData.barkodlar;

    await inventoryService.updateItem(Tables.URUNLER, newData);

    const deletedBarkodlar = barkodlar.filter((b: any) => b.isDeleted && b.id);
    for (const barkod of deletedBarkodlar) {
      await inventoryService.deleteItem(Tables.BARKODLAR, barkod.id);
    }

    const newBarkodlar = barkodlar.filter((b: any) => !b.isDeleted && !b.id);
    for (const barkod of newBarkodlar) {
      await inventoryService.addItem(Tables.BARKODLAR, {
        urun_id: newData.id,
        data: barkod.data,
        type: barkod.type,
        created_at: new Date().toISOString()
      });
    }

    await load();
  } catch (e: any) {
    console.error('Urun.vue - save :', e.message)
  } finally {
    duzenleAktif.value = false
  }
}

const cancel = () => {
  urunDuzenle.value = JSON.parse(JSON.stringify(urun.value));
  if (urunDuzenle.value?.barkodlar) {
    urunDuzenle.value.barkodlar.forEach((barkod: any) => barkod.isDeleted = false);
  }
  duzenleAktif.value = false;
}

const createCustomBarcode = () => {
  const timestamp = new Date().getTime();
  const barcodeData = `${urunDuzenle.value.id}-${timestamp}`;
  urunDuzenle.value.barkodlar.push({
    data: barcodeData,
    type: "CODE_128",
    isDeleted: false
  });
};
</script>

<style scoped>
</style>