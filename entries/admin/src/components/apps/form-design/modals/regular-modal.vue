<template>
  <a-modal
    :title="$t('languages.Apps.FormDesignPage.RegularRule')"
    :visible="true"
    @cancel="closeModal"
    @ok="backData"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    width="492px"
    :maskClosable="false"
    :keyboard="false"
  >
    <div class="regular-wrap">
      <div class="clearfix row">
        <div class="left">
          <span>{{ $t('languages.Apps.FormDesignPage.SelectRegularTemp') }}:</span>
        </div>
        <div class="right">
          <a-select
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            @change="changeRegularOptions"
            v-model="regularData.selectOption"
            allowClear
          >
            <a-select-option
              v-for="(regular, index) in regularRules"
              :key="index"
              :value="regular.rule"
            >{{ regular.text }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="clearfix row">
        <div class="left">
          <span>{{ $t('languages.Apps.FormDesignPage.Regular') }}:</span>
        </div>
        <div class="right">
          <a-input
            class="input"
            :placeholder="$t('languages.PlaceHolder.Input')"
            v-model="regularData.regularText"
            :disabled="disabled"
          />
        </div>
      </div>
      <div class="clearfix row">
        <div class="left">
          <span>{{ $t('languages.Apps.FormDesignPage.ErrorTips') }}:</span>
        </div>
        <div class="right">
          <a-input
            class="input"
            :placeholder="$t('languages.PlaceHolder.Input')"
            v-model="langObj[lang]"
          />
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Emit, Prop } from "vue-property-decorator";

import Options from "../typings/form-modals-map";

@Component({
  name: "RegularModal"
})
export default class RegularModal extends Vue {
  @Prop({
    type: Object,
    default: () => ({})
  })
  modalData!: any;

  disabled: boolean = false;

  regularData: any = {
    selectOption: "",
    regularText: "",
    tips: "",
    propertyBarText: ""
  };

  lang: string = localStorage.getItem("locale") || "zh";

  langObj: any = {
    en: "",
    zh: ""
  };

  get regularRules() {
    return this.modalData.data.type && this.modalData.data.type === "number"
      ? Options.defaultRegularList.slice(0, 3)
      : Options.defaultRegularList;
  }

  created() {
    const data = this.modalData.data as any;
    if (data) {
      this.regularData = {
        tips: data.default || "",
        regularText: data.value || "",
        selectOption: data.value || ""
      };
      this.langObj = data.default ? JSON.parse(data.default) : this.langObj;
    }
    //判断是否为出自定义以外的正则表达示模板
    let rules = this.regularRules.find((r)=>{ return r.rule === data.value && r.text !== '自定义'});
    if(rules){
      this.disabled = true;
    }else if(!rules && data.value){
      this.regularRules.forEach((r)=>{
        if(r.text === '自定义'){
          r.rule = data.value;
          this.disabled = false;
        }
      })
    }else{
      this.regularData.selectOption = '';
      this.disabled = false;
    }
  }

  changeRegularOptions(val: any, arg: any) {
    if (val) {
      //判断是否为出自定义以外的正则表达示模板
      let rules = this.regularRules.find((r)=>{ return r.rule === val && r.text !== '自定义'});
      const index: number = arg.data.key;
      if(rules){
        this.disabled = true;
        this.regularData.regularText = val;
      }else{
        this.disabled = false;
        this.regularData.regularText = '';
        this.langObj = {
          en: "",
          zh: ""
        };
      }
      this.regularData.selectOption = val;
      //非自定义下
      if (this.regularData.selectOption && rules) {
        this.langObj = {
          en: this.regularRules[index].en,
          zh: this.regularRules[index].text
        };
        // this.regularData.tips = JSON.stringify()
      } else {
        // this.regularData.tips = '';
        this.langObj = {
          en: "",
          zh: ""
        };
      }
    } else {
      this.disabled = false;
      this.regularData.selectOption = '';
      this.regularData.regularText = '';
      this.langObj = {
        en: "",
        zh: ""
      };
    }
  }
  backData() {
    if (!this.langObj.en) {
      this.langObj.en = this.langObj.zh;
    }

    if (!this.langObj.zh) {
      this.langObj.zh = this.langObj.en;
    }

    const data = {
      value: this.regularData.regularText,
      default: JSON.stringify(this.langObj)
    };
    // 正则为空的允许提交
    if (!this.regularData.regularText) {
      this.$emit("backData", data);
      return;
    }
    const reg = new RegExp(/^(\/\^).+?(\$\/)$/);
    if (reg.test(this.regularData.regularText)) {
      try {
        new RegExp(this.regularData.regularText.regularText).test("");
        this.regularData.propertyBarText = this.regularData.regularText;
        console.log(data)
        this.$emit("backData", data);
      } catch (err) {
        this.$message.error("输入正则不合法");
      }
    } else {
      this.$message.error("输入正则不合法");
    }
  }
  closeModal() {
    this.$emit("closeModal");
  }
}
</script>

<style lang="less">
.regular-wrap {
  .row {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
    .left {
      width: 138px;
      float: left;
      span {
        line-height: 32px;
      }
    }
    .right {
      float: left;
      .input,
      .select {
        width: 306px;
      }
    }
  }
}
</style>
