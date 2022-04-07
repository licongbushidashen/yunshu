import { Formula } from '../type';
import { toText, formatParamValue } from '../utils';
import { generateError } from '../error';

const STRING: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'STRING',
  type: Formula.IdentifierType.FUNC,
  outputType: {
    paramType: Formula.ParamType.TEXT,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params) {
    if (params.length < 1) {
      throw generateError(`函数 ${identifier.name}() 至少需要1个参数，但传入了${params.length}个参数`);
    }
    return identifier.outputType;
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

export default STRING;
