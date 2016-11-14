declare namespace PouchDB {
    interface Static {
      allDbs(): Promise<string[]>;
      allDbs(callback: (err: Error, dbs: string[]) => any): void;
  }
}
