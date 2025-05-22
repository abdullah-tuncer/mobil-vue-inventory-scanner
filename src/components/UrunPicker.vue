<template>
  <v-select
      v-model="selectedItem"
      :items="items"
      :rules="rules"
      item-title="ad"
      item-value="id"
      label="Ürünler"
      return-object
  >
    <template #append-inner>
      <v-icon @click="scan" icon="mdi-barcode-scan"/>
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append"></slot>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import inventoryService, {Tables} from "../services/inventoryService.ts";
import type {IUrun} from "../types/inventory.ts";
import barkodTaramaService from "../services/BarkodTaramaService.ts";
import {toast} from "vue3-toastify";

const items = ref<Array<IUrun>>([]);
const selectedItem = defineModel<IUrun | null>();
defineProps<{ rules?: Array<any> }>();

onMounted(() => {
  load();
});

const load = async () => {
  try {
    items.value = await inventoryService.getItems(Tables.URUNLER);
  } catch (e) {
    console.error("UrunPicker - load: ", e)
  }
}

const scan = async () => {
  try {
    const barkod = await barkodTaramaService.scanBarcode();
    if (barkod) {
      const urun = await inventoryService.getUrunByBarkod(barkod.data);
      if (urun) {
        selectedItem.value = urun;
      } else {
        toast.warning("Bu barkoda sahip ürün bulunamadı");
      }
    }
  } catch (e: any) {
    toast.error(e.message || "Barkod tarama sırasında bir hata oluştu");
  }
}
</script>

<style scoped>

</style>