<template>
  <v-row class="ma-auto">
    <v-col cols="10" class="py-0">
      <h2>
        <v-btn @click="router.back()" variant="text" icon="mdi-arrow-left" class="mt-n1 ml-n4"/>
        {{ urun.ad }}
      </h2>
    </v-col>
    <v-col align="right" cols="2" class="py-0">
      <v-btn v-if="!duzenleAktif" @click="duzenleAktif=true" icon="mdi-pen" variant="text" class="mt-n1 mr-n2"/>
    </v-col>
    <v-col cols="12">
      <v-card v-if="duzenleAktif">
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn @click="cancel" color="secondary" block>Vazgeç</v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn @click="save" color="primary" block>Kaydet</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
        <v-row class="ma-auto">
          <v-col cols="12">
            <v-text-field
                v-model="urunDuzenle.ad"
                :rules="[v=>!!v||'Lütfen burayı doldurun.']"
                label="Ad"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
                v-model="urunDuzenle.aciklama"
                label="Açıklama"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
                v-model="urunDuzenle.fiyat"
                :rules="[v=>!!v||'Lütfen burayı doldurun.']"
                label="Fiyat"
                type="number"
            />
          </v-col>
          <v-col cols="12">
            <v-label>İndirim Uygula</v-label>
            <br>
            <v-btn-toggle rounded="1" variant="outlined" class="mb-2" color="primary" divided>
              <v-btn>Yok</v-btn>
              <v-btn>%10</v-btn>
              <v-btn>%25</v-btn>
              <v-btn>%50</v-btn>
            </v-btn-toggle>
            <v-text-field
                v-model="urunDuzenle.indirimli_fiyat"
                label="İndirimli Fiyat"
                type="number"
                class="my-2"
                hide-details
            />
          </v-col>
          <v-col cols="12">
            <v-alert variant="outlined" type="info">
              Bazı ürünlerde barkod bulunmayabilir. Bu durumda, uygulamanın tanıyabileceği özel bir barkod
              oluşturabilirsiniz.
              Oluşturduğunuz barkodu yazdırabilir ve ürüne yapıştırabilirsiniz. Bu barkod, ürünü hızlıca taramanıza ve
              bulmanıza yardımcı olacaktır.

              <v-btn @click="createCustomBarcode" prepend-icon="mdi-barcode" rounded="1" variant="outlined" block>
                Özel Barkod Oluştur
              </v-btn>
            </v-alert>


          </v-col>
          <v-col cols="12">
            <v-btn @click="addBarcode" prepend-icon="mdi-barcode-scan" rounded="1" variant="outlined" block>
              Barkod Ekle
            </v-btn>
            <v-card
                class="border-t-0 rounded-t-0 mx-3"
                variant="outlined"
                color="primary"
            >
              <v-list>
                <v-list-item v-if="filteredBarkodlar.length>0" v-for="(barkod,index) in filteredBarkodlar">
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
                <v-list-item v-else>
                  <v-list-item-title>
                    Ürüne tanımlı barkod bulunamadı.
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
      <v-card v-else>
        <v-row class="ma-auto">
          <v-col cols="12">
            <v-label>Ad:</v-label>
            {{ urun.ad }}
          </v-col>
          <v-col cols="12">
            <v-label>Açıklama:</v-label>
            <br>
            {{ urun.aciklama }}
          </v-col>
          <v-col cols="12">
            <v-card variant="outlined" color="secondary" align="center">
              <v-card-title class="pt-0">Fiyat</v-card-title>
              <v-divider/>
              <v-card-text>
                <v-row v-if="urun.indirimli_fiyat">
                  <v-col cols="4">
                    <v-row>
                      <v-col align-self="center" cols="12" class="border-e border-b">
                        <h3>
                          <del>{{ urun.fiyat }}₺</del>
                        </h3>
                      </v-col>
                      <v-col align-self="center" cols="12" class="border-e">
                        <h3>
                          <v-icon icon="mdi-arrow-down" size="x-small"/>
                          %{{ indirimOrani(urun) }}
                        </h3>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col align-self="center" cols="8">
                    <h1>{{ urun.indirimli_fiyat }}₺</h1>
                  </v-col>
                </v-row>
                <v-row v-else>
                  <v-col align-self="center" cols="12">
                    <h1>{{ urun.fiyat }}₺</h1>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card variant="outlined" color="secondary">
              <v-card-title class="pt-0" align="center">Barkodlar</v-card-title>
              <v-divider/>
              <v-list>
                <v-list-item v-if="urun.barkodlar.length>0" v-for="barkod in urun.barkodlar">
                  <v-list-item-title>
                    {{ barkod.data }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ barkod.type }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-dialog @update:model-value="val => val && onizleInit(barkod.data, barkod.type)">
                      <template #activator="{props}">
                        <v-icon v-bind="props">mdi-printer</v-icon>
                      </template>
                      <v-card>
                        <v-row class="ma-auto">
                          <v-col cols="12" align="center" style="background: white">
                            <div class="pa-1" id="barkodContainer"></div>
                          </v-col>
                          <v-col cols="12" align="center" class="py-0">
                            <p id="barkodOlculeri">?x? mm</p>
                          </v-col>
                          <v-col cols="12" class="py-0">
                            <v-radio-group
                                v-model="barkodAyar.boyut"
                                @change="onizleInit(barkod.data, barkod.type)"
                                class="py-0"
                                inline
                                hide-details
                            >
                              <v-radio label="Küçük" value="small"/>
                              <v-radio label="Normal" value="normal"/>
                            </v-radio-group>
                          </v-col>
                          <v-col cols="12" class="py-0">
                            <v-checkbox
                                v-model="barkodAyar.yaziOlsunMu"
                                @change="onizleInit(barkod.data, barkod.type)"
                                label="Yazı Görünsün"
                                class="py-0"
                                hide-details
                            />
                          </v-col>
                          <v-col cols="12" class="py-0">
                            <v-number-input v-model="barkodAyar.adet" label="Barkod Adeti" :min="1" hide-details/>
                          </v-col>
                          <v-col cols="12">
                            <v-btn
                                color="primary"
                                block
                                @click="cokluBarkodIndir()"
                            >
                              {{ barkodAyar.adet }} Adet Barkod İndir
                            </v-btn>
                          </v-col>
                          <v-col cols="12">
                            <v-btn
                                color="success"
                                block
                                @click="sayfayaSigacakBarkodIndir()"
                            >
                              Sayfaya Sığacak Kadar Barkod İndir
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-dialog>
                  </template>
                </v-list-item>
                <v-list-item v-else>
                  <v-list-item-title>
                    Ürüne tanımlı barkod bulunamadı.
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12">
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
  <audio ref="beepSound" src="/beep.mp3" preload="auto"></audio>
