import {BarcodeScanner} from "@capacitor-mlkit/barcode-scanning";
import {
    type GoogleBarcodeScannerModuleInstallProgressEvent,
    GoogleBarcodeScannerModuleInstallState
} from "@capacitor-mlkit/barcode-scanning/dist/esm/definitions";
import {toast} from "vue3-toastify";
import {useScannerStore} from "../store/scannerStore.ts";

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

        const checkGoogleBarcodeScanner = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
        if (!checkGoogleBarcodeScanner.available) {
            if (confirm("Tarama yapabilmek için Google Barkod Tarayıcı Modülü gereklidir. Yüklemek ister misiniz?")) {
                try {
                    toast.warning("Google Barkod Tarayıcı Modülü yükleme başlatılıyor. Lütfen yükleme tamamlanana kadar bekleyin.");
                    await new Promise<void>(async (resolve, reject) => {
                        await BarcodeScanner.installGoogleBarcodeScannerModule();
                        await BarcodeScanner.addListener("googleBarcodeScannerModuleInstallProgress", (event: GoogleBarcodeScannerModuleInstallProgressEvent) => {
                            const progress = event;
                            if (progress.state === GoogleBarcodeScannerModuleInstallState.COMPLETED) {
                                toast.success("Google Barkod Tarayıcı Modülü başarıyla yüklendi");
                                resolve();
                            } else if (progress.state === GoogleBarcodeScannerModuleInstallState.FAILED) {
                                toast.error("Google Barkod Tarayıcı Modülü yüklenemedi.");
                                reject(new Error("Google Barkod Tarayıcı Modülü kurulumu başarısız oldu."));
                            }
                        });
                    });
                } catch (error) {
                    console.error("Google Barkod Tarayıcı Modülü yükleme hatası:", error);
                    throw new Error(`Google Barkod Tarayıcı Modülü yüklenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                }
            }
            else
                throw new Error("Google Barkod Tarayıcı Modülü mevcut değil ve yükleme reddedildi.");
        }

        try {
            const {barcodes} = await BarcodeScanner.scan();
            if (barcodes.length > 0) {
                this.playBeepSound();
                return {
                    type: barcodes[0].format,
                    data: barcodes[0].rawValue
                };
            }
            else
                return null;
        } catch (error: any) {
            console.error("Barkod tarama hatası:", error);
            if (error.message=="scan canceled.")
                throw new Error("Tarama iptal edildi.");
            else
                throw new Error(`Barkod tarama sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }
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
        const scannerStore = useScannerStore();
        try {
            this.scanCallback = callback;
            document.querySelector('body')?.classList.add('transparent-bg');
            scannerStore.startScanning();
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
            scannerStore.stopScanning();
            return false;
        }
    }

    /**
     * Sürekli taramayı durdurur
     */
    async stopContinuousScan(): Promise<void> {
        try {
            document.querySelector('body')?.classList.remove('transparent-bg');
            const scannerStore = useScannerStore();
            scannerStore.stopScanning();
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
        const scannerStore = useScannerStore();
        return scannerStore.getIsScanning;
    }
}

export default new BarkodTaramaService();