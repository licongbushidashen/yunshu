
import { ObjectPropertyInfo } from '@h3/designer-core'

import backgroundSetter from '../../property-panel/background-setter/schema'

export default {
    type: 'object',
    properties: {
        title:{
            type: 'string',
            title: '标题'
        },
        backgroundSetter: {
            title: '背景',
            $ref: backgroundSetter.$id,
        },
        borderSetter:{
            type: 'object',
            title: '边框',
            properties: {
                'border-top-left-radius':{
                    type: 'string',
                    default: '0px',
                    title: '圆角'
                },
                'border-top-right-radius':{
                    type: 'string',
                    default: '0px',
                },
                'border-bottom-left-radius':{
                    type: 'string',
                    default: '0px',
                },
                'border-bottom-right-radius':{
                    type: 'string',
                    default: '0px',
                },
                'border-width': {
                    type: 'string',
                    default: '1px',
                    title: '宽',
                },
                'border-style': {
                    type: 'string',
                    default: 'none',
                    title: '线型',
                },
                'border-color': {
                    type: 'string',
                    default: '#333',
                    title: '颜色',
                },
                borderSides: {
                    // type: 'object',
                    default: ['top','left','right','bottom']
                }
            }
        },
        fontStyle:{
            type: 'object',
            title: '字体属性',
            properties: {
                fontFamily:{
                    type: 'string',
                    title: '语言',
                    default: 'Microsoft YaHei'
                },
                fontSize:{
                    type: 'string',
                    title: '大小',
                    default: '14px'
                },
                fontWeight:{
                    type: 'string',
                    title: '粗细'
                },
                fontColor:{
                    type: 'string',
                    title: '颜色'
                },
                textDecoration:{
                    type: 'string',
                    title: '修饰'
                },
                textAlign:{
                    type: 'string',
                    title: '对齐'
                },
                textTransform:{
                    type: 'string',
                    title: '大小写'
                }
            }
        },

    }
} as ObjectPropertyInfo