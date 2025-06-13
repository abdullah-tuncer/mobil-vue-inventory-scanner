<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>Satış</h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-title class="pb-0">Ürün Ekle</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <urun-picker v-model="urun" hide-details>
                <template #append class="pl-1">
                  <v-btn @click="addList" icon="mdi-plus" size="small" />
                </template>
              </urun-picker>
            </v-col>
            <v-col cols="12">
              <v-btn
                  @click="cokluTarama"
                  prepend-icon="mdi-barcode-scan"
                  color="secondary"
                  block
              >
                Çoklu Tarama
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider/>

        <v-card-title class="pb-0 d-flex align-center">
          <span>Sepet</span>
          <v-spacer/>
          <v-chip v-if="satis.urunler.length > 0" color="primary" variant="outlined">
            {{ satis.urunler.length }} Ürün
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-list v-if="satis.urunler.length > 0">
            <v-list-item v-for="(item, index) in satis.urunler" :key="index">
              <v-list-item-title class="text-wrap">{{ (item.urun as IUrun).ad }}</v-list-item-title>
              <v-list-item-subtitle>
                <span v-if="item.indirimli_birim_fiyat">
                  <del class="text-grey">{{ item.birim_fiyat }}₺</del>
                  {{ item.indirimli_birim_fiyat }}₺
                </span>
                <span v-else>{{ item.birim_fiyat }}₺</span>
              </v-list-item-subtitle>
              <template #append>
                <v-number-input
                    v-model="item.adet"
                    @update:modelValue="onAdetChange(item)"
                    :min="0"
                    style="zoom: 0.75"
                    control-variant="split"
                    density="compact"
                    width="150"
                    hide-details
                />
              </template>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info" variant="tonal" class="mt-2">
            Henüz sepete ürün eklenmedi
          </v-alert>
        </v-card-text>

        <v-divider/>

        <v-card-title class="pb-0">İndirim ve Toplam</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-label>İndirim Uygula</v-label>
              <br>
              <v-btn-toggle rounded="1" variant="outlined" class="mb-2" color="primary" divided>
                <v-btn @click="indirimUygula(0)" size="small">Yok</v-btn>
                <v-btn v-for="oran in settingsStore.indirimOranlari" @click="indirimUygula(oran)" size="small">%{{ oran }}</v-btn>
              </v-btn-toggle>
              <v-number-input
                  v-model="satis.ekstra_indirim_tutari"
                  :precision="2"
                  :min="0"
                  append-inner-icon="mdi-currency-try"
                  label="Ekstra İndirim Tutarı"
                  control-variant="hidden"
                  density="compact"
                  class="mt-2"
                  hide-details
                  reverse
              />
            </v-col>
            <v-col cols="12">
              <v-card variant="outlined" class="pa-3">
                <v-row>
                  <v-col cols="6" class="text-subtitle-1 font-weight-bold">Ara Toplam:</v-col>
                  <v-col cols="6" class="text-right text-subtitle-1">{{ araToplam }}₺</v-col>
                </v-row>
                <v-row v-if="satis.ekstra_indirim_tutari > 0">
                  <v-col cols="6" class="text-subtitle-1 font-weight-bold">İndirim:</v-col>
                  <v-col cols="6" class="text-right text-subtitle-1 text-red">
                    -{{ satis.ekstra_indirim_tutari.toFixed(2) }}₺
                  </v-col>
                </v-row>
                <v-divider class="my-2"></v-divider>
                <v-row>
                  <v-col cols="6" class="text-h6 font-weight-bold">Toplam:</v-col>
                  <v-col cols="6" class="text-right text-h6 font-weight-bold">{{ toplam }}₺</v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn @click="sifirla" color="secondary" block>
                Sıfırla
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn @click="kaydet" color="primary" block :disabled="satis.urunler.length === 0">
                Kaydet
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import UrunPicker from "./UrunPicker.vue";
import {computed, onUnmounted, ref} from "vue";
import {Satis} from "../classes/Satis.ts";
import {EnvanteHareketiIslemTipi, type ISatisUrunu, type IUrun} from "../types/inventory.ts";
import {toast} from "vue3-toastify";
import inventoryService, {Tables} from "../services/inventoryService.ts";
import BarkodTaramaService from "../services/BarkodTaramaService.ts";
import {useSettingsStore} from "../store/settingsStore.ts";

const satis = ref(new Satis());
const urun = ref<IUrun>();
const settingsStore = useSettingsStore();

const araToplam = computed(() => {
  let total = 0;
  for (const item of satis.value.urunler) {
    const fiyat = item.indirimli_birim_fiyat || item.birim_fiyat;
    total += fiyat * item.adet;
  }
  return total.toFixed(2);
});

const toplam = computed(() => {
  let total = 0;
  for (const item of satis.value.urunler) {
    const fiyat = item.indirimli_birim_fiyat || item.birim_fiyat;
    total += fiyat * item.adet;
  }
  total -= satis.value.ekstra_indirim_tutari;
  return total.toFixed(2);
});

