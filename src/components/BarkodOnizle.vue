<template>
  <v-dialog @update:model-value="dialogDurumChange">
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
              @change="onizleInit"
              class="py-0"
              hide-details
              inline
          >
            <v-radio label="Küçük" value="small"/>
            <v-radio label="Normal" value="normal"/>
          </v-radio-group>
        </v-col>
        <v-col cols="12" class="py-0">
          <v-checkbox
              v-model="barkodAyar.yaziOlsunMu"
              @change="onizleInit"
              label="Yazı Görünsün"
              class="py-0"
              hide-details
          />
        </v-col>
        <v-col cols="12" class="py-0">
          <v-number-input v-model="barkodAyar.adet" :min="1" label="Barkod Adeti" hide-details/>
        </v-col>
        <v-col cols="12">
          <v-btn
              @click="cokluBarkodIndir()"
              color="primary"
              block
          >
            {{ barkodAyar.adet }} Adet Barkod İndir
          </v-btn>
        </v-col>
        <v-col cols="12">
          <v-btn
              @click="sayfayaSigacakBarkodIndir()"
              color="success"
              block
          >
            Sayfaya Sığacak Kadar Barkod İndir
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {BarkodOlusturucu} from "../services/BarkodOlusturucu.ts";
import {nextTick, reactive, ref} from "vue";
import {useStore} from "vuex";

const props = defineProps<{
  barkodData: string;
  barkodType: string;
}>();
const store = useStore();
const barkodAyar = reactive({
  adet: 5,
  boyut: "normal",
  yaziOlsunMu: true
});
const barkodOlusturucu = ref<BarkodOlusturucu | null>(null);

const dialogDurumChange = (val:boolean) => {
  // dialog açıldığında onizleInit başlat
  if (val)
    onizleInit();
}

const onizleInit = async () => {
  // ayarlardacustom barkod yazısı var mı kontrol et
  let customTextControl = {
    olsunMu: store.getters["settings/getAyarByKey"]("barkod_yazi_aktif"),
    yazi: store.getters["settings/getAyarByKey"]("barkod_yazi")
  };
  let yazi = barkodAyar.yaziOlsunMu ? (customTextControl.olsunMu ? customTextControl.yazi : "DEFAULT") : "NONE"
  barkodOlusturucu.value = new BarkodOlusturucu(props.barkodData, props.barkodType, (barkodAyar.boyut as "small" | "normal"), yazi);
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
</script>

<style scoped>

</style>