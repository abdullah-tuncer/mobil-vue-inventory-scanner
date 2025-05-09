<template>
  <v-app :theme="theme">
    <v-main>
      <v-container>
        <RouterView/>
      </v-container>
    </v-main>
    <v-bottom-navigation v-model="activeTab" color="teal" grow>
      <v-btn @click="router.push('/ayarlar')">
        <v-icon>mdi-cog</v-icon>
        Ayarlar
      </v-btn>
      <v-btn @click="router.push('/envanter')">
        <v-icon>mdi-store</v-icon>
        Envanter
      </v-btn>
      <v-btn @click="router.push('/')">
        <v-icon>mdi-home</v-icon>
        Anasayfa
      </v-btn>
      <v-btn @click="router.push('/satis')">
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

const router = useRouter();
const route = useRoute();
const store = useStore();

const theme = computed(()=> store.getters['settings/getAyarByKey']("tema"));
const activeTab = ref(2);

watch(() => route.path, (newPath) => {
  if (newPath === '/ayarlar') activeTab.value = 0;
  else if (newPath === '/envanter') activeTab.value = 1;
  else if (newPath === '/') activeTab.value = 2;
  else if (newPath === '/satis') activeTab.value = 3;
});
</script>

<style scoped>
</style>
