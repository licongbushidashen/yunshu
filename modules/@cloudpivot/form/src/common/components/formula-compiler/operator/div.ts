import toNumber from 'lodash/toNumber';
import { Formula } from '../type';
import { generateError, FORMULA_ERROR_DIV_ZERO } from '../error';

const DIV: Formula.Identifier<Formula.IdentifierType.OPERATOR> = {
  name: '/',
  type: Formula.IdentifierType.OPERATOR,
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
    const outputType = compiler._operatorValidate(identifier, params);
    const [, next] = params;
    if (!isNaN(next.value)) {
      const value = toNumber(next.value);
      if (value === 0) {
        throw generateError('除数不能为零', { errorType: FORMULA_ERROR_DIV_ZERO });
      }
    }
    return outputType;
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [prev, next] = _params;
    if (next.value.isZero()) {
      throw generateError('除数不能为零', { errorType: FORMULA_ERROR_DIV_ZERO });
    }
    const value = prev.value.div(next.value);
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default DIV;
