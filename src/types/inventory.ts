export interface IUrun {
    id: number;
    ad: string;
    aciklama?: string;
    fiyat: number;
    indirimli_fiyat?: number;
    created_at: string;
    updated_at?: string;
}

export interface IBarkod {
    id: number;
    urun_id: number;
    data: string;
    type: string;
    created_at: string;
}

export interface IEnvanterHareketi {
    id: number;
    urun_id: number;
    adet: number;
    islem_tipi: 'giris' | 'satis' | 'iade' | 'sayim' | string;
    aciklama?: string;
    created_at: string;
}

export interface IEnvanter {
    id: number;
    urun_id: number;
    adet: number;
    updated_at?: string;
}

export interface ISatis {
    id: number;
    toplam_tutar: number;
    ekstra_indirim_tutarı: number;
    created_at: string;
}

export interface ISatisUrunu {
    id: number;
    satis_id: number;
    urun_id: number;
    adet: number;
    birim_fiyat: number;
    indirimli_birim_fiyat?: number;
    tutar: number;
    created_at: string;
}

export interface IGuncelStok {
    urun_id: number;
    urun_adi: string;
    guncel_stok: number;
}
