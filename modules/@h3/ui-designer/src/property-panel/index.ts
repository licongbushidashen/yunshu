
import { register, DataType, PropertyInfo, StringPropertyInfo, StringFormat, PropertyDisplaySettings, EnumPropertyInfo, RefPropertyInfo, ComponentItem } from '@h3/designer-core/property-panel';

import { ComponentType } from './typings'

export {
  register,
  ComponentType
}

import AInput from './input.vue'
import AInputNumber from './input-number.vue'
import ASelect from './select.vue'
import ASwitch from './switch.vue'
import ATextarea from './textarea.vue'

register.components = {
  AInput,
  ASelect,
  AInputNumber,
  ASwitch,
  ATextarea,
  [ComponentType.ColorPicker]: () => import('./color-picker/color-picker.vue'),
  [ComponentType.TextAlignRadio]: () => import('./text/text-align-radio.vue'),
  [ComponentType.VerticalAlignRadio]: () => import('./text/vertical-align-radio.vue'),
  [ComponentType.TextDecorationRadio]: () => import('./text/text-decoration-radio.vue'),
  // [ComponentType.BackgroundSetter]: () => import('./background-setter.vue'),
  [ComponentType.BorderSetter]: () => import('./border-setter.vue'),
  [ComponentType.BoxModal]: () => import('./box-modal.vue'),
  [ComponentType.FontStyle]: () => import('./font-style.vue'),
};


import backgroundSetter from './background-setter'

register.packages = {
  [backgroundSetter.schema.$id]: backgroundSetter
};


register.componentMap = (propertyInfo: PropertyInfo, displaySettings?: PropertyDisplaySettings) => {

  if (displaySettings && displaySettings.component && displaySettings.component.type) {
    return displaySettings.component.type;
  }

  let name = '';

  const { type } = propertyInfo as PropertyInfo;

  if (type === DataType.Boolean) {
    name = ComponentType.Switch;

  } else if (type === DataType.Integer || type === DataType.Number) {
    name = ComponentType.InputNumber;

  } else if (type === DataType.String) {
    const stringPropInfo = propertyInfo as StringPropertyInfo;

    if (stringPropInfo.format) {

      switch (stringPropInfo.format) {

        case StringFormat.Date:
        case StringFormat.DateTime:
        case StringFormat.Time:
          name = ComponentType.DatePicker;
          break;

        default:
          name = ComponentType.Input;
          break;
      }

    } else if ((propertyInfo as EnumPropertyInfo).enum) {
      name = ComponentType.Select;
    } else {
      name = ComponentType.Input;
    }

  }

  return name;
}