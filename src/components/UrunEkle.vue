<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>Ürün Ekle</h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
                v-model="item.ad"
                :rules="[v=>!!v||'Lütfen burayı doldurun.']"
                label="Ad"
                class="my-2"
            />
            <v-textarea
                v-model="item.aciklama"
                label="Açıklama"
                class="my-2"
            />
            <v-text-field
                v-model="item.fiyat"
                :rules="[v=>!!v||'Lütfen burayı doldurun.']"
                label="Fiyat"
                type="number"
                class="my-2"
            />
            <v-label>İndirim Uygula</v-label>
            <br>
            <v-btn-toggle rounded="1" variant="outlined" class="mb-2" color="primary" divided>
              <v-btn>Yok</v-btn>
              <v-btn>%10</v-btn>
              <v-btn>%25</v-btn>
              <v-btn>%50</v-btn>
            </v-btn-toggle>
            <v-text-field
                v-model="item.indirimli_fiyat"
                label="İndirimli Fiyat"
                type="number"
                class="my-2"
            />
            <v-btn
                @click="addBarcode"
                prepend-icon="mdi-barcode-scan"
                rounded="1"
                variant="outlined"
                block
            >
              Barkod Ekle
            </v-btn>
            <v-card v-if="barkodlar.length>0" variant="outlined" class="border-t-0 rounded-t-0 mx-3" color="primary">
              <v-list>
                <v-list-item v-for="(barkod,index) in barkodlar">
                  <v-list-item-title>
                    {{barkod.data}}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{barkod.type}}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-icon @click="removeBarcode(index)">mdi-close</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn @click="router.push('/envanter?tab=urunler')" color="secondary" block>Vazgeç</v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn @click="save" color="primary" block>Kaydet</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <audio ref="beepSound" src="/beep.mp3" preload="auto"></audio>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {Urun} from "../classes/Urun.ts";
import InventoryService, {Tables} from "../services/inventoryService.ts";
import {BarcodeScanner} from "@capacitor-mlkit/barcode-scanning";
//import type {IBarkod} from "../types/inventory.ts";
import {useRouter} from "vue-router";

const form = ref();
const item = ref(new Urun());
const barkodlar = ref<Array<any>>([]);
const beepSound = ref<HTMLAudioElement | null>(null);
const router = useRouter();


const save = async () => {
  let {valid} = await form.value.validate();
  if (valid) {
    try {
      const id = await InventoryService.addItem(Tables.URUNLER, item.value);
      for (let barkod of barkodlar.value){
        barkod.urun_id = id;
        await InventoryService.addItem(Tables.BARKODLAR, barkod);
      }
      await router.push("/envanter?tab=urunler");
    } catch (e) {
      console.error("Error - UrunEkle - save():",e);
    }
  }
}

const addBarcode = async () => {
  const granted = await requestPermissions();
  if (!granted) {
    // snackbar.value = true;
    console.log('granted',granted)
    return;
  }
  const { barcodes } = await BarcodeScanner.scan();
  if (barcodes.length > 0) {
    playBeepSound(); // Barkod tarandığında bip sesi çal
    barkodlar.value.push({type: barcodes[0].format, data: barcodes[0].rawValue});
  }
}

// Bip sesi çalma fonksiyonu
const playBeepSound = () => {
  if (beepSound.value) {
    beepSound.value.currentTime = 0;
    beepSound.value.play().catch(err => {
      console.error("Ses çalınamadı:", err);
    });
  }
};

const requestPermissions = async (): Promise<boolean> => {
  const { camera } = await BarcodeScanner.requestPermissions();
  return camera === 'granted' || camera === 'limited';
};

const removeBarcode = (index: number) => {
  barkodlar.value.splice(index, 1);
}
</script>

<style scoped>

</style>