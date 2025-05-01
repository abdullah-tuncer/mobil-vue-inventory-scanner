<template>
  <v-row class="ma-auto">
    <v-col cols="12" align="end">
      <v-tooltip
          text="Ayarlar>Anasayfa Ayarları üzerinden bu sayfayı doldurabilirsiniz."
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
            <v-icon @click="kopyala(str)">mdi-content-copy</v-icon>
            <v-icon @click="paylas(str)" class="ml-2">mdi-share</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
  <v-snackbar
      v-model="snackbar"
      :timeout="2000"
      color="green"
      rounded="pill"
  >
    <v-icon size="small">mdi-check-circle-outline</v-icon>
    İçerik panoya kopyalandı
  </v-snackbar>
</template>

<script setup lang="ts">
import {useStore} from "vuex";
import {computed, ref} from "vue";
import {Clipboard} from '@capacitor/clipboard';
import {Share} from "@capacitor/share";

const store = useStore();
const snackbar = ref(false);

const firma_ad = computed(() => store.getters["settings/getAyarByKey"]("sirket_adi"))
const firma_aciklama = computed(() => store.getters["settings/getAyarByKey"]("sirket_aciklama"))
const list = computed(() => JSON.parse(store.getters['settings/getAyarByKey']('sirket_liste')));

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
</script>

<style scoped>

.no-ellipsis {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  word-break: break-word;
}
</style>