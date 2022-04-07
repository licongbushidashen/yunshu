export default {
  path: '/system',
  name: 'system',
  meta: { title: '云枢-系统管理', onlySytem: true },
  component: () => import('@/views/system/index.vue'),
  children: [
    {
        path: '/',
        redirect: { name: 'commonSetting' }
    },
    {
        path: '/system/common-setting',
        name: 'commonSetting',
        meta: { title: '云枢-常规设置' },
        component: () => import('@/views/system/common-setting/index.vue')
    },
    {
        path: '/system/manager-setting',
        name: 'managerSetting',
        meta: { title: '云枢-管理员设置' },
        component: () => import('@/views/system/manager-setting/index.vue')
    },
    {
        path: '/system/integration-setting',
        name: 'integrationSetting',
        meta: { title: '云枢-集成服务' },
        component: () => import('@/views/system/integration-setting/index.vue')
    },
    {
      path: '/system/log',
      name: 'log',
      meta: { title: '云枢-日志消息' },
      component: () => import('@/views/system/log/index.vue')
    },
    {
      path: '/system/license',
      name: 'license',
      meta: { title: '云枢-系统信息' },
      component: () => import('@/views/system/license/index.vue')
    },
    {
      path: '/system/dataDictionary',
      name: 'dataDictionary',
      meta: { title: '云枢-数据字典' },
      component: () => import('@/views/system/dataDictionary/index.vue')
    },
    {
      path: '/system/apiConfiguration',
      name: 'apiConfiguration',
      meta: { title: '云枢-API接口配置' },
      component: () => import('@/views/system/apiConfiguration/index.vue')
    }
  ]
}