/**
 * 组件的纲要信息
 * 定义组件的属性、方法和事件
 */
export default {
  type: 'object',

  /**
   * 在属性栏是必填项
   */
  required: ['code', 'name', 'bizRuleType', 'schedulerSetting'],

  /**
   * 组件所有属性
   */
  properties: {
      code: {
          type: 'string',
          title: '规则编码',
          disabled: false
      },
      name: {
          type: 'string',
          title: '规则名称',

      },
      bizRuleType: {
          type: 'number',
          title: '规则类型',
          disabled: true
      },
      schedulerSetting: {
        type: 'string',
        title: '定时设置',
        hidden: true
      },
      // dataSourceType: {
      //   type: 'string',
      //   title: '数据源',
      // },
      // bizMethodMappingModel: {
      //   type: 'string',
      //   title: '绑定业务服务',
      // }
  }
}
