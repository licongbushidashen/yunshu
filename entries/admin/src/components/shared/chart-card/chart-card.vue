<template>
  <div class="outer-wrapper">
    <!-- 遮罩 -->
    <div class="chart-card-mask" @click="destroy"></div>
    <!-- 动态窗 -->
    <div
      ref="chartCard"
      :style="positionStyle"
      :class="flowTrackChartCardPrefixCls"
    >
      <template v-if="cardType === 'flowErr'">
        <basic-box @destroy="destroy">
          <span slot="title">{{ title }}&nbsp;&nbsp;(异常)</span>
          <div slot="table" class="table-box">
            <a-row class="row-flex">
              <a-col :span="5" class="label">异常摘要</a-col>
              <a-col :span="20" :title="data.summary" class="content text-ellipsis">{{ data.summary }}</a-col>
            </a-row>
            <a-row class="row-flex">
              <a-col :span="5" class="label">异常明细</a-col>
              <a-col :span="20" class="content text-ellipsis clamp3" :title="data.detail">{{ data.detail }}</a-col>
            </a-row>
          </div>
        </basic-box>
      </template>
      <template v-if="cardType === 'initial'">
        <basic-box @destroy="destroy">
          <span slot="title">{{ title }}</span>
          <div slot="table" class="table-box">
            <a-table
              :scroll="{ y: 170 }"
              :dataSource="data"
              :pagination="false"
              :loading="loading"
              :rowKey="(record, index) => index"
              :columns="defaultColumns"
            >
              <!-- 当前处理人 -->
              <span slot="participantNameTitle" class="resize">当前处理人</span>
              <template slot="participantName" slot-scope="text, record">
                <span class="fake-btn text-ellipsis">{{ record.participantName }}</span>
              </template>
              <!-- 操作 -->
              <span slot="operateTitle" class="resize">操作</span>
              <template slot="operate" slot-scope="text, record,index">
                <span class="btn" @click="btnOperate('submit',record,index)">提交</span>
              </template>
            </a-table>
          </div>
        </basic-box>
      </template>
      <template v-if="cardType === 'subInstance'">
        <basic-box @destroy="destroy">
          <span slot="title">{{ title }}</span>
          <div slot="table" class="table-box">
            <a-table
              :scroll="{ y: 170 }"
              :dataSource="data"
              :pagination="false"
              :rowKey="(record, index) => index"
              :columns="subInstanceColumns"
            >
              <!-- 流程名称 -->
              <span slot="instanceNameTitle" class="resize">流程名称</span>
              <template slot="instanceName" slot-scope="text, record">
                <span
                  class="fake-btn text-ellipsis workflow-hover"
                  v-html="text"
                  :title="record.instanceName"
                ></span>
              </template>
              <!-- 流程模板 -->
              <span slot="workflowNameTitle" class="resize">流程模板</span>
              <template slot="workflowName" slot-scope="text">
                <span class="text-ellipsis" :title="text">
                  {{ text }}
                </span>
              </template>
              <!-- 发起人 -->
              <span slot="originatorNameTitle" class="resize">发起人</span>
              <template slot="originatorName" slot-scope="text">
                <span class="text-ellipsis fake-btn" v-html="text"></span>
              </template>
            </a-table>
          </div>
        </basic-box>
      </template>
      <template v-if="cardType === 'processing' || cardType === 'circulate'">
        <basic-box @destroy="destroy">
          <span slot="title">{{ title }}</span>
          <div slot="table" class="table-box">
            <a-table
              :scroll="{ y: 170 }"
              :dataSource="data"
              :loading="loading"
              :pagination="false"
              :rowKey="(record, index) => index"
              :columns="defaultColumns"
            >
              <!-- 当前处理人 -->
              <span slot="participantNameTitle" class="resize">当前处理人</span>
              <template slot="participantName" slot-scope="text, record">
                <span :title="record.participantName" class="text-ellipsis fake-btn">{{ record.participantName }}</span>
              </template>
              <!-- 操作 -->
              <span slot="operateTitle" class="resize">操作</span>
              <template slot="operate" slot-scope="text, record, index">
                <span class="btn" @click="btnOperate('circulate',record,index)" v-if="record.circulate">已阅</span>
                <span class="btn" @click="btnOperate('submit',record,index)" v-if="!record.circulate && record.actionPermissionVO.submit">提交</span>
                <span class="btn" @click="btnOperate('approve',record,index)" v-if="!record.circulate && record.actionPermissionVO.agree">同意</span>
                <span class="btn" @click="btnOperate('disagree',record,index)" v-if="!record.circulate && record.actionPermissionVO.disAgree">不同意</span>
                <span class="btn" @click="btnOperate('reject',record,index)" v-if="!record.circulate && record.actionPermissionVO.showReject">驳回</span>
                <span class="btn" @click="btnOperate('more',record,index)" v-if="!record.circulate">更多</span>
              </template>
            </a-table>
          </div>
        </basic-box>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import BasicBox from './basic-box.vue';

import { workflow } from '@cloudpivot/api';

@Component({
  name: 'mock-chart-card',
  components: {
    BasicBox,
  },
})
export default class MockChartCard extends Vue {
  defaultColumns = [
    {
      // 当前处理人
      dataIndex: 'participants',
      width: 130,
      slots: { title: 'participantNameTitle' },
      scopedSlots: { customRender: 'participantName' },
    },
    {
      // 序号
      dataIndex: 'operate',
      slots: { title: 'operateTitle' },
      scopedSlots: { customRender: 'operate' },
    },
  ];
  subInstanceColumns = [
    {
      // 流程名称
      dataIndex: 'instanceName',
      width: 200,
      slots: { title: 'instanceNameTitle' },
      scopedSlots: { customRender: 'instanceName' },
    },
    {
      // 流程模板
      dataIndex: 'workflowName',
      width: 130,
      slots: { title: 'workflowNameTitle' },
      scopedSlots: { customRender: 'workflowName' },
    },
    {
      // 发起人
      dataIndex: 'originatorName',
      width: 130,
      slots: { title: 'originatorNameTitle' },
      scopedSlots: { customRender: 'originatorName' },
    },
  ];
  loading = false;
  @Prop() data?: any;

