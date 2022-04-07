
import { ComponentAsset, ComponentInfo } from '@h3/designer-core'

import schema from './schema'

import settings from './settings'

const component = () => import('./page.vue')

const info: ComponentInfo = {
    title: '页面',
    type: 'page',
    icon: 'file-text',
    container: true
}

export default {
    info,
    schema,
    settings,
    component

} as ComponentAsset