import { Formula } from '../type';
import { getDateInstanceFromParam, getFieldName } from '../utils';
import { generateError } from '../error';

const DAYS: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'DAYS',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.EDIT,
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [prev, next] = _params;
    const prevDate = getDateInstanceFromParam(prev.value);
    const nextDate = getDateInstanceFromParam(next.value);
    if (!prevDate || !nextDate) {
      throw generateError(`函数 ${identifier.name}() 中时间参数${
        !prevDate ? getFieldName(prev) : ''
      }${
        !nextDate ? getFieldName(next) : ''
      }转成时间时出现错误`);
    }
    const value = Math.ceil(Math.abs((prevDate.getTime() - nextDate.getTime()) / (24 * 3600 * 1000)));
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default DAYS;
