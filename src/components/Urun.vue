<template>
  <v-row class="ma-auto">
    <v-col cols="10">
      <h2>{{ urun.ad }}</h2>
    </v-col>
    <v-col align="right" cols="2">
      <v-btn v-if="!duzenleAktif" @click="duzenleAktif=true" icon="mdi-pen" variant="text" class="mt-n2 mr-n2"/>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-actions v-if="duzenleAktif">
          <v-row>
            <v-col cols="6">
              <v-btn @click="duzenleAktif=false" color="secondary" block>Vazgeç</v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn @click="duzenleAktif=false" color="primary" block>Kaydet</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
        <v-row class="ma-auto">
          <v-col cols="12">
            <span v-if="!duzenleAktif">
            <v-label>Ad:</v-label>
            {{ urun.ad }}
            </span>
            <v-text-field
                v-else
                v-model="urun.ad"
                :rules="[v=>!!v||'Lütfen burayı doldurun.']"
                label="Ad"
            />
          </v-col>
          <v-col cols="12">
            <span v-if="!duzenleAktif">
            <v-label>Açıklama:</v-label>
            <br>
            {{ urun.aciklama }}
            </span>
            <v-textarea
                v-else
                v-model="urun.aciklama"
                label="Açıklama"
            />
          </v-col>
          <v-col v-if="!duzenleAktif" cols="6">
            <v-label>Fiyat:</v-label>
            {{ urun.fiyat }}₺
          </v-col>
          <v-col cols="6" v-if="urun.indirimli_fiyat && !duzenleAktif">
            <v-label>İndirimli Fiyat:</v-label>
            {{ urun.indirimli_fiyat }}₺
          </v-col>
          <v-col v-if="duzenleAktif" cols="12">
            <v-text-field
                v-model="urun.fiyat"
                :rules="[v=>!!v||'Lütfen burayı doldurun.']"
                label="Fiyat"
                type="number"
            />
          </v-col>
          <v-col v-if="duzenleAktif" cols="12">
            <v-label>İndirim Uygula</v-label>
            <v-btn-toggle rounded="1" variant="outlined" class="mb-2" color="primary" divided>
              <v-btn>Yok</v-btn>
              <v-btn>%10</v-btn>
              <v-btn>%25</v-btn>
              <v-btn>%50</v-btn>
              <v-btn>Özel</v-btn>
            </v-btn-toggle>
            <v-text-field
                v-model="urun.indirimli_fiyat"
                label="İndirimli Fiyat"
                type="number"
                class="my-2"
            />
          </v-col>
          <v-col cols="12">

            <v-btn v-if="duzenleAktif" prepend-icon="mdi-barcode-scan" rounded="1" variant="outlined" block>Barkod
              Ekle
            </v-btn>
            <v-card
                :variant="duzenleAktif? 'outlined':'elevated'"
                :color="duzenleAktif? 'primary':undefined"
                class="border-t-0 rounded-t-0 mx-3"
            >
              <v-list>
                <v-list-item>
                  <v-list-item-title>
                    8690000000059
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    EAN13
                  </v-list-item-subtitle>
                  <template #append v-if="duzenleAktif">
                    <v-icon>mdi-close</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col v-if="!duzenleAktif" cols="12">
            <v-tabs v-model="tab" align-tabs="center" grow>
              <v-tab value="tablo" prepend-icon="mdi-table"/>
              <v-tab value="grafik" prepend-icon="mdi-chart-line"/>
            </v-tabs>
            <v-tabs-window v-model="tab">
              <v-tabs-window-item value="tablo">
                <v-data-table
                    :headers="headers"
                    :items="items"
                >
                </v-data-table>
              </v-tabs-window-item>
              <v-tabs-window-item value="grafik">
                grafikelr
              </v-tabs-window-item>
            </v-tabs-window>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";

const duzenleAktif = ref(false);
const tab = ref("tablo");

const urun = ref({
  id: 0,
  ad: "Deneme",
  aciklama: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pellentesque, eros eget auctor viverra, metus mi semper leo, eu imperdiet lorem metus non leo. Nulla molestie augue nec tortor malesuada malesuada. Aenean accumsan magna in tortor convallis, vitae accumsan felis mollis. Fusce iaculis, urna tincidunt lacinia sagittis, tellus lorem feugiat elit, in pretium sem felis et dui. Aenean posuere quam commodo velit ornare, faucibus sagittis augue blandit. Donec ultrices viverra commodo. Nulla id enim sapien. Aenean lacus tortor, ultricies ut ex non, euismod condimentum sapien. Nullam ac metus ac ipsum lobortis iaculis eu nec nisi. Morbi ligula justo, rhoncus facilisis ullamcorper eget, semper in ex. Etiam sed leo et elit semper tincidunt at laoreet nunc.",
  fiyat: 20,
  indirimli_fiyat: 10,
  created_at: "2024-02-26 13:01:35",
  updated_at: undefined
});

const headers = ref([
  {title: "Tarih", value: "created_at", key: "created_at"},
  {title: "Adet", value: "adet", key: "adet"},
  {title: "Tutar", value: "tutar", key: "tutar", align: "end" as const}
]);

const items = ref([
  {
    created_at: "2025-04-23T08:18:44.377Z",
    adet: 4,
    tutar: 86
  },
  {
    created_at: "2025-03-21T08:18:44.377Z",
    adet: 12,
    tutar: 806
  },
  {
    created_at: "2025-03-05T08:18:44.377Z",
    adet: 1,
    tutar: 22
  },
  {
    created_at: "2025-02-19T08:18:44.377Z",
    adet: 1,
    tutar: 22
  }
]);

onMounted(()=>{

})


</script>

<style scoped>

</style>