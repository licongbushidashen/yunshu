/*
 * @Author: nooldey <nooldey@gmail.com> 
 * @Date: 2020-04-23 17:19:55 
 * @Last Modified by: nooldey 
 * @Description:  
 */

import { ComponentType } from '@h3/ui-designer/property-panel'

const properties = {
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
    text: {
      component: {
        type: ComponentType.Input
      }
    },
    formula: {
      component: {
        type: 'Participant',
        options: {
          formula: ''
        }
      }
    },

  }
}

export default {
  // 控件属性配置
  properties
}