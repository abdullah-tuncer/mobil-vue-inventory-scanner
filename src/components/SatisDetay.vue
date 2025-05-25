<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>
        <v-btn v-if="!hideBackButton" @click="router.back()" variant="text" icon="mdi-arrow-left" class="mt-n1 ml-n4"/>
        Satış Detayı
      </h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-calendar" size="small" class="mr-1"/>
          {{ tarih }}
          <v-spacer></v-spacer>
          <v-chip
              :color="EnvanteHareketiIslemTipiColor[EnvanteHareketiIslemTipi.SATIS]"
              :text="EnvanteHareketiIslemTipiLabel[EnvanteHareketiIslemTipi.SATIS]"
              size="small"
              dark
          />
        </v-card-title>

        <v-divider/>

        <v-card-text>
          <h2>Satılan Ürünler</h2>
          <v-list>
            <v-list-item v-for="(item, index) in satis.satis_urunleri" :key="index" class="px-0">
              <v-list-item-title class="text-wrap">{{ (item.urun as IUrun).ad }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.adet }} Adet x 
                <span v-if="item.indirimli_birim_fiyat">
                  <del class="text-grey">{{ item.birim_fiyat }}₺</del>
                  {{ item.indirimli_birim_fiyat }}₺
                </span>
                <span v-else>{{ item.birim_fiyat }}₺</span>
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <div class="text-right">
                  <strong>{{ calculateItemTotal(item) }}₺</strong>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        
        <v-divider/>

        <v-card-text>
          <v-card variant="outlined" class="pa-3">
            <v-row>
              <v-col cols="6" class="text-subtitle-1">Ara Toplam:</v-col>
              <v-col cols="6" class="text-right text-subtitle-1">{{ calculateSubtotal() }}₺</v-col>
            </v-row>
            <v-row v-if="satis.ekstra_indirim_tutari > 0">
              <v-col cols="6" class="text-subtitle-1">Ekstra İndirim:</v-col>
              <v-col cols="6" class="text-right text-subtitle-1 text-red">-{{ satis.ekstra_indirim_tutari.toFixed(2) }}₺</v-col>
            </v-row>
            <v-divider class="my-2"/>
            <v-row>
              <v-col cols="6" class="text-h6 font-weight-bold">Toplam:</v-col>
              <v-col cols="6" class="text-right text-h6 font-weight-bold">{{ satis.toplam_tutar.toFixed(2) }}₺</v-col>
            </v-row>
          </v-card>
        </v-card-text>
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
const props = defineProps<{ satisId?: string | number, hideBackButton?: boolean }>()

onMounted(async () => {
  await load();
});

const load = async () => {
  const id = props.satisId?.toString() || (route.params.id as string);
  satis.value = await inventoryService.getItemById(Tables.SATISLAR, id);
}

const tarih = computed(() => {
  if (satis.value) {
    return Helper.dateFormat(satis.value.created_at as string)
  } else
    return "Bilinmeyen";
})

const calculateItemTotal = (item:any) => {
  const price = item.indirimli_birim_fiyat || item.birim_fiyat;
  return (price * item.adet).toFixed(2);
}

const calculateSubtotal = () => {
  if (!satis.value || !satis.value.satis_urunleri) return "0.00";
  let subtotal = 0;
  for (const item of satis.value.satis_urunleri) {
    const price = item.indirimli_birim_fiyat || item.birim_fiyat;
    subtotal += price * item.adet;
  }
  return subtotal.toFixed(2);
}
</script>

<style scoped>
.v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.v-theme--dark .v-list-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.v-list-item:last-child {
  border-bottom: none;
}

.v-list-item-title {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}
</style>