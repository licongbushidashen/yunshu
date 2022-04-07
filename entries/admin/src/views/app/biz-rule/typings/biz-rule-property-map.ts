
import { NodeType } from './node-type';
export interface Property {
    [key: string]: any
}
import { schema } from "@cloudpivot/form";

export class BizRuleProperty implements Property {
    // 消息提醒节点
    'MESSAGE': {
        // 接收人
        'receiver': {
            type: 'array',
            controlType: schema.FormControlType.StaffSelector,
            items: {
                type: 'user'
            },
        },
        // 数据标题
        'dataTitle': {
            type: 'array',
            controlType: schema.FormControlType.Text,
            items: {
                type: 'any'
            },
        },
        // 通知内容
        'notice': {
            type: 'string',
            controlType: schema.FormControlType.Text,
        }
        required: ['receiver', 'dataTitle', 'notice']
    }
}
