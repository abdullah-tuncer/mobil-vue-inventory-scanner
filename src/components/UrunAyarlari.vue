<template>
  <v-list>
    <v-list-subheader>
      <h2 class="mt-1">Ürün Ayarları</h2>
    </v-list-subheader>
    <v-list-item>
      <v-checkbox v-model="barkodYaziAktif" label="Barkod yazısını özelleştir" class="pb-0" hide-details/>
      <v-text-field v-model="barkodYazi" :disabled="!barkodYaziAktif" label="Özelleştirilmiş yazı"/>
    </v-list-item>
    <v-list-item>
      <v-list-item-title>İndirim Uygulama Butonları</v-list-item-title>
      <v-row class="my-auto">
        <v-col cols="12">
          <v-number-input v-model="indirimOran1" label="1. İndirim Oranı" prefix="%" hide-details/>
        </v-col>
        <v-col cols="12">
          <v-number-input v-model="indirimOran2" label="2. İndirim Oranı" prefix="%" hide-details/>
        </v-col>
        <v-col cols="12">
          <v-number-input v-model="indirimOran3" label="3. İndirim Oranı" prefix="%" hide-details/>
        </v-col>
      </v-row>
    </v-list-item>
    <v-dialog @update:model-value="v => v && loadSilinenUrunler()">
      <template #activator="{props}">
        <v-list-item v-bind="props" prepend-icon="mdi-delete">
          <v-list-item-title>Geri Dönüşüm Kutusu</v-list-item-title>
        </v-list-item>
      </template>
      <template #default="{isActive}">
        <v-card title="Geri Dönüşüm Kutusu">
          <v-card-subtitle class="no-ellipsis">
            Silinen ürünler buradan geri alınabilir. Geri alma işleminden sonra Envanter > Ürünler kısmından kontrol
            edilebilir.
          </v-card-subtitle>
          <v-card-text>
            <v-data-table
                :headers="silinenUrunlerHeaders"
                :items="silinenUrunler"
                :search="search"
            >
              <template #top>
                <v-text-field
                    v-model="search"
                    prepend-inner-icon="mdi-magnify"
                    variant="solo-filled"
                    density="compact"
                    class="my-2"
                    label="Ara"
                    hide-details
                    single-line
                    clearable
                    flat
                />
              </template>
              <template #[`item.islem`]="{item}">
                <v-btn @click="urunGeriAl(item)" variant="text" icon="mdi-undo-variant" color="yellow"/>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn @click="isActive.value=false" color="secondary">Kapat</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-list>
</template>

<script setup lang="ts">
import {useSettingsStore} from "../store/settingsStore.ts";
import {computed, ref} from "vue";
import type {IUrun} from "../types/inventory.ts";
import inventoryService from "../services/inventoryService.ts";

const settingsStore = useSettingsStore();

const barkodYaziAktif = computed({
  get: () => settingsStore.getAyarByKey('barkod_yazi_aktif') === 'true',
  set: (value) => settingsStore.updateSetting('barkod_yazi_aktif', (value ? 'true' : 'false'))
});

const barkodYazi = computed({
  get: () => settingsStore.getAyarByKey('barkod_yazi') || '',
  set: (value) => settingsStore.updateSetting('barkod_yazi', value)
});

const indirimOran1 = computed({
  get: () => Number(settingsStore.getAyarByKey('indirim_oran_1')),
  set: (value) => settingsStore.updateSetting('indirim_oran_1', value.toString())
});

const indirimOran2 = computed({
  get: () => Number(settingsStore.getAyarByKey('indirim_oran_2')),
  set: (value) => settingsStore.updateSetting('indirim_oran_2', value.toString())
});

const indirimOran3 = computed({
  get: () => Number(settingsStore.getAyarByKey('indirim_oran_3')),
  set: (value) => settingsStore.updateSetting('indirim_oran_3', value.toString())
});

const search = ref("");
const silinenUrunler = ref<Array<IUrun>>([]);
const silinenUrunlerHeaders = [
  {title: "Ürün", value: "ad"},
  {title: "İşlem", key: "islem", sortable: false, width: 60, align: "center" as const}
];

const loadSilinenUrunler = async () => {
  silinenUrunler.value = await inventoryService.deletedUrunler();
}

const urunGeriAl = async (item: IUrun) => {
  await inventoryService.restoreUrun(item.id);
  await loadSilinenUrunler();
}
</script>