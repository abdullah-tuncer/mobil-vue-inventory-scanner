import {BarcodeScanner} from "@capacitor-mlkit/barcode-scanning";
import store from '../store';

class BarkodTaramaService {
    private beepSound: HTMLAudioElement | null = null;
    private scanCallback: ((result: any) => void) | null = null;
    private scanLock: boolean = false;

    constructor() {
        // Ses dosyasını yükle
        this.beepSound = new Audio('/beep.mp3');
        this.beepSound.preload = 'auto';
    }

    /**
     * Kamera izinlerini kontrol eder ve gerekirse ister
     * @returns İzin durumu (true: izin verildi, false: izin verilmedi)
     */
    async requestPermissions(): Promise<boolean> {
        const {camera} = await BarcodeScanner.requestPermissions();
        return camera === 'granted' || camera === 'limited';
    }

    /**
     * Tek bir barkod tarar
     * @returns Taranan barkod bilgisi veya izin hatası durumunda null
     */
    async scanBarcode(): Promise<{ type: string, data: string } | null> {
        const granted = await this.requestPermissions();
        if (!granted)
            throw new Error("Kamera izni verilmediği için tarama gerçekleşemedi.");

        const {barcodes} = await BarcodeScanner.scan();
        if (barcodes.length > 0) {
            this.playBeepSound();
            return {
                type: barcodes[0].format,
                data: barcodes[0].rawValue
            };
        }
        return null;
    }

    /**
     * Bip sesi çalar
     */
    playBeepSound(): void {
        if (this.beepSound) {
            this.beepSound.currentTime = 0;
            this.beepSound.play().catch(err => {
                console.error("Ses çalınamadı:", err);
            });
        }
    }

    /**
     * Sürekli tarama başlatır
     * @param callback Barkod tarandığında çağrılacak fonksiyon
     * @returns Tarama başlatma durumu (true: başarılı, false: başarısız)
     */
    async startContinuousScan(callback: (result: any) => void): Promise<boolean> {
        const granted = await this.requestPermissions();
        if (!granted) {
            return false;
        }

        try {
            this.scanCallback = callback;
            document.querySelector('body')?.classList.add('transparent-bg');
            await store.dispatch('scanner/startScanning');
            // Barkod tarama dinleyicisini ekle
            // @ts-ignore
            await BarcodeScanner.addListener('barcodeScanned', (result: any) => {
                if (this.scanLock)
                    return;
                this.scanLock = true;
                this.playBeepSound();
                if (this.scanCallback) {
                    this.scanCallback(result);
                }
                setTimeout(() => {
                    this.scanLock = false;
                }, 1000);
            });
            await BarcodeScanner.startScan();
            return true;
        } catch (error) {
            console.error('Sürekli tarama başlatılamadı:', error);
            await store.dispatch('scanner/stopScanning');
            return false;
        }
    }

    /**
     * Sürekli taramayı durdurur
     */
    async stopContinuousScan(): Promise<void> {
        try {
            document.querySelector('body')?.classList.remove('transparent-bg');
            await store.dispatch('scanner/stopScanning');
            await BarcodeScanner.removeAllListeners();
            await BarcodeScanner.stopScan();
            this.scanCallback = null;
        } catch (error) {
            console.error('Tarama durdurulamadı:', error);
        }
    }

    /**
     * Tarama durumunu kontrol eder
     * @returns Tarama aktif mi
     */
    isScanningActive(): boolean {
        return store.getters['scanner/isScanning'];
    }
}

export default new BarkodTaramaService();