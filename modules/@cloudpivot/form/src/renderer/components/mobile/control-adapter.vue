
<template>
  <div v-if="isTitle" v-show="show"></div>
  <description
    :control="control"
    v-else-if="isDescription"
    v-show="show"
  ></description>

  <form-sheet
    :id="id"
    :control="control"
    v-else-if="isSheet"
  ></form-sheet>
  <!-- <system-control
    :control="control"
    v-else-if="isSystem"
    v-show="show"
  ></system-control> -->

  <!-- <a-col class="ant-col" :span="span" v-else v-show="show"> -->
  <div
    v-else
    v-show="show"
    :id="id"
    :class="{hidd: control.isRelevanceQuery && ![12, 13].includes(control.type),labelHidden:control.options.labelVisible === false }"
  >
    <span class="requiredIcon" v-if="control.options.labelVisible === false && control.options.requiredFormula"></span>
    <div class="isRelevanceQuery" v-if="control.isRelevanceQuery && ![12, 13].includes(control.type)">
      <span>{{label}}</span>
      <div class="right" >
        <span @click="showActionSheet=true">
         {{control.op === 'NotEq' ? '不等于' : '等于'}}
          <template v-if="showActionSheet">
            <i class="icon aufontAll h-icon-all-down-o"></i>
          </template>
          <template v-else>
            <i class="icon aufontAll h-icon-all-right-o"></i>
          </template>
        </span>
        <H3Actionsheet
          class="sheet-adjust"
          v-model="showActionSheet"
          :menus="actionSheetMenus"
          showCancel
          cancelText="取消"
          @on-click-menu="clickActionSheetMenu"
        ></H3Actionsheet>
      </div>
    </div>

    <base-control-adapter :control="control" :class="{ error : hasError, vertical : layoutType }"></base-control-adapter>
  </div>

  <!-- </a-col> -->
</template>


<script lang='ts'>
import { Vue, Prop, Component, Inject, Watch } from "vue-property-decorator";

import { RendererFormControl } from "../../typings";

import { FormControlType } from "../../typings";

import BaseControlAdapter from "./base-control-adapter.vue";
import {getMobileComponentByControlType} from '@cloudpivot/form/utils'

// import FormSheet from "./form-sheet.vue";
import SystemControl from "./system-control.vue";

import FormTitle from "../layout/form-title.vue";
import Description from "../layout/description.vue";

import ControlAdapter from "../control-adapter";

import { H3Actionsheet } from 'h3-mobile-vue'


@Component({
  name: "control-adapter",
  components: {
    BaseControlAdapter,
    FormTitle,
    Description,
    SystemControl,
    H3Actionsheet
    // FormSheet
  }
})
export default class MobileControlAdapter extends ControlAdapter {

  @Inject()
  layoutTypeFn!: Function;

  //上下布局模式
  get layoutType(){
    if(this.layoutTypeFn){
      return this.layoutTypeFn();
    }
  }
  beforeCreate() {
    const comp:any = getMobileComponentByControlType(FormControlType.Sheet);
    if (comp && comp.mobile) {
      (this.$options as any).components.FormSheet = comp.mobile;
    }
  }

  actionSheetMenus:any[] = [
    {
      label: '等于',
      type: 'Default',
      value: 'eq'
    },{
      label: '不等于',
      type: 'Default',
      value: 'NotEq'
    },
  ]

  showActionSheet:boolean = false;
  clickActionSheetMenu(value:any) {
    this.showActionSheet = false
    if (value === 'cancel') return;
    // @ts-ignore
    this.control.op = value;
  }

  @Watch("control")
  controlValue(value) {
    console.log(this.control);
  }
}
</script>


<style lang="less">
.isRelevanceQuery{
  font-size: 15px;
  color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  line-height: 25px;
  .right {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.65);
    i{
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
}
.vertical .h3-FBH, .field.vertical{
  display: block;
}

.vertical .h3-FBH>.h3-FB1, .vertical .h3-FBH>.h3-FB2, .vertical .h3-FBH>.h3-FB3{
  width: 100%;
  position: relative;
  padding-top: 0;
}

.h3-org.vertical .h3-FBH .h3-field-layout-h-label,.vertical.form-sheet .h3-org-field .h3-field-layout-h-label{
  padding-bottom: 0;
}

/* 处理子表基础控件上下布局样式 */
.h3-form-sheet.vertical .field{
  display: block;
}

.h3-form-sheet.vertical .field__label{
  width: 100%;
  position: relative;
  padding: 10px 0;  
}

.h3-form-sheet.vertical .field__control{
  padding-top: 0;
  padding-bottom: 10px;
}

/* 处理子表中的关联表单控件上下布局样式 */
.h3-form-sheet.vertical .relevance-form .field__control{
  padding-bottom: 10px;
}

.h3-form-sheet.vertical .relevance-form .clear{
  position: absolute;
  bottom: 11px;
  right: 32px;
}


.h3-form-sheet.vertical .relevance-form .h-icon-all-right-o{
  position: absolute;
  right: 20px;
  bottom: 14px;
}
/* 处理子表中的逻辑控件上下布局样式 */
.vertical .input-logic .h3-field-box > .h3-FB1{
  text-align: left;
}

/* 处理子表中的手写签名控件上下布局样式 */
.vertical .input-signsture .row__file{
  display: block;
}

/* 处理子表数值控件上线布局 */
.h3-form-sheet.vertical .ant-input-number-input-wrap{
  height: 30px;
}
.h3-form-sheet.vertical .icon-base-close-circle{
  position: absolute;
  right: 20px;
  bottom: 10px;
}
.hidd{
  .h3-field-layout-h-label{
    display: none !important;
  }
  border-bottom: 10px solid rgba(0, 0, 0, 0.05);
}
.labelHidden{
  position: relative;
  .h3-field-layout-h-label{
    display: none !important;
  }
  .requiredIcon:before{
    content: "*";
    color: #f4454e;
    position: absolute;
    left: .5em;
    top: 1.8em;
  }
}
</style>
