<template>
  <div>
    <mu-appbar style="width: 100%;" z-depth="0">
      <mu-button @click="onBackClick" icon slot="left">
        <mu-icon value="keyboard_backspace"></mu-icon>
      </mu-button>
      <span v-if="currentNote" @click="onEditTitle"> 
        <span v-if="currentNote.title == ''"><i class="text-secondary">点击可编辑标题</i></span>
        <span v-else>{{ currentNote.title }}</span>
      </span>
      <div v-if="editMode" icon slot="right">
        <mu-button @click="onNotSaveClick" icon>
          <mu-icon value="clear"></mu-icon>
        </mu-button>
        <mu-button icon @click="onSaveClick">
          <mu-icon value="done"></mu-icon>
        </mu-button>
      </div>
      <mu-button v-else @click="onEditClick" icon slot="right">
        <mu-icon value="edit"></mu-icon>
      </mu-button>
    </mu-appbar>

    <mu-divider></mu-divider>

    <div v-if="loading" class="flex-center full-height">
      <van-loading size="24px" vertical>加载中...</van-loading>
    </div>
    <div v-show="currentNote" class="w-100 full-height">
      <div v-show="editMode" class="editor" contenteditable="true" id="editor" placeholder="在这里写一些内容吧">
      </div>
      <div v-if="currentNote && currentNote.content!=''" :hidden="editMode" class="preview" v-html="currentNote.content"></div>
      <div v-else-if="currentNote" :hidden="editMode" class="flex-center flex-column full-height text-secondary">
        <img src="../assets/images/empty-doc.svg"/><br/>
        这篇便签还没有内容哦
        <mu-button class="mt-4" round color="primary" @click="onEditClick">写便签</mu-button>
      </div>
    </div>
    

    <!--编辑标题-->
    <van-dialog v-model="editTitle" title="编辑便签标题" show-cancel-button @confirm="onEditTitleFinish">
      <div class="small-text text-secondary p-3 pb-0">您可以设置便签标题，如果留空，则默认使用文档第一行作为标题</div>
      <van-field v-model="editTitleValue" placeholder="请输入便签标题" />
    </van-dialog>

    <!--操作菜单-->
    <mu-slide-bottom-transition>
      <ul class="bottom-tool-bar around" v-show="editMode">

        <li @click="showFontMenu=true"><mu-icon value="format_size"></mu-icon><span>样式</span>
        </li>
        <li><mu-icon value="image"></mu-icon><span>图片</span>
        </li>
        <li><mu-icon value="check_box"></mu-icon><span>目标</span>
        </li>
        <li><mu-icon value="color_lens"></mu-icon><span>皮肤</span>
        </li>
        <li @click="onEmptyClick"><mu-icon value="delete"></mu-icon><span>清空</span>
        </li>
      </ul>
    </mu-slide-bottom-transition>

    <!--样式菜单-->
    <mu-slide-bottom-transition>
      <div v-if="editMode" class="bottom-tool-bar bar canclose" v-show="showFontMenu">

        <mu-button class="close" @click="showFontMenu=false" icon>
          <mu-icon value="close"></mu-icon>
        </mu-button>

        <div class="bar tool-btn small">
          <button :class="showFontMenuCurrentPage=='font'?'active':''" @click="showFontMenuCurrentPage='font'">
            <mu-icon value="format_size"></mu-icon>字体
          </button>
          <button :class="showFontMenuCurrentPage=='paragraph'?'active':''" @click="showFontMenuCurrentPage='paragraph'">
            <mu-icon value="format_align_center"></mu-icon>段落
          </button>
          <button :class="showFontMenuCurrentPage=='attribute'?'active':''" @click="showFontMenuCurrentPage='attribute'">
            <mu-icon value="format_shapes"></mu-icon>属性
          </button>
          <button @click="onEditorFormat('clear')">
            <mu-icon class="mr-2" value="format_clear"></mu-icon>清空样式
          </button>
        </div>

        <!--字体菜单-->
        <div v-show="showFontMenuCurrentPage=='font'" class="bar tool-btn">
          <button @click="onEditorFormat('bold')">
            <mu-icon value="format_bold"></mu-icon>
          </button>
          <button @click="onEditorFormat('italic')">
            <mu-icon value="format_italic"></mu-icon>
          </button>
          <button @click="onEditorFormat('underlined')">
            <mu-icon value="format_underlined"></mu-icon>
          </button>
          <button @click="onEditorFormat('strikethrough')">
            <mu-icon value="format_strikethrough"></mu-icon>
          </button>
          <button @click="onEditorFormat('subscript')">
            <i class="iconfont icon-xiabiao" style="font-size: 20px;"></i>
          </button>
          <button @click="onEditorFormat('superscript')">
            <i class="iconfont icon-shangbiao" style="font-size: 20px;"></i>
          </button>
        </div>
        <div v-show="showFontMenuCurrentPage=='font'" class="bar tool-btn">
          <div class="tool-btn">
            <!--字体大小菜单-->
            <mu-menu cover placement="top-start">
              <button class="no-right-radius">
                <mu-icon class="mr-2" value="format_size"></mu-icon> {{currentSelectFontSize}}字号
              </button>
              <mu-list slot="content">
                <mu-list-item @click="onEditorFormat('fontsize', s.value)" button v-for="(s, i) in fontSizes" :key="i">
                  <mu-list-item-title>{{ s.text }}</mu-list-item-title>
                </mu-list-item>
              </mu-list>
            </mu-menu>
            <!--字体菜单-->
            <mu-menu cover placement="top-start">
              <button class="no-border-left no-left-radius">
                <mu-icon class="mr-2" value="font_download"></mu-icon> {{currentSelectFont}}
              </button>
              <mu-list slot="content">
                <mu-list-item @click="onEditorFormat('font', s.value)" button v-for="(s, i) in fontNames" :key="i">
                  <mu-list-item-title>{{ s.text }}</mu-list-item-title>
                </mu-list-item>
              </mu-list>
            </mu-menu>
          </div>
          <div class="tool-btn ml-2">
            <button>
              <mu-icon class="mr-2" value="format_color_text"></mu-icon>文字颜色
            </button>
            <button>
              <mu-icon class="mr-2" value="format_color_fill"></mu-icon>背景色
            </button>
          </div>
        </div>

        <!--段落菜单-->
        <div v-show="showFontMenuCurrentPage=='paragraph'" class="bar tool-btn">
          <div class="tool-btn">
            <button @click="onEditorFormat('align', 'justify')">
              <mu-icon class="mr-2" value="format_align_justify"></mu-icon>对齐
            </button>
            <button @click="onEditorFormat('align', 'left')">
              <mu-icon value="format_align_left"></mu-icon>
            </button>
            <button @click="onEditorFormat('align', 'center')">
              <mu-icon value="format_align_center"></mu-icon>
            </button>
            <button @click="onEditorFormat('align', 'right')">
              <mu-icon value="format_align_right"></mu-icon>
            </button>
          </div>
          <div class="tool-btn ml-3">
            <button @click="onEditorFormat('ul')">
              <mu-icon value="format_list_bulleted"></mu-icon>
            </button>
            <button @click="onEditorFormat('ol')">
              <mu-icon value="format_list_numbered"></mu-icon>
            </button>
          </div>
        </div>

        <!--属性菜单-->
        <div v-show="showFontMenuCurrentPage=='attribute'" class="bar tool-btn">

        </div>
        <div class="bar tool-btn">

        </div>

      </div>
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
import { Dialog } from "vant";
import $ from "jquery";
import { Note } from "../model/Note";
import { NoteService, getNoteService } from "../service/NoteService";
import { KeyboardEvent } from "electron";

