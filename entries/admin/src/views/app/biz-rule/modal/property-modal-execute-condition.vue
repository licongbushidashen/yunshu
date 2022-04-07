<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <span class="txt">{{ inputValue }}</span>
        <a-icon type="ellipsis" />
    </div>
    <a-modal
      wrapClassName="property-execute-condition"
      width="662px"
      :visible="visible"
      @ok="handleOk"
      @cancel="modalHide"
      okText="保存"
      cancelText="取消"
    >
      <template slot="title">
        <div>
          执行条件
        </div>
      </template>
      <div class="content">

        <div>
          <div class="filters">
            <a-row>
              <a-col :span="7">数据项</a-col>
              <a-col :span="4">函数</a-col>
              <a-col :span="4">值类型</a-col>
              <a-col :span="8">值</a-col>
              <a-col :span="1"></a-col>
            </a-row>
            <a-row v-for="(row, filterIndex) in filtersList" :key="filterIndex">
              <a-col :span="7">
                <data-item-select
                  :onlyPublished="true"
                  class="wid_168"
                  v-model="row.currentSchemaDataItem"
                  :list="dataItemList"
                  :systemFilterCtl="{code: ['workflowInstanceId', 'createdTime', 'modifiedTime','id', 'sequenceNo', 'ownerDeptQueryCode', 'sortKey']}"
                  :bizFilterCtl="{ type: [10, 8, 6, 7, 11]}"
                  :disabled="false"
                  @change="(val) => { return ondataItemChange(val, row) }"
                ></data-item-select>
              </a-col>
              <a-col :span="4">
                <!-- :disabled="true" -->
                <a-select
                  class="wid_92" 
                  v-model="row.filterCondition.maturityFunctionType"
                >
                  <a-select-option 
                    v-for="(item,index) in row.filterCondition.list"
                    :key="index"
                    :value="item.key"
                  >{{ item.name }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="4">
                <a-select show-search 
                  class="wid_92" 
                  v-model="row.valueType.value"
                  placeholder="请选择"
                  @change="(val) => { return handleValueTypeChange(val,row) }"
                >
                  <a-select-option 
                    v-for="(item,index) in getValueType(row)"
                    :key="index"
                    :value="item.value"
                  >{{ item.name }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="8">
                <div v-if="row.valueType.value === 'DYNAMIC'">
                  <data-item-select
                    :onlyPublished="true"
                    class="wid_194"
                    v-model="row.value"
                    :list="getValueList(row)"
                    :systemFilterCtl="{code: ['workflowInstanceId', 'sequenceNo', 'ownerDeptQueryCode', 'sortKey']}"
                    :bizFilterCtl="{ type: [10, 8, 6, 7, 11]}"
                    :disabled="false"
                  ></data-item-select>
                </div>

                <!-- 日期 需要校验 -->
                <div v-else-if="getPropertyType(row) === 3 && row.valueType.value === 'FIXED'">
                  <a-date-picker
                    class="wid_194"
                    v-model="row.value"
                    placeholder="请选择时间"
                  />
                </div>

                <!-- 时间 需要校验 -->
                <div v-else-if="getPropertyType(row) === 20 && row.valueType.value === 'FIXED'">
                  <a-time-picker
                    class="wid_194"
                    v-model="row.value"
                    placeholder="请选择时间"
                  />
                </div>

                <!-- 逻辑 -->
                <div v-else-if="getPropertyType(row) === 4 && row.valueType.value === 'FIXED'">
                  <a-select show-search 
                    class="wid_194" 
                    v-model="row.value"
                  >
                    <a-select-option :value="true">true</a-select-option>
                    <a-select-option :value="false">false</a-select-option>
                  </a-select>
                </div>

                <!-- 选人控件 -->
                <div v-else-if="getPropertyType(row) === 5 && row.valueType.value === 'FIXED'">
                  <staff-selector 
                    v-model="row.value" 
                    :options="staffSelectorOpts"
                    class="wid_194"
                  ></staff-selector>
                </div>
                <!-- 单据状态 -->
                <div v-else-if="getCodeName(row) === SystemDataItemCode.SequenceStatus">
                  <a-select show-search 
                    class="wid_194" 
                    v-model="row.value"
                    :disabled="!row.valueType.value"
                  >
                    <a-select-option 
                      v-for="(item, index) in sequenceStatusList" 
                      :value="item.value"
                      :key="index"
                    > {{ item.name }} </a-select-option>
                  </a-select>
                </div>

                <a-input 
                  class="wid_194"
                  placeholder="请输入"
                  v-model="row.value" 
                  v-else-if="row.valueType.value !== 'EMPTY'" />
              </a-col>
              <a-col :span="1">
                <span class="delete" @click="delRows(filterIndex)">
                  <i class="icon aufontAll h-icon-all-delete-o"></i>
                </span>
              </a-col>
            </a-row>
          </div>
          <div class="add" @click="addRows">
            <span>
              <i class="icon aufontAll h-icon-all-plus-o"></i>
            </span>
            <span>新增条件</span>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Mixins, Watch } from "vue-property-decorator";

import { PropertyComponent } from '@h3/designer-core/property-panel';

import DataItemSelect from "../../data-rule/data-item-select.vue";

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";

import appsApi from "@/apis/apps";

import { DataItemType } from "@cloudpivot/form/schema";

import { SystemDataItemCode } from "../typings/rule-data-condition-type";

import moment from "moment";
import { Switch } from "@h3/antd-vue";

@Component({
  name: "propertyJudgementCondition",
  components: {
    DataItemSelect,
    StaffSelector
  }
})
export default class propertyJudgementCondition extends Mixins(PropertyComponent) {

  visible: boolean = false;

  // 当前模型 数据项
  @Prop() dataItems!: any;

  filtersList: any[] = [];

  // 数据项列表
  dataItemList: any[] = [];

  //对比函数
  maturityFunctionList:any = [
    {key:'EQ',name:'等于',index: 1},
  ]

  //值类型
  valueTypeList: any = [
    {name:"动态值", value: 'DYNAMIC'},
    {name:"固定值", value: 'FIXED'},
    {name:"为空", value: 'EMPTY'}
  ]

  //单据状态
  sequenceStatusList: any = [
    {name: "草稿", value: "DRAFT"},
    {name: "进行中", value: "PROCESSING"},
    {name: "已完成", value: "COMPLETED"},
    {name: "已作废", value: "CANCELED"}
  ]

  inputValue: string = "未设置";

  SystemDataItemCode: any = SystemDataItemCode;

  // 选人控件初始化参数
  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择"
  };
  created(){
    this.dataItemList = this.dataItems.filter(item => item.propertyType !== DataItemType.RelevanceFormEx);
    if(this.value.length > 0){
      this.inputValue = "已设置";
    }else{
      this.inputValue = "未设置";
    }
  }
  
  @Watch('value')
  onValueChange(val){
    this.dataItemList = this.dataItems.filter(item => item.propertyType !== DataItemType.RelevanceFormEx);
    if(this.value.length > 0){
      this.inputValue = "已设置";
    }else{
      this.inputValue = "未设置";
    }
  }

  initData(){ 
    //数据回写
    this.buildDefaultData();
    let execCondition: any = this.value;
    if(execCondition.length > 0){
      this.filtersList = [];
      this.inputValue = '已设置';
      execCondition.forEach((c)=>{
        let currentRowData = this.dataItems.find(
          (item: any) => item.code === c.currentSchemaDataItem
        );
        if(!currentRowData){
          return;
        }
        this.filtersList.push({
          currentSchemaDataItem: c.currentSchemaDataItem, //数据项
          filterCondition: {
            maturityFunctionType: c.ruleDataConditionType,
            list: this.maturityFunctionList,
          }, //对比函数
          valueType: {
            value: c.ruleValueType
          },
          value: (currentRowData.propertyType === DataItemType.Date && c.ruleValueType === 'FIXED') ? moment(c.value) : (c.ruleValueType === 'FIXED' && currentRowData.propertyType === DataItemType.Time) ? moment(c.value, "HH:mm:ss") : c.value //值
        })
      })
      this.filtersList.length === 0 && this.buildDefaultData();
    }
  }

  buildDefaultData(){
    this.filtersList = [{
      currentSchemaDataItem: undefined, //数据项
      filterCondition: {
        maturityFunctionType: "EQ",
        list: this.maturityFunctionList,
      }, //对比函数
      valueType: {
        value: undefined
      },
      value: undefined //值
    }];
  }

  // 确定
  handleOk(): void {
    let switchBtn = false;
    this.filtersList.forEach((f)=>{
      if(!f.currentSchemaDataItem || !f.valueType.value ){
        switchBtn = true;
      }
      if((f.valueType.value === 'DYNAMIC' || f.valueType.value === 'FIXED') && f.value === ''){
        switchBtn = true;
      }
    })
    if(switchBtn){
      this.$message.error('执行条件不成立');
      return;
    }
    this.emitChange(this.buildData())
    this.modalHide();
  }

  buildData(){
    let item: any = [];
    this.filtersList.forEach((f)=>{

      console.log('f====>', f)
      let value: any = undefined;
      let source  = this.dataItems.find((t: any) => f.currentSchemaDataItem === t.code);
      if(source.propertyType === DataItemType.Date && f.valueType.value === 'FIXED'){
        value = f.value.format('YYYY-MM-DD');
      } else if(source.propertyType === DataItemType.Time && f.valueType.value === 'FIXED') {
        value = f.value.format('HH:mm:ss');
      }else{
        value = f.value;
      }

      let obj:any = {
        currentSchemaDataItem: f.currentSchemaDataItem,
        ruleDataConditionType:f.filterCondition.maturityFunctionType,
        ruleValueType: f.valueType.value,
        value,
        currentSchemaDataItemName: undefined,
        valueName: undefined
      }

      if(f.currentSchemaDataItem){
        let currentItem:any = this.dataItemList.find(el => el.code === f.currentSchemaDataItem)
        if(currentItem){
          obj.currentSchemaDataItemName = currentItem.name
        }
      }
      if(f.valueType.value === 'DYNAMIC' && value){
        let currentItem:any = this.dataItemList.find(el => el.code === f.currentSchemaDataItem)
        console.log('currentItem=22==>',currentItem)
        if(currentItem){
          obj.valueName = currentItem.name
        }
      }
      


      item.push(obj)
    })
    return item;
  }

  modalShow(): void {
    this.initData();
    this.visible = true;
  }
  modalHide(): void {
    this.visible = false;
  }
  // 添加行
  addRows(): void {
    const item:any = {
      currentSchemaDataItem: undefined, //数据项
      filterCondition: {
        maturityFunctionType: "EQ",
        list: this.maturityFunctionList,
      }, //对比函数
      valueType: {
        value:undefined
      },
      value: undefined //值
    }
    this.filtersList.push(item)
  };

  delRows(index) {
    this.filtersList.splice(index, 1);
  }

  ondataItemChange(val: any, row: any){
    let data: any = this.dataItemList.find((d)=>{ return  d.code === val });
    row.value = undefined;
    row.valueType.value = undefined;
  }

  getValueList(row: any){
    let source: any = this.dataItemList.find((d)=>{ return  d.code === row.currentSchemaDataItem });
    if(!source) {
      return [];
    }
    return this.dataItemList.filter((c: any) => {
      switch(source.propertyType) {
        case DataItemType.ShortText:
        case DataItemType.Radio:
        case DataItemType.Checkbox:
        case DataItemType.Dropdown:
        case DataItemType.DropdownMulti:
          return ([DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(source.propertyType) ? [DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(c.propertyType) : [DataItemType.Checkbox, DataItemType.DropdownMulti ].includes(c.propertyType))
          break
        case DataItemType.StaffSingle:
        case DataItemType.StaffMulti:
        case DataItemType.DeptSingle:
        case DataItemType.DeptMulti:
          return ([source.propertyType, DataItemType.StaffDeptMix].includes(c.propertyType)) && c.code !== row.currentSchemaDataItem
          break
        default: 
          return c.propertyType === source.propertyType && c.code !== row.currentSchemaDataItem
      }
    });
  }

  getValueType(row: any){
    let source: any = this.dataItemList.find((d)=>{ return  d.code === row.currentSchemaDataItem })
    if(!source) {
      return this.valueTypeList;
    }
    else{
      if(source.propertyType === DataItemType.Logic || source.defaultProperty){
        if(source.code === SystemDataItemCode.SequenceStatus){
          return this.valueTypeList.filter((v: any) => v.value === 'FIXED')
        }else{
          return this.valueTypeList.filter((v: any) => v.value !== 'EMPTY')
        }
      }else{
        return this.valueTypeList
      }
    }
  }

  getPropertyType(row: any){
    let source: any = this.dataItemList.find((d)=>{ return  d.code === row.currentSchemaDataItem })
    if(!source) {
      return undefined;
    }
    return source.propertyType;
  }
  getCodeName(row: any){
    let source: any = this.dataItemList.find((d)=>{ return  d.code === row.currentSchemaDataItem })
    if(!source) {
      return undefined;
    }
    return source.code;
  }

  handleValueTypeChange(val: any, row: any){
    row.value = undefined;
  }
}
</script>

<style lang='less'>
.property-execute-condition {
  .row {
    display: flex;
    align-items: center;
  }
  .ant-modal-body {
    max-height: 500px;
    overflow-y: auto;
  }
  .add {
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    span {
      margin-right: 8px;
    }
  }
  .wid_168 {
    width: 168px;
    .data-select{
      width: 168px !important;
    }
  }
  .wid_92 {
    width: 92px;
  }
  .wid_194 {
    width: 194px;
    .data-select{
      width: 194px !important;
    }
  }
}
</style>
<style lang='less' scoped>
  .filters {
    padding-left: 8px;
    /deep/.ant-row{
      margin-bottom: 6px;
    }
    /deep/.ant-row > div{
      font-size: 12px;
      font-weight:500;
      color:rgba(0,0,0,0.65);
      line-height:20px;
    }
  }
</style>