
<template>
  <div class="note">
    <mu-appbar v-if="noteItemChooseMode" class="w-100">
      <mu-button @click="noteItemChooseMode=false" icon slot="left">
        <mu-icon value="close"></mu-icon>
      </mu-button>
      <span v-if="noteCheckedCount>0">已选 {{ noteCheckedCount }} 项</span>
      <span v-else>请选择项目</span>
      <mu-button flat slot="right" @click="onNoteCheckAll">
        <mu-icon value="playlist_add_check"></mu-icon>
      </mu-button>
    </mu-appbar>
    <mu-appbar v-else class="w-100">
      <mu-button @click="leftSide=true" icon slot="left">
        <mu-icon value="menu"></mu-icon>
      </mu-button>
      <div class="top-tab">
        <van-dropdown-menu>
          <van-dropdown-item ref="topTabCategories" v-if="noteCategories" v-model="currentCategory" :options="noteCategories">
            <div class="d-flex justify-content-between align-items-center">
              <van-button style="width:50%" type="default" @click="$refs.topTabCategories.toggle(false);onMgrFolderClick()">
                <div class="d-flex justify-content-center align-items-center"><mu-icon value="folder_special" class="mr-2"></mu-icon>管理收藏夹</div>
              </van-button>
              <van-button style="width:50%" type="info" @click="$refs.topTabCategories.toggle(false);onAddFolderClick()">
                <div class="d-flex justify-content-center align-items-center"><mu-icon value="add" class="mr-2"></mu-icon>新建收藏夹</div>
              </van-button>
            </div>
          </van-dropdown-item>
        </van-dropdown-menu>
      </div>
      <mu-menu slot="right">
        <mu-menu placement="left" :open.sync="topMenuShow" cover>
          <mu-button flat>
            <mu-icon value="more_vert"></mu-icon>
          </mu-button>
          <mu-list slot="content">
            <mu-list-item @click="topMenuShow=false;onAddNoteClick()" button>
              <mu-list-item-title>新便签</mu-list-item-title>
            </mu-list-item>
            <mu-list-item @click="topMenuShow=false;onAddProjectClick()" button>
              <mu-list-item-title>新待办</mu-list-item-title>
            </mu-list-item>
            <mu-list-item @click="topMenuShow=false;onMgrFolderClick()" button>
              <mu-list-item-title>管理收藏夹</mu-list-item-title>
            </mu-list-item>
            <mu-list-item @click="onSwitchListMode();topMenuShow=false" button>
              <mu-list-item-title>{{  currentListMode == 'list' ? '列表模式' : '宫格模式' }}</mu-list-item-title>
            </mu-list-item>
            <mu-list-item @click="onQuitClick" button>
              <mu-list-item-title>退出</mu-list-item-title>
            </mu-list-item>
          </mu-list>
        </mu-menu>

      </mu-menu>
    </mu-appbar>

    <!--搜索区域-->
    <van-search
      v-model="searchValue"
      placeholder="搜索便签和日记"
      input-align="center"
      class="note-search"
    />
    <!--显示区域-->

    <div v-if="noteCurrentShowDateGroup && noteCurrentShowDateGrouped && noteCurrentShowDateGrouped.length > 0" 
      :class="'note-list ' + (currentListMode) + (noteItemChooseMode ? ' lonclick' : '')">
      <ul v-if="noteCurrentShowToped && noteCurrentShowToped.length > 0" class="note-list-inn">
        <li class="month">
          <h5>置顶</h5>
        </li>
        <note-item v-for="note in noteCurrentShowToped" :key="note.uid" :note="note" :currentListSortMode="currentListSortMode"
          @click="onNoteClick(note)" @touchstart="onNoteTouchstart(note)" @touchend="onNoteTouchend(note)"
          @noteCheckChanged="onNoteCheckChanged">
          <template slot="right">

          </template>
        </note-item>

      </ul>
      <ul class="note-list-inn" v-for="(dateGroup, i) in noteCurrentShowDateGrouped" :key="i">
        <li class="month">
          <h5>{{ dateGroup.getDateString() }}</h5>
        </li>
        <note-item v-for="note in dateGroup.notes" :key="note.uid" :note="note" :currentListSortMode="currentListSortMode"
          @click="onNoteClick(note)" @touchstart="onNoteTouchstart(note)" @touchend="onNoteTouchend(note)"
          @noteCheckChanged="onNoteCheckChanged" :hidden="note.topMost" />
        
      </ul>
      <div v-if="noteCurrentShow && noteCurrentShow.length > 10" class="center-text">
         到底啦
      </div>
    </div>
    <div v-else-if="noteCurrentShow && noteCurrentShow.length > 0" :class="'note-list ' + (currentListMode) + (noteItemChooseMode ? ' lonclick' : '')">
      <ul v-if="noteCurrentShowToped && noteCurrentShowToped.length > 0" class="note-list-inn">
        <li class="month">
          <h5>置顶</h5>
        </li>
        <note-item v-for="note in noteCurrentShowToped" :key="note.uid" :note="note" :currentListSortMode="currentListSortMode"
          @click="onNoteClick(note)" @touchstart="onNoteTouchstart(note)" @touchend="onNoteTouchend(note)"
          @noteCheckChanged="onNoteCheckChanged">
          <template slot="right">

          </template>
        </note-item>

      </ul>
      <ul class="note-list-inn">
        <note-item v-for="note in noteCurrentShow" :key="note.uid" :note="note" :currentListSortMode="currentListSortMode"
          @click="onNoteClick(note)" @touchstart="onNoteTouchstart(note)" @touchend="onNoteTouchend(note)"
          @noteCheckChanged="onNoteCheckChanged"
          :hidden="note.topMost" />

      </ul>
      <div v-if="noteCurrentShow.length > 10" class="center-text">
         到底啦
      </div>
    </div>
    <div v-else class="note-none">
      <img src="../assets/images/empty.svg"/>
      <h5>空空如也，这里还没有便签哦</h5>
      <mu-button round color="primary" @click="onAddNoteClick">写便签</mu-button>
    </div>

    <!--添加按钮-->
    <mu-scale-transition>
      <div v-show="!noteItemChooseMode" class="fab-con">
        <mu-scale-transition>
          <mu-tooltip v-show="fabMoreShow" content="添加便签" placement="left">
            <mu-button class="mb-3" small fab color="red" @click="fabMoreShow=false;onAddNoteClick()">
              <mu-icon value="edit"></mu-icon>
            </mu-button>
          </mu-tooltip>
        </mu-scale-transition>
        <mu-scale-transition>
          <mu-tooltip v-show="fabMoreShow" content="添加收藏夹" placement="left">
            <mu-button class="mb-3" small fab color="teal" @click="fabMoreShow=false;onAddFolderClick()">
              <mu-icon value="folder_special" />
            </mu-button>
          </mu-tooltip>
        </mu-scale-transition>

        <mu-button :class="'add' + (fabMoreShow ? ' roate-45' : '')" fab color="primary" @click="fabMoreShow=!fabMoreShow">
          <mu-icon value="add"></mu-icon>
        </mu-button>
      </div>
    </mu-scale-transition>

    <!--选择列表显示模式-->
    <van-action-sheet
      v-model="chooseListMode"
      :actions="actionListMode"
      @select="onListModeSelect"
      cancel-text="取消"
      description="选择列表显示模式"
    />
    <!--编辑收藏夹-->
    <van-action-sheet v-model="editorFolders" title="编辑收藏夹">     
      <van-list finished-text="到底啦">
        <van-cell v-for="category in noteCategories" :key="category.uid" :title="category.name">
          <template #title class="">
            <span style="font-size:16px;font-weight:blod">{{ category.name }}</span>
            <span class="ml-2 text-secondary">{{ category.childCount }}</span>
          </template>
          <template #right-icon >
            <mu-button v-show="!category.isAll" icon small color="primary" @click="onEditFolderClick(category.uid)">
              <mu-icon value="edit"></mu-icon>
            </mu-button>
            <mu-button v-show="!category.isAll" icon small color="secondary" @click="onDeleteFolderClick(category.uid)">
              <mu-icon value="close"></mu-icon>
            </mu-button>
          </template>
        </van-cell>
      </van-list>
      <van-button block type="default" @click="onAddFolderClick()">
        <div class="d-flex justify-content-center align-items-center"><mu-icon value="add" class="mr-2"></mu-icon>新建收藏夹</div>
      </van-button>
    </van-action-sheet>
    <!--添加收藏夹-->
    <van-dialog v-model="addFolder" title="添加收藏夹" show-cancel-button @confirm="onAddFolderFinish">
      <van-field v-model="editingCategoryName" placeholder="请输入收藏夹名称" />
    </van-dialog>
    <van-dialog v-model="editingFolder" title="编辑收藏夹" show-cancel-button @confirm="onEditFolderFinish">
      <van-field v-model="editingCategoryName" placeholder="请输入收藏夹名称" />
    </van-dialog>

    <!--侧边菜单-->
    <van-popup
      v-model="leftSide"
      position="left"
      :style="{ width: '70%', height: '100%' }"
    >
      <div class="nav-left-head">
        <img src="../assets/images/logo128.png" />
        <h1>Note and projects</h1>
        <span>BETA</span>
      </div>
      <ul class="nav-left">
        <li @click="leftSide=false;onAddNoteClick()">新便签</li>
        <li @click="leftSide=false;onAddProjectClick()">新待办</li>
        <li @click="leftSide=false;onMgrFolderClick()">管理收藏夹</li>
        <li @click="onAboutClick();leftSide=false;">关于</li>
        <li @click="onSettingsClick">设置</li>
        <li @click="onQuitClick">退出</li>
      </ul>
    </van-popup>
    
    <!--长按操作菜单-->
    <mu-slide-bottom-transition>
      <ul class="bottom-tool-bar" v-show="noteItemChooseMode" :disabled="noteCheckedCount==0">

        <li class="w-25" v-if="noteCheckedCount==noteCheckedAndTopCount" @click="onNoteCheckedNoTop"><mu-icon value="vertical_align_bottom"></mu-icon><span>取消置顶</span>
        </li>
        <li class="w-25" v-else @click="onNoteCheckedTop"><mu-icon value="vertical_align_top"></mu-icon><span>置顶</span>
        </li>
        
        <li class="w-25" @click="onNoteCheckedToPrivate"><mu-icon value="remove_red_eye"></mu-icon><span>设为隐私</span>
        </li>
        <li class="w-25" @click="onNoteCheckedDelete"><mu-icon value="delete"></mu-icon><span>删除</span>
        </li>
        <li class="w-25" @click="onNoteCheckedMoveToFolder"><mu-icon value="folder_special"></mu-icon><span>移动至收藏夹</span>
        </li>
      </ul>
    </mu-slide-bottom-transition>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Emit,
  Inject,
  Model,
  Prop,
  Provide,
  Vue,
  Watch
} from "vue-property-decorator";

