/**
 * 组件的纲要信息
 * 定义组件的属性、方法和事件
 */
export default {
  type: 'object',

  /**
   * 在属性栏是必填项
   */
  required: ['nodeCode', 'nodeName', 'verifySchemaCode', 'dataCondition'],

  /**
   * 组件所有属性
   */
  properties: {
    nodeCode: {
      type: 'string',
      title: '节点编码'
    },
    nodeName: {
      type: 'string',
      title: '节点名称',
    },
    verifySchemaCode: {
      type: 'string',
      title: '验证模型',
    },
    dataCondition: {
      type: 'object',
      title: '验证条件',
      properties: {

      }
    }
  }
}
