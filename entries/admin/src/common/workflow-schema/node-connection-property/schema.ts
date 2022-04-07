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
      default: FlowTypings.ActivityTypes.Connection,
    },
    icon: {
      type: 'string',
      default: '&#xe914;'
    },
    // 业务属性
    // 一般属性
    activityCode: {
      type: 'string',
      title: '编码'
    },
    activityName: {
      type: 'string',
      default: '连接点',
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
  }
}