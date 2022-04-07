import ErrorManager from './errorCode/errorManager';

class GlobalApplication {
  public errorManager : any;
  constructor() {
    this.errorManager = new ErrorManager();            // 错误码管理类
  }

  free () {
    if (!!this.errorManager) this.errorManager = null;
  }
}

const app = new GlobalApplication();
export default app;