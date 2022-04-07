import ErrorInfo from './errorCode/error';
import errorUtil from './errorCode/errorUtil'

class ConstUtils {
  getErrInfo(errCode: any) {
    if (errCode) {
        return new ErrorInfo(errCode, errorUtil.getRetCodeDetail(errCode));
    }
  }
}

const constUtil = new ConstUtils();
export default constUtil;