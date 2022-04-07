<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <span class="txt">{{ inputValue }}</span>
        <a-icon type="ellipsis" />
    </div>
    <a-modal
      wrapClassName="property-bind-biz-method"
      width="810px"
      :visible="visible"
      @ok="handleOk"
      @cancel="modalHide"
      okText="保存"
      cancelText="取消"
    >
      <template slot="title">
        <div>
          绑定业务方法
        </div>
      </template>
      <div class="content">
        <div>
          <div class="server-methods">
            <a-row>
              <a-col :span="24">
                <span class="biz-tips" v-if="isGetList">请绑定返回数据类型为list的业务方法</span>
                <span class="biz-tips" v-else>请绑定除返回数据类型为list之外的业务方法</span>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24">基础属性</a-col>
            </a-row>
            <a-row class="base-type">
              <a-col :span="12">
                <span class="span">业务服务</span>
                <a-select
                  showSearch
                  v-model="serviceCode"
                  @change="selectService">
                  <a-select-option
                    v-for="(item,i) in servicesList"
                    :key="i"
                    :value="item.code"
                    :disabled="item.disabled"
                  >{{ item.name }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="12">
                <span class="span">业务方法</span>
                <a-select
                  :disabled="disabledMethod"
                  v-model="serviceMethodCode"
                  @change="selectMethod">
                  <a-select-option
                    v-for="(item,i) in methodList"
                    :key="i"
                    :value="item.code"
                  >{{ item.name }}</a-select-option>
                </a-select>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24">传入参数</a-col>
            </a-row>
            <a-row type="flex" class="header">
              <a-col class="col" :span="2">序号</a-col>
              <a-col class="col" :span="5">参数</a-col>
              <a-col class="col" :span="5">参数类型</a-col>
              <a-col class="col" :span="6">映射方式</a-col>
              <a-col class="col" :span="6">映射对象</a-col> 
            </a-row>
            <a-row
              type="flex"
              v-for="(item, index) in inputMappings"
              :key="item.index + item.serviceMethodParameterCode"
            >
              <a-col class="col center" :span="2">{{ index+1 }}</a-col>
              <a-col class="col" :span="5">
                <span 
                  class="long-text" 
                  :title="item.serviceMethodParameterCode"
                >{{ item.serviceMethodParameterCode }}</span>
              </a-col>
              <a-col class="col" :span="5">{{ getItemName(item) }}</a-col>
              <a-col class="col" :span="6">
                <div v-if="isBizMethod" style="width:100%">
                  <a-select
                    v-model="item.codeType"
                    @change="(val) => { return codeTypeChange(val,item) }"
                  >
                    <a-select-option
                      v-for="(itemType,i) in codeTypes"
                      :key="i"
                      :value="itemType.value"
                      :title="itemType.label"
                    >{{ itemType.label }}</a-select-option>
                  </a-select>
                </div>
                <div v-else style="width:100%">
                  {{ getCodeType(item.codeType) }}
                </div>
                
              </a-col>
              <a-col class="col select" :span="6">
                <a-select
                  v-model="item.bizCode"
                  v-if="item.codeType === 1"
                >
                  <template>
                    <a-select-opt-group>
                      <span slot="label" class="select-title">业务数据项</span>
                      <a-select-option
                        v-for="(data,i) in getDataItems(inputMappings,item)"
                        :key="i"
                        :value="data.code"
                        :title="data.name+'['+data.code+']'"
                      >{{ data.name }}[{{ data.code }}]</a-select-option>
                    </a-select-opt-group>
                    <a-select-opt-group>
                      <span slot="label" class="select-title">系统数据项</span>
                      <a-select-option
                        v-for="(data,i) in getDataItems(inputMappings,item, true)"
                        :key="i"
                        :value="data.code"
                      >{{ data.name }}[{{ data.code }}]</a-select-option>
                    </a-select-opt-group>
                  </template>
                </a-select>
                <div v-else style="width:100%">
                  <a-select
                    v-model="item.bizCode"
                    v-if="isGetList"
                    mode="combobox"
                  >
                    <a-select-option
                      v-for="(itemConst,i) in getInputConstList(item)"
                      :key="i"
                      :value="itemConst.value"
                      :title="itemConst.title"
                    >{{ itemConst.label }}</a-select-option>
                  </a-select>
                  <a-input v-else v-model="item.bizCode" />
                </div>
              </a-col> 
            </a-row>

            <a-row style="margin-top:20px;">
              <a-col :span="24">返回参数</a-col>
            </a-row>
            <a-row type="flex" class="header">
              <a-col class="col" :span="2">序号</a-col>
              <a-col class="col" :span="5">参数</a-col>
              <a-col class="col" :span="5">参数类型</a-col>
              <a-col class="col" :span="6">映射方式</a-col>
              <a-col class="col" :span="6">映射对象</a-col> 
            </a-row>
            <a-row
              type="flex"
              v-for="(item, index) in outputMappings"
              :key="item.index + item.serviceMethodParameterCode"
            >
              <a-col class="col center" :span="2">{{ index+1 }}</a-col>
              <a-col class="col" :span="5">
                <span 
                  class="long-text" 
                  :title="item.serviceMethodParameterCode"
                >{{ item.serviceMethodParameterCode }}</span>
              </a-col>
              <a-col class="col" :span="5">{{ getItemName(item) }}</a-col>
              <a-col class="col" :span="6">
                <a-select
                  v-model="item.codeType"
                  v-if="isGetList"
                  @change="(val) => { return codeTypeChange(val,item) }"
                >
                  <a-select-option
                    v-for="(itemType,i) in codeTypes"
                    :key="i"
                    :value="itemType.value"
                    :title="itemType.label"
                  >{{ itemType.label }}</a-select-option>

                </a-select>
                <div style="width:100%" v-else>
                  {{ getCodeType(item.codeType) }}
                </div>
              </a-col>
              <a-col class="col select" :span="6">
                <a-select
                  v-model="item.bizCode"
                  v-if="item.codeType === 1"
                  allowClear
                >
                  <template>
                    <a-select-opt-group>
                      <span slot="label" class="select-title">业务数据项</span>
                      <a-select-option
                        v-for="(data,i) in getDataItems(outputMappings,item)"
                        :key="i"
                        :value="data.code"
                        :title="data.name+'['+data.code+']'"
                        :disabled="data.selected"
                      >{{ data.name }}[{{ data.code }}]</a-select-option>
                    </a-select-opt-group>
                    <!-- <a-select-opt-group>
                      <span slot="label" class="select-title">系统数据项</span>
                      <a-select-option
                        v-for="(data,i) in getDataItems(outputMappings,item, true)"
                        :key="i"
                        :value="data.code"
                      >{{ data.name }}[{{ data.code }}]</a-select-option>
                    </a-select-opt-group> -->
                  </template>
                </a-select>
                <div v-else style="width:100%">
                  <a-select
                    v-model="item.bizCode"
                    v-if="isGetList"
                    mode="combobox"
                  >
                    <a-select-option
                      v-for="(itemConst,i) in outputConstList"
                      :key="i"
                      :value="itemConst.value"
                      :title="itemConst.title"
                    >{{ itemConst.label }}</a-select-option>
                  </a-select>
                  <a-input v-else v-model="item.bizCode" />
                </div>
              </a-col> 
            </a-row>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Mixins, Inject, Watch } from "vue-property-decorator";