export type EditorFormatType = 'header'|'clear'|'bold'|'italic'|'underlined'|
  'strikethrough'|'ol'|'ul'|'align'|'fontsize'|'font'|'subscript'|'superscript';

@Component
export default class Editor extends Vue {
  name = "Editor";

  editMode = false;
  noteService : NoteService = null;
  currentNote : Note = null;
  editor : HTMLDivElement = null;

  showFontMenu = false;
  showFontMenuCurrentPage = 'font';

  loading = true;
  editTitle = false;
  editTitleValue = '';

  fontSizes = [
    { text: '最大', value: 7 },
    { text: '巨大', value: 6 },
    { text: '大', value: 5 },
    { text: '中', value: 4 },
    { text: '默认', value: 3 },
    { text: '小', value: 2 },
    { text: '最小', value: 1 },
  ];
  fontNames = [
    { text: '默认', value: '' },
    { text: '微软雅黑', value: '微软雅黑' },
    { text: '宋体', value: '宋体' },
    { text: '黑体', value: '黑体' },
    { text: '仿宋', value: '仿宋' },
    { text: '楷体', value: '楷体' },
    { text: '隶书', value: '隶书' },
    { text: '幼圆', value: '幼圆' },
    { text: 'Arial', value: 'Arial' },
    { text: 'Arial Black', value: 'Arial Black' },
    { text: 'Comic Sans MS', value: 'Comic Sans MS' },
    { text: 'Georgia', value: 'Georgia' },
    { text: 'Impact', value: 'Impact' },
    { text: 'Tahoma', value: 'Tahoma' },
    { text: 'Terminal', value: 'Terminal' },
    { text: 'Verdana', value: 'Verdana' },
    { text: 'Webdings', value: 'Webdings' },
    { text: 'Wingdings', value: 'Wingdings' },
  ];


  currentSelectFont = '默认';
  currentSelectFontSize = '默认';

  mounted() {
    this.noteService = getNoteService();
    this.loading = true;
    setTimeout(() => {
      this.initEditor();
      this.load();
    }, 600);
  }
  beforeDestroy() {
    this.uninitEditor();
  }

  load() {
    if(typeof this.$route.query.uid === 'string')
      this.currentNote = this.noteService.findNote(this.$route.query.uid);
    if(this.currentNote == null) {
      Dialog.alert({
        title: '读取失败',
      }).then(() => {
        this.$router.push('/')
      }).catch(() => this.$router.push('/'));
      return;
    }

    this.setEditorContent(this.currentNote.content);
    this.loading = false;
  }
  save() {
    this.currentNote.content = this.getEditorContent();
    this.noteService.save();
  }