</template>

<script setup lang="ts">

import {computed, nextTick, onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import inventoryService, {Tables} from "../services/inventoryService.ts";
import {BarcodeScanner} from "@capacitor-mlkit/barcode-scanning";
import {BarkodOlusturucu} from "../services/BarkodOlusturucu.ts";

const router = useRouter();
const route = useRoute();
const duzenleAktif = ref(false);
const tab = ref("tablo");

const urun = ref<any>(null);
const urunDuzenle = ref<any>(null);
const headers = ref([
  {title: "Tarih", value: "created_at", key: "created_at"},
  {title: "Adet", value: "adet", key: "adet"},
  {title: "Tutar", value: "tutar", key: "tutar", align: "end" as const}
]);

const barkodAyar = reactive({
  adet: 5,
  boyut: "normal",
  yaziOlsunMu: true
});
const barkodOlusturucu = ref<BarkodOlusturucu | null>(null);

const onizleInit = async (data: string, type: string) => {
  // ayarlardacustom barkod yazısı var mı kontrol et
  let customTextControl = {
    olsunMu: false,
    yazi: ""
  };
  let yazi = barkodAyar.yaziOlsunMu ? (customTextControl.olsunMu ? customTextControl.yazi : "DEFAULT") : "NONE"
  barkodOlusturucu.value = new BarkodOlusturucu(data, type, (barkodAyar.boyut as "small" | "normal"), yazi);
  const barkodElement = barkodOlusturucu.value.barkodCanvas;

  await nextTick();
  let container = document.getElementById('barkodContainer');
  if (container) {
    container.innerHTML = '';
    container.appendChild(barkodElement);
  }
  let barkodOlculeri = document.getElementById('barkodOlculeri');
  if (barkodOlculeri) {
    barkodOlculeri.innerHTML = Math.floor(barkodOlusturucu.value.barkodGenislikMm) + "x" + Math.floor(barkodOlusturucu.value.barkodYukseklikMm) + " mm";
  }
}

const cokluBarkodIndir = () => {
  if (barkodOlusturucu.value)
    barkodOlusturucu.value.cokluBarkodPdfIndir(barkodAyar.adet);
}
const sayfayaSigacakBarkodIndir = () => {
  if (barkodOlusturucu.value)
    barkodOlusturucu.value.sayfayaSigacakBarkodPdfIndir();
}

onMounted(async () => {
  await load();
})

const load = async () => {
  const id = route.params.id as string;
  urun.value = await inventoryService.getItemById(Tables.URUNLER, id);
  urunDuzenle.value = JSON.parse(JSON.stringify(urun.value));
  if (urunDuzenle.value?.barkodlar) {
    urunDuzenle.value.barkodlar.forEach((barkod: any) => barkod.isDeleted = false);
  }
}

const indirimOrani = (urun: any) => {
  let oran = indirimOraniHesapla(urun.fiyat, urun.indirimli_fiyat);
  return Number(oran).toFixed(1);
}

// TODO: helpera eklenecek
const indirimOraniHesapla = (fiyat: number, indirimli_fiyat: number): number => {
  let oran = 100 - ((indirimli_fiyat / fiyat) * 100);
  return oran;
}

const filteredBarkodlar = computed(() => {
  return urunDuzenle.value.barkodlar.filter((barkod: any) => !barkod.isDeleted);
});

const removeBarcode = (index: number) => {
  let barkod = filteredBarkodlar.value[index];
  if (barkod.id) {
    urunDuzenle.value.barkodlar.find((v: any) => v.id == barkod.id).isDeleted = true;
  } else {
    let findedIndex = urunDuzenle.value.barkodlar.findIndex((v: any) => v == barkod);
    urunDuzenle.value.barkodlar.splice(findedIndex, 1);
  }
}

// TODO: servis yapılmaya çalışılcak

const addBarcode = async () => {
  const granted = await requestPermissions();
  if (!granted) {
    // snackbar.value = true;
    // TODO: toast eklenecek
    console.log('granted', granted)
    return;
  }
  const {barcodes} = await BarcodeScanner.scan();
  if (barcodes.length > 0) {
    playBeepSound(); // Barkod tarandığında bip sesi çal
    urunDuzenle.value.barkodlar.push({type: barcodes[0].format, data: barcodes[0].rawValue, isDeleted: false});
  }
}

const save = async () => {
  try {
    let barkodlar = [...urunDuzenle.value.barkodlar];
    let newData = urunDuzenle.value;
    delete newData.barkodlar;

    console.log('newDAta', JSON.stringify(newData));
    console.log('barkodlar', JSON.stringify(barkodlar));

    await inventoryService.updateItem(Tables.URUNLER, newData);

    const deletedBarkodlar = barkodlar.filter((b: any) => b.isDeleted && b.id);
    for (const barkod of deletedBarkodlar) {
      await inventoryService.deleteItem(Tables.BARKODLAR, barkod.id);
    }

    const newBarkodlar = barkodlar.filter((b: any) => !b.isDeleted && !b.id);
    for (const barkod of newBarkodlar) {
      await inventoryService.addItem(Tables.BARKODLAR, {
        urun_id: newData.id,
        data: barkod.data,
        type: barkod.type,
        created_at: new Date().toISOString()
      });
    }

    await load();
  } catch (e: any) {
    console.error('Urun.vue - save :', e.message)
  } finally {
    duzenleAktif.value = false
  }
}

const cancel = () => {
  urunDuzenle.value = JSON.parse(JSON.stringify(urun.value));
  if (urunDuzenle.value?.barkodlar) {
    urunDuzenle.value.barkodlar.forEach((barkod: any) => barkod.isDeleted = false);
  }
  duzenleAktif.value = false;
}

// Bip sesi çalma fonksiyonu
const beepSound = ref<HTMLAudioElement | null>(null);
const playBeepSound = () => {
  if (beepSound.value) {
    beepSound.value.currentTime = 0;
    beepSound.value.play().catch(err => {
      console.error("Ses çalınamadı:", err);
    });
  }
};

const requestPermissions = async (): Promise<boolean> => {
  const {camera} = await BarcodeScanner.requestPermissions();
  return camera === 'granted' || camera === 'limited';
};


const createCustomBarcode = () => {
  const timestamp = new Date().getTime();
  const barcodeData = `${urunDuzenle.value.id}-${timestamp}`;
  urunDuzenle.value.barkodlar.push({
    data: barcodeData,
    type: "CODE_128",
    isDeleted: false
  });
};

// *********

// mock data
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
</script>

<style scoped>
</style>