
<template>
  <div>
    <div class="query-form">
      <div :class="$i18n.locale === 'zh' ? 'query-form-left' : 'query-form-left en'" ref="queryFormLeft">
        <a-form layout="inline">
          <a-form-item
            label="流程名称"
            :colon="false"
            ref="queryForm1"
          >
            <a-input
              placeholder="流程名称"
              v-model="queryData.workflowName"
              class="workflow-name-input"
            ></a-input>
          </a-form-item>

          <!-- <a-form-item
            label="流程模板"
            :colon="false"
            ref="queryForm3"
          >
            <WorkflowTree 
              class="workflow-name-input" 
              v-model="workflowCode" 
              @select="onSelect"
            />
          </a-form-item> -->

          <a-form-item
            label="发起时间"
            :colon="false"
            class="range-picker"
            ref="queryForm5"
          >
            <a-range-picker
              class="workflow-name-input"
              format="YYYY-MM-DD"
              :placeholder="['开始时间', '结束时间']"
              v-model="queryData.time"
            />
          </a-form-item>

          <div class="empty"></div>
          <div class="empty"></div>
          <div class="empty"></div>
          <div class="empty"></div>
          <div class="empty"></div>
          <div class="empty"></div>
        </a-form>
      </div>
      <div class="query-form-right">
        <a-button @click="reset">重置</a-button>
        <a-button type="primary" @click="search">查询</a-button>
      </div>
    </div>
    <div class="filter-mask" @click="closeQueryItem"></div>
  </div>
</template>


<script lang='ts'>
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import {
  Button, Icon, Form, Input, TreeSelect, Select, DatePicker, Cascader
} from '@h3/antd-vue';

import { renderer } from '@cloudpivot/form';

import formPc from '@cloudpivot/form/src/renderer/components/pc';

import Workflow from '@/components/apps/workflow-center/start-workflow/base/workflow.vue';

import WorkflowTree from './tree.vue';

import * as utils  from '@cloudpivot/common/src/utils/pc/utils';



@Component({
  name: 'query-workitem',
  components: {
    AButton: Button,
    AIcon: Icon,
    AInput: Input,
    AForm: Form,
    AFormItem: Form.Item,
    ATreeSelect: TreeSelect,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARangePicker: DatePicker.RangePicker,
    // StaffSelector: renderer.components.pc.StaffSelector,
    StaffSelector: formPc.StaffSelector,
    WorkflowTree
  }
})
export default class QueryWorkitem extends Vue {
  @Prop() isShowInstanceState!:boolean; // 是否展示流程状态

  @Prop() isShowOriginator!:boolean; // 是否展示发起人

  @Prop() timeLable!:string; // 时间段显示名称

  

  @Prop() isResetFields!:boolean;

  @Prop({ default: false }) isShowSequenceNo!:boolean;

  @Prop({ default: false }) isShowTimeRange?:boolean;

  get workflowCode() {
    return this.$route.params.workflowCode;
  }

  params:any = {
    sourceType: 'portal'
  }; // 关联组织介入之后需要过滤

  collapsed = true;

  org:any = [];

  orgTree:any = [];

  // 选人控件已选人员、部门集合
  selectedValue: any[] = [];

  // 展示选人控件弹窗
  showSelector:boolean = false;

  // 流程模板
  //  workflowCode:string = '';

