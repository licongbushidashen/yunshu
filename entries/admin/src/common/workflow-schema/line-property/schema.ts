/*
 * @Author: nooldey <nooldey@gmail.com> 
 * @Date: 2020-04-23 17:13:44 
 * @Last Modified by: nooldey 
 * @Description:  连接线的属性元数据
 */

export default {
  type: 'object',
  // 必填项
  // 属性项
  properties: {
    text: {
      type: 'string',
      title: '显示名称'
    },
    name_i18n: {
      type: 'string',
      title: '显示名称国际化'
    },
    formula: {
      type: 'string',
      title: '条件设置'
    },
    popupType: {
      type: 'string',
      title: '参与者弹窗类型'
    },
    utilizeElse: {
      type: 'boolean',
      title: '是否使用else'
    },
    preActivityCode: {
      type: 'string',
      title: '接入节点编码'
    },
    postActivityCode: {
      type: 'string',
      title: '流出节点编码'
    },
    points: {
      type: 'array',
      title: '途经点',
      items: {
        AnyValue: true
      }
    }
  }
}
