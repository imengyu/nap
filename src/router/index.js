
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Index from '../view/Index.vue'

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index,
      meta: {
        index: 0,
        title: '首页',
      }
    },

  ],
})