<!--
 * @Author: zhuqiu
 * @Date: 2020-04-21 15:55:26
 * @LastEditTime: 2020-05-13 16:49:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\entries\admin\src\views\app\biz-rule\property-desgner-extend\models-selector.vue
 -->
<template>
  <div class="models-selector">
    <biz-models-selector
      :appCode="appCode"
      :value="bizModel"
      @select="onTreeSelect"
      :onlyPublish="true"
    />
    <!-- @select="onTreeSelect" -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins, Watch, Inject } from 'vue-property-decorator';
import { PropertyComponent } from '@h3/designer-core/property-panel';

import BizModelsSelector from "@/components/global/biz-models-selector/index.vue";
import * as forms from "h3-forms";

import { listApi } from "@cloudpivot/api";

@Component({
  name: 'models-selector',
  components: {
      BizModelsSelector
  }
})

export default class ModelsSelector extends Mixins(PropertyComponent) {
  @Prop() dataItems!:any;
  @Inject()
  getController!: () => forms.FormGroup

  get controller(){
    return this.getController();
  }

  triggerObjLists:any = [];

  appCode = ''

  bizModel = ''

  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }
  onTreeSelect(val:string[]) {
    const len = val.length;
    let back: any = {
      appCode: '',
      schemaCode: ''
    };
    if(len > 0){
      back.appCode = val[0];
      back.schemaCode = val[len-1];
    }
    if (this.value.appCode === val[0] && this.value.schemaCode === val[len-1]) {
      return;
    }
    this.emitChange(back);
    this.cleanVal();
  }

  cleanVal() {
    
    if(this.controller.children.targetObjectCode){
      this.controller.children.targetObjectCode.value = '';
    }

    // if(this.controller.children.dataCondition){
    //   this.controller.children.dataCondition.value = {};
    // }
    
    if (this.controller.children.createDataAction) {
      this.controller.children.createDataAction.value = {};
    }

    if (this.controller.children.dataActions) {
      this.controller.children.dataActions.value = {}
    }
    
    if(this.controller.children.filterCondition){
      this.controller.children.filterCondition.value = {};
    }

    if(this.controller.children.judgeCondition){
      this.controller.children.judgeCondition.value = {};
    }

    if(this.controller.children.verifyConditions){
      this.controller.children.verifyConditions.value = {};
    }
    // 目标对象
    if(this.controller.children.targetObjectCode){
      this.controller.children.targetObjectCode.value = '-1';
    }else{
      setTimeout(() => {
        this.controller.children.targetObjectCode.value = '-1';
      }, 100)
    }
    // 数据动作
    if (this.controller.children.dataActions) {
      this.controller.children.dataActions.value = []
    }
    // 新增数据动作
    if (this.controller.children.createDataAction) {
      this.controller.children.createDataAction.value = {};
    }

    // 
    if(this.controller.children.filterCondition){
      this.controller.children.filterCondition.value = {};
    }
  }
  

  selectChange(val) {
    this.emitChange(val);
  }

  getAppPackage(code:string) {
    if(!code) {
      return;
    }
    listApi.getAppPackage(code).then(res => {
      if (res.errcode === 0) {
        this.appCode = res.data.code;
      } else {
        this.appCode = this.value.appCode;
      }
      this.bizModel = this.value.schemaCode
    })
  }

  @Watch('value',{
      immediate: true
  }) 
  onValueChange(val:any) {
      if(val && val.appCode) {
        
        this.getAppPackage(val.schemaCode);
      } else {
        this.appCode = '';
        this.bizModel = '';
      }

  }
}
</script>

<style lang="less" scoped>
    
</style>

