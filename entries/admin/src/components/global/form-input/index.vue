<template>
  <div :class="['form-input',message && 'has-error']">
    <template v-if="tipPosition === 'top'">
      <a-tooltip :visible="showTooltip">
        <template slot="title">
          <span>{{ message }}</span>
        </template>
        <a-input-number
          v-if="loaded && type === 'number'"
          :type="type"
          :maxLength="maxLength"
          :defaultValue="defaultValue || value"
          :placeholder="placeholder"
          :disabled="disabled"
          @change="validateValue"
          @blur="onBlur"
        />
        <template v-else-if="loaded && rules[0].type === 'date'">
          <a-date-picker
            style="width:100%"
            format="YYYY-MM-DD HH:mm:ss"
            :defaultValue="defaultValue || value"
            :placeholder="placeholder"
            :showTime="true"
            :disabled="disabled"
            @change="validateValue"
            @blur="onBlur"
          />
        </template>
        <template v-else-if="loaded && rules[0].type === 'logic'">
          <a-select
            style="width:100%"
            :defaultValue="defaultValue || value"
            :placeholder="placeholder"
            :disabled="disabled"
            @change="validateValue"
            @blur="onBlur"
            :allowClear="true"
          >
            <a-select-option value="true">
              true
            </a-select-option>
            <a-select-option value="false">
              false
            </a-select-option>
          </a-select>
        </template>
        <a-input
          v-else-if="loaded"
          :type="type"
          :maxLength="maxLength"
          :defaultValue="defaultValue || value"
          :placeholder="placeholder"
          :disabled="disabled"
          @change="validateValue"
          @blur="onBlur"
        />
      </a-tooltip>
      <!-- :defaultValue="defaultValue || value" -->
    </template>
    <template v-else-if="textarea">
      <a-textarea
        v-if="loaded"
        :defaultValue="defaultValue || value"
        :maxLength="maxLength"
        :autosize="autosize"
        :placeholder="placeholder"
        :disabled="disabled"
        @change="validateValue"
        @blur="onBlur"
      />
      <p class="form-input__message" v-if="message && !noMessage">{{ message }}</p>
    </template>
    <template v-else>
      <a-input
        v-if="loaded"
        :type="type"
        :maxLength="maxLength"
        :defaultValue="defaultValue || value"
        :placeholder="placeholder"
        :disabled="disabled"
        @change="validateValue"
        @blur="onBlur"
      />
      <!-- :defaultValue="defaultValue || value" -->
      <p class="form-input__message" v-if="message && !noMessage">{{ message }}</p>
    </template>
  </div>
</template>
<script lang="ts">
/**
 * 使用范例：
 <form-input
    v-model="form.name"
    placeholder="请填写"
    :rules="rules.name"
    :type="'text'"
    :defaultValue="defaultValue"
    @change="change"
  />
  // 长文本
 <form-input
    v-model="form.name"
    placeholder="请填写"
    :autosize="{ maxRows: 3, minRows: 3 }"
    :textarea="true"
    :validateOnBlur="false"
    :rules="rules.name"
    :maxLength="200"
    :defaultValue="defaultValue"
    @change="change"
  />
 * 表单校验方法：
  validateForm() {
    let hasError: boolean = false;
    const inputs: any[] = this.$vnode.componentInstance
      ? this.$vnode.componentInstance.$children.filter((el: any) => el.$el.className.includes('form-input'))
      : [];
    inputs.forEach((node: any) => {
      const unValidated: boolean = node.validateValue({ target: { value: node.content } });
      if (unValidated) {
        hasError = true;
      }
    });
    if (hasError) {
      return Promise.reject(new Error('validate failed'));
    }
    return Promise.resolve();
  }
 */
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import {
  DatePicker,
  Select
} from '@h3/antd-vue';


declare interface ruleItem {
  required?: boolean;
  pattern?: RegExp;
  validator?: Function;
  message: any;
}

enum TipPositions {
  top = 'top',
  bottom = 'bottom',
}

