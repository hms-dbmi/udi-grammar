import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/Examples',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ExamplesPage.vue') }],
  },
  {
    path: '/Editor',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EditorPage.vue') }],
  },
  {
    path: '/HuBMAPExamples',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/HuBMAPExamples.vue') }],
  },
  {
    path: '/HuBMAPDemo',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/HuBMAPDemo.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
