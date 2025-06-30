<template>
  <v-row class="ma-auto">
    <v-col cols="12" align="end" class="py-0">
      <v-tooltip
          text="Ayarlar>Anasayfa Ayarları üzerinden bu sayfayı düzenleyebilirsiniz."
          location="bottom"
          open-on-click
      >
        <template #activator="{props}">
          <v-icon v-bind="props" size="small" color="grey">mdi-help-circle-outline</v-icon>
        </template>
      </v-tooltip>
    </v-col>
    <v-col cols="12" align="center">
      <h1>{{ firma_ad }}</h1>
    </v-col>
    <v-col cols="12">
      {{ firma_aciklama }}
    </v-col>
    <v-col v-if="list.length > 0" cols="12">
      <v-list>
        <v-list-item v-for="str in list">
          <v-list-item-title class="no-ellipsis">{{ str }}</v-list-item-title>
          <template #append>
            <v-icon @click="kopyala(str)" data-test="copy-icon">mdi-content-copy</v-icon>
            <v-icon @click="paylas(str)" class="ml-2" data-test="share-icon">mdi-share</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-col>
    <v-btn
        @click="urunTara"
        icon="mdi-scan-helper"
        class="tarayici-btn"
        variant="tonal"
        size="large"
    />
  </v-row>
  <v-snackbar
      v-model="snackbar"
      :timeout="2000"
      rounded="pill"
      color="green"
  >
    <v-icon size="small">mdi-check-circle-outline</v-icon>
    İçerik panoya kopyalandı
  </v-snackbar>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {Clipboard} from '@capacitor/clipboard';
import {Share} from "@capacitor/share";
import barkodTaramaService from "../services/BarkodTaramaService.ts";
import inventoryService from "../services/inventoryService.ts";
import {useRouter} from "vue-router";
import {toast} from "vue3-toastify";
import {useSettingsStore} from "../store/settingsStore.ts";

const settingsStore = useSettingsStore();
const router = useRouter();
const snackbar = ref(false);

const firma_ad = computed(() => settingsStore.getAyarByKey("sirket_adi"))
const firma_aciklama = computed(() => settingsStore.getAyarByKey("sirket_aciklama"))
const list = computed(() => JSON.parse(settingsStore.getAyarByKey('sirket_liste') ?? "[]"));

const kopyala = async (str: string) => {
  await Clipboard.write({
    string: str
  });
  snackbar.value = true;
}

const paylas = async (str: string) => {
  await Share.share({
    text: str
  });
}

const urunTara = async () => {
  try {
    const barkod = await barkodTaramaService.scanBarcode();
    if (barkod) {
      const urun = await inventoryService.getUrunByBarkod(barkod.data);
      if (urun)
        await router.push("/urun/" + urun.id);
      else
        toast.warning('Ürün Bulunamadı.');
    }
  } catch (e: any) {
    toast.error(e.message);
  }
}
</script>

<style scoped>
.tarayici-btn {
  position: fixed;
  bottom: 76px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
}
</style>