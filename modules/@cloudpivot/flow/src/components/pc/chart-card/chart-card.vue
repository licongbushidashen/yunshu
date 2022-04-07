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
      <template v-if="!estimate">
        <div
          v-for="(log, i) in record"
          :key="i"
          class="item"
          :class="{'sub-item': log.subInstanceActivity}"
          @click="goSubWorkflowForm(log)"
        >
          <a-avatar
            class="avatar"
            :size="32"
            icon="user"
            :src="getImageUrl(log.originator)"
          />
          <div class="content">
            <div class="user" v-if="log.subInstanceActivity">
              <Participants
                class="name"
                slot="originator"
                :i18nData="i18n"
                :participants="[log.originator]"
                :trustor="log.trustor && log.trustor.id ? log.trustor: ''"
                :showTitle="true"
              ></Participants>
              <label v-if="!!statusFn(log.subInstanceStatus, 'subInstance')" :class="`workflow-action ${getSubWorkflowActionStatusColorClass(log.subInstanceStatus)}`"><span>{{ statusFn(log.subInstanceStatus, 'subInstance') }}</span></label>
            </div>
            <div class="user" v-else>
              <Participants
                class="name"
                slot="originator"
                :i18nData="i18n"
                :participants="[log.originator]"
                :trustor="log.trustor && log.trustor.id ? log.trustor: ''"
                :showTitle="true"
              ></Participants>
              <label v-if="!!statusFn(log.approvalActionStatus, 'workflow')" :class="`workflow-action ${getWorkflowActionStatusColorClass(log.approvalActionStatus)}`"><span>{{ statusFn(log.approvalActionStatus, 'workflow') }}</span></label>
            </div>
            <div class="timers">
              <label class="timer">{{ `${receiverTime}${workItemLogTimeFormat(log.receiveTime, log)}` }}</label>
              <label class="timer">{{ `${finishTime}${workItemLogTimeFormat(log.finishTime, log)}` }}</label>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <label class="title">{{ predictor }}</label>
        <div
          class="estimate-item"
          v-for="(user, i) in record"
          :key="i"
        >
          <a-avatar
            class="avatar"
            :size="32"
            icon="user"
            :src="getImageUrl(user)"
          />
          <Participants
            class="name"
            slot="originator"
            :participants="[user]"
            :i18nData="i18n"
            :showTitle="true"
          ></Participants>
        </div>
        <div v-if="!record || !record.length" class="estimate-item">{{ nothing }}</div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop
} from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import {
  Avatar
} from '@h3/antd-vue';
import WorkflowMixin from '../mixins/workflow';
import Participants from '../participants.vue';
// 不兼容ie
// import { closest } from '@cloudpivot/common/src/utils/dom';

import { workflow } from "@cloudpivot/api";

@Component({
  name: 'flow-track-chart-card',
  components: {
    AAvatar: Avatar,
    Participants
  }
})
export default class FormWorkflowTrackChartCard extends mixins(WorkflowMixin) {
  @Prop({ default: () => [] }) record!: workflow.WorkflowTrackLog | any;

  @Prop({ default: () => ({}) }) rect?: DOMRect;

  @Prop({ default: false }) estimate?: Boolean;

  @Prop() fn?: any;

  @Prop() i18n?: any;

  @Prop() statusFn!: any;

  receiverTime:any = '接收时间:';

  finishTime:any = '完成时间:';

  predictor:any = '预估处理人';

  nothing:any = '无';

  /**
   * 获取
   */
  get flowTrackChartCardPrefixCls() {
    return {
      'flow-track-chart-card': true,
      'flow-track-chart-card--estimate': this.estimate
    };
  }

  /**
   * 获取元素位置
   */
  get positionStyle() {
    const windowWidth:number = document.documentElement ? document.documentElement.clientWidth : 0;
    const mainScrollTop:number = document.getElementsByClassName('main')[0] ? document.getElementsByClassName('main')[0].scrollTop - 64 : 0;

    let rect:any = this.rect;
    let pageX:number = 0;
    let pageY:number = 0;
    let boxWidth:number = this.record.length > 1 ? 278 : 154;


    if (rect && rect.right && rect.left) {
      pageX = windowWidth / 2 < rect.right ? rect.left - (this.estimate ? boxWidth : 310) : rect.right + 30;
      // 在 ie 上只有 rect.top, 没有 rect.y
      pageY = mainScrollTop ? mainScrollTop + (rect.y||rect.top) : (rect.y||rect.top);
    }
    return `top:${pageY}px;left:${pageX}px`;
  }

  get apiHost(){
    return (window as any).config.apiHost
  }

  get token(){
    return window.localStorage.getItem('token');
  }

  getDownloadUrl(refId:string){
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if(this.token){
      url += '&T=' + this.token;
    }
    return url;
  }

  getImageUrl(user: any) {
    if (user.imgUrl && user.imgUrl.includes('http')) {
      return user.imgUrl;
    } else if (user.imgUrl) {
      return this.getDownloadUrl(user.imgUrl);
    }
    let userImg = require('./../image/user.png')
    return userImg || '';
  }

