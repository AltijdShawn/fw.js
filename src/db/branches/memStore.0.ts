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

  async delete(key: string): Promise<void> {
    const paths = this.parseKey(key);
    const lastKey = paths[paths.length - 1];
    const subMap = this.getSubMap(paths);
    subMap.delete(lastKey);
  }

  getAll(table?: string): ReturnType<typeof fMap.trueMap<string, any>> {
    const result = fMap.trueMap<string, any>();
    
    if (table) {
      // If table is specified, get the subMap for that table
      const subMap = this.getSubMap(this.parseKey(table));
      if (!(subMap instanceof Map)) {
        throw new Error(`Table ${table} not found or is not a map`);
      }
      
      // Traverse only the specified subMap
      const traverse = (map: any, prefix: string = '') => {
        for (const [key, value] of map.entries()) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (value instanceof Map) {
            traverse(value, fullKey);
          } else {
            result.set(fullKey, value);
          }
        }
      };
      
      traverse(subMap);
    } else {
      // Original behavior for getting all entries
      const traverse = (map: any, prefix: string = '') => {
        for (const [key, value] of map.entries()) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (value instanceof Map) {
            traverse(value, fullKey);
          } else {
            result.set(fullKey, value);
          }
        }
      };
      
      traverse(this.data);
    }
    
    return result;
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

  async update(key: string, value: any): Promise<void> {
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
      throw new Error(`Key ${key} does not exist`);
    }
  }
}
