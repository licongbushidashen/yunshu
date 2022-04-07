/*
 * @Author: your name
 * @Date: 2020-04-14 10:22:53
 * @LastEditTime: 2020-04-14 10:27:59
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /frontend/modules/@cloudpivot/form/utils/control-attribute-transaction.ts
 */
import { ModalAttributeType } from "@cloudpivot/form/src/typings/form-attribute";
import { VNode } from "vue";

const modalTypeFilter = (type: string) => {
  let field: string = "";
  // 特殊弹窗可以做特殊处理
  switch (type) {
    case ModalAttributeType.RadioOption:
    case ModalAttributeType.CheckboxOption:
    case ModalAttributeType.BizRadioOption:
      field = "defaultValue";
      break;
    case ModalAttributeType.RegexpFormula:
      field = "regexpText";
      break;
  }
  return field;
};

/**
 *  导入
 * @param attr
 * @param attrs
 */

export const importModal = (attr: any, attrs: any) => {
  const field = modalTypeFilter(attr.attrType);
  let defaultField: any;
  if (!!field) {
    defaultField = attrs.find((item: any) => {
      return item.field === field;
    });
  }
  return {
    value: attr.value,
    default: defaultField ? defaultField.value : null,
    type: attr.options ? attr.options.modalType : null,
  };
};
/**
 *输出
 * @param data
 * @param attr
 * @param attrs
 * @param callback
 */
export const exportModal = (
  data: any,
  attr: any,
  attrs: any,
  callback: Function,
  self: VNode
) => {
  let field: string = modalTypeFilter(attr.attrType);
  if (!!field) {
    callback(field, data.default);
  }
  return data && data.value ? data.value : "";
};

/**
 * @Author: Fan
 * @Description: 控制器 必填属性侧边栏显示值 格式化
 * @URL:http://redmine.h3bpm.com/issues/31166
 * @param
 * val - 原值
 * attr - 控制器对象
 * attrs - 模型所有控制器对象
 * @return: 在侧边栏展示的值
 * @Date: 2019-12-17 14:50:01
 */
export const formatterRequiredFormula = (val: string | "") => {
  if (val) {
    if (val == "true") {
      return "是";
    } else {
      return "满足条件必填";
    }
  }
  return "否";
};

/**
 * @Author: Fan
 * @URL: http://redmine.h3bpm.com/issues/31166
 * @Description: 控制器 属性侧边栏展示值  文案是 set类型 展示的 文案类型
 * set / 属性设置了值
 * unSet/ 属性没有设置值
 * @Date: 2019-12-17 16:45:53
 */
enum setConst {
  set = "已设置",
  notSet = "未设置",
}
/**
 * @Author: Fan
 * @Description: 控制器-属性 在侧边栏显示的文案是 set类型 处理通用方法.
 * @URL: http://redmine.h3bpm.com/issues/31166
 * 支持的 属性有: 显示条件、PC/mobile查询条件、映射字段、选项、计算规则、提交校验规则、正则校验
 * @param
 * var / 原来值
 * @return:
 *  在侧边栏展示的值
 * @Date: 2019-12-17 17:04:16
 */
export const formatterValueToSetStatus = (val: string | "") => {
  try {
    let options = JSON.parse(val)
    if(Object.keys(options).includes('$queryData') && Object.keys(options).includes('queryText')){
      if(options.queryText){
        return setConst.set;
      }else{
        return setConst.notSet;
      }
    }
  } catch (error) {
    
  }
  if (val) {
    return setConst.set;
  }
  return setConst.notSet;
};
/**
 * @Author: Fan
 * @Description:图片控制器,上传数量 属性展示文字
 * @URL:http://redmine.h3bpm.com/issues/31166
 * @param
 * val/原来值
 * @return:
 * 在侧边栏展示内容
 * @Date: 2019-12-17 17:51:57
 */
export const formatterUploadImgNumber = (val: string | "") => {
  if (val == "unique") {
    return "单张";
  }
  return "多张";
};

export const formatterValueNoUp = (val: any | []) => {
  if (Array.isArray(val) && val.length > 0) {
    const name = val.length === 1 ?val[0].name:  '已上传模版';
    return name;
  }
  return '上传模板';
};

// 格式化定位
export const formatterLocations = (val: any, ctrls:any) => {
  if (val) {
    return `${val.provinceName}${val.cityName}${val.districtName}${ val.address ? val.address : '' }`
  }
  return ''
}

// 格式化地址
export const formatterAddress = (val: any, ctrls:any) => {
  const target:any = ctrls.find((item: any) => item.field === "locationType")
  if(val && val.address === '') return ''
  if(target && val !=='') {
    const showType:any = target.value
    const p = showType.indexOf('pp') > -1
    const c = showType.indexOf('cc') > -1
    const a = showType.indexOf('aa') > -1
    const addressDetail = ctrls.find((item: any) => item.field === "addressDetail")
    const showDetail = addressDetail.value === 'true'
    return `${ p ? (val.provinceName ? val.provinceName : '' ) : '' }${ c ? (val.cityName? val.cityName : '') : '' }${ a ? (val.districtName? val.districtName : '') : '' }${ showDetail ? (val.address? val.address : '') : ''}`
  }
  return ''
}
