/*
 * @Author: your name
 * @Date: 2020-05-07 11:40:42
 * @LastEditTime: 2020-05-07 19:15:40
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \frontend\entries\admin\src\views\app\biz-rule\typings\node-bill.ts
 */
import { NodeType } from './node-type';
export default  {
    nodeGroup: [
        {
            nodeType: NodeType.Message,
            nodeName: '消息通知',
            icon: '&#xe96f;',
            disabled: false
        },
        {
            nodeType: NodeType.Create,
            nodeName: '数据新增',
            icon: '&#xe8da;',
            disabled: false
        },
        {
            nodeType: NodeType.Update,
            nodeName: '数据更新',
            icon: '&#xe8c9;',
            disabled: false
        },
        {
            nodeType: NodeType.Delete,
            nodeName: '数据删除',
            icon: '&#xe8c5;',
            disabled: false
        },
        {
            nodeType: NodeType.LogicVerify,
            nodeName: '逻辑校验',
            icon: '&#xe907;',
            disabled: false
        },
        {
            nodeType: NodeType.BizAction,
            nodeName: '业务方法',
            icon: '&#xe8e0;',
            disabled: false
        },
        {
            nodeType: NodeType.Assign,
            nodeName: '数据赋值',
            icon: '&#xe91c;',
            disabled: false
        },
        {
            nodeType: NodeType.DataCheck,
            nodeName: '数据校验',
            icon: '&#xe8fd;',
            disabled: false
        },
        {
            nodeType: NodeType.ExistVerify,
            nodeName: '数据判断',
            icon: '&#xea0e;',
            disabled: false
        }
    ]
}