import "../utils/base-extends";
import $ from "jquery";
import electron from "electron";
import { getNoteService, NoteService } from "../service/NoteService";
import { getDataStorageService } from "../service/DataStorageService";
import { Dialog, Toast } from 'vant';
import { Notify } from 'vant';
import { NoteCategory, NoteDateGroup } from "../model/NoteCategory";
import { settingsDef, SettingsData } from "../config/SettingsConst";
import { Route } from "vue-router";
import { SettingsService, getSettingsService } from "../service/SettingsService";
import { Note } from "../model/Note";
import NoteItem from "../components/NoteItem.vue";

const ipc = electron.ipcRenderer;

@Component({
  components: {
    'note-item': NoteItem
  }
})
export default class Index extends Vue {
  name = "Index";

  leftSide = false;
  fabMoreShow = false;
  chooseListMode = false;
  editorFolders = false;
  topMenuShow = false;
  addFolder = false;
  editingFolder = false;
  editingCategoryName = '';
  editingCategory : NoteCategory = null;
  noteItemChooseModeTimer = null;
  noteItemChooseMode = false;
  noteCheckedCount = 0;
  noteCheckedAndTopCount = 0;

  actionListMode = [ 
    { name: '宫格模式', mode: 'grid' }, 
    { name: '列表模式', mode: 'list' } 
  ];
  currentListSortMode = 'createDate';
  currentListMode = 'list';
  currentCategory = null;


