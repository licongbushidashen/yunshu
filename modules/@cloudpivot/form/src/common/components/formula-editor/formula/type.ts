/* global CodeMirror  */
import * as SharedFormulaCompiler from '../../formula-compiler/index';

export interface MarkField {
  // @ts-ignore
  from: CodeMirror.Position;
  // @ts-ignore
  to: CodeMirror.Position;
  field: SharedFormulaCompiler.Formula.Field; // 字段
  invalid: boolean; // 是否是有效字段
}
// @ts-ignore
export interface FixCodeMirrorEditor extends CodeMirror.Editor {
  showHint: () => void;
  display: any;
}
