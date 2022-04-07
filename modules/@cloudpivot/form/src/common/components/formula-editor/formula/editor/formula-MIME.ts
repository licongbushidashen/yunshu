import CodeMirror from 'codemirror';

/**
 * 处理字符串
 * @param stream
 * @param marks
 */
function handleString (stream: CodeMirror.StringStream, marks: string) {
  let prevIsEscapes = false;
  let tmpStr: string = stream.next();
  while (tmpStr != null) {
    if (tmpStr === marks && !prevIsEscapes) {
      return true;
    }
    prevIsEscapes = tmpStr === '\\';
    tmpStr = stream.next();
  }
  return false;
}

const numberRegExp = /\d/;
const symbolRegExp = /[,()]/;
const operatorSymbolRegExp = /[+\-*/=<>]/;

const operators = ['AND', 'OR'];

const boolKeywords = ['TRUE', 'FALSE'];

// const nullKeywords = ['NULL'];

type TokenState = {
  editorConfiguration: CodeMirror.EditorConfiguration;
};

/**
 * 处理字符串
 * @param stream 字符串流
 * @param state 初始状态
 */
function token (stream: CodeMirror.StringStream, state:TokenState) {
  // @ts-ignore
  const { formulaEditor } = state.editorConfiguration;
  const formulaTokenFuncs = formulaEditor.formulaTokenFuncs || [];
  // 判断是否空格
  if (stream.eatSpace()) {
    return 'space';
  }
  const char: string = stream.next();
  if (char === '"') { // 单引号还是双引号 || char === "'"
    return handleString(stream, char) ? 'text' : 'unknown';
  }

  if (numberRegExp.test(char)) {
    let unmatchChar: string = '';
    stream.eatWhile((_char) => {
      const match = /[\d]/.test(_char);
      if (!match) {
        unmatchChar = _char;
      }
      return match;
    });
    if (typeof unmatchChar !== 'undefined' && unmatchChar === '.') {
      stream.next();
      stream.eatWhile(/[\d]/);
    }
    return 'number';
  }
  if (symbolRegExp.test(char)) {
    return 'symbol';
  }
  if (operatorSymbolRegExp.test(char)) {
    return 'operator';
  }
  stream.eatWhile(/[\w]/);
  const current = stream.current().toLocaleUpperCase();

  if (operators.includes(current)) {
    return 'operator';
  }

  if (boolKeywords.includes(current)) {
    return 'bool keyword';
  }

  // if (nullKeywords.includes(current)) {
  //   return 'null keyword';
  // }

  if (formulaTokenFuncs.includes(current)) {
    return 'func';
  }

  return 'unknown';
}

CodeMirror.defineMode('formula', (editorConfiguration) => {
  const mode: CodeMirror.Mode<TokenState> = {
    startState () {
      return { editorConfiguration };
    },
    token: token,
  };
  return mode;
});
CodeMirror.defineMIME('text/fx-formula', 'formula');
