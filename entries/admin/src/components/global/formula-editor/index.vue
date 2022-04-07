<template>
  <div
    class="h3-formula-editor"
    contenteditable="true"
    ref="formulaEditor"
    :id="id"
    @focus="onEditorFocus"
    @blur="onEditorBlur"
    @input="onContentChange"
    @click="recordRange"
    @keyup="onKeyup"
    @keydown="onKeydown"
  ></div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import editorUtils from './utils';

@Component({
  name: "formula-editor"
})
export default class FormulaEditor extends Vue {
  // 编辑器默认原始内容
  @Prop() value!: string;

  // 编辑器需要提示的变量映射表
  @Prop() variableMap!: any;

  // 编辑器id
  @Prop({
    default: 'formulaEditor'
  }) id!: string;

  // 编辑器节点
  editorDom: any = null;

  // 编辑器需要提示的变量映射表
  // variableMap: any = {
  //   '{abc}': 'ABC变量',
  //   '{def}': 'DEF变量'
  // };

  // 函数表达式内容
  formulaContent: string = '';

  // 编辑器的实时内容
  editorContent: string = '';

  // 输入任务定时器
  taskTimeout: any = null;

  // 编辑区光标位置
  selectionEnd: number = -1;

  // 编辑区最近一次光标定位区域
  lastEditRange: Range | null = null;

  /**
   * 初始化编辑器
   */
  initEditor() {
    this.formulaContent = this.value.split('&&').join('+');
    this.editorDom = this.$refs.formulaEditor;
    this.$nextTick(() => {
      this.setEditorHtml();
    });
  }

  /**
   * 记录上次光标位置
   */
  recordRange() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      const range = selection.getRangeAt(0);

      const isInEditor: boolean = editorUtils.isChildOf(range.startContainer, this.id);
      if (isInEditor) {
        this.lastEditRange = range;
      } else {
        this.lastEditRange = null;
        editorUtils.cursorToEnd(this.editorDom);
      }
    }
  }

  /**
   * 聚焦到编辑器
   */
  focus() {
    editorUtils.cursorToEnd(this.editorDom);
    this.recordRange();
  }

  /**
   * 编辑器获得焦点
   */
  onEditorFocus(e: any) {
    console.log('editor focus');
    this.$emit('focus');
  }

  /**
   * 编辑器失去焦点
   */
  onEditorBlur(e: any) {
    console.log('editor blur');
    this.$emit('blur');
  }

  /**
   * 编辑器内容改变
   */
  onContentChange(el: any) {
    clearTimeout(this.taskTimeout);
    this.taskTimeout = setTimeout(() => {
      this.editorContent = el.target.innerHTML;
      this.contentToFormula();
      // 检查编辑器内容，并实时转换表达式
      this.recognizeExpress();
      // 记录光标位置
      this.recordRange();
    }, 500);
  }

  /**
   * 按键事件
   */
  onKeyup(evt: any) {
    if (['Enter'].includes(evt.key)) {
      return;
    }
    this.recordRange();
  }

  /**
   * 按键按下事件
   */
  onKeydown(evt: any) {
    if (['Enter'].includes(evt.key)) {
      console.log('stopped Enter event');
      
      evt.stopPropagation();
      evt.preventDefault();
    }
  }

  /**
   * 在编辑器内容区输入内容时自动识别包含的表达式并转换
   */
  recognizeExpress() {
    console.log('start recognize');

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      this.outputFormula();
      return;
    }

    editorUtils.recognizeExpression(selection, this.variableMap);

    // 主动输出表达式
    this.outputFormula();
  }

  /**
   * 向编辑器光标所在位置插入外部内容
   * @param content 插入文本内容
   * @param atTail 是否直接添加到内容尾部
   */
  insertContent(content: string, atTail?: boolean, name?: string) {
    // console.log('insert content:', content);
    if (!content) {
      return;
    }

    let html: string = '';
    if(name){
      html = `<span title="${content}" contenteditable="false">${name}</span>`;
    }else{
      // 1. 将传入内容转换为识别表达式后的html
      html = editorUtils.formulaToContent(content, this.variableMap);
    }
   
    // console.log('html', html);

    if (atTail) {
      // 2. 如果是直接追加内容，则直接更新编辑器内容
      if (this.editorDom.innerHTML) {
        html = '+' + html;
      }

      const selection = editorUtils.cursorToEnd(this.editorDom);

      if (!selection || !selection.rangeCount) {
        return;
      }

      const range = selection.getRangeAt(0);
      editorUtils.doInsert(html, selection, range);
    } else {
      // 3. 如果不是直接追加，则判断光标位置，并做预判插入
      const selection = window.getSelection();

      if (!selection || !selection.rangeCount) {
        return;
      }

      // 恢复上次记录的光标位置
      if (this.lastEditRange) {
        selection.removeAllRanges();
        selection.addRange(this.lastEditRange);
      }
      
      const range = selection.getRangeAt(0);

      // 判断目标选区是否在编辑区域，否则中断插入
      const isInEditor: boolean = editorUtils.isChildOf(range.startContainer, this.id);
      if (!isInEditor) { return }

      // 清空选取内容并将选区收起为光标
      range.deleteContents();
      range.collapse(true);

      html = editorUtils.joinConnection(this.editorDom, html, selection);

      editorUtils.doInsert(html, selection, range);
    }

    this.outputFormula();

    this.$nextTick(() => {
      this.recordRange();
    });
  }

  /**
   * 输出编辑器的表达式内容
   */
  outputFormula() {
    // 将处理结果转换为公式，并触发change事件
    this.editorContent = this.editorDom.innerHTML;
    this.contentToFormula();
    this.$nextTick(() => {
      // console.log('editor formulaContent:\t', this.formulaContent);

      this.$emit('change', this.formulaContent);
    })
  }

  /**
   * 设置编辑器html内容
   */
  setEditorHtml() {
    this.editorDom.innerHTML = editorUtils.formulaToContent(this.formulaContent, this.variableMap);
    this.editorContent = this.editorDom.innerHTML;
    setTimeout(() => {
      const spans = this.editorDom.querySelectorAll('span');
      if (spans) {
        spans.forEach((p: any) => {
          editorUtils.bindVariableEvent(p);
        });
      }
      this.focus();
    }, 200);
  }

  /**
   * 将编辑器的编辑内容转换为纯公式文本
   * <span title="code" contenteditable="false">变量名</span> --> {code}
   */
  contentToFormula() {
    if (!this.editorContent) {
      this.formulaContent = '';
      return;
    }
    const formulaResult: string = editorUtils.contentToFormula(this.editorContent);
    // console.log('translate result ->',formulaResult);
    this.formulaContent = formulaResult;
  }

  mounted() {
    this.initEditor();
  }

  // 监听值变化
  @Watch('value')
  onValueChange(val: string) {
    if (val !== this.formulaContent) {
      this.formulaContent = val;
      this.initEditor();
    }
  }

}
</script>
<style lang="less" scoped>
.h3-formula-editor {
  display: inline-block;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  // padding: 5px;
  // margin: 8px;
  margin: 0;
  // border: 1px solid #ccc;
  // border-radius: 4px;
  /deep/span[contenteditable] {
    display: inline-block;
    color: @primary-color;
    margin-left: 3px;
    margin-right: 3px;
  }
}
</style>
<style lang="less">
.formula {
  .ant-modal-header,
  .ant-modal-footer {
    user-select: none;
    -webkit-user-select: none;
  }
}
</style>
