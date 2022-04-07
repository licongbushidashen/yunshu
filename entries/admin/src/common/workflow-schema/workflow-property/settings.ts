/*
 * @Author: nooldey <nooldey@gmail.com> 
 * @Date: 2020-04-23 14:40:50 
 * @Last Modified by: nooldey 
 * @Description:  
 */

import { ComponentType } from '@h3/ui-designer/property-panel'

const properties = {
  /**
   * 属性分组
   */
  group: [
    {
      value: 'common',
      label: '基础属性',
      keys: [
        'workflowCode',
        'workflowName'
      ],
    },
    {
      value: 'events',
      label: '流程事件',
      keys: [
        'startEventHandler',
        'endEventHandler',
        'cancelEventHandler',
        'activateEventHandler',
      ]
    }
  ],
  /**
     * 属性的显示控制
     * 定制属性在属性栏如何显示
     * string默认显示为input:text
     * string format:date、date-time、time默认显示为input:date
     * string format:binary默认显示为input:file
     * boolean默认显示为switch
     * integer默认显示为无小数点input:number
     * number默认显示为带小数点input:number
     */
  display: {
    workflowCode: {
      component: {
        type: ComponentType.Input
      }
    },
    workflowName: {
      component: {
        type: ComponentType.Input
      }
    },
    startEventHandler: {
      component: {
        type: 'EventModal'
      }
    },
    endEventHandler: {
      component: {
        type: 'EventModal'
      }
    },
    cancelEventHandler: {
      component: {
        type: 'EventModal'
      }
    },
    activateEventHandler: {
      component: {
        type: 'EventModal'
      }
    }
  }
}

export default {
  // 控件属性配置
  properties
}