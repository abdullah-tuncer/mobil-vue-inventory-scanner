<template>
  <v-app>
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
import {onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import SQLiteService from './services/sqliteService';
import inventoryService from "./services/inventoryService.ts";

// Router ve route tanımlama
const router = useRouter();
const route = useRoute();

// Aktif sekmeyi izlemek için ref
const activeTab = ref(0);

// Rota değiştiğinde aktif sekmeyi güncelle
watch(() => route.path, (newPath) => {
  if (newPath === '/ayarlar') activeTab.value = 0;
  else if (newPath === '/envanter') activeTab.value = 1;
  else if (newPath === '/') activeTab.value = 2;
  else if (newPath === '/satis') activeTab.value = 3;
});

onMounted(async () => {
  try {
    // Web platformunda SQLite'ı başlat
    if (SQLiteService.getPlatform() === 'web') {
      console.log("init Web Store");
      await SQLiteService.initWebStore();
    }

    // Örnek veritabanını başlat
    await inventoryService.initializeDatabase();

  } catch (error) {
    console.error('Error initializing database:', error);
  }
});
</script>

<style scoped>
</style>
