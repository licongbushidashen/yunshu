<!--
 * @Author: your name
 * @Date: 2020-04-22 13:53:21
 * @LastEditTime: 2021-09-23 18:32:33
 * @LastEditors: baidongsheng
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\common\components\system-control\pc\index.vue
 -->

<template>
  <div class="field">
    <div class="field__label" :style="style">
      {{ label }}
      <a-tooltip
        placement="top"
        v-if="tips"
        style="margin: 5px 0 0 2px;"
      >
        <template slot="title">
          <span>{{ tips }}</span>
        </template>
        <a-icon type="question-circle"/>
      </a-tooltip>
    </div>
    <div class="field__control">{{ ftext ? ftext : text }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import { Icon, Tooltip } from "@h3/antd-vue";

import { SystemControl } from "../controls/system-control";

import { userApi } from "@cloudpivot/api";
import { utils } from "@cloudpivot/common";

const DateHandle = utils.DateHandle;
import { StaffSelectorMapping } from '@cloudpivot/form/src/common/components/form-staff-selector/staff-selector-mappings';

@Component({
  name: "system-control",
  components: {
    AIcon: Icon,
    ATooltip: Tooltip
  }
})
export default class PcSystemControl extends SystemControl {
  ftext: string = ''
  created() {
    if(this.control.key === "createdTime" || this.control.key === "modifiedTime") {
      if(typeof this.control.value === 'string'){
         if(Array.isArray(this.control.value.split(" ")) && this.control.value.split(" ").length<2){
           this.control.value=new Date();
         }
      }
      
      if(!this.control.value){
        this.control.value=new Date();
      }
      
      this.ftext = DateHandle.dateFormatApm(new Date(this.control.value), this.control.options.format1)
    }
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
  // justify-content: flex-end;
  position: relative;
  flex: 0 0 102px;
}

.field.titleHidden > .field__label {
  display: none!important;
}

.field__label,
.field__control {
  color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
}

.ant-col > div.field.system.vertical .field__label {
  padding-left: 12px;
  font-size: 12px;
  font-weight: 900;
}

.ant-col > div.field.system.vertical .field__control {
  padding-left: 20px;
  padding-top: 5px;
}

.field__label::after {
  // content: ":";
}
i > svg {
  margin-top: -2px;
}
</style>
