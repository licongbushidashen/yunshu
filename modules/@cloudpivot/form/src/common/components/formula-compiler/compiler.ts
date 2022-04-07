import { Parser } from './parser/parser';
import keywordBuiltIn from './keyword';
import operatorBuiltIn from './operator';
import funcBuiltIn from './func';
import {
  validateParamNull,
  paramDefaultValue,
  checkParam,
  checkContainsParam,
  checkDateString,
  checkFieldParamFromSublist,
  checkFieldParamFromRelevance,
  extraRelevanceFuncs, extraSublistFuncs,
  getParamTypeValue,
  getFieldTypeValue,
  formatParamValue,
  compleDate,
  validateFormulaNested,
  validateFormulaNestedEx,
  getFieldName,
  validDigitCheck,
  toDecimal,
} from './utils';
import {
  generateError, ParserError, validateError, FORMULA_ERROR_NOT_AVAILABLE,
} from './error';

import { Formula } from './type';

export type GenerateParserOptions = {
  keywords?: Formula.KeywordParam[];
  funcs?: Array<Formula.Identifier<Formula.IdentifierType.FUNC>>;
  disabledFuncs?: string[];
};

export type ValidateResult = {
  result?: boolean;
  resultType?: Formula.ParamType;
  err?: ParserError;
};

export type CalculateResult = {
  result?: any;
  resultType?: Formula.ParamType;
  err?: ParserError;
};

/**
 * @author 陈韦润
 * @param
 * 组件描述，请详细说明
 */
export class FormulaCompiler {
  // 已计算公式值
  calculatedFields: Record<string, Formula.FieldParam> = {};

  // 字段
  fields: Record<string, Formula.FieldParam> = {};

  // 常量
  keywords:Record<string, Formula.KeywordParam> = {};

  // 操作符
  operators:Record<string, Formula.Identifier<Formula.IdentifierType.OPERATOR>> = {};

  // 函数
  funcs:Record<string, Formula.Identifier<Formula.IdentifierType.FUNC>> = {};

  parser: Parser;

  _mode: 'validate' | 'calculate';

  constructor (options: GenerateParserOptions = {}) {
    this.parser = new Parser();
    this._mode = 'validate';
    const { keywords = [], funcs = [], disabledFuncs = [] } = options;
    const _disabledFunc = disabledFuncs.map(disabledFunc => disabledFunc.toLocaleUpperCase());
    this.parser.yy = {
      callNumber: (str) => {
        if (!validDigitCheck(str)) {
          throw generateError(`数字最多支持15位整数及8位小数，${str}不符合要求。`);
        }
        return formatParamValue({
          paramType: Formula.ParamType.NUMBER,
          sourceType: Formula.SourceType.EDIT,
          value: str,
        });
      },
      callString: (str) => {
        const _str = str.replace(/(^")|("$)/g, '');
        return formatParamValue({
          paramType: Formula.ParamType.TEXT,
          sourceType: Formula.SourceType.EDIT,
          value: _str,
        });
      },
      callField: (str) => {
        const id = str.replace(/\{|\}/g, '');
        const field = this._getField(id);
        if (!field) {
          throw generateError('存在无效字段', { extraMessage: `{${id}}`, errorType: FORMULA_ERROR_NOT_AVAILABLE });
        }
        if (this._mode === 'calculate' && field.formula) {
          let param = this.calculatedFields[field.id];
          if (param) {
            return param;
          }
          const { result, err, resultType } = this._calculate(field.formula);

          if (err) {
            throw err;
          }

          param = {
            ...field,
            value: field.formulaFormat ? field.formulaFormat(result, resultType) : result,
            paramType: resultType ? resultType : Formula.ParamType.ANY,
          };
          this.calculatedFields[field.id] = param;
          return param;
        }

        return { ...field };
      },
      callKeyword: (str) => {
        const name = str.toLocaleUpperCase();
        const keyword = this.getKeyword(name);
        if (!keyword) {
          throw generateError(`找不到关键字【${str}】，关键字只能是【${Object.keys(this.keywords).join('，')}】`);
        }
        return keyword;
      },
      uminus: (param) => {
        if (typeof param !== 'object' || param.paramType !== Formula.ParamType.NUMBER) {
          throw generateError('在非数字类型前使用了 - 号');
        }
        param.unary = -1;
        return param;
      },
      uplus: (param) => {
        if (typeof param !== 'object' || param.paramType !== Formula.ParamType.NUMBER) {
          throw generateError('在非数字类型前使用了 + 号');
        }
        param.unary = 1;
        return param;
      },
      evaluateByOperator: (operatorKey, params = []) => {
        const name = operatorKey.trim().toLocaleUpperCase();
        const operator = this._getOperator(name);
        if (!operator) {
          throw generateError(`无效操作符 "${name}" `);
        }
        let result: Formula.Param | undefined = undefined;
        if (operator.validate) {
          result = operator.validate(operator, params, this);
        } else {
          result = this._operatorValidate(operator, params);
        }
        if (this._mode === 'calculate') {
          result = operator.calculate(operator, params, this);
        }
        return result;
      },
      evaluateByFunction: (functionKey, params = []) => {
        const name = functionKey.trim().toLocaleUpperCase();
        const func = this.getFunc(name);
        if (!func || (this._mode !== 'calculate' && _disabledFunc.includes(name))) {
          throw generateError(`无效函数 ${name}() `);
        }
        let result: Formula.Param | undefined = undefined;
        if (func.validate) {
          result = func.validate(func, params, this);
        } else {
          result = this._funcValidate(func, params);
        }
        if (this._mode === 'calculate') {
          result = func.calculate(func, params, this);
        }
        return result;
      },
    };
    this._setOperators(operatorBuiltIn);
    // 移除NULL关键字
    this.setKeywords([...keywordBuiltIn.filter(keyword => keyword.name !== 'NULL'), ...keywords]);
    this.setFuncs([...funcBuiltIn, ...funcs]);
  }