import { PropertyComponent } from '@h3/designer-core/property-panel';

import appsApi from '@/apis/apps'; // getDataItemList

import serviceApi from '@/apis/biz-service/service.api'; // listServices

import methodApi from '@/apis/biz-service/method.api'; // listMethodsByCode

import common from '@cloudpivot/common';

import * as forms from "h3-forms";

import { SystemDataItemCode } from "../typings/rule-data-condition-type";

const { getDataItemText } = common.utils.BusinessFunctions;
import {
  dataItemTypeList,
} from "@/components/apps/model/dataitem-modals/dataitem-map";

import {
  DatePicker
} from '@h3/antd-vue';

@Component({
  name: "propertyTimingTask",
  components: {
    ARangePicker: DatePicker.RangePicker
  }
})
export default class propertyTimingTask extends Mixins(PropertyComponent) {

  @Prop() actionType!: any;

  // 当前模型 数据项
  @Prop() dataItems!: any;

  @Inject()
  getController!: () => forms.FormGroup

  get controller(){
    return this.getController();
  }

  @Prop() targetOjectCode!:string;

  @Prop() value!:any

  visible: boolean = false;

  servicesList: BizService.Service.OptionItem[] = [];

  methodList: BizService.Method.Item[] = [];

  // 传入参数数据项列表（包含系统数据项）
  inputDataItemList: any[] = [];

