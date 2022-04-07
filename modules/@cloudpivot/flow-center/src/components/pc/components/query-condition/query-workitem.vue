
<template>
  <div>
    <div class="query-form">
      <div :class="$i18n.locale === 'zh' ? 'query-form-left' : 'query-form-left en'" ref="queryFormLeft">
        <a-form layout="inline" :labelCol="{ style: 'width: '+ ($i18n.locale === 'zh' ? '80px':'120px') }"
            :wrapperCol="{ style: 'width: calc(100% - '+ ($i18n.locale === 'zh' ? '80px':'120px') +')' }">
          <a-form-item
            :label="$t('cloudpivot.flowCenter.pc.sequenceNo')"
            :colon="false"
            ref="queryForm1"
          >
            <a-input
              :placeholder="$t('cloudpivot.flowCenter.pc.pleaseEnter')"
              v-model="queryData.sequenceNo"
              class="workflow-name-input"
            ></a-input>
          </a-form-item>
          <a-form-item
            :label="$t('cloudpivot.flowCenter.pc.flowName')"
            :colon="false"
            ref="queryForm1"
          >
            <a-input
              :placeholder="$t('cloudpivot.flowCenter.pc.pleaseEnter')"
              v-model="queryData.workflowName"
              class="workflow-name-input"
            ></a-input>
          </a-form-item>

          <a-form-item
            :label="$t('cloudpivot.flowCenter.pc.flowTemplate')"
            :colon="false"
            ref="queryForm3"
          >
            <WorkflowTree 
              class="workflow-name-input" 
              v-model="workflowCode" 
              @select="onSelect"
            />
          </a-form-item>

           <a-form-item
            :label="$t('cloudpivot.flowCenter.pc.curResolver')"
            :colon="false"
            ref="queryForm1"
            v-if="isShowCurResolver"
          >
            <!-- <a-input
              :placeholder="$t('cloudpivot.flowCenter.pc.curResolver')"
              v-model="queryData.participantName"
              class="workflow-name-input"
            ></a-input> -->

            <StaffSelector
              class="workflow-name-input"
              v-model="queryData.participant"
              :options="staffSelectorOpts"
              :params="params"
            />
          </a-form-item>

          <a-form-item
            :label="$t('cloudpivot.flowCenter.pc.originatorName')"
            :colon="false"
            v-if="isShowOriginator"
            ref="queryForm4"
          >
            <!-- <a-input
              id="originatorInput"
              placeholder="请选择"
              @click="showSmartOrg"
              v-model="originatorName"
            >
              <i class="icon aufontAll h-icon-all-department-o" slot="suffix"></i>
            </a-input> -->
            <StaffSelector
              class="workflow-name-input"
              v-model="queryData.originator"
              :options="staffSelectorOpts"
              :params="params"
            />
          </a-form-item>

          <a-form-item
            :label="timeLable"
            v-if="isShowTimeRange"
            :colon="false"
            class="range-picker"
            ref="queryForm5"
          >
            <a-range-picker
              class="workflow-name-input"
              format="YYYY-MM-DD"
              :placeholder="[$t('cloudpivot.flowCenter.pc.startTime'), $t('cloudpivot.flowCenter.pc.endTime')]"
              v-model="queryData.time"
            />
          </a-form-item>

          <a-form-item
            :label="$t('cloudpivot.flowCenter.pc.flowStatus')"
            :colon="false"
            v-if="isShowInstanceState"
            ref="queryForm2"
          >
            <a-select
              v-model="queryData.instanceState"
              :allowClear="true"
              class="workflow-name-input">
              <!-- <a-select-option value="DRAFT">草稿</a-select-option> -->
              <a-select-option value="PROCESSING">{{ $t('cloudpivot.flowCenter.pc.processing') }}</a-select-option>
              <a-select-option value="COMPLETED">{{ $t('cloudpivot.flowCenter.pc.completed') }}</a-select-option>
              <a-select-option value="CANCELED">{{ $t('cloudpivot.flowCenter.pc.canceled') }}</a-select-option>
              <a-select-option value="EXCEPTION">{{ $t('cloudpivot.flowCenter.pc.exception') }}</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            :label="$t('cloudpivot.flowCenter.pc.sequenceNo')"
            :colon="false"
            v-if="isShowSequenceNo"
            ref="queryForm6"
          >
            <a-input class="workflow-name-input" :placeholder="$t('cloudpivot.flowCenter.pc.inputSequenceNo')" v-model="queryData.sequenceNo"></a-input>
          </a-form-item>
          <a-form-item
            v-if="isShowActivityName"
            :label="$t('cloudpivot.flowCenter.pc.approvalNode')"
            :colon="false"
            ref="queryForm7"
          >
            <a-input
              :placeholder="$t('cloudpivot.flowCenter.pc.approvalNode')"
              v-model="queryData.activityName"
              class="workflow-name-input"
            ></a-input>
          </a-form-item>
          <a-form-item
            v-if="isShowParticipant"
            :label="$t('cloudpivot.flowCenter.pc.resolver')"
            :colon="false"
            ref="queryForm8"
          >
            <StaffSelector
              class="workflow-name-input"
              v-model="queryData.participant"
              :options="staffSelectorOpts"
              :params="params"
            />
          </a-form-item>
          <a-form-item
            v-if="isShowParticipantId"
            :label="$t('cloudpivot.flowCenter.pc.resolver')"
            :colon="false"
            ref="queryForm8"
          >
            <StaffSelector
              class="workflow-name-input"
              v-model="queryData.participantId"
              :options="staffSelectorOpts"
              :params="params"
            />
          </a-form-item>
          
          <a-form-item
            :label="$t('cloudpivot.flowCenter.pc.approvalNode')"
            :colon="false"
            ref="queryForm9"
            v-if="isShowWorkFlowNode"
          >
            <a-input class="workflow-name-input" :placeholder="$t('cloudpivot.flowCenter.pc.inputWorkflowNode')" v-model="queryData.activityName"></a-input>
          </a-form-item>
          <div class="empty"></div>
          <div class="empty"></div>
          <div class="empty"></div>
          <div class="empty"></div>
          <div class="empty"></div>
        </a-form>
      </div>
      <div class="query-form-right">
        <!-- <span v-if="showMore" @click="toggle">
          <span>{{ collapsed ? $t('cloudpivot.flowCenter.pc.more') : $t('cloudpivot.flowCenter.pc.collapse') }}</span>
          <a-icon type="down" :class="{ collapsed : collapsed }"/>
        </span> -->

        <a-button @click="reset">{{ $t('cloudpivot.flowCenter.pc.reset') }}</a-button>
        <a-button type="primary" @click="search">{{ $t('cloudpivot.flowCenter.pc.search') }}</a-button>
        <!-- <a-checkbox style="margin-left: 20px" v-model="daily" @change="onChange">设为常用</a-checkbox> -->
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
  Button, Icon, Form, Input, TreeSelect, Select, DatePicker, Checkbox
} from '@h3/antd-vue';


