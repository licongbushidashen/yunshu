<!--
 * @Author: your name
 * @Date: 2020-04-22 13:53:14
 * @LastEditTime: 2020-06-10 20:15:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\common\components\system-control\mobile\index.vue
 -->

<template>
  <h3-field
    :readOnly="true"
    :showIcon="false"
    :label="label"
    :labelStyle="styleObj"
    :class="{'vertical': layoutType}"
    :tip="controlOpts.tips"
  >
    <div :class="{'field__control' : !readonly}">
      {{ text }}
    </div>
  </h3-field>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import { H3Field } from 'h3-mobile-vue';

import { SystemControl } from "../controls/system-control";

import { userApi } from "@cloudpivot/api";

import { StaffSelectorMapping } from '@cloudpivot/form/src/common/components/form-staff-selector/staff-selector-mappings';

@Component({
  name: "system-control",
  components:{
    H3Field,
  }
})
export default class MobileSystemControl extends SystemControl {

  @Inject()
  layoutTypeFn!: Function;

  //上下布局模式
  get layoutType(){
    if(this.layoutTypeFn){
      return this.layoutTypeFn();
    }
  }
  created() {
    this.getUserInfo();
  }
  
  async getUserInfo(){
    // 修改人、创建人 支持属性映射功能-- 获取当前人的用户信息
    let mappings: string = this.control.options.mappings || "";
    let value: any = this.control.value;
    let query: any = this.$route.query;
    if(mappings && value && Array.isArray(value)){
      // 流程表单状态不执行映射
      if(query.isWorkFlow && query.isWorkFlow === 'true' || query.edit){
        return;
      }
      if(this.control.writable){
        let { data } = await userApi.getUserInfo(value[0].id);
        this.ctrl.value = [data];
        StaffSelectorMapping.mappingOperate(this.ctrl.value,mappings,this);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.field.system > .field__label {
  justify-content: flex-end;
}
</style>