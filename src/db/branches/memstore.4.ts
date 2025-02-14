import { TTruemapItem } from '../../Map';
import { fMap } from '../../';
import { type Database } from '../types'
import { newIndex } from '../../core/utils/common';
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
  
  async insertTemp(table: string, record: any): Promise<void> {
    const paths = this.parseKey(table);
    const tableName = paths[0];
    // If this is a table creation (schema insertion)
    if (paths.length === 2 && paths[1] === '_schema') {
      if (this.data.has(tableName)) {
        throw new Error(`Table ${tableName} already exists`);
      }
      console.log('New schema')
      this.data.set(tableName, [
        ['_schema', record],
        ['records', []]
      ]);
      return;
    }

    // For regular record insertions
    const tableData = this.data.get(tableName);
    if (!tableData) {
      throw new Error(`Table ${tableName} does not exist`);
    } else console.log('tableData', tableData)

    // Get or initialize the records array
    let recordsEntry = tableData.find(entry => {
      console.log('entry', entry)
      return entry[0] === 'records'
    });
    if (!recordsEntry) {
      recordsEntry = ['records', fMap.trueMap()];
      tableData.push(recordsEntry);
    }
    let recordsMap = recordsEntry[1];
    if (!(recordsMap instanceof fMap.trueMap)) {
      recordsMap = fMap.trueMap<string, any>();
      recordsEntry[1] = recordsMap;
    }

    // Generate a new index for the record
    let idx = newIndex(tableName);
    while (recordsMap.has(idx)) {
      idx = newIndex(tableName);
    }
    // Add the 
    // id field to the record
    // value.id = newIndex;

    // Add the new record
    recordsMap.set(newIndex, record);

    // Save the updated records map
    recordsEntry[1] = recordsMap;

    // Ensure the records are stored in a way that they can be retrieved correctly
    this.data.set(tableName, tableData);
  }

  async insert(key: string, value: any): Promise<void> {
    console.log(`Inserting key: ${key}, value: ${JSON.stringify(value)}`);
    const paths = this.parseKey(key);
    const tableName = paths[0];

    // First check if the table exists in data
    let tableData = this.data.get(tableName);

    // If this is a table creation (schema insertion)
    if (paths.length === 2 && paths[1] === '_schema') {
      if (tableData) {
        throw new Error(`Table ${tableName} already exists`);
      }
      tableData = [
        ['_schema', value],
        ['records', fMap.trueMap<string, any>().all()]
      ];
      this.data.set(tableName, tableData);
      console.log(`Created new table: ${tableName}`);
      return;
    }

    // For regular record insertions
    if (!tableData) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    // Get or initialize the records array
    let recordsEntry = tableData.find(entry => entry[0] === 'records');
    if (!recordsEntry) {
      recordsEntry = ['records', fMap.trueMap<string, any>().all()];
      tableData.push(recordsEntry);
    }

    let recordsMap = fMap.trueMap<string, any>();
    recordsMap.manager.replace(recordsEntry[1]);

    // Generate a new index for the record
    let newIndex = String(recordsMap.size);
    while (recordsMap.has(newIndex)) {
      newIndex = String(parseInt(newIndex) + 1);
    }

    // Add the id field to the record
    value.id = newIndex;

    // Add the new record
    recordsMap.set(newIndex, value);

    // Save the updated records map
    recordsEntry[1] = recordsMap.all();

    // Update the existing table data instead of creating a new entry
    this.data.set(tableName, tableData);
    console.log(`Updated table: ${tableName} with new record: ${JSON.stringify(value)}`);
  }

  async update(table: string, id: string, value: any): Promise<void> {
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