  // Editor

  getEditorContent() {
    return this.editor.innerHTML;
  }
  setEditorContent(str : string) {

    if(str != '') {
      var index = 0;
      var strRp = str;
      var strBinded = '';
      if(strRp.indexOf('\n') > -1) {
        while(strRp.indexOf('\n') > -1) {
          index = strRp.indexOf('\n');
          strBinded += '<div>' + strRp.substring(0, index) + '</div>';
          strRp = strRp.substring(index + 1);
        }
      }else strBinded = strRp;
      this.editor.innerHTML = strBinded;
    }else this.editor.innerHTML = '';
  }
  initEditor() {
    this.editor = <HTMLDivElement>document.getElementById('editor');
    this.editor.addEventListener('keydown', this.onEditorKeyDown);
    
    document.execCommand('styleWithCSS', false, 'true');
    document.addEventListener('select', this.onEditorSelectionChanged);
  }
  uninitEditor() {
    this.editor.removeEventListener('keydown', this.onEditorKeyDown);
    

    document.removeEventListener('select', this.onEditorSelectionChanged);
  }


  onEditorKeyDown(ev : KeyboardEvent) {

  }
  onEditorSelectionChanged(ev : UIEvent) {

  }
  onEditorFormat(type : EditorFormatType, entend : any) {
    switch(type) {
      case 'header': {
        var hType = 'h' + entend;
        if ($(window.getSelection().anchorNode.parentNode).is(hType))
          document.execCommand('formatBlock', false, '<p>');
        else 
          document.execCommand('formatBlock', false, '<' + hType + '>');
        break;
      }
      case 'font': {
        document.execCommand('fontName', false, entend);
        break;
      }
      case 'fontsize': {
        document.execCommand('fontSize', false, (<number>entend).toString());
        break;
      }
      case 'bold': {
        document.execCommand('bold', false);
        break;
      }
      case 'italic': {
        document.execCommand('italic', false);
        break;
      }
      case 'subscript': {
        document.execCommand('subscript', false);
        break;
      }
      case 'superscript': {
        document.execCommand('superscript', false);
        break;
      }
      case 'underlined': {
        document.execCommand('underline', false);
        break;
      }
      case 'strikethrough': {
        document.execCommand('strikethrough', false);
        break;
      }
      case 'ol': {
        document.execCommand('insertUnorderedList', false);
        break;
      }
      case 'ul': {
        document.execCommand('insertOrderedList', false);
        break;
      }
      case 'align': {
        switch(entend) {
          case 'justify': document.execCommand('justifyFull'); break;
          case 'center': document.execCommand('justifyCenter'); break;
          case 'left': document.execCommand('justifyLeft'); break;
          case 'right': document.execCommand('justifyRight'); break;
        }
        break;
      }
      case 'clear': {
        document.execCommand('removeFormat', false);
        break;
      }
    }
  }


  // Butn Events
 
  onEditTitle() {
    this.editTitle = true;
    this.editTitleValue = this.currentNote.titleSetted;
  }
  onEditTitleFinish() {
    this.editTitle = false;
    this.currentNote.titleSetted = this.editTitleValue;
    this.save();
  }
  onBackClick() {
    if(this.editMode) {
      Dialog.confirm({
        title: '离开之前希望保存修改吗?',
        message: '如果不保存那么您刚才所作的修改将会被丢弃',
        confirmButtonText: '保存',
        cancelButtonText: '不保存',
      }).then(() => {
        this.editMode = false;
        this.save();
        this.$router.push('/')
      }).catch(() => this.$router.push('/'));
    } else this.$router.push('/');
  }
  onSaveClick() {
    this.editMode = false;
    this.save();
  }
  onNotSaveClick() {
    Dialog.confirm({
      title: '您真的不想保存修改吗?',
      message: '您刚才所作的修改将会被丢弃',
      confirmButtonColor: '#f44336',
      confirmButtonText: '确定不保存',
      cancelButtonText: '取消',
    }).then(() => {
      this.editMode = false;
      this.load();
    }).catch(() => {});
  }
  onEmptyClick() {
    Dialog.confirm({
      title: '您真要清空内容吗?',
      confirmButtonColor: '#f44336',
      confirmButtonText: '清空',
    }).then(() => {
      this.setEditorContent('');
      this.save();
    }).catch(() => {});
  }
  onEditClick() {
    this.editMode = true;
  }
}
</script>


<style lang="scss">
.preview {
  position: relative;
  padding: 25px;
  white-space: pre-wrap;
  font-size: 16px;
}
.full-height {
  height: calc(100% - 60px);
}
.editor {
  width: 100%;
  top: 60px;
  position: absolute;
  bottom: 80px;
  border: none;
  padding: 25px;
  white-space: pre-wrap;
  font-size: 16px;

  &:focus {
    outline: none;
  }
}
</style>

