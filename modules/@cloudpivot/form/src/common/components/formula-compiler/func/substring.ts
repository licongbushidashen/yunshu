import { Formula } from '../type';
import { toText, formatParamValue } from '../utils';

const SUBSTRING: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'SUBSTRING',
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
  calculate: (identifier, params) => {
    const _params = params.map(param => formatParamValue(param));
    const [content, target] = _params.map(_param => toText(_param).value);
    // todo
    const value = null;
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default SUBSTRING;
