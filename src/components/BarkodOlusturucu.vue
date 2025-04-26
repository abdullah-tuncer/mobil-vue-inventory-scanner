<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="barkodDegeri"
          label="Barkod Değeri"
          placeholder="Barkod için değer girin"
          outlined
        ></v-text-field>
      </v-col>
      
      <v-col cols="12" sm="6">
        <v-select
          v-model="barkodTipi"
          :items="barkodTipleri"
          label="Barkod Tipi"
          outlined
        ></v-select>
      </v-col>
      
      <v-col cols="12" sm="6">
        <v-text-field
          v-model.number="barkodAdeti"
          label="Barkod Adeti"
          type="number"
          min="1"
          outlined
        ></v-text-field>
      </v-col>
      
      <v-col cols="12" sm="6">
        <v-btn 
          color="primary" 
          block 
          @click="cokluBarkodIndir"
          :disabled="!barkodDegeri"
        >
          {{ barkodAdeti }} Adet Barkod İndir
        </v-btn>
      </v-col>
      
      <v-col cols="12" sm="6">
        <v-btn 
          color="success" 
          block 
          @click="sayfayaSigacakBarkodIndir"
          :disabled="!barkodDegeri"
        >
          Sayfaya Sığacak Barkod İndir
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BarkodOlusturucu } from '../services/BarkodOlusturucu';

const barkodDegeri = ref<string>('');
const barkodTipi = ref<string>('EAN13');
const barkodAdeti = ref<number>(5);

const barkodTipleri = [
  'CODE128',
  'EAN13',
  'EAN8',
  'UPC',
  'CODE39',
  'ITF14',
  'MSI',
  'PHARMACODE'
];

const cokluBarkodIndir = () => {
  if (!barkodDegeri.value) return;
  
  const olusturucu = new BarkodOlusturucu(
    barkodDegeri.value,
    barkodTipi.value
  );
  
  olusturucu.cokluBarkodPdfIndir(barkodAdeti.value);
};

const sayfayaSigacakBarkodIndir = () => {
  if (!barkodDegeri.value) return;
  
  const olusturucu = new BarkodOlusturucu(
    barkodDegeri.value,
    barkodTipi.value
  );
  
  olusturucu.sayfayaSigacakBarkodPdfIndir();
};
</script>