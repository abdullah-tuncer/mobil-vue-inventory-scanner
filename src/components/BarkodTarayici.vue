<template>
  <div class="scanner-container" v-show="scanning">
    <div class="scan-frame"></div>
    <v-btn
        @click="stopContinuousScan"
        :disabled="!scanning"
        style="position: absolute; bottom: 4vh; width: 90%"
        color="error"
        block
    >
      Taramayı Durdur
    </v-btn>
  </div>

  <span v-show="!scanning">
  <v-row>
    <v-col v-if="barkodlar.length > 0" cols="12">
      <v-list>
        <v-list-item v-for="barcode in barkodlar" :key="barcode.rawValue">
          <v-list-item-title>{{ barcode.format }}</v-list-item-title>
          <v-list-item-subtitle>{{ barcode.rawValue }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-col>
    <v-col v-else cols="12">
      <v-alert type="info" class="mt-2">Henüz barkod taranmadı</v-alert>
    </v-col>
    <v-col cols="12">
      <v-btn @click="scan" :disabled="!isSupported" color="primary" block>
        Tek Barkod Tara
      </v-btn>
    </v-col>
    <v-col cols="12">
      <v-btn @click="startContinuousScan" :disabled="!isSupported || scanning" color="success" block>
        Çoklu Tarama Başlat
      </v-btn>
    </v-col>
  </v-row>
  </span>

  <v-snackbar v-model="snackbar" :timeout="10000">
    <div class="text-subtitle-1 pb-2">İzin reddedildi</div>
    <p>Lütfen barkod tarayıcısını kullanmak için kameraya izin verin.</p>
    <template v-slot:actions>
      <v-btn color="indigo" variant="text" @click="snackbar = false">
        Kapat
      </v-btn>
    </template>
  </v-snackbar>
  <audio ref="beepSound" src="/beep.mp3" preload="auto"></audio>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

const barkodlar = ref<any[]>([]);
const isSupported = ref<boolean>(false);
const snackbar = ref<boolean>(false);
const scanning = ref<boolean>(false);
const beepSound = ref<HTMLAudioElement | null>(null);

// Tarama kilidi için değişken
const taramaKilidi = ref<boolean>(false);

onMounted(() => {
  BarcodeScanner.isSupported().then((result) => {
    isSupported.value = result.supported;
  });
});

onUnmounted(() => {
  stopContinuousScan();
});

// Bip sesi çalma fonksiyonu
const playBeepSound = () => {
  if (beepSound.value) {
    beepSound.value.currentTime = 0;
    beepSound.value.play().catch(err => {
      console.error("Ses çalınamadı:", err);
    });
  }
};

const scan = async () => {
  const granted = await requestPermissions();
  if (!granted) {
    snackbar.value = true;
    return;
  }
  const { barcodes } = await BarcodeScanner.scan();
  if (barcodes.length > 0) {
    playBeepSound(); // Barkod tarandığında bip sesi çal
  }
  barkodlar.value.push(...barcodes);
};

// Barkod tarandığında çalışacak fonksiyon
const barkodTarandi = async (result: any) => {
  if (taramaKilidi.value) return;
  taramaKilidi.value = true;

  barkodlar.value.push(result.barcode);
  playBeepSound();

  setTimeout(() => {
    taramaKilidi.value = false;
  }, 1000);
};

const startContinuousScan = async () => {
  const granted = await requestPermissions();
  if (!granted) {
    snackbar.value = true;
    return;
  }

  try {
    // Tarama başladığında arka planı şeffaf yap
    document.querySelector('body')?.classList.add('transparent-bg');
    taramaKilidi.value = false;
    // @ts-ignore
    await BarcodeScanner.addListener('barcodeScanned', barkodTarandi);
    await BarcodeScanner.startScan();
    scanning.value = true;
  } catch (error) {
    console.error('Sürekli tarama başlatılamadı:', error);
  }
};

const stopContinuousScan = async () => {
  if (scanning.value) {
    try {
      // Arka plan şeffaflığını kaldır
      document.querySelector('body')?.classList.remove('transparent-bg');

      await BarcodeScanner.removeAllListeners();
      await BarcodeScanner.stopScan();
      scanning.value = false;
    } catch (error) {
      console.error('Tarama durdurulamadı:', error);
    }
  }
};

const requestPermissions = async (): Promise<boolean> => {
  const { camera } = await BarcodeScanner.requestPermissions();
  return camera === 'granted' || camera === 'limited';
};
</script>

<style>
/* Sadece arka planı şeffaf yapmak için gerekli stil */
body.transparent-bg {
  background: transparent;
  --background: transparent;
}

body.transparent-bg .v-application {
  background: transparent !important;
}
</style>

<style scoped>
.scanner-container {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scan-frame {
  width: 80%;
  max-width: 300px;
  height: 200px;
  border: 3px solid #4CAF50;
  border-radius: 10px;
  box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);
  position: relative;
}
</style>