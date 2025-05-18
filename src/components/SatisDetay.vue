<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>
        <v-btn @click="router.back()" variant="text" icon="mdi-arrow-left" class="mt-n1 ml-n4"/>
        Satış Detayı
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
                :color="EnvanteHareketiIslemTipiColor[EnvanteHareketiIslemTipi.SATIS]"
                :text="EnvanteHareketiIslemTipiLabel[EnvanteHareketiIslemTipi.SATIS]"
                size="small"
                dark
            />
          </v-col>
          <v-col cols="12">
            <v-row v-for="item in satis.satis_urunleri">
              <v-col cols="12" class="py-1">{{ (item.urun as IUrun).ad }}</v-col>
              <v-col cols="6" class="py-1">
                {{ item.adet }} Adet
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
              <v-col cols="6">Ekstra İndirim Tutarı:</v-col>
              <v-col cols="6" class="text-right">{{ satis.ekstra_indirim_tutari }}₺</v-col>
              <v-col cols="6">Toplam:</v-col>
              <v-col cols="6" class="text-right">{{ satis.toplam_tutar }}₺</v-col>
            </v-row>
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
import Helper from "../services/Helper.ts";
import {
  EnvanteHareketiIslemTipi,
  EnvanteHareketiIslemTipiColor,
  EnvanteHareketiIslemTipiLabel, type IUrun
} from "../types/inventory.ts";

const route = useRoute();
const router = useRouter();
const satis = ref();

onMounted(async () => {
  await load();
});

const load = async () => {
  const id = route.params.id as string;
  satis.value = await inventoryService.getItemById(Tables.SATISLAR, id);
}

const tarih = computed(() => {
  if (satis.value) {
    return Helper.dateFormat(satis.value.created_at as string)
  } else
    return "Bilinmeyen";
})


</script>

<style scoped>

</style>