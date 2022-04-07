<template>
  <div class="modal-attr">
    <label @click="setOptionsVisible = true" for="">{{queryViewDataSource.currentDataItems.length ? '已设置' : '未设置'}} <span class="icon aufontAll h-icon-all-ellipsis-o"></span></label>
    <a-modal
      :visible="setOptionsVisible"
      title="设置数据源字段"
      width="1000px"
      :cancelText="$t('languages.Apps.Cancel')"
      :okText="$t('languages.Apps.Ok')"
      @cancel="setOptionsVisible = false"
      @ok="handleOk"
    >
      <div class="set-options-modal">
        <div class="left-item">
        <div class="header-step">
          <div class="left">
            <span @click="setDataItemType = 'current'" :class="{active: setDataItemType === 'current'}">当前模型字段</span>
            <span v-show="isOpenSetRelevanceForms || isUserelevanceForms" @click.self="setDataItemType = 'relevanceForms'" :class="{active: setDataItemType === 'relevanceForms'}">
              设置关联模型字段
              <i @click.stop.self="closeSetRelevanceFormsDataItems" v-if="setDataItemType === 'relevanceForms'" class="icon aufontAll h-icon-all-close"></i>
            </span>
          </div>
          <div v-show="!isUserelevanceForms && !isOpenSetRelevanceForms">

            <span @click="setRelevanceDataItems" :class="{'disable-set-relevance': !isUseRelevance}" class="colorGreen set-relevance">
              选择关联模型字段
              <a-tooltip placement="top">
                <template slot="title">
                  <span>您可以在这里选择关联模型字段</span>
                </template>
                <i class="icon aufontAll h-icon-all-question-circle-o"></i>
              </a-tooltip>
            </span>

          </div>
        </div>

        <!-- 配置当前模型字段 -->
        <setCurrentDataItem v-show="setDataItemType === 'current'" :data="currentDataItems" :checkedDataItemList="checkedList" @checkedListChange="checkedListChange"/>

        <!-- 配置关联模型字段 -->
        <setRelevanceFormsDataItems v-show="setDataItemType === 'relevanceForms'" :relevanceFormsDataItems="RelevanceFormsDataItems" @checkedListChange="RelevanceFormsCheckedListChange" :getAsycDataItems="getAsycDataItems" :modalOptions="selectedRelevanceForms" />


      </div>
        <div class="right-item">
          <div class="header-step">
            已选择字段
          </div>

          <div class="right-scroll-wrapper">
            <collapse title="当前模型字段" v-if="checkedBizDataItems.length || checkedSystemsDataItems.length">
              <template v-if="checkedBizDataItems.length">
                <h4>业务数据项</h4>
                <div class="data-item" v-for="(item, index) in checkedBizDataItems" :key="item.id + index">
                  <div>
                    {{item.name}}<span>[{{item.code}}]</span>
                  </div>
                  <span @click="delCheckedDataItem(item.id)" class="icon aufontAll h-icon-all-delete-o del"></span>
                </div>
              </template>
                        
              <template v-if="checkedSystemsDataItems.length">
                <h4>系统数据项</h4>
                <div class="data-item" v-for="(item, index) in checkedSystemsDataItems" :key="item.id + index">
                  <div>
                    {{item.name}}<span>[{{item.code}}]</span>
                  </div>
                  <span @click="delCheckedDataItem(item.id)" class="icon aufontAll h-icon-all-delete-o del"></span>
                </div>
              </template>
            </collapse>


            <template v-if="isUserelevanceForms">
              <collapse v-show="getCheckedDataItems(el,'biz').length + getCheckedDataItems(el, 'system').length" style="margin-top: 24px;" :title="`[模型]${el.relativeName}`" v-for="el in RelevanceFormsDataItems" :key ="el.code">
                <template v-if="getCheckedDataItems(el,'biz').length">
                  <h4>业务数据项</h4>
                  <div class="data-item" v-for="(item, index) in getCheckedDataItems(el,'biz')" :key="item.id + index">
                    <div>
                      {{item.name}}<span>[{{item.code}}]</span>
                    </div>
                    <span @click="delRelevanceFormsCheckedDataItem(el, item.id)" class="icon aufontAll h-icon-all-delete-o del"></span>
                  </div>
                </template>

                <template v-if="getCheckedDataItems(el, 'system').length">
                  <h4>系统数据项</h4>
                  <div class="data-item" v-for="(item, index) in getCheckedDataItems(el, 'system')" :key="item.id + index">
                    <div>
                      {{item.name}}<span>[{{item.code}}]</span>
                    </div>
                    <span @click="delRelevanceFormsCheckedDataItem(el, item.id)" class="icon aufontAll h-icon-all-delete-o del"></span>
                  </div>
                </template>
              </collapse>
            </template>

            <div class="empty-tips" v-if="checkedBizDataItems.length === 0 && !isUserelevanceForms">
              <img src="./empty.png" >
              <p>
                请选择模型字段
              </p>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import { State, Action, Mutation, namespace } from 'vuex-class';

