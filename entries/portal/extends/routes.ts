export default {
  formDetail: {
    path: "/form/detail",
    name: "form-detail",
    component: () => import("@/views/form/form-detail.vue")
  },
  wyViews: {
    path: "/wyviews",
    name: "wyviews",
    component: () => import("./wy_views/index.vue"),
    children: [
      {
        path: "",
        name: "home",
        meta: { title: "督查督办系统-首页" },
        component: () => import("./wy_views/home.vue")
      },
      {
        path: "home",
        name: "home",
        meta: { title: "督查督办系统-首页" },
        component: () => import("./wy_views/home.vue")
      },
      {
        path: "dcdb",
        name: "dcdb",
        meta: { title: "督查督办系统-督办件管理" },
        component: () => import("./wy_views/dcdb.vue")
      },
      {
        path: "unfinished",
        name: "unfinished",
        meta: { title: "督查督办系统-我的待办" },
        component: () => import("./wy_views/unfinished.vue")
      },
      {
        path: "work",
        name: "work",
        meta: { title: "督查督办系统-督办反馈" },
        component: () => import("./wy_views/work.vue")
      },
      {
        path: "workItem",
        name: "workItem",
        meta: { title: "督查督办系统-我的待阅" },
        component: () => import("./wy_views/myUnReadWorkItem.vue")
      },
      {
        path: "task",
        name: "task",
        meta: { title: "督查督办系统-任务中心" },
        component: () => import("./wy_views/task.vue")
      }
    ]
  },
  wyViewsUser: {
    path: "/wyViewsUser",
    name: "wyViewsUser",
    component: () => import("./wy_views/userIndex.vue"),
    children: [
      {
        path: "",
        name: "unfinished",
        meta: { title: "督查督办系统-我的待办" },
        component: () => import("./wy_views/unfinished.vue")
      },
      {
        path: "unfinished",
        name: "unfinished",
        meta: { title: "督查督办系统-我的待办" },
        component: () => import("./wy_views/unfinished.vue")
      },
      {
        path: "myUnReadWorkItem",
        name: "myUnReadWorkItem",
        meta: { title: "督查督办系统-我的待阅" },
        component: () => import("./wy_views/myUnReadWorkItem.vue")
      },
      {
        path: "myYb",
        name: "myYb",
        meta: { title: "督查督办系统-我的已办" },
        component: () => import("./wy_views/myYb.vue")
      },
      {
        path: "myread",
        name: "myread",
        meta: { title: "督查督办系统-我的已阅" },
        component: () => import("./wy_views/myread.vue")
      },
      {
        path: "my-workflow",
        name: "my-workflow",
        meta: { title: "督查督办系统-我的督办件" },
        component: () => import("./wy_views/myinstance.vue")
      }
    ]
  },
  application: {
    testApplication: {
      path: "testApplication/:schemaCode",
      name: "testApplication",
      component: () => import("./views/application-list.vue")
    }
  }
} as any;
