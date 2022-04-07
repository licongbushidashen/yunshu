
import { ComponentAsset, ComponentInfo } from '@h3/designer-core'

import schema from './schema'

import settings from './settings'

import component from './text.vue'

const info: ComponentInfo = {
    title: '文本',
    type: 'aText',
    icon: 'file-text',
    group: 'basic'
}

export default {
    info,
    schema,
    settings,
    component

} as ComponentAsset