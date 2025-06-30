<template>
  <v-list>
    <v-list-subheader>
      <h2>Sistem Ayarları</h2>
    </v-list-subheader>
    <v-list-item>
      <v-list-item-title>Tema</v-list-item-title>
      <template #append>
        <v-switch v-model="tema" hide-details>
          <template #prepend>
            <v-icon>mdi-weather-sunny</v-icon>
          </template>
          <template #append>
            <v-icon>mdi-weather-night</v-icon>
          </template>
        </v-switch>
      </template>
    </v-list-item>
    <v-list-item>
      <v-list-item-title>Tablo Görünümü</v-list-item-title>
      <template #append>
        <v-switch v-model="tabloGorunumu" hide-details>
          <template #prepend>
            Varsayılan
          </template>
          <template #append>
            Mobil
          </template>
        </v-switch>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import {useSettingsStore} from "../store/settingsStore.ts";
import {computed} from "vue";

const settingsStore = useSettingsStore();

const tema = computed({
  get: () => settingsStore.getAyarByKey('tema') === 'dark',
  set: (value) => settingsStore.updateSetting('tema', (value ? 'dark' : 'light'))
});

const tabloGorunumu = computed({
  get: () => settingsStore.getAyarByKey('tablo_gorunumu') === 'mobil',
  set: (value) => settingsStore.updateSetting('tablo_gorunumu', (value ? 'mobil' : 'varsayilan'))
});
</script>