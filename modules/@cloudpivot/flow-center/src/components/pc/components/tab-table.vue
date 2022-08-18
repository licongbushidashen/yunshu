<template>
  <div class="tab-table">
    <div class="filters-box" v-show="isShowQueryItem">
      <query-workitem
        ref="queryWorkitem"
        :isShowInstanceState="isShowInstanceState"
        :isShowOriginator="isShowOriginator"
        :isResetFields="resetFields"
        :timeLable="timeLable"
        :isShowSequenceNo="isShowSequenceNo"
        :isShowCurResolver="isShowCurResolver"
        :isShowWorkFlowNode="isShowWorkFlowNode"
        :isShowParticipant="isShowParticipant"
        :isShowParticipantId="isShowParticipantId"
        @reset="onReset"
        @search="onSearch"
        @hide="hideQueryItem"
      />
    </div>
    <div class="table">
      <common-table :dataSource="dataSource" :columns="columns" :minTableWidth="1060">
        <!-- 序号 -->
        <span slot="indexTitle">
          <template v-if="instanceState === 'CANCELED'">
            <a-checkbox
              @change.stop="selectAll"
              v-model="isSelectAll"
              :disabled="!dataSource.length"
            ></a-checkbox>
          </template>
          <template v-else>{{ $t('cloudpivot.flowCenter.pc.orderNuber') }}</template>
        </span>
        <span
          slot="index"
          class="index"
          style="width:100%;height:100%;display:inline-block;"
          slot-scope="{text,record}"
          @mouseenter="record.hover = true"
          @mouseleave="record.hover = false"
        >
          <template v-if="instanceState === 'CANCELED'">
            <a-checkbox
              v-show="record.hover || record.checked"
              v-model="record.checked"
              @change.stop="onItemCheckboxChange"
            ></a-checkbox>
            <span class="text" v-show="!record.hover && !record.checked">{{ text }}</span>
          </template>
          <template v-else>
            <img
              v-if="record.isTrustStart && !record.isTrustor"
              class="delegation-icon"
              src="../assets/icons/entrusted.png"
            />
            <img
              v-else-if="record.isTrustStart && record.isTrustor"
              class="delegation-icon"
              src="../assets/icons/entrust.png"
            />
            <span class="middle">{{ text }}</span>
          </template>
        </span>

        <!-- 流程名称 -->
        <span slot="instanceNameTitle">{{ $t('cloudpivot.flowCenter.pc.flowName') }}</span>
        <template slot="instanceName" slot-scope="{text,record}">
          <span
            class="fake-btn text-ellipsis"
            @click.stop="openDetail(record)"
            v-html="text"
            :title="record.instanceName"
          ></span>
        </template>

        <!-- 流程模板 -->
        <span slot="workflowNameTitle">{{ $t('cloudpivot.flowCenter.pc.flowTemplate') }}</span>
        <template slot="workflowName" slot-scope="{text,record}">
          <span
            v-if="isChinese"
            :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'"
            :title="text"
          >{{ text }}</span>
          <span
            v-else
            :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'"
            :title="record.name_i18n[$i18n.locale]"
          >{{ record.name_i18n[$i18n.locale] }}</span>
        </template>
        <!-- 单据号 -->
        <span slot="sequenceNoTitle" >
          {{ $t("cloudpivot.flowCenter.pc.sequenceNo") }}
        </span>
        <template slot="sequenceNo" slot-scope="{text, record}">
          <span :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'">{{ text }}</span>
        </template>

        <!-- 当前处理人 -->
        <span slot="participantNameTitle">
          <span>{{ $t('cloudpivot.flowCenter.pc.curResolver') }}</span>
        </span>
        <span slot="participantName" slot-scope="{text,record}" class="participant-name">
          <a-tooltip
            placement="topLeft"
            :mouseEnterDelay="0.5"
            :visible="visible&&curID===record.id"
            @visibleChange="toolTipShow($event,record)"
          >
            <template slot="title">
              <span class="space">&nbsp;</span>
              <template v-for="(p,index) in tooltipParticipants">
                <div :key="index" class="participant-wrap">
                  {{ `${p.activityName}:` }}
                  <template v-for="(participant,i) in p.participants">
                    <span
                      class="fake-btn"
                      :key="i"
                      v-if="i === (p.participants.length-1)"
                      @click="showDrawer(participant.id)"
                    >{{ `${participant.name};` }}</span>
                    <span
                      class="fake-btn"
                      :key="i"
                      v-else
                      @click="showDrawer(participant.id)"
                    >{{ `${participant.name}、` }}</span>
                  </template>
                  <br />
                </div>
              </template>
            </template>
            <div class="p-box">
              <span
                class="fake-btn"
                v-if="record.participants.name"
                @click="showDrawer(record.participants.id)"
              >{{ `${record.participants.name}...` }}</span>
            </div>
          </a-tooltip>
        </span>

        <!-- 处理人 -->
        <span slot="resolverTitle">
          <span>{{ $t('cloudpivot.flowCenter.pc.resolver') }}</span>
        </span>
        <span slot="resolverName" slot-scope="{text,record}" class="participant-name">
          <div class="p-box">
            <span
              class="fake-btn"
              @click="showDrawer(record.participants.id)"
              :title="record.participants.name"
            >{{ record.participants.name }}</span>
          </div>
        </span>

        <!-- 已用时 -->
        <span slot="stayTimeTitle">{{ $t('cloudpivot.flowCenter.pc.usedTime') }}</span>

        <!-- 发起时间 -->
        <span slot="startTimeTitle">{{ $t('cloudpivot.flowCenter.pc.initiationTime') }}</span>

        <!-- 发起人 -->
        <span slot="originatorNameTitle">{{ $t('cloudpivot.flowCenter.pc.originatorName') }}</span>
        <template slot="originatorName" slot-scope="{text,record}">
          <span class="fake-btn" @click.stop="showDrawer(record.originator)" v-html="text"></span>
        </template>

        <!-- 发起人所属部门 -->
        <span slot="departmentNameTitle">{{ $t('cloudpivot.flowCenter.pc.originatorDepartment') }}</span>

        <!-- 流程状态 -->
        <span slot="stateTitle">{{ $t('cloudpivot.flowCenter.pc.flowStatus') }}</span>

        <template slot="state" slot-scope="{text,record}">
          <span>{{ showWorkflowState(text) }}</span>
        </template>

        <template slot="stateTxt" slot-scope="{text,record}">
          <span>{{ text }}</span>
        </template>

        <!-- 完成时间 -->
        <span slot="finishedTimeTitle">{{ $t('cloudpivot.flowCenter.pc.finishedTime') }}</span>

        <!-- 耗时 -->
        <span slot="costTimeTitle">{{ $t('cloudpivot.flowCenter.pc.costTime') }}</span>

        <!-- 停留时间 -->
        <span slot="haveStayedTimeTitle">{{ $t('cloudpivot.flowCenter.pc.stayTime') }}</span>
        <template slot="stayTime" slot-scope="{text,record}">
          <span :class="record.isRead ? 'gray' : ''">
            {{ record.time }}
            <span
              v-if="record.workItemTimeoutStatus === 'RED' || record.workItemTimeoutStatus === 'ORANGE'"
            >后超时</span>
          </span>
          <span class="deadline-tip">
            <i
              class="overtime"
              v-if="record.workItemTimeoutStatus === 'TIMEOUT'"
            >{{ $t('cloudpivot.flowCenter.pc.timeout') }}</i>
            <img
              v-else-if="record.workItemTimeoutStatus === 'RED'"
              class="overtime-icon"
              src="../assets/icons/warning01.png"
            />
            <img
              v-else-if="record.workItemTimeoutStatus === 'ORANGE'"
              class="overtime-icon"
              src="../assets/icons/warning02.png"
            />
          </span>
        </template>

        <!-- 发起人组织 -->
        <template slot="departmentName" slot-scope="{text,record}">
          <span class="text-ellipsis" :title="text">{{ text }}</span>
        </template>

        <!-- 接收时间 -->
        <span slot="receiveTimeTitle">{{ $t('cloudpivot.flowCenter.pc.reciveTime') }}</span>

        <!-- 处理结果 -->
        <span slot="approvalTitle">{{ $t('cloudpivot.flowCenter.pc.resolveRzt') }}</span>

        <!-- 作废时间 -->
        <span slot="cancellationTime">{{ $t('cloudpivot.flowCenter.pc.cancelTime') }}</span>
      </common-table>
    </div>

    <div class="no-data">
      <PageNoData
        :isShowNoData="isShowNoData"
        :isShowSearchNoData="isShowSearchNoData"
        :tipText="$t('cloudpivot.flowCenter.pc.noContent')"
      />
    </div>

    <common-drawer v-model="isShowDrawer" :data="userInfo" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Tooltip, Checkbox } from '@h3/antd-vue'