  serviceCode: string = '';

  // 是否禁止操作业务方法
  disabledMethod: boolean = false; 

  serviceMethodCode: string = '';

  inputMappings: BizMethod.CreateInputMapping[] = [];

  outputMappings: BizMethod.CreateOutputMapping[] = [];

  inputConstList: any[] = [
    {
      label: 'offset',
      value: 'offset',
      title: '查询起始位置（从0开始）',
    },
    {
      label: 'offset0',
      value: 'offset0',
      title: '查询起始位置（从0开始）',
    },
    {
      label: 'offset1',
      value: 'offset1',
      title: '查询起始位置（从1开始）',
    },
    {
      label: 'limit',
      value: 'limit',
      title: '查询数量（分页大小）',
    },
    {
      label: 'page',
      value: 'page',
      title: '查询页号（从0开始）',
    },
    {
      label: 'page0',
      value: 'page0',
      title: '查询页号（从0开始）',
    },
    {
      label: 'page1',
      value: 'page1',
      title: ' 查询页号（从1开始）',
    },
  ];

  outputConstList: any[] = [
    {
      label: 'total',
      value: 'total',
      title: '记录总数'
    },
    {
      label: 'list',
      value: 'list',
      title: '当前页记录列表'
    }
  ];

  codeTypes: any[] = [
    {
      label: 'Const',
      value: 0
    },
    {
      label: 'Property',
      value: 1
    }
  ];

  isBizMethod: boolean = false;

  isGetList: boolean = false;

  inputValue: string = "未设置";

  created(){
    if(this.value && this.value.serviceCode){
      this.inputValue = "已设置";
    }else{
      this.inputValue = "未设置";
    }
  }

  @Watch('value')
  onValueChange(val){
    if(this.value && this.value.serviceCode){
      this.inputValue = "已设置";
    }else{
      this.inputValue = "未设置";
    }
  }

  getItemName(item){
    let dataItem = dataItemTypeList.find(el => el.index === item.bizPropertyType)
    if(item.bizPropertyType === 20){
      dataItem = {
        name: '对象id',
        disable: false,
        index: 20
      }
    }
    return dataItem && dataItem.name || item.propertyName 
  }

  async initData(){
    if(this.actionType !== "TimingTask"){
      this.isBizMethod = true;
      this.actionType === "GetList" && (this.isGetList = true);
    }
    let value: any = this.value;

    //数据回写
    if(value && value.serviceCode){
      value = JSON.parse(JSON.stringify(value))
      this.inputValue = "已设置";
      this.serviceCode = value.serviceCode
      this.serviceMethodCode = value.serviceMethodCode;
      
      const res: any = await this.isHasAuthority();

      if (res.data) {
        this.isSelectableService(value.serviceName);
        this.isServiceMethodDisabled();
      } else {
        this.inputValue = "未设置";
        this.serviceCode = "";
        this.serviceMethodCode = "";
        return;
      }
      
      this.getMethodList(this.serviceCode,value,this.serviceMethodCode)
    }
  }

  /**
   * 判断已选业务服务是否存在
   */
  async isHasAuthority() {
    const res: any = await appsApi.getCode({serviceCode: this.serviceCode});

    if (res.errcode !== 0) {
      return this.$message.error(res.errmsg);
    }

    return res;
  }

  /**
   * 判断是否要添加没有权限的业务服务到列表
   */
  isSelectableService(name: string) {
    const isPermission: boolean = this.servicesList.some(item => item.code === this.serviceCode);

    if (!isPermission) {
      this.servicesList.unshift({
        code: this.serviceCode,
        id: this.serviceCode,
        modifiedTime: "",
        name: name,
        disabled: true
      });
    }
  }

