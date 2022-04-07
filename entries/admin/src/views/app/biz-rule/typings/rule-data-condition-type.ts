import { DataItemType } from "@cloudpivot/form/schema";

/**
 * 过滤条件类型
 */

export interface Icondition {
  id: number;
  code: string;
  name: string;
}
interface IconditionObj {
  arry: Icondition[];
  [propName: string]: any;
}
export enum Eexpr {
  EQ = 1,
  NEQ = 2,
  GT = 3,
  LT = 4,
  GTEQ = 5,
  LTEQ = 6,
  CT = 7,
  NCT = 8,
  EP = 9,
  NEP = 10,
  OF = 11,
  NOF = 12
}
class RuleDataCondition {
  conditionType: IconditionObj = { arry: [] };
  protected typeArr: string[] = Object.keys(Eexpr);
  constructor() {
    // 过滤条件
    const arr: Array<Icondition> = [
      { id: Eexpr.EQ, code: Eexpr[Eexpr.EQ], name: "等于" },
      { id: Eexpr.NEQ, code: Eexpr[Eexpr.NEQ], name: "不等于" },
      { id: Eexpr.GT, code: Eexpr[Eexpr.GT], name: "大于" },
      { id: Eexpr.LT, code: Eexpr[Eexpr.LT], name: "小于" },
      { id: Eexpr.GTEQ, code: Eexpr[Eexpr.GTEQ], name: "大于等于" },
      { id: Eexpr.LTEQ, code: Eexpr[Eexpr.LTEQ], name: "小于等于" },
      { id: Eexpr.CT, code: Eexpr[Eexpr.CT], name: "包含" },
      { id: Eexpr.NCT, code: Eexpr[Eexpr.NCT], name: "不包含" },
      { id: Eexpr.OF, code: Eexpr[Eexpr.OF], name: "属于" },
      { id: Eexpr.NOF, code: Eexpr[Eexpr.NOF], name: "不属于" },
      { id: Eexpr.EP, code: Eexpr[Eexpr.EP], name: "为空" },
      { id: Eexpr.NEP, code: Eexpr[Eexpr.NEP], name: "不为空" }
    ];
    Array.isArray(arr) &&
      arr.map((element: Icondition) => {
        // 根据code生成不同属性值，以便A.B.name类型的调用
        this.conditionType[element.code] = element;
      });
    this.conditionType.arry = arr;
  }
  /**
   * 根据操作符id得到对象
   * @param 操作符id
   */
  valueOf(id: number): Icondition | undefined {
    return this.conditionType.arry.find((c: Icondition) => c.id === id);
  }

  /**
   * 根据操作符code得到对象
   * @param name 操作符name
   */
  codeOf(name: string): Icondition | undefined {
    return this.conditionType.arry.find((c: Icondition) => c.code === name);
  }

  /**
   * 根据codes数组获取多个对象
   * @param codes
   */
  getConditionByCode(codes: number[]): Icondition[] {
    const arryId = Object.keys(this.conditionType.arry).filter((c: string) =>
      codes.includes(this.conditionType.arry[c].id)
    );
    return arryId.map((c: string) => this.conditionType.arry[c]);
  }

  // 筛选对象属性
  propertyOf(obj: any, key: Array<string>): any {
    const result = {};
    key.map((k: string) => {
      result[k] = obj[k];
    });
    return result;
  }
}
export class BizRuleDataCondition extends RuleDataCondition {
  constructor() {
    super();
  }

  /**
   * 根据控件类型触发对应条件运算符(>、<、=...)
   * @param type 控件类型；
   * @param code 控件code码；
   */
  tiggerFilterOf(type: number, code: string): Icondition[] {
    let exprArry: number[] = [];
    switch (type) {
      case DataItemType.ShortText:
      case DataItemType.LongText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        exprArry = [Eexpr.EQ, Eexpr.NEQ];
        if (code !== "sequenceStatus") {
          if (code === "name" || code === "sequenceNo")
            exprArry.push(...[Eexpr.CT, Eexpr.NCT]);
          else exprArry.push(...[Eexpr.CT, Eexpr.NCT, Eexpr.EP, Eexpr.NEP]);
        }
        break;
      case DataItemType.Number:
        exprArry = [
          Eexpr.EQ,
          Eexpr.NEQ,
          Eexpr.GT,
          Eexpr.GTEQ,
          Eexpr.LT,
          Eexpr.LTEQ,
          Eexpr.EP,
          Eexpr.NEP
        ];
        break;
      case DataItemType.Date:
        exprArry = [
          Eexpr.EQ,
          Eexpr.NEQ,
          Eexpr.GT,
          Eexpr.GTEQ,
          Eexpr.LT,
          Eexpr.LTEQ
        ];
        if (code !== "createdTime" && code !== "modifiedTime")
          exprArry.push(...[Eexpr.EP, Eexpr.NEP]);
        break;
      case DataItemType.Logic:
        exprArry = [Eexpr.EQ];
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        exprArry = [Eexpr.EP, Eexpr.NEP, Eexpr.OF];
        break;
    }
    return this.getConditionByCode(exprArry);
  }

