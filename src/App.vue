<template>
  <router-view></router-view>
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

import "./utils/base-extends";
import $ from "jquery";
import electron from "electron";
import { Dialog } from 'quasar'

const ipc = electron.ipcRenderer;


@Component({

})
export default class App extends Vue {
  name = "App";

  mounted() {
    this.init();
  }
  beforeDestroy() {
    this.uninit();
  }


  //** Init styles
  init() {
    this.initIpcs();
    setTimeout(() => {
      this.hideIntro();
    }, 2000);
  }
  initIpcs() {
    ipc.on('show-exit-dialog', () => {
      this.$q.dialog({
        title: '退出确认',
        message: '你是否真的要退出软件？',
        ok: '确定',
        cancel: '取消',
      }).onOk(() => {
        ipc.send('main-act-quit');
      });
    })
  }
  uninit() {

  }
  hideIntro() {
    $("#intro").prop("class", "intro hidding");
    setTimeout(function() {
      $("#intro").prop("class", "intro hidden");
    }, 1000);
  }
 

  //** 应用工作函数

  quit() {
    ipc.send('main-act-quit');
  }
  emptyAction() {}
}

</script>

<style scoped>
#app  {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

