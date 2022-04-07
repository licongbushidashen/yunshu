<template>
  <div class="trigger-schema-code">
    <a-select
      style="width: 100%"
      @change="selectChange"
      v-model="theVale"
      placeholder="请选择"
    >
      <a-select-option
        v-for="item in triggerObjLists"
        :key="item.code"
        :value="item.code"
        :disabled="!item.published"
        :title="item.name+'['+item.code+']'"
      >{{ `${item.name}[${item.code}]` }}</a-select-option>
    </a-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins, Watch, Inject } from 'vue-property-decorator';
import { PropertyComponent } from '@h3/designer-core/property-panel';
import AppsApi from '@/apis/apps';
import * as forms from 'h3-forms'

@Component({
  name: 'trigger-schema-code',
})

export default class TriggerSchemaCode extends Mixins(PropertyComponent) {
  @Prop() dataItems!:any;
  @Inject()
  getController!: () => forms.FormGroup

  get controller(){
    return this.getController();
  }

  arrs: string[] = ['Create','Update','Delete','Load','Cancel','Available','GetList']

  triggerObjLists:any = [];

  theVale:any = null;

  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  created() {
    this.onValueChange(this.value);
    const params = {
      schemaCode: this.schemaCode
    };
    AppsApi.getBizmodeltitle(params).then((res:any) => {
      console.log(res)
      if (res.errcode === 0) {
        let mainPublished = this.dataItems.some(item=>item.published);
        const main = {
          code: this.schemaCode,
          name: res.data,
          published:mainPublished
        }
        let code: any = this.$route.query.code;
        // 【ID1005266】自定义的业务规则，绑定在流程系统活动或者流程事件上的时候，子表相关规则不生效
        //  触发对象这里过滤掉全部子表数据
        if (this.arrs.indexOf(code) === -1) {
          this.triggerObjLists = [main]
          return false
        }
        const subSchemaLists = this.dataItems?this.dataItems.filter(items => items.propertyType === 8).map(item => {
          return {code:`${this.schemaCode}.${item.code}`, name: item.name, published: item.published}
        }):[];
        this.triggerObjLists = [main, ...subSchemaLists];
      }
    });
  }

  selectChange(val) {
    this.emitChange(val);
    this.cleanVal();
     this.theVale = val;
  }

  cleanVal() {
    if(this.controller.children.dataCondition){
      this.controller.children.dataCondition.value = {};
    }
    
    if (this.controller.children.childTriggerConditionType) {
      this.controller.children.childTriggerConditionType.value = '';
    }
    
    if (this.controller.children.createDataAction) {
      this.controller.children.createDataAction.value = {};
    }

    if (this.controller.children.dataActions) {
      this.controller.children.dataActions.value = []
    }
    if(this.controller.children.filterCondition){
      this.controller.children.filterCondition.value = {};
    }

    if(this.controller.children.targetObjectCode){
      this.controller.children.targetObjectCode.value = '';
    }
    
    if(this.controller.children.judgeCondition){
      this.controller.children.judgeCondition.value = {};
    }

    if(this.controller.children.verifyConditions){
      this.controller.children.verifyConditions.value = {};
    }
  }

  @Watch('value') 
  onValueChange(val) {
    this.theVale = val || undefined;
    // if (val) {
    //   if (val.indexOf('.') > -1) {
    //     this.controller.children.childTriggerConditionType.display = true;
    //   } else {
    //      this.controller.children.childTriggerConditionType.display = false;
    //   }
    // }
  }
}
</script>

<style lang="less" scoped>
    
</style>

