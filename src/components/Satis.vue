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
import {computed, onMounted, ref} from "vue";
import {Satis} from "../classes/Satis.ts";
import {EnvanteHareketiIslemTipi, type ISatisUrunu, type IUrun} from "../types/inventory.ts";
import {toast} from "vue3-toastify";
import inventoryService, {Tables} from "../services/inventoryService.ts";

const satis = ref(new Satis());
const urun = ref<IUrun>();

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

onMounted(() => {
  load();
})

const load = () => {
  // ürünleri yükle
}

const cokluTarama = () => {
  // ürünleri barkodlarından bul sonra listeye ekle
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

const sifirla = () => {
  satis.value = new Satis();
}

const toplam = computed(() => {
  let total = 0;
  for (const item of satis.value.urunler) {
    const fiyat = item.indirimli_birim_fiyat || item.birim_fiyat;
    total += fiyat * item.adet;
  }
  return total.toFixed(2);
})
</script>