<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>Satış</h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-row class="ma-auto">
          <v-col cols="12">
            <urun-picker v-model="urun" hide-details/>
          </v-col>
          <v-col cols="12">
            <v-btn @click="addList" prepend-icon="mdi-plus" block>Ekle</v-btn>
          </v-col>
          <v-col cols="12" class="py-1">
            <v-divider/>
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
          <v-col cols="12">
            <v-row v-for="item in satis.urunler">
              <v-col cols="12" class="py-1">{{ (item.urun as IUrun).ad }}</v-col>
              <v-col cols="6" class="py-1">
                <v-number-input
                    v-model="item.adet"
                    @update:modelValue="onAdetChange(item)"
                    :min="0"
                    style="zoom: 0.75"
                    control-variant="split"
                    density="comfortable"
                    class="mx-1"
                    hide-details
                />
              </v-col>
              <v-col cols="6" class="text-right py-1" align-self="center">
                <sup v-if="item.indirimli_birim_fiyat">
                  <del>{{ item.birim_fiyat }}₺</del>
                </sup>
                {{ item.indirimli_birim_fiyat || item.birim_fiyat }}₺
              </v-col>
              <v-col cols="12" class="py-1">
                <v-divider/>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-label>İndirim Uygula</v-label>
                <br>
                <v-btn-toggle rounded="1" variant="outlined" class="mb-2" color="primary" divided>
                  <v-btn @click="indirimUygula(0)" size="small">Yok</v-btn>
                  <v-btn v-for="oran in indirimOranlari" @click="indirimUygula(oran)" size="small">%{{ oran }}</v-btn>
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
              <v-col cols="6">Toplam:</v-col>
              <v-col cols="6" class="text-right">{{ toplam }}₺</v-col>
            </v-row>
          </v-col>
          <v-col cols="6">
            <v-btn @click="sifirla" color="secondary" block>
              Sıfırla
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn @click="kaydet" color="primary" block>
              Kaydet
            </v-btn>
          </v-col>
        </v-row>
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
import {useStore} from "vuex";
import BarkodTaramaService from "../services/BarkodTaramaService.ts";

const satis = ref(new Satis());
const urun = ref<IUrun>();
const store = useStore();

const indirimOranlari = computed(() => [
  Number(store.getters["settings/getAyarByKey"]("indirim_oran_1")),
  Number(store.getters["settings/getAyarByKey"]("indirim_oran_2")),
  Number(store.getters["settings/getAyarByKey"]("indirim_oran_3")),
]);

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
    satis.value.ekstra_indirim_tutari = Number(toplam.value) * (oran / 100);
  }
}

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

const onAdetChange = (item: ISatisUrunu) => {
  if (item.adet <= 0) {
    const index = satis.value.urunler.findIndex(u => (u.urun as IUrun).id === (item.urun as IUrun).id);
    if (index !== -1) {
      satis.value.urunler.splice(index, 1);
    }
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

onUnmounted(() => {
  if (BarkodTaramaService.isScanningActive()) {
    BarkodTaramaService.stopContinuousScan();
  }
})

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

const sifirla = () => {
  satis.value = new Satis();
}

const toplam = computed(() => {
  let total = 0;
  for (const item of satis.value.urunler) {
    const fiyat = item.indirimli_birim_fiyat || item.birim_fiyat;
    total += fiyat * item.adet;
  }
  total -= satis.value.ekstra_indirim_tutari;
  return total.toFixed(2);
})
</script>