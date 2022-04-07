import { Formula } from '../type';
import { getDateInstanceFromParam, getFieldName } from '../utils';
import { generateError } from '../error';

const DAY: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'DAY',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.EDIT,
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [_param] = _params;
    const _date = getDateInstanceFromParam(_param.value);
    if (!_date) {
      throw generateError(`函数 ${identifier.name}() 中时间参数${getFieldName(_param)}转成时间时出现错误`);
    }
    const value = _date.getDate();
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default DAY;
