import { getDataStorageService, DataStorageService } from './DataStorageService'
import { EventEmitter } from "events";
import CommonUtils from '../utils/CommonUtils';
import { SettingsData, settingsDef } from '../config/SettingsConst';

export class SettingsService extends EventEmitter {

  private staticDataStorageServices : DataStorageService = null;
  private staticSettings : SettingsData = null;
  private staticSettingsTemplate = settingsDef;

  public constructor() {
    super();
    this.staticDataStorageServices = getDataStorageService();
  }

  public sendUpdated() { this.emit('update'); }
  public getData() { return this.staticSettings }
  public setData(data : any) { 
    CommonUtils.cloneValueForce(this.staticSettings, data);
    this.emit('update');
  }
  public resetDefault() { 
    CommonUtils.cloneValueForce(this.staticSettings, this.staticSettingsTemplate);
    this.emit('update');
  }

  /**
   * 读取设置
   */
  public loadSettings() : Promise<any> {
    return this.staticDataStorageServices.loadData('settings').then((value) => {
      if(value) { 
        this.staticSettings = value;
        CommonUtils.cloneValueIfUndefined(this.staticSettings, this.staticSettingsTemplate);
        //Prealloc
        this.emit('afteroad');
      }
      else this.staticSettings = CommonUtils.clone(this.staticSettingsTemplate);
      
      console.log('[SettingsServices] loadSettings : ')
      console.dir(this.staticSettings);

      this.emit('load');
    }).catch(() => {
      this.staticSettings = CommonUtils.clone(this.staticSettingsTemplate);
    });
  }
  /**
   * 保存设置至磁盘
   */
  public saveSettings() : Promise<any> {
    //Prealloc
    this.emit('beforesave');
    let dataClone = CommonUtils.clone(this.staticSettings);
    //Save
    console.log('[SettingsServices] saveSettings : ')
    console.dir(dataClone);
    return this.staticDataStorageServices.saveData('settings', dataClone);
  }


  searchKeyInSettingObject(startObject: any, key : string) : any {
    let rs = null;
    let pointIndex = key.indexOf('.');
    if(pointIndex > 0){
      let currentKey = key.substr(0, pointIndex);
      let nextKey = key.substr(pointIndex + 1);
      rs = this.searchKeyInSettingObject(startObject[currentKey], nextKey);
    }else rs = startObject[key];
    return rs;
  }
  searchAndSetKeyInSettingObject(startObject: any, key : string, value : any) : any {
    let rs = null;
    let pointIndex = key.indexOf('.');
    if(pointIndex > 0){
      let currentKey = key.substr(0, pointIndex);
      let nextKey = key.substr(pointIndex + 1);
      rs = this.searchAndSetKeyInSettingObject(startObject[currentKey], nextKey, value);
    }else { 
      rs = startObject[key];
      startObject[key] = value;
    }
    return rs;
  }

  /**
   * 获取设置
   * @param key 设置的键值
   */
  public getSetting(key : string) : string {
    return this.searchKeyInSettingObject(this.staticSettings, key);
  }
  /**
   * 写入设置
   * @param key 设置的键值
   * @param value 设置值
   */
  public setSettingObject(key : string, value : object) {
    this.searchAndSetKeyInSettingObject(this.staticSettings, key, value);
  }
  /**
   * 获取设置
   * @param key 设置的键值
   */
  public getSettingObject(key : string) : any {
    return this.searchKeyInSettingObject(this.staticSettings, key);
  }
  /**
   * 写入设置
   * @param key 设置的键值
   * @param value 设置值
   */
  public setSetting(key : string, value : string) {
    this.searchAndSetKeyInSettingObject(this.staticSettings, key, value);
  }
  /**
   * 获取 number 设置
   * @param key 设置的键值
   */
  public getSettingNumber(key : string) : number {
    return this.searchKeyInSettingObject(this.staticSettings, key);
  }
  /**
   * 写入 number 设置
   * @param key 设置的键值
   * @param value 设置值
   */
  public setSettingNumber(key : string, value : number) {
    this.searchAndSetKeyInSettingObject(this.staticSettings, key, value);
  }
  /**
   * 获取 boolean 设置
   * @param key 设置的键值
   */
  public getSettingBoolean(key : string) : boolean {
    return this.searchKeyInSettingObject(this.staticSettings, key);
  }
  /**
   * 写入 boolean 设置
   * @param key 设置的键值
   * @param value 设置值
   */
  public setSettingBoolean(key : string, value : boolean) {
    this.searchAndSetKeyInSettingObject(this.staticSettings, key, value);
  }

}

let staticSettingsService : SettingsService = null;

export function getSettingsService() {
  return staticSettingsService;
}
export function createSettingsService() {
  if(staticSettingsService == null)
    staticSettingsService = new SettingsService();
  return staticSettingsService;
}