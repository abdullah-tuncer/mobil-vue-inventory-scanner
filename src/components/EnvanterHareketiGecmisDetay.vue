<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>
        <v-btn v-if="!hideBackButton" @click="router.back()" variant="text" icon="mdi-arrow-left" class="mt-n1 ml-n4"/>
        {{ title }}
      </h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-calendar" size="small" class="mr-1"/>
          {{ tarih }}
          <v-spacer/>
          <v-chip
              :color="EnvanteHareketiIslemTipiColor[islemTipi]"
              :text="EnvanteHareketiIslemTipiLabel[islemTipi]"
              size="small"
              dark
          />
        </v-card-title>

        <v-divider/>

        <v-card-text v-if="envanterHareketi?.aciklama">
          <v-alert type="info" variant="tonal" class="mb-0">
            {{ envanterHareketi?.aciklama }}
          </v-alert>
        </v-card-text>
        <v-card-text>
          <h2>İşlem Detayı</h2>
          <v-list>
            <v-list-item
                v-for="(item, index) in envanterHareketi?.urunler"
                :key="index"
                class="px-0"
                @click="router.push('/urun/' + item.urun_id)"
            >
              <v-list-item-title class="text-wrap">{{ item?.urun?.ad }}</v-list-item-title>
              <template v-slot:append>
                <div class="d-flex align-center">
                  <v-chip
                      :color="item.adet > 0 ? 'success' : 'error'"
                      size="small"
                  >
                    {{ item.adet > 0 ? '+' : '' }}{{ item.adet }}
                  </v-chip>
                  <v-icon icon="mdi-chevron-right" class="ml-2"/>
                </div>
              </template>
            </v-list-item>
          </v-list>
          <v-alert
              v-if="!envanterHareketi?.urunler || envanterHareketi.urunler.length === 0"
              type="warning"
              variant="tonal"
              class="mt-2"
          >
            Bu işlemde ürün bulunmamaktadır.
          </v-alert>
        </v-card-text>

        <v-card-text>
          <v-card variant="outlined" class="pa-3">
            <v-row>
              <v-col cols="6" class="text-subtitle-1 py-1">İşlem Tipi:</v-col>
              <v-col cols="6" class="text-right py-1">
                <v-chip
                    :color="EnvanteHareketiIslemTipiColor[islemTipi]"
                    :text="EnvanteHareketiIslemTipiLabel[islemTipi]"
                    size="small"
                    dark
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6" class="text-subtitle-1 py-1">İşlem Tarihi:</v-col>
              <v-col cols="6" class="text-right text-subtitle-1 py-1">{{ tarih }}</v-col>
            </v-row>
            <v-row v-if="envanterHareketi?.id">
              <v-col cols="6" class="text-subtitle-1 py-1">İşlem No:</v-col>
              <v-col cols="6" class="text-right text-subtitle-1 py-1">#{{ envanterHareketi.id }}</v-col>
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
import {
  EnvanteHareketiIslemTipiColor,
  EnvanteHareketiIslemTipiLabel,
  type IEnvanterHareketi
} from "../types/inventory.ts";
import Helper from "../services/Helper.ts";

const envanterHareketi = ref<IEnvanterHareketi>();
const route = useRoute();
const router = useRouter();
const props = defineProps<{ hareketId?: number | string, hideBackButton?: boolean }>();

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
  return (envanterHareketi.value as IEnvanterHareketi)?.islem_tipi;
})

const load = async () => {
  try {
    const id = props.hareketId?.toString() || (route.params.id as string);
    envanterHareketi.value = await inventoryService.getItemById(Tables.ENVANTER_HAREKETLERI, id) as IEnvanterHareketi;
  } catch (e) {
    console.error(e)
  }
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