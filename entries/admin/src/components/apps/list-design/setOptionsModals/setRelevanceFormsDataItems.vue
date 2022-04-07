<template>
  <div class="set-data-item">
    <template v-for="item in RelevanceForms">
      <div :key="item.code">
        <collapse style="margin-top: 24px;" :title="item.relativeName">
          <span slot="title">
            <div class="coutom-title">
              <span>【{{item.isMainTable ? '主表' : '子表'}}】</span>
              <span>
                {{item.name}}
              </span>
              <span>
                [{{item.code}}]
              </span>
            </div>
            
          </span>

          <div class="modal-wrapper" :class="{disable: isSeted(item)}"> 
            <div class="modal-name">
              [模型] <span>{{item.relativeName}}</span>
            </div>
            <div class="modal-set" >
              <template v-if="isSeted(item)">
                <i class="icon aufontAll h-icon-all-setting-o"></i>
                <span style="margin-right: 4px;">选择字段</span>
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>关联模型已被其他关联单选设置显示字段！</span>
                  </template>
                  <i class="icon aufontAll h-icon-all-question-circle-o"></i>
                </a-tooltip>
              </template>

              <a-popover v-else overlayClassName="modal-set-popover" placement="bottomLeft">
                <i class="icon aufontAll h-icon-all-setting-o"></i>
                <span>{{item.checkedList.length ? '编辑' : '选择'}}字段</span>
                <template slot="content">
                  <setCurrentDataItem maxHeight="300px" wrapperWidth="580px" :data="item.dataItems" :checkedDataItemList="item.checkedList" @checkedListChange="(list) => checkedListChange(list, item)"/>
                </template>
              </a-popover>
            </div>
          </div>
        </collapse>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import collapse from './collapse.vue'

import setCurrentDataItem from './setCurrentDataItem.vue';

@Component({
  name: 'setRelevanceFormsDataItems',
  components: {
    collapse,
    setCurrentDataItem
  }
})
export default class setRelevanceFormsDataItems extends Vue {
  @Prop() data!:any[]

  @Prop() modalOptions!:any[] // 选中的关联表单信息

  @Prop() checkedDataItemList!: string[];

  @Prop() getAsycDataItems!: Function; // 根据schemaCode获取模型数据

  @Prop() relevanceFormsDataItems!: any[];

  @Watch('modalOptions', {
    immediate: true
  })
  onModalOptionsChange(options){
    this.RelevanceForms = options.map((el, index) => {
      let item = this.relevanceFormsDataItems.find(item => item.code === el.code) || {}

      let res = {
        propertyTypeName: el.propertyTypeName,
        name: el.name,
        options: JSON.parse(el.options),
        relativeName: el.relativeName,
        code: el.code,
        dataItems: [],
        isMainTable: !el.parentCode,
        checkedList: item.checkedList || [],
        parentSheetCode: el.schemaCode, // 保存来源子表的code
        parentSheetName: el.parentSheetName
      }
      this.getDataItems(res, index)
      return res 
    })
  }

  @Watch('relevanceFormsDataItems',{
    deep: true
  })
  onRelevanceFormsDataItemsChange(val:any[]){
    console.log('val==>',val)
    if(val.length === 0){
      this.RelevanceForms.forEach(el => {
        if(el.checkedList.length){
          el.checkedList = []
        }
      })
    }else{
      this.RelevanceForms.forEach(el => {
        let item = val.find(item => item.code === el.code)
        if(item){
          el.checkedList = item.checkedList
        }
      })
    }
  }

  isSeted(item){
    let theSame = this.RelevanceForms.filter(el => el.options.schemaCode === item.options.schemaCode && el !== item)
    if(theSame.length > 0){
      return theSame.some(el => el.checkedList.length > 0)
    } else {
      return false
    }
  }

  RelevanceForms:any[] = [] // 可配置的关联表单
  getDataItems(options: any, index){ // 获取关联目标模型的可配置项
    this.getAsycDataItems(options.options.schemaCode).then(res => {
      if(res.errcode === 0){
        this.$set(this.RelevanceForms[index], 'dataItems', this.filterData(res.data, this.RelevanceForms[index].isMainTable, options.options.schemaCode))
      }
    })
  }

  @Watch('RelevanceForms',{
    deep: true
  })
  onRelevanceFormsChange(list){
    this.$emit('checkedListChange', list)
  }

  filterData(data, isMainTable =  true, schemaCode = ''){
    // 需要过滤掉的字段
    const filtersCode = [
      'workflowInstanceId',
      'runnigInstanceId',
      'ownerDeptQueryCode',
    ];
    // 需要过滤掉的数据项类型: 附件(暂时放开-- 6)、审批意见、子表(放开 -- 8)
    const filterPropertyType = [7];
    if(!isMainTable){
      filterPropertyType.push(8)
    }
    return data.filter( (item: any) => {
      item.schemaCode = schemaCode
      return !filtersCode.includes(item.code) && !filterPropertyType.includes(item.propertyType)
    } );
  }

  checkedListChange(list, item?: any ){
    if(item){
      item.checkedList = list
    }
  }
}
</script>
<style lang="less" scoped>
@green: #17BC94;
.check-all{
  margin-top: 22px;
  margin-bottom: 12px;
}
.scroll-wrapper{
  max-height: 500px;
  overflow: auto;
  h4{
    font-weight: 400;
    color: #BFBFBF;
    margin: 10px 0;
    font-size: 12px;
  }
}

.data-item{
  display: flex;
  justify-content: space-between;
  height: 40px;
  align-items: center;
  .code{
    color: #999;
    padding-right: 14px;
  }
}
.coutom-title{
  // margin-left: 10px;
  span{
    font-size: 14px;
    &:nth-child(1), &:nth-child(2){
      color: #282828;
    }
    &:nth-child(2){
      margin-left: -8px;
    }
    &:nth-child(3){
      color: #999;
    }
  }
}

.modal-wrapper{
  width: 200px;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.14);
  border-radius: 4px;
}
.modal-name{
  background-color: @green;
  height: 50px;
  display: flex;
  align-items: center;
  padding-left: 12px;
  padding-right: 12px;
  
  white-space: nowrap;
  text-overflow: ellipsis;
  border-radius: 4px 4px 0 0;
  font-size: 14px;
  color: #fff;
  span{
    margin-left: 8px;
  }
}
.modal-set{
  border-radius: 0 0 4px 4px;
  padding: 0 12px;
  height: 50px;
  display: flex;
  align-items: center;
  color: @green;
  span{
    margin-left: 4px;
    cursor: pointer;
  }
  i{
    font-size: 14px;
    cursor: pointer;
  }
}

.disable{
  .modal-set{
    color: rgba(0, 0, 0, 0.25);
  }
  .modal-name{
    background-color: rgba(0, 0, 0, 0.25);
  }
}

</style>
<style lang="less">
.set-data-item{
  .ant-checkbox-group{
    width: 100%;
  }
}

.modal-set-popover{
  z-index: 1450;
}
</style>
