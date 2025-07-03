<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>Ayarlar</h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <sistem-ayarlari/>
        <v-divider/>
        <anasayfa-ayarlari/>
        <v-divider/>
        <urun-ayarlari/>
        <v-divider/>
        <p @click="versiyonSayfasi" align="center" class="text-subtitle-1 my-1 text-grey">{{ version }}</p>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import SistemAyarlari from "./SistemAyarlari.vue";
import AnasayfaAyarlari from "./AnasayfaAyarlari.vue";
import UrunAyarlari from "./UrunAyarlari.vue";
import {Browser} from '@capacitor/browser';

const version = ("v" + __APP_VERSION__)

const versiyonSayfasi = async () => {
  await Browser.open({url: 'https://github.com/abdullah-tuncer/mobil-vue-inventory-scanner/releases'});
}
</script>