import {SQLiteDBConnection} from "@capacitor-community/sqlite";
import SQLiteService from "./sqliteService.ts";
import type {ISQLiteService} from "./sqliteService.ts";
import type {IBarkod, IEnvanter, IEnvanterHareketi, ISatis, ISatisUrunu, IUrun} from "../types/inventory.ts";

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
    ENVANTER = 'envanter',
    SATISLAR = 'satislar',
    SATIS_URUNLERI = 'satis_urunleri'
}

type TableTypeMap = {
    [Tables.URUNLER]: IUrun;
    [Tables.BARKODLAR]: IBarkod;
    [Tables.ENVANTER_HAREKETLERI]: IEnvanterHareketi;
    [Tables.ENVANTER]: IEnvanter;
    [Tables.SATISLAR]: ISatis;
    [Tables.SATIS_URUNLERI]: ISatisUrunu;
}

class InventoryService implements IInventoryService {
    private db!: SQLiteDBConnection;
    private database: string = 'inventory_db';
    private loadToVersion: number = 1;
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
                            'CREATE TABLE IF NOT EXISTS envanter_hareketleri (id INTEGER PRIMARY KEY AUTOINCREMENT, urun_id INTEGER NOT NULL, adet INTEGER NOT NULL, islem_tipi TEXT NOT NULL, aciklama TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (urun_id) REFERENCES urunler(id));',
                            'CREATE TABLE IF NOT EXISTS envanter (id INTEGER PRIMARY KEY AUTOINCREMENT, urun_id INTEGER NOT NULL UNIQUE, adet INTEGER NOT NULL DEFAULT 0, updated_at TEXT, FOREIGN KEY (urun_id) REFERENCES urunler(id));',
                            'CREATE TABLE IF NOT EXISTS satislar (id INTEGER PRIMARY KEY AUTOINCREMENT, toplam_tutar REAL NOT NULL, ekstra_indirim_tutari REAL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);',
                            'CREATE TABLE IF NOT EXISTS satis_urunleri (id INTEGER PRIMARY KEY AUTOINCREMENT, satis_id INTEGER NOT NULL, urun_id INTEGER NOT NULL, adet INTEGER NOT NULL, birim_fiyat REAL NOT NULL, indirimli_birim_fiyat REAL DEFAULT 0, tutar REAL NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (satis_id) REFERENCES satislar(id), FOREIGN KEY (urun_id) REFERENCES urunler(id));'
                        ]
                    }
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
            console.log("log61: SQLite statement",statement)
            console.log("log61: SQLite values",values);
            const result = await this.db.run(statement, values);
            console.log('log61: SQLite ', result)
            return result.changes?.lastId || 0;
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.addItem: ${msg}`);
        }
    }

    async getItems<T extends keyof TableTypeMap>(table: T, fields?: Array<string>): Promise<Array<TableTypeMap[T]>> {
        if (!this.initialized) await this.initializeDatabase();
        try {
            const fieldsStr = fields ? fields.join(', ') : '*';
            const query = `SELECT ${fieldsStr} FROM ${table}`;
            const result = await this.db.query(query);
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
            return data;
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`inventoryService.getItemById: ${msg}`);
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
}
export default new InventoryService(SQLiteService);