  filterConditionOf(type: number, code: string, biz?: string): Icondition[] {
    let exprArry: number[] = [];
    switch (type) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
        if (biz && biz === "filterCondition") exprArry = [Eexpr.EQ]
        else exprArry = [Eexpr.EQ, Eexpr.NEQ, Eexpr.CT, Eexpr.NCT];
        break;
      case DataItemType.Number:
        exprArry = [
          Eexpr.EQ,
          Eexpr.NEQ,
          Eexpr.GT,
          Eexpr.GTEQ,
          Eexpr.LT,
          Eexpr.LTEQ
        ];
        break;

      default:
        exprArry = [Eexpr.EQ];
        break;
    }
    return this.getConditionByCode(exprArry);
  }

  existVerifyConditionOf(type: number, code: string): Icondition[] {
    let exprArry: number[] = [];
    switch (type) {
      case DataItemType.Number:
      case DataItemType.Date:
      case DataItemType.Time:
        exprArry = [
          Eexpr.EQ,
          Eexpr.NEQ,
          Eexpr.GT,
          Eexpr.GTEQ,
          Eexpr.LT,
          Eexpr.LTEQ
        ];
        break;
      default:
        exprArry = [Eexpr.EQ,Eexpr.NEQ,];
        break;
    }
    return this.getConditionByCode(exprArry);
  }


  filterConditionOf2(type: number, code: string): Icondition[] {
    let exprArry: number[] = [];
    switch (type) {
      case DataItemType.ShortText:
      case DataItemType.LongText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        exprArry = [Eexpr.EQ, Eexpr.NEQ, Eexpr.EP, Eexpr.NEP];
        break;
      case DataItemType.Number:
      case DataItemType.Date:
        exprArry = [Eexpr.EQ, Eexpr.NEQ, Eexpr.GT, Eexpr.LT, Eexpr.GTEQ, Eexpr.LTEQ, Eexpr.EP, Eexpr.NEP];
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        exprArry = [Eexpr.OF, Eexpr.NOF, Eexpr.EP, Eexpr.NEP];
        break;
      case DataItemType.Time:
        exprArry = [Eexpr.EQ, Eexpr.NEQ, Eexpr.GT, Eexpr.LT, Eexpr.GTEQ, Eexpr.LTEQ];
        break;
      default:
        exprArry = [Eexpr.EQ];
        break;
    }
    return this.getConditionByCode(exprArry);
  }

  /**
   * 根据选择的数据项显示对应的控件
   * @param item 要触发的数据项
   */
  showControls(item: any): number {
    let num = -1;
    switch (item.propertyType) {
      case DataItemType.ShortText:
      case DataItemType.LongText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        item.code === "sequenceStatus" ? (num = 6) : (num = 1);
        break;
      case DataItemType.Number:
        num = 3;
        break;
      case DataItemType.Date:
        num = 2;
        break;
      case DataItemType.Logic:
        num = 5;
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        num = 6;
        break;
      case DataItemType.Time:
        num = 12;
    }
    return num;
  }

  deepCopy(source: Object): any {
    if (null == source || {} === source || [] === source) {
      return source;
    }

    let newObject: any;
    let isArray = false;
    if ((source as any).length) {
      newObject = [];
      isArray = true;
    }
    else {
      newObject = {};
      isArray = false;
    }

    for (let key of Object.keys(source)) {
      if (null == source[key]) {
        if (isArray) {
          newObject.push(null);
        }
        else {
          newObject[key] = null;
        }
      }
      else {
        let sub = (typeof source[key] === 'object') ? this.deepCopy(source[key]) : source[key];
        if (isArray) {
          newObject.push(sub);
        }
        else {
          newObject[key] = sub;
        }
      }
    }
    return newObject;
  }
}

/**
 * 数据项类型
 */
export enum SystemDataItemCode {
  /**
   * 业务对象ID
   */
  Id = "id",
  /**
   * "子表业务对象父类ID"
   */
  ParentId = "parentId",

  /**
   * 数据标题
   */
  Name = "name",

  /**
   * 单据号
   */
  SequenceNo = "sequenceNo",

  /**
   * 单据状态
   */
  SequenceStatus = "sequenceStatus",

  /**
   * 创建人部门
   */
  CreatedDeptId = "createdDeptId",

  /**
   * 拥有者
   */
  Owner = "owner",

  /**
   * 拥有者部门
   */
  OwnerDeptId = "ownerDeptId",

  /**
   * 创建人
   */
  Creater = "creater",
  /**
   * 创建时间
   */
  CreatedTime = "createdTime",
  /**
   * 修改人
   */
  Modifier = "modifier",
  /**
   * 修改时间
   */
  ModifiedTime = "modifiedTime",
  /**
   * "流程实例ID"
   */
  WorkflowInstanceId = "workflowInstanceId",
  /**
   * 部门查询编码
   */
  OwnerDeptQueryCode = "ownerDeptQueryCode",

  /**
   * 排序号
   */
  SortKey = "sortKey"
}
