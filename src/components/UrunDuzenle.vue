<template>
  <v-row class="ma-auto">
    <v-col cols="12">
      <v-text-field
          v-model="urunDuzenleData.ad"
          :rules="[v=>!!v||'Lütfen burayı doldurun.']"
          label="Ad"
      />
    </v-col>
    <v-col cols="12">
      <v-textarea
          v-model="urunDuzenleData.aciklama"
          label="Açıklama"
      />
    </v-col>
    <v-col cols="12">
      <v-text-field
          v-model="urunDuzenleData.fiyat"
          :rules="[v=>!!v||'Lütfen burayı doldurun.']"
          label="Fiyat"
          type="number"
      />
    </v-col>
    <v-col cols="12">
      <v-checkbox
          v-model="urunDuzenleData.minMaxStok"
          :true-value="1"
          :false-value="0"
          label="Minimum ve Maximum stok değeri gir."
          hide-details
      />
    </v-col>
    <v-col v-if="urunDuzenleData.minMaxStok == 1" cols="6">
      <v-number-input
          v-model="urunDuzenleData.minStok"
          :rules="[v=> v<urunDuzenleData.maxStok || 'Minimum stok miktarı maximum stok miktarından düşük olmalıdır.']"
          :min="0"
          control-variant="split"
          label="Min Stok"
      />
    </v-col>
    <v-col v-if="urunDuzenleData.minMaxStok == 1" cols="6">
      <v-number-input
          v-model="urunDuzenleData.maxStok"
          :rules="[v=> v>urunDuzenleData.minStok || 'Maximum stok miktarı minimum stok miktarından fazla olmalıdır.']"
          :min="1"
          control-variant="split"
          label="Max Stok"
      />
    </v-col>
    <v-col cols="12">
      <v-label>İndirim Uygula</v-label>
      <br>
      <v-btn-toggle rounded="1" variant="outlined" class="mb-2" color="primary" divided>
        <v-btn @click="indirimUygula(0)">Yok</v-btn>
        <v-btn v-for="oran in settingsStore.indirimOranlari" @click="indirimUygula(oran)">%{{ oran }}</v-btn>
      </v-btn-toggle>
      <v-text-field
          v-model="urunDuzenleData.indirimli_fiyat"
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
      <v-btn
          @click="addBarcode"
          prepend-icon="mdi-barcode-scan"
          data-test="barkod-ekle-buton"
          variant="outlined"
          rounded="1"
          block
      >
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
</template>

<script setup lang="ts">

import inventoryService, {Tables} from "../services/inventoryService.ts";
import barkodTaramaService from "../services/BarkodTaramaService.ts";
import {toast} from "vue3-toastify";
import {computed} from "vue";
import {useSettingsStore} from "../store/settingsStore.ts";

const emit = defineEmits(["success", "close"]);
const props = defineProps<{urun: any}>();
const urunDuzenleData = defineModel<any>();
const settingsStore = useSettingsStore();

if (import.meta.vitest) {
  defineExpose({
    urunDuzenleData
  });
}

const indirimUygula = (oran: number) => {
  if (oran == 0)
    urunDuzenleData.value.indirimli_fiyat = undefined;
  else
    urunDuzenleData.value.indirimli_fiyat = urunDuzenleData.value.fiyat - (urunDuzenleData.value.fiyat * (oran / 100));
}

const createCustomBarcode = () => {
  const timestamp = new Date().getTime();
  const barcodeData = `${urunDuzenleData.value.id}-${timestamp}`;
  urunDuzenleData.value.barkodlar.push({
    data: barcodeData,
    type: "CODE_128",
    isDeleted: false
  });
};

const addBarcode = async () => {
  try {
    const barkod = await barkodTaramaService.scanBarcode();
    if (barkod)
      urunDuzenleData.value.barkodlar.push({...barkod, isDeleted: false});
  } catch (e: any) {
    toast.error(e.message);
  }
}

const filteredBarkodlar = computed(() => {
  const barkodlar = urunDuzenleData.value?.barkodlar
  return Array.isArray(barkodlar) ? barkodlar.filter(b => !b.isDeleted) : []
});

const removeBarcode = (index: number) => {
  let barkod = filteredBarkodlar.value[index];
  if (barkod.id) {
    urunDuzenleData.value.barkodlar.find((v: any) => v.id == barkod.id).isDeleted = true;
  } else {
    let findedIndex = urunDuzenleData.value.barkodlar.findIndex((v: any) => v == barkod);
    urunDuzenleData.value.barkodlar.splice(findedIndex, 1);
  }
}

const cancel = () => {
  urunDuzenleData.value = JSON.parse(JSON.stringify(props.urun));
  if (urunDuzenleData.value?.barkodlar) {
    urunDuzenleData.value.barkodlar.forEach((barkod: any) => barkod.isDeleted = false);
  }
  emit("close")
}

const save = async () => {
  try {
    let barkodlar = [...urunDuzenleData.value.barkodlar];
    let newData = urunDuzenleData.value;
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
    emit("success");
  } catch (e: any) {
    console.error('Urun.vue - save :', e.message)
  } finally {
    emit("close");
  }
}
</script>

<style scoped>

</style>