  validate (formula: string,
    fields: Formula.FieldParam[] = [],
    resultType?: Formula.ParamType, fieldId?: string): ValidateResult {
    this.fields = {};
    this._setFields(fields);
    this._mode = 'validate';

    let result = true;
    let _resultType: Formula.ParamType = Formula.ParamType.ANY;
    let err: ParserError = new ParserError("", "", "");
    try {
      const preErr = validateFormulaNestedEx(formula);
      if (preErr) {
        result = false;
        err = preErr;
      } else {
        const _err = validateFormulaNested(formula, fieldId, this.fields);
      if (_err) {
        result = false;
        err = _err;
        } else {
          const {
            paramType, sourceType, fieldType, name,
          } = this.parser.parse(formula);
          if (sourceType === Formula.SourceType.FIELD && fieldType && fieldType !== Formula.FieldType.BASIC) {
            result = false;
            err = generateError(`${getFieldTypeValue(fieldType)}字段{${name}}需要结合函数${
              (fieldType === Formula.FieldType.SUBLIST ? extraSublistFuncs : extraRelevanceFuncs)
              .map(item => `${item}()`).join(' ,')}来使用`);
          } else {
            _resultType = paramType;
            if (resultType) {
              result = _resultType === resultType;
              if (!result) {
                err = generateError(`公式结果要求返回数据类型为${
                  getParamTypeValue(resultType)
                }，结果返回${getParamTypeValue(_resultType)}`);
              }
            }
          }
        }
      }
    } catch (e) {
      result = false;
      err = validateError(e);
    }
    return { result, resultType: _resultType, err };
  }

  calculate (formula: string, fields: Formula.FieldParam[] = []): CalculateResult {
    this.fields = {};
    this.calculatedFields = {};
    this._setFields(fields);
    return this._calculate(formula);
  }

  _calculate (formula: string): CalculateResult {
    this._mode = 'calculate';
    let result:any = null;
    let resultType: Formula.ParamType = Formula.ParamType.ANY;
    let err: ParserError = new ParserError("", "", "");
    try {
      const { value, paramType, unary } = this.parser.parse(formula);
      resultType = paramType;
      switch (resultType) {
        case Formula.ParamType.NUMBER:
          const _value = toDecimal(value);
          result = (isNaN(unary) ? _value : _value.mul(unary)).toString(); // 处理最顶层一元符号
          break;
        case Formula.ParamType.DATE:
          result = compleDate(value); // 处理成完整时间格式 YYYY-MM-DD HH:mm:ss
          break;
        default:
          result = value;
          break;
      }
    } catch (e) {
      err = validateError(e);
    }
    return { result, resultType, err };
  }

  _pretreatment (identifier: Formula.Identifier, params: Formula.Param[]) {
    // if (params.some(param => validateParamNull(param))) {
    //   throw generateError(`${identifier.name} 参数出现空值，${identifier.name} 不允许进行空值运行`);
    // }
    params.forEach(param => {
      const isNull = validateParamNull(param);
      if (!isNull) {
        return;
      }
      if (param.sourceType === Formula.SourceType.FIELD) {
        param.isNull = true;
        param.value = paramDefaultValue(param.paramType); // 设置默认值
      }
    });
    return params.map(param => formatParamValue(param));
  }

