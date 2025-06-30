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
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import SistemAyarlari from "./SistemAyarlari.vue";
import AnasayfaAyarlari from "./AnasayfaAyarlari.vue";
import UrunAyarlari from "./UrunAyarlari.vue";
</script>