  searchValue = "";

  settingsService : SettingsService = null;
  settingsData : SettingsData;
  noteService : NoteService = null;
  noteCategories : Array<NoteCategory> = null;
  noteCurrentShowDateGrouped : Array<NoteDateGroup> = null;
  noteCurrentShowDateGroup = true;
  noteCurrentShow : Array<Note> = null;
  noteCurrentShowToped : Array<Note> = null;

  @Watch("$route") 
  onRouteChanged(newV : Route, oldV : Route) {
    if(oldV.path == '/settings' && newV.path == '/') 
      this.loadSettings();
  }
  @Watch("currentCategory") 
  onCurrentCategorySelectChanged(newV : string) {
    this.noteService.setCurrentCategory(newV);
  }

  mounted() {
    this.noteService = getNoteService();
    this.loadSettings();
    this.loadDatas();
  }
  beforeDestroy() {
    this.settingsService.off('update', this.onSettingsUpdate);
    this.noteService.off('update-categories', this.onUpdateCategories);
    this.noteService.off('current-category-changed', this.onCurrentCategoryChanged);
    this.noteService.off('update-notes', this.onNotesChanged);
    this.saveDatas();
  }

  //** Init styles
  loadSettings() {
    //加载设置
    this.settingsService = getSettingsService();
    this.settingsService.on('update', this.onSettingsUpdate);
    this.settingsService.loadSettings().then(() => this.onSettingsUpdate()).catch((e) => {
      console.error('Load settings data error : ', e);
      Notify({ type: 'danger', message: '加载设置失败' });
    })
  }
  loadDatas() {
    this.noteService.load().then((v) => {
      this.noteService = getNoteService();
      this.noteService.on('update-categories', this.onUpdateCategories);
      this.noteService.on('update-notes', this.onNotesChanged);
      this.noteService.on('current-category-changed', this.onCurrentCategoryChanged);
      this.noteService.fromJson(v);
      this.onUpdateCategories();
      this.onCurrentCategoryChanged();
      this.loadNotePage();
    }).catch((e) => {
      console.error('Load notes data error : ', e);
      Notify({ type: 'danger', message: '加载数据失败' });
    })
  }
  saveDatas() {
    this.noteService.save().catch((e) => {
      console.error('Save notes data error : ', e);
    })
  }

