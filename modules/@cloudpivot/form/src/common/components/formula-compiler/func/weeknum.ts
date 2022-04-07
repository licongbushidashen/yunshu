import { Formula } from '../type';
import { getDateInstanceFromParam, getFieldName } from '../utils';
import { generateError } from '../error';

const WEEKNUM: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'WEEKNUM',
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
    const first = new Date(_date.getFullYear(), 0, 1);
    const days = Math.floor((_date.getTime() - first.getTime()) / (24 * 3600 * 1000));
    const value = Math.ceil((days + ((_date.getDay() + 1) - 1)) / 7);
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default WEEKNUM;
