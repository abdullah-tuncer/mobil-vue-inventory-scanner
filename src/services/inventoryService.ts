import {SQLiteDBConnection} from "@capacitor-community/sqlite";
import SQLiteService from "./SqliteService.ts";
import type {ISQLiteService} from "./SqliteService.ts";
import {
    EnvanteHareketiIslemTipi,
    type IAyar,
    type IBarkod,
    type IEnvanter,
    type IEnvanterHareketi,
    type IEnvanterHareketiUrun,
    type ISatis,
    type ISatisUrunu,
    type IUrun
} from "../types/inventory.ts";

interface IInventoryService {
    initializeDatabase(): Promise<void>;
    addItem<T extends keyof TableTypeMap>(table: T, data: TableTypeMap[T]): Promise<number>;
    getItems<T extends keyof TableTypeMap>(table: T, fields?: Array<string>): Promise<Array<TableTypeMap[T]>>;
    getItemById<T extends keyof TableTypeMap>(table: T, id: number): Promise<TableTypeMap[T] | null>;
    updateItem<T extends keyof TableTypeMap>(table: T, data: TableTypeMap[T]): Promise<void>;
    deleteItem(table: Tables, id: number): Promise<void>;
}

export enum Tables {
    URUNLER = 'urunler',
    BARKODLAR = 'barkodlar',
    ENVANTER_HAREKETLERI = 'envanter_hareketleri',
    ENVANTER_HAREKETI_URUN = 'envanter_hareketi_urun',
    ENVANTER = 'envanter',
    SATISLAR = 'satislar',
    SATIS_URUNLERI = 'satis_urunleri',
    AYARLAR = 'ayarlar'
}

type TableTypeMap = {
    [Tables.URUNLER]: IUrun;
    [Tables.BARKODLAR]: IBarkod;
    [Tables.ENVANTER_HAREKETLERI]: IEnvanterHareketi;
    [Tables.ENVANTER_HAREKETI_URUN]: IEnvanterHareketiUrun;
    [Tables.ENVANTER]: IEnvanter;
    [Tables.SATISLAR]: ISatis;
    [Tables.SATIS_URUNLERI]: ISatisUrunu;
    [Tables.AYARLAR]: IAyar;
}

class InventoryService implements IInventoryService {
    private db!: SQLiteDBConnection;
    private database: string = 'inventory_db';
    private loadToVersion: number = 2;
    private initialized: boolean = false;

    constructor(private sqliteService: ISQLiteService) {
    }

