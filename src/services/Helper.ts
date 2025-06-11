class Helper {
    dateFormat(date: string): string {
        return new Date(date).toLocaleString();
    }

    indirimOraniHesapla(fiyat: number, indirimli_fiyat: number): number  {
        let oran = 100 - ((indirimli_fiyat / fiyat) * 100);
        return oran;
    }

    // orana göre kırmızıdan yeşile geçiş yapar
    redToGreen(min: number, max: number, mevcut: number): string {
        const hesaplananOran = (mevcut - min) / (max - min);
        const oran = Math.max(0, Math.min(hesaplananOran, 1));
        let colorParam = Math.floor((255 * 2) * oran);
        let red = 255;
        let green = 0;
        if (colorParam < 255)
            green += colorParam;
        else if (colorParam >= 255) {
            green = 255;
            red = 255 - (colorParam - 255);
        }
        return ("rgb(" + red + "," + green + ",61)");
    }
}

export default new Helper();