
import { ComponentAsset, ComponentInfo } from '@h3/designer-core'

import schema from './schema'

// import settings from './settings'

const component = () => import('./container.vue')

const info: ComponentInfo = {
    title: '容器',
    type: 'container',
    icon: 'file-text',
    group: 'basic',
    container: true
}

export default {
    info,
    schema,
    // settings,
    component

} as ComponentAsset