  /**
   * 是否允许操作业务方法
   */
  isServiceMethodDisabled() {
    const curService: any = this.servicesList.filter(item => item.code === this.serviceCode);

    if (curService && curService[0] && curService[0].disabled) {
      this.disabledMethod = true;
    } else {
     this.disabledMethod = false; 
    }
  }

  // 确定
  handleOk(): void {
    if(!this.serviceCode){
      this.modalHide();
      this.inputValue = '未设置';
      return;
    }
    if(this.serviceCode && !this.serviceMethodCode){
      this.$message.error('业务方法未选择');
      return;
    }
    const inputDataSourse: any = this.inputMappings.find((i)=>{ return i.bizCode === ''});
    if(inputDataSourse){
      this.$message.error('映射对象未选择');
      return;
    }
    const outputDataSourse: any = this.outputMappings.find((i)=>{ return i.bizCode === ''});
    if(outputDataSourse){
      this.$message.error('映射对象未选择');
      return;
    }
    this.emitChange(this.buildData());
    this.inputValue = '已设置';
    this.modalHide();
  }

  modalShow(): void {
    this.initData();
    this.visible = true;
  }
  modalHide(): void {
    // 清空数据
    this.serviceCode = "";
    this.serviceMethodCode = '';
    this.inputMappings = [];
    this.outputMappings = [];
    this.visible = false;
  }
  // 添加行
  addRows(): void {};
  
  //构建数据
  buildData(){
    let data: any = {};
    data.schemaCode = this.$route.params.bizSchemaCode;
    data.serviceCode = this.serviceCode;
    let serviceData: any = this.servicesList.find((s)=>{ return s.code === this.serviceCode})
    data.serviceName = serviceData.name;
    data.serviceMethodCode = this.serviceMethodCode;
    let serviceMethodData:any = this.methodList.find((s)=>{ return s.code === this.serviceMethodCode});
    data.serviceMethodName = serviceMethodData.name;
    data.methodCode = this.$route.params.appCode;
    data.inputMappings = this.inputMappings;
    data.outputMappings = this.outputMappings;

    data.outputMappings.forEach((item:any) => {
      if(item.bizCode){
        let currentItem:any = this.dataItems.find(el => el.code === item.bizCode)
        if(currentItem){
          item.bizCodeName = currentItem.name
        }
      }
    });

    data.inputMappings.forEach((item:any) => {
      if(item.bizCode && item.codeType === 1){
        let currentItem:any = this.dataItems.find(el => el.code === item.bizCode)
        if(currentItem){
          item.bizCodeName = currentItem.name
        }
      }
    });

    return data;
  }
  
  getOptions() {
    const schemaCode = this.$route.params.bizSchemaCode;
    Promise.all([
      serviceApi.listServices(),
      appsApi.getDataItemList({
        schemaCode: schemaCode
      })
    ]).then(([services, dataItems]) => {
      if (Array.isArray(services.data)) {
        this.servicesList = services.data;
      }
      // if (Array.isArray(dataItems.data)) {
      //   // 数据项过滤 系统数据项 部门查询编码、附件6、审批意见7
      //   // this.dataItemList = dataItems.data.filter((item: any) => ![6, 7].includes(item.propertyType) && item.code !== SystemDataItemCode.OwnerDeptQueryCode );
      //   // this.inputDataItemList = dataItems.data.filter((item: any) => ![6, 7].includes(item.propertyType));
      // }
    });
  }

  /**
   * 获取服务下的业务方法列表
   */
  getMethodList(serviceCode: string, data?: any, code?: string) {
    return methodApi.listMethodsByCode({ serviceCode }).then((res: any) => {
      if (Array.isArray(res.data)) {
        this.methodList = res.data;
        if(data){
          this.selectMethod(code, data)
        }
      }
    });
  }