import QueryWorkitem from './query-condition/query-workitem.vue'

import CommonDrawer from './modals/drawer.vue'

import common from '@cloudpivot/common/pc'

import * as WorkflowCenterTypes from '../typings/workflow-center'

import WorkItemMixin from '../mixins/workitem'

import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams,
  workflowApi,
} from '@cloudpivot/api'

import { mixins } from 'vue-class-component'

import CommonTable from './common-table/table.vue'

@Component({
  name: 'tab-table',
  components: {
    ACheckbox: Checkbox,
    ATooltip: Tooltip,
    CommonDrawer,
    QueryWorkitem,
    PageNoData: common.components.PageNoData,
    CommonTable,
  },
})
export default class TabTable extends mixins(WorkItemMixin) {
  @Prop() timeLable!: string // 查询条件时间段显示文本

  @Prop() columns!: any // 表格行配置（表头配置）

  @Prop() dataSource!: any // 表格数据

  @Prop() scrollY!: number // 表头固定

  @Prop() isShowInstanceState!: boolean

  @Prop() isShowOriginator!: boolean

  @Prop() resetFields!: boolean

  @Prop() tabType!: string // 展示type的模块类型

  @Prop() isShowLoadAll!: boolean

  @Prop() isShowNoData!: boolean

  @Prop() isShowSearchNoData!: boolean

