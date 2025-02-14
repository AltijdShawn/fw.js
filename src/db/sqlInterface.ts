import { InMemoryDatabase } from "./memStore";

export class SQLInterface {
    public db: InMemoryDatabase;

    constructor() {
        this.db = new InMemoryDatabase();
    }

    async executeQuery(sqlQuery: string): Promise<any> {
        if (!sqlQuery) {
            throw new Error('SQL query cannot be empty');
        }
        const normalizedQuery = sqlQuery.trim().toLowerCase();

        if (normalizedQuery.startsWith('create table')) {
            return this.handleCreateTable(sqlQuery);
        } else if (normalizedQuery.startsWith('select')) {
            return this.handleSelect(sqlQuery);
        } else if (normalizedQuery.startsWith('insert')) {
            return this.handleInsert(sqlQuery);
        } else if (normalizedQuery.startsWith('update')) {
            return this.handleUpdate(sqlQuery);
        } else if (normalizedQuery.startsWith('delete')) {
            return this.handleDelete(sqlQuery);
        } else {
            throw new Error('Unsupported SQL operation');
        }
    }

    private handleSelect(query: string): any[] {
        // Basic SELECT parsing
        const matches = query.match(/select\s+(.*?)\s+from\s+(\w+)(?:\s+where\s+(.*))?/i);
        if (!matches) throw new Error('Invalid SELECT query');

        const [_, columns, table, whereClause] = matches;
        const selectedColumns = columns.split(',').map(col => col.trim());

        let result = this.db.getAll(table);

        if (whereClause) {
            result = this.applyWhereClause(result, whereClause);
        }

        return this.projectColumns(result, selectedColumns);
    }

    private handleInsert(query: string): any {
        const matches = query.match(/insert\s+into\s+(\w+)\s*\((.*?)\)\s*values\s*\((.*?)\)/i);
        if (!matches) throw new Error('Invalid INSERT query');

        const [_, table, columns, values] = matches;
        const columnNames = columns.split(',').map(col => col.trim());
        const rowValues = values.split(',').map(val => {
            const trimmed = val.trim();
            // Handle null values
            if (trimmed.toLowerCase() === 'null') return null;
            // Handle string values with possible spaces
            if (trimmed.startsWith("'")) return trimmed.slice(1, -1);
            // Handle numeric values
            const num = Number(trimmed);
            if (isNaN(num)) throw new Error(`Invalid numeric value: ${trimmed}`);
            return num;
        });

        if (columnNames.length !== rowValues.length) {
            throw new Error('Column count does not match values count');
        }

        const record = Object.fromEntries(columnNames.map((col, i) => [col, rowValues[i]]));
        return this.db.insert(table, record);
    }

    private handleUpdate(query: string): any {
        const matches = query.match(/UPDATE ([A-Za-z0-9]+) SET ([A-Za-z0-9]+\s=\s[A-Za-z0-9]+) [A-Za-z]+ ([A-Za-z]+\s=\s'[A-Za-z0-9]+')/i);
        if (!matches) throw new Error('Invalid UPDATE query');

        const [_, table, setClause, whereClause] = matches;
        


        const updates = Object.fromEntries(
            setClause.split(',').map(pair => {
                // console.log(
                //     'pair:', pair, 
                //     '\nsetClauseSplit:', setClause.split(','), 
                //     '\nsetClause:', setClause,
                //     '\nmatches:', matches)
                const [col, val] = pair.split('=').map(s => s.trim());
                const value = String(val).startsWith("'") ? val.slice(1, -1) : Number(val);
                return [col, value];
            })
        );

        let records = this.db.getAll(table);
        if (whereClause) {
            records = this.applyWhereClause(records, whereClause);
        }

        records.forEach(record => {
            this.db.update(table, record.id, { ...record, ...updates });
        });

        return { updated: records.length };
    }

    private handleDelete(query: string): any {
        const matches = query.match(/delete from (\w+)(?: where (.*))?/i);
        if (!matches) throw new Error('Invalid DELETE query');

        const [_, table, whereClause] = matches;

        let records = this.db.getAll(table);
        if (whereClause) {
            records = this.applyWhereClause(records, whereClause);
        }

        records.forEach(record => {
            this.db.delete(table, record.id);
        });

        return { deleted: records.length };
    }

    private async handleCreateTable(query: string): Promise<any> {
        // Matches: CREATE TABLE tablename (column1 type, column2 type, ...)
        const matches = query.match(/create\s+table\s+(\w+)\s*\((.*)\)/i);
        if (!matches) throw new Error('Invalid CREATE TABLE query');

        const [_, tableName, columnDefinitions] = matches;

        if (await this.db.has(tableName.toLowerCase())) {
            console.log(`Table '${tableName.toLowerCase()}' found to already be existing.`)
            return
        }
        else {
            // Parse column definitions
            const columns = columnDefinitions.split(',').map(col => {
                const [name, type] = col.trim().split(/\s+/);
                if (!name || !type) {
                    throw new Error(`Invalid column definition: ${col}`);
                }
                return {
                    name: name.toLowerCase(),
                    type: type.toLowerCase()
                };
            });

            console.log('cols',columns)

            // Validate column types
            const validTypes = ['text', 'number', 'boolean'];
            columns.forEach(col => {
                if (!validTypes.includes(col.type)) {
                    throw new Error(`Unsupported data type: ${col.type}`);
                }
            });

            // Create the table in the database
            return this.db.createTable(tableName.toLowerCase(), columns);
        }
    }

    private applyWhereClause(records: any[], whereClause: string): any[] {
        // Handle more complex WHERE conditions
        const [column, operator, ...valueParts] = whereClause.trim().split(/\s+/);
        const value = valueParts.join(' ').trim();

        // Handle null comparisons
        if (value.toLowerCase() === 'null') {
            return records.filter(record => {
                switch (operator.toLowerCase()) {
                    case 'is':
                        return record[column] === null;
                    case 'is not':
                        return record[column] !== null;
                    default:
                        throw new Error(`Invalid operator for NULL comparison: ${operator}`);
                }
            });
        }

        const compareValue = value.startsWith("'") ? value.slice(1, -1) : Number(value);
        if (!value.startsWith("'") && isNaN(<any>compareValue)) {
            throw new Error(`Invalid value in WHERE clause: ${value}`);
        }

        return records.filter(record => {
            switch (operator.toLowerCase()) {
                case '=':
                case '==':
                    return record[column] === compareValue;
                case '>':
                    return record[column] > compareValue;
                case '<':
                    return record[column] < compareValue;
                case '>=':
                    return record[column] >= compareValue;
                case '<=':
                    return record[column] <= compareValue;
                case '!=':
                case '<>':
                    return record[column] !== compareValue;
                default:
                    throw new Error(`Unsupported operator: ${operator}`);
            }
        });
    }

    private projectColumns(records: any[], columns: string[]): any[] {
        if (columns.includes('*')) return records;

        return records.map(record => {
            return Object.fromEntries(
                columns.map(col => [col, record[col]])
            );
        });
    }
}

export default SQLInterface;

