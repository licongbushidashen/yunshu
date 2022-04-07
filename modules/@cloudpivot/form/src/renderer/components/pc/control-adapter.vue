<template>
  <form-title
      v-if="isTitle"
      v-show="show"
      :control="control"/>
      

  <description :control="control" v-else-if="isDescription" />

  <div v-else-if="isSheet">
    <form-sheet
        :id="id"
        :control="control"
        :formPermission="formPermissionData"
        :frozenKeys="frozenKeys"
        @fullScreen="fullScreen"
        @freezeColumn="onFreezeColumn"
        :class="{ 'vertical' : layoutType }"
    />
    <a-modal
        v-model="isFullScreen"
        :width="'100%'"
        dialogClass="import-modal full-modal"
        :footer="null"
        :mask="true"
        style="top: 0;"
        :bodyStyle="{height: 'calc(100vh)',padding:0}"
        :closable="false"
        :maskClosable="false"
        :keyboard="false"
    >
      <form-sheet
          :control="control"
          :formPermission="formPermissionData"
          :canFull="true"
          :frozenKeys="frozenKeys"
          @fullScreen="fullScreen"
          @freezeColumn="onFreezeColumn"
      />
    </a-modal>
  </div>

  <reverse-relevance
      v-else-if="isReverseRelevance"
      :id="id"
      :control="control"
      v-show="show"
  />

  <!-- <system-control
    :control="control"
    v-else-if="isSystem"
    v-show="show"
    :class="{ system:isSystem, vertical : layoutType }"
  ></system-control> -->
  <base-control-adapter
      v-else-if="isHtml || isSystem"
      :class="{ system:isSystem, vertical : layoutType, titleHidden: titleVisible === false }"
      :control="control"/>

  <div v-else
      class="field"
      v-show="show"
      :class="fieldClassObj"
      :id="id"
  >

    <div
        class="field__label"
        :class="[{ top : isHigh }, {approval_label: isApproval}]"
        :style="style"
    >
      <div v-if="control.options.labelVisible !== false" class="field__label-div" :title="label">
        {{ label }}
        <a-tooltip placement="top" v-if="tips" style="width:14px;height: 14px;">
          <template slot="title">
            <pre style="margin-bottom: 0">{{ tips }}</pre>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
      </div>
    </div>
    <div class="op" :id= "'op_' + id" v-if="control.isRelevanceQuery && ![12, 13].includes(control.type)">
      <a-select placeholder="请选择" default-value="eq" style="width: 80px" v-model="control.op">
        <a-select-option value="eq">
          等于
        </a-select-option>
        <a-select-option value="NotEq">
          不等于
        </a-select-option>
      </a-select>
    </div>

    <div class="field__control" :class="{ 'detail' : (layoutType && readonly), 'field__control--selectOrg' : isStaffSelector }">
      <a-tooltip placement="topLeft">
        <template slot="title" v-if="hasError">
          <ul>
            <li v-for="err in errors" :key="err.code">{{ getErrorMessage(err) }}</li>
          </ul>
        </template>

        <div>
          <div :class="[ typeClass ]">
            <base-control-adapter :control="control"/>
          </div>
        </div>
      </a-tooltip>
    </div>

    
  </div>
</template>


<script lang='ts'>
import {getPcComponentByControlType, getComponentTitleByControlType} from '@cloudpivot/form/utils'
import { Vue, Prop, Component, Inject, Watch } from "vue-property-decorator";
import { FormControlType } from "../../typings";
import BaseControlAdapter from "./base-control-adapter.vue";
import SystemControl from "./system-control.vue";
import FormTitle from "../layout/form-title.vue";
import Description from "../layout/description.vue";
import { Tooltip, Modal, Icon } from "@h3/antd-vue";
import ControlAdapter from "../control-adapter";
@Component({
  name: "control-adapter",
  components: {
    AModal: Modal,
    ATooltip: Tooltip,
    AIcon: Icon,
    BaseControlAdapter,
    FormTitle,
    Description,
    SystemControl,
    // ReverseRelevance: () => import(/* webpackChunkName: "reverse-relevance" */"./reverse-relevance/reverse-relevance.vue"),
    FormTabs: () => import(/* webpackChunkName: "pc-form-tabs" */"../layout/pc-form-tabs.vue"),
  }
})
export default class PcControlAdapter extends ControlAdapter {
  isFullScreen = false;

