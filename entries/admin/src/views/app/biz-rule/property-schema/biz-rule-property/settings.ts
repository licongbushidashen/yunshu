
// import { PropertyData, ObjectPropertyInfo, EnvironmentVariable } from '../../meta';

import { ComponentSettings, ObjectPropertyInfo, PropertyInfo } from '@h3/designer-core'

import { ComponentType } from '@h3/ui-designer/property-panel';

import { BizRuleType } from '../../typings/node-type';

import * as forms from 'h3-forms';

const properties = {

    /**
     * 属性的分组
     */
    // groups: [{
    //     value: 'base',
    //     label: '基础属性',
    //     keys: ['controlName', 'visible']
    // }, {
    //     value: 'control',
    //     label: '控件属性',
    //     keys: ['displayFormula', 'requiredFormula', 'schemaCode', 'queryCode', 'selectMode']
    // }],

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
        // displayFormula: {

        //     /**
        //      * 组件类型，可自定义类型，但需注册对应的自定义组件
        //      */
        //     component:{
        //         type: 'LogicExpression'
        //     },

        //     /**
        //      * 显示在界面时的格式化函数
        //      * @param schemaInfo 组件纲要信息
        //      * @param propertyData 组件属性数据
        //      * @param env 环境信息
        //      */
        //     formatter: function (propertyData: any, schemaInfo: any, env: any) {
        //         return '';
        //     }

        // },
        // requiredFormula: {
        //     componentType: 'requiredCondition',
        // },
        // schemaCode: {
        //     componentType: 'modelTree',
        // },

        bizRuleType: {
            component:{
                type: ComponentType.Select
            },
            selectOptions: [{
                value: 0,
                label: "数据操作"
            }, {
                value: 1,
                label: "获取集合"
            },
            {
                value: 2,
                label: "定时任务"
            }]
        },
        schedulerSetting: {
            component:{
                type: 'TimingTask',
                options: {
                    dataItems: []
                }
            }
        },
        bizMethodMappingModel: {
            component:{
                type: 'BindBizMethod',
                options: {
                    dataItems: [],
                    actionType: 'TimingTask'
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
        dataChange: function (key: string, value: any, controller: any, schemaInfo: ObjectPropertyInfo) {
            // console.log('propertyDataChange', key, value, controller);
            if (key === 'bizRuleType') {
                if (value === BizRuleType.RegularOperation) {
                    controller.children.schedulerSetting.display = true;
                }
            }
        }
    }
}

export default {

    /**
     * 属性设置
     */
    properties

} as ComponentSettings

