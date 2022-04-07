import { Form } from '@h3/antd-vue';
import { Formula } from '../type';

const LEFTBRACKET: Formula.Identifier<Formula.IdentifierType.OPERATOR> = {
  name: '(',
  type: Formula.IdentifierType.OPERATOR,
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [prev, next] = _params;
    // todo
    const value = null;
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default LEFTBRACKET;