    async initializeDatabase(): Promise<void> {
        if (this.initialized) return;
        try {
            // Veritabanı şemasını tanımlama
            await this.sqliteService.addUpgradeStatement({
                database: this.database,
                upgrade: [
                    {
                        toVersion: 1,
                        statements: [
                            'CREATE TABLE IF NOT EXISTS urunler (id INTEGER PRIMARY KEY AUTOINCREMENT, ad TEXT NOT NULL, aciklama TEXT, fiyat REAL NOT NULL, indirimli_fiyat REAL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT);',
                            'CREATE TABLE IF NOT EXISTS barkodlar (id INTEGER PRIMARY KEY AUTOINCREMENT, urun_id INTEGER NOT NULL, data TEXT NOT NULL, type TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (urun_id) REFERENCES urunler(id));',
                            'CREATE TABLE IF NOT EXISTS envanter_hareketleri (id INTEGER PRIMARY KEY AUTOINCREMENT, islem_tipi TEXT NOT NULL, aciklama TEXT, satis_id INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (satis_id) REFERENCES satislar(id));',
                            'CREATE TABLE IF NOT EXISTS envanter (id INTEGER PRIMARY KEY AUTOINCREMENT, urun_id INTEGER NOT NULL UNIQUE, adet INTEGER NOT NULL DEFAULT 0, updated_at TEXT, FOREIGN KEY (urun_id) REFERENCES urunler(id));',
                            'CREATE TABLE IF NOT EXISTS satislar (id INTEGER PRIMARY KEY AUTOINCREMENT, toplam_tutar REAL NOT NULL, ekstra_indirim_tutari REAL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);',
                            'CREATE TABLE IF NOT EXISTS envanter_hareketi_urun (id INTEGER PRIMARY KEY AUTOINCREMENT, envanter_hareketi_id INTEGER NOT NULL, urun_id INTEGER NOT NULL, adet INTEGER NOT NULL, FOREIGN KEY (envanter_hareketi_id) REFERENCES envanter_hareketleri(id), FOREIGN KEY (urun_id) REFERENCES urunler(id));',
                            'CREATE TABLE IF NOT EXISTS satis_urunleri (id INTEGER PRIMARY KEY AUTOINCREMENT, satis_id INTEGER NOT NULL, urun_id INTEGER NOT NULL, adet INTEGER NOT NULL, birim_fiyat REAL NOT NULL, indirimli_birim_fiyat REAL DEFAULT 0, tutar REAL NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (satis_id) REFERENCES satislar(id), FOREIGN KEY (urun_id) REFERENCES urunler(id));',
                            // Envanter hareketi eklendiğinde stok güncellemesi için trigger
                            `CREATE TRIGGER IF NOT EXISTS update_stock_after_movement
                             AFTER INSERT ON envanter_hareketi_urun
                             BEGIN
                                 -- Eğer ürün envanter tablosunda yoksa ekle
                                 INSERT OR IGNORE INTO envanter (urun_id, adet, updated_at)
                                 VALUES (NEW.urun_id, 0, CURRENT_TIMESTAMP);
                                 
                                 -- Envanter tablosundaki stok miktarını güncelle
                                 UPDATE envanter
                                 SET adet = adet + NEW.adet,
                                     updated_at = CURRENT_TIMESTAMP
                                 WHERE urun_id = NEW.urun_id;
                                 
                                 -- Stok miktarı sıfır ise kaydı sil
                                 DELETE FROM envanter 
                                 WHERE urun_id = NEW.urun_id AND adet = 0;
                             END;`
                        ]
                    },
                    {
                        toVersion: 2,
                        statements: [
                            'CREATE TABLE IF NOT EXISTS ayarlar (id INTEGER PRIMARY KEY AUTOINCREMENT, anahtar TEXT NOT NULL UNIQUE, deger TEXT, grup TEXT, aciklama TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT);',
                            "INSERT OR IGNORE INTO ayarlar (anahtar, deger, grup, aciklama) VALUES ('tema', 'light', 'sistem', 'Uygulama teması (acik/karanlik)');",
                            "INSERT OR IGNORE INTO ayarlar (anahtar, deger, grup, aciklama) VALUES ('tablo_gorunumu', 'varsayilan', 'sistem', 'Tablo görünüm modu (varsayilan/mobil)');",
                            "INSERT OR IGNORE INTO ayarlar (anahtar, deger, grup, aciklama) VALUES ('sirket_adi', 'Envanter Yönetim Sistemi', 'anasayfa', 'Şirket adı');",
                            "INSERT OR IGNORE INTO ayarlar (anahtar, deger, grup, aciklama) VALUES ('sirket_aciklama', 'Bu uygulama, işletmenizin envanterini kolayca yönetmenizi, ürünlerinizi takip etmenizi ve satışlarınızı kaydetmenizi sağlar. Barkod tarama özelliği ile hızlıca ürün bilgilerine erişebilir, stok durumunu kontrol edebilir ve satış işlemlerini gerçekleştirebilirsiniz. Anasayfadaki bilgileri ve listeyi kişiselleştirmek için Ayarlar > Anasayfa Ayarları bölümünü kullanabilirsiniz.', 'anasayfa', 'Şirket açıklaması');",
                            "INSERT OR IGNORE INTO ayarlar (anahtar, deger, grup, aciklama) VALUES ('sirket_liste', '[\"Buraya iletişim bilgilerinizi ekleyebilirsiniz\", \"Örnek: Telefon numaranız\", \"Örnek: Web siteniz\", \"Örnek: İşletme adresiniz\", \"Örnek: IBAN numaranız\"]', 'anasayfa', 'Kopyalanabilir veya Paylaşılabilir Liste');",
                            "INSERT OR IGNORE INTO ayarlar (anahtar, deger, grup, aciklama) VALUES ('barkod_yazi', '', 'urun', 'Barkod özelleştirilmiş yazı');",
                            "INSERT OR IGNORE INTO ayarlar (anahtar, deger, grup, aciklama) VALUES ('barkod_yazi_aktif', 'false', 'urun', 'Barkod yazısı özelleştirilsin mi');",
                            "INSERT OR IGNORE INTO ayarlar (anahtar, deger, grup, aciklama) VALUES ('indirim_oran_1', '10', 'urun', 'Birinci indirim oranı');",
                            "INSERT OR IGNORE INTO ayarlar (anahtar, deger, grup, aciklama) VALUES ('indirim_oran_2', '20', 'urun', 'İkinci indirim oranı');",
                            "INSERT OR IGNORE INTO ayarlar (anahtar, deger, grup, aciklama) VALUES ('indirim_oran_3', '30', 'urun', 'Üçüncü indirim oranı');"
                        ]
                    },
                ],
            });
            // Veritabanını açma
            this.db = await this.sqliteService.openDatabase(this.database, this.loadToVersion, false);
            this.initialized = true;
            console.log('Inventory database initialized successfully');
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.initializeDatabase: ${msg}`);
        }
    }

    async addItem<T extends keyof TableTypeMap>(table: T, data: TableTypeMap[T]): Promise<number> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            // null değerleri filtrele
            const filteredEntries = Object.entries(data).filter(([_, value]) => value !== null && value !== undefined);
            const keys = filteredEntries.map(([key]) => key);
            const values = filteredEntries.map(([_, value]) => value);
            const placeholders = keys.map(() => '?').join(', ');
            const statement = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
            const result = await this.db.run(statement, values);
            return result.changes?.lastId || 0;
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.addItem: ${msg}`);
        }
    }

    async getItems<T extends keyof TableTypeMap>(table: T, fields?: Array<string>|"*", sort?: {field: string, type: "ASC"|"DESC"}): Promise<Array<TableTypeMap[T]>> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            const fieldsStr = (fields && fields != "*") ? fields.join(', ') : '*';
            let query = `SELECT ${fieldsStr} FROM ${table}`;
            // urun_idye göre urun'ü ekle
            if (table == Tables.ENVANTER) {
                query = `
                    SELECT e.*,
                           json_object(
                                   'id', u.id,
                                   'ad', u.ad,
                                   'fiyat', u.fiyat,
                                   'indirimli_fiyat', u.indirimli_fiyat,
                                   'created_at', u.created_at,
                                   'updated_at', u.updated_at
                           ) as urun
                    FROM ${table} e
                    LEFT JOIN ${Tables.URUNLER} u ON e.urun_id = u.id
                `;
            }

            if (sort)
                query += ` ORDER BY ${sort.field} ${sort.type}`;

            const result = await this.db.query(query);

            // urun parse işlemi
            if (table == Tables.ENVANTER && result.values) {
                return result.values.map(item => {
                    if (typeof item.urun === 'string') {
                        try {
                            item.urun = JSON.parse(item.urun);
                        } catch (e) {
                            console.error('JSON parse error:', e);
                        }
                    }
                    return item;
                });
            }
            return result.values || [];
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.getItems: ${msg}`);
        }
    }

    async getItemById<T extends keyof TableTypeMap>(table: T, id: number|string): Promise<TableTypeMap[T] | null> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            const query = `SELECT * FROM ${table} WHERE id = ?`;
            const result = await this.db.query(query, [id]);
            let data = result.values?.[0] || null;
            if (data && table == Tables.URUNLER) {
                // Ürünün barkodlarını ekle
                const barkodlarQuery = `SELECT * FROM ${Tables.BARKODLAR} WHERE urun_id = ?`;
                const barkodlarResult = await this.db.query(barkodlarQuery, [id]);
                data.barkodlar = barkodlarResult.values || [];
            }
            else if (data && table == Tables.ENVANTER_HAREKETLERI) {
                // envanter hareketlerine bağlı envanter hareketi ürünlerini çek
                const envanterHareketiUrunlerquery = `
                    SELECT e.*,
                           json_object(
                                   'id', u.id,
                                   'ad', u.ad,
                                   'aciklama', u.aciklama,
                                   'fiyat', u.fiyat,
                                   'indirimli_fiyat', u.indirimli_fiyat,
                                   'created_at', u.created_at,
                                   'updated_at', u.updated_at
                           ) as urun
                    FROM ${Tables.ENVANTER_HAREKETI_URUN} e
                    LEFT JOIN ${Tables.URUNLER} u ON e.urun_id = u.id
                    WHERE e.envanter_hareketi_id = ?
                `;
                const envanterHareketiUrunlerResult = await this.db.query(envanterHareketiUrunlerquery, [id]);
                (data as IEnvanterHareketi).urunler = (envanterHareketiUrunlerResult.values || []).map(item => {
                    if (typeof item.urun === 'string') {
                        try {
                            item.urun = JSON.parse(item.urun);
                        } catch (e) {
                            console.error('JSON parse error:', e);
                        }
                    }
                    return item;
                });
            }
            else if (data && table == Tables.SATISLAR) {
                const satisUrunlerQuery = `
                    SELECT s.*,
                           json_object(
                                   'id', u.id,
                                   'ad', u.ad,
                                   'aciklama', u.aciklama,
                                   'fiyat', u.fiyat,
                                   'indirimli_fiyat', u.indirimli_fiyat,
                                   'created_at', u.created_at,
                                   'updated_at', u.updated_at
                           ) as urun
                    FROM ${Tables.SATIS_URUNLERI} s
                    LEFT JOIN ${Tables.URUNLER} u ON s.urun_id = u.id
                    WHERE satis_id = ?
                `;
                const satisUrunlerResult = await this.db.query(satisUrunlerQuery, [id]);
                (data as ISatis).satis_urunleri = (satisUrunlerResult.values || []).map(item => {
                    if (typeof item.urun === 'string') {
                        try {
                            item.urun = JSON.parse(item.urun);
                        } catch (e) {
                            console.error('JSON parse error:', e);
                        }
                    }
                    return item;
                });
            }
            return data;
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.getItemById: ${msg}`);
        }
    }

    async urunSatisBilgileri(urun_id: number | string): Promise<Array<IEnvanterHareketiUrun & {
        islem_tipi: EnvanteHareketiIslemTipi,
        created_at: string,
        satis_id: number | null
    }>> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            const query = `
                SELECT ehu.*, eh.islem_tipi, eh.created_at, eh.satis_id
                FROM ${Tables.ENVANTER_HAREKETI_URUN} ehu
                LEFT JOIN ${Tables.ENVANTER_HAREKETLERI} eh ON ehu.envanter_hareketi_id = eh.id
                WHERE urun_id = ?
                ORDER BY eh.created_at DESC
            `;
            const result = await this.db.query(query, [urun_id]);
            return result.values || [];
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.urunSatisBilgileri: ${msg}`);
        }
    }

    async updateItem<T extends keyof TableTypeMap>(table: T, data: TableTypeMap[T]): Promise<void> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            const id = data.id;
            const entries = Object.entries(data).filter(([key]) => key !== 'id');
            const keys = entries.map(([key]) => key);
            const values = entries.map(([_, value]) => value);
            const setClause = keys.map(key => `${key} = ?`).join(', ');
            const statement = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
            await this.db.run(statement, [...values, id]);
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.updateItem: ${msg}`);
        }
    }

    async deleteItem(table: Tables, id: number): Promise<void> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            const statement = `DELETE FROM ${table} WHERE id = ?`;
            await this.db.run(statement, [id]);
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.deleteItem: ${msg}`);
        }
    }

    // Ayarları getirmek için özel metod
    async getAyarlar(grup?: string): Promise<Array<IAyar>> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            let query = 'SELECT * FROM ayarlar';
            let params: any[] = [];

            if (grup) {
                query += ' WHERE grup = ?';
                params.push(grup);
            }

            const result = await this.db.query(query, params);
            return result.values || [];
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.getAyarlar: ${msg}`);
        }
    }

    // Tek bir ayarı getirmek için özel metod
    async getAyar(anahtar: string): Promise<string | null> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            const query = 'SELECT deger FROM ayarlar WHERE anahtar = ?';
            const result = await this.db.query(query, [anahtar]);
            return result.values?.[0]?.deger || null;
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.getAyar: ${msg}`);
        }
    }

    // Ayarı güncellemek için özel metod
    async setAyar(anahtar: string, deger: string): Promise<void> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            const statement = 'UPDATE ayarlar SET deger = ?, updated_at = CURRENT_TIMESTAMP WHERE anahtar = ?';
            await this.db.run(statement, [deger, anahtar]);
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.setAyar: ${msg}`);
        }
    }

    async getUrunByBarkod(barkodData: string): Promise<IUrun | null> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            // Barkod değerine göre ürünü sorgula
            const query = `
                SELECT u.* 
                FROM ${Tables.URUNLER} u
                INNER JOIN ${Tables.BARKODLAR} b ON u.id = b.urun_id
                WHERE b.data = ?
                LIMIT 1
            `;
            const result = await this.db.query(query, [barkodData]);

            if (result.values && result.values.length > 0) {
                const urun = result.values[0];
                // Ürünün barkodlarını da getir
                // const barkodlarQuery = `SELECT * FROM ${Tables.BARKODLAR} WHERE urun_id = ?`;
                // const barkodlarResult = await this.db.query(barkodlarQuery, [urun.id]);
                // urun.barkodlar = barkodlarResult.values || [];
                return urun;
            }
            return null;
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.getUrunByBarkod: ${msg}`);
        }
    }
}
export default new InventoryService(SQLiteService);