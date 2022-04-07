import { DataItemType, FormControlType } from "./schema";
import { Component, AsyncComponent } from "vue";
export interface ComponentInfo {
  /**
   * 控件名称
   */
  title: string;

  /**
   * 控件类型
   */
  type: string;
  /**
   * 数据项类型
   */
  dataItemType?: DataItemType;
  /**
   * 控制器类型
   */
  formControllerType: number;
  /**
   * 强制替换原生组件. ps.布局控件无法被替换.
   */
  force?: boolean;
  /**
   * 控件图标
   */
  icon?: string;

  /**
   * 控件图片
   */
  image?: string;

  /**
   * 控件所属分组
   */
  group?: string;
}
export interface PropertyInfo {
  title?: string;

  type?: string;

  default?: any;
  // nullable?: boolean;

  // readOnly?: boolean;

  // writeOnly?: boolean;
}
export interface ObjectPropertyInfo extends PropertyInfo {
  $id: string;
  $ref?: string;
  properties: {
    [key: string]: PropertyInfo; //AnyValuePropertyInfo
  };

  // actions?: { [key: string]: ActionInfo };

  // required?: string[];

  /**
   * Map类型
   * true表示值类型可以是任何类型
   */
  // additionalProperties?: boolean | PropertyInfo;
}

export interface RefPropertyInfo {
  $ref: string;

  title?: string;

  nullable?: boolean;

  readOnly?: boolean;

  writeOnly?: boolean;

  default?: any;
}
export interface AnyValuePropertyInfo {
  AnyValue: boolean;
}
export enum DataType {
  Object = "object",

  String = "string",

  Boolean = "boolean",

  Integer = "integer",

  Array = "array",

  Number = "number",
}

export interface ComponentAsset {
  info: ComponentInfo;

  schema: ObjectPropertyInfo;

  conduct: ControllerConduct;

  /**
   * 组件 design/设计时 pc/电脑端浏览器 mobile/移动端h5
   */
  components: {
    design: Component<any, any, any, any> | AsyncComponent<any, any, any, any>; // VueConstructor<Vue> | (() => Promise<typeof import('*.vue')>)
    pc?: Component<any, any, any, any> | AsyncComponent<any, any, any, any>;
    mobile?: Component<any, any, any, any> | AsyncComponent<any, any, any, any>;
  };
}

export enum StringFormat {
  /**
   * 日期
   */
  Date = "date",

  /**
   * 日期+时间
   */
  DateTime = "date-time",

  /**
   * 时间
   */
  Time = "time",

  /**
   * 持续时间
   */
  Duration = "duration",

  Password = "password",

  /**
   * base64-encoded
   */
  Byte = "byte",

  /**
   * 文件上传格式
   * binary file contents
   */
  Binary = "binary",

  Email = "email",

  Uuid = "uuid",

  Uri = "uri",

  Hostname = "hostname",

  IPv4 = "ipv4",

  IPv6 = "ipv6",
}

export enum NumberFormat {
  Int32 = "int32",

  Int64 = "int64",

  Float = "float",

  Double = "double",
}
// export interface ActionInfo {
//   name: string;

//   http?: string;

//   parameters?: ParameterInfo[];

//   return?: PropertyInfo | OneOfPropertyInfo;
// }
export interface StringPropertyInfo extends PropertyInfo {
  format?: StringFormat;

  minLength?: number;

  maxLength?: number;

  pattern?: string;
}

export interface EnumPropertyInfo extends PropertyInfo {
  enum: string[];
}

export interface NumberPropertyInfo extends PropertyInfo {
  format?: NumberFormat;

  minimum?: number;

  maximum?: number;

  exclusiveMinimum?: boolean;

  exclusiveMaximum?: boolean;
}

export interface ControllerOptions {
  dateFormat?: string; // 时间格式
  formatter?: Function; //格式化 （value, attr: ControlAttributeOptions, attrs: ControlAttributeOptions[]）
  regexps?: any; // 文本正则匹配 regexp message
  maxLength?: number; // 最长文本数量
  pickerOptions?: any; // 用户控件配置项
  disabled?: Boolean; // 当前控件是否可以交互
  dataList?: Function; // 通过函数获取下拉控件值
  list?: any; // 下拉控件值
  fieldDisplay?: Array<Array<string>>; // 针对于Bool类型 需要显示或者隐藏字段 根据当前value [ [],[] ] 0 是true是需要隐藏的字段，1 是false 需要隐藏的字段
  hideField?: Function | string[]; // 所有控件需要隐藏字段的方法 fun返回一个字符串数组 或者 字段数字
  transaction?: Function; //事务处理 { attr，attrs, displayFields, allControls}
  callback?: Function; //事件回调
  modalType?: string; // 弹窗子类型
  importModal?: Function; //弹窗输入重载  return {value:value, default:default};
  exportModal?: Function; ///弹窗输出重载 return data: any;
  allowClear?: boolean; // 下拉框鼠标移上去可删除
}

/**
 * 控件属性值类型
 */
export enum ControlAttributeType {
  Boolean,
  String,
  Dropdown,
  Modal,
  Date,
  SelectTree,
  Tree,
  Userpicker,
  Array,
}

/**
 * 下拉弹窗属性
 */
export enum DropdownAttributeType {
  Number,
  Summary,
  UploadSize,
  ControlType,
  Location,
}
/**
 * groups 控制器属性的分类
 */
export interface ControllerConduct {
  groups: {
    [key: string]: {
      label: string;
      keys: string[];
    };
  };
  properties?: {
    [key: string]: {
      inputMethod?: number;
      //modalName?: string; // 已有的组件名称
      inputComponent?:
        | Component<any, any, any, any>
        | AsyncComponent<any, any, any, any>; // 引入vue标准的组件
      options?: ControllerOptions;
      [key: string]: any;
    };
  };
}