import { getDataItems, updateListData } from '@/apis/list';
import setCurrentDataItem from './setCurrentDataItem.vue';
import setRelevanceFormsDataItems from './setRelevanceFormsDataItems.vue'
import collapse from './collapse.vue'
// import { FormControlType } from '@cloudpivot/form/src/schema'
import { DataItemType } from "@cloudpivot/form/schema";

const ListdesignModule = namespace('Apps/Listdesign');

enum StepStatus {
  wait = 'wait',
  finish = 'finish'
}
enum setDataItemType {
  current = 'current', // 当前模型
  relevanceForms = 'relevanceForms' // 关联模型
}

@Component({
  name: 'set-options-modal',
  components: {
    setCurrentDataItem,
    collapse,
    setRelevanceFormsDataItems
  }
})


export default class setOptionsModal extends Vue {
  @Prop() schemaCode!: string;

  // @Prop() souceData!:any[];

  @ListdesignModule.State('queryViewDataSource') queryViewDataSource: any;
  @ListdesignModule.Mutation('setQueryViewDataSource') setQueryViewDataSource: any;
  @ListdesignModule.Mutation('setQueryViewDataSourceAttr') setQueryViewDataSourceAttr: any;

  setOptionsVisible: boolean =  false
  handleOk(){
    this.onCheckedListChange()
    this.setQueryViewDataSourceAttr(['relevanceFormsDataItems', this.RelevanceFormsDataItems])
    this.setOptionsVisible =  false
  }

  getAsycDataItems(schemaCode) {
    return getDataItems(schemaCode, true).then((resp) => {
      return resp;
    });
  }

  currentDataItems: any[] = [] // 当前模型字段
  checkedList:string[] = [] // 选中的当前模型字段
  checkedListChange(arr){
    this.checkedList = arr
  }
  delCheckedDataItem(id){ // 删除选中的模型字段
    this.checkedList = [...this.checkedList.filter(el => el !== id)]
  }

  // @Watch('checkedList')
  onCheckedListChange(){
    this.setQueryViewDataSourceAttr(['currentDataItems', JSON.parse(JSON.stringify(
      this.currentDataItems.filter(el => {
        return this.checkedList.includes(el.id)
      })
    ))])
  }

  delRelevanceFormsCheckedDataItem(item, id){
    item.checkedList = item.checkedList.filter(el => el !== id)
  }

  RelevanceFormsDataItems: any[] = []
  RelevanceFormsCheckedListChange(list){
    this.RelevanceFormsDataItems = list

    this.updataQueryViewDataSourceAttr(list)
  }

  updataQueryViewDataSourceAttr(list: any[]){ // 更新关联模型 展示字段可选字段
    let res:any[] = []
    list.forEach(el => {

      console.log('ele==>', el)
      res.push({
        checkedList: el.checkedList,
        code: el.code,
        dataItems: el.dataItems,
        isMainTable: el.isMainTable,
        name: el.name,
        options: el.options,
        propertyTypeName: el.propertyTypeName,
        relativeName: el.relativeName,
        parentSheetCode: el.parentSheetCode,
        parentSheetName: el.parentSheetName,
        schemaCode: el.schemaCode
      })
    })
    this.RelevanceFormsDataItems = res
    // this.setQueryViewDataSourceAttr(['relevanceFormsDataItems', res])
  }
  get isUseRelevance(){ // 是否选中了关联单选
    return this.selectedRelevanceForms.length > 0
  }

  get selectedRelevanceForms(){ // 选中的关联单选
    return this.checkedBizDataItems.filter(el => {
      return el.propertyType === DataItemType.RelevanceForm
    })
  }

  get checkedBizDataItems(){ // 选中的业务数据项
    return this.currentDataItems.filter(el => this.checkedList.includes(el.id) && !el.defaultProperty)
  }
  get checkedSystemsDataItems(){ // 选中的系统数据项
    return this.currentDataItems.filter(el => this.checkedList.includes(el.id) && el.defaultProperty)
  }

  // 模型数据
  getCheckedDataItems(item, type){
    if(type === 'biz'){
      return item.dataItems.filter(el => item.checkedList.includes(el.id) && !el.defaultProperty)
    }else{
      return item.dataItems.filter(el => item.checkedList.includes(el.id) && el.defaultProperty)
    } 
  }



  setDataItemType: setDataItemType = setDataItemType.current // 设置哪个位置的模型字段

