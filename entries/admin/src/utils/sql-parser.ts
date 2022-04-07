/*
 * @Author: nooldey <nooldey@gmail.com> 
 * @Date: 2020-04-14 15:34:40 
 * @Last Modified by: nooldey
 * @Last Modified time: 2020-04-15 14:23:40
 * 仅解析SQL语句预设格式：[ANY]=:[出参]
 */

function parserSql(sqlstring) {
  // debugger
  const inputParamReg = /(?<=:)\w+/g;

  let inputParams: string[] = sqlstring.match(inputParamReg) || [];

  if (inputParams.length) {
    inputParams = Array.from(new Set(inputParams));
    let stringInputParams: string[] = [];
    inputParams.forEach((item)=>{
      if(isNaN(Number(item))){
        stringInputParams.push(item);
      }
      inputParams = stringInputParams.slice(0);
    });
  } else{
    inputParams = [];
  }

  return {
    inputParams,
  }
}

export default parserSql