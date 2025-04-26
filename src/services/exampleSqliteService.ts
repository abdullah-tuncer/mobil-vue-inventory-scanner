import SQLiteService from './sqliteService';
import type {ISQLiteService} from './sqliteService';
import {SQLiteDBConnection} from '@capacitor-community/sqlite';

export interface IExampleSqliteService {
    initializeDatabase(): Promise<void>;
    addItem(name: string, description: string): Promise<number>;
    getItems(): Promise<any[]>;
    getItemById(id: number): Promise<any>;
    updateItem(id: number, name: string, description: string): Promise<void>;
    deleteItem(id: number): Promise<void>;
}

class ExampleSqliteService implements IExampleSqliteService {
    private db!: SQLiteDBConnection;
    private database: string = 'example_db';
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
                            'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, created_at INTEGER)'
                        ]
                    }
                ],
            });

            // Veritabanını açma
            this.db = await this.sqliteService.openDatabase(this.database, this.loadToVersion, false);
            this.initialized = true;
            console.log('Example database initialized successfully');
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`exampleSqliteService.initializeDatabase: ${msg}`);
        }
    }

    async addItem(name: string, description: string): Promise<number> {
        if (!this.initialized) await this.initializeDatabase();

        try {
            const timestamp = Date.now();
            const statement = `INSERT INTO items (name, description, created_at)
                               VALUES (?, ?, ?)`;
            const values = [name, description, timestamp];

            const result = await this.db.run(statement, values);
            return result.changes?.lastId || 0;
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`exampleSqliteService.addItem: ${msg}`);
        }
    }

    async getItems(): Promise<any[]> {
        if (!this.initialized) await this.initializeDatabase();

        try {
            const query = 'SELECT * FROM items ORDER BY created_at DESC';
            const result = await this.db.query(query);
            return result.values || [];
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`exampleSqliteService.getItems: ${msg}`);
        }
    }

    async getItemById(id: number): Promise<any> {
        if (!this.initialized) await this.initializeDatabase();

        try {
            const query = 'SELECT * FROM items WHERE id = ?';
            const result = await this.db.query(query, [id]);
            return result.values?.[0];
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`exampleSqliteService.getItemById: ${msg}`);
        }
    }

    async updateItem(id: number, name: string, description: string): Promise<void> {
        if (!this.initialized) await this.initializeDatabase();

        try {
            const statement = 'UPDATE items SET name = ?, description = ? WHERE id = ?';
            await this.db.run(statement, [name, description, id]);
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`exampleSqliteService.updateItem: ${msg}`);
        }
    }

    async deleteItem(id: number): Promise<void> {
        if (!this.initialized) await this.initializeDatabase();

        try {
            const statement = 'DELETE FROM items WHERE id = ?';
            await this.db.run(statement, [id]);
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`exampleSqliteService.deleteItem: ${msg}`);
        }
    }
}

// Servisi kullanmak için
export default new ExampleSqliteService(SQLiteService);