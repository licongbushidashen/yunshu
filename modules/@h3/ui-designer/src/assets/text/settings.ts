

import { ComponentSettings, PropertiesSettings } from '@h3/designer-core'

import { ComponentType } from '@h3/ui-designer/property-panel'

const properties = {

    display: {
        boxModal:{
            component:{
                type: ComponentType.BoxModal
            }
        },
        content:{
            component:{
                type: ComponentType.Textarea
            }
        },
        type: {
            component:{
                type: ComponentType.Select
            },
            selectOptions: [{
                value: "text",
                label: "文本"
            }, {
                value: "title",
                label: "标题"
            }, {
                value: "link",
                label: "链接"
            }]
        },
        textAlign: {
            component:{
                type: ComponentType.TextAlignRadio
            },
            // component:{
            //     type: ComponentType.Select
            // },
            // selectOptions: [{
            //     value: "left",
            //     label: "左"
            // }, {
            //     value: "center",
            //     label: "中"
            // }, {
            //     value: "right",
            //     label: "右"
            // }]
        },
        textDecoration:{
            component:{ 
                type: ComponentType.TextDecorationRadio
            }
        },
        fontColor: {
            component:{ 
                type: ComponentType.ColorPicker,
                // options: {
                //     icon: 'font-colors'
                // }
            }
        },
        borderStyle: {
            component:{
                type: ComponentType.Select
            },
            // selectOptions: [{
            //     value: "none",
            //     label: "无"
            // }, {
            //     value: "minus",
            //     label: "minus"
            // }, {
            //     value: "dash",
            //     label: "dash"
            // }, {
            //     value: "small-dash",
            //     label: "small-dash"
            // }]
        },
        borderColor: {
            component:{ 
                type: ComponentType.ColorPicker,
                // options: {
                //     icon: 'edit'
                // }
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

