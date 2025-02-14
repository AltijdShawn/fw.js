export interface Database {
  has?(key:string): Promise<boolean>;
  get(key: string): any;
  set(key: string, value: any): void;
  delete(table:string, id:string): void;
}