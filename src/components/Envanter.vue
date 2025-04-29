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
            >
              <template #top>
                <v-btn block class="my-2" rounded="xs" prepend-icon="mdi-plus-minus-variant">
                  Ekle/Çıkar
                </v-btn>
              </template>
            </v-data-table>
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
import type {IUrun} from "../types/inventory.ts";
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();

const tab = ref<"envanter" | "urunler">('envanter');
const envanterHeaders = ref([
  {title: "Ad", value: "ad", key: "ad"},
  {title: "Adet", value: "adet", key: "adet", align: "end" as const}
]);

const envanterItems = ref([
  {id: 12, ad: "Ülker Gofret", adet: 120},
  {id: 135, ad: "Barış Kedi Kumu", adet: 9},
  {id: 2, ad: "Falım Sakız 5'li", adet: 200},
  {id: 59, ad: "Keskin Sirke 2lt", adet: 50},
  {id: 42, ad: "Küp", adet: 12},
  {id: 23, ad: "Filtre Kahve Kağıdı", adet: 45},
])

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
    urunlerItems.value = await inventoryService.getItems(Tables.URUNLER);
  } catch {
    urunlerItems.value = [{
      id: 1233,
      ad: "Deneme",
      aciklama: "deneme açıklaam",
      fiyat: 20,
      indirimli_fiyat: 10,
      created_at: "2024-02-26 13:01:35",
      updated_at: undefined
    }];
  }
}

//@ts-ignore
const urunDetay = (event: Event, row:any) => {
  router.push('/urun/'+row.item.id);
}
</script>