  destroy() {
    this.$emit('destroy');
  }

  /**
   * 文本区域点击事件
   * @param e
   */
  // documentClick(e: any) {
  //   // this.$emit('destroy');
  //   let target = ((e || window.event) as any).target;
  //   if (!this.closest(target)) {
  //     this.$emit('destroy');
  //   }
  // }

  // outerModal:any;
  // closest(el) {
  //   let modal:any = document.getElementsByClassName('flow-track-chart-card')[0];
  //   if ( !modal ) return false;
  //   while(el) {
  //     if ( el===modal ) return true;
  //     el = el.parentNode;
  //   }
  //   return false;
  // }

  mounted() {
    this.$nextTick(() => {
      if (this.i18n && this.i18n.receiverTime) {
        this.receiverTime = this.i18n.receiverTime;
        this.finishTime = this.i18n.finishTime;
        this.predictor = this.i18n.predictor;
        this.nothing = this.i18n.nothing;
      }
      (this.$refs.chartCard as HTMLElement).classList.add('flow-track-chart-card--show');

      // 卡片展示高度不够时，向上对齐展示
      const curDom = document.querySelector('.outer-wrapper') as HTMLElement;
      if (!curDom || !curDom.parentElement) {
        return;
      }
      const clientHeight:number = curDom.parentElement.clientHeight;
      const scrollTop:number = curDom.parentElement.scrollTop;
      const card:any = this.$refs.chartCard as HTMLElement;
      if (!card || !card.clientHeight) {
        return;
      }
      const pageY:number = card.style.top ? parseInt(card.style.top) : 0;
      if (clientHeight - pageY < card.clientHeight + 20) {
        const height = this.rect && this.rect.height ? this.rect.height : 0;
        card.style.top = `${pageY - card.clientHeight + height}px`;
      }
      // 延时注册事件，防止流程节点点击事件的干扰
      // setTimeout(() => {
      //   document.addEventListener('click', this.documentClick, false);
      // }, 300);
    });
  }

  /**
   * 销毁周期
   */
  // destroyed() {
  //   document.removeEventListener('click', this.documentClick, false);
  // }

  /**
   * 打开子流程表单
   */
  goSubWorkflowForm(log:any) {
    if (log.subInstanceActivity) {
      this.fn(log);
      this.$emit('destroy');
    }
  }
}
</script>
<style lang="less">
  @chartCardZIndex:999;
  .flow-track-chart-card{
    position: absolute;
    transition: all .25s;
    transform: scale(0.7);
    opacity: 0;
    top:0;
    padding: @base4-padding-md;
    margin-bottom: @base4-padding-md;
    background:#FFF;
    box-shadow:0 2px 8px 0 rgba(30,85,255,0.15);
    border-radius:4px;
    width: 280px;
    max-height: 280px;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: @chartCardZIndex;
    &--estimate{
      width: inherit;
      max-width: 263px;
      padding: 16px 0;
    }
    .item{
      display: flex;
      padding: @base4-padding-sm 0;
      border-bottom:1px solid rgba(234,237,243,1);
      .avatar{
        flex: 0 0 32px;
        margin-right: @base4-padding-md;
      }
      .content{
        flex: 1 1;
        .name{
          display: inline-block;
          margin-right: @base4-padding-md;
          font-weight:@font-weight-md;
          max-width: 118px;
          vertical-align: middle;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          a {
            color: @light-color-1;
          }
        }
        .approval{
          padding: 0 8px;
          background:rgba(50,182,131,1);
          border-radius:9px;
          color: #FFFFFF;
          line-height: 18px;
          span{
            display: inline-block;
            vertical-align: text-top;
            font-size: @font-size-12;
            transform: scale(0.8);
          }

        }
        .timers{
          font-size: @font-size-12;
          margin-top: @base4-padding-xs;
          .timer{
            display: block;
            color:@light-color-3;
          }
          .timer:first-child{
            margin-bottom: 3px;
          }
        }
      }
    }
    .item:first-child{
      padding-top: 0;
    }
    .item:last-child{
      padding-bottom: 0;
      border: 0;
    }
    .sub-item{
      cursor: pointer !important;
      .timer{
        cursor: pointer;
      }
    }

    .title{
      display: block;
      color:@light-color-1;
      font-size:@font-size-14;
      padding: 0 16px;
      margin-bottom: 16px;
    }
    .estimate-item{
      display: inline-flex;
      align-items: center;
      padding: 0 16px;
      width: 124px;
      .avatar{
        margin-right: 16px;
        i>svg{
          margin: 9px;
        }
      }
      a{
        font-size:@font-size-12;
        color: @light-color-1 !important;
      }
      .workflow-participants{
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 44px;
      }
    }
  }
  .flow-track-chart-card--show{
    opacity: 1;
    transform: scale(1);
  }
  .chart-card-mask {
    position:fixed; left:0; top:0; z-index:@chartCardZIndex - 1;
    width:100%; height:100%;
  }
</style>
