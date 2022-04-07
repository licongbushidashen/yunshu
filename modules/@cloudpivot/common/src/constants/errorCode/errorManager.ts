/**
 *   错误码管理类
 */
import app from '../globalApplication';
import ErrorInfo from './error';
import constUtil from '../constUtil';
import axios from 'axios';
import { commonApi } from "@cloudpivot/api";

export default class ErrorManager {
  public errorDescs: Map<number, string>
  constructor () {
    this.errorDescs = new Map();
  }

  // 获取错误码接口
  getErrorCode() {
    // todo
    // commonApi.systemErrorCode().then((res: any) => {
    //   if (res && res.errCode === 0) {
    //     for(let errorCodeInfo of res.data.errorCodeList){
    //       this.errorDescs.set(errorCodeInfo.ErrorCode, errorCodeInfo.ErrorMsg);
    //     }
    //   }
    //  })
    // .catch(err => {
    //   console.log(err);
    // })
  }

  // 根据错误码获取错误描述
  getErrInfo(errCode:any) {
    if (!!errCode) {
        let codeNum = Number(errCode);
        let codeString = errCode.toString();
        if (app.errorManager.errorDescs.has(codeString)) {
            return new ErrorInfo(codeNum, app.errorManager.errorDescs.get(codeString));
        } else {
            return constUtil.getErrInfo(codeNum);
        }
    }
}
}