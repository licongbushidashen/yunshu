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
      default: FlowTypings.ActivityTypes.User
    },
    icon: {
      type: 'string',
      default: '&#xe935;'
    },
    // 业务属性
    // 一般属性
    activityCode: {
      type: 'string',
      title: '编码'
    },
    activityName: {
      type: 'string',
      default: '用户活动',
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
    todoDataItem: {
      type: 'object',
      title: '消息通知',
      properties: {
        dataItemType: {
          type: 'number',
          default: FlowTypings.NotifyType.Default
        },
        summary: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              isDataItem: {
                type: 'number'
              },
              code: {
                type: 'string'
              }
            }
          }
        },
        title: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    },
    todoDataItems: [
      {
        type: "object",
        title: "邮件消息通知",
        properties: {
          dataItemType: {
            type: "number",
            default: FlowTypings.NotifyType.Default,
          },
          belong: "email",
          summary: {
            type: "array",
            items: {
              type: "string",
            },
          },
          title: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
    ],
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
    participantChoose: {
      type: 'boolean',
      default: false,
      title: '参与者自由选择'
    },
    nextNodeParticipant: {
      type: 'string',
      default: FlowTypings.CheckNextNodeParticipant.Participant,
      title: '审核人员选择下个节点参与者'
    },
    participantType: {
      type: 'string',
      default: FlowTypings.ParticipantType.Single,
      title: '参与者类型'
    },
    participateLater: {
      type: 'string',
      default: 'DEFAULT',
      title: '启用后审批'
    },

    commonSwitch: {
      type: 'boolean',
      default: false,
      title: '常用审批意见'
    },



    lockType: {
      type: 'string',
      default: 'NONE', 
      title: '锁表'
    },



    participationModel: {
      type: 'string',
      default: FlowTypings.PraticipantMode.Parallel,
      title: '参与方式'
    },
    approveExit: {
      type: 'string',
      default: '100%',
      title: '同意出口'
    },
    disapproveExit: {
      type: 'string',
      default: '1',
      title: '否决出口'
    },
    targetActivityCode: {
      type: 'string',
      nullable: true,
      hidden: true,
      title: '否决出口指定驳回节点'
    },
    noParticipant: {
      type: 'string',
      default: FlowTypings.NoParticipantHandler.ToAdmin,
      title: '无参与者',
      description: '转交管理员指的是找不到人时找对这条数据有管理权限的数据管理员，如果没有找到数据管理员就找系统管理员'
    },
    originator: {
      type: 'string',
      default: 'DEFAULT',
      enum: [
        'DEFAULT',
        'APPROVE'
      ],
      title: '是发起人'
    },
    perviousParticipate: {
      type: 'string',
      default: 'DEFAULT',
      enum: [
        'DEFAULT',
        'APPROVE'
      ],
      title: '前一活动处理',
      description: '与上一活动处理人相同，如A的下一节点是B,当B的参与者与A相同，自动通过'
    },
    participated: {
      type: 'string',
      default: 'DEFAULT',
      enum: [
        'DEFAULT',
        'APPROVE'
      ],
      title: '处理过流程',
      description: '在之前活动参与过流程,注当某个用户驳回之后，下一次任务再到达时不算参与过流程，例如A提交给B，B提交给C，C驳回给A，当A提交，再次到C时，不会自动跳过C'
    },
    // 数据权限
    propertyPermissions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          propertyCode: {
            type: 'string'
          },
          propertyName: {
            type: 'string'
          },
          propertyEmpty: {
            type: 'boolean',
            default: false
          },
          visible: {
            type: 'boolean',
            default: true
          },
          editable: {
            type: 'boolean',
            default: false
          },
          required: {
            type: 'boolean',
            default: false
          },
          subPropertyPermissions: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                propertyCode: {
                  type: 'string'
                },
                propertyName: {
                  type: 'string'
                },
                propertyEmpty: {
                  type: 'boolean',
                  default: false
                },
                visible: {
                  type: 'boolean',
                  default: true
                },
                editable: {
                  type: 'boolean',
                  default: false
                },
                required: {
                  type: 'boolean',
                  default: false
                },
                subPropertyPermissions: {
                  type: 'array',
                  nullable: true,
                  items: {
                    AnyValue: true,
                  }
                }
              }
            }
          }
        }
      }
    },
    // 操作权限
    permittedAction: {
      type: 'object',
      properties: {
        forward: {
          type: 'boolean',
          default: true
        },
        adjustParticipant: {
          type: 'boolean',
          default: false
        },
        assist: {
          type: 'boolean',
          default: false
        },
        batchOperate: {
          type: 'boolean',
          default: false
        },
        circulate: {
          type: 'boolean',
          default: false
        },
        finishInstance: {
          type: 'boolean',
          default: false
        },
        reject: {
          type: 'boolean',
          default: false
        },
        rejectToActivityCode: {
          type: 'string',
        },
        rejectToFixded: {
          type: 'boolean',
          default: false
        },
        rejectToStart: {
          type: 'boolean',
          default: true
        },
        retrieve: {
          type: 'boolean',
          default: true
        },
      }
    },

    timeoutCondition: {
      type: 'string',
      enum: [
        'post_node',
        'in_form',
      ],
      title: '限时时间'
    },
    timeoutTime: {
      type: 'object',
      title: '超时时间',
      description: '设定当前任务的许可时间，超过该时间系统即认为该任务超时',
      properties: {
        enable: {
          type: "boolean",
          default: false,
        },
        formId:  {
          type: 'string',
          default: '',
        },
        timeConfig: {
          type: 'string',
          default: '',
        },
      },
    },
    // 高级——超时处理
    allowedTime: {
      type: 'number',
      nullable: true,
      title: '限时时间',
      description: '设定当前任务的许可时间，超过该时间系统即认为该任务超时'
    },
    timeoutWarning1: {
      type: 'number',
      nullable: true,
      title: '超时预警1',
      description: '设置第一次即将超时提醒的时间，即将到达超时时间前的4小时，待办列表要显示为黄色'
    },
    timeoutWarning2: {
      type: 'number',
      nullable: true,
      title: '超时预警2',
      description: '设置第二次提醒的时间，即将到达超时时间前的2小时，待办列表要显示为橙色'
    },
    timeoutStrategy: {
      type: 'string',
      default: 'NOTIFY_HANDLER',
      enum: [
        'NOTIFY_HANDLER',
        'APPROVE',
        'CIRCULATE_MANAGER',
      ],
      title: '超时后策略'
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
    cancelActivity: {
      title: '活动取消',
      description: '在活动被取消时，由系统内部立即调用的事件',
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
    jobSubmitted: {
      title: '任务提交后',
      description: '当活动中的某个任务提交后，由系统内部立即调用的事件',
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
    jobRejected: {
      title: '任务驳回后',
      description: '当活动中的某个任务驳回后，由系统内部立即调用的事件',
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
  }
}
