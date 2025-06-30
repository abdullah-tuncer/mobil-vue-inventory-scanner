<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>
        <v-btn @click="router.back()" variant="text" icon="mdi-arrow-left" class="mt-n1 ml-n4" data-test="geri-buton"/>
        Envanter Hareket Geçmişi
      </h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-data-table
            @click:row="detay"
            :items="items"
            :headers="headers"
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
          <template #[`item.islem`]="{item}">
            <v-btn @click.stop="selectedHareket=item; dialog = true" variant="text" icon="mdi-delete" color="red"/>
          </template>
        </v-data-table>
        <v-dialog v-model="dialog">
          <v-card :title="'#' + selectedHareket.id + ' Sil'">
            <v-card-subtitle class="no-ellipsis">
              Envanter hareketindeki işlemler geri alınacaktır.
            </v-card-subtitle>
            <v-card-actions>
              <v-spacer/>
              <v-btn @click="dialog=false" color="secondary">Kapat</v-btn>
              <v-btn @click="deleteHareket" color="red">Sil</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
import {toast} from "vue3-toastify";

const router = useRouter();

const dialog = ref(false);
const selectedHareket = ref();
const items = ref<Array<IEnvanterHareketi>>([]);
const headers = [
  {title: "Tarih", value: "created_at", key: "tarih"},
  {title: "Tip", value: "islem_tipi", key: "tip"},
  {title: "Açıklama", value: "aciklama", key: "aciklama"},
  {title: "İşlem", key: "islem", size: 56, sortable: false, align: "center" as const}
]

if (import.meta.vitest) {
  defineExpose({
    items
  });
}

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
  if (item.satis_id)
    router.push('/satis-detay/' + item.satis_id);
  else
    router.push('/envanter-hareketi-gecmis-detay/' + item.id);
}

const deleteHareket = async () => {
  try {
    await inventoryService.deleteEnvanterHareketi(selectedHareket.value);
    await load();
    dialog.value = false;
  } catch (e: any) {
    console.error("EnvanterHareketiGecmis.vue - deleteHareket hata:", e);
    toast.error("Bir hata oluştu: " + e.message);
  }
}
</script>