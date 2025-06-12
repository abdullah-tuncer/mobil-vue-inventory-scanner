<template>
  <v-app :theme="theme">
    <v-main>
      <v-container v-show="!isScanning">
        <RouterView/>
      </v-container>
      <div v-show="isScanning" class="scanner-container">
        <div class="scan-frame"></div>
        <v-btn
            @click="stopScanning"
            style="position: absolute; bottom: 4vh; width: 90%"
            color="error"
            block
        >
          Taramayı Durdur
        </v-btn>
      </div>
    </v-main>
    <v-bottom-navigation v-show="!isScanning" v-model="activeTab" color="teal" grow>
      <v-btn @click="router.push('/ayarlar')" :value="NavLocation.AYARLAR">
        <v-icon>mdi-cog</v-icon>
        Ayarlar
      </v-btn>
      <v-btn @click="router.push('/envanter')" :value="NavLocation.ENVANTER">
        <v-icon>mdi-store</v-icon>
        Envanter
      </v-btn>
      <v-btn @click="router.push('/')" :value="NavLocation.ANASAYFA">
        <v-icon>mdi-home</v-icon>
        Anasayfa
      </v-btn>
      <v-btn @click="router.push('/satis')" :value="NavLocation.SATIS">
        <v-icon>mdi-basket</v-icon>
        Satış
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useStore} from "vuex";
import barkodTaramaService from "./services/BarkodTaramaService";
import {NavLocation} from "./router";

const router = useRouter();
const route = useRoute();
const store = useStore();
const theme = computed(() => store.getters['settings/getAyarByKey']("tema"));
const activeTab = ref(NavLocation.ANASAYFA);
const isScanning = computed(() => store.getters['scanner/isScanning']);

const stopScanning = async () => {
  await barkodTaramaService.stopContinuousScan();
  store.dispatch('scanner/stopScanning');
};

watch(() => route.meta.navLocation, (newNavLocation) => {
  activeTab.value = newNavLocation as NavLocation;
});
</script>

<style>
.transparent-bg .v-application {
  background: transparent !important;
}

.no-ellipsis {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  word-break: break-word;
}
</style>

<style scoped>
.scanner-container {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scan-frame {
  width: 80%;
  max-width: 300px;
  height: 200px;
  border: 3px solid #4CAF50;
  border-radius: 10px;
  box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);
  position: relative;
}
</style>
