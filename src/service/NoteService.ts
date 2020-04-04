import { NoteCategory, NoteDateGroup } from "../model/NoteCategory";
import { Saveable } from "../model/Saveable";
import { Note } from "../model/Note";
import { EventEmitter } from "events";
import { getDataStorageService } from "./DataStorageService";

export class NoteService extends EventEmitter implements Saveable {

  noteCategories : Array<NoteCategory> = [];
  noteCategoryAll : NoteCategory = null;
  noteCategoryCurrent : NoteCategory = null;
  notes : Array<Note> = [];


  toJson(): string {
    var noteCategories = [];
    for (let i = 0; i < this.noteCategories.length; i++)
      noteCategories.push(this.noteCategories[i].toJson());
    var notes = [];
    for (let i = 0; i < this.notes.length; i++)
    notes.push(this.notes[i].toJson());
    return JSON.stringify({
      noteCategories: noteCategories,
      notes: notes,
    });
  }
  fromJson(json: string) {
    var conAll = false;
    var o = JSON.parse(json);
    if(o) {
      if(o.notes) {
        this.notes = [];
        for (let i = 0; i < o.notes.length; i++) {
          var n = new Note();
          n.fromJson(o.notes[i]);
          this.notes.push(n);
        }
      } 
      if(o.noteCategories) {
        this.noteCategories = [];
        for (let i = 0; i < o.noteCategories.length; i++) {
          var nc = new NoteCategory();
          nc.fromJson(o.noteCategories[i]);
          if(nc.name == '全部便签') { 
            conAll = true;
            this.noteCategoryAll = nc;
          }
          this.noteCategories.push(nc);
        }
      }
    }

    if(!conAll) {
      this.noteCategoryAll = new NoteCategory(new Date(), '全部便签');
      this.noteCategories.push(this.noteCategoryAll);
    }

    this.noteCategoryCurrent = this.noteCategoryAll;
  }

  setCurrentCategory(uid : string) {
    this.noteCategoryCurrent = this.findCategory(uid);
    if(this.noteCategoryCurrent == null)
      this.noteCategoryCurrent = this.noteCategoryAll;
    this.emit('current-category-changed');
  }

  load() {
    return getDataStorageService().loadData('notes');
  }
  save() {
    return getDataStorageService().saveData('notes', getNoteService().toJson());
  }

  emitNotesUpdate() { this.emit('update-notes'); }
  emitCategoriesUpdate() { this.emit('update-categories'); }

  addNote() {
    var note = new Note();
    note.parentUid = this.noteCategoryCurrent.uid;

    this.notes.push(note);
    this.emit('update-notes');

    return note;
  }
  deleteNote(uid : string, notify = true) {
    for (let i = this.notes.length - 1; i >= 0; i--) {
      if(this.notes[i].uid == uid) {
        this.notes.remove(i);
        if(this.notes[i].parentUid == this.noteCategoryCurrent.uid)
          if(notify) this.emit('update-notes');
        break;
      }
    }
  }
  addCategory(name : string) {
    this.noteCategories.push(new NoteCategory(undefined, name));
    this.emit('update-categories');
  }
  deleteCategory(uid : string) {
    for (let i = this.noteCategories.length - 1; i >= 0; i--) {
      if(this.noteCategories[i].uid == uid) {
        this.noteCategories.remove(i);
        this.emit('update-categories');
        break;
      }
    }
  }

  findCategory(uid : string) {
    for (let i = 0; i < this.noteCategories.length; i++) {
      if(this.noteCategories[i].uid == uid)
        return this.noteCategories[i];
    }
    return null;
  }
  findCategoryByName(name : string) {
    for (let i = 0; i < this.noteCategories.length; i++) {
      if(this.noteCategories[i].name == name)
        return this.noteCategories[i];
    }
    return null;
  }
  findNote(uid : string) {
    for (let i = 0; i < this.notes.length; i++) {
      if(this.notes[i].uid == uid)
        return this.notes[i];
    }
    return null;
  }

  getCurrentCategoryNote(sortType : 'createDate'|'updateDate'|'name') {
    return this.getNoteByCategory(this.noteCategoryCurrent.uid, sortType);
  }
  getNoteByCategory(categoryUid : string, sortType : 'createDate'|'updateDate'|'name') {
    var notes : Array<Note> = [];
    for (let i = 0; i < this.notes.length; i++) {
      if(this.notes[i].parentUid == categoryUid)
      notes.push(this.notes[i]);
    }

    if(sortType=='createDate')
      notes.sort((a, b) => -(a.createDate.getTime() - b.createDate.getTime()));
    else if(sortType=='updateDate')
      notes.sort((a, b) => -(a.lastUpdateDate.getTime() - b.lastUpdateDate.getTime()));
    else if(sortType=='name')
      notes.sort((a, b) => -(a.title.localeCompare(b.title)));

    return notes;
  }
  getNoteCountByCategory(categoryUid : string) {
    var count = 0;
    for (let i = 0; i < this.notes.length; i++) {
      if(this.notes[i].parentUid == categoryUid) count++;
    }
    return count;
  }
  groupNotesByDate(notes : Array<Note>, sortType : 'createDate'|'updateDate') : Array<NoteDateGroup> {
    var rs = new Array<NoteDateGroup>();
    var currentNoteDateGroup : NoteDateGroup = null;
    var currentYear = 0;
    var currentMonth = 0;
    for(var i = 0; i < notes.length;i++) {
      var year = sortType == 'createDate' ? notes[i].createDate.getFullYear() : notes[i].lastUpdateDate.getFullYear();
      var month = (sortType == 'createDate' ? notes[i].createDate.getMonth() : notes[i].lastUpdateDate.getMonth()) + 1;
      if(year != currentYear || month != currentMonth) {
        currentNoteDateGroup = new NoteDateGroup();
        currentNoteDateGroup.year = year;
        currentNoteDateGroup.month = month;
        currentYear = year;
        currentMonth = month;
        rs.push(currentNoteDateGroup);
      }

      currentNoteDateGroup.notes.push(notes[i]);
    }
    return rs;
  }
}

let noteService : NoteService = null;

export function getNoteService() {
  return noteService;
}
export function createNoteService() {
  if(noteService == null)
    noteService = new NoteService();
  return noteService;
}