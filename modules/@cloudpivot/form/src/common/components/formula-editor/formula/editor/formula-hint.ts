import CodeMirror from 'codemirror';
import * as SharedFormulaCompiler from '../../../formula-compiler/index';
import 'codemirror/addon/hint/show-hint';
import { FixCodeMirrorEditor } from '../type';
import { insertIdentifier, insertField } from './util';

export interface FormulaHint extends CodeMirror.Hint {
  extraInfo: SharedFormulaCompiler.Formula.TokenInfo;
}

// function getText (completion: CodeMirror.Hint) {
//   if (typeof completion === 'string') return completion;
//   else return completion.text;
// }

// 自定义渲染方式
function hintRender (cm: FixCodeMirrorEditor, data: CodeMirror.Hints, completion: CodeMirror.Hint) {
  // @ts-ignore
  const formulaEditor: any = cm.getOption('formulaEditor');

  const { extraInfo } = completion as FormulaHint;
  if (extraInfo.type === SharedFormulaCompiler.Formula.TokenType.FIELD) {
    const fields: Record<string, SharedFormulaCompiler.Formula.Field> = formulaEditor.fields || {};
    const field = fields[(extraInfo as SharedFormulaCompiler.Formula.FieldTokenInfo).id];
    if (field) {
      insertField(cm, field, { from: data.from, to: data.to });
    }
  } else {
    insertIdentifier(cm, extraInfo, { from: data.from, to: data.to });
  }
  // @ts-ignore
  cm.focus();
}

function hintElRender (el: HTMLElement, data: CodeMirror.Hints, completion: CodeMirror.Hint) {
  const { extraInfo } = completion as FormulaHint;
  // @ts-ignore
  el.__extraInfo__ = extraInfo;
  el.innerText = extraInfo.name;
}

function getHintList (cm: FixCodeMirrorEditor, code: string): FormulaHint[] {
  // @ts-ignore
  const formulaEditor: any = cm.getOption('formulaEditor');

  const formulaTokenHintList: SharedFormulaCompiler.Formula.TokenInfo[] = formulaEditor.formulaTokenHintList;
  const formulaFieldHintList: SharedFormulaCompiler.Formula.FieldTokenInfo[] = formulaEditor.formulaFieldHintList;
  const _code = code.toUpperCase();
  const hintList: FormulaHint[] = [
    ...formulaFieldHintList.map(info => ({
      text: info.name,
      className: `cm-hint-${info.type} cm-hint-${info.paramType}`,
      hint: hintRender,
      render: hintElRender,
      extraInfo: info,
    })),
    ...formulaTokenHintList.map(info => ({
      text: info.name,
      className: `cm-hint-${info.type}`,
      hint: hintRender,
      render: hintElRender,
      extraInfo: info,
    })),
  ].filter(hint => (hint.text.includes(_code) && hint.text !== _code) || hint.text === _code ||
  // 字段不需要转换成大写字母
      (hint.text.includes(code) && hint.text !== code) || hint.text === code);
  return hintList;
}

CodeMirror.registerHelper('hint', 'formula', (cm: FixCodeMirrorEditor/* , options: CodeMirror.LintStateOptions */) => {
  // @ts-ignore
  const cur = cm.getCursor();
  // @ts-ignore
  const lineToken = cm.getLineTokens(cur.line);
  let pass = false;
  // 在字符串 "" 或 函数名中 不提示
  if (lineToken && lineToken.length) {
    pass = lineToken.filter(token => token.end > cur.ch && token.start < cur.ch)
      .some(token => ['func', 'text', 'keyword', 'operator'].includes(token.type));
  }
  let hintResult: any = {
    list: [],
    from: cur,
    to: cur,
  };
  if (!pass) {
    const word: RegExp = /[\w$]+/;
    const cnWord: RegExp = /[^\x20-\xff]+/;
    // @ts-ignore
    const curLine = cm.getLine(cur.line);
    const end = cur.ch;

    let start = end;
    while (start && (cnWord.test(curLine.charAt(start - 1)) || word.test(curLine.charAt(start - 1)))) --start;
    const curWord = start !== end ? curLine.slice(start, end) : '';
    const list: any[] = curWord ? getHintList(cm, curWord) : [];
    hintResult = {
      list,
      from: CodeMirror.Pos(cur.line, start),
      to: CodeMirror.Pos(cur.line, end),
    };
  }
  CodeMirror.on(hintResult, 'shown', () => {
    // @ts-ignore
    const hints = cm.state.completionActive.widget.hints;
    if (!hints) {
      return;
    }
    const hintNodes = hints.childNodes;
    const len = hintNodes.length;
    for (let i = 0; i < len; i++) {
      CodeMirror.on(hintNodes[i], 'mouseover', (evt) => {
        const currentTarget = evt.currentTarget;
        const extraInfo = (currentTarget.__extraInfo__ as SharedFormulaCompiler.Formula.TokenInfo);
        // @ts-ignore
        const formulaEditor: any = cm.getOption('formulaEditor');
        CodeMirror.signal(formulaEditor, 'tip', extraInfo.name);
      });
    }
  });
  // CodeMirror.on(hintResult, 'pick', (completion: CodeMirror.Hint) => {
  // });

  CodeMirror.on(hintResult, 'select', (completion: CodeMirror.Hint) => {
    const { extraInfo } = completion as FormulaHint;
    // @ts-ignore
    const formulaEditor: any = cm.getOption('formulaEditor');
    CodeMirror.signal(formulaEditor, 'tip', (extraInfo as SharedFormulaCompiler.Formula.TokenInfo).name);
  });
  return hintResult;
});
