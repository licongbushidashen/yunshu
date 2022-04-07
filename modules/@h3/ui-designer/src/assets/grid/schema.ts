
import { ObjectPropertyInfo, DataType } from '@h3/designer-core'

// export enum SpanType{

//     '12:12' = 12, 
//     '8:16', 
//     '16:8', 
//     '8:8:8', 
//     '6:12:6', 
//     '6:6:6:6', 
//     '4:12:4:12'

// }

export const grid = {
    type: DataType.Object,
    properties: {
        spanType: {
            type: 'string',
            enum: ['12:12', '8:16', '16:8', '8:8:8', '6:12:6', '6:6:6:6', '4:8:4:8'],
            title: '分栏样式',
            default: '12:12'
        },
        minHeightSwitch: {
            type: 'boolean',
            title: '最小高度开关',
            default: true
        },
        minHeight: {
            type: 'string',
            title: '最小高度',
            default: '60px'
        }
    }
} as ObjectPropertyInfo


export const gridCol = {

    type: DataType.Object,
    properties: {

    }

} as ObjectPropertyInfo