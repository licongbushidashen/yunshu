/**
 * 组件的纲要信息
 * 定义组件的属性、方法和事件
 */
export default {
    type: 'object',

    /**
     * 在属性栏是必填项
     */
    required: ['nodeCode', 'nodeName', 'triggerObjectCode', 'childTriggerConditionType', 'targetObjectCode', 'targetSchema', 'createDataAction', 'dataActions'],

    /**
     * 组件所有属性
     */
    properties: {
        nodeCode: {
            type: 'string',
            title: '节点编码'
        },
        nodeName: {
            type: 'string',
            title: '节点名称',
        },
        triggerObjectCode: {
            type: 'string',
            title: '触发对象',
        },
        // 子表触发条件
        childTriggerConditionType: {
            type: 'string',
            title: '子表触发条件',
            hidden: true
        },
        // dataCondition: {
        //     type: 'object',
        //     title: '数据条件',
        //     properties: {}
        // },
        dataCondition: {
            AnyValue:true,
            title: '数据条件'
        },
        targetSchema: {
            type: 'object',
            title: '目标模型',
            properties: {

            }
        },
        targetObjectCode: {
            type: 'string',
            title: '目标对象',
        },
        // 触发动作类型
        dataTriggerType: {
            type: 'string',
            title: '触发动作',
            disabled: true
        },
        filterCondition: {
            type: 'object',
            title: '过滤条件',
            properties: {}
        },
        // 数据新增动作
        createDataAction: {
            type: 'object',
            title: '新增数据动作',
            properties: {

            }
        },
        // 更新数据动作
        dataActions: {
            type: 'object',
            title: '更新数据动作',
            hidden: true,
            properties: {

            }
        }
    }
}
