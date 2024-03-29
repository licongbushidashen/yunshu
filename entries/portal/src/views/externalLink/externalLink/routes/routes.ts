import RouterView from "@/views/common-view/index.vue";

import * as applicationList from "@cloudpivot/list";

import * as flow from "@cloudpivot/flow";

import site from "@/config/site";

export default {
  error: {
    path: "/error",
    name: "error",
    component: () => import("@/views/shared/error.vue")
  },

  formDetail: {
    path: "/form",
    name: "form-detail",
    component: () => import("@/views/form/form-detail.vue")
  },
  // flowTrackLogs: {
  //   path: '/from/workflow-track/:workflowInstanceId/operation-logs/',
  //   name: 'flowTrackOperationLogs',
  //   component: () => import('@/views/form/workflow-track/operation-logs.vue')
  // },

  flowTrack: {
    path: "/from/workflow-track/:workflowInstanceId/:workItemId/",
    name: "flowTrack",
    meta: { title: site.title + "流程跟踪" },
    component: () => import("@/views/form/workflow-track/workflow-track.vue")
  },

  sharedSuccess: {
    path: "/shared/success/:shortCode",
    name: "shared-success",
    component: () => import("../components/success/success.vue")
  }
  // error: {
  //   path: '/error',
  //   name: 'error',
  //   component: () => import('@/views/shared/error.vue')
  // },
};
