import RouterView from "@/views/common-view/index.vue";

import list from "@cloudpivot/list/pc";

import flow from "@cloudpivot/flow/pc";

import site from "@/config/site";

import common from "@cloudpivot/common/pc";

export default {
  home: {
    path: "/",
    redirect: {
      name: "workflowCenter"
    }
  },
  externalLink: {
    path: "/external-link/:formid",
    name: "external-link",
    meta: { title: " " },
    component: () => import("@/views/external-link.vue")
  },
  // empty: {
  //   path: '/empty',
  //   name: 'empty',
  //   component: () => import('@/components/global/empty.vue')
  // },
  error: {
    path: "/error",
    name: "error",
    component: () => import("@/views/shared/error.vue")
  },
  permission: {
    path: "/permission",
    name: "permission",
    component: () => import("@/views/shared/permission/permission.vue")
  },
  formUnpublished: {
    path: "/form-unpublished",
    name: "formUnpublished",
    component: common.components.FormUnpublished
  },
  oauth: {
    path: "/oauth",
    name: "oauth",
    component: () => import("@/views/oauth/oauth.vue")
  },

  print: {
    path: "/print",
    name: "print",
    meta: { title: "之江实验室" },
    component: () => import("@/views/applications/print.vue")
  },

  login: {
    path: "/login",
    name: "login",
    meta: { title: "之江实验室" },
    component: () => import("@/views/login/login.vue")
  },

  loginError: {
    path: "/login-error",
    name: "loginError",
    meta: { title: "之江实验室" },
    component: () => import("@/views/loginError/index.vue")
  },

  formDetail: {
    path: "/form/detail",
    name: "form-detail",
    component: () => import(/* webpackChunkName: "form-detail" */ "@/views/form/form-detail.vue")
  },
  flowTrackLogs: {
    path: "/from/workflow-track/:workflowInstanceId/operation-logs/",
    name: "flowTrackOperationLogs",
    meta: { title: site.title + "操作日志" },
    component: flow.components.OperationLogs
  },
  flowTrack: {
    path: "/from/workflow-track/:workflowInstanceId/:workItemId/",
    name: "flowTrack",
    meta: { title: site.title + "流程跟踪" },
    component: () => import("@/views/form/workflow-track/workflow-track.vue")
  },

  operationLogsCompare: {
    path: "/from/operation-log-compare/:logid",
    name: "operationLogsCompare",
    component: () => import("@/views/form/workflow-track/operation-log-compare.vue")
  },

  sharedSuccess: {
    path: "/shared/success",
    name: "shared-success",
    component: () => import("@/views/shared/success.vue")
  },
  sharedEmpty: {
    path: "/shared/empty",
    name: "shared-empty",
    component: () => import("@/views/shared/empty.vue")
  },

  application: {
    root: {
      // TODO
      path: "/application/:appCode",
      name: "application",
      component: () => import("@/views/common-view/index.vue")
    },
    applicationList: {
      path: "application-list/:schemaCode",
      name: "applicationList",
      component: list.components.ApplicationList
    },
    applicationDefine: {
      path: "application-define/:url",
      name: "applicationDefine",
      component: () => import("@/views/applications/application-define.vue")
    },
    applicationReport: {
      path: "application-report/:reportCode",
      name: "applicationReport",
      component: () => import("@/views/applications/report.vue")
    },
    applicationCustom: {
      path: "application-custom",
      name: "custom",
      component: () => import("@/views/applications/custom-router-page/test.vue")
    }
  },

  workflowCenter: {
    root: {
      path: "/workflow-center",
      name: "workflowCenter",
      component: RouterView,
      redirect: { name: "myUnfinishedWorkItem" }
    },
    myUnfinishedWorkItem: {
      path: "my-unfinished-workitem",
      name: "myUnfinishedWorkItem",
      meta: { title: site.title + "我的待办" },
      component: () => import("@/views/workflow-center/myUnfinishedWorkItem.vue")
    },
    startWorkflow: {
      path: "start-workflow",
      name: "startWorkflow",
      meta: { title: site.title + "发起流程" },
      component: () => import("@/views/workflow-center/start-workflow.vue")
    },
    myUnReadWorkItem: {
      path: "my-unread-workitem",
      name: "myUnReadWorkItem",
      meta: { title: site.title + "我的待阅" },
      component: () => import("@/views/workflow-center/myUnReadWorkItem.vue")
    },
    myFinishedWorkItem: {
      path: "my-finished-workitem",
      name: "myFinishedWorkItem",
      meta: { title: site.title + "我的已办" },
      component: () => import("@/views/workflow-center/myFinishedWorkitem.vue")
    },
    myReadWorkItem: {
      path: "my-read-workitem",
      name: "myReadWorkItem",
      meta: { title: site.title + "我的已阅" },
      component: () => import("@/views/workflow-center/myReadWorkItem.vue")
    },
    myWorkflow: {
      path: "my-workflow",
      name: "myWorkflow",
      meta: { title: site.title + "我的流程" },
      component: () => import("@/views/workflow-center/my-workflow.vue")
    },
    delegationWorkflow: {
      path: "delegation-workflow",
      name: "delegationWorkflow",
      meta: { title: site.title + "委托流程" },
      component: () => import("@/views/workflow-center/delegation-workflow.vue")
    },
    queryInstance: {
      path: "query-instance",
      name: "queryInstance",
      meta: { title: site.title + "流程实例查询" },
      component: () => import("@/views/workflow-center/query-instance.vue")
    },
    queryParticipantWorkItem: {
      path: "query-participant-workItem",
      name: "queryParticipantWorkItem",
      meta: { title: site.title + "任务查询" },
      component: () => import("@/views/workflow-center/task-search.vue")
    }
    //常用审批意见已经移动到流程详情界面
    // myComments: {
    //   path: 'my-comments',
    //   name: 'myComments',
    //   meta: { title: site.title + '-常用审批意见' },
    //   component: () => import('@/views/workflow-center/myComments.vue')
    // }
  },

  user: {
    root: {
      path: "/user",
      name: "user",
      component: RouterView,
      redirect: { name: "info" }
    },
    info: {
      path: "/",
      name: "info",
      meta: { title: site.title + "个人信息" },
      component: () => import("@/views/user-info/user-info.vue")
    }
  },

  singleApp: {
    root: {
      path: "/singleApp/:appCode",
      name: "singleApp",
      component: () => import("@/views/single-app/index.vue"),
      redirect: "/app-home"
    },
    appHome: {
      path: "/app-home",
      name: "appHome",
      component: () => import("@/views/single-app/home.vue")
    },
    appList: {
      path: "/app-list/:appCode/:schemaCode/:displayName",
      name: "appList",
      component: () => import("@/views/single-app/list.vue")
    },
    appToDo: {
      path: "/app-todo",
      name: "appToDo",
      component: () => import("@/views/single-app/todo.vue")
    },
    appToRead: {
      path: "/app-toread",
      name: "appToRead",
      component: () => import("@/views/single-app/toread.vue")
    },
    appDone: {
      path: "/app-done",
      name: "appDone",
      component: () => import("@/views/single-app/done.vue")
    },
    appReaded: {
      path: "/app-readed",
      name: "appReaded",
      component: () => import("@/views/single-app/readed.vue")
    },
    appReport: {
      path: "/app-report/:appCode/:reportCode",
      name: "appReport",
      component: () => import("@/views/applications/report.vue")
    },
    appDefine: {
      path: "/app-define/:url",
      name: "appDefine",
      component: () => import("@/views/applications/application-define.vue")
    }
  }
};