import { renderer } from '@cloudpivot/form';

import formPc from '@cloudpivot/form/src/renderer/components/pc';

import Workflow from '@/components/apps/workflow-center/start-workflow/base/workflow.vue';

import WorkflowTree from './tree_new.vue';

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
    ACheckbox: Checkbox,
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

  @Prop() isShowCurResolver!:boolean; //是否展示当前处理人

  @Prop() timeLable!:string; // 时间段显示名称

  @Prop({default:true}) isShowTimeRange?:boolean;//是否显示时间选择控件

  @Prop() isResetFields!:boolean;

  @Prop({ default: false }) isShowSequenceNo!:boolean;
  @Prop({ default: false }) isShowActivityName!:boolean;
  @Prop({ default: false }) isShowParticipant!:boolean;
  @Prop({ default: false }) isShowParticipantId!: boolean // 处理人id
  @Prop({ default: false }) isShowWorkFlowNode!:boolean;

  params:any = {
    sourceType: 'portal'
  }; // 关联组织介入之后需要过滤

  collapsed = true;

  daily = false

  org:any = [];

  orgTree:any = [];

  // 选人控件已选人员、部门集合
  selectedValue: any[] = [];

  // 展示选人控件弹窗
  showSelector:boolean = false;

  // 子流程模板
  workflowCode:string = '';

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
    activityName: '',
    participant: '',
    sequenceNo: '', 
    participantName: '',//当前处理人
    participantId: '' //当前处理人id 精确查找
  }

  showMore:boolean = false;

  workflowName:Object = {};


  mounted() {
    this.placeHolderLang();
    setTimeout(() => {
      if(localStorage.getItem('temp')) {
        let tempArr = JSON.parse(localStorage.getItem('temp') || '[]')
        tempArr.forEach(item => {
          if(item.id === this.$store.state.System.System.loginedUserInfo.id) {
            this.queryData = item.d
          }
        });
        return
      } else if(localStorage.getItem('daily')) {
        let dailyArr = JSON.parse(localStorage.getItem('daily') || '[]')
        dailyArr.forEach(item => {
          if(item.id === this.$store.state.System.System.loginedUserInfo.id) {
            this.queryData = item.d
          }
        });
      }
    }, 500)
    console.log(this.queryData)
    const queryLeftDom = this.$refs.queryFormLeft as HTMLElement;
    const containerWidth = queryLeftDom.clientWidth;
    let arr : any[] = [];
    //TODO 不知是哪位开的头，后期需要优化
    if (this.isShowInstanceState && this.isShowOriginator) { // 展示流程状态，就会有5个
      arr = ['1', '2', '3', '4', '5'];
    } else if (this.isShowInstanceState) {
      arr = ['1', '2', '3', '5'];
    } else if (this.isShowOriginator && this.isShowTimeRange) {
      arr = ['1', '3', '4', '5'];
    } else if(this.isShowOriginator && !this.isShowTimeRange){
      arr = ['1','3','4']
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

  onChange(e) {
    if(e.target.checked) {
      this.daily = true
    }
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  formatData() {
    const obj = {
      workflowName: this.queryData.workflowName,
      workflowCode: this.workflowCode ? this.workflowCode.split('-')[1] : '',
      originator: (this.queryData.originator && this.queryData.originator[0]) ? this.queryData.originator[0].id : '',
      unitType: (this.queryData.originator && this.queryData.originator[0]) ? this.queryData.originator[0].unitType : '',
      startTime: (this.queryData.time && this.queryData.time.length > 0) ? utils.timeStampToDate('YY-MM-DD', this.queryData.time[0]._d) : '',
      endTime: (this.queryData.time && this.queryData.time.length > 0) ? utils.timeStampToDate('YY-MM-DD', this.queryData.time[1]._d) : '',
      instanceState: this.queryData.instanceState,
      originatorName:  (this.queryData.originator && this.queryData.originator[0]) ? this.queryData.originator[0].name : '',
      workflowTplName: this.workflowCode ? this.workflowName : '',
      activityName: this.queryData.activityName,
      participant: (this.queryData.participant && this.queryData.participant[0]) ? this.queryData.participant[0].id : '',
      participantName: (this.queryData.participant && this.queryData.participant[0]) ? this.queryData.participant[0].name : '',
      participantId: (this.queryData.participantId && this.queryData.participantId[0]) ? this.queryData.participantId[0].id + '_$$_' + this.queryData.participantId[0].name : '',
      participantUnitType: (this.queryData.participant && this.queryData.participant[0]) ? this.queryData.participant[0].unitType : '',
      sequenceNo: this.queryData.sequenceNo
    };
    

    if (!this.isShowInstanceState) {
      delete obj.instanceState;
    }

    if (!this.isShowOriginator) {
      delete obj.originator;
    }

    if(!this.isShowCurResolver){
      delete obj.participant;
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
      activityName: '',
      participant: [],
      instanceState: '', // 流程状态
      participantName: '',//当前处理人
      participantId: ''
    };
    this.workflowCode = ''; // 流程模板
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
    console.log(this.$store.state.System.System.loginedUserInfo)
    // const newData = {d, id: this.$store.state.System.System.loginedUserInfo.id}
    // if(this.daily) {
    //   let dailyArr = localStorage.getItem('daily') ? JSON.parse(localStorage.getItem('daily') || '[]') : []
    //   const index = dailyArr.findIndex(item => item.id === this.$store.state.System.System.loginedUserInfo.id)
    //   index >= 0 ? dailyArr[index] = newData : dailyArr.push(newData)
    //   localStorage.setItem('daily', JSON.stringify(dailyArr))
    // }else {
    //   let tempArr = localStorage.getItem('temp') ? JSON.parse(localStorage.getItem('temp') || '[]') : []
    //   const index = tempArr.findIndex(item => item.id === this.$store.state.System.System.loginedUserInfo.id)
    //   index >= 0 ? tempArr[index] = newData : tempArr.push(newData)
    //   localStorage.setItem('temp', JSON.stringify(tempArr))
    // }
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
        width: 80px;
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

<style lang="less">
.query-form-left{
  .ant-form-item{
    display: flex;
    align-items: center;
  }
}
</style>