  get isUserelevanceForms(){
    return this.RelevanceFormsDataItems.some(el => el.checkedList.length > 0)
  }
  isOpenSetRelevanceForms: boolean = false // 是否点击去设置关联表单字段
  setRelevanceDataItems(){// 设置关联表单字段
    if(!this.isUseRelevance){
      return
    }
    this.setDataItemType = setDataItemType.relevanceForms
    this.isOpenSetRelevanceForms = true
  }
  closeSetRelevanceFormsDataItems(){
    this.setDataItemType = setDataItemType.current

    this.setQueryViewDataSourceAttr(['relevanceFormsDataItems', []])

    this.RelevanceFormsDataItems = [...this.queryViewDataSource.relevanceFormsDataItems]
    this.isOpenSetRelevanceForms = false
  }


  filterData(data){
    // 需要过滤掉的字段
    const filtersCode = [
      'workflowInstanceId',
      'runnigInstanceId',
      'ownerDeptQueryCode',
    ];
    // 需要过滤掉的数据项类型: 附件(暂时放开-- 6)、审批意见、子表(放开 -- 8)
    const filterPropertyType = [7];
    return data.filter( (item: any) => !filtersCode.includes(item.code) && !filterPropertyType.includes(item.propertyType) );
  }

  created(){
    this.getAsycDataItems(this.schemaCode).then(res => {
      let sheets = res.data.filter(el => el.propertyType === DataItemType.Sheet)
      let sheets_RelevanceForms: any[] = []
      sheets.forEach(sheet => {
        sheets_RelevanceForms = [...sheets_RelevanceForms, ...sheet.subSchema.properties.filter(item => {
          item.parentCode = item.schemaCode
          item.parentSheetName = sheet.name
          item.parentSheetId = sheet.id
          item.schemaCode = item.schemaCode
          return item.propertyType === DataItemType.RelevanceForm
        })]
      });
      res.data = (res.data as any[]).concat(sheets_RelevanceForms)


      this.currentDataItems = this.filterData(res.data)


      if(this.queryViewDataSource.currentDataItems.length === 0){
        this.checkedList = this.currentDataItems.map(el => el.id) || []
      }else{ // 设置过可选显示字段
        this.checkedList = this.queryViewDataSource.currentDataItems.map(el => el.id) || []
      }

      if(this.queryViewDataSource.relevanceFormsDataItems){
        this.RelevanceFormsDataItems = this.queryViewDataSource.relevanceFormsDataItems
      }
    })
  }
}
</script>
<style lang="less" scoped>
@green: #17BC94;
.empty-tips{
  text-align: center;
  color: #c1c1c1;
  font-size: 12px;
  margin-top: 90px;
  img{
    margin-bottom: 16px;
    font-weight: 400;
  }
}
.right-scroll-wrapper{
  max-height: 540px;
  overflow: auto;
  margin-top: 16px;
  h4{
    margin-left: 5px;
  }
  .data-item{
    height: 32px;
    line-height: 32px;
    margin-bottom: 8px;
    overflow: hidden;
    padding-left: 5px;
    padding-right: 5px;
    color: #282828;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    border-radius: 4px;
    &>div{
      flex-basis: 190px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      span{
        margin-left: 4px;
      }
    }
    &:hover{
      color: @green;
      background-color: rgba(216, 216, 216, 0.31);
      span.icon{
        display: block;
      }
    }
    span{
      color: #999;
    }
    .del{
      cursor: pointer;
    }
    span.icon{
      display: none;
    }

  }
}
.colorGreen{
  color: @green;
}
.set-relevance{
  color: @green;
  cursor: pointer;
  i{
    font-size: 14px;
    cursor: pointer;
  }
}
.disable-set-relevance{
  color: #999;
  cursor: not-allowed;
}

.set-options-modal{
  display: flex;
}
.right-item{
  width: 256px;
  overflow: hidden;
  margin-left: 40px;
  .header-step{
    border-bottom: none;
  }
}
.left-item{
  width: 660px;
}
.header-step{
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #E8E8E8;
  font-size: 14px;
  line-height: 32px;
  padding-right: 4px;
  color: rgba(0, 0, 0, 0.85);
  .left{
    padding-left: 10px;
  }
  span{
    display: inline-block;
    padding: 0 5px;
    margin-right: 20px;
    &:last-child{
      margin-right: 0;
    }
    &.active{
      position: relative;
      color: @green;
      font-weight: 700;
      i{
        font-weight: 400;
        font-size: 14px;
        cursor: pointer;
      }
      &::after{
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: @green;
      }
    }
  }
}
h4{
  font-weight: 400;
  color: #BFBFBF;
  margin: 10px 0;
  font-size: 12px;

}

.modal-attr{
  label{
    margin: 0 21px;
    display: block;
    height: 33px;
    line-height: 33px;
    position: relative;
    padding: 0 21px;
    margin: 0;
    cursor: pointer;
    span{
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
    }
  }
}
</style>
