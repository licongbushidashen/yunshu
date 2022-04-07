
import { ObjectPropertyInfo } from '@h3/designer-core'

import { ComponentType } from '../typings'

export default {
    $id: ComponentType.BackgroundSetter,
    type: 'object',
    title: '背景样式',
    properties: {
        width: {
            type: 'string',
            title: '宽',
            default: '100%'
        },
        height: {
            type: 'string',
            title: '高',
            default: '100%'
        },
        color: {
            type: 'string',
            title: '颜色'
        },
        opacity: {
            type: 'number',
            title: '透明度',
            default: 100
        }
    }
}