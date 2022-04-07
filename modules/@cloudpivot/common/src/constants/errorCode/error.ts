/**
 * 错误信息类
 */
export default class ErrorInfo {
  public code: number;
  public message: string;
  constructor(code: number, message: string) {
    this.code = code;
    this.message = message
  }
}