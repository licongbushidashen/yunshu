/*
 * @Author: nooldey <nooldey@gmail.com> 
 * @Date: 2020-04-23 14:30:38 
 * @Last Modified by: nooldey 
 */
import * as FlowTypings from '../typings/index';

export default {
  type: 'object',
  // 定义属性项
  properties: {
    // 渲染类属性
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
    icon: {
      type: 'string',
      default: '&#xe897;'
    },
    activityName: {
      type: 'string',
      default: '开始'
    },
    // 业务类属性
    activityCode: {
      type: 'string',
      title: '节点编码',
    },
    activityType: {
      type: 'string',
      disabled: true,
      default: FlowTypings.ActivityTypes.Start
    },

  }
}