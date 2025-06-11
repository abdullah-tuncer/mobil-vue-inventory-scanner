import type {IUrun} from "../types/inventory.ts";

export class Urun implements IUrun {
    id!: number;
    ad: string = "";
    aciklama?: string = undefined;
    fiyat: number = 0;
    indirimli_fiyat?: number = undefined;
    minMaxStok: 0 | 1 = 0;
    minStok: number = 0;
    maxStok: number = 1;
    created_at!: string;
    updated_at!: string;
}