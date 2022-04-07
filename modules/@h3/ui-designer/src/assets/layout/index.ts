
import { ComponentAsset, ComponentInfo } from '@h3/designer-core'

import * as schema from './schema'

// import settings from './settings'

const layoutType = 'layout';
const layoutPanelType = 'layoutPanel';

export const layout = {
    info: {
        title: '布局',
        type: layoutType,
        requireChildTypes: [layoutPanelType],
        icon: 'file-text',
        group: 'basic',
        container: true,
        full: true
    },
    schema: schema.layout,
    // settings,
    component: () => import('./layout.vue')

} as ComponentAsset

export const layoutPanel = {
    info: {
        title: '布局面板',
        type: layoutPanelType,
        requireParentTypes: [layoutType],
        icon: 'file-text',
        container: true,
        // full: true
    },
    schema: schema.panel,
    // settings,
    component: () => import('./layout-panel.vue')

} as ComponentAsset