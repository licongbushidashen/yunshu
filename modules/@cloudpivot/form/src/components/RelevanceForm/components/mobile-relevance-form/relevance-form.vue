<template>
  
    <!-- <div class="field__label" :style="style">{{ label }}</div> -->
  <h3-field
    class="relevance-form" 
    :class="{ required: ctrl.required }"
    :required="ctrl.required"
    :label="label"
    :labelStyle="style"
    :showIcon="false"
    :tip="controlOpts.tips"
  >
    
    <div class="field__control" @click="onClick">
      <template v-if="name">{{ name }}</template>
      <span v-else-if="isEditState" class="placeholder scan">{{
        inputPlaceholder
      }}</span>
    </div>
    <span
      class="icon aufontAll clear"
      v-if="!readonly && ctrl.value"
      @click.stop="clear"
      >&#xe994;</span
    >
    <i
      v-if="isEditState && !isScan"
      class="icon aufontAll h-icon-all-right-o"
    />
    <i
      @click.stop="scan"
      v-if="isScan && isEditState"
      class="icon scan aufontAll h-icon-all-scan-o"
    />

    <relevance-form-modal
      class="relevance-form-panel"
      v-control-back
      v-transfer-dom
      :value="val"
      :visible="showModal"
      :control="control"
      @change="onChange"
      @back="close"
      @newForm="openNewForm"
    ></relevance-form-modal>
  </h3-field>
</template>


<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import { H3Field } from 'h3-mobile-vue';
import { formApi, listApi } from "@cloudpivot/api";
import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";

import RelevanceFormModal from "./relevance-form-modal.vue";

import common from '@cloudpivot/common';

import ControlBack from '@cloudpivot/form/src/common/directives/control-back';


// import TransferDom from '../../../directives/transfer-dom';
import { deepCopy, parseUrlParam } from '@cloudpivot/form/utils';
import dd from "dingtalk-jsapi";
import { isiOS } from "@cloudpivot/common/src/utils/common";

@Component({
  name: "relevance-form",
  components: {
    RelevanceFormModal,
    H3Field
  },
  directives: {
    ControlBack,
    TransferDom: common.directives.transferDom
  }
})
export default class MobileRelevanceForm extends RelevanceFormControl {

  showModal: boolean = false;

  show() {
    this.showModal = true;
  }
  close() {
    this.showModal = false;
    if(dd.env.platform === "notInDingTalk" && !isiOS){
      window.history.go(-1)
    }
  }

  @Watch('showModal')
  onShowModalChange(showModal){
    console.log('window.history===>',window.history)
    var that = this
    function toogleShowModalFn(e) {
        if(that.showModal){
          that.showModal = false
        }
    }
    function pushHistory() {
      var state = {
        title: "title",
        url: "#"
      };
      window.history.pushState(state, "title", "#");
    }
    if(showModal){
      pushHistory();
      window.addEventListener("popstate", toogleShowModalFn, false);
    }else{
      window.removeEventListener('popstate', toogleShowModalFn, false)
    }
  }

  openNewForm() {
    this.showModal = false
  }

  showError(text: string) {
    this.$h3.toast.show({
      text,
      autoHide: true,
      iconType: text.length < 8 ? "close" : ""
    });
  }

  get inputPlaceholder() {
    if (this.isScan) {
      return this.$t("cloudpivot.form.renderer.scanInput");
    }
    return this.placeholder;
  }

  clear() {
    this.ctrl.value = null;
  }

