<template>
  <div class="data-title-input">
    <span @click="open" class="data-title-input-label" :title="dataTitleStr">{{ dataTitleStr }}</span>
    <span @click="open" class="icon aufontAll">&#xe8cc;</span>
    <data-title-modal
      :value="targetSummary"
      @ok="ok"
      @close="close"
      :list="summaryList"
      v-if="visible"
    />
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import {
  State, Action, Mutation, namespace
} from 'vuex-class';

import DataTitleModal from './data-title-modal.vue'

const DataModelModule = namespace('Apps/DataModel');
@Component({
  name: 'data-title-input',
  components: {
    DataTitleModal
  }
})
export default class DataTitleInput extends Vue {
  @Prop() isReadonly!: boolean;
  @DataModelModule.State("summaryList") summaryList: any;

  @DataModelModule.State("defaultSummary") defaultSummary: any;

  @DataModelModule.State("targetSummary") targetSummary: any;

  @DataModelModule.Mutation("setSummary") setSummaryX: any;

  @DataModelModule.Action("getSummary") getSummaryX: any;

  @DataModelModule.Action("submitSummary") submitSummaryX: any;

  visible = false;

  open() {
    if (!this.isReadonly) {
      this.visible = true;
    }
  }

  close() {
    this.visible = false;
  }
  
  ok(val:any) {
    if (val && val.length > 0) {
      const submitdata = val.map(res => {
        return res.code;
      })
      this.setSummaryX(submitdata);
      this.submitSummaryX();
      this.close();
    } else {
      this.$message.error('数据标题不能为空！')
    }
  }

  get dataTitleStr() {
    // this.defaultSummary
    // console.log('this.defaultSummary', this.defaultSummary);
    if (this.targetSummary.length > 0 ) {
      let str = '';
      this.targetSummary.forEach(res => {
        if (res.isDataItem === 1) {
          const theDataItem =  this.summaryList.find(item => item.code === res.code);
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

  mounted() {
    this.getSummaryX(); // 获取摘要
  }
 

}
</script>
<style lang="less" scoped>
  .data-title-input{
    padding: 0 8px;
    line-height: 32px;
    text-align: left;
    .data-title-input-label{
      float: left;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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