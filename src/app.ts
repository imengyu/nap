
//import css

import 'animate.css/animate.css'
import 'vant/lib/index.css';
import 'muse-ui/dist/muse-ui.css';

import "./assets/css/font-awesome.min.css"
import "./assets/fonts/iconfont.css"
import "./assets/fonts/material-icons.css"
import "./assets/sass/main.scss";

//import scripts

import Vue from 'vue'

import jQuery from "jquery";
import App from './App.vue'
import { createRouter, getRouter } from './router'
import Vant from 'vant';
import MuseUI from 'muse-ui';

//Base type extends

import './utils/base-extends'

import process from "process";
import fs from "fs";
import { createNoteService } from "./service/NoteService";
import { createDataStorageService } from "./service/DataStorageService";
import { createSettingsService } from './service/SettingsService';

const Datastore = require("nedb");
const electron = require("electron");
const dialog = electron.remote.dialog;

Vue.config.productionTip = false
Vue.use(Vant);
Vue.use(MuseUI);

function initVue() {

  createAll();
  createRouter();

  window.app = new Vue({
    el: '#app',
    router: getRouter(),
    render: h => h(App)
  })

  showIntro();
};
function createAll() {
  createDataStorageService();
  createNoteService();
  createSettingsService();
}
function showIntro() {
  jQuery('#intro img').show().addClass(['animated','bounceInDown']);
  jQuery('#intro h3').show().addClass(['animated','bounceInUp']);
  jQuery('#intro .ver-text').show().addClass(['animated','bounceInUp']);
  jQuery('#intro-ver').text(window.appVesrsion + ' ' + window.appBuildDate);
}

//Loader

var appPath = process.cwd().replace(/\\/g, '/');
var appDbPath = '';
var appDb = null;
var app = null;
var appVesrsion = 'V 2.0.1';
var appBuildDate = '2020/1/28';

function initDb() : Promise<void> {
  return new Promise((resolve, reject) => {
    let dbDir = appPath + '/data';
    let configueLogs = () => {
      try {
        appDb = new Datastore({ filename: appDbPath });
        resolve();
      }catch(e) {
        reject(e)
      }
    }
    let testExists = () => {
      fs.exists(dbDir, (exists) => {
        if(!exists) fs.mkdir(dbDir, (err) => {
          if(err) reject('创建数据目录失败 (' + dbDir + ')')
          else configueLogs();
        }); else configueLogs();
      })
    }
    testExists();
  });
}
function initBasePath() {

  window.appDir = appPath;
  appDbPath = appPath + "/data/data.db";

  console.log(`[Loader] App version is ${appVesrsion} (${appBuildDate})`);
  console.log(`[Loader] App base path is ${appPath}`);
  console.log(`[Loader] App doc path is ${window.appDir}`);
  console.log(`[Loader] App db path is ${appDbPath}`);
}
function initGlobal() {
  
  //Global defs
  window.appBuildDate = appBuildDate;
  window.appVesrsion = appVesrsion;
  window.appInited = false;
  window.appDb = appDb;
  window.app = app;
}

//Loader start 

function loaderStart() {
  initBasePath();
  initDb().then(() => {
    initGlobal();
    initVue()
  }).catch((err) => {
    console.error(err);
    dialog.showErrorBox('初始化数据失败', err);
  });
}

window.addEventListener('load', () => loaderStart());


