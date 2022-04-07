<template>
  <div class="input-wrapper" :ref="'inputWrapper' + inputId">
    <h3-textarea
      v-if="!readonly && isTextarea"
      v-model="val"
      :title="label"
      :required="ctrl.required"
      :maxLength="maxLength"
      :placeholder="placeholder"
      :readonly="readonlyFormula || readonly"
      :error="ctrl.hasError"
      :labelStyle="styleObj"
      :rows="4"
      autoHeight
      @onChange="onChangeTextarea"
      ref="h3Textarea"
    ></h3-textarea>

    <div v-else-if="!readonly && !isTextarea" class="input-wrap">
      <h3-input
        v-model="val"
        :required="ctrl.required"
        :title="label"
        :placeholder="inputPlaceholder"
        :readonly="readonlyFormula || readonly"
        :clear="true"
        type="text"
        :maxLength="maxLength"
        :error="ctrl.hasError"
        :labelStyle="styleObj"
        @onBlur="onBlur"
        @onChange="onChange"
        :showScan="isScan"
        :class="{ canscan: isScan }"
        @scanClick="scan"
        ref="h3Input"
        :tip="controlOpts.tips"
        @onFocus="onFocus"
      ></h3-input>
      <!-- <span @click.stop="scan" v-if="isScan" class="icon aufontAll">&#xe8de;</span> -->

      <ul class="search-res" v-if="isShowSearch">
        <li v-for="item in filterDictionaryDataList" :key="item.id" @click="checkData(item.name)">{{item.name}}</li>
      </ul>
    </div>

    <div class="field" v-else>
      <div class="field__label top" :style="style">{{ label }}</div>
      <div class="field__control">
        <mutil-text v-if="isLangText" :text="val"></mutil-text>
        <div v-else v-html="val" class="editor-htm"></div>
      </div>
    </div>


  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
  RendererFormControl,
  TextOptions,
  FormControlType,
} from "@cloudpivot/form/schema";

import { TextInputControl } from "@cloudpivot/form/src/common/controls/input-controls/text-input-control";

import { H3Input, H3Textarea } from "h3-mobile-vue";

import MutilText from "@cloudpivot/form/src/common/components/mutil-text.vue";

import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";
import { formApi } from "@cloudpivot/api";

@Component({
  name: "mpbile-input-text",
  components: {
    H3Input,
    H3Textarea,
    MutilText,
  },
})
export default class MobileInputText extends TextInputControl {
  showTip: string = "";

  focus: boolean = false;
  onFocus() {
    this.focus = true;
  }

  onBlur() {
    super.validate();
    setTimeout(() => {
      this.focus = false;
    }, 300);
  }

  scan() {
    RelevanceFormControl.service.scan(this.setVal);
  }

  setVal(val) {
    this.ctrl.value = val.length === 0 ? null : val;
    this.val = this.ctrl.value;
    if (!val) {
      return;
    }
    setTimeout(() => {
      let h3Input: any = this.$refs.h3Input;
      if (h3Input && h3Input.onInputChange) {
        // h3Input.onInputChange(val);
        const textinput = h3Input.$refs.textinput;
        if (textinput && textinput.reSetHeight) {
          textinput.reSetHeight(textinput.$refs.textarea);
        }
      }
    }, 50);
  }

  timer: any = null;
  timerNew: any = null;
  onChange() {
    if (this.dictionaryId) {
      this.getDictionaryData();
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.timer = setTimeout(() => {
      this.ctrl.value = this.val.length === 0 ? null : this.val;
      if (this.val.length >= this.maxLength) {
        this.showTip =
          this.control.options && (this.control.options as any).maxLengthTips
            ? (this.control.options as any).maxLengthTips
            : "";
        if (this.showTip) {
          this.$h3.toast.show({
            text: "已到设置的最大数，提示语：" + this.showTip,
          });
          if (this.timerNew) clearTimeout(this.timerNew);
          this.timerNew = setTimeout(() => {
            this.showTip = "";
            this.$h3.toast.hide();
          }, 3000);
        }
      }
    }, 500);
  }
  onChangeTextarea() {
    let el = (this.$refs.h3Textarea as any).$el;
    let h = el.offsetHeight;
    el.style.height = `${el.offsetHeight}px`;
    this.ctrl.value = this.val.length === 0 ? null : this.val;
    setTimeout(() => {
      el.style.height = "auto";
    }, 16.66666666);
  }

  // 是否启用数据字典
  isUseDataDictionary: boolean = false;
  dictionaryId: string = "";
  inputId: string = +new Date() + "";
  dictionaryData: any[] = []; // 数据字典数据

  get isShowSearch() {
    return this.focus && this.filterDictionaryDataList.length && this.val !== "";
  }

  get filterDictionaryDataList() {
    if (this.val === "") {
      return this.dictionaryData;
    }
    return this.dictionaryData.filter((el) => !!~el.name.indexOf(this.val));
  }

  async getDictionaryData() {
    if(this.dictionaryData.length){
      return
    }
    let res: any = await formApi.getEnableRecordsByDictionaryId({
      dicId: this.dictionaryId,
    });
    if (res.errcode === 0) {
      this.dictionaryData = res.data;
    }
  }

  checkData(name) {
    this.val = name;
    this.setValue(name);
  }

  useDictionariesData: any[] = [];
  created() {
    if (
      this.control.options &&
      this.control.options.dictionaryData &&
      this.control.options.dictionaryData.isUseDataDictionary
    ) {
      this.isUseDataDictionary = true;
      try {
        let options = JSON.parse(
          this.control.options.dictionaryData.options.value
        );
        this.dictionaryId = options.checkedDictionary || "";
        this.useDictionariesData = options.useDictionariesData;
        this.dictionaryData = options.useDictionariesData;
      } catch (error) {
        console.log(error);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.input-wrapper {
  position: relative;
  .search-res {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    background-color: #fff;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.25);
    width: 100%;
    border-radius: 0 0 4px 4px;
    max-height: 200px;
    overflow: auto;
    z-index: 99;
    li {
      padding: 0 10px;
      height: 32px;
      line-height: 32px;
      cursor: pointer;
      &:hover {
        background-color: #f8f8f8;
      }
    }
  }
}

.field__control {
  padding: 0.5em 0;
}

/deep/.h3-input-control textarea {
  min-height: 25px;
}
.input-wrap {
  position: relative;
  .canscan {
    // /deep/.h3-input-control-with-clear {
    //   padding-right: 38px;
    // }
    // /deep/.clear-wrapper {
    //   right: 15px;
    // }
    /deep/.clear-wrapper-ipt {
      right: -4px !important;
      .h3-input-clear {
        margin-top: 0;
      }
    }
  }
  & > .icon {
    position: absolute;
    right: 15px;
    top: 0.34rem;
    font-size: 0.55rem;
    color: rgba(0, 0, 0, 0.65);
  }
}

.editor-html {
  line-height: normal !important;
  word-break: break-all;
  line-height: unset;
}

.field.vertical {
  .field__label {
    padding-top: 10px;
  }
}
</style>