const addList = () => {
  if (urun.value) {
    const existingItem = satis.value.urunler.find(item => item.urun?.id === urun.value?.id);
    if (existingItem) {
      existingItem.adet += 1;
    } else {
      satis.value.urunler.push({
        urun: urun.value,
        adet: 1,
        birim_fiyat: urun.value.fiyat,
        indirimli_birim_fiyat: urun.value.indirimli_fiyat || undefined,
        tutar: urun.value.indirimli_fiyat || urun.value.fiyat,
        urun_id: urun.value.id
      });
    }
    urun.value = undefined;
  }
}

const cokluTarama = async () => {
  try {
    const success = await BarkodTaramaService.startContinuousScan(async (result) => {
      if (result && result.barcode) {
        const barkodDegeri = result.barcode.rawValue;
        const bulunanUrun = await inventoryService.getUrunByBarkod(barkodDegeri);
        if (bulunanUrun) {
          const existingItem = satis.value.urunler.find(item => item.urun?.id === bulunanUrun.id);
          if (existingItem) {
            existingItem.adet += 1;
          } else {
            satis.value.urunler.push({
              urun: bulunanUrun,
              adet: 1,
              birim_fiyat: bulunanUrun.fiyat,
              indirimli_birim_fiyat: bulunanUrun.indirimli_fiyat || undefined,
              tutar: bulunanUrun.indirimli_fiyat || bulunanUrun.fiyat,
              urun_id: bulunanUrun.id
            });
          }
          toast.success(`${bulunanUrun.ad} eklendi`);
        } else {
          toast.warning(`Barkod (${barkodDegeri}) için ürün bulunamadı`);
        }
      }
    });
    if (!success) {
      toast.error("Tarama başlatılamadı. Kamera izinlerini kontrol edin.");
    }
  } catch (e: any) {
    console.error("Error - Satis.vue - cokluTarama():", e);
    toast.error(e.message || "Tarama sırasında bir hata oluştu");
    await BarkodTaramaService.stopContinuousScan();
  }
}

const onAdetChange = (item: ISatisUrunu) => {
  if (item.adet <= 0) {
    const index = satis.value.urunler.findIndex(u => (u.urun as IUrun).id === (item.urun as IUrun).id);
    if (index !== -1)
      satis.value.urunler.splice(index, 1);
  }
}

const indirimUygula = (oran: number) => {
  if (oran == 0)
    satis.value.ekstra_indirim_tutari = 0;
  else {
    let total = 0;
    for (const item of satis.value.urunler) {
      const fiyat = item.indirimli_birim_fiyat || item.birim_fiyat;
      total += fiyat * item.adet;
    }
    total.toFixed(2);
    satis.value.ekstra_indirim_tutari = Number((Number(toplam.value) * (oran / 100)).toFixed(2));
  }
}

const sifirla = () => {
  satis.value = new Satis();
}

const kaydet = async () => {
  try {
    if (satis.value.urunler.length === 0) {
      toast.warning("Satış listesi boş!");
      return;
    }
    satis.value.toplam_tutar = Number(toplam.value);

    const satisId = await inventoryService.addItem(Tables.SATISLAR, {
      toplam_tutar: satis.value.toplam_tutar,
      ekstra_indirim_tutari: satis.value.ekstra_indirim_tutari || 0
    });

    const envanterHareketiId = await inventoryService.addItem(Tables.ENVANTER_HAREKETLERI, {
      islem_tipi: EnvanteHareketiIslemTipi.SATIS,
      aciklama: `Satış kaydı`,
      satis_id: satisId
    });

    for (const urun of satis.value.urunler) {
      const fiyat = urun.indirimli_birim_fiyat || urun.birim_fiyat;
      const tutar = fiyat * urun.adet;

      await inventoryService.addItem(Tables.SATIS_URUNLERI, {
        satis_id: satisId,
        urun_id: (urun.urun as IUrun).id,
        adet: urun.adet,
        birim_fiyat: urun.birim_fiyat,
        indirimli_birim_fiyat: urun.indirimli_birim_fiyat || undefined,
        tutar: tutar
      });

      await inventoryService.addItem(Tables.ENVANTER_HAREKETI_URUN, {
        envanter_hareketi_id: envanterHareketiId,
        urun_id: (urun.urun as IUrun).id,
        adet: -urun.adet // Satış olduğu için negatif değer
      });
    }

    sifirla();
    toast.success("Satış başarıyla kaydedildi!");
  } catch (e) {
    console.error("Error - Satis.vue - kaydet():", e);
    toast.error("Satış kaydedilirken bir hata oluştu!");
  }
}

onUnmounted(() => {
  if (BarkodTaramaService.isScanningActive()) {
    BarkodTaramaService.stopContinuousScan();
  }
})
</script>

<style scoped>
.v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.v-theme--dark .v-list-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.v-list-item:last-child {
  border-bottom: none;
}

.v-list-item-title {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}
</style>