import type {ISatis, ISatisUrunu} from "../types/inventory.ts";

export class Satis implements ISatis {
    created_at!: string;
    ekstra_indirim_tutari: number = 0;
    id!: number;
    toplam_tutar: number = 0;
    urunler: Array<ISatisUrunu> = [];
}