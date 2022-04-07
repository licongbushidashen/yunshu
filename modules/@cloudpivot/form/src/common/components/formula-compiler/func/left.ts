import toNumber from 'lodash/toNumber';
import { Formula } from '../type';
import { generateError } from '../error';

const LEFT: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'LEFT',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.TEXT,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.TEXT,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params, compiler) {
    const outputType = compiler._funcValidate(identifier, params);
    const [, len] = params;
    if (!isNaN(len.value)) {
      const unary = len.unary || 1;
      const value = toNumber(len.value) * unary;
      if (value < 0) {
        throw generateError(`函数 ${identifier.name}() 第二个参数不能为负数`);
      }
    }
    return outputType;
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [_str, _len] = _params;
    if (_len.value.lt(0)) {
      throw generateError(`函数 ${identifier.name}() 第二个参数不能为负数`);
    }
    const value = _str.value.slice(0, Math.abs(_len.value.toNumber()));
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default LEFT;
