import Datastore from 'nedb'
import { Logger } from 'log4js';

export class DataStorageService {
  private db : Datastore = null;

  public constructor(db : Datastore){
    this.db = db;
  }

  public init() : Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.loadDatabase(function (err) {
        if(err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 保存数据
   * @param key 键值
   * @param object 数据
   */
  public saveData(key : string, object : any) : Promise<any> {
    
    return new Promise((resolve, reject) => {
      let objectO = { key: key, data: object };
      this.db.find({ key: key }, (err, objectReturn)  => {
        if(objectReturn && objectReturn.length > 0){//有记录，更新
          console.info('[DataStorageService] Save data [update] ' + key);
          this.db.update({ key: key }, objectO, {}, (err, doc)  => {
            if(err) reject(err);
            else resolve();
          });
        }else {//无记录，新增
          console.info('[DataStorageService] Save data [insert] ' + key);
          this.db.insert(objectO, (err, doc)  => {
            if(err) reject(err);
            else resolve();
          });
        }
      });
      
    });
  }
  /**
   * 加载数据
   * @param key 键值
   */
  public loadData(key : string) : Promise<any> {
    console.info('[DataStorageService] Load data ' + key);
    
    return new Promise((resolve, reject) => {
      let objectO = { key: key };
      this.db.find(objectO, (err, objectReturn) => {
        if(err) {
          reject(err);
          console.error(err);
        }
        else if(objectReturn && objectReturn.length > 0) {
          resolve(objectReturn[0].data);
        } else {
          resolve(null);
        }
      });
    });
    
  }
  /**
   * 清除数据
   */
  public clearData() : Promise<any> {
    console.info('Clear all datas');
    return new Promise((resolve, reject) => {
      this.db.remove({}, { multi: true }, function (err, numRemoved) {
        if(err) reject(err);
        else resolve(numRemoved);
      });
    });
  }

  public destroy() {
  }
}

let dataStorageService : DataStorageService = null;

export function getDataStorageService() {
  return dataStorageService;
}
export function createDataStorageService() {
  if(dataStorageService == null) {
    dataStorageService = new DataStorageService(window.appDb);
    dataStorageService.init();
  }
  return dataStorageService;
}