  scan() {
   // const url = "http://47.107.160.206/mobile/?corpId=dingcebb92833861bfd735c2f4657eb6378f&agentId=217572455&schemaCode=model_1_1&sheetCode=null&id=6d49f6149b9f4640931ae3a27732c670&mode=form"
   // const url = "http://47.107.160.206/mobile/?workflowInstanceId=435a94545f30415180772d57dd151777&workItemId=254ee20feb564a459a0b340f031ee649&corpId=dingcebb92833861bfd735c2f4657eb6378f&agentId=217572455&mode=form&isWorkFlow=true#/form/detail?workflowInstanceId=435a94545f30415180772d57dd151777&workitemId=254ee20feb564a459a0b340f031ee649";
   // const url = "http://47.107.160.206/mobile/el.html?c=1vgZIyqyIXS";
  //  const url = "http://47.107.160.206/mobile/el.html?w=1vh0cqhjIJO";
  // const url = "http://47.107.160.206/form/detail?sheetCode=ywff&objectId=PO_20.0_00000&schemaCode=ywff&isWorkFlow=false&return=%2Fapplication%2Fsilver%2Fapplication-list%2Fywff%3FparentId%3Dafeb204e719a6d9401719a77445e0002%26code%3Dywff%26openMode%26pcUrl%26queryCode%3D%26iframeAction%3Ddetai"
  //const url = "http://47.107.160.206/mobile/?corpId=dingcebb92833861bfd735c2f4657eb6378f&agentId=217572455&schemaCode=bd233&sheetCode=null&mode=form"
    RelevanceFormControl.service.scan(this.setVal);
    // this.setVal('34234234423423');
  }

  setVal(val:string) {
    const query:any = parseUrlParam(val);
    if(!query) {
      this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeError") as string);
      return;
    }
    let params:any = {}
    // 业务表单
    if (query.schemaCode && (query.id || query.objectId)) {
      params.schemaCode = query.schemaCode;
      params.objectId = query.id || query.objectId;
      params.sheetCode = query.sheetCode
      this.loadForm(params);
      return;
    }
    // 流程表单
    if (query.workflowInstanceId && query.workItemId) {
      params.workflowInstanceId = query.workflowInstanceId;
      params.workitemId = query.workItemId;
      this.loadForm(params);
      return;
    }
    // 外链业务表单
    if (query.c) {
      params.ssc = query.c;
      this.loadForm(params);
      return;
    }

    // 外链流程表单
    if (query.w) {
      this.externalLinkSheet(query.w);
      return;
    }
    // 批量打印二维码
    if (query.sCode) {
      this.shortCodeConfig(query.sCode);
      return;
    }

    if (query.workflowCode && query.corpId && query.agentId) {
      this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeNoData") as string);
      return;
    }
    if (query.schemaCode && !query.id && !query.objectId) {
      this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeNoData") as string);
      return;
    }

    this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeError") as string);
  }

  shortCodeConfig(sCode:string) {
    RelevanceFormControl.service.shortCodeConfig(sCode).then(res => {
      if (res.errcode === 0) {
        const json: any = JSON.parse(res.data.pairValue);
        const qrcodeParams = {
              formCode: json.sheetCode,
              schemaCode: json.schemaCode,
              objectId: json.id
            };
        this.loadForm(qrcodeParams);
      } else {
        this.showError(res.errmsg);
      }
    })
  }
  // 外链处理
  externalLinkSheet(id:string) {
    RelevanceFormControl.service.externalLinkSheet(id, 'w').then(res => {
      if(res.errcode === 0) {
        const workflowInstanceId = res.data.workflowInstanceId;
        if (workflowInstanceId) {
          const params = {
            workflowInstanceId
          }
          this.loadForm(params);
        }
      } else {
        this.showError(res.errmsg);
      }
    })
  }
  loadForm(params:any) {
    RelevanceFormControl.service.loadForm(params).then(async (res:any) => {
      if (res.errcode === 0) {
        const { schemaCode, data, loadedFromDb } =  res.data.bizObject;
        if (schemaCode !== this.controlOpts.schemaCode) {
          this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeNoData") as string);
          return;
        }
        if (!loadedFromDb) {
          this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeNoData") as string);
          return;
        }
        const item = await this.convertForMappings(data);
        this.ctrl.value = item;
        setTimeout(() => {
          this.ctrl.value = deepCopy(item);
        }, 500);
      } else {
        this.showError(res.errmsg);
      }
    })
  }


