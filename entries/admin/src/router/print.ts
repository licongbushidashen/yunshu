export default [
  {
    path: "print-template/:printCode/:version",
    name: "print-template",
    meta: { title: "打印模板设计" },
    component: () => import("@/views/print-template/index.vue")
  },
  {
    path: "pre-view",
    name: "pre-view",
    meta: { title: "打印模板预览" },
    component: () => import("@/views/print-template/pre-view.vue")
  }
]
