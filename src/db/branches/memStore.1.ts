import { TTruemapItem } from 'src/Map';
import { fMap } from '../..';
import { type Database } from '../types'
export class InMemoryDatabase implements Database {
  public data = fMap.trueMap<string, any>();
  private parseKey(key: string): string[] {
    return key.split(".");
  }
  
  private getSubMap(paths: string[]): any {
    let currentMap = this.data;
    
    for (const path of paths.slice(0, -1)) {
      if (!currentMap.has(path)) {
        currentMap.set(path, []);
      }
      let value = currentMap.get(path);
      if (Array.isArray(value)) {
        let newMap = fMap.trueMap<string, any>();
        newMap.manager.replace(<any>value);
        currentMap = newMap;
      } else {
        currentMap = value;
      }
    }
    
    return currentMap;
  }

  async get(key: string): Promise<any> {
    const paths = this.parseKey(key);
    const lastKey = paths[paths.length - 1];
    const subMap = this.getSubMap(paths);
    return subMap.get(lastKey);
  }

  async set(key: string, value: any): Promise<void> {
    const paths = this.parseKey(key);
    const lastKey = paths[paths.length - 1];
    const subMap = this.getSubMap(paths);
    
    if (value && typeof value === 'object') {
      const allEntries = Object.entries(value).map(([k, v]) => [k, v]);
      subMap.set(lastKey, allEntries);
    } else {
      subMap.set(lastKey, value);
    }
  }

  async delete(table: string, id: string): Promise<void> {
    const key = `${table}.${id}`;
    const paths = this.parseKey(key);
    const lastKey = paths[paths.length - 1];
    const subMap = this.getSubMap(paths);
    subMap.delete(lastKey);
  }

  getAll(table?: string): any[] {
    const result = fMap.trueMap<string, any>();
    
    if (table) {
      const subMap = this.getSubMap(this.parseKey(table));
      if (!(subMap instanceof Map)) {
        throw new Error(`Table ${table} not found or is not a map`);
      }
      return Array.from(subMap.entries()).map(([key, value]) => ({
        id: key,
        ...value
      }));
    }
    
    return Array.from(this.data.entries()).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }
  
  async insert(key: string, value: any): Promise<void> {
    const paths = this.parseKey(key);
    const lastKey = paths[paths.length - 1];
    const subMap = this.getSubMap(paths);
    
    // Only insert if the key doesn't exist
    if (!subMap.has(lastKey)) {
      if (value && typeof value === 'object') {
        const allEntries = Object.entries(value).map(([k, v]) => [k, v]);
        subMap.set(lastKey, allEntries);
      } else {
        subMap.set(lastKey, value);
      }
    } else {
      throw new Error(`Key ${key} already exists`);
    }
  }

  async update(table: string, id: string, value: any): Promise<void> {
    const key = `${table}.${id}`;
    const paths = this.parseKey(key);
    const lastKey = paths[paths.length - 1];
    const subMap = this.getSubMap(paths);
    
    // Only update if the key exists
    if (subMap.has(lastKey)) {
      if (value && typeof value === 'object') {
        const allEntries = Object.entries(value).map(([k, v]) => [k, v]);
        subMap.set(lastKey, allEntries);
      } else {
        subMap.set(lastKey, value);
      }
    } else {
      throw new Error(`Key ${id} does not exist in table ${table}`);
    }
  }

  async createTable(tableName: string, columns: Array<{ name: string, type: string }>): Promise<any> {
    // Check if table already exists by trying to get its schema
    // const tableSchema = await this.get(`${tableName}._schema`);
    // console.log(tableSchema)
    if (await this.has(`${tableName}._schema`)) {
        throw new Error(`Table ${tableName} already exists`);
    }
    
    // Store the schema using the existing subMap structure
    await this.set(`${tableName}._schema`, {
        columns,
        createdAt: new Date().toISOString()
    });
    
    return { message: `Table ${tableName} created successfully` };
  }

  async has(key: string): Promise<boolean> {
    const paths = this.parseKey(key);
    const lastKey = paths[paths.length - 1];
    const subMap = this.getSubMap(paths);
    return subMap.has(lastKey);
  }
}
