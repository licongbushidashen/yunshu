/*
 * @Author: Fan
 * @Date: 2020-04-14 17:08:04
 * @LastEditTime: 2020-04-30 11:15:26
 * @LastEditors: Fan
 * @Description: 组件资源获取
 * @FilePath: /frontend/modules/@cloudpivot/form/utils/component-assets.ts
 */
import { register } from "@cloudpivot/form/utils/register";
import {
  ComponentAsset,
  PropertyInfo,
  DataType,
} from "@cloudpivot/form/typings";
import { DataItemType } from "@cloudpivot/form/schema";
/**
 * @Author: Fan
 * @Date: 2020-04-14 17:20:49
 * @description: 获取组件资源
 * @LastEditors: Fan
 */
function getComponentAssets(): { [key: string]: ComponentAsset } {
  return register.getAssets();
}

/**
 * @Author: Fan
 * @Date: 2020-04-25 19:59:21
 * @description: 获取 组件 type-formControllerType 关系对象
 * @return:
 * @LastEditors: Fan
 */
function getComponentsTypeAndFormControllerType() {
  let assets = getComponentAssets();
  let ob: any = {};
  for (let key of Object.keys(assets)) {
    let { info } = assets[key];
    ob[`a-${info.type}`] = +info.formControllerType;
  }
  return ob;
}

/**
 * @Author: Fan
 * @Date: 2020-04-23 16:55:07
 * @description: 按照 组件group 获取组件的 info信息
 * @param {type}
 * @return: 根据 info 中的 group分组配置 {group:{formControllerType: info}}
 * @LastEditors: Fan
 */
function getComponentsInfo() {
  let assets = getComponentAssets();
  let group: any = {};
  for (let key of Object.keys(assets)) {
    let { info } = assets[key];
    if (!!info.group) {
      if (!group[info.group]) group[info.group] = {};
      group[info.group][info.formControllerType + ""] = { ...info };
    }
  }
  return group;
}

/**
 * @Author: Fan
 * @Date: 2020-04-14 17:40:15
 * @description: 根据 组件控制器类型编码 获取 数据项类型编码
 * @param {type} formControllerType
 * @return:
 * @LastEditors: Fan
 */
function getDataItemTypeByControlType(
  formControllerType: number
): number | undefined {
  let assets = getComponentAssets();
  for (let key of Object.keys(assets)) {
    let { info } = assets[key];
    if (info.formControllerType === formControllerType) {
      return info.dataItemType;
    }
  }
  return DataItemType.ShortText;
}
/**
 * @Author: Fan
 * @Date: 2020-04-14 19:34:33
 * @description: 通过 组件控制器类型编码 获取 组件options
 * @param {type} formControllerType
 * @return: 组件控制器的options
 * @LastEditors: Fan
 */
function getComponentOptionsByControlType(formControllerType: number) {
  let assets = getComponentAssets();
  for (let key of Object.keys(assets)) {
    let { info, schema } = assets[key];
    if (info.formControllerType === formControllerType) {
      let options: any = {};
      for (let proKey of Object.keys(schema.properties)) {
        let item = schema.properties[proKey] as PropertyInfo;
        switch (item.type) {
          case DataType.String:
          case DataType.Number:
          case DataType.Integer:
          case DataType.Object:
            if (item.default) {
              options[proKey] = item.default;
            } else {
              options[proKey] = "";
            }
            if (item.default === "true" || item.default === "false") {
              console.warn(
                `不要在字符串类型变量使用 ${item.default}, 请使用 Boolean类型`
              );
            }
            break;
          case "boolean":
            if (item.default) {
              options[proKey] = item.default;
            } else {
              options[proKey] = false;
            }
            break;
          case DataType.Array:
            if (item.default) {
              options[proKey] = item.default;
            } else {
              options[proKey] = [];
            }
            break;
          default:
            if (item.default) {
              options[proKey] = item.default;
            } else {
              options[proKey] = "";
            }
        }
      }
      return options;
    }
  }
}
/**
 * @Author: Fan
 * @Date: 2020-04-14 21:13:19
 * @description: 获取组件 设计时展示控件
 * @param {type} formControllerType 组件控制器类型编码
 * @return:
 * @LastEditors: Fan
 */
