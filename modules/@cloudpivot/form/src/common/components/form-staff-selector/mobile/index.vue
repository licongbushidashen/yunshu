<!--
 * @Author: your name
 * @Date: 2020-04-22 13:52:53
 * @LastEditTime: 2020-04-26 20:12:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\common\components\form-staff-selector\mobile\index.vue
 -->
 
<template>

  <mobile-staff-selector
    v-model="val"
    :options="staffSelectorOpts"
    :title="label"
    :required="ctrl.required"
    :readonly="readonly || isExternal"
    :readonlyFormula="readonlyFormula"
    :labelStyle="styleObj"
    :params="{sourceType: 'mobile' || '', filterType: 'root_display'}"
    :tip="controlOpts.tips"
    @change="onChange"
  ></mobile-staff-selector>
  
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import { RendererFormControl, StaffSelectorOptions } from "@cloudpivot/form/src/typings";

import MobileStaffSelector from "./mobile-staff-selector.vue";

import { StaffSelectorControl } from "../controls/staff-selector-control";

@Component({
  name: "form-staff-selector",
  components: {
    MobileStaffSelector
  }
})
export default class FormStaffSelector extends StaffSelectorControl {

  onChange(value : any[]){
    this.ctrl.value = value && value.length > 0 ? value : null;
  }

  // 是否为外部用户
  get isExternal() {
    if ((window as any).isExternal) {
      return true;
    }
    return false;
  }

  
  mounted(){
    // 选人控件需要从根节点开始显示
    this.staffSelectorOpts.isDisplayRoot = true;
  }

}
</script>

<style lang="less" scoped>
/deep/.h3-org-content-toggle{
  max-height: unset;
}
.h3-moilbe-staff {
  display: flex;
  align-items: left;
  flex-direction: column;
  border-bottom: 1px solid #eee;
  &-title {
    text-align: left;
    width: 100%;
    color: #666666;
  }
  &-content {
    display: flex;
    flex-wrap: wrap;
    &-name {
      display: inline-block;
      background: rgba(236, 239, 242, 1);
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      .h3-moilbe-staff-content-avator {
        display: inline-block;
        border-radius: 100%;
        img,
        i {
          width: 100%;
          height: 100%;
          border-radius: 100%;
          font-size: 13px;
        }
      }
    }
  }
  &-add {
    width: 36px;
    height: 36px;
    margin: 4px 0 16px 0;
    line-height: 20px;
    padding: 8px;
    border-radius: 100%;
    background: #eceff2;
    .h-icon-all-plus-o {
      font-size: 20px;
      color: #929ca6;
    }
  }
}
</style>