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
              <v-btn @click="indirimUygula(0)">Yok</v-btn>
              <v-btn v-for="oran in indirimOranlari" @click="indirimUygula(oran)">%{{ oran }}</v-btn>
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
                variant="outlined"
                rounded="1"
                block
            >
              Barkod Ekle
            </v-btn>
            <v-card v-if="barkodlar.length>0" variant="outlined" class="border-t-0 rounded-t-0 mx-3" color="primary">
              <v-list>
                <v-list-item v-for="(barkod,index) in barkodlar">
                  <v-list-item-title>
                    {{ barkod.data }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ barkod.type }}
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
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {Urun} from "../classes/Urun.ts";
import InventoryService, {Tables} from "../services/inventoryService.ts";
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import barkodTaramaService from "../services/BarkodTaramaService.ts";
import {toast} from "vue3-toastify";

const router = useRouter();
const store = useStore();
const form = ref();
const item = ref(new Urun());
const barkodlar = ref<Array<any>>([]);

const indirimOranlari = computed(() => [
  Number(store.getters["settings/getAyarByKey"]("indirim_oran_1")),
  Number(store.getters["settings/getAyarByKey"]("indirim_oran_2")),
  Number(store.getters["settings/getAyarByKey"]("indirim_oran_3")),
])

const indirimUygula = (oran: number) => {
  if (oran == 0)
    item.value.indirimli_fiyat = undefined;
  else
    item.value.indirimli_fiyat = item.value.fiyat - (item.value.fiyat * (oran / 100));
}

const addBarcode = async () => {
  try {
    const barkod = await barkodTaramaService.scanBarcode();
    if (barkod)
      barkodlar.value.push(barkod);
  } catch (e: any) {
    toast.error(e.message);
  }
}

const removeBarcode = (index: number) => {
  barkodlar.value.splice(index, 1);
}

const save = async () => {
  let {valid} = await form.value.validate();
  if (valid) {
    try {
      const id = await InventoryService.addItem(Tables.URUNLER, item.value);
      for (let barkod of barkodlar.value) {
        barkod.urun_id = id;
        await InventoryService.addItem(Tables.BARKODLAR, barkod);
      }
      await router.push("/envanter?tab=urunler");
    } catch (e) {
      console.error("Error - UrunEkle.vue - save():", e);
    }
  }
}
</script>

<style scoped>

</style>