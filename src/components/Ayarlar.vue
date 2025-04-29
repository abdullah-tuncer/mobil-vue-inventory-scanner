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
          <v-list-item @click="()=>{}">
            <v-list-item-title>Tema</v-list-item-title>
            <template #append>
              <!--        <v-icon>mdi-weather-sunny</v-icon>-->
              <v-icon>mdi-weather-night</v-icon>
            </template>
          </v-list-item>
          <v-list-item @click="()=>{}">
            <v-list-item-title>Tablo Görünümü</v-list-item-title>
            <template #append>
              <v-switch hide-details>
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
            <v-text-field label="Şirket Adı" hide-details class="mt-2">
            </v-text-field>
          </v-list-item>
          <v-list-item>
            <v-textarea label="Şirket Açıklama" hide-details class="mt-2">
            </v-textarea>
          </v-list-item>
          <v-list-item>
            <v-list class="border rounded">
              <v-list-subheader>
                <h3>Kopyalanabilir veya Paylaşılabilir Liste</h3>
              </v-list-subheader>
              <v-list-item>
                <v-text-field label="Ekle" placeholder="Örneğin: IBAN, Tel, Adres..." hide-details class="my-2">
                  <template #append-inner>
                    <v-btn icon="mdi-plus" @click="()=>{}" variant="text"/>
                  </template>
                </v-text-field>
              </v-list-item>
              <v-divider/>
              <v-list-item>
                <v-list-item-subtitle>
                  TR76 0009 9012 3456 7800 1000 01
                </v-list-item-subtitle>
                <template #append>
                  <v-btn icon="mdi-close" @click="()=>{}" variant="text"/>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-subtitle>
                  0555 400 2010
                </v-list-item-subtitle>
                <template #append>
                  <v-btn icon="mdi-close" @click="()=>{}" variant="text"/>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-subtitle>
                  Gazi Mehmet mah. 5500 sk. no:61 k:1 d:1 Bornova/İzmir
                </v-list-item-subtitle>
                <template #append>
                  <v-btn icon="mdi-close" @click="()=>{}" variant="text"/>
                </template>
              </v-list-item>
            </v-list>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>