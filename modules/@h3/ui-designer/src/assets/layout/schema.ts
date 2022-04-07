
import { ObjectPropertyInfo, DataType } from '@h3/designer-core'

export const layout = {
    type: DataType.Object,
    properties: {

    }
} as ObjectPropertyInfo


export const panel = {

    type: DataType.Object,
    properties: {
        direction: {
            type: DataType.String,
            hidden: true
        },
        basis: {
            title: '基础',
            type: DataType.Integer,
            default: 100
        },
    }

} as ObjectPropertyInfo