<template>
    <q-layout>

      <q-layout-header>
        <q-toolbar color="primary">
          <q-btn flat round dense icon="menu" @click="leftSide = !leftSide" />
          <q-toolbar-title>NAP</q-toolbar-title>
        </q-toolbar>
      </q-layout-header>

      <q-page-container>
        <q-page>
          
        </q-page>
      </q-page-container>
    </q-layout>
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

const ipc = electron.ipcRenderer;

@Component({})
export default class Index extends Vue {
  name = "Index";

  mounted() {
    this.init();
  }
  beforeDestroy() {
    this.uninit();
  }

  //** Init styles
  init() {}
  uninit() {}
}
</script>