  staffSelectorOpts:any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择'
  }

  // 表格数据
  queryData:any = {
    workflowName: '',
    originator: '',
    time: [],
    startTime: '',
    endTime: '',
    instanceState: '', // 流程状态
    sequenceNo: '',
  }

  showMore:boolean = false;

  workflowName:Object = {};

  mounted() {
    this.placeHolderLang();
    const queryLeftDom = this.$refs.queryFormLeft as HTMLElement;
    const containerWidth = queryLeftDom.clientWidth;
    let arr : any[] = [];
    //TODO 不知是哪位开的头，后期需要优化
    if (this.isShowInstanceState && this.isShowOriginator) { // 展示流程状态，就会有5个
      arr = ['1', '2', '3', '4', '5'];
    } else if (this.isShowInstanceState) {
      arr = ['1', '2', '3', '5'];
    } else if (this.isShowOriginator && !this.isShowTimeRange) {
      arr = ['1', '3', '4', '5'];
    } else if(this.isShowOriginator && this.isShowTimeRange){
      arr = ['1','3','5']
    }else {
      arr = ['1', '3', '5'];
    }

    let itemsWidth:number = 0;
    arr.forEach((item:string) => {
      const _key = `queryForm${item}`;
      const _dom = this.$refs[_key] as any;
      itemsWidth += _dom.$el.clientWidth + 16;
    });

    if (itemsWidth >= containerWidth) {
      this.showMore = true;
    } else {
      this.showMore = false;
    }
  }

  // {name, name_i18n}
  onSelect(nameObj:Object){
    this.workflowName = nameObj;
  }


  toggle() {
    this.collapsed = !this.collapsed;
  }

  formatData() {
    const obj = {
      workflowName: this.queryData.workflowName,
      workflowCode: this.workflowCode,
      originator: this.queryData.originator[0] ? this.queryData.originator[0].id : '',
      unitType: this.queryData.originator[0] ? this.queryData.originator[0].unitType : '',
      startTime: this.queryData.time[0] ? utils.timeStampToDate('YY-MM-DD', this.queryData.time[0]._d) : '',
      endTime: this.queryData.time[1] ? utils.timeStampToDate('YY-MM-DD', this.queryData.time[1]._d) : '',
      instanceState: this.queryData.instanceState,
      originatorName:  this.queryData.originator[0] ? this.queryData.originator[0].name : '',
      sequenceNo: this.queryData.sequenceNo
    };

    if (!this.isShowInstanceState) {
      delete obj.instanceState;
    }

    if (!this.isShowOriginator) {
      delete obj.originator;
    }

    return obj;
  }

  resetFields() {
    this.queryData = {
      workflowName: '',
      time: [],
      startTime: '',
      endTime: '',
      originator: [],
      instanceState: '' // 流程状态
    };
  }

  reset() {
    this.collapsed = true;
    const d = this.formatData();
    // const isEmit:boolean = Object.values(d).some((item:any) => item !== '');
    const isEmit:boolean = true;
    if (isEmit) {
      this.$emit('reset', d);
      this.resetFields();
    }
  }

  search() {
    const d = this.formatData();
    this.$emit('search', d);
    this.collapsed = true;
  }

  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang(){
    this.staffSelectorOpts.placeholder = this.$t('cloudpivot.flowCenter.pc.plzSelect') as string;
  }

  closeQueryItem(){
    this.$emit('hide')
  }

  @Watch('$i18n.locale')
  onLanguageChange(l:string) {
    this.placeHolderLang();
  }

  @Watch('isResetFields')
  onIsResetFieldsChange(v:boolean) {
    if (v) {
      this.resetFields();
      this.collapsed = true;
    }
  }
}
</script>

<style lang="less" scoped>
.filter-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0);
    z-index: 1;
}
.query-form {
  // display: flex;
  padding: 10px;
  background: white;
  box-shadow: 0px 4px 8px 0px rgba(30, 85, 255, 0.1);
  border-radius: 4px;
  position: relative;
  z-index: 9;
  &.en {
    /deep/.ant-form-item-label label {
        width: 120px;
        text-align: left;
    }
  }
  &-left {
    flex-grow: 2;
    margin-top: 3px;
    .ant-form {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
    .ant-input, /deep/.ant-form-inline .ant-form-item > .ant-form-item-control-wrapper {
      width: calc( 100% - 70px );
      height: 32px;
      flex-shrink: 0;
      & > .ant-form-item-control {
        line-height: 0 !important;
      }
    }
      // /deep/.ant-form-inline .ant-form-item.range-picker > .ant-form-item-control-wrapper {
      //   width: 350px;
      // }
    /deep/.ant-form-item-label label {
        width: 70px;
        display: inline-block;
        text-align: right;
    }
    &.en {
      /deep/.ant-form-item-label label {
          width: 120px;
          text-align: left;
      } 
    }
    .ai-form /deep/.ant-form-item-label label {
        width: auto;
    }
    /deep/.ant-form-inline .ant-form-item {
      margin-bottom: 10px;
      margin-right: 1.5%;
      width: 32.33%;
      &:nth-child(3n){
        margin-right: 0;
      }
    }
    /deep/.ant-calendar-picker-input {
      line-height: normal !important;
      & > input {
        font-size: 14px;
      }
    }
    .workflow-name-input {
      width: 100%!important;
    }
  }

  &-right {
    width: 100%;
    // height: 45px;
    padding: 8px 0px 8px 8px;
    text-align: center;
    & > button {
      margin-left: 8px;
    }

    & > span {
      width: 50px;
      color: rgba(0, 0, 0, 0.45);
      cursor: pointer;
      user-select: none;
      margin-right: 16px;

      & > i {
        transform: rotate(180deg);
        &.collapsed {
        transform: rotate(0);
      }
      }
    }
  }

  &.collapsed {
    overflow: hidden;
    // height: 45px;
    box-shadow: none;
  }
}
</style>
