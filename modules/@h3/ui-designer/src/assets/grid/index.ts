
import { ComponentAsset, ComponentInfo } from '@h3/designer-core'

import * as schema from './schema'

// import settings from './settings'

const gridType = 'grid';
const gridColType = 'gridCol';

export const grid = {
    info: {
        title: '栅格',
        type: gridType,
        requireChildTypes: [gridColType],
        icon: 'file-text',
        group: 'basic',
        container: true
    },
    schema: schema.grid,
    // settings,
    component: () => import('./grid.vue')

} as ComponentAsset

export const gridCol = {
    info: {
        title: '栅格子列',
        type: gridColType,
        requireParentTypes: [gridType],
        icon: 'file-text',
        container: true,
        // full: true
    },
    schema: schema.gridCol,
    // settings,
    component: () => import('./grid-col.vue')

} as ComponentAsset