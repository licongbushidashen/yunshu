import { PropertyDisplaySettings, PropertyInfo } from '@h3/designer-core/property-panel';

import * as forms from 'h3-forms'

export interface SelectOption {

    value: string | number

    label: string

}


export interface SelectPropertySettings extends PropertyDisplaySettings {

    selectOptions: SelectOption[] | ((key: string, value: any, controller: forms.FormGroup, propInfo: PropertyInfo, $i18n: any) => SelectOption[])
}


export enum ComponentType {

    Input = 'AInput',

    InputNumber = 'AInputNumber',

    Switch = 'ASwitch',

    Select = 'ASelect',

    Textarea = 'ATextarea',

    /**
     * 日期选取器
     */
    DatePicker = 'ADatePicker',

    /**
     * 颜色选取器
     */
    ColorPicker = 'ColorPicker',

    /**
     * 边框选取器
     * 大小、颜色、四边
     */
    BorderPicker = 'BorderPicker',

    /**
     * 字体样式选取器
     * 大小、颜色、加粗、斜体
     */
    FontStylePicker = 'AFontStylePicker',

    /**
     * 文本对齐选取器
     * 水平、垂直
     */
    TextPositionPicker = 'ATextPositionPicker',

    /**
     * 水平对齐单选
     */
    TextAlignRadio = 'TextAlignRadio',

    /**
     * 垂直对齐单选
     */
    VerticalAlignRadio = 'VerticalAlignRadio',

    /**
     * 文本装饰单选
     * 下划线、删除线
     */
    TextDecorationRadio = 'TextDecorationRadio',

    /**
     * 背景设置器
     */
    BackgroundSetter = 'BackgroundSetter',

    /**
     * 边框设置器
     */
    BorderSetter = 'BorderSetter',

    /**
     * 盒模型设置器
     */
    BoxModal = 'BoxModal',

    /**
     * 字体属性
     */
    FontStyle = 'FontStyle'
}