  @Prop() isShowQueryItem!: boolean // 是否展示查询条件

   @Prop({ default: false }) isShowSequenceNo!: boolean // 是否展示查询条件

  @Prop({ default: false }) isShowCurResolver!: boolean // 是否展示当前处理人

  @Prop({ default: false }) isShowWorkFlowNode!: boolean // 是否展示流程节点
  @Prop({ default: false }) isShowParticipant!: boolean // 处理人name
  @Prop({ default: false }) isShowParticipantId!: boolean // 处理人id
  
  

  @Prop() instanceState?: string | undefined
  @Prop() vm!:any;

  isShowDrawer: boolean = false

  userInfo: any = {}

  visible: boolean = false

  curID: string = ''

  tooltipParticipants: any = []

  isSelectAll: boolean = false

  get isChinese() {
    return this.$i18n.locale === 'zh'
  }

  get scrollX() {
    let _w: number = 0
    if (this.columns) {
      this.columns.forEach((col: any) => {
        _w += col.width
      })
      return _w + 1
    }
    return 0
  }

  async toolTipShow(visible: boolean, workflowData: any) {
    this.curID = workflowData.id
    if (visible) {
      const params: workflowCenterParams.participantParams = {
        workflowInstanceId:
          this.tabType === 'task' ? workflowData.instanceId : workflowData.id,
        circulateResource: 'WORKITEM',
      }
      const res = await workflowCenterApi.getParticipants(params)
      if (res.errcode === 0) {
        this.tooltipParticipants = res.data
        this.visible = true
      }
    } else {
      this.visible = false
    }
  }