  //** 数据

  loadNotePage() {
    if(this.currentListSortMode == 'createDate' || this.currentListSortMode == 'updateDate') {
      this.noteCurrentShow = this.noteService.getCurrentCategoryNote(<any>this.currentListSortMode);
      this.noteCurrentShowDateGrouped = this.noteService.groupNotesByDate(this.noteCurrentShow, this.currentListSortMode);
      this.noteCurrentShowDateGroup = true;
    } else {
      this.noteCurrentShowDateGroup = false;
      this.noteCurrentShow = this.noteService.getCurrentCategoryNote(<any>this.currentListSortMode);
    }
    //置顶
    this.noteCurrentShowToped = [];
    this.noteCurrentShow.forEach(element => {
      if(element.topMost)
        this.noteCurrentShowToped.push(element);
    });
  }
  onUpdateCategories() {
    this.noteCategories = this.noteService.noteCategories;
  }
  onNotesChanged() {
    this.loadNotePage();
    this.onNoteCheckChanged();
  }
  onCurrentCategoryChanged() {
    this.currentCategory = this.noteService.noteCategoryCurrent.uid;
    this.loadNotePage();
  }

  //** 添加更新按钮事件

  goEditNote(uid : string, defEdit = false) {
    this.$router.push({
      path: '/edit',
      query: {
        uid: uid,
        defEdit: defEdit ? 'true' : 'false'
      }
    })
  }
  onNoteClick(note : Note) {
    if(!this.noteItemChooseMode)
      this.goEditNote(note.uid);
  }
  onNoteLongClick(note : Note) {
    if(!this.noteItemChooseMode) { 
      this.noteItemChooseMode = true;
      this.onNoteCheckChanged();
      note.checked = true;
    }
    else {

    }
  }
  onNoteTouchstart(note : Note) {
    clearInterval(this.noteItemChooseModeTimer); 
    this.noteItemChooseModeTimer = setTimeout(() => this.onNoteLongClick(note), 700); 
  }
  onNoteTouchend(note : Note) {
    clearInterval(this.noteItemChooseModeTimer);
  }
  onNoteCheckChanged() {
    this.noteCheckedCount = 0;
    this.noteCheckedAndTopCount = 0;
    this.noteCurrentShow.forEach(element => {
      if(element.checked) {
        this.noteCheckedCount++;
        if(element.topMost) this.noteCheckedAndTopCount++;
      }
    });
  }
  onNoteCheckAll() {
    if(this.noteCheckedCount == this.noteCurrentShow.length){
      this.noteCheckedCount = 0;
      this.noteCurrentShow.forEach(element => element.checked = false);
    } else {
      this.noteCheckedCount = this.noteCurrentShow.length;
      this.noteCurrentShow.forEach(element => element.checked = true);
    }
  }