  get val(){
    return this.ctrl.value || {};
  }

  get name() {
    if (!this.ctrl.value) {
      return "";
    }
    return this.parseDisplayFieldValue(this.ctrl.value[this.getDisplayField],this.getDisplayField)
  }

  get isEditState () {
    return !this.readonly || (this.showLink&&this.ctrl.value&&this.ctrl.value.id)
  }

  onClick() {
    if (this.readonly) {
      if(this.showLink){
        super.open();
      }
    }else{
      this.show();
    }
  }
  async created() {
    //展示字段需取数据项列表中的relativePropertyCode;
    // let ls = await this.getRelativeDataList();
    // let dataModal: any = ls.find((c: any) => c.code === this.control.key);
    let dataModal:any = this.getDataItem(this.control.key, this.control.parentKey);
    if (!dataModal) {
      // 兼容列表查询条件没有传入DataItem。且查询条件只是存在主表；
      let ls = await this.getRelativeDataList(true);
      dataModal = ls.find((c: any) => c.code === this.control.key);
    }
    //覆盖数据项options中的displayField（表单设计中的displayField，若在数据模型中重新定义一次后，会导致与后台的展示字段对应不上，所以直接拿后台的展示字段即可）
    this.control.options.displayField = dataModal && dataModal.relativePropertyCode
        ? dataModal.relativePropertyCode
        : "name";
  }

  onChange(val: any) {
    if(val && Object.keys(val).length > 0){
      this.ctrl.value = val;
      setTimeout(() => {
        this.ctrl.value = deepCopy(val);
      }, 500);
    }else{
      this.ctrl.value = null;
    }
    this.close();
  }
}
</script>

<style lang="less">

.placeholder{
  &.scan {
    width: 100px;
  }
}
 .relevance-form .h3-PR{
    display:flex;
  }  
.relevance-form-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 100;
}

.relevance-form .vertical{
  // display: block !important;
  .field__label{
    //padding: 10px 0;
  }
  .field__control{
    //padding-bottom: 10px;
  }
  .h-icon-all-right-o{
    position: absolute;
    bottom: 14px;
    right: 20px;
  }
}
.relevance-form {
  .h-icon-all-right-o{
    font-size:12px;
    color: #999;
  }
  &.field {
    .scan {
      height: .48rem;
      font-size: .48rem;
      line-height: .48rem;
      color: #888;
    }
    .clear {
      font-size: 12px;
      // float: right;
      margin-right: 6px;
      margin-bottom: 2px;
      line-height: 15px;
      color: #888;
      font-size: 15px;
    }
  }
  &.vertical{
    .clear {
      position: absolute;
      bottom: 11px;
      right: 32px;
    }
  }
}
 .query-form {
    .field {
      text-align: left;
      display: -webkit-flex;
      display: flex;
      position: relative;
      min-height: 46px;
      font-size: 15px;
      padding-left: .4rem;
      padding-right: .4rem;
      -webkit-align-items: center;
      align-items: center;
      border-bottom: 1px solid #eee;

      .field__label {
        width: 106px;
        display: -webkit-flex;
        display: flex;
        -webkit-align-items: center;
        align-items: center;
        -webkit-flex-shrink: 0;
        flex-shrink: 0;
        color: rgba(0, 0, 0, .65);
      }

      .field__control {
        display: -webkit-flex;
        display: flex;
        -webkit-flex-grow: 1;
        flex-grow: 1;
        -webkit-align-items: center;
        align-items: center;
        color: rgba(0, 0, 0, .65) !important;
        min-height: 1em;
        text-align: left;
        overflow: auto;

        .placeholder {
          color: #999;
        }
      }

      i.icon {
        color: #999;
        font-size: 10px;
        height: 13px;
      }
    }
  }
</style>
