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
