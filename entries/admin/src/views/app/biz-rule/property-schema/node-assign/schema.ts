/**
 * 组件的纲要信息
 * 定义组件的属性、方法和事件
 */
export default {
    type: 'object',

    /**
     * 在属性栏是必填项
     */
    required: ['nodeCode', 'nodeName', 'triggerObjectCode', 'filterCondition', 'dataActions'],

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
            title: '目标模型',
        },
        filterCondition: {
            type: 'object',
            title: '数据条件',
            properties: {}
        },
        dataActions: {
            type: 'array',
            title: '赋值设置'
        }
    }
}