  //** 选择工具类按钮事件

  onNoteCheckedTop() {
    this.noteCurrentShow.forEach(element => {
      if(element.checked)
        element.topMost = true;
    });
    this.noteService.emitNotesUpdate();
    this.noteService.emitCategoriesUpdate();
  }
  onNoteCheckedNoTop() {
    this.noteCurrentShow.forEach(element => {
      if(element.checked)
        element.topMost = false;
    });
    this.noteService.emitNotesUpdate();
    this.noteService.emitCategoriesUpdate();
  }
  onNoteCheckedDelete() {
    Dialog.confirm({
      title: '提示',
      message: '是否要删除选择的 ' + this.noteCheckedCount + ' 个便签?\n删除不能恢复，请谨慎操作！',
      confirmButtonText: '确定删除',
      confirmButtonColor: '#f44336'
    }).then(() => {
      this.noteCurrentShow.forEach(element => {
        if(element.checked)
          this.noteService.deleteNote(element.uid, false);
      });
      this.noteService.emitNotesUpdate();
      Toast.success('已删除');
    }).catch(() => {});
  }
  onNoteCheckedMoveToFolder() {
    
  }
  onNoteCheckedToPrivate() {
    Dialog.confirm({
      title: '提示',
      message: '是否要将选择的 ' + this.noteCheckedCount + ' 个便签设为隐私?\n设置隐私后您可以在列表顶部向上拉动进入隐私收藏夹查看',
      confirmButtonText: '设为隐私',
    }).then(() => {
      
    }).catch(() => {});
  }

  //** 添加更新按钮事件

  onAddNoteClick() {
    var note = this.noteService.addNote();
    this.goEditNote(note.uid);
  }
  onAddFolderClick() {
    this.addFolder = true;
    this.editingCategoryName = '';
  }
  onAddFolderFinish() {
    if(this.editingCategoryName == '') {
      Toast('请输入收藏夹名称！');
      return;
    }
    if(this.noteService.findCategoryByName(this.editingCategoryName) != null) {
      Toast('收藏夹已经存在，请换个名字');
      return;
    }
    this.noteService.addCategory(this.editingCategoryName);
  }
  onMgrFolderClick() { this.editorFolders = true; }
  onDeleteFolderClick(uid : string) {
    Dialog.confirm({
      title: '是否要删除这个收藏夹?',
      message: '收藏夹内的便签不会被删除，稍后会将其并入“全部便签”中',
      confirmButtonColor: '#f44336'
    }).then(() => {
      this.noteService.deleteCategory(uid);
      Toast('收藏夹已删除');
    }).catch(() => {});
  }
  onEditFolderClick(uid : string) {
    this.editingCategory = this.noteService.findCategory(uid);
    this.editingFolder = true;
    this.editingCategoryName = this.editingCategory.name;
  }
  onEditFolderFinish() {
    if(this.editingCategoryName == '') {
      Toast('请输入收藏夹名称！');
      return;
    }
    if(this.editingCategoryName ==  this.editingCategory.name) {
      return;
    }
    if(this.noteService.findCategoryByName(this.editingCategoryName) != null) {
      Toast('收藏夹已经存在，请换个名字');
      return;
    }
    this.editingCategory.name = this.editingCategoryName;
  }
  onAddProjectClick() {
  }

  //** 设置事件

  onSettingsUpdate() {
    this.settingsData = this.settingsService.getData();
    this.currentListMode = this.settingsData.listMode;
    this.currentListSortMode = this.settingsData.listSortMode;
  }
  onSwitchListMode() {
    if(this.currentListMode == 'list') this.currentListMode = 'grid';
    else this.currentListMode = 'list';
  }

