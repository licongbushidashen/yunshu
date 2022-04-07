// import { PropertyData, ObjectPropertyInfo, EnvironmentVariable } from '../../meta';

import { ComponentSettings, PropertiesSettings } from "@h3/designer-core";

import { ComponentType } from "@h3/ui-designer/property-panel";

const properties = {
  /**
   * 属性的分组
   */
  groups: [
    {
      value: "base",
      label: "基础属性",
      keys: ["nodeCode", "nodeName"]
    },
    {
      value: "control",
      label: "控件属性",
      keys: [
        "targetSchema",
        "existVerifyCondition"
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
    targetSchema: {
      component: {
        type: "ModelsSelect",
      }
    },
    existVerifyCondition: {
      component: {
        type: 'ExistCondition',
        options: {
          dataItems: []
        }
      }
    }
  },

  /**
   * 事件订阅
   * 相当于回调
   */
  subscription: {
    /**
     * 属性数据发生变化时
     * 可以在这个函数中改变其他属性的属性数据，比如说将其他属性设为不可见
     * @param key 属性Key
     * @param propertyKey 属性的属性Key
     * @param propertyData 属性的属性数据对象
     * @param schemaInfo 组件的纲要信息
     * @param schemaData 组件的纲要数据
     */
    dataChange: function (
      key: string,
      propertyData: any,
      schemaInfo: any,
      schemaData: { [key: string]: any }
    ) {
      console.log("propertyDataChange", key, propertyData);
      // if (key === 'schemaCode') {
      //     // schemaCode有值时显示queryCode，无值时隐藏
      //     schemaData.queryCode.hidden = !propertyData.value;
      // }
      // if (key === 'visible') {
      //     schemaData.controlName.disabled = !propertyData.value;
      //     schemaData.controlName.value = '';
      // }
    }
  }
};

export default {
  /**
   * 属性设置
   */
  properties
} as ComponentSettings;
