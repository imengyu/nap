<template>
  <div>
    <mu-appbar style="width: 100%;" z-depth="0">
      <mu-button @click="onBackClick" icon slot="left">
        <mu-icon value="keyboard_backspace"></mu-icon>
      </mu-button>
      设置
      <mu-button @click="onResetClick" icon slot="right">
        <mu-icon value="replay"></mu-icon>
      </mu-button>
    </mu-appbar>

    <mu-divider></mu-divider>

    <mu-list>
      <mu-sub-header>通用设置</mu-sub-header>

      <mu-list-item button :ripple="false" @click="chooseListMode=true">
        <mu-list-item-title>
          列表模式
        </mu-list-item-title>
        <mu-list-item-sub-title>
          <span v-if="currentListMode">{{ currentListMode.name }}</span>
        </mu-list-item-sub-title>
      </mu-list-item>

      <mu-list-item button :ripple="false" @click="chooseListSortMode=true">
        <mu-list-item-title>
          排序模式
        </mu-list-item-title>
        <mu-list-item-sub-title>
          <span v-if="currentListSortMode">{{ currentListSortMode.name }}</span>
        </mu-list-item-sub-title>
      </mu-list-item>

    </mu-list>
    <mu-divider></mu-divider>
    <mu-list v-if="settingsData" textline="three-line">
      <mu-sub-header>编辑设置</mu-sub-header>
      <mu-list-item button :ripple="false" @click="settingsData.insertImageBase64=!settingsData.insertImageBase64">
        <mu-list-item-content>
          <mu-list-item-title>插入图片至文档内容中</mu-list-item-title>
          <mu-list-item-sub-title>开启此选项可将图片插入至文档内容中，原图片丢失后文档中图片依然可以显示</mu-list-item-sub-title>
        </mu-list-item-content>
        <mu-list-item-action>
          <mu-switch v-model="settingsData.insertImageBase64"></mu-switch>
        </mu-list-item-action>
      </mu-list-item>
    </mu-list>

    <!--选择列表显示模式-->
    <van-action-sheet
      v-model="chooseListMode"
      :actions="actionListMode"
      @select="onListModeSelect"
      cancel-text="取消"
      description="选择列表显示模式"
    />
    <!--选择列表排序模式-->
    <van-action-sheet
      v-model="chooseListSortMode"
      @select="onListSortModeSelect"
      :actions="actionListSortMode"
      cancel-text="取消"
      description="选择列表排序模式"
    />
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

import { getNoteService, createNoteService } from "../service/NoteService";
import { getDataStorageService, createDataStorageService } from "../service/DataStorageService";
import { getSettingsService, createSettingsService, SettingsService } from "../service/SettingsService";

import { Dialog, Toast } from 'vant';
import { Notify } from 'vant';
import { settingsDef, SettingsData } from "../config/SettingsConst";

@Component
export default class Settings extends Vue {
  name = "Settings";

  chooseListMode = false;
  chooseListSortMode = false;

  actionListSortMode = [ 
    { name: '按创建日期排序', mode: 'createDate' }, 
    { name: '按最近修改日期排序', mode: 'updateDate' },
    { name: '按名称排序', mode: 'name' },
  ];
  actionListMode = [ 
    { name: '宫格模式', mode: 'grid' }, 
    { name: '列表模式', mode: 'list' } 
  ];

  currentListSortMode = null;
  currentListMode = null;

  settingsService : SettingsService;
  settingsData : SettingsData = null;

  mounted() {
    this.settingsService = getSettingsService();
    this.settingsService.on('update', this.onSettingsUpdate);
    this.settingsService.loadSettings().then(() => this.onSettingsUpdate()).catch((e) => {
      Dialog.alert({
        title: '错误',
        message: '加载设置失败！' + e
      });
    });
  }
  beforeDestroy() {
    this.settingsService.off('update', this.onSettingsUpdate);
    this.settingsService.saveSettings().then(() => {
      this.settingsService.sendUpdated();
    }).catch((e) => {
      Toast.fail('保存设置失败！' + e);
    })
  }

  onSettingsUpdate() {
    this.settingsData = this.settingsService.getData();
    this.actionListSortMode.forEach(element => {
      if(element.mode == this.settingsData.listSortMode)
        this.currentListSortMode = element;
    });
    this.actionListMode.forEach(element => {
      if(element.mode == this.settingsData.listMode)
        this.currentListMode = element;
    });
  }
  onListSortModeSelect(item) {
    this.settingsData.listMode = item.mode;
    this.chooseListMode = false;
    this.currentListMode = item;
  }
  onListModeSelect(item) {
    this.settingsData.listSortMode = item.mode;
    this.currentListSortMode = item;
    this.currentListSortMode = false;
  }
  onBackClick() {
    this.$router.push('/');
  }
  onResetClick() {
    Dialog.confirm({
      title: '是否希望恢复默认设置?',
    }).then(() => {
      this.settingsService.resetDefault();
      Toast('已恢复默认设置');
    }).catch(() => {});
  }
}
</script>

