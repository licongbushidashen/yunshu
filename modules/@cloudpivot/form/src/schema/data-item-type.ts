/**
 * 数据项类型
 */
export enum DataItemType {
  /**
   * 短文本
   */
  ShortText = 0,
  /**
   * 长文本
   */
  LongText = 1,
   /**
   * 数值
   */
  Number = 2,
  /**
   * 日期
   */
  Date = 3,

  /**
   * 逻辑
   */
  Logic = 4,
  /**
   * 人员单选
   */
  StaffSingle = 50,
  /**
   * 附件
   */
  Attachment = 6,

  /**
   * 审批意见
   */
  ApprovalOpinion = 7,

  /**
   * 子表
   */
  Sheet = 8,

   /**
    * 关联单选
    */
  RelevanceForm = 9,

   /**
    * 地理位置
    */
  Address = 10,

   /**
    * 关联多选
    */
  RelevanceFormEx = 11,
  /**
   * 单选框
   */
  Radio = 12,
   /**
   * 复选框
   */
  Checkbox = 13,
  /**
   * 下拉框单选
   */
  Dropdown = 14,
  /**
   * 下拉框多选
   */
  DropdownMulti = 15,
  /**
   * 人员多选
   */
  StaffMulti = 51,
  /**
   * 部门单选
   */
  DeptSingle = 60,

   /**
    * 部门多选
    */
  DeptMulti = 61,
  /**
   * 混合选人控件
   */
  StaffDeptMix = 5,
  /**
   * 时间
   */
  Time = 20
}

/**
 * 数据项类型文字
 */
export enum DataItemTypeText {
  /**
   * 短文本
   */
  ShortText = '短文本',
  /**
   * 长文本
   */
  LongText = '长文本',
  /**
   * 数值
   */
  Number = '数值',
  /**
   * 日期
   */
  Date = '日期',

  /**
   * 逻辑
   */
  Logic = '逻辑',
  /**
   * 人员单选
   */
  StaffSingle = '人员单选',
  /**
   * 附件
   */
  Attachment = '附件',

  /**
   * 审批意见
   */
  ApprovalOpinion = '审批意见',

  /**
   * 子表
   */
  Sheet = '子表',

  /**
   * 关联单选
   */
  RelevanceForm = '关联单选',

  /**
   * 地理位置
   */
  Address = '地理位置',

  /**
   * 关联多选
   */
  RelevanceFormEx = '关联多选',
  /**
   * 单选框
   */
  Radio = '单选框',
  /**
   * 复选框
   */
  Checkbox = '复选框',
  /**
   * 下拉框单选
   */
  Dropdown = '下拉单选框',
  /**
   * 下拉框多选
   */
  DropdownMulti = '下拉多选框',
  /**
   * 人员多选
   */
  StaffMulti = '人员多选',
  /**
   * 部门单选
   */
  DeptSingle = '部门单选',

  /**
   * 部门多选
   */
  DeptMulti = '部门多选',
  /**
   * 混合选人控件
   */
  StaffDeptMix = '混合选人',
  /**
   * 时间
   */
  Time = '时间'
}

/**
 * 数据项类型顔色
 */
export enum DataItemTypeColor {
  /**
   * 短文本
   */
  ShortText = '#FCE3E2',
  /**
   * 长文本
   */
  LongText = '#FCE3E2',
  /**
   * 数值
   */
  Number = '#CEF5DC',
  /**
   * 日期
   */
  Date = '#DEF8C6',

  /**
   * 逻辑
   */
  Logic = '#ECF5BB',
  /**
   * 人员单选
   */
  StaffSingle = '#D1EEFC',
  /**
   * 附件
   */
  Attachment = '#FFE8DA',

  /**
   * 审批意见
   */
  ApprovalOpinion = '#ECF5BB',

  /**
   * 子表
   */
  Sheet = '#FCDEF5',

  /**
   * 关联单选
   */
  RelevanceForm = '#D3F1F1',

  /**
   * 地理位置
   */
  Address = '#FCE8C1',

  /**
   * 关联多选
   */
  RelevanceFormEx = '#D3F1F1',
  /**
   * 单选框
   */
  Radio = '#ECD7F8',
  /**
   * 复选框
   */
  Checkbox = '#ECD7F8',
  /**
   * 下拉框单选
   */
  Dropdown = '#DDE2EA',
  /**
   * 下拉框多选
   */
  DropdownMulti = '#DDE2EA',
  /**
   * 人员多选
   */
  StaffMulti = '#D1EEFC',
  /**
   * 部门单选
   */
  DeptSingle = '#DDE8FF',

  /**
   * 部门多选
   */
  DeptMulti = '#DDE8FF',
  /**
   * 混合选人控件
   */
  StaffDeptMix = '#D1EEFC',
  /**
   * 时间
   */
  Time = '#D5F8D1'
}

interface kf {
  [key: string]: (val: any, type: any) => any;
}

export const DataItemTypeValue: kf = {
  ShortText(val: any, type: string) {
    return str(val, type);
  },
  LongText(val: any, type: string) {
    return str(val, type);
  },
  Number(val: any, type: string) {
    if (typeof val === "number") {
      return val;
    } else if (/^[0-9]+.?[0-9]*$/.test(val)) {
      return +val;
    }
    valError(val, type, "数值");
  },
  Logic(val: any, type: string) {
    if (typeof val === "boolean") {
      return val;
    } else if (val === "true") {
      valError(val, type, "逻辑");
      return true;
    } else if (val === "false") {
      valError(val, type, "逻辑");
      return false;
    }
  },
  Date(val: any, type: string) {
    if (val instanceof Date) {
      return val;
    } else if (typeof val === "string" && val) {
      try {
        let str = val
          .replace(/-/g, "/") // iOS兼容
          .replace(/T/g, " "); //修复2019-09-17T06:21:07.000字符不能new Date的问题

        let date = new Date(str);
        if (date.getFullYear() > 0) {
          return date;
        }
      } catch {}
    }
    valError(val, type, "日期");
  },
  StaffSelector(val: string, type: string) {
    return strOrArray(val, type);
  },
  Attachment(val: string, type: string) {
    return strOrArray(val, type);
  },
  ApprovalOpinion(val: string, type: string) {},
  Sheet(val: string, type: string) {
    return strOrArray(val, type);
  },
  RelevanceForm(val: string, type: string) {
    return strOrObject(val, type);
  },
  Address(val: string, type: string) {
    return strOrObject(val, type);
  },
};

function str(val: string, type: string) {
  if (typeof val === "string") {
    return val;
  } else if (typeof val === "number") {
    return "" + val;
  }
  valError(val, type, "字符串");
}

function strOrArray(val: string, type: string) {
  if (typeof val === "string") {
    try {
      val = JSON.parse(val);
    } catch {
      console.log(`${type} 类型值解析错误! 值是: ${val}`);
    }
  }
  if (Array.isArray(val) && val.some((x) => typeof x === "object")) {
    return val;
  }
}

function strOrObject(val: string, type: string) {
  if (typeof val === "string") {
    try {
      val = JSON.parse(val);
    } catch {
      console.log(`${type} 类型值解析错误! 值是: ${val}`);
    }
  }
  if (typeof val === "object") {
    return val;
  }
}

function valError(val: string, type: string, valType: string) {
  console.error(
    `${type} 类型的控件值应该 ${valType}类型,但是它现在是 ${typeof val}`
  );
}
