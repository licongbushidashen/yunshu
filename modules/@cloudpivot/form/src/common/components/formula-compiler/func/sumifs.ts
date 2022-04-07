import { Formula } from '../type';
import { generateError } from '../error';
import { validateSubFromSame } from '../utils';

const SUMIFS: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'SUMIFS',
  type: Formula.IdentifierType.FUNC,
  outputType: {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params) {
    // checkFieldParamFromRelevance
    if (params.length < 2) {
      throw generateError(`函数 ${identifier.name}() 至少需要2个参数，但传入了${params.length}个参数`);
    }

    const [condition, ..._params] = params;
    if (condition.paramType !== Formula.ParamType.BOOL) {
      throw generateError(`函数 ${identifier.name}() 第一个函数需要是逻辑参数`);
    }

    if (_params.some(param => param.paramType !== Formula.ParamType.NUMBER ||
       param.sourceType !== Formula.SourceType.FIELD ||
        (param.sourceType === Formula.SourceType.FIELD &&
          (param as Formula.FieldParam).fieldType !== Formula.FieldType.SUBLIST))) {
      throw generateError(`函数 ${identifier.name}() 第二参数开始需要是明细表中的数字类型字段`);
    }

    if (!validateSubFromSame(params as Formula.FieldParam[])) {
      throw generateError(`函数 ${identifier.name}() 参数不支持不同明细表的字段`);
    }

    return identifier.outputType;
  },
  calculate (identifier) {
    return identifier.outputType as Formula.Param;
  },
};

export default SUMIFS;
