export default {
    MyUnFinishedWorkItem: () => import('./my-unfinished-workItem.vue'),
    MyUnReadWorkItem: () => import('./my-unread-workitem.vue'),
    MyFinishedWorkItem: () => import('./my-finished-workitem.vue'),
    MyReadWorkItem: () => import('./my-read-workitem.vue'),
    MyWorkflow: () => import('./my-workflow.vue'),
    QueryInstance: () => import('./query-instance.vue'),
    TaskSearch: () => import('./task-search.vue'),
    WorkflowCenterMenu: () => import('./menu/workflow-center-menu.vue'),
    StartWorkflow: () => import('./start-workflow.vue'),
    DelegationWorkflow: () => import('./delegation-workflow.vue'),
    myComments: () => import('./my-comments.vue'),
  }