  @Prop({ default: () => ({}) }) rect?: DOMRect;

  @Prop({default: function(){}}) fn?:any

  @Prop({default: ''}) title?:string; // 弹出框标题

  @Prop({ default: 'initial' }) cardType?: string; //subInstance , processing, other

  //@Prop({default: ''}) origin?: string;// 原始的弹框类型，处理待办中的有已阅的逻辑
   
  /**
   * 获取
   */
  get flowTrackChartCardPrefixCls() {
    return {
      'flow-track-chart-card': true,
    };
  }
  btnOperate(type,record,index){
    const len = this.data.length;
    this.loading = true;
    this.fn({type,record},(err,{isFlowNext,fullScreen})=>{ //操作完后,需要根据baseInfo当前流程节点是否已处理完,处理完后弹框消息
      if(err){
        this.destroy();
      }else if(!err && (isFlowNext || fullScreen || len === 1)){ // 如果是放大或者已经流转到下一个节点
        this.destroy();
      }else if(!err && len > 1){ //如果有多条数据,没有流转到下一个节点,需要继续操作
        this.data.splice(index,1);
      }
      this.loading = false;
    });
    if(type === 'more' || type === 'reject'){
      this.destroy();// 如果是更多或者驳回,直接delete弹框
    }
    
   
    //this.$emit('nodeProcess',{type,record})
  }
  /**
   * 获取元素位置
   */
  get positionStyle() {
    const widthMap = {
      subInstance: 507,
      initial: 328,
      flowErr: 368,
      circulate: 368,
      processing: 368
    }
    const windowWidth: number = document.documentElement
      ? document.documentElement.clientWidth
      : 0;
    const mainScrollTop: number = document.getElementsByClassName('main')[0]
      ? document.getElementsByClassName('main')[0].scrollTop - 64
      : 0;

    let rect: any = this.rect;
    let pageX: number = 0;
    let pageY: number = 0;
    let boxWidth: number = this.data.length > 1 ? 278 : 154;
    if (rect && rect.right && rect.left) {
      pageX =
        windowWidth / 2 < rect.right
          ? (rect.left -  widthMap[this.cardType || 'initial'] - 30)
          : rect.right + 30;
      // 在 ie 上只有 rect.top, 没有 rect.y
      pageY = mainScrollTop
        ? mainScrollTop + (rect.y || rect.top)
        : rect.y || rect.top;
    }
   
    return `top:${pageY}px;left:${pageX}px;width:${widthMap[this.cardType || 'initial']}px`;
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  destroy() {
    this.$emit('destroy');
  }
  mounted() {
    this.$nextTick(() => {
      (this.$refs.chartCard as HTMLElement).classList.add(
        'flow-track-chart-card--show'
      );
      // 卡片展示高度不够时，向上对齐展示
      const clientHeight:number = document.body.clientHeight;
      const card:any = this.$refs.chartCard as HTMLElement;
      if (!card || !card.clientHeight) {
        return;
      }
      const pageY:number = card.style.top ? parseInt(card.style.top) : 0;
      if (clientHeight - pageY < card.clientHeight + 20) {
        const height = this.rect && this.rect.height ? this.rect.height : 0;
        card.style.top = `${pageY - card.clientHeight + height}px`;
      }
    });
  }
}
</script>
<style lang="less">
@chartCardZIndex: 1000;
body{
  overflow-y:hidden;
}
.flow-track-chart-card {
  position: absolute;
  transition: all 0.25s;
  transform: scale(0.7);
  opacity: 0;
  top: 0;
  padding: 0 @base4-padding-lg @base4-padding-lg @base4-padding-lg;
  margin-bottom: @base4-padding-md;
  background: @white-background;
  box-shadow: 0 2px 8px 0 rgba(30, 85, 255, 0.15);
  border-radius: @border-radius-base/2;
  //width: 507px;
  max-height: 280px;
  overflow-x: hidden;
  overflow-y: hidden;
  z-index: @chartCardZIndex;
  .title {
    display: block;
    color: @light-color-1;
    font-size: @font-size-14;
    padding: 0 @base4-padding-md;
    margin-bottom: 16px;
  }
}
.flow-track-chart-card--show {
  opacity: 1;
  transform: scale(1);
}
.chart-card-mask {
  position: fixed;
  left: 0;
  top: 0;
  z-index: @chartCardZIndex;
  width: 100%;
  height: 100%;
}
.table-box {
  .ant-table-fixed-header .ant-table-scroll .ant-table-header {
    overflow: hidden ;
  }
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 0 @base4-padding-md;
    height: @line-height-2;
  }
  .btn {
    color: @primary-color;
    font-size: @font-size-14;
    cursor: pointer;
    margin-right: 16px;
  }
  .label{
    color: @text-color-selected;
    padding-right: @base4-padding-lg;
    white-space: nowrap;
  }
  .row-flex{
    display:flex;
    margin-bottom: 16px;
    .content{
      color:rgba(0,0,0,0.65);
    }
    &:last-child{
      margin-bottom: initial;
    }
    .content{
      width:260px;
    }
    .clamp3{
      -webkit-line-clamp: 3;
    }
  }
}
</style>
