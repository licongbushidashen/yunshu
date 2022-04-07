
import { register } from '@h3/designer-core'

import Collapse from './collapse.vue'
import DesignerElement from './designer-element.vue'

register.components = {
    Collapse,
    DesignerElement
};


import assets from './assets'

assets.forEach(asset => register.assets[asset.info.type] = asset);


register.groups = [{
    label: '基础',
    value: 'basic'
}]


import Designer from './designer.vue'

export {
    register,
    Designer
}