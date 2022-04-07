/*
 * @Author: nooldey <nooldey@gmail.com> 
 * @Date: 2020-04-23 14:30:38 
 * @Last Modified by: nooldey 
 */

import * as FlowTypings from '../typings/index';

export default {
  type: 'object',
  // 定义必填项
  required: [
    'activityCode',
    'activityName'
  ],
  // 定义属性项
  properties: {
    // 渲染属性
    left: {
      type: 'number',
      default: 0,
    },
    top: {
      type: 'number',
      default: 0,
    },
    x: {
      type: 'number',
      default: 0,
    },
    y: {
      type: 'number',
      default: 0,
    },
    width: {
      type: 'number',
      default: 0,
    },
    height: {
      type: 'number',
      default: 0,
    },
    right: {
      type: 'number',
      default: 0,
    },
    bottom: {
      type: 'number',
      default: 0,
    },
    center: {
      type: 'number',
      default: 0,
    },
    middle: {
      type: 'number',
      default: 0,
    },
    isSelected: {
      type: 'boolean',
      default: false
    },
    activityType: {
      type: 'string',
      disabled: true,
      default: FlowTypings.ActivityTypes.Circulate
    },
    icon: {
      type: 'string',
      default: '&#xe910;'
    },
    // 业务属性
    // 一般属性
    activityCode: {
      type: 'string',
      title: '编码'
    },
    activityName: {
      type: 'string',
      default: '传阅',
      title: '显示名称'
    },
    name_i18n: {
      type: 'object',
      nullable: true,
      properties: {
        en: {
          type: 'string'
        },
        zh: {
          type: 'string'
        }
      }
    },
    sheetCode: {
      type: 'string',
      default: '',
      title: '任务表单'
    },
    // 参与者
    popupType: {
      type: 'string',
      default: FlowTypings.ParticipantModalType.Expression,
      title: '参与者函数弹窗类型',
      hidden: true,
    },
    participant: {
      type: 'string',
      nullable: true,
      title: '参与者'
    },
    // 事件处理
    beforeActivate: {
      title: '活动激活前',
      description: '在活动由系统创建之前，系统内部触发的事件',
      type: 'object',
      // 定义属性项
      properties: {
        receiver: {
          type: 'string',
          title: '钉钉消息通知方'
        },
        emailReceiver: {
          type: 'string',
          title: '邮件消息通知方'
        },
        emailContent: {
          type: 'string',
          title: '邮件消息通知方'
        },
        popupType: {
          type: 'string',
          hidden: true,
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
        cancelParllelActivity: {
          type: 'boolean',
          default: false,
          title: '通过时取消并行活动'
        },
        rejectCancelParllelActivity: {
          type: 'boolean',
          default: true,
          title: '驳回时取消并行活动'
        }
      }
    },
    afterActivate: {
      title: '活动激活后',
      description: '在活动由系统创建之后，系统内部立即触发的事件',
      type: 'object',
      // 定义属性项
      properties: {
        receiver: {
          type: 'string',
          title: '钉钉消息通知方'
        },
        emailReceiver: {
          type: 'string',
          title: '邮件消息通知方'
        },
        emailContent: {
          type: 'string',
          title: '邮件消息通知方'
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
          ttile: '设置数据',
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
        cancelParllelActivity: {
          type: 'boolean',
          default: false,
          title: '通过时取消并行活动'
        },
        rejectCancelParllelActivity: {
          type: 'boolean',
          default: true,
          title: '驳回时取消并行活动'
        }
      }
    },
    endActivity: {
      title: '活动完成后',
      description: '在活动完成后，由系统内部立即触发的事件',
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
          ttile: '设置数据',
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
        cancelParllelActivity: {
          type: 'boolean',
          default: false,
          title: '通过时取消并行活动'
        },
        rejectCancelParllelActivity: {
          type: 'boolean',
          default: true,
          title: '驳回时取消并行活动'
        }
      }
    },
  }
}