  //** 其他按钮事件

  onAboutClick() {

  }
  onListModeSelect(item) {
    this.currentListMode = item.mode;
    this.chooseListMode = false;
  }
  onSettingsClick() {
    this.$router.push({ path:'/settings' });
  }
  onQuitClick() {
    ipc.send('main-act-quit');
  }
}
</script>

<style lang="scss">
@import '../assets/sass/root';
@import '../assets/sass/scroll';

.note {
  background: #f5f5f5;
  min-height: 100%;

  .fab-con {
    position: absolute;
    bottom: 35px;
    right: 30px;
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: center;

    .roate-45 {
      transform: rotate(45deg);
    }
    .add {
      margin-top: 10px;
      transition: all ease-in-out 0.25s;
    }
  }
  .top-tab {
    .van-dropdown-menu {
      background-color: transparent;
    }
  }
}
.note-search {
  background-color: #f5f5f5;
  padding: 10px 15px 0 15px;

  .van-search__content {
    border-radius: 30px;
    background-color: #e0e0e0;
  }
}
.note-list {

  background: #f5f5f5;
  padding: 15px;
  position: absolute;
  left: 0;
  right: 0;
  top: 120px;
  bottom: 0;

  overflow: hidden;
  overflow-y: scroll;

  @include pc-fix-scrollbar-white();

  .center-text {
    text-align: center;
    font-size: 12px;
    color: #888;
    padding: 10px 0;
    width: 100%;
  }

  ul.note-list-inn {
    position: relative;
    list-style: none;
    padding: 15px 0;
    margin: 0;

    &:not(:first-child) {
      margin-top: 10px;
    }

    li {

      position: relative;
      display: block;
      list-style: none;
      padding: 10px 25px;
      margin: 0;

      &.month {
        color: $color-highlight;
        padding-top: 0;

        &:hover, &:focus {
          background-color: unset;
        }
        
      }
      &:hover, &:focus {
        background-color: #f5f5f5;
      }

      h5 {
        font-size: 15px;
        font-weight: bold;
        margin: 2px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      p {
        margin: 2px 0;
        font-size: 15px;
        color: #888;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .bottom-bar {
        padding-top: 8px;
        font-size: 13px;
        color: #999;
      }
      .right-bar {
        display: none;
        position: absolute;
        justify-content: center;
        align-items: center;
        right: 25px;
        top: 5px;
        bottom: 5px;
        max-width: 50px;
      }

      &[hidden] {
        display: none;
      }
    }
  }

  //列表模式
  &.list {

    ul {
      background: #fff;
      border-radius: 6px;
      border: 1px solid #eee;
    }
  }
  //宫格模式
  &.grid {

    ul {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      padding: 0;
      column-count: 2;
      column-gap: 0;

      li {
        display: inline-block;
        background: #fff;
        border-radius: 6px;
        border: 1px solid #eee;
        width: calc(50% - 5px);
        padding: 15px 20px;
        transition: transform ease-in-out 0.4s;

        &:hover {
          transform: scale(0.857);
        }

        &.month {
          display: block;
          background-color: transparent;
          border: none;
          width: 100%;
        }
      }
    }
  }

  &.lonclick {
    ul.note-list-inn  li {
      padding-right: 55px;

      .right-bar {
        display: flex;
      }
    }
  }

}
.note-none {
  position: absolute;
  z-index: 0;
  top: 60px;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;

  h5 {
    font-size: 14px;
    color: #888;
    margin: 25px 30px;
  }
  

}
.nav-left-head {

  padding: 20px 16px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;

  img {
    width: 50px;
    height: 50px;
  }
  h1 {
    font-size: 22px;
    font-weight: bold;
    color: $color-primary;
    margin: 10px 0;
  }
  span {
    background-color: $color-primary;
    padding: 2px 6px;
    border-radius: 3px;
    color: #fff;
    font-size: 12px;
  }
}
.nav-left {
  list-style: none;
  margin: 0;
  padding: 15px 0 20px 0;

  li {
    list-style: none;
    margin: 0;
    padding: 10px 16px;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      background-color: rgba(0,0,0,0.15);
      color: $color-primary;
    }
  }
}
</style>


