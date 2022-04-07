import { Form } from '@h3/antd-vue';
import { Formula } from '../type';

const PLUS: Formula.Identifier<Formula.IdentifierType.OPERATOR> = {
  name: '+',
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
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [prev, next] = _params;
    const value = prev.value.plus(next.value);
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default PLUS;
