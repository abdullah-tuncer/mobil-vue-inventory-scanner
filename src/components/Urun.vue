<template>
  <v-row class="ma-auto">
    <v-col cols="10" class="py-0">
      <h2>
        <v-btn @click="router.back()" variant="text" icon="mdi-arrow-left" class="mt-n1 ml-n4" data-test="geri-buton"/>
        {{ urun?.ad }}
      </h2>
    </v-col>
    <v-col align="right" cols="2" class="py-0">
      <v-btn v-if="!duzenleAktif" @click="duzenleAktif=true" icon="mdi-pen" variant="text" class="mt-n1 mr-n2"/>
    </v-col>
    <v-col cols="12">
      <v-card v-if="duzenleAktif">
       <urun-duzenle v-model="urunDuzenleData" @success="load" @close="duzenleAktif=false" :urun="urun"/>
      </v-card>
      <v-card v-else data-test="urun-bilgileri">
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
          <v-col v-if="urun?.minMaxStok == 1" cols="6">
            <v-label>Minimum Stok:</v-label>
            <br>
            {{urun.minStok}}
          </v-col>
          <v-col v-if="urun?.minMaxStok == 1" cols="6">
            <v-label>Maksimum Stok:</v-label>
            <br>
            {{urun.maxStok}}
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
import Helper from "../services/Helper.ts";
import {
  EnvanteHareketiIslemTipi,
  EnvanteHareketiIslemTipiColor, EnvanteHareketiIslemTipiLabel,
  type IEnvanterHareketiUrun
} from "../types/inventory.ts";
import SatisDetay from "./SatisDetay.vue";
import EnvanterHareketiGecmisDetay from "./EnvanterHareketiGecmisDetay.vue";
import UrunDuzenle from "./UrunDuzenle.vue";
import BarkodOnizle from "./BarkodOnizle.vue";

const router = useRouter();
const route = useRoute();
const duzenleAktif = ref(false);

const urun = ref<any>(null);
const urunDuzenleData = ref<any>(null);
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

onMounted(async () => {
  await load();
})

const load = async () => {
  const id = route.params.id as string;
  urun.value = await inventoryService.getItemById(Tables.URUNLER, id);
  urunDuzenleData.value = JSON.parse(JSON.stringify(urun.value));
  if (urunDuzenleData.value?.barkodlar) {
    urunDuzenleData.value.barkodlar.forEach((barkod: any) => barkod.isDeleted = false);
  }
  urunHareketiBilgileri.value = await inventoryService.urunSatisBilgileri(id);
}

const indirimOrani = (urun: any) => {
  let oran = Helper.indirimOraniHesapla(urun.fiyat, urun.indirimli_fiyat);
  return Number(oran).toFixed(1);
}
</script>