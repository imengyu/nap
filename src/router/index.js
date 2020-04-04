
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Index from '../view/Index.vue'
import Settings from '../view/Settings.vue'
import Editor from '../view/Editor.vue'

var router = null;

export function createRouter() {
  if(router == null) {
    router = new Router({
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
        {
          path: '/settings',
          name: 'Settings',
          component: Settings,
          meta: {
            index: 1,
            title: '设置',
          }
        },
        {
          path: '/edit',
          name: 'Editor',
          component: Editor,
          meta: {
            index: 1,
            title: '编辑便签',
          }
        },
      ],
    });
  }
  return router;
}
export function getRouter() {
  return router;
}