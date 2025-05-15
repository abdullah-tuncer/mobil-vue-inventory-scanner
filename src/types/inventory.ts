export interface IAyar {
    id?: number;
    anahtar: string;
    deger: string;
    grup?: string;
    aciklama?: string;
    created_at?: string;
    updated_at?: string;
}

export interface IUrun {
    id: number;
    ad: string;
    aciklama?: string;
    fiyat: number;
    indirimli_fiyat?: number;
    barkodlar?: Array<IBarkod>;
    created_at: string;
    updated_at?: string;
}

export interface IBarkod {
    id?: number;
    urun_id: number;
    data: string;
    type: string;
    created_at: string;
}

export interface IEnvanterHareketi {
    id?: number;
    islem_tipi: EnvanteHareketiIslemTipi;
    aciklama?: string;
    satis_id?: number;
    created_at?: string;
    urunler?: Array<IEnvanterHareketiUrun>;
}

export enum EnvanteHareketiIslemTipi {
    GIRIS = "giris",
    SATIS = "satis",
    IADE = "iade",
    SAYIM = "sayim"
}

export enum EnvanteHareketiIslemTipiLabel {
    "giris" = "Giriş",
    "satis" = "Satış",
    "iade" = "İade",
    "sayim" = "Sayım"
}

export enum EnvanteHareketiIslemTipiColor {
    "giris" = "green darken-2",
    "satis" = "red darken-1",
    "iade" = "blue lighten-1",
    "sayim" = "amber darken-1"
}

export interface IEnvanterHareketiUrun {
    id?: number;
    envanter_hareketi_id: number;
    urun_id: number;
    urun?: IUrun;
    adet: number;
}

export interface IEnvanter {
    id: number;
    urun_id: number;
    urun?: IUrun;
    adet: number;
    updated_at?: string;
}

export interface ISatis {
    id?: number;
    toplam_tutar: number;
    ekstra_indirim_tutari: number;
    created_at?: string;
}

export interface ISatisUrunu {
    id?: number;
    satis_id?: number;
    urun_id: number;
    urun?: IUrun;
    adet: number;
    birim_fiyat: number;
    indirimli_birim_fiyat?: number;
    tutar: number;
    created_at?: string;
}

export interface IGuncelStok {
    urun_id: number;
    urun_adi: string;
    guncel_stok: number;
}
