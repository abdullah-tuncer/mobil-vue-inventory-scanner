<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>Ayarlar</h2>
    </v-col>
    <v-col cols="12">
      <v-card>
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

        <v-divider/>

        <v-list>
          <v-list-subheader>
            <h2>Anasayfa Ayarları</h2>
          </v-list-subheader>
          <v-list-item>
            <v-text-field v-model="sirketAdi" label="Şirket Adı" class="mt-2" hide-details/>
          </v-list-item>
          <v-list-item>
            <v-textarea v-model="sirketAciklama" label="Şirket Açıklama" class="mt-2" hide-details/>
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

        <v-divider/>

        <v-list>
          <v-list-subheader>
            <h2>Ürün Ayarları</h2>
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
                  Silinen ürünler buradan geri alınabilir. Geri alma işleminden sonra Envanter > Ürünler kısmından kontrol edilebilir.
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
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import type {IUrun} from "../types/inventory.ts";
import inventoryService from "../services/inventoryService.ts";
import {useSettingsStore} from "../store/settingsStore.ts";

const settingsStore = useSettingsStore();

const search = ref("");
const silinenUrunler = ref<Array<IUrun>>([]);
const silinenUrunlerHeaders = [
  {title: "Ürün", value: "ad"},
  {title: "İşlem", key: "islem", sortable: false, width: 60, align: "center" as const}
];

const tema = computed({
  get: () => settingsStore.getAyarByKey('tema') === 'dark',
  set: (value) => settingsStore.updateSetting('tema', (value ? 'dark' : 'light'))
});

const tabloGorunumu = computed({
  get: () => settingsStore.getAyarByKey('tablo_gorunumu') === 'mobil',
  set: (value) => settingsStore.updateSetting('tablo_gorunumu', (value ? 'mobil' : 'varsayilan'))
});

const sirketAdi = computed({
  get: () => settingsStore.getAyarByKey('sirket_adi') || '',
  set: (value) => settingsStore.updateSetting('sirket_adi', value)
});

const sirketAciklama = computed({
  get: () => settingsStore.getAyarByKey('sirket_aciklama') || '',
  set: (value) => settingsStore.updateSetting('sirket_aciklama', value)
});

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
  set: (value) => settingsStore.updateSetting('indirim_oran_3',value.toString())
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

const loadSilinenUrunler = async () => {
  silinenUrunler.value = await inventoryService.deletedUrunler();
}

const urunGeriAl = async (item: IUrun) => {
  await inventoryService.restoreUrun(item.id);
  await loadSilinenUrunler();
}
</script>