  frozenKeys: string[] = [];

  get titleVisible(){
    return this.control.options.labelVisible;
  }

  created() {
    const comp:any = getPcComponentByControlType(FormControlType.Sheet);
    const ReverseRelevance:any = getPcComponentByControlType(FormControlType.ReverseRelevance);
    if (comp && comp.pc) {
      (this.$options as any).components.FormSheet = comp.pc;
    }
    if (ReverseRelevance && ReverseRelevance.pc) {
      (this.$options as any).components.ReverseRelevance = ReverseRelevance.pc;
    }
  }

  fullScreen() {
    this.isFullScreen = !this.isFullScreen;
    try {
      if(this.isFullScreen){
      // @ts-ignore
        window.parent.window.document.querySelector('.icon-close').style.display = 'none'
      }else{
        // @ts-ignore
        window.parent.window.document.querySelector('.icon-close').style.display = 'block'
      }
    } catch (error) {
      
    }
  }

  onFreezeColumn(key: string, freeze: boolean) {
    if (freeze) {
      this.frozenKeys.push(key);
    } else {
      const index = this.frozenKeys.findIndex(k => k === key);
      if (index > -1) {
        this.frozenKeys.splice(index, 1);
      }
    }
  }

  get readonly(){
    return this.ctrl ? this.ctrl.readonly : false;
  }

  get typeClass() {
    const type = this.control.type;
    if((this.control as any).diff) {
      console.log(this.control.value)
    }
    const name = FormControlType[type]||getComponentTitleByControlType(type);
    return name?name.toLowerCase():'';
  }

  @Inject()
  layoutTypeFn?: () => void;


  @Inject()
  getFormPermission!: () => any;

  get formPermissionData(){
    return this.getFormPermission();
  }

  get layoutType() {
    if(this.layoutTypeFn){
      return this.layoutTypeFn()
    }
  }

  get fieldClassObj() {
    return {
      vertical: this.layoutType,
      error : this.hasError,
      required : this.required,
      edit : this.control.edit,
      diffControls: (this.control as any).diff
    }
  }

}
</script>


<style lang="less" scoped>
.op{
  margin-right: 10px;
  width: 80px;
}
.ant-col > div.field {
  display: flex;
  padding: 8px;
  flex-shrink: 0;
  text-align: left;
  height: 100%;
  padding-left: 0;
  align-items: center;

  &.dotted {
    border-bottom: 1px dotted #e8e8e8;
  }
}

/deep/ .field__label {
  flex-shrink: 0;
  margin-right: 8px;
  display: flex;
  color: rgba(0, 0, 0, 0.65);

  & > div {
    word-break: break-word;
  }
}

/deep/ .field__control {
  flex-grow: 1;
  position: relative;
  min-width: 10px;

  & > div {
    line-height: 22px;
  }

  // &--selectOrg {
  //   overflow: hidden !important;
  // }
}
.edit {
  .dropdown,
  .relevanceform,.relevanceformex {
    line-height: 0.99;
  }
}

.ant-col > div.field.vertical{
  display: block;
}

.ant-col > div.field.vertical .field__label{
  font-size: 12px;
  font-weight:600;
  height:20px;
  line-height: 20px;
  width: 100%;
  max-width: 100%;
  padding-top: 0;
  margin-left: 12px;
}

.query-form .ant-col > div.field.vertical{
  display: flex;
  display: -webkit-box;
}

.query-form .ant-col > div.field.vertical .field__label{
  min-width: 1em;
  max-width: 6em;
  font-size: 12px;
  font-weight:400;
  margin-left: 0;
}
.field__control.detail{
  margin-left: 12px;
}
/deep/.approval_label{
  height: 100%;
  align-items:baseline!important;
}
.form-sheet{
  .h3-panel{
    margin-bottom: 0;
    /deep/.h3-panel-body{
      padding: 0;
    }
  }
}
</style>

<style>
 .description .collapsed.vertical{
  padding-left: 14px;
}
</style>


