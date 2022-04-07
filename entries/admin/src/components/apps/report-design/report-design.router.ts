
export default [{
    path: ':appCode/report-design/:reportCode',
    name: 'report-design',
    // meta: { title: '云枢-报表设计' },
    props: true,
    component: () => import('./report-design.vue')
  },{
    path: ':appCode/report-design/:reportCode/data-source-list',
    name: 'ReportDataSourceList',
    // meta: { title: '云枢-报表设计' },
    props: true,
    component: () => import('./data-source/list.vue')
  },{
    path: ':appCode/report-design/:reportCode/data-source-designer',
    name: 'ReportDataSourceDesigner',
    // meta: { title: '云枢-报表设计' },
    props: true,
    component: () => import('./data-source/design.vue')
  }]