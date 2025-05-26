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
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {useStore} from 'vuex';

const store = useStore();

const tema = computed({
  get: () => store.getters['settings/getAyarByKey']('tema') === 'dark',
  set: (value) => store.dispatch('settings/updateSetting', {
    key: 'tema',
    value: value ? 'dark' : 'light'
  })
});

const tabloGorunumu = computed({
  get: () => store.getters['settings/getAyarByKey']('tablo_gorunumu') === 'mobil',
  set: (value) => store.dispatch('settings/updateSetting', {
    key: 'tablo_gorunumu',
    value: value ? 'mobil' : 'varsayilan'
  })
});

const sirketAdi = computed({
  get: () => store.getters['settings/getAyarByKey']('sirket_adi') || '',
  set: (value) => store.dispatch('settings/updateSetting', {
    key: 'sirket_adi',
    value
  })
});

const sirketAciklama = computed({
  get: () => store.getters['settings/getAyarByKey']('sirket_aciklama') || '',
  set: (value) => store.dispatch('settings/updateSetting', {
    key: 'sirket_aciklama',
    value
  })
});

const barkodYaziAktif = computed({
  get: () => store.getters['settings/getAyarByKey']('barkod_yazi_aktif') === 'true',
  set: (value) => store.dispatch('settings/updateSetting', {
    key: 'barkod_yazi_aktif',
    value: value ? 'true' : 'false'
  })
});

const barkodYazi = computed({
  get: () => store.getters['settings/getAyarByKey']('barkod_yazi') || '',
  set: (value) => store.dispatch('settings/updateSetting', {
    key: 'barkod_yazi',
    value
  })
});

const indirimOran1 = computed({
  get: () => Number(store.getters['settings/getAyarByKey']('indirim_oran_1')),
  set: (value) => store.dispatch('settings/updateSetting', {
    key: 'indirim_oran_1',
    value: value.toString()
  })
});

const indirimOran2 = computed({
  get: () => Number(store.getters['settings/getAyarByKey']('indirim_oran_2')),
  set: (value) => store.dispatch('settings/updateSetting', {
    key: 'indirim_oran_2',
    value: value.toString()
  })
});

const indirimOran3 = computed({
  get: () => Number(store.getters['settings/getAyarByKey']('indirim_oran_3')),
  set: (value) => store.dispatch('settings/updateSetting', {
    key: 'indirim_oran_3',
    value: value.toString()
  })
});

const sirketListe = computed(() => JSON.parse(store.getters['settings/getAyarByKey']('sirket_liste')));
const yeniListeItem = ref('');
const onFlyList = ref(false);

const addListItem = async () => {
  try {
    if (yeniListeItem.value.trim()) {
      onFlyList.value = true;
      let list = [...sirketListe.value];
      list.push(yeniListeItem.value);
      await store.dispatch('settings/updateSetting', {
        key: 'sirket_liste',
        value: JSON.stringify(list)
      });
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
    await store.dispatch('settings/updateSetting', {
      key: 'sirket_liste',
      value: JSON.stringify(list)
    });
  } finally {
    onFlyList.value = false;
  }
};
</script>

<style scoped>

</style>