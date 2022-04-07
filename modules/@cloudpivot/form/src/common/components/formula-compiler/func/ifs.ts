import { Formula } from '../type';
import { generateError } from '../error';
import {
  checkFieldParamFromRelevance, checkFieldParamFromSublist, getFieldName, getParamTypeValue,
} from '../utils';

const IFS: Formula.Identifier<Formula.IdentifierType.FUNC> = {
  name: 'IFS',
  type: Formula.IdentifierType.FUNC,
  outputType: {
    paramType: Formula.ParamType.ANY,
    sourceType: Formula.SourceType.EDIT,
  },
  validate (identifier, params) {
    checkFieldParamFromSublist(identifier, params);
    checkFieldParamFromRelevance(identifier, params);
    if (params.length < 4) {
      throw generateError(`函数 ${identifier.name}() 至少需要4个参数，但传入了${params.length}个参数`);
    }
    if (params.length % 2 === 1) {
      throw generateError(`函数 ${identifier.name}() 要求[条件, 返参]2个参数为一组，存在不成组情况`);
    }
    const defaultTrue = params[params.length - 2];
    if (!defaultTrue ||
      defaultTrue.sourceType !== Formula.SourceType.EDIT ||
      defaultTrue.paramType !== Formula.ParamType.BOOL ||
      defaultTrue.value !== true) {
      throw generateError(`函数 ${identifier.name}() TRUE为必要条件，表示不满足前者所有条件下需要返回的绝对参数`);
    }

    let resultType = params[1].paramType;
    let pass = true;
    for (let index = 0, len = params.length; index < len; index++) {
      const param = params[index];
      if (index % 2 === 0) {
        if (param.paramType !== Formula.ParamType.BOOL) {
          pass = false;
          break;
        }
      } else {
        if (param.paramType !== resultType) {
          resultType = Formula.ParamType.ANY;
          pass = false;
          break;
        }
      }
    }

    if (!pass) {
      throw generateError(`函数 ${identifier.name}() 要求[条件, 返参]2个参数为一组，要求条件为逻辑类型，要求返参类型一致，现在传入为函数 ${
        identifier.name
      }(${
        params.map((param, index) => `${
          index % 2 === 0 ? '条件类型' : '返参类型'
        }：${getFieldName(param)}${getParamTypeValue(param.paramType)}`).join(', ')
      })`);
    }

    return {
      ...identifier.outputType,
      paramType: resultType,
    } as Formula.Param;
  },
  calculate: (identifier, params, compiler) => {
    const _params = compiler._pretreatment(identifier, params);

    let value: any;
    let result = false;
    const paramType: Formula.ParamType = _params[1].paramType;

    for (let index = 0, len = _params.length; index < len; index += 2) {
      const condition = params[index];
      const _param = params[index + 1];
      if (condition.value) {
        value = _param.value;
        result = true;
        break;
      }
    }
    if (!result) {
      switch (paramType) {
        case Formula.ParamType.BOOL:
          value = false;
          break;
        case Formula.ParamType.TEXT:
          value = '';
          break;
        case Formula.ParamType.DATE:
          value = null;
          break;
        case Formula.ParamType.NUMBER:
          value = 0;
          break;
        default:
          break;
      }
    }

    return {
      ...identifier.outputType,
      paramType,
      value,
    } as Formula.Param;
  },
};

export default IFS;
