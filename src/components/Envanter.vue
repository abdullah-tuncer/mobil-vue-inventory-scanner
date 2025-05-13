<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>Envanter Yönetimi</h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-tabs v-model="tab" align-tabs="center" grow>
          <v-tab value="envanter" text="Envanter" prepend-icon="mdi-treasure-chest"/>
          <v-tab value="urunler" text="Ürünler" prepend-icon="mdi-shopping"/>
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="envanter">
            <v-data-table
                :headers="envanterHeaders"
                :items="envanterItems"
                @click:row="envanterUrunDetay"
            >
              <template #top>
                <v-btn
                    @click="router.push('/envanter-hareketi')"
                    rounded="xs"
                    prepend-icon="mdi-plus-minus-variant"
                    class="my-2"
                    block
                >
                  Ekle/Çıkar
                </v-btn>
              </template>
            </v-data-table>
            <v-btn
                @click="router.push('/envanter-hareketi-gecmis')"
                prepend-icon="mdi-history"
                color="secondary"
                variant="tonal"
                class="my-2"
                block
            >
              Geçmiş
            </v-btn>
          </v-tabs-window-item>
          <v-tabs-window-item value="urunler">
            <v-data-table
                :headers="urunlerHeaders"
                :items="urunlerItems"
                @click:row="urunDetay"
            >
              <template #top>
                <v-btn @click="router.push('urun-ekle')" block class="my-2" rounded="xs" prepend-icon="mdi-plus">
                  Ekle
                </v-btn>
              </template>
              <template #[`item.fiyat`]="{item}">
                <span v-if="item.indirimli_fiyat">
                  <sup v-if="item.indirimli_fiyat">
                    <del>{{ item.fiyat + " ₺" }}</del>
                  </sup>
                  {{ item.indirimli_fiyat + " ₺" }}
                </span>
                <span v-else>{{ item.fiyat + " ₺" }}</span>
              </template>
            </v-data-table>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import inventoryService, {Tables} from "../services/inventoryService.ts";
import type {IEnvanter, IUrun} from "../types/inventory.ts";
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();

const tab = ref<"envanter" | "urunler">('envanter');
const envanterHeaders = ref([
  {title: "Ad", value: "urun.ad", key: "ad"},
  {title: "Adet", value: "adet", key: "adet", align: "end" as const}
]);

const envanterItems = ref<Array<IEnvanter>>([]);

const urunlerHeaders = ref([
  {title: "#", value: "id", key: "id", width: 64},
  {title: "Ad", value: "ad", key: "ad"},
  {title: "Fiyat", value: "fiyat", key: "fiyat", align: "end" as const}
])

const urunlerItems = ref<Array<IUrun>>([]);

onMounted(() => {
  if (route.query.tab == "urunler")
    tab.value = "urunler";
  load();
});

const load = async () => {
  try {
    envanterItems.value = await inventoryService.getItems(Tables.ENVANTER);
    urunlerItems.value = await inventoryService.getItems(Tables.URUNLER);
  } catch (e) {
    console.error("Error - Envanter.vue - load():", e);
  }
}

//@ts-ignore
const urunDetay = (event: Event, row: any) => {
  const item: IUrun = row.item;
  router.push('/urun/' + item.id);
}

//@ts-ignore
const envanterUrunDetay = (event: Event, row: any) => {
  const item: IEnvanter = row.item;
  router.push('/urun/' + item.urun_id);
}
</script>