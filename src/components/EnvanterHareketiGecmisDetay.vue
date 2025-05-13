<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>
        <v-btn @click="router.back()" variant="text" icon="mdi-arrow-left" class="mt-n1 ml-n4"/>
        {{ title }}
      </h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-row class="ma-auto">
          <v-col cols="6" class="align-center">
            {{ tarih }}
          </v-col>
          <v-col cols="6" class="text-right">
            <v-chip
                :color="EnvanteHareketiIslemTipiColor[islemTipi]"
                :text="EnvanteHareketiIslemTipiLabel[islemTipi]"
                size="small"
                dark
            />
          </v-col>
          <v-col cols="12">
            <p>{{ envanterHareketi?.aciklama }}</p>
          </v-col>
          <v-col cols="12" class="ma-0">
            <v-table class="border">
              <tbody>
              <tr v-for="item in envanterHareketi?.urunler" @click="router.push('/urun/' + item.urun_id)">
                <td>
                  {{ item?.urun?.ad }}
                </td>
                <td>
                  {{ item.adet }}
                </td>
              </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import inventoryService, {Tables} from "../services/inventoryService.ts";
import {useRoute, useRouter} from "vue-router";
import {
  EnvanteHareketiIslemTipiColor,
  EnvanteHareketiIslemTipiLabel,
  type IEnvanterHareketi
} from "../types/inventory.ts";
import Helper from "../services/Helper.ts";

const envanterHareketi = ref<IEnvanterHareketi>();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  await load();
})

const title = computed(() => {
  if (envanterHareketi.value) {
    return tarih.value + " Tarihli " + EnvanteHareketiIslemTipiLabel[islemTipi.value] + " Detayı"
  } else
    return "İşlem Detayı";
})

const tarih = computed(() => {
  if (envanterHareketi.value) {
    return Helper.dateFormat(envanterHareketi.value.created_at as string)
  } else
    return "Bilinmeyen";
})

const islemTipi = computed(() => {
  return (envanterHareketi.value as IEnvanterHareketi).islem_tipi;
})

const load = async () => {
  try {
    const id = route.params.id as string;
    envanterHareketi.value = await inventoryService.getItemById(Tables.ENVANTER_HAREKETLERI, id) as IEnvanterHareketi;
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>

</style>