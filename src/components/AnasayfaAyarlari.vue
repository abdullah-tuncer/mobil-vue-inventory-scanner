<template>
  <v-list>
    <v-list-subheader>
      <h2>Anasayfa Ayarları</h2>
    </v-list-subheader>
    <v-list-item>
      <v-text-field v-model="sirketAdi" label="Şirket Adı" class="mt-2" data-test="sirket-ad" hide-details/>
    </v-list-item>
    <v-list-item>
      <v-textarea
          v-model="sirketAciklama"
          data-test="sirket-aciklama"
          label="Şirket Açıklama"
          class="mt-2"
          hide-details
      />
    </v-list-item>
    <v-list-item>
      <v-list class="border rounded">
        <v-list-subheader>
          <h3>Kopyalanabilir veya Paylaşılabilir Liste</h3>
        </v-list-subheader>
        <v-list-item>
          <v-text-field
              v-model="yeniListeItem"
              :disabled="onFlyList"
              placeholder="Örneğin: IBAN, Tel, Adres..."
              label="Ekle"
              class="my-2"
              hide-details
          >
            <template #append-inner>
              <v-btn @click="addListItem" :disabled="onFlyList" icon="mdi-plus" variant="text"/>
            </template>
          </v-text-field>
        </v-list-item>
        <v-divider/>
        <v-list-item v-for="(item, index) in sirketListe" :key="index">
          <v-list-item-subtitle>
            {{ item }}
          </v-list-item-subtitle>
          <template #append>
            <v-btn @click="removeListItem(index)" :disabled="onFlyList" icon="mdi-close" variant="text"/>
          </template>
        </v-list-item>
      </v-list>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import {useSettingsStore} from "../store/settingsStore.ts";
import {computed, ref} from "vue";

const settingsStore = useSettingsStore();

const sirketAdi = computed({
  get: () => settingsStore.getAyarByKey('sirket_adi') || '',
  set: (value) => settingsStore.updateSetting('sirket_adi', value)
});

const sirketAciklama = computed({
  get: () => settingsStore.getAyarByKey('sirket_aciklama') || '',
  set: (value) => settingsStore.updateSetting('sirket_aciklama', value)
});

const sirketListe = computed(() => JSON.parse(settingsStore.getAyarByKey('sirket_liste') as string));
const yeniListeItem = ref('');
const onFlyList = ref(false);

const addListItem = async () => {
  try {
    if (yeniListeItem.value.trim()) {
      onFlyList.value = true;
      let list = [...sirketListe.value];
      list.push(yeniListeItem.value);
      await settingsStore.updateSetting('sirket_liste',JSON.stringify(list));
      yeniListeItem.value = '';
    }
  } finally {
    onFlyList.value = false;
  }
};

const removeListItem = async (index: number) => {
  try {
    onFlyList.value = true;
    let list = [...sirketListe.value];
    list.splice(index, 1);
    await settingsStore.updateSetting('sirket_liste',JSON.stringify(list));
  } finally {
    onFlyList.value = false;
  }
};
</script>