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
        <mu-button icon @click="onSaveClick">
          <mu-icon value="done"></mu-icon>
        </mu-button>
        <mu-button @click="onNotSaveClick" icon>
          <mu-icon value="clear"></mu-icon>
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
      <textarea v-show="editMode" class="editor" contenteditable="true" id="editor" placeholder="在这里写一些内容吧">
      </textarea>
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
      <ul class="bottom-tool-bar around" v-show="editMode" :disabled="noteCheckedCount==0">

        <li><mu-icon value="format_size"></mu-icon><span>样式</span>
        </li>
        <li><mu-icon value="image"></mu-icon><span>图片</span>
        </li>
        <li><mu-icon value="check_box"></mu-icon><span>目标</span>
        </li>
        <li><mu-icon value="color_lens"></mu-icon><span>皮肤</span>
        </li>
        <li><mu-icon value="delete"></mu-icon><span>清空</span>
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
import { Dialog } from "vant";
import { Note } from "../model/Note";
import { NoteService, getNoteService } from "../service/NoteService";

@Component
export default class Editor extends Vue {
  name = "Editor";

  editMode = false;
  noteService : NoteService = null;
  currentNote : Note = null;
  editor : HTMLTextAreaElement = null;
  showFontMenu = false;

  loading = true;
  editTitle = false;
  editTitleValue = '';

  mounted() {
    this.noteService = getNoteService();
    this.loading = true;
    setTimeout(() => {
      this.editor = <HTMLTextAreaElement>document.getElementById('editor');
      this.load();
    }, 600);
  }
  beforeDestroy() {

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
    }

    this.editor.innerHTML = this.currentNote.content;
    this.loading = false;
  }
  save() {
    this.currentNote.content = this.editor.value;
    this.noteService.save();
  }
 
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
      confirmButtonText: '保存',
      cancelButtonText: '不保存',
    }).then(() => {
      this.editMode = false;
      this.load();
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
}
</style>

