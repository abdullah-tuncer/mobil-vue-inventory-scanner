<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>
        <v-btn @click="router.back()" variant="text" icon="mdi-arrow-left" class="mt-n1 ml-n4"/>
        Envanter Hareket Geçmişi
      </h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-data-table
            :items="items"
            :headers="headers"
            @click:row="detay"
        >
          <template #[`item.tip`]="{item}">
            <v-chip
                :color="EnvanteHareketiIslemTipiColor[item.islem_tipi]"
                :text="EnvanteHareketiIslemTipiLabel[item.islem_tipi]"
                size="small"
                dark
            />
          </template>
          <template #[`item.tarih`]="{item}">
            {{ Helper.dateFormat(item.created_at as string) }}
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {
  EnvanteHareketiIslemTipiColor,
  EnvanteHareketiIslemTipiLabel,
  type IEnvanterHareketi
} from "../types/inventory.ts";
import inventoryService, {Tables} from "../services/inventoryService.ts";
import Helper from "../services/Helper.ts";

const router = useRouter();

const items = ref<Array<IEnvanterHareketi>>([]);

const headers = [
  {title: "Tarih", value: "created_at", key: "tarih"},
  {title: "Tip", value: "islem_tipi", key: "tip"},
  {title: "Açıklama", value: "aciklama", key: "aciklama"}
]

onMounted(async () => {
  await load();
})

const load = async () => {
  try {
    items.value = await inventoryService.getItems(Tables.ENVANTER_HAREKETLERI, "*", {
      field: "created_at",
      type: "DESC"
    });
  } catch (e) {
    console.error(e)
  }
}

//@ts-ignore
const detay = (event: Event, row: any) => {
  const item: IEnvanterHareketi = row.item;
  router.push('/envanter-hareketi-gecmis-detay/' + item.id);
}
</script>