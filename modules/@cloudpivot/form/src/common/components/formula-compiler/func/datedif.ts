import toNumber from 'lodash/toNumber';
import { Formula } from '../type';
import { getDateInstance, dateFormat, checkDate } from '../utils';
import { generateError } from '../error';

const DATEDIF: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'DATEDIF',
  type: Formula.IdentifierType.FUNC,
  inputType: [{
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.DATE,
    sourceType: Formula.SourceType.ANY,
  }, {
    paramType: Formula.ParamType.TEXT,
    sourceType: Formula.SourceType.ANY,
  }],
  outputType: {
    paramType: Formula.ParamType.NUMBER,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params, compiler) {
    const outputType = compiler._funcValidate(identifier, params);
    const [start_date, end_date, unit] = params;
    let toString:Function = Object.prototype.toString;
    if (start_date.paramType !== 'date') {
      throw generateError(`函数 ${identifier.name}() 第一个参数必须是日期类型`);
    }
    if (end_date.paramType !== 'date') {
      throw generateError(`函数 ${identifier.name}() 第二个参数必须是日期类型`);
    }
    if (['y', 'M', 'd', 'h', 'm', 's'].indexOf(unit.value) === -1) {
      throw generateError(`函数 ${identifier.name}() 第三个参数必须是y/M/d/h/m/s`);
    }

    return outputType;
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);
    const [start_date, end_date, unit] = params;
    if (toString.call(start_date.value) !== '[object Date]') {
      throw generateError(`函数 ${identifier.name}() 第一个参数必须是日期类型`);
    }
    if (toString.call(end_date.value) !== '[object Date]') {
      throw generateError(`函数 ${identifier.name}() 第二个参数必须是日期类型`);
    }
    if (['y', 'M', 'd', 'h', 'm', 's'].indexOf(unit.value) === -1) {
      throw generateError(`函数 ${identifier.name}() 第三个参数必须是y/M/d/h/m/s`);
    }
    // todo
    const value = null;
    return {
      ...identifier.outputType,
      value,
    } as Formula.Param;
  },
};

export default DATEDIF;
