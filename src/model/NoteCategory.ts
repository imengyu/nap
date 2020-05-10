import { Saveable } from "./Saveable";
import { Note } from "./Note";
import CommonUtils from "../utils/CommonUtils";
import { getNoteService } from "../service/NoteService";

export class NoteDateGroup {
  year : number;
  month : number;
  notes : Array<Note> = [];

  notTopMostCount() {
    let count = 0;
    for (let index = 0; index < this.notes.length; index++) {
      if(!this.notes[index].topMost)
        count++;
    }
    return count;
  }
  getDateString() {
    return this.year == new Date().getFullYear() ? (this.month  + '月') : (this.year + '年' + this.month  + '月');
  }
}

export class NoteCategory implements Saveable {
  uid : string;
  createDate : Date = new Date();
  name : string = "";
  checked = false;

  constructor(createDate?: Date, name?: string) {
    this.createDate = createDate;
    this.name = name;
    this.uid = CommonUtils.genNonDuplicateID(6);
  }

  toJson(): string {
    return JSON.stringify({
      createDate: this.createDate,
      name: this.name,
      uid: this.uid,
    });
  }
  fromJson(json: string) {
    var o = JSON.parse(json);
    this.createDate = new Date(o.createDate);
    this.name = o.name;
    this.uid = o.uid;
  }

  get text() { return this.name; }
  get value() { return this.uid; }
  get childCount() {
    return getNoteService().getNoteCountByCategory(this.uid);
  }
  get isAll() {
    return getNoteService().noteCategoryAll.uid == this.uid;
  }
}