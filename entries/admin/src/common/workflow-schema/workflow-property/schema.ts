/*
 * @Author: nooldey <nooldey@gmail.com> 
 * @Date: 2020-04-23 14:30:38 
 * @Last Modified by: nooldey 
 * @Description:  流程属性的元数据：属性、方法、事件
 */

export default {
  type: 'object',
  // 定义必填项
  required: [
    'workflowCode',
    'workflowName'
  ],
  // 定义属性项
  properties: {
    workflowCode: {
      type: 'string',
      title: '流程编码',
      disabled: false,
    },
    workflowName: {
      type: 'string',
      title: '显示名称'
    },
    startEventHandler: {
      title: '流程启动事件',
      description: '流程表单由发起人保存/提交后将触发本事件',
      type: 'object',
      // 定义属性项
      properties: {
        receiver: {
          type: 'string',
          title: '钉钉消息通知方'
        },
        popupType: {
          type: 'string',
          title: '参与者函数弹窗类型'
        },
        content: {
          type: 'string',
          title: '通知消息内容'
        },
        dataDisposals: {
          type: 'array',
          title: '设置数据',
          items: {
            AnyValue: true,
          }
        },
        bizActions: {
          type: 'array',
          title: '执行业务方法',
          items: {
            AnyValue: true,
          }
        },
      }
    },
    endEventHandler: {
      title: '流程结束事件',
      description: '流程在结束（正常结束或提前结束流程）后将触发本事件',
      type: 'object',
      // 定义属性项
      properties: {
        receiver: {
          type: 'string',
          title: '钉钉消息通知方'
        },
        popupType: {
          type: 'string',
          title: '参与者函数弹窗类型'
        },
        content: {
          type: 'string',
          title: '通知消息内容'
        },
        dataDisposals: {
          type: 'array',
          title: '设置数据',
          items: {
            AnyValue: true,
          }
        },
        bizActions: {
          type: 'array',
          title: '执行业务方法',
          items: {
            AnyValue: true,
          }
        },
      }
    },
    cancelEventHandler: {
      title: '流程作废事件',
      description: '流程在被作废后将触发本事件',
      type: 'object',
      // 定义属性项
      properties: {
        receiver: {
          type: 'string',
          title: '钉钉消息通知方'
        },
        popupType: {
          type: 'string',
          title: '参与者函数弹窗类型'
        },
        content: {
          type: 'string',
          title: '通知消息内容'
        },
        dataDisposals: {
          type: 'array',
          title: '设置数据',
          items: {
            AnyValue: true,
          }
        },
        bizActions: {
          type: 'array',
          title: '执行业务方法',
          items: {
            AnyValue: true,
          }
        },
      }
    },
    activateEventHandler: {
      title: '流程激活事件',
      description: '流程在被作废或已完成状态被管理员重新激活后将触发本事件',
      type: 'object',
      // 定义属性项
      properties: {
        receiver: {
          type: 'string',
          title: '钉钉消息通知方'
        },
        popupType: {
          type: 'string',
          title: '参与者函数弹窗类型'
        },
        content: {
          type: 'string',
          title: '通知消息内容'
        },
        dataDisposals: {
          type: 'array',
          title: '设置数据',
          items: {
            AnyValue: true,
          }
        },
        bizActions: {
          type: 'array',
          title: '执行业务方法',
          items: {
            AnyValue: true,
          }
        },
      }
    },
  }
}