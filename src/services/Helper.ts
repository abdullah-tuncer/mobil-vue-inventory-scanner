class Helper {
    dateFormat(date: string): string {
        return new Date(date).toLocaleDateString();
    }

    indirimOraniHesapla(fiyat: number, indirimli_fiyat: number): number  {
        let oran = 100 - ((indirimli_fiyat / fiyat) * 100);
        return oran;
    }
}

export default new Helper();