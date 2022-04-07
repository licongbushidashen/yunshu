// import { PropertyData, ObjectPropertyInfo, EnvironmentVariable } from '../../meta';
import { ComponentType } from "@h3/ui-designer/property-panel";
import * as forms from 'h3-forms';
import { ObjectPropertyInfo } from '@h3/designer-core'

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
        "triggerObjectCode",
        "childTriggerConditionType",
        "dataCondition",
        "targetSchema",
        "targetObjectCode",
        "dataTriggerType",
        "filterCondition",
        "dataActions"
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
    // 触发对象
    dataActions: {
      component: {
        type: "dataActionWrap",
        options: {
          dataItems: [],
          actionType: "dataActions"
        }
      }
    },
    filterCondition: {
      component: {
        type: "PropertyFilterCondition",
        options: {
          dataItems: []
        }
      }
    },
    dataCondition: {
      component: {
        type: "PropertyModalDataFilters",
        options: {
          dataItems: []
        }
      }
    },
    triggerObjectCode: {
      component: {
        type: "TriggerSchemaCode",
        options: {
          dataItems: []
        }
      }
    },
    targetSchema: {
      component: {
        type: "ModelsSelect"
      }
    },
    targetObjectCode: {
      component: {
        type: "TargetOjectCode",
        options: {
          targetSchemaCode: ""
        }
      }
    },
    childTriggerConditionType: {
      component: {
        type: ComponentType.Select
      },
      selectOptions: [
        {
          value: "ADD",
          label: "数据新增"
        },
        {
          value: "DELETE",
          label: "数据删除"
        },
        {
          value: "MODIFY",
          label: "数据修改"
        },
        {
          value: "VALID",
          label: "数据生效"
        },
        {
          value: "INVALID",
          label: "数据作废"
        }
      ]
    },
    dataTriggerType: {
      component: {
        type: ComponentType.Select
      },
      selectOptions: [
        {
          value: "CREATE",
          label: "数据新增"
        },
        {
          value: "UPDATE",
          label: "数据更新"
        },
        {
          value: "DELETE",
          label: "数据删除"
        }
      ]
    }
  },
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
        dataChange: function (key: string, value: any, controller: forms.FormGroup, schemaInfo: ObjectPropertyInfo, initial:boolean) {
          // console.log('propertyDataChange', key, value);
          if (key === 'triggerObjectCode' && value) {
              controller.children.childTriggerConditionType.display = value.indexOf('.') > 0;
          }
        //   if ((key === 'triggerObjectCode' || key === 'targetObjectCode') && !initial) {
        //     controller.children.dataActions.value = [];
        //     controller.children.filterCondition.value = {};
        //   }
        //   if (!initial) {
        //     if ( key === 'triggerObjectCode' ) {
        //         controller.children.targetObjectCode.value = '';
        //     }
        // }
      }
  }
};

/**
 * 事件订阅
 * 相当于回调
 */
// const subscriptions = {

//     /**
//      * 属性数据发生变化时
//      * 可以在这个函数中改变其他属性的属性数据，比如说将其他属性设为不可见
//      * @param key 属性Key
//      * @param propertyKey 属性的属性Key
//      * @param propertyData 属性的属性数据对象
//      * @param schemaInfo 组件的纲要信息
//      * @param schemaData 组件的纲要数据
//      */
//     propertyDataChange: function (key: string, propertyData: any, schemaInfo: any, schemaData: { [key: string]: any }) {
//         console.log('propertyDataChange', key, propertyData.value);
//         // if (key === 'schemaCode') {
//         //     // schemaCode有值时显示queryCode，无值时隐藏
//         //     schemaData.queryCode.visible = !!propertyData.value;
//         // }
//         // if (key === 'visible') {
//         //     schemaData.controlName.disabled = !propertyData.value;
//         //     schemaData.controlName.value = '';
//         // }
//     }

// }

export default {
  /**
   * 控件名称
   */

  /**
   * 控件类型
   */
  type: "",

  /**
   * 控件图标
   */
  icon: "",

  /**
   * 控件图片
   */
  image: "",

  /**
   * 控件所属分组
   */

  /**
   * 控件属性配置
   */
  properties

  /**
   * 事件订阅
   */
};
