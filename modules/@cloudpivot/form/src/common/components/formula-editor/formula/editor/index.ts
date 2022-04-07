import CodeMirror from 'codemirror';
import './formula-MIME';
import './formula-hint';
import 'codemirror/addon/display/placeholder';
import * as SharedFormulaCompiler from '../../../formula-compiler/index';
import { FixCodeMirrorEditor } from '../type';
import {
  insertField, randomKey,
  insertIdentifier, parseFormulaFromEditorText, getActiveFuncName, insertEditorText,
  paste, copy, getEditorValue,
} from './util';

export type FormulaEditorOptions = {
  fields?: SharedFormulaCompiler.Formula.Field[];
  editorMark?: string;
  placeholder?: string;
  readOnly?: boolean;
  disabledFuncs?: string[];
};

export class FormulaEditor {
  editor: FixCodeMirrorEditor;

  compiler: SharedFormulaCompiler.FormulaCompiler;

  editorMark: string = '';

  keywords: string[] = [];

  fields: Record<string, SharedFormulaCompiler.Formula.Field> = {};

  tokenInfos: Record<string, SharedFormulaCompiler.Formula.TokenInfo> = {};

  fieldRegExp: RegExp = /(\{[A-Za-z0-9.]+\})/g;
  // eslint-disable-next-line
  fieldTextRegExp: RegExp = /(\{.+?\}|(u\(.+?\))|(\{.+?[\.].+?\}))/g;

  debounce = 0;

  readOnly:boolean = false;

  // 提示列表 函数 操作符 关键字等
  formulaTokenHintList: SharedFormulaCompiler.Formula.TokenInfo[] = [];

  // 提示列表 字段
  formulaFieldHintList: SharedFormulaCompiler.Formula.FieldTokenInfo[] = [];

  // 函数标识token
  formulaTokenFuncs: string[] = [];

  requestAnimationFrame =
  window.requestAnimationFrame ||
  function (fn) {
    return setTimeout(fn, 1000 / 60);
  };

  cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;

  constructor (element: HTMLElement, options: FormulaEditorOptions = {}) {
    const {
      fields = [], readOnly = false, placeholder = '请选择或输入数据项、函数', editorMark = '',
      disabledFuncs = [],
    } = options;

    // @ts-ignore
    this.editor = CodeMirror(element, {
      theme: 'formula',

      mode: 'formula',
      addModeClass: true,

      lineNumbers: false,

      lineWrapping: true,

      placeholder: placeholder,

      matchBrackets: {
        maxScanLines: 2000,
        maxHighlightLineLength: 2000,
      },
      hintOptions: {
        completeSingle: false,

        // closeOnUnfocus: false,
        // closeCharacters: /[\s()\[\]{};:>,]/,
      },
      readOnly,
      // https://discuss.codemirror.net/t/how-to-disable-multiple-selection/2291/2 禁止多光标
      configureMouse: () => ({ addNew: false }),
      // 公式编辑器实例
      formulaEditor: this,
    });
    this.compiler = new SharedFormulaCompiler.FormulaCompiler({ disabledFuncs });

    this.setEditorMark(editorMark);

    this.registerFields(fields);
    this.registerFieldHintList();
    this._registerTokenHintList(disabledFuncs);
    this.registerEvent();
  }

  readOnlyToggle (readOnly: boolean) {
    this.readOnly = readOnly;
    // @ts-ignore
    this.editor.setOption('readOnly', this.readOnly ? 'nocursor' : this.readOnly);
  }

  _registerTokenHintList (disabledFuncs: string[]) {
    const _disabledFuncs = disabledFuncs.map(disableFunc => disableFunc.toLocaleUpperCase());
    const symbolRegExp = /[+\-*/=<>]+/;
    const tokenInfos = this.compiler.getTokenInfo();
    this.tokenInfos = tokenInfos.reduce((infos, info) => {
      infos[info.name] = info;
      return infos;
    }, {});
    this.formulaTokenHintList = tokenInfos
      .filter(token => !token.name.match(symbolRegExp) && !_disabledFuncs.includes(token.name));
    this.formulaTokenFuncs = Object.keys(this.compiler.funcs).filter(func => !_disabledFuncs.includes(func));
  }

  registerFields (fileds: SharedFormulaCompiler.Formula.Field[]) {
    this.fields = fileds.map(field => {
      const {
        id, name, sourceType = SharedFormulaCompiler.Formula.TokenType.FIELD, paramType,
        fieldType = SharedFormulaCompiler.Formula.FieldType.BASIC,
        value, formula, formulaFormat, /*  color, bgColor, */
      } = field;
      if (!id || !name || !paramType) {
        console.warn('存在字段未传入 id, name, paramType', field);
      }
      return {
        id: id || '',
        name: name || '暂无名称',
        sourceType,
        paramType: paramType || SharedFormulaCompiler.Formula.ParamType.ANY,
        fieldType: fieldType,
        value,
        formula,
        formulaFormat,
        // color,
        // bgColor,
      };
    }).filter(field => field.id).reduce((fields, field) => {
      fields[field.id] = field;
      return fields;
    }, {});
  }

  registerFieldHintList () {
    const tokenInfo: SharedFormulaCompiler.Formula.FieldTokenInfo[] = Object.values(this.fields).map(field => {
      const {
        id, name, sourceType = SharedFormulaCompiler.Formula.TokenType.FIELD, paramType,
        fieldType = SharedFormulaCompiler.Formula.FieldType.BASIC,
      } = field;
      return {
        id: id || '',
        name: name || '',
        type: sourceType,
        paramType: paramType || SharedFormulaCompiler.Formula.ParamType.TEXT,
        fieldType,
      };
    });
    this.formulaFieldHintList = tokenInfo;
  }

