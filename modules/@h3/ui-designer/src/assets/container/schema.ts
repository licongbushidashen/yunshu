
import { ObjectPropertyInfo } from '@h3/designer-core'

export default {
    type: 'object',
    properties: {
        minHeight:{
            type: 'string',
            title: '最小高度',
            default: '60px'
        },
        autoWidth:{
            type: 'boolean',
            title: '自动宽度开关',
            default: true
        },
        width:{
            type: 'string',
            title: '宽度',
            hidden: true
        }
    }
} as ObjectPropertyInfo