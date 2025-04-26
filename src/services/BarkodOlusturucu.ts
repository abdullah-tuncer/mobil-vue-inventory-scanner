import JsBarcode from 'jsbarcode';
import {jsPDF} from 'jspdf';
import {Capacitor} from '@capacitor/core';
import {Filesystem, Directory} from '@capacitor/filesystem';
import {FileOpener} from "@capacitor-community/file-opener";

export class BarkodOlusturucu {
    private barkodDegeri: string;
    private barkodTipi: string;
    private genislik: number;
    private yukseklik: number;
    private marj: number;
    // Piksel başına inç (standart ekran DPI değeri)
    private readonly PPI: number = 96;

    constructor(
        barkodDegeri: string,
        barkodTipi: string = 'EAN13',
        genislik: number = 1,
        yukseklik: number = 20,
        marj: number = 2
    ) {
        this.barkodDegeri = barkodDegeri;
        this.barkodTipi = barkodTipi;
        this.genislik = genislik;
        this.yukseklik = yukseklik;
        this.marj = marj;
    }

    /**
     * Piksel değerini milimetreye çevirir
     * @param pixel Piksel değeri
     * @returns Milimetre değeri
     */
    private pixelToMm(pixel: number): number {
        // 1 inç = 25.4 mm
        // 1 piksel = 1/PPI inç
        return (pixel / this.PPI) * 25.4;
    }

    /**
     * Belirtilen sayıda barkodu içeren PDF oluşturur ve indirir
     * @param adet Kaç adet barkod oluşturulacağı
     * @param dosyaAdi İndirilecek PDF dosyasının adı
     */
    public async cokluBarkodPdfIndir(adet: number, dosyaAdi: string = 'barkodlar_' + Date.now() + '.pdf'): Promise<void> {
        const doc = new jsPDF();
        const sayfaGenislik = doc.internal.pageSize.getWidth();
        const sayfaYukseklik = doc.internal.pageSize.getHeight();

        // Örnek bir barkod oluşturup boyutlarını alalım
        const ornekCanvas = document.createElement('canvas');
        JsBarcode(ornekCanvas, this.barkodDegeri, {
            format: this.barkodTipi,
            width: this.genislik,
            height: this.yukseklik,
            displayValue: true,
            margin: 0
        });

        // Piksel değerlerini mm'ye çevir
        const barkodGenislikMm = this.pixelToMm(ornekCanvas.width);
        const barkodYukseklikMm = this.pixelToMm(ornekCanvas.height);

        // Bir sayfaya sığacak barkod sayısını hesapla
        const satirBasinaBarkod = Math.floor(sayfaGenislik / (barkodGenislikMm + this.marj * 2));
        const sutunBasinaBarkod = Math.floor(sayfaYukseklik / (barkodYukseklikMm + this.marj * 2));
        const sayfaBasinaBarkod = satirBasinaBarkod * sutunBasinaBarkod;

        let sayfaSayisi = Math.ceil(adet / sayfaBasinaBarkod);
        let barkodSayaci = 0;

        for (let sayfa = 0; sayfa < sayfaSayisi; sayfa++) {
            if (sayfa > 0) {
                doc.addPage();
            }

            for (let sutun = 0; sutun < sutunBasinaBarkod; sutun++) {
                for (let satir = 0; satir < satirBasinaBarkod; satir++) {
                    if (barkodSayaci >= adet) break;

                    const x = satir * (barkodGenislikMm + this.marj * 2) + this.marj;
                    const y = sutun * (barkodYukseklikMm + this.marj * 2) + this.marj;

                    this.barkodEkle(doc, x, y);
                    barkodSayaci++;
                }
            }
        }

        // Platformu kontrol et ve uygun şekilde kaydet
        await this.dosyaKaydet(doc, dosyaAdi);
    }

