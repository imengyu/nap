<template>
  <div class="no-select">
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
    <div v-show="currentNote" class="w-100 full-height position-relative">
      <div v-if="editMode&&currentNote.content==''&&editorLostFocus" @click="editor.focus()" class="editor-placeholder">
        在这里写一些内容吧
      </div>
      <div 
        @blur="editorLostFocus=true"
        @focus="editorLostFocus=false"
        @select="onEditorSelectionChanged"
        :readonly="editMode" class="editor" 
        :contenteditable="editMode" id="editor"
        :style="'bottom:'+bottomToolHeight+'px'">
      </div>
    </div>
    

    <!--编辑标题-->
    <van-dialog v-model="editTitle" title="编辑便签标题" show-cancel-button @confirm="onEditTitleFinish">
      <div class="small-text text-secondary p-3 pb-0">您可以设置便签标题，如果留空，则默认使用文档第一行作为标题</div>
      <van-field v-model="editTitleValue" placeholder="请输入便签标题" />
    </van-dialog>

    <!--操作菜单-->
    <mu-slide-bottom-transition>
      <ul id="bottom-tool" class="bottom-tool-bar around" v-show="editMode">

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
      <div v-if="editMode" id="bottom-tool-style" class="bottom-tool-bar bar canclose" v-show="showFontMenu">

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
          <button @click="onEditorFormat('bold')" :class="selectIsBold?'active':''">
            <mu-icon value="format_bold"></mu-icon>
          </button>
          <button @click="onEditorFormat('italic')" :class="selectIsItalic ?'active':''">
            <mu-icon value="format_italic"></mu-icon>
          </button>
          <button @click="onEditorFormat('underlined')" :class="selectIsUnderlined ?'active':''">
            <mu-icon value="format_underlined"></mu-icon>
          </button>
          <button @click="onEditorFormat('strikethrough')" :class="selectIsStrikethrough ?'active':''">
            <mu-icon value="format_strikethrough"></mu-icon>
          </button>
          <button @click="onEditorFormat('subscript')" :class="selectIsSubscript ?'active':''">
            <i class="iconfont icon-xiabiao" style="font-size: 20px;"></i>
          </button>
          <button @click="onEditorFormat('superscript')" :class="selectIsSuperscript ?'active':''">
            <i class="iconfont icon-shangbiao" style="font-size: 20px;"></i>
          </button>
        </div>
        <div v-show="showFontMenuCurrentPage=='font'" class="bar tool-btn">
          <div class="tool-btn">
            <!--字体大小菜单-->
            <mu-menu cover placement="top-start">
              <button class="no-right-radius">
                <mu-icon class="mr-2" value="format_size"></mu-icon> {{selectTextFontSize}}字号
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
                <mu-icon class="mr-2" value="font_download"></mu-icon> {{selectTextFontName}}
              </button>
              <mu-list slot="content">
                <mu-list-item @click="onEditorFormat('font', s.value)" button v-for="(s, i) in fontNames" :key="i">
                  <mu-list-item-title>{{ s.text }}</mu-list-item-title>
                </mu-list-item>
              </mu-list>
            </mu-menu>
          </div>
          <div class="tool-btn ml-2">
            <button @click="showColorMenu=true;currentSetForeground=true">
              <mu-icon value="format_color_text"></mu-icon>
              <span :class="'format_color'+(getColorIsWhite(selectTextCurrentColor)?' color_border':'')" 
              :style="'background-color:'+selectTextCurrentColor"></span>
            </button>
            <button @click="showColorMenu=true;currentSetForeground=false">
              <mu-icon value="format_color_fill"></mu-icon>
              <span :class="'format_color'+(getColorIsWhite(selectTextCurrentBackColor)?' color_border':'')" 
              :style="'background-color:'+selectTextCurrentBackColor"></span>
            </button>
          </div>
        </div>

        <!--段落菜单-->
        <div v-show="showFontMenuCurrentPage=='paragraph'" class="bar tool-btn">
          <div class="tool-btn">
            <button @click="onEditorFormat('align', 'justify')" :class="selectTextAlignIsJustify ?'active':''">
              <mu-icon class="mr-2" value="format_align_justify"></mu-icon>对齐
            </button>
            <button @click="onEditorFormat('align', 'left')" :class="selectTextAlignIsLeft ?'active':''">
              <mu-icon value="format_align_left"></mu-icon>
            </button>
            <button @click="onEditorFormat('align', 'center')" :class="selectTextAlignIsCenter ?'active':''">
              <mu-icon value="format_align_center"></mu-icon>
            </button>
            <button @click="onEditorFormat('align', 'right')" :class="selectTextAlignIsRight ?'active':''">
              <mu-icon value="format_align_right"></mu-icon>
            </button>
          </div>
          <div class="tool-btn ml-3">
            <button @click="onEditorFormat('ul')" :class="selectIsUl ?'active':''">
              <mu-icon value="format_list_bulleted"></mu-icon>
            </button>
            <button @click="onEditorFormat('ol')" :class="selectIsOl ?'active':''">
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

    <!--颜色菜单-->
    <mu-slide-bottom-transition>
      <div id="bottom-tool-color" v-if="editMode" class="bottom-tool-bar bar canclose" v-show="showColorMenu">
        <mu-button class="close" @click="showColorMenu=false" icon>
          <mu-icon value="keyboard_arrow_down"></mu-icon>
        </mu-button>

        <div class="tool-bar-title">设置{{ currentSetForeground ? '文字颜色' : '文字背景色' }}</div>

        <ul class="color-boxs">
          <li v-for="(color,i) in colorSelects" :key="i" @click="onEditorFormatColor(color.color)"
            :class="((color.color == selectTextCurrentBackColor && !currentSetForeground) 
            || (color.color == selectTextCurrentColor && currentSetForeground)) ? 'active' : ''"
            :style="'border-color:'+(color.border?'#000':color.color)">
            <div :style="'background-color:'+color.color+';color:'+color.textColor+
              (color.border?';border:1px solid #000':'')">
              {{ color.text }}
            </div>
          </li>
        </ul>
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
import { KeyboardEvent, Event } from "electron";
import CommonUtils from "../utils/CommonUtils";

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
  showColorMenu = false;
  currentSetForeground = true;
  editorLostFocus = true;
  bottomToolHeight = 0;

  reCalcBottomToolHeight() {
    if(this.editMode) {   
      if(this.showColorMenu) this.bottomToolHeight = $('#bottom-tool-color').outerHeight();
      else if(this.showFontMenu) this.bottomToolHeight =  $('#bottom-tool-style').outerHeight();
      else this.bottomToolHeight =  $('#bottom-tool').outerHeight();
    } else this.bottomToolHeight = 0;
  }
  getColorIsWhite(color : string) {
    for (let index = 0; index < this.colorSelects.length; index++) {
      const element = this.colorSelects[index];
      if(element.color == color) {
        return element.textColor == 'black';
      }
    }
    return false;
  }

  @Watch('showColorMenu') 
  onshowColorMenuChanged() { this.reCalcBottomToolHeight(); }
  @Watch('showFontMenu') 
  onshowFontMenuChanged() { this.reCalcBottomToolHeight(); }
  @Watch('showFontMenuCurrentPage') 
  onshowFontMenuCurrentPageChanged() { this.reCalcBottomToolHeight(); }

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
  colorSelects = [
    { color: 'rgb(244, 67, 54)', text: '红色', textColor: 'white' },
    { color: 'rgb(233, 30, 99)', text: '粉色', textColor: 'white' },
    { color: 'rgb(156, 39, 176)', text: '紫色', textColor: 'white' },
    { color: 'rgb(103, 58, 183)', text: '深紫', textColor: 'white' },
    { color: 'rgb(63, 81, 181)', text: '靛蓝', textColor: 'white' },
    { color: 'rgb(33, 150, 243)', text: '蓝色', textColor: 'white' },
    { color: 'rgb(3, 169, 244)', text: '浅蓝', textColor: 'white' },
    { color: 'rgb(0, 188, 212)', text: '青色', textColor: 'white' },
    { color: 'rgb(0, 150, 136)', text: '蓝绿', textColor: 'white' },
    { color: 'rgb(76, 175, 80)', text: '绿色', textColor: 'white' },
    { color: 'rgb(139, 195, 74)', text: '浅绿', textColor: 'white' },
    { color: 'rgb(205, 220, 57)', text: '浅黄', textColor: 'black' },
    { color: 'rgb(255, 235, 59)', text: '黄色', textColor: 'black' },
    { color: 'rgb(255, 193, 7)', text: '黄褐', textColor: 'black' },
    { color: 'rgb(255, 152, 0)', text: '橙色', textColor: 'white' },
    { color: 'rgb(255, 87, 34)', text: '深橙', textColor: 'white' },
    { color: 'rgb(121, 85, 72)', text: '棕色', textColor: 'white' },
    { color: 'rgb(96, 125, 139)', text: '蓝灰', textColor: 'white' },
    { color: 'rgb(204, 204, 204)', text: '浅灰', textColor: 'black' },
    { color: 'rgb(136, 136, 136)', text: '灰色', textColor: 'black' },
    { color: 'rgb(51, 51, 51)', text: '深灰', textColor: 'white' },
    { color: 'rgb(0, 0, 0)', text: '黑色', textColor: 'white' },
    { color: 'rgb(255, 255, 255)', text: '白色', border: true, textColor: 'black' },
    { color: 'transparent', text: '透明', border: true, textColor: 'black' },
  ];

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
    this.editor.innerHTML = this.preSolveEditorContent(str);
  }
  preSolveEditorContent(str : string) {
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

    return strBinded;
  }
  initEditor() {
    this.editor = <HTMLDivElement>document.getElementById('editor');
    document.execCommand('styleWithCSS', false, 'true');
    document.addEventListener('selectionchange', this.onEditorSelectionChanged);
  }
  uninitEditor() {
    document.removeEventListener('selectionchange', this.onEditorSelectionChanged);
  }


  selectIsBold = false;
  selectIsItalic = false;
  selectIsSubscript = false;
  selectIsSuperscript = false;
  selectIsUnderlined = false;
  selectIsStrikethrough = false;

  selectIsOl = false;
  selectIsUl = false;

  selectTextAlignIsJustify = false;
  selectTextAlignIsCenter = false;
  selectTextAlignIsLeft = false;
  selectTextAlignIsRight = false;

  selectTextCurrentColor = '';
  selectTextCurrentBackColor = '';

  selectTextFontSize = '';
  selectTextFontName = '';

  currentSelect : Selection;

  loadCurrentSelectStyle() {
    var selectParentNode = <HTMLElement>this.currentSelect.anchorNode.parentNode;
    var $selectParentNode = $(selectParentNode);


    this.selectIsBold = ($selectParentNode.is('b') || selectParentNode.style.fontWeight.contains('bold'));
    this.selectIsItalic = ($selectParentNode.is('i') || $selectParentNode.css('font-style').contains('italic'));
    this.selectIsSubscript = $selectParentNode.is('sub');
    this.selectIsSuperscript = $selectParentNode.is('sup');
    this.selectIsUnderlined = ($selectParentNode.is('u') || $selectParentNode.css('text-decoration-line').contains('underline'));
    this.selectIsStrikethrough = ($selectParentNode.is('del') || $selectParentNode.is('s') || $selectParentNode.css('text-decoration-line').contains('line-through'));

    this.selectTextAlignIsJustify = $selectParentNode.css('text-align') == 'justify';
    this.selectTextAlignIsCenter = $selectParentNode.css('text-align') == 'center';
    this.selectTextAlignIsLeft = $selectParentNode.css('text-align') == 'left';
    this.selectTextAlignIsRight = $selectParentNode.css('text-align') == 'right';

    this.selectTextCurrentColor = $selectParentNode.css('color');
    if(CommonUtils.isNullOrEmpty(this.selectTextCurrentColor)) this.selectTextCurrentColor = 'rgb(0, 0, 0)';

    this.selectTextCurrentBackColor = $selectParentNode.css('background-color');
    if(CommonUtils.isNullOrEmpty(this.selectTextCurrentBackColor)) this.selectTextCurrentBackColor = 'transparent';

    var fontSize = selectParentNode.style.fontSize;
    switch(fontSize) {
      case 'xx-large': this.selectTextFontSize = '最大'; break;
      case 'x-large': this.selectTextFontSize = '巨大'; break;
      case 'large': this.selectTextFontSize = '大'; break;
      case 'medium': this.selectTextFontSize = '中'; break;
      case 'small': this.selectTextFontSize = '默认字号'; break;
      case 'x-small': this.selectTextFontSize = '小'; break;
      case 'xx-small': this.selectTextFontSize = '最小'; break;
      default: this.selectTextFontSize = '默认'; break;
    }

    this.selectTextFontName = selectParentNode.style.fontFamily;
    if(CommonUtils.isNullOrEmpty(this.selectTextFontName)) this.selectTextFontName = '默认';

    this.selectIsOl = ($selectParentNode.is('li') && $selectParentNode.parent().is('ol')
      || $selectParentNode.parent().is('li') && $selectParentNode.parent().parent().is('ol'));
    this.selectIsUl = ($selectParentNode.parent().is('li') && $selectParentNode.parent().parent().is('ul')
      || $selectParentNode.is('li') && $selectParentNode.parent().is('ul'));
  }

  onEditorSelectionChanged(ev : UIEvent) {
    this.currentSelect = window.getSelection();
    if(this.editMode) this.loadCurrentSelectStyle();
  }
  onEditorFormatColor(color : string) {
    if(this.editMode) {
      if(this.currentSetForeground) document.execCommand('foreColor', false, color);
      else document.execCommand('backColor', false, color);
      this.loadCurrentSelectStyle();
    }
  }
  onEditorFormat(type : EditorFormatType, entend : any) {
    if(this.editMode) {
      var selectParentNode = $(this.currentSelect.anchorNode.parentNode);
      switch(type) {
        case 'header': {
          var hType = 'h' + entend;
          if (selectParentNode.is(hType))
            document.execCommand('formatBlock', false, '<div>');
          else 
            document.execCommand('formatBlock', false, '<' + hType + '>');
          break;
        }
        case 'font': {
          if(entend == '默认') document.execCommand('fontName', false, '');
          else document.execCommand('fontName', false, entend);
          break;
        }
        case 'fontsize': {
          document.execCommand('fontSize', false, (<number>entend).toString());
          break;
        }
        case 'bold': {
          document.execCommand('bold', false, this.selectIsBold ? 'false' : 'true');
          break;
        }
        case 'italic': {
          document.execCommand('italic', false, this.selectIsItalic ? 'false' : 'true');
          break;
        }
        case 'subscript': {
          document.execCommand('subscript', false, this.selectIsSubscript ? 'false' : 'true');
          break;
        }
        case 'superscript': {
          document.execCommand('superscript', false, this.selectIsSuperscript ? 'false' : 'true');
          break;
        }
        case 'underlined': {
          document.execCommand('underline', false, this.selectIsUnderlined ? 'false' : 'true');
          break;
        }
        case 'strikethrough': {
          document.execCommand('strikethrough', false, this.selectIsStrikethrough ? 'false' : 'true');
          break;
        }
        case 'ol': {
          document.execCommand('insertOrderedList', false, this.selectIsOl ? 'false' : 'true');
          break;
        }
        case 'ul': {
          document.execCommand('insertUnorderedList', false, this.selectIsUl ? 'false' : 'true');
          break;
        }
        case 'align': {
          switch(entend) {
            case 'justify': 
              document.execCommand('justifyFull', false, this.selectTextAlignIsJustify ? 'false' : 'true'); break;
            case 'center': 
              document.execCommand('justifyCenter', false, this.selectTextAlignIsCenter ? 'false' : 'true'); break;
            case 'left': 
              document.execCommand('justifyLeft', false, this.selectTextAlignIsLeft ? 'false' : 'true'); break;
            case 'right': 
              document.execCommand('justifyRight', false, this.selectTextAlignIsRight ? 'false' : 'true'); break;
          }
          break;
        }
        case 'clear': {
          document.execCommand('removeFormat', false);
          break;
        }
      }
      this.loadCurrentSelectStyle();
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
@import '../assets/sass/scroll';

.preview {
  position: relative;
  padding: 25px;
  font-size: 16px;
}
.full-height {
  height: calc(100% - 60px);
}
.editor-placeholder {
  position: absolute;
  left: 25px;
  top: 25px;
  font-size: 16px;
  color: #888;
}
.editor {
  width: 100%;
  top: 0;
  position: absolute;
  bottom: 80px;
  border: none;
  padding: 25px;
  font-size: 16px;
  user-select: text;

  overflow: hidden;
  overflow-y: scroll;

  @include pc-fix-scrollbar-white();

  &:focus {
    outline: none;
  }

  ol, ul {
    margin: unset;
    padding: unset;
    list-style-position: inside;
    list-style-type: circle;
  }
  ol {
    list-style-type: decimal;
  }
}
</style>

