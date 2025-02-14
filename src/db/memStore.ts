import { TTruemapItem } from '../Map';
import { fMap } from '..';
import { type Database } from './types'
import { newIndex } from '../core/utils/common';

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
    const tableData = this.data.get(table);
    if (!tableData) {
        throw new Error(`Table ${table} does not exist`);
    }

    const recordsEntry = tableData.find(entry => entry[0] === 'records');
    if (!recordsEntry || !Array.isArray(recordsEntry[1])) {
        throw new Error(`No records found in table ${table}`);
    }

    const records = recordsEntry[1];
    const recordIndex = records.findIndex(record => record[0] === id);
    
    if (recordIndex !== -1) {
        records.splice(recordIndex, 1);
    }
  }

  getAll(table?: string): any[] {
    if (table) {
      const tableData = this.data.get(table);
      if (!tableData || !Array.isArray(tableData)) {
        throw new Error(`Table ${table} not found`);
      }

      const recordsEntry = tableData.find(entry => entry[0] === 'records');
      if (!recordsEntry || !Array.isArray(recordsEntry[1])) {
        return [];
      }

      return recordsEntry[1].map(record => ({
        id: record[0],
        ...record[1]
      }));
    }
    
    // If no table specified, return all data
    return Array.from(this.data.entries()).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }

  async getAllAsync(table?: string): Promise<any[]> {
    return this.getAll(table);
  }
  
  insert(table: string, record: any): any {
    const paths = this.parseKey(table);
    const tableName = paths[0];
    const lastKey = paths[paths.length - 1];

    let dbMap = this.data.get(tableName);
    if (!(paths.length === 2 && lastKey === '_schema') && !dbMap) {
        const recordsMap = fMap.trueMap<string, any>();
        const tableData = [
            ['_schema', record],
            ['records', recordsMap.all()]
        ];
        this.data.set(tableName, tableData);
        dbMap = this.data.get(tableName);
        // console.log(`Created new table: ${tableName}`);
    }

    const tableMap = fMap.trueMap<string, any>();
    if (dbMap) tableMap.manager.replace(dbMap);

    // console.log(dbMap, tableMap.has('_schema'), tableMap.has('records'));

    if (paths.length === 2 && lastKey === '_schema') {
      if (tableMap.has('_schema')) {
          throw new Error(`Table ${tableName} already exists`);
      }
      const recordsMap = fMap.trueMap<string, any>();
      const tableData = [
          ['_schema', record],
          ['records', recordsMap.all()]
      ];
      this.data.set(tableName, tableData);
      // console.log(`Created new table: ${tableName}`);
      return
    }

    if (!tableMap.has('_schema')) {
      throw new Error(`Table ${tableName} does not have a schema`);
    }

    if (!tableMap.has('records')) {
      tableMap.set('records', fMap.trueMap());
    }

    let records = tableMap.get('records');
    
    if (Array.isArray(records)) {
      records = fMap.trueMap<string, any>();
      records.manager.replace(tableMap.get('records'));
    }

    const idx = newIndex(tableName);

    // record.id = idx;
    
    records.set(idx, record);

    tableMap.set('records', records.all());

    this.data.set(tableName, tableMap.all());
  }

  async update(table: string, id: string, value: any): Promise<void> {
    const tableData = this.data.get(table);
    // console.log(
    //   'Update.Handler:',
    //   {table, id, value},
    //   tableData
    // )
    if (!tableData) {
        throw new Error(`Table ${table} does not exist`);
    }

    const recordsEntry = tableData.find(entry => entry[0] === 'records');
    if (!recordsEntry || !Array.isArray(recordsEntry[1])) {
        throw new Error(`No records found in table ${table}`);
    }

    const records = recordsEntry[1];
    const recordIndex = records.findIndex(record => record[0] === id);
    
    if (recordIndex === -1) {
        throw new Error(`Record with ID ${id} does not exist in table ${table}`);
    }

    // Update the record with the new value
    records[recordIndex] = [id, value];
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
