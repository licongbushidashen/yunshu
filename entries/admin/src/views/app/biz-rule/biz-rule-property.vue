<template>
  <div class="property-container">
    <!-- 控件属性 -->

    <a-tabs
      :activeKey="tabKey"
      @change="tabChange"
      class="property-container-tabs"
    >
      <!-- tab 1 -->
      <a-tab-pane
        tab="节点属性"
        key="ControlAttribute"
      >
        <property-panel
          class="property-panel-style"
          :schema="property.schema"
          :settings="property.settings"
          :data="property.data"
          @change="nodePropertyChange"></property-panel>
      </a-tab-pane>
      <!-- tab 2 -->
      <a-tab-pane tab="规则属性" key="BizRuleAttribute">
        <property-panel
          ref="bizRuleAttribute"
          class="property-panel-style"
          :schema="bizRuleProperty.schema"
          :settings="bizRuleProperty.settings"
          :data="bizRuleProperty.data"
          @change="bizRulePropertyChange"
        ></property-panel>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import {
 Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import { PropertyPanel, factory } from "@h3/designer-core/property-panel";

// import schema from "./property-schema/node-create/schema";

import bizRuleschema from "./property-schema/biz-rule-property/schema";
import bizRuleSetting from "./property-schema/biz-rule-property/settings";

// import settings from "./property-schema/node-create/design/settings";
import "./property-desgner-extend";
// import { Desgner } from "@h3/ui-designer";
import { State, Action, namespace } from 'vuex-class';

import { NodeType, systemNode, propertyNode } from './typings/node-type';

import { settings, schema } from './property-schema';

const BizRuleModule = namespace('Apps/BizRule');
// const componentData = factory.build(schema as any, settings)

@Component({
  name: 'BizRuleProperty',
  components: {
    PropertyPanel
  }
})

export default class BizRuleProperty extends Vue {
  @BizRuleModule.State('curComponent') curComponent: any;
  @BizRuleModule.State('workflowData') workflowData: any;
  @BizRuleModule.State('currentActivity') currentActivity: any;

  @BizRuleModule.Mutation('setWorkflowData') setWorkflowData: any;
  @BizRuleModule.Mutation('updateNodeProps') updateNodeProps: any;

  // @Prop() data !: any;
  @Prop() dataItems!:any;
  tabKey: any = "BizRuleAttribute";
  activeCollapse: any[] = ["base", "control"];

  property:any = {}

  propertySchema:any = ''
  propertySettings:any = ''
  propertyData:any = {}

  bizRuleProperty = {
  }

  // 页签切换
  tabChange(tabKey: any) {
    if (this.currentActivity && Object.keys(this.currentActivity).length > 0) {
      if(propertyNode.includes(this.currentActivity.nodeType)) {
        this.tabKey = 'BizRuleAttribute';
        this.$message.info("请先选择业务节点");
        return;
      }
      this.tabKey = tabKey;
    } else {
      this.$message.info("请先选择节点");
    }
  }

  nodeClick(node:any) {
    const v = this.currentActivity;
    const bizRuleAttribute = propertyNode;
    if(bizRuleAttribute.includes(v.nodeType)) {
      this.tabKey = 'BizRuleAttribute';
    } else {
      this.tabKey = 'ControlAttribute';
    }
  }

  setBizRuleProperty() {
    const bizRule = JSON.parse(JSON.stringify(bizRuleschema));
    // 默认规则编码不可以编辑
    if (this.workflowData.defaultRule) {
      bizRule.properties.code.disabled = true;
      bizRule.properties.bizRuleType.disabled = true;
    } else {

    }

    if(/isEdit=false/.test(location.href)){
      bizRule.properties.code.disabled = true;
    }
    const data = factory.build(bizRule);
    for(const item in data.children) {
      if(this.workflowData[item]) {
        data.children[item].value = this.workflowData[item];
      };
    }
    // 规则属性节点设置数据项
    if (bizRuleSetting.properties && bizRuleSetting.properties.display) {
      const display: any = bizRuleSetting.properties.display;
      for(const item in display) {
        if (display[item].component && display[item].component.options && display[item].component.options.dataItems) {
          display[item].component.options.dataItems = this.dataItems;
        }
      }
    }

    this.bizRuleProperty = {
      schema: bizRule,
      settings: bizRuleSetting,
      data
    }
  }

  @Watch('curComponent')
  onCurComponentchange(v) {
    if (!v) {
      this.tabKey = 'BizRuleAttribute'
      return
    }
    if (v === 'WorkflowProperty' || v ==='LineProperty') {
      this.tabKey = 'BizRuleAttribute'
    } else {
      this.tabKey = 'ControlAttribute'
    }
  }

  nodePropertyChange(key:string,val:any, data:any) {
    if (val === undefined) {
      return
    }
    //处理消息通知节点链接类型变化时逻辑
    if(key === 'linkType'){
      this.handleLinkTypeChange(val,data);
    }
    if (key === "triggerObjectCode") {
      this.updateNodeProps({key: 'childTriggerConditionType', value: ''});
      setTimeout(() => {
        this.onCurrentActivityChange(this.currentActivity)
      }, 0);
    }

    this.updateNodeProps({key, value: val.value ?val.value:val });
  }

  handleLinkTypeChange(value: string, data: any){
    if(value === 'FORM_LINKS'){
      data.children.sheetCode.display = true;
      data.children.url.value = '';
      data.children.url.display = false;
    }else{
      data.children.sheetCode.display = false;
      data.children.url.display = true;
    }
  }

  bizRulePropertyChange(key:string,value:any, data: any) {
    const _backData = { ...this.workflowData };
    _backData[key] = data.value[key];
    this.setWorkflowData(_backData);
  }

  setChildOption(theSetting, node) {
    const dataManipulation = [NodeType.Create, NodeType.Delete,NodeType.Update];
    const childTriggerConditionType = theSetting.properties.display.childTriggerConditionType;
    if (this.workflowData.defaultRule && childTriggerConditionType) {
       const options = childTriggerConditionType.selectOptions;
       let _options = [...options];
      if(dataManipulation.includes(node.nodeType) && this.workflowData.code === 'Available') {

        theSetting.properties.display.childTriggerConditionType.selectOptions =  _options.filter(res => res.value === 'VALID')
      }
      if(dataManipulation.includes(node.nodeType) && this.workflowData.code === 'Cancel') {

        theSetting.properties.display.childTriggerConditionType.selectOptions =  _options.filter(res => res.value === 'INVALID')
      }
      if(dataManipulation.includes(node.nodeType) && this.workflowData.code === 'Delete') {
        theSetting.properties.display.childTriggerConditionType.selectOptions =  _options.filter(res => res.value === 'DELETE')
      }
      if(dataManipulation.includes(node.nodeType) && this.workflowData.code === 'Update') {
        const opt = ['ADD', 'DELETE', 'MODIFY']
        theSetting.properties.display.childTriggerConditionType.selectOptions =  _options.filter(res => opt.includes(res.value))
      }

      if( dataManipulation.includes(node.nodeType) && this.workflowData.code === 'Create') {
        theSetting.properties.display.childTriggerConditionType.selectOptions =  _options.filter(res => res.value === 'ADD')
      }

      if( dataManipulation.includes(node.nodeType) && this.workflowData.code === 'Load') {
        theSetting.properties.display.childTriggerConditionType.selectOptions = []
      }

    }

    return theSetting;
  }

  setSchemaData(theSchema: any, v: any){
    if(v.linkType !== 'FORM_LINKS'){
      theSchema.properties['url'].hidden = false;
      theSchema.properties['sheetCode'].hidden = true;
    }else{
      theSchema.properties['url'].hidden = true;
      theSchema.properties['sheetCode'].hidden = false;
    }
    return theSchema;
  }

  @Watch('$route')
  routeChange(){
    this.setBizRuleProperty()
  }

  @Watch('currentActivity')
  onCurrentActivityChange(v) {
    if(Object.keys(v).length === 0){
      this.tabKey = 'BizRuleAttribute';
      return;
    }
    // 没有节点属性，直接显示业务规则属性
    const bizRuleAttribute = propertyNode;
    if(bizRuleAttribute.includes(v.nodeType)) {
      this.tabKey = 'BizRuleAttribute';
      return;
    }
    this.tabKey = 'ControlAttribute';
    let theSchema = JSON.parse(JSON.stringify(schema[v.nodeType]));
    // console.log('v.nodeType', v.nodeType);
    // console.log('theSchema', theSchema);
    const subscription = settings[v.nodeType].properties.subscription;
    let theSetting = JSON.parse(JSON.stringify(settings[v.nodeType]));
    theSetting.properties.subscription = subscription;
    theSetting = this.setChildOption(theSetting, v);
    //处理消息通知节点数据
    if(v.linkType){
      theSchema = this.setSchemaData(theSchema,v)
    }
    if (v.edit) {
      theSchema.properties.nodeCode.disabled = true;
    }
    if (theSetting.properties && theSetting.properties.display) {
      const display = theSetting.properties.display;
      for(const item in display) {
        if (display[item].component && display[item].component.options && display[item].component.options.dataItems) {
          display[item].component.options.dataItems = this.dataItems;
        }
      }
    }
    if (theSchema && theSetting) {
      this.propertySchema = theSchema;
      this.propertySettings = theSetting;


      const data = factory.build(theSchema);
      console.log(data)

      this.property = {
        schema: theSchema,
        settings: theSetting,
        data
      }
      // this.propertyData = data;

      for(let key in data.children) {
        if(v[key]) {
          const value = data.children[key].value;
          // if(typeof value === 'object') {
          //   data.children[key].value = JSON.parse( JSON.stringify(v[key]) )
          //   // Object.assign(value, v[key]);

          // } else {
          //   data.children[key].value = v[key];
          // }
          data.children[key].value = v[key];
        };
      }

      this.property = {
        schema: theSchema,
        settings: theSetting,
        data
      }
    }
  }
}
</script>

<style lang="less" scoped>
.property-container {
  background: #E9EDF2;
  min-width: 267px;
  height: 100%;
  &-tabs {
    /deep/ .ant-tabs-nav{
      font-weight: 600;
    }
  }
  // .property-panel-style {

  // }
  /deep/.ant-tabs {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    .ant-tabs-bar {
      flex: 0 0 40px;
      margin: 0;
    }
    .ant-tabs-bar,
    .ant-tabs-tabpane {
      background: #fff;
      border-radius: 4px;
    }
    .ant-tabs-nav-wrap {
      text-align: center;
    }
    .ant-collapse-header {
      padding-left: 24px!important;
      .anticon-right {
        //  padding-left: 8px;
        left: 8px;
      }
    }
    .ant-tabs-content {
      flex: 1;
      height: 100%;
      .ant-tabs-tabpane {
        overflow: auto;
        max-height: 100%;
        margin-top: 8px;
        .ant-collapse-content-box {
          padding: 0px;
        }
      }
    }
  }
}
</style>
<style lang="less">
.property-container {
  .property-panel-style {
    .last-none-item{
      border-top: 1px solid #E9E9E9;
    }
    .property-item {
      position: relative;
      &:first-child{
        border-top: 0
      }
      // &.last-none-item {
      //   &
      // }
      border-top: 1px solid #E9E9E9;
      display: flex;
      &:last-child {
        border-bottom: 1px solid #E9E9E9;
      }
      .property-label{
        flex: none;
        width: 40%;
        line-height: 32px;
        label {
          margin-left: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }
      }
      .property-field{
         width: 60%;
          color:rgba(0,0,0,0.85);
          font-weight: 400;
         .ant-input,.ant-select {
            color:rgba(0,0,0,0.85);
            font-weight: 400;
         }
        .ant-select-disabled {
          .ant-select-arrow{
            display: none;
          }
        }
        border-left: 1px solid #E9E9E9;
        flex: 1;
        .ant-select-selection, .ant-select  {
          width: 100%;
        }
        .ant-input,.ant-select-selection{
          border: 0;
        }
      }
    }
    .required {
      &:before {
        content: "*";
        display: inline-block;
        vertical-align: middle;
        color: #f4454e;
        position: absolute;
        font-size: 12px;
        top: 50%;
        transform: translate(-50%, -50%);
        left: 4px;
        height: 10px;
      }
    }
  }
}
</style>

