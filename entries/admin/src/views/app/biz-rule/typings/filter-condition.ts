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
  EP = 7,
  NEP = 8,
  OF = 9,
  NOF = 10
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

  filterConditionOf3(type: number): Icondition[] {
    let exprArry: number[] = [];
    switch (type) {
      case 4:
        exprArry = [Eexpr.EQ];
        break;
      case 2:
      case 3:
        exprArry = [Eexpr.EQ, Eexpr.NEQ, Eexpr.GT, Eexpr.LT, Eexpr.GTEQ, Eexpr.LTEQ, Eexpr.EP, Eexpr.NEP];
        break;
      case 5:
        exprArry = [Eexpr.OF, Eexpr.NOF, Eexpr.EP, Eexpr.NEP];
        break;
      case 6:
        exprArry = [Eexpr.EP, Eexpr.NEP];
        break;
      default:
        exprArry = [Eexpr.EQ, Eexpr.NEQ, Eexpr.EP, Eexpr.NEP];
        break;
    }
    return this.getConditionByCode(exprArry);
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