  // 默认的operator校验函数
  _operatorValidate (identifier: Formula.Identifier, params: Formula.Param[]): Formula.Param | undefined {
    checkFieldParamFromSublist(identifier, params);
    checkFieldParamFromRelevance(identifier, params);
    const { name, inputType, outputType } = identifier;
    if (!inputType) {
      throw generateError(`未传入参数`);
    }
    if (inputType.length !== params.length) {
      throw generateError(`操作符 "${name}" 需要${inputType.length}个参数，但传入了${params.length}个参数`);
    }
    const result: any[] = [];
    inputType.forEach((claim, index) => {
      const incoming = params[index];
      let func: any = null;
      if (identifier.name === "CONTAINS") {
        func = checkContainsParam(claim, incoming);
      } else if (identifier.name === "YEAR" || identifier.name === "QUARTER" || identifier.name === "MONTH" || identifier.name === "DAY" || identifier.name === "HOUR" || identifier.name === "MINUTE" || identifier.name === "SECOND") {
        func = checkDateString(claim, incoming);
      } else {
        func = checkParam(claim, incoming);
      }
      const {
        paramType, paramTypeInfo, sourceType, sourceTypeInfo,
      } = func;
      if (!paramType || !sourceType) {
        result.push(`第${index + 1}个参数要求是【${
          [paramTypeInfo[0], sourceTypeInfo[0]].filter(str => str).join('，')
        }】，传入的是${getFieldName(incoming)}【${
          [paramTypeInfo[1], sourceTypeInfo[1]].filter(str => str).join('，')
        }】`);
      }
    });
    if (result.length > 0) {
      throw generateError(`操作符 "${name}" 参数错误：\n${result.join('\n')}`);
    }
    return outputType;
  }

  // 默认的func校验函数
  _funcValidate (identifier: Formula.Identifier, params: Formula.Param[]): Formula.Param | undefined {
    
    checkFieldParamFromSublist(identifier, params);
    checkFieldParamFromRelevance(identifier, params);
    const { name, inputType, outputType } = identifier;
    if (!inputType) {
      throw generateError(`未传入参数`);
    }
    if (inputType.length !== params.length) {
      throw generateError(`函数 ${name}() 需要${inputType.length}个参数，但传入了${params.length}个参数`);
    }
    
    if(name==='ROUND' && params[1]){
          if(!params[1].value || params[1].value.d.length>1){
            throw generateError(`函数 ${name}() 第二个参数需填写Int整数`);
          }
    }

    const result: any[] = [];
    inputType.forEach((claim, index) => {
      const incoming = params[index];
      let func: any = null;
      if (identifier.name === "CONTAINS") {
        func = checkContainsParam(claim, incoming);
      } else if (identifier.name === "YEAR" || identifier.name === "QUARTER" || identifier.name === "MONTH" || identifier.name === "DAY" || identifier.name === "HOUR" || identifier.name === "MINUTE" || identifier.name === "SECOND") {
        func = checkDateString(claim, incoming);
      } else {
        func = checkParam(claim, incoming);
      }
      const {
        paramType, paramTypeInfo, sourceType, sourceTypeInfo,
      } = func;
      if (!paramType || !sourceType) {
        result.push(`第${index + 1}个参数要求是【${
          [paramTypeInfo[0], sourceTypeInfo[0]].filter(str => str).join('，')
        }】，传入的是${getFieldName(incoming)}【${
          [paramTypeInfo[1], sourceTypeInfo[1]].filter(str => str).join('，')
        }】`);
      }
    });
    if (result.length > 0) {
      throw generateError(`函数 ${name}() 参数错误：\n${result.join('\n')}`);
    }
    return outputType;
  }

  setKeywords (params: Formula.KeywordParam[] = []) {
    params.forEach(param => { this.setKeyword(param); });
  }

  setKeyword (param: Formula.KeywordParam) {
    const name = param.name;
    this.keywords[name] = param;
  }

  getKeyword (name: string) {
    return this.keywords[name];
  }

  _setOperators (params: Array<Formula.Identifier<Formula.IdentifierType.OPERATOR>> = []) {
    params.forEach(param => { this._setOperator(param); });
  }

  _setOperator (param: Formula.Identifier<Formula.IdentifierType.OPERATOR>) {
    const name = param.name;
    this.operators[name] = param;
  }

  _getOperator (name: string) {
    return this.operators[name];
  }

  setFuncs (params: Array<Formula.Identifier<Formula.IdentifierType.FUNC>> = []) {
    params.forEach(param => { this.setFunc(param); });
  }

  setFunc (param:Formula.Identifier<Formula.IdentifierType.FUNC>) {
    const name = param.name;
    this.funcs[name] = param;
  }

  getFunc (name: string) {
    return this.funcs[name];
  }

  _setFields (params: Formula.FieldParam[] = []) {
    params.forEach(param => { this._setField(param); });
  }

  _setField (param: Formula.FieldParam) {
    const id = param.id;
    this.fields[id] = param;
  }

  _getField (id: string) {
    return this.fields[id];
  }

  getTokenInfo (): Formula.TokenInfo[] {
    const keywordInfo: Formula.TokenInfo[] = Object.values(this.keywords).map(keyword => ({
      name: keyword.name,
      type: Formula.TokenType.KEYWORD,
    }));
    const operatorsInfo: Formula.TokenInfo[] = Object.values(this.operators).map(operator => ({
      name: operator.name,
      type: operator.type,
    }));
    const funcInfo: Formula.IdentifierTokenInfo[] = Object.values(this.funcs).map(func => ({
      name: func.name,
      type: func.type,
      parameterless: !!func.parameterless,
    }));
    return [
      ...keywordInfo,
      ...operatorsInfo,
      ...funcInfo,
    ];
  }
}
