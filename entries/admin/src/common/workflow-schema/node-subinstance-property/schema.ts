/*
 * @Author: nooldey <nooldey@gmail.com>
 * @Date: 2020-04-23 14:30:38
 * @Last Modified by: nooldey
 */

import * as FlowTypings from "../typings/index";

export default {
  type: "object",
  // 定义必填项
  required: ["activityCode", "activityName"],
  // 定义属性项
  properties: {
    // 渲染属性
    left: {
      type: "number",
      default: 0,
    },
    top: {
      type: "number",
      default: 0,
    },
    x: {
      type: "number",
      default: 0,
    },
    y: {
      type: "number",
      default: 0,
    },
    width: {
      type: "number",
      default: 0,
    },
    height: {
      type: "number",
      default: 0,
    },
    right: {
      type: "number",
      default: 0,
    },
    bottom: {
      type: "number",
      default: 0,
    },
    center: {
      type: "number",
      default: 0,
    },
    middle: {
      type: "number",
      default: 0,
    },
    isSelected: {
      type: "boolean",
      default: false,
    },
    activityType: {
      type: "string",
      disabled: true,
      default: FlowTypings.ActivityTypes.SubInstance,
    },
    icon: {
      type: "string",
      default: "&#xe9d5;",
    },
    // 业务属性
    // 一般属性
    activityCode: {
      type: "string",
      title: "编码",
    },
    activityName: {
      type: "string",
      default: "子流程",
      title: "显示名称",
    },
    name_i18n: {
      type: "object",
      nullable: true,
      properties: {
        en: {
          type: "string",
        },
        zh: {
          type: "string",
        },
      },
    },
    todoDataItem: {
      type: "object",
      title: "消息通知",
      properties: {
        dataItemType: {
          type: "number",
          default: FlowTypings.NotifyType.Default,
        },
        summary: {
          type: "array",
          items: {
            type: "object",
            properties: {
              isDataItem: {
                type: "number",
              },
              code: {
                type: "string",
              },
            },
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
    sync: {
      type: "boolean",
      default: true,
      title: "子流程启动方式",
      description:
        "同步指的是子流程结束前流程会停留在子流程节点，不会走到下个节点；异步指的是子流程被激活的同时父流程继续向下流转，子流程是否结束不影响父流程运行",
    },
    workflowCode: {
      type: "string",
      title: "子流程模板",
    },
    finishStartActivity: {
      type: "boolean",
      title: "发起环节",
      default: false,
    },
    triggerMappingObj: {
      type: "object",
      title: "触发对象",
      nullable: true,
      properties: {
        oneOf: [
          {
            mainTable: {
              type: "number",
              default: FlowTypings.TriggerObjMap.MainSheet,
            },
          },
          {
            mainTable: {
              type: "number",
              default: FlowTypings.TriggerObjMap.ChildSheet,
            },
            code: {
              type: "string",
            },
          },
        ],
      },
    },
    // 数据映射
    workflowDataMaps: {
      type: "array",
      title: "数据映射",
      items: {
        type: "object",
        properties: {
          parentDataName: {
            type: "string",
          },
          childDataName: {
            type: "string",
          },
          inOutType: {
            type: "string",
          },
        },
      },
    },
    // 参与者
    popupType: {
      type: "string",
      default: FlowTypings.ParticipantModalType.Expression,
      title: "参与者函数弹窗类型",
      hidden: true,
    },
    participant: {
      type: "string",
      nullable: true,
      title: "参与者",
    },
    // 事件处理
    beforeActivate: {
      title: "活动激活前",
      description: "在活动由系统创建之前，系统内部触发的事件",
      type: "object",
      // 定义属性项
      properties: {
        receiver: {
          type: "string",
          title: "钉钉消息通知方",
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
          type: "string",
          title: "参与者函数弹窗类型",
        },
        content: {
          type: "string",
          title: "通知消息内容",
        },
        dataDisposals: {
          type: "array",
          ttile: "设置数据",
          items: {
            AnyValue: true,
          },
        },
        bizActions: {
          type: "array",
          title: "执行业务方法",
          items: {
            AnyValue: true,
          },
        },
        cancelParllelActivity: {
          type: "boolean",
          default: false,
          title: "通过时取消并行活动",
        },
        rejectCancelParllelActivity: {
          type: "boolean",
          default: true,
          title: "驳回时取消并行活动",
        },
      },
    },
    afterActivate: {
      title: "活动激活后",
      description: "在活动由系统创建之后，系统内部立即触发的事件",
      type: "object",
      // 定义属性项
      properties: {
        receiver: {
          type: "string",
          title: "钉钉消息通知方",
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
          type: "string",
          title: "参与者函数弹窗类型",
        },
        content: {
          type: "string",
          title: "通知消息内容",
        },
        dataDisposals: {
          type: "array",
          ttile: "设置数据",
          items: {
            AnyValue: true,
          },
        },
        bizActions: {
          type: "array",
          title: "执行业务方法",
          items: {
            AnyValue: true,
          },
        },
        cancelParllelActivity: {
          type: "boolean",
          default: false,
          title: "通过时取消并行活动",
        },
        rejectCancelParllelActivity: {
          type: "boolean",
          default: true,
          title: "驳回时取消并行活动",
        },
      },
    },
    endActivity: {
      title: "活动完成后",
      description: "在活动完成后，由系统内部立即触发的事件",
      type: "object",
      // 定义属性项
      properties: {
        receiver: {
          type: "string",
          title: "钉钉消息通知方",
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
          type: "string",
          title: "参与者函数弹窗类型",
        },
        content: {
          type: "string",
          title: "通知消息内容",
        },
        dataDisposals: {
          type: "array",
          ttile: "设置数据",
          items: {
            AnyValue: true,
          },
        },
        bizActions: {
          type: "array",
          title: "执行业务方法",
          items: {
            AnyValue: true,
          },
        },
        cancelParllelActivity: {
          type: "boolean",
          default: false,
          title: "通过时取消并行活动",
        },
        rejectCancelParllelActivity: {
          type: "boolean",
          default: true,
          title: "驳回时取消并行活动",
        },
      },
    },
  },
};