function getDesignComponentByControlType(formControllerType: number) {
  let assets = getComponentAssets();
  for (let key of Object.keys(assets)) {
    let { info, components } = assets[key];
    if (info.formControllerType === formControllerType) {
      return components.design;
    }
  }
}
/**
 * @Author: Fan
 * @Date: 2020-04-21 16:30:51
 * @description: 根据控制器类型编码 获取 组件pc端使用的控件
 * @param {type}
 * @return:
 * @LastEditors: Fan
 */
function getPcComponentByControlType(formControllerType: number) {
  // 
  let assets = getComponentAssets();
  for (let key of Object.keys(assets)) {
    let { info, components } = assets[key];
    if (info.formControllerType === formControllerType) {
      return { pc: components.pc, key: info.type };
    }
  }
}
/**
 * @Author: Fan
 * @Date: 2020-04-21 17:16:58
 * @description: 根据控制器类型编码 获取移动端组件
 * @param {type} formControllerType 控制器类型编码
 * @return:
 * @LastEditors: Fan
 */
function getMobileComponentByControlType(formControllerType: number) {
  let assets = getComponentAssets();
  for (let key of Object.keys(assets)) {
    let { info, components } = assets[key];
    if (info.formControllerType === formControllerType) {
      return { mobile: components.mobile, key: info.type };
    }
  }
}

/**
 * @Author: Fan
 * @Date: 2020-04-15 14:40:38
 * @description: 获取组件 conduct(行为) 通过控制类型编码
 * @param {type}
 * @return:
 * @LastEditors: Fan
 */
function getConductByControlType(formControllerType: number) {
  let assets = getComponentAssets();
  for (let key of Object.keys(assets)) {
    let { info, conduct } = assets[key];
    if (info.formControllerType === formControllerType) {
      return conduct;
    }
  }
}
/**
 * @Author: Fan
 * @Date: 2020-04-15 15:36:49
 * @description: 获取组件 schema 通过控制类型编码
 * @param {type}
 * @return:
 * @LastEditors: Fan
 */
function getSchemaByControlType(formControllerType: number) {
  let assets = getComponentAssets();
  for (let key of Object.keys(assets)) {
    let { info, schema } = assets[key];
    if (info.formControllerType === formControllerType) {
      return schema;
    }
  }
}

/**
 * @Author: Fan
 * @Date: 2020-04-15 16:39:33
 * @description: 通过组件控制器类型编码 获取组件信息
 * @param {type} formControllerType
 * @return:
 * @LastEditors: Fan
 */
function getComponentByControlType(formControllerType: number) {
  let assets = getComponentAssets();
  for (let key of Object.keys(assets)) {
    let { info, schema } = assets[key];
    if (info.formControllerType === formControllerType) {
      return assets[key];
    }
  }
}
/**
 * @Author: Fan
 * @Date: 2020-04-25 20:33:19
 * @description: 格式化 组件的key
 * @param {type}
 * @return:
 * @LastEditors: Fan
 */
function formatterComponentType(key: string) {
  return `shu-${key}`;
}

/**
 * @Author: Fan
 * @Date: 2020-04-26 17:17:47
 * @description: 获取组件的 type
 * @param {type}
 * @return:
 * @LastEditors: Fan
 */
function getComponentTitleByControlType(formControllerType: number): string {
  let assets = getComponentByControlType(formControllerType);
  if (assets) {
    return assets.info.title;
  }
  console.error(`未找到 ${formControllerType}类型的组件`);
  return "";
}

export {
  getComponentAssets,
  getDataItemTypeByControlType,
  getComponentOptionsByControlType,
  getDesignComponentByControlType,
  getConductByControlType,
  getSchemaByControlType,
  getComponentByControlType,
  getPcComponentByControlType,
  getMobileComponentByControlType,
  getComponentsInfo,
  getComponentsTypeAndFormControllerType,
  formatterComponentType,
  getComponentTitleByControlType,
};
