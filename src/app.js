
//import css

import 'animate.css/animate.css'

import "./assets/css/font-awesome.min.css"
import "./assets/sass/main.scss";

//import scripts

import Vue from 'vue'

import jQuery from "jquery";
import App from './App.vue'
import router from './router'
import quasar from 'quasar'

Vue.config.productionTip = false
Vue.use(quasar);

const initVue = function() {
  main = new Vue({
    el: '#app',
    router,
    render: h => h(App)
  })
  showIntro();
};
const showIntro = function() {
  jQuery('#intro img').show().addClass(['animated','bounceInDown']);
  jQuery('#intro h3').show().addClass(['animated','bounceInUp']);
  jQuery('#intro .ver-text').show().addClass(['animated','bounceInUp']);
  jQuery('#intro-ver').text(appVesrsion + ' ' + appBuildDate);
}

//Loader start

window.addEventListener('load', () => {
  initVue();
});

//Base type extends

import './utils/base-extends'