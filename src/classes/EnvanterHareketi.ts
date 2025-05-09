import type {IEnvanterHareketi, IEnvanterHareketiUrun} from "../types/inventory.ts";

export class EnvanterHareketi implements IEnvanterHareketi {
    id!: number;
    aciklama?: string = "";
    created_at!: string;
    islem_tipi: "giris" | "satis" | "iade" | "sayim" | string = "sayim";
    urunler: Array<IEnvanterHareketiUrun> = [];
}