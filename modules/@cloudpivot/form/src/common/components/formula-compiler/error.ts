
export class ParserError extends Error {
  type: string;

  info: string;

  extraMessage?: string;

  constructor (message: string, extraMessage: string, type: string) {
    super(message);
    this.type = type;
    this.info = message;
    this.extraMessage = extraMessage;
  }
}
export const FORMULA_ERROR = 'formula-error';
export const FORMULA_ERROR_DIV_ZERO = 'formula-error-div-zero';
export const FORMULA_ERROR_NOT_AVAILABLE = 'formula-error-not-available';

export const FORMULA_ERROR_GRAMMAR = 'formula-error-grammar';

export type ParserErrorOption = {
  extraMessage?: string;
  errorType?: string;
};

export function generateError (message: string, options: ParserErrorOption = {}): ParserError {
  const { extraMessage = '', errorType = FORMULA_ERROR } = options;
  const err = new ParserError(message, extraMessage, errorType);
  return err;
}

export function validateError (err: Error): ParserError {
  if (err instanceof ParserError) {
    return err;
  }
  const _err = (err as ParserError);
  _err.type = FORMULA_ERROR_GRAMMAR;
  // eslint-disable-next-line max-len
  _err.info = '解析错误，请检查核对函数语法后重新输入：\n1. 括号是否为英文输入状态下输入，是否使用除 + - * / = < > , " ( ) 以外的特殊符号；\n2. 手动输入文本时，是否使用英文双引号标识 (如 "输入的文字" ）；\n3. 是否存在并行函数 (如 函数(1) 函数(1) )；\n4. 函数中是否存在多余的逗号， (如 函数(1,) )；\n 5. <> <= >= 中间是否出现了空格；';
  return _err;
}