    /**
     * Bir sayfaya sığacak kadar barkod içeren PDF oluşturur ve indirir
     * @param dosyaAdi İndirilecek PDF dosyasının adı
     */
    public async sayfayaSigacakBarkodPdfIndir(dosyaAdi: string = 'barkodlar_' + Date.now() + '.pdf'): Promise<void> {
        const doc = new jsPDF();
        const sayfaGenislik = doc.internal.pageSize.getWidth();
        const sayfaYukseklik = doc.internal.pageSize.getHeight();

        // Örnek bir barkod oluşturup boyutlarını alalım
        const ornekCanvas = document.createElement('canvas');
        JsBarcode(ornekCanvas, this.barkodDegeri, {
            format: this.barkodTipi,
            width: this.genislik,
            height: this.yukseklik,
            displayValue: true,
            margin: 0
        });

        // Piksel değerlerini mm'ye çevir
        const barkodGenislikMm = this.pixelToMm(ornekCanvas.width);
        const barkodYukseklikMm = this.pixelToMm(ornekCanvas.height);

        // Bir sayfaya sığacak barkod sayısını hesapla
        const satirBasinaBarkod = Math.floor(sayfaGenislik / (barkodGenislikMm + this.marj * 2));
        const sutunBasinaBarkod = Math.floor(sayfaYukseklik / (barkodYukseklikMm + this.marj * 2));

        for (let sutun = 0; sutun < sutunBasinaBarkod; sutun++) {
            for (let satir = 0; satir < satirBasinaBarkod; satir++) {
                const x = satir * (barkodGenislikMm + this.marj * 2) + this.marj;
                const y = sutun * (barkodYukseklikMm + this.marj * 2) + this.marj;

                this.barkodEkle(doc, x, y);
            }
        }

        // Platformu kontrol et ve uygun şekilde kaydet
        await this.dosyaKaydet(doc, dosyaAdi);
    }

    /**
     * PDF'e barkod ekler
     */
    private barkodEkle(doc: jsPDF, x: number, y: number): void {
        // Canvas oluştur
        const canvas = document.createElement('canvas');

        // Barkodu canvas'a çiz
        JsBarcode(canvas, this.barkodDegeri, {
            format: this.barkodTipi,
            width: this.genislik,
            height: this.yukseklik,
            displayValue: true,
            margin: 0
        });

        // Canvas'ı PDF'e ekle - orijinal boyutları koruyarak (mm cinsinden)
        const imgData = canvas.toDataURL('image/png');
        const genislikMm = this.pixelToMm(canvas.width);
        const yukseklikMm = this.pixelToMm(canvas.height);

        // Canvas'ı mm cinsinden boyutlarıyla PDF'e ekle
        doc.addImage(imgData, 'PNG', x, y, genislikMm, yukseklikMm);
    }

    /**
     * Platformu kontrol ederek PDF'i uygun şekilde kaydeder
     * @param doc PDF dokümanı
     * @param dosyaAdi Dosya adı
     */
    private async dosyaKaydet(doc: jsPDF, dosyaAdi: string): Promise<void> {
        try {
            // PDF'i base64 formatına çevir
            const pdfData = doc.output('datauristring');
            const base64Data = pdfData.split(',')[1];

            if (Capacitor.isNativePlatform()) {
                console.log('Native platformda dosya kaydediliyor...');

                // Capacitor Filesystem API kullanarak dosyayı kaydet
                const result = await Filesystem.writeFile({
                    path: dosyaAdi,
                    data: base64Data,
                    directory: Directory.Documents,
                    recursive: true
                });

                console.log('Dosya kaydedildi:', result.uri);

                // Kullanıcıya bilgi ver ve dosyayı açma seçeneği sun
                if (confirm(`Barkod PDF'i ${result.uri} dosya yoluna kaydedildi. Dosyayı açmak ister misiniz?`)) {
                    await this.dosyaAc(result.uri);
                }
            } else {
                // Web platformunda normal indirme işlemi
                console.log('Web platformunda dosya indiriliyor...');
                doc.save(dosyaAdi);
            }
        } catch (error) {
            console.error('Dosya kaydedilirken hata oluştu:', error);
            alert('PDF kaydedilirken bir hata oluştu: ' + (error as Error).message);
        }
    }

    /**
     * Kaydedilen dosyayı açar
     * @param dosyaUri Dosyanın URI'si
     */
    private async dosyaAc(dosyaUri: string): Promise<void> {
        try {
            // Browser plugin'i ile dosyayı aç
            await FileOpener.open({
                filePath: dosyaUri,
                contentType: 'application/pdf',
                openWithDefault: true,
            });
        } catch (error) {
            console.error('Dosya açılırken hata oluştu:', error);
            alert('Dosya açılırken bir hata oluştu: ' + (error as Error).message);
        }
    }
}