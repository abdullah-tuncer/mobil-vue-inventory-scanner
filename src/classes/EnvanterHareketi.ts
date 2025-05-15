import {EnvanteHareketiIslemTipi, type IEnvanterHareketi, type IEnvanterHareketiUrun} from "../types/inventory.ts";

export class EnvanterHareketi implements IEnvanterHareketi {
    id!: number;
    aciklama?: string = "";
    created_at!: string;
    islem_tipi: EnvanteHareketiIslemTipi = EnvanteHareketiIslemTipi.SAYIM;
    satis_id?: number;
    urunler: Array<IEnvanterHareketiUrun> = [];
}