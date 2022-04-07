import toNumber from 'lodash/toNumber';
import { Formula } from '../type';
import { generateError } from '../error';

const MID: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'MID',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.TEXT,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.NUMBER,
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
    const [, index, len] = params;
    if (!isNaN(index.value)) {
      const unary = index.unary || 1;
      const value = toNumber(index.value) * unary;
      if (value < 0) {
        throw generateError(`函数 ${identifier.name}() 第二个参数不能为负数`);
      }
    }
    if (!isNaN(len.value)) {
      const unary = len.unary || 1;
      const value = toNumber(len.value) * unary;
      if (value < 0) {
        throw generateError(`函数 ${identifier.name}() 第三个参数不能为负数`);
      }
    }
    return outputType;
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [_str, _index, _len] = _params;
    if (_index.value.lt(0) || _len.value.lt(0)) {
      throw generateError(`函数 ${identifier.name}() 第二个参数和第三个参数不能为负数`);
    }
    const index = _index.value.minus(1).lt(0) ? 0 : _index.value.minus(1).toNumber();
    const value = _str.value.substr(index, Math.abs(_len.value.toNumber()));
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default MID;
