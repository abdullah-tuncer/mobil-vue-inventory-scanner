<template>
  <v-row class="ma-auto">
    <v-col cols="12" class="py-0">
      <h2>Envantere Ekle/Çıkar</h2>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-text>
          <p class="text-subtitle-1 my-2">
            <v-icon icon="mdi-information-outline"/>
            Envanterden ürün çıkarmak için negatif değer girin.
          </p>
          <p class="text-subtitle-1 my-2">
            <v-icon icon="mdi-information-outline"/>
            Eklenen ürün listede varsa toplar.
          </p>
          <v-btn-toggle v-model="item.islem_tipi" class="my-4">
            <v-btn value="sayim">Sayım</v-btn>
            <v-btn value="giris">Giriş</v-btn>
            <v-btn value="satis">Satış</v-btn>
            <v-btn value="iade">İade</v-btn>
          </v-btn-toggle>
          <v-textarea v-model="item.aciklama" class="my-2"/>
          <v-divider/>
          <v-form ref="form">
            <urun-picker
                v-model="listItem.urun"
                :rules="[(v: any) => !!v || 'Ürün seçmelisiniz']"
                class="my-2"
            />
            <v-number-input
                v-model="listItem.adet"
                :rules="[(v: any) => v != 0 || 'Adet sıfır olamaz']"
                class="my-2"
            />
          </v-form>
          <v-btn @click="addList" class="my-2" block>Ekle</v-btn>
          <v-card variant="outlined" class="mt-4">
            <v-table>
              <thead>
              <tr>
                <th>Ürün</th>
                <th>Adet</th>
                <th class="text-right">Kaldır</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(v, index) in list">
                <td>{{ v.urun.ad }}</td>
                <td>{{ v.adet }}</td>
                <td class="text-right">
                  <v-btn @click="removeListItem(index)" icon="mdi-close" size="small" color="error" variant="text"/>
                </td>
              </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn @click="router.push('/envanter')" color="secondary" block>Vazgeç</v-btn>
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
import UrunPicker from "./UrunPicker.vue";
import {useRouter} from "vue-router";
import {reactive, ref} from "vue";
import {EnvanterHareketi} from "../classes/EnvanterHareketi.ts";
import type {IEnvanterHareketiUrun, IUrun} from "../types/inventory.ts";
import inventoryService, {Tables} from "../services/inventoryService.ts";

const router = useRouter();
const form = ref();
const item = ref(new EnvanterHareketi());
const listItem = reactive({
  urun: null as IUrun | null,
  adet: 1
})
const list = reactive<Array<{ urun: IUrun, adet: number }>>([]);

const addList = async () => {
  const {valid} = await form.value?.validate();
  if (valid && listItem.urun) {
    const id = listItem.urun.id;
    let findItem = list.find(value => value.urun.id == id);
    if (findItem) {
      findItem.adet += listItem.adet;
      if (findItem.adet == 0) {
        const index = list.findIndex(value => value.urun.id == id);
        list.splice(index, 1);
      }
    } else {
      list.push({
        urun: listItem.urun,
        adet: listItem.adet
      });
    }
    listItem.urun = null;
    listItem.adet = 0;
  }
}

const removeListItem = (index: number) => {
  list.splice(index, 1);
}

const save = async () => {
  try {
    const hareketId = await inventoryService.addItem(Tables.ENVANTER_HAREKETLERI, {
      islem_tipi: item.value.islem_tipi,
      aciklama: item.value.aciklama
    });
    for (const listElement of list) {
      let hareketUrun: IEnvanterHareketiUrun = {
        envanter_hareketi_id: hareketId,
        adet: listElement.adet,
        urun_id: listElement.urun.id
      }
      await inventoryService.addItem(Tables.ENVANTER_HAREKETI_URUN, hareketUrun);
    }
    await router.push("/envanter");
  } catch (e) {
    console.error("Error - EnvanterHareketi.vue - save():", e);
  }
}

</script>

<style scoped>

</style>