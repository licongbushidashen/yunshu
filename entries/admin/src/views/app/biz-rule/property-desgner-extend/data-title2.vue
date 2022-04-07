<template>
  <div class="data-title-input clearfix">
    <span @click="open" class="data-title-input-label" :title="dataTitleStr"> {{ dataTitleStr || '未设置' }} &nbsp;</span>
    <span @click="open" class="icon aufontAll">&#xe8cc;</span>
    <data-title-modal
      :title="title"
      :tips="tips"
      :value="value"
      @ok="ok"
      @close="close"
      :list="selectDataItems"
      v-if="visible"
    />
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch, Mixins
} from 'vue-property-decorator';
import {
  State, Action, Mutation, namespace
} from 'vuex-class';

import DataTitleModal from '@/components/apps/model/data-title-modal.vue'
// import DataTitleModal from './data-title-modal.vue'
import { PropertyComponent } from '@h3/designer-core/property-panel';

const DataModelModule = namespace('Apps/DataModel');
@Component({
  name: 'data-title-input',
  components: {
    DataTitleModal
  }
})
export default class DataTitleInput extends Mixins(PropertyComponent) {

  @Prop() dataItems!:any;

  @Prop() title!:any;
  @Prop() tips!:any;

  @DataModelModule.Mutation("setSummary") setSummaryX: any;

  @DataModelModule.Action("getSummary") getSummaryX: any;

  @DataModelModule.Action("submitSummary") submitSummaryX: any;

  visible = false;



  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
  }
  
  ok(val:any) {
    this.emitChange(val);
    this.close();
  }

  get dataTitleStr() {
    if (this.value.length > 0 ) {
      let str = '';
      this.value.forEach(res => {
        if (res.isDataItem === 1) {
          const theDataItem =  this.dataItems.find(item => item.code === res.code);
          if (theDataItem) {
            str += `[${theDataItem.name}]`
          }
        } else {
          str += res.code;
        }
      })

      return str

    } else {
      return ''
    }
    // console.log('targetSummary', this.targetSummary)
    // return '3333'
  }

  get selectDataItems () {
      const filterType = [10,6,8,9];
        const showSystemCode = ['creater', 'createdDeptId', 'createdTime', 'owner', 'ownerDeptId','modifier', 'modifiedTime', 'sequenceNo', 'sequenceStatus'];
        let dataItem = this.dataItems.filter((item:any)=> {
            return item.published && !filterType.includes(item.propertyType);
        });
        dataItem = dataItem.filter(item => {
            return !item.defaultProperty || showSystemCode.includes(item.code);
        })
        return dataItem
  }

  mounted() {
    this.getSummaryX(); // 获取摘要
  }

  @Watch('value',{
      immediate: true
  })
  onValueChange(v) {
      
  }
 

}
</script>
<style lang="less" scoped>
  .data-title-input{
    padding: 0 8px;
    height: 100%;
    line-height: 32px;
    text-align: left;
    .data-title-input-label{
      float: left;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: calc(100% - 33px);
      max-width: calc(100% - 33px);
      // calc(100% - 30px);
    }
    
    .icon {
      float: left;
      margin-left: 17px;
      cursor: pointer;
    }
  }
</style>