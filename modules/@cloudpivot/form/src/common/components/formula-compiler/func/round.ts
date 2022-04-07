import toNumber from 'lodash/toNumber';
import { Formula } from '../type';
import { generateError } from '../error';

const ROUND: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'ROUND',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.NUMBER,
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
    const [prev, next] = _params;
    if (next.value.isZero()) {
      throw generateError(`函数 ${identifier.name}() 第二个参数不能为负数`);
    }
    // const value = Math.round(prev.value * Number(`1e${next.value}`)) / Number(`1e${next.value}`);
    const value = prev.value.toFixed(next.value.toNumber());
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default ROUND;