  /**
   * 选中业务方法
   */
  selectMethod(value: any,data?: any) {
    this.serviceMethodCode = value;
    const method: any = this.methodList.find((item: any) => item.code === value);
    if (method) {
      this.inputMappings = this.initialMappins(method.inputParametersJson, 0);
      this.outputMappings = this.initialMappins(method.outputParametersJson, 1);
      if(data){
        this.inputMappings.forEach((input: any)=> {
          let inputSource: any = data.inputMappings.find((d: any) => d.serviceMethodParameterCode === input.serviceMethodParameterCode);
          if(inputSource){
            // 历史数据兼容
            let dataItem: any = this.dataItems.find(x => x.code === inputSource.bizCode);
            if(dataItem) {
              input.propertyName = dataItem.name;
              input.bizPropertyType = dataItem.propertyType;
            }
            input.codeType = this.transforType(inputSource.codeType);
            this.getBizValue({source: inputSource, data: input}) 
          }
        })

        this.outputMappings.forEach((output: any)=> {
          let outputSource: any = data.outputMappings.find((d: any) => d.serviceMethodParameterCode === output.serviceMethodParameterCode);
          if(outputSource){
            let dataItem: any = this.dataItems.find(x => x.code === outputSource.bizCode);
            if (dataItem) {
              output.propertyName = dataItem.name;
              output.bizPropertyType = dataItem.propertyType;
            }
            output.codeType = this.transforType(outputSource.codeType);
            this.getBizValue({source: outputSource, data: output})
          }
        })
      }
    }
  }

  transforType(type: any){
    if(typeof type !== 'number'){
      switch(type){
        case "CONST":
          return 0;
        case "PROPERTY":
          return 1;
      }
    }else{
      return type;
    }
  }

  getBizValue(params: any){
    //当为Property时
    if(params.source.codeType === 1){
      let source: any = this.dataItems.find((d: any) => d.code === params.source.bizCode );
      if(!source){
        params.data.bizCode = "";
        return;
      }
    }
    params.data.bizCode = params.source.bizCode
  }

  /**
   * 过滤得出可选列表
   * @param filterDefault 是否仅筛选出系统数据项，否则筛选出表单数据项
   */
  getDataItems(list, record: any, filterDefault: boolean = false) {
    const selected: string[] = [];
    let bizCodeCount = {}
    list.forEach((item: any) => {
      if (item.codeType === 1 && item.index !== record.index) {
        selected.push(item.bizCode);
      }
      if(bizCodeCount[item.bizCode]){
        bizCodeCount[item.bizCode] = bizCodeCount[item.bizCode] + 1
      }else{
        bizCodeCount[item.bizCode] = 1
      }
    });
    //数据项过滤 系统数据项部门查询编码、附件6、审批意见7
    let currentDataItems: any = this.dataItems.filter((item: any) => ![6, 7].includes(item.propertyType) && item.code !== 'ownerDeptQueryCode' );
    if (filterDefault) {
      // return currentDataItems.filter((item: any) => !selected.includes(item.code) && item.defaultProperty && item.propertyType===record.bizPropertyType);
      return currentDataItems.filter((item: any) => {
        item.selected = false;
        if(selected.includes(item.code)){
          item.selected = true;
        }
        return item.defaultProperty && item.propertyType===record.bizPropertyType
      });
    }


    // 如果是日期或时间控件，允许重复选中，只能重复两次
    if(record.bizPropertyType === 2 ||record.bizPropertyType === 3){
      return currentDataItems.filter((item: any) => {
        return item.propertyType===record.bizPropertyType && !item.defaultProperty && (bizCodeCount[item.code] < 2 || bizCodeCount[item.code] === undefined)
      }); 
    }
    // let res = currentDataItems.filter((item: any) => record.bizCode === item.code || !selected.includes(item.code) && !item.defaultProperty && ([0,12,13,14,15].includes(item.propertyType) ? [0,12,14].includes(item.propertyType) ? [0,12,14,20].includes(record.bizPropertyType) : [13,15].includes(record.bizPropertyType) : item.propertyType===record.bizPropertyType));
    let res = currentDataItems.filter((item: any) => {
      item.selected = false;
      if(selected.includes(item.code)){
        item.selected = true;
      }
      return record.bizCode === item.code || !item.defaultProperty && ([0,12,13,14,15].includes(item.propertyType) ? [0,12,14].includes(item.propertyType) ? [0,12,14,20].includes(record.bizPropertyType) : [13,15].includes(record.bizPropertyType) : item.propertyType===record.bizPropertyType)
    });
    debugger
    return res
  }

