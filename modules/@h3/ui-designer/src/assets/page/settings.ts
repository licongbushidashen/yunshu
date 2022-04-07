

import { ComponentSettings, PropertiesSettings } from '@h3/designer-core'

import { ComponentType } from '@h3/ui-designer/property-panel'

const properties = {

    display: {
        backgroundSetter:{
            component:{
                type: ComponentType.BackgroundSetter
            }
        },
        borderSetter:{
            component:{
                type: ComponentType.BorderSetter
            }
        },
        fontStyle:{
            component:{
                type: ComponentType.FontStyle
            }
        }
    }

}

export default {

    /**
     * 属性设置
     */
    properties

} as ComponentSettings

