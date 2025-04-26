<template>
  <v-btn variant="outlined" @click="add">ekle</v-btn>
  <v-btn variant="outlined" @click="change">değiştir</v-btn>
  <v-btn variant="outlined" @click="remove">sil</v-btn>
  <v-btn variant="outlined" @click="load">yükle</v-btn>
  <div class="my-4"></div>
  <v-data-table
    :headers="headers"
    :items="items"
    density="compact"
    mobile
  />
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import inventoryService, {Tables} from "../services/inventoryService.ts";
import type {IUrun} from "../types/inventory.ts";

const items = ref<Array<any>>([{
  id: "12",
  ad: "asdasdsad",
  fiyat: "500",
  created_at: "2024-02-26 13:01:35"
}]);
const headers = [
  {title: "#", value: "id", key: "id"},
  {title: "Ad", value: "ad", key: "ad"},
  {title: "Fiyat", value: "fiyat", key: "fiyat"}
]

onMounted(() => {
  load();
});

const load = async () => {
  try {
    items.value = await inventoryService.getItems(Tables.URUNLER);
  } catch {
    items.value = [{
      id: "12",
      ad: "asdasdsad",
      fiyat: "500",
      created_at: "2024-02-26 13:01:35"
    }];
  }
}

const add = async () => {
  // @ts-ignore
  let item: IUrun = {
    aciklama: "deneme",
    ad: "asdasd",
    fiyat: 20,
    indirimli_fiyat: 0
  }
  await inventoryService.addItem(Tables.URUNLER, item);
  await load();
}

const change = async () => {
  if (items.value[0]) {
    let changed = items.value[0];
    changed.ad = changed.ad + Date.now();
    await inventoryService.updateItem(Tables.URUNLER, changed);
    await load();
  }
}

const remove = async () => {
  if (items.value[0]) {
    await inventoryService.deleteItem(Tables.URUNLER, items.value[0].id);
    await load();
  }
}
</script>

<style scoped>

</style>