  /**
   * 初始化传入参数列表
   */
  initialMappins(mappingString: string, type: number) {
    const mappings: any = JSON.parse(mappingString);
    if (mappings && mappings.length) {
      const mappingList: Array<any> = mappings.map((item: BizService.Method.InputParam, index: number) => ({
        index: index + 1,
        bizCode: '',
        codeType: type,
        serviceMethodParameterCode: item.code,
        propertyName: getDataItemText(item.bizPropertyType),
        bizPropertyType: item.bizPropertyType
      }));
      return mappingList;
    }
    return [];
  }

  getDataItemTextEx(code) {
    
  }

  //转换映射方式
  getCodeType(val){
    let value: string = '';
    this.codeTypes.forEach((c) =>{
      if(c.value === val){
        value = c.label;
      }
    })
    return value;
  }

  codeTypeChange(val: any,item: any){
    item.bizCode = '';
  }

  getInputConstList(item: any){
    if(item.codeType === 0){
      let arr: Array<any> = []; 
      this.inputMappings.forEach((i: any) => {
        arr.push(i.bizCode);
      })
      return this.inputConstList.filter((c: any)=> !arr.includes(c.value));
    }
  }

  // 改变业务服务
  selectService(value: any) {

    const curService: any = this.servicesList.filter(item => item.code === value);
    
    if (curService && curService[0] && curService[0].disabled) {
      this.disabledMethod = true;
      return 
    } else {
      this.disabledMethod = false;
    }


    this.getMethodList(value);
    this.serviceCode = value;
    this.serviceMethodCode = '';
    this.inputMappings = [];
    this.outputMappings = [];
  }
  mounted(){
    this.getOptions();
  }
}
</script>

<style lang='less'>
.property-bind-biz-method {
  .content > .ant-row{
    margin-bottom: 25px;
  }
  .ant-modal-body {
    max-height: 500px;
    overflow-y: auto;
  }
  .flex_col{
    display: flex;
    align-items: center;
  }

  .filters {
    margin-top: 12px;
    padding-left: 8px;
    /deep/.ant-row{
      margin-bottom: 6px;
    }
    /deep/.ant-row > div{
      font-size: 12px;
      font-weight:500;
      color:rgba(0,0,0,1);
      line-height:20px;
    }
  }
  .server-methods{
    /deep/.ant-row > div{
      font-size: 12px;
      font-weight:500;
      color:rgba(0,0,0,1);
      line-height:20px;
    }
  }
  .filters-title{
    margin-top: 16px;
    margin-bottom: 12px;
    font-weight:500;
    color:rgba(0,0,0,1);
  }
  .base-type{
    padding: 8px 0 20px 0;
    .ant-col-12:last-of-type{
      position: relative;
      left: 10px
    }
    .span{
      font-size: 14px;
      font-weight: 400;
      color:rgba(0,0,0,0.65);
    }
    .ant-select{
      margin-left: 16px;
      width: 297px;   
    }
  }
  .biz-tips{
    font-size: 12px;
    color: rgba(0,0,0,.45);
  }
  .ant-row-flex {
    border-bottom: 1px solid #e9e9e9;
    .col{
      height: 38px;
      font-weight:400;
      color:rgba(0,0,0,0.65);
    }
  }

  .header > .col {
    font-weight: 500;
    background: #fafafa;

    &:not(:last-child)::after {
      content: "";
      width: 1px;
      height: 22px;
      background-color: #e8e8e8;
      position: absolute;
      right: 0;
    }
  }

  .col {
    padding: 3px 16px;
    display: flex;
    align-items: center;
    .ant-select {
      width: 100%;
    }
  }
  .center{
    justify-content: center
  }
  .select{
    padding: 3px 4px;
  }

}
.long-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>