@Component({
  name: 'form-input',
  components: {
    ADataPicker: DatePicker,
    ASelect: Select,
  }
})
export default class FormInput extends Vue {
  @Prop() value?: any;

  @Prop({ default: 'text' }) type?: string;

  @Prop({ default: '' }) defaultValue?: any;

  @Prop({ default: '' }) placeholder?: any;

  @Prop({ default: 'bottom' }) tipPosition?: TipPositions;

  @Prop({ default: () => [] }) rules?: ruleItem[];

  @Prop({ default: false }) disabled?: boolean;

  // 是否监听blur事件并校验
  @Prop({ default: true }) validateOnBlur?: boolean;

  // 是否为长文本输入
  @Prop({ default: false }) textarea?: boolean;
  // 长文本最大长度
  @Prop() maxLength?: number;
  // 长文本行数限制
  @Prop({ default: false }) autosize?: any;

  // 是否不显示错误信息
  @Prop({ default: false }) noMessage?: boolean;

  content: any = this.value || '';

  loaded: boolean = false;

  // 输入提示信息
  message: string = '';

  showTooltip: boolean = false;

  // 长文本
  onBlur(e: any) {
    if (this.validateOnBlur) {
      this.validateValue(e);
    }
  }

  /**
   * 校验输入内容
   */
  validateValue(e: any) {
    // this.value = e.target.value;
    const val: any = e ? e.target ? e.target.value : e : e;
    const oldVal: any = this.content;
    if (val !== oldVal) {
      this.$emit('change', e);
    }
    this.message = '';
    // this.value = val;
    this.content = val;
    if (!this.rules || !this.rules.length) {
      this.setValue(val);
      return;
    }
    const vm: any = this;
    const valid:boolean = this.rules.some((item: ruleItem) => {
      if (item.required && !val) {
        this.message = item.message;
        return true;
      }
      if (item.pattern && !item.pattern.test(val)) {
        this.message = item.message;
        return true;
      }
      if (item.validator && typeof item.validator === 'function') {
        let validateStatus: boolean = false;
        item.validator(item, val, (res?: any) => {
          if (typeof res !== 'undefined') {
            vm.message = res.message || item.message;
            validateStatus = true;
          }
        });
        return validateStatus;
      }
      return false;
    });
    if (!this.message) {
      this.setValue(val);
    } else if (this.tipPosition === 'top') {
      if (!valid) {
        return;
      }
      this.showTooltip = true;
      setTimeout(() => {
        this.showTooltip = false;
      }, 3000);
    }

    return this.message;
  }

  /**
   * 设置值
   */
  setValue(val: any) {
    if (val !== this.value) {
      this.$emit('input', val);
    }
  }

  reset() {
    this.message = '';
  }

  mounted() {
    this.loaded = true;
    this.$nextTick(() => {
      this.content = this.value || this.defaultValue;
    });
  }
  // @Watch('value')
  // onValueChange(value:string){
  //   ;
  //   this.content = value;
  // }
}
</script>
<style lang="less" scoped>
.form-input {
  width: 100%;
  position: relative;
  zoom: 1;
  &__message {
    position: absolute;
    left: 0;
    right: 0;
    padding-top: 2px;
    font-size: 12px;
    font-family: PingFang-SC-Regular;
    font-weight: 400;
    color: rgb(245, 34, 45);
  }
  .ant-input-number{
    width: 100%;
    &/deep/.ant-input-number-input{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-variant: tabular-nums;
      list-style: none;
      -webkit-font-feature-settings: 'tnum';
      font-feature-settings: 'tnum';
      display: inline-block;
      width: 100%;
      padding: 4px 11px;
      color: rgba(0, 0, 0, 0.65);
      font-size: 14px;
      line-height: 1.5;
      background-color: #fff;
      background-image: none;
      border-radius: 4px;
      -webkit-transition: all 0.3s;
      transition: all 0.3s;
    }
  }
}
</style>
