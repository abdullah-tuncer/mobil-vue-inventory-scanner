<template>
<v-row>
<v-col cols="12" align="center">
 <h1>{{firma_ad}}</h1>
</v-col>
<v-col cols="12">
  {{firma_aciklama}}
</v-col>
<v-col cols="12">
  <v-list>
    <v-list-item v-for="str in list">
      <v-list-item-title class="no-ellipsis">{{str}}</v-list-item-title>
      <template #append>
        <v-icon @click="kopyala">mdi-content-copy</v-icon>
        <v-icon @click="paylas" class="ml-2">mdi-share</v-icon>
      </template>
    </v-list-item>
  </v-list>
</v-col>
</v-row>
</template>

<script setup lang="ts">
const firma_ad="Deneme Firma"
const firma_aciklama="Kuruluşumuzdan bu yana, inşaat sektöründeki öncü firmalardan biri olarak kaliteli işler üretmek için sürekli çaba gösteriyoruz. İşimize adanmışlık, deneyim ve yaratıcılık ile, müşterilerimizin beklentilerini karşılamak için projelerimize özen gösteriyoruz. Firmamız, geniş bir yelpazede inşaat hizmetleri sunmaktadır. Müşterilerimizin ihtiyaçlarını anlamak ve ihtiyaçlarına yönelik en uygun çözümleri üretmek için projelerimize özenle yaklaşıyoruz. Bu, müşterilerimiz için en iyi sonuçları elde ettiğimizi garanti etmemizi sağlar."
const list=[
    "TR76 0009 9012 3456 7800 1000 01",
    "0555 400 2010",
    "Gazi Mehmet mah. 5500 sk. no:61 k:1 d:1 Bornova/İzmir"
]

const kopyala = () => {
  console.log("kopyalandı")
}

const paylas = () => {
  console.log("paylasildi")
}
</script>

<style scoped>

.no-ellipsis {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  word-break: break-word;
}
</style>