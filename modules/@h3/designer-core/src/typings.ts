
import { VueConstructor } from 'vue';

import { DataType, ObjectPropertyInfo, PropertyInfo } from './schema-typings';

export * from './schema-typings';

import * as forms from 'h3-forms'

export interface ComponentAsset {

    info: ComponentInfo

    schema: ObjectPropertyInfo

    settings?: ComponentSettings

    /**
     * 运行态组件
     */
    component: VueConstructor<any> | (() => Promise<typeof import('*.vue')>)

    /**
     * 设计态组件
     */
    design?: VueConstructor<any> | (() => Promise<typeof import('*.vue')>)

}


export interface ComponentSettings {

    /**
     * 控件属性配置
     */
    properties: PropertiesSettings
}


export interface ComponentInfo {

    /**
     * 控件名称
     */
    title: string

    /**
     * 控件类型
     */
    type: string

    /**
     * 控件图标
     */
    icon: string

    /**
     * 控件图片
     */
    image?: string

    /**
     * 控件所属分组
     */
    group?: string

    container?: boolean

    /**
     * height 100%
     */
    full?: boolean

    requireChildTypes? : string[]

    requireParentTypes? : string[]
}


export interface PropertiesSettings {

    groups?: PropertyGroupInfo[]

    display?: { [key: string]: PropertyDisplaySettings }

    /**
     * 事件订阅
     */
    subscription?: PropertyEventSubscription

}


export interface PropertyDisplaySettings {

    component?: {
        type?: string,
        options?: { [key: string]: any }
    }

    formatter?: (key: string, value: any, controller: forms.FormGroup, schemaInfo: ObjectPropertyInfo, $i18n: any) => string
}


export interface GroupInfo {

    label: string

    value: string
}


export interface PropertyGroupInfo extends GroupInfo {

    keys: string[]
}


export interface PropertyEventSubscription {

    dataChange?: (key: string, value: any, controller: forms.FormGroup, schemaInfo: ObjectPropertyInfo, initial:boolean) => void

}


export interface PropertyData {

    title?: string

    format?: string

    type: DataType

    nullable: boolean

    required: boolean

    hidden: boolean

    disabled: boolean

    value: any

    default?: any
}


export interface EnvironmentVariable {

    locale: string

}


export interface PropertiesData {

    [key: string]: PropertyData

}


export enum Direction{

    None = 'none',

    /**
     * 北
     */
    North = 'north',

    /**
     * 中
     */
    Center = 'center',

    /**
     * 南
     */
    South = 'south',

    /**
     * 东
     */
    East = 'east',

    /**
     * 西
     */
    West = 'west'
}