<template>
  <div :class="['shared-formula-editor', {'shared-formula-editor--disabled': disabled}]"></div>
</template>
<script>
import debounce from 'lodash/debounce';

export default {
  name: 'formulaEditor',
  props: {
    value: {
      type: Object,
      default: () => ({ formula: '', editorText: '', editorMark: '' }),
    },
    fields: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    disabledFuncs: {
      type: Array,
      default: () => [],
    },
    fieldId: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '请选择或输入数据项、函数',
    },
    resultType: {
      type: String,
      validate: (value) => !value || ['text', 'date', 'number', 'bool', 'address'].includes(value),
      default: '',
    },
  },
  data () {
    return {
      editor: null,
      isFocus: false,
      editorText: '',
      editorMark: '',
      formula: '',
    };
  },
  watch: {
    value (nVal) {
      this.setRequired(nVal);
    },
    fields (nVal) {
      this.registerFields(nVal);
    },
    disabled (nVal) {
      this.readOnlyToggle(nVal);
    },
    placeholder (nVal) {
      this.setPlaceholder(nVal);
    },
  },
  created () {
    this.fireChange = debounce(() => {
      this._fireChange();
    }, 100, {
      leading: false,
      trailing: true,
    });
  },
  async mounted () {
    await this.initializeEditor();
    this.readOnlyToggle(this.disabled);
    this.setRequired(this.value || {});
  },
  beforeDestroy () {
    this.editor.off('change', this.fireChange);
    this.editor.off('blur', this.fireBlur);
    this.editor.off('focus', this.fireFocus);
    this.editor.off('tip', this.fireTip);
    this.editor = null;
  },
  methods: {
    async initializeEditor () {
    // prettier-ignore
    // eslint-disable-next-line max-len
      const { FormulaEditor } = await import(/* webpackChunkName: "formula-editor-base", webpackMode: "eager" */ './formula/editor/index');
      this.editor = new FormulaEditor(this.$el, {
        fields: this.fields,
        readOnly: this.readOnly,
        placeholder: this.placeholder,
        disabledFuncs: this.disabledFuncs,
      });
      this.editor.on('change', this.fireChange);
      this.editor.on('blur', this.fireBlur);
      this.editor.on('focus', this.fireFocus);
      this.editor.on('tip', this.fireTip);
    },
    setRequired (value) {
      const { formula = '', editorText = '', editorMark = '' } = (value || {});
      this.formula = formula;
      this.editorMark = editorMark;
      this.editorText = editorText;
      this.setEditorMark(this.editorMark);
      this.setEditorText(this.editorText);
    },

    registerFields (value) {
      this.editor.registerFields(value);
      this.editor.registerFieldHintList();
      this.setEditorText(this.editorText);
    },

    setPlaceholder (value) {
      this.editor.setPlaceholder(value);
    },
    /**
     * 插入字段
     * @param field
     */
    insertField (field) {
      this.editor.insertField(field);
    },

    /**
     * 插入公式
     * @param identifierKey
     */
    insertIdentifier (identifierKey) {
      this.editor.insertIdentifier(identifierKey);
    },

    setEditorMark (editorMark) {
      this.editor.setEditorMark(editorMark);
    },
    /**
     * 设置公式值
     * @param editorText
     */
    setEditorText (editorText) {
      this.editor.setValue(editorText);
    },

    /**
     * 获取公式值
     */
    getValue () {
      this.editorText = this.editor.getValue();
      this.formula = this.editor.parseFormulaFromEditorText(this.editorText);
      return {
        formula: this.formula,
        editorText: this.editorText,
        editorMark: this.editor.editorMark,
      };
    },

    /**
     * 获取公式值
     */
    getLabel () {
      return this.editor.getLabel();
    },
    /**
     * 切换只读模式
     */
    readOnlyToggle (disabled) {
      this.editor.readOnlyToggle(disabled);
    },

    /**
     * 公式检验
     */
    validate () {
      return this.editor.validate(this.resultType, this.fieldId);
    },
    /**
     * 公式检验
     */
    calculate (fields) {
      return this.editor.calculate(fields);
    },

    /**
     * 获取焦点
     */
    focus () {
      return this.editor.focus();
    },

    /**
     * 公式改变事件
     */
    fireChange () {
    },
    _fireChange () {
      const value = this.getValue();
      const { formula, editorMark, editorText } = value;
      this.formula = formula;
      this.editorMark = editorMark;
      this.editorText = editorText;
      this.$emit('change', value);
    },

    /**
     * 公式失去焦点事件
     */
    fireBlur () {
      this.isFocus = false;
      this.$emit('blur');
    },

    fireFocus () {
      this.isFocus = true;
      this.$emit('focus');
    },

    fireTip (tokenInfo) {
      this.$emit('tip', tokenInfo);
    },
  },
};
</script>

<style lang="less">
@import './style/index';
</style>