  /**
   * 注册事件
   */
  private registerEvent () {
    // @ts-ignore
    this.editor.on('change', () => {
      this.editor.showHint();
      CodeMirror.signal(this, 'change');
    });

    // @ts-ignore
    this.editor.on('blur', () => {
      CodeMirror.signal(this, 'blur');
    });

    // @ts-ignore
    this.editor.on('focus', () => {
      CodeMirror.signal(this, 'focus');
    });

    // @ts-ignore
    this.editor.on('copy', (cm: FixCodeMirrorEditor, evt) => {
      evt.preventDefault();
      copy(cm, evt, { editorMark: this.editorMark });
    });

    // @ts-ignore
    this.editor.on('cut', (cm: FixCodeMirrorEditor, evt) => {
      evt.preventDefault();
      copy(cm, evt, { editorMark: this.editorMark });
      // @ts-ignore
      if (cm.isReadOnly()) {
        return;
      }
      // @ts-ignore
      cm.replaceSelection('');
    });
    // @ts-ignore
    this.editor.on('paste', (cm: FixCodeMirrorEditor, evt) => {
      evt.preventDefault();
      // @ts-ignore
      if (cm.isReadOnly()) {
        return;
      }
      paste(cm, evt, { editorMark: this.editorMark, fields: this.fields });
    });

    // @ts-ignore
    this.editor.on('cursorActivity', () => {
      if (this.debounce) {
        cancelAnimationFrame(this.debounce);
        this.debounce = 0;
      }
      this.debounce = requestAnimationFrame(() => {
        const funcName = getActiveFuncName(this.editor);
        if (this.formulaTokenFuncs.includes(funcName.toUpperCase())) {
          CodeMirror.signal(this, 'tip', funcName);
        }
      });
    });
  }

  /**
   * 添加字段
   * @param field
   */
  insertField (fieldId: string) {
    const field = this.fields[fieldId];
    if (!field) {
      return;
    }
    insertField(this.editor, field);
    this.focus();
  }

  insertIdentifier (identifierKey: string) {
    if (!identifierKey) {
      return;
    }
    const tokenInfo = this.tokenInfos[identifierKey.toUpperCase()];
    if (tokenInfo) {
      insertIdentifier(this.editor, tokenInfo);
    }
    this.focus();
  }

  /**
   * 设置值 不校验字段在字符串内
   * @param editorText
   */
  setValue (editorText: string): void {
    insertEditorText(this.editor, editorText, this.editorMark, this.fields, true);
  }

  setEditorMark (editorMark: string):void {
    this.editorMark = (editorMark && editorMark.length) ? editorMark : (this.editorMark || `field-${randomKey(8)}`);
  }

  // 预检查
  preValidate (editorText: string): SharedFormulaCompiler.ValidateResult {
    let result = true;
    let err: SharedFormulaCompiler.ParserError = new SharedFormulaCompiler.ParserError("", "", "");
    // 空值
    if (!editorText || editorText.length === 0) {
      err = SharedFormulaCompiler.generateError('请输入公式');
      result = false;
    }
    // 字符串中含有字段
    const strs = editorText.match(/"(\["]|[^"])*"/g);
    if (strs) {
      const markRegEep = new RegExp(`(?<match><${this.editorMark}[^>]*>(?<id>.*?)<\\/${this.editorMark}>)`, 'g');
      for (const str of strs) {
        if (markRegEep.test(str)) {
          err = SharedFormulaCompiler.generateError('在字符串""中不应插入字段或者""没有成对输入');
          result = false;
          break;
        }
      }
    }
    return {
      result,
      err,
    };
  }

  validate (resultType?: SharedFormulaCompiler.Formula.ParamType,
    fieldId?: string): SharedFormulaCompiler.ValidateResult {
      
    const editorText = this.getValue();
    const perResult = this.preValidate(editorText);
    return !perResult.result ? perResult
      : this.compiler.validate(
        this.parseFormulaFromEditorText(editorText),
        Object.values(this.fields).map(item => {
          const {
            id, name, paramType, fieldType, formula, formulaFormat,
          } = item;
          const _item: SharedFormulaCompiler.Formula.FieldParam = {
            id,
            name,
            paramType,
            fieldType,
            sourceType: SharedFormulaCompiler.Formula.SourceType.FIELD,
            formula,
            formulaFormat,
          };
          return _item;
        }), resultType, fieldId);
  }

  calculate (fields?: SharedFormulaCompiler.Formula.Field[]): SharedFormulaCompiler.CalculateResult {
    const editorText = this.getValue();
    const perResult = this.preValidate(editorText);
    return !perResult.result ? { result: 'N/A', err: perResult.err }
      : this.compiler.calculate(
        this.parseFormulaFromEditorText(editorText),
        (fields || Object.values(this.fields)).map(item => {
          const {
            id, name, paramType, fieldType, value, formula, formulaFormat,
          } = item;
          const _item: SharedFormulaCompiler.Formula.FieldParam = {
            id,
            name,
            paramType,
            fieldType,
            sourceType: SharedFormulaCompiler.Formula.SourceType.FIELD,
            value,
            formula,
            formulaFormat,
          };
          return _item;
        }));
  }

  parseFormulaFromEditorText (editorText:string) {
    return parseFormulaFromEditorText(editorText, this.editorMark);
  }

  /**
   * 获取值
   */
  getValue (): string {
    return getEditorValue(this.editor, this.editorMark);
  }

  getLabel (): string {
    return getEditorValue(this.editor, this.editorMark, true);
  }

  focus () {
    // @ts-ignore
    this.editor.focus();
  }

  on (type: string, func:Function) {
    CodeMirror.on(this, type, func);
  }

  off (type: string, func:Function) {
    CodeMirror.off(this, type, func);
  }
}