  @Watch('dataSource', {
    immediate: true,
  })
  onChangData(){
    this.isSelectAll = false
  }

  /**
   * 全选
   */
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked
    if (isChecked) {
      this.dataSource.forEach((item: any) => {
        item.checked = true
      })
    } else {
      this.dataSource.forEach((item: any) => {
        item.checked = false
      })
    }
  }

  /*
   * 当checkbox选择change时事件
   */
  onItemCheckboxChange() {
    const isCheckedItems = this.dataSource.filter((d: any) => d.checked)
    if (isCheckedItems.length < this.dataSource.length) {
      this.isSelectAll = false
    } else {
      this.isSelectAll = true
    }
  }

  /*
   * 重置事件
   */
  onReset() {
    this.$emit('onReset')
  }

  /*
   * 搜索事件
   */
  onSearch(params: any) {
    this.$emit('onSearch', params)
  }

  // 展示抽屉
  async showDrawer(id: string) {
    await this.getUserInfo(id)
    this.isShowDrawer = true
  }

  async getUserInfo(id: string) {
    const res = await workflowCenterApi.getUserInfo({ id })
    if (res.errcode === 0) {
      this.userInfo = res.data
    }
  }

  // 流程状态展示
  showWorkflowState(state: string) {
    let stateTxt: any = ''
    switch (state) {
      case WorkflowCenterTypes.WorkflowInstanceState.EXCEPTION:
        stateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.exception')
        break
      case WorkflowCenterTypes.WorkflowInstanceState.PROCESSING:
        stateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.processing')
        break
      case WorkflowCenterTypes.WorkflowInstanceState.COMPLETED:
        stateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.completed')
        break
      case WorkflowCenterTypes.WorkflowInstanceState.CANCELED:
        stateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.canceled')
      case WorkflowCenterTypes.WorkflowInstanceState.DRAFT:
        stateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.draft')
        break
    }
    return stateTxt
  }

  /**
   * 打开表单
   */
  openDetail(obj: any) {
    let url: string = ''
    if (this.tabType === 'instance') {
     if(( location.pathname + location.search)=='/wyviews/task'){
        url = `/form/detail?workflowInstanceId=${obj.id}&return=/workflow-center/my-workflow`
     }else{
     url = `/form/detail?workflowInstanceId=${obj.id}&return=${
        location.pathname + location.search
      }`
     }
    } else if (this.tabType === 'task') {
          if(( location.pathname + location.search)=='/wyviews/task'){
            url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${
        obj.instanceId
      }&return=/workflow-center/my-workflow`
     }else{
      url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${
        obj.instanceId
      }&return=${location.pathname + location.search}`
     }
 
    }
    if (this.isDingTalk) {
      this.$router
        .push({
          path: url,
        })
        .catch((err: any) => {
          err
        })
    } else {
      this.vm.IframeFormUrl = url;
      this.vm.showIframeForm = true;

      // window.open(url)
    }
  }

  hideQueryItem() {
    this.$emit('hide')
  }
}
</script>
<style lang='less' scoped>
@import '../style/index.less';
.filters-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 45px;
  z-index: 99;
}

.table {
  margin-top: 46px;
}

.participant-name {
  div.p-box {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    
    span{
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }
  }
  .participant-wrap {
    float: left;
  }
}

.space {
  float: left;
}

.fake-btn {
  cursor: pointer;
  transition: all ease 0.3s;
  &:hover {
    color: @primary-color;
  }
}
.index {
  width: 100%;
  height: 100%;
  display: inline-block;
  .text {
    padding: 0;
  }
  .ant-checkbox-inner:after {
      margin-left: 0 !important; 
  }
}
</style>
