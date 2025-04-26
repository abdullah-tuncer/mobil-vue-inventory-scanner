import type {IUrun} from "../types/inventory.ts";

export class Urun implements IUrun {
    id!: number;
    ad: string = "";
    aciklama?: string = undefined;
    fiyat: number = 0;
    indirimli_fiyat?: number = undefined;
    created_at!: string;
    updated_at!: string;
}