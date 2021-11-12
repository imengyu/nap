import { Saveable } from "./Saveable";
import CommonUtils from "../utils/CommonUtils";

export class Note implements Saveable {
  
  uid : string;
  parentUid : string;
  createDate : Date = new Date();
  lastUpdateDate : Date = new Date();
  titleSetted : string = '';
  titleFirst : string = '';
  content : string = '';

  checked = false;
  topMost = false;

  constructor() {
    this.uid = CommonUtils.genNonDuplicateID(6);
  }

  toJson(): string {
    return JSON.stringify(this);
  }
  fromJson(json: string) {
    var o = JSON.parse(json);
    this.createDate = new Date(o.createDate);
    this.lastUpdateDate = new Date(o.lastUpdateDate);
    this.titleSetted = o.titleSetted || '';
    this.titleFirst = o.titleFirst || '';
    this.topMost = o.topMost;
    this.uid = o.uid;
    this.parentUid = o.parentUid;
    this.content = o.content;
  }

  get contentExtract() : string {
    if(CommonUtils.isNullOrEmpty(this.content))
      return "";
    else {
      var dd = this.content.replace(/<[^>]+>/g,"");//截取html标签
      var dds =  dd.replace(/&nbsp;/ig,"");//截取空格等特殊标签

      if(dds.length > 60) 
        return dds.substr(0, 60) + '...';
      else return dds;
    }
  }
  get title() {
    if(!CommonUtils.isNullOrEmpty(this.titleSetted)) 
      return this.titleSetted;
    if(!CommonUtils.isNullOrEmpty(this.titleFirst)) 
      return this.titleFirst;
    return "[未命名便签]";
  }

  betterCreateDate() { return CommonUtils.getBetterDate(this.createDate); }
  betterUpdateDate() { return CommonUtils.getBetterDate(this.lastUpdateDate); }
}