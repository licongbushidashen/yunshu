/*
 * @Author: your name
 * @Date: 2020-05-07 11:40:42
 * @LastEditTime: 2020-05-07 15:01:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\entries\admin\src\views\app\biz-rule\property-schema\node-message\schema.ts
 */
/**
 * 组件的纲要信息
 * 定义组件的属性、方法和事件
 */
export default {
  type: 'object',

  /**
   * 在属性栏是必填项
   */
  required: ['nodeCode', 'nodeName', 'receiver', 'title', 'content'],

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
    receiver: {
      type: 'object',
      title: '接收人',
      properties: {}
    },
    title: {
      type: 'array',
      title: '标题',
    },
    content: {
      type: 'array',
      title: '内容',
    },

    linkType: {
      type: 'string',
      title: '链接类型',
    },
    url: {
      type: 'string',
      title: '链接',
      hidden: true
    },
    sheetCode: {
      type: 'string',
      title: '表单',
    }
  }
}
