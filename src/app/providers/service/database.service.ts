import { Injectable } from '@angular/core';
import { PouchDBModel } from '@app/models/lookup/lookup';
import { DATABASE_NAME } from '@constants/database-constants';
import { SessionService } from '@providers/service/session/session.service';
import PouchDB from 'pouchdb';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import * as pouchdbUpsert from 'pouchdb-upsert';
PouchDB.plugin(pouchdbUpsert);

@Injectable({
  providedIn: 'root'
})

export class DatabaseService {

  // -------------------------------------------------------------------------
  // Properties

  public pouchDatabase: PouchDB.Database;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private sessionService: SessionService
  ) { }

  /**
   * @function createPouchDB
   * This Method is used to create pouch database
   */
  public createPouchDB() {
    const userId = this.sessionService.userSession.user_id;
    PouchDB.plugin(cordovaSqlitePlugin);
    this.pouchDatabase = new PouchDB(`${DATABASE_NAME}_${userId}`);
  }

  /**
   * @function getData
   * This Method is used to get data
   */
  public getDocument(documentKey): Promise<PouchDBModel>{
    return new Promise((resolve, reject) => {
      return this.pouchDatabase.get(documentKey).then((response) => {
        resolve(response);
      }).catch((err) => {
        if (err.status !== 404) {
          // tslint:disable-next-line:no-console
          console.error(`Error caught while fetching document for ${documentKey}`, err);
        }
        reject(err)
      });
    });
  }

  /**
   * @function upsertDocument
   * This Method is used to insert/update the document
   */
  public upsertDocument(documentKey, documentValue) {
    return this.pouchDatabase.upsert(documentKey, () => {
      return { value: documentValue };
    });
  }

  /**
   * @funion deleteDocument
   * This Method is used to delete the document
   */
  public deleteDocument(docId, docRev) {
    return this.pouchDatabase.remove(docId, docRev);
  }

  /**
   * @function documentKeyParser
   * This Method is used to parse the document key
   */
  public documentKeyParser(value, params) {
    let keyParser = value;
    Object.keys(params).forEach((keyName) => {
      keyParser = keyParser.replace(keyName, params[keyName]);
    });
    return keyParser.replace(/{|}/g, '');
  }
}
