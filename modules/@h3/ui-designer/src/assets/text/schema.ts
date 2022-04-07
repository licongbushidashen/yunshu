
import { ObjectPropertyInfo } from '@h3/designer-core'

export default {
    type: 'object',
    properties: {
        boxModal: {
            type: 'object',
            title: '盒模型',
            properties: {
                'width':{
                    type: 'string',
                    default: '100%',
                },
                'height':{
                    type: 'string',
                    default: 'auto',
                },
                'border-top-width':{
                    type: 'number',
                    default: 0,
                },
                'border-right-width':{
                    type: 'number',
                    default: 0,
                },
                'border-bottom-width':{
                    type: 'number',
                    default: 0,
                },
                'border-left-width':{
                    type: 'number',
                    default: 0,
                },
                'margin-top': {
                    type: 'number',
                    default: 0,
                },
                'margin-right': {
                    type: 'number',
                    default: 0,
                },
                'margin-bottom': {
                    type: 'number',
                    default: 0,
                },
                'margin-left': {
                    type: 'number',
                    default: 0,
                },
                'padding-top': {
                    type: 'number',
                    default: 0,
                },
                'padding-right': {
                    type: 'number',
                    default: 0,
                },
                'padding-bottom': {
                    type: 'number',
                    default: 0,
                },
                'padding-left': {
                    type: 'number',
                    default: 0,
                }
            }
        },
        content: {
            type: 'string',
            title: '文本内容',
            default: '文本'
        },
        type: {
            type: 'string',
            title: '文本类型',
            enum: ['text', 'title', 'link'],
            default: 'text'
        },
        fontSize: {
            type: 'string',
            title: '字体大小'
        },
        lineHight: {
            type: 'string',
            title: '行高'
        },
        textDecoration: {
            type: 'string',
            title: '文本装饰',
            default: 'none'
        },
        fontColor: {
            type: 'string',
            title: '字体颜色',
            default: '#333333'
        },
        textAlign: {
            type: 'string',
            title: '对齐方式',
            enum: ['left', 'center', 'right'],
            default: 'left'
        },
        wordBreak: {
            type: 'boolean',
            title: '自动换行'
        },
        borderStyle: {
            type: 'string',
            title: '边框线型',
            enum: ['none','solid', 'dotted', 'dashed', 'double'],
            default: 'none'
        },
        borderColor: {
            type: 'string',
            title: '边框颜色',
            default: '#333333'
        }

    }
} as ObjectPropertyInfo