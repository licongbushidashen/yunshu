，
<template>
  <div class="form-approval">
    <div v-for="(approval, i) in approvalsData" :key="i" class="form-approval__item">
      <div class="form-approval__workflow">
        <label>{{ approval.activityName }}</label>
        <div :class="`form-approval__trail${ !approval.nodes ? ' form-approval__trail--line-hide' : ''}`">
          <div class="form-approval__line"></div>
          <i :class="`icon aufontAll form-approval__line-icon ${approval.activityStatus}`"></i>
          <div class="form-approval__line"></div>
        </div>
      </div>
      <div v-if="approval.nodes && approval.nodes.length" class="form-approval__instances">
        <div v-if="approval.isCirculate" class="form-approval__instance">
          <div v-for="(node, g) in approval.nodes" :key="g" class="form-approval__circulations" @click="showReadDetail(node.circulations)">
            <label>传阅{{node.circulations.length}}人</label>
            <span class="form-approval__circulations-users">已阅{{getCirculationsNum(node.circulations,11)}}人、未阅{{getCirculationsNum(node.circulations,10)}}人</span>
            <i class="form-approval__circulations-arrow">
              <i class="icon aufontAll">&#xe89b;</i>
            </i>
          </div>
        </div>
        <template v-else v-for="(node, g) in approval.nodes" >
          <div :key="g" :class="`form-approval__instance${approval.subInstanceActivity ? ' form-approval__instance--sub' : ''}`" @click="clickApproval(node, approval.subInstanceActivity)" v-show="approval.subInstanceActivity || (node.workItemStatus !== 1 && node.workItemStatus !== 2) || node.approvaler.length">
            
            <template v-if="approval.subInstanceActivity || (node.workItemStatus !== 1 && node.workItemStatus !== 2)">
              <div class="form-approval__content">
                <h3-avatar
                  class="form-approval__avatar"
                  icon="user"
                  :src="getImageUrl(node.approvaler)"
                ></h3-avatar>
                <div class="form-approval__info">
                  <div class="row">
                    <label class="form-approval__username">{{ node.trustor && node.trustor.id ? `${node.approvaler.name}${$t('cloudpivot.flow.mobile.trust', {name: node.trustor.name})}`:node.approvaler.name }}</label>
                    <span v-if="approval.subInstanceActivity">{{ getWorkItemStatus(node.workItemStatus) }}</span>
                    <template v-else-if="node.workActionType && node.workActionType !== 12">
                      <label :class="`workflow-action ${getWorkflowActionStatusColorClass(node.workActionType)}`">
                        <span v-if="![9,17,18,19,20].includes(node.workActionType)">{{ getWorkflowActionStatus(node.workActionType, node) }}</span>
                      </label>
                    </template>
                    <div class="form-approval__date">{{ node.approvalTime||node.circulateTime }}</div>
                  </div>
                  <div class="row">
                    <div class="form-approval__org">{{ node.dept }}</div>
                    <label v-if="node.from" class="workflow-action form-approval__coming">
                      <span>{{ node.from.userInfo.name + '的' + getWorkflowActionStatus(node.from.fromType, 'node.from.fromType') }}</span>
                    </label>
                  </div>
                </div>
              </div>
              <template v-if="!approval.subInstanceActivity">

                <div class="form-approval__text" v-if="node.bizComment && node.bizComment.type !== 0 && node.bizComment.type !== 9 && !!node.bizComment.content">

                  <span v-if="node.bizComment.type === 5 || node.bizComment.type === 6 || node.bizComment.type === 7" class="form-approval__participant">
                    {{ `${getWorkflowActionStatus(node.bizComment.type, 'node.bizComment.type')}给` }}
                    <template v-if="node.bizComment.type === 7">{{ node.forwardReceiver }}</template>
                    <template v-for="(user, userIdx) in node.bizComment.userInfos">{{ user.name }}<template v-if="userIdx < node.bizComment.userInfos.length- 1">、</template></template>
                  </span>

                  <span v-else class="form-approval__opinion">{{ node.bizComment.title }}</span>

                  {{ node.bizComment.content }}

                </div>

              </template>

              <template v-else>

                <workflow-status class="form-approval__status" :status="node.workItemStatus">
                </workflow-status>

              </template>
            </template>

            <template v-else-if="node.approvaler.length > 0">
              <div @click="approvalsDetails(node.approvaler, getWorkItemStatus(node.workItemStatus))" class="form-approval__progress">
                <label>{{ getWorkItemStatus(node.workItemStatus) }}</label>
                <span class="form-approval__progress-users">{{ $t('cloudpivot.flow.mobile.Person', { length: node.approvaler.length }) }}</span>
                <i class="form-approval__arrow">
                  <i class="icon aufontAll">&#xe89b;</i>
                </i>
              </div>
            </template>

            <div class="form-approval__signsture" v-if="node.resources && node.resources.length">
              <div v-for="(source, index) in node.resources" :key="index">
                <template v-if="source.img">
                  <img :src="source.img" @click="previewImage(source)">
                </template>
              </div>
            </div>
          </div>
          <div :key="g" v-if="node.circulations&&node.circulations.length>0" class="form-approval__trail" style="align-items: start;margin-left:0.98666665rem"><div class="form-approval__line" style="background: #e8e8e8;flex-basis: 0.3rem"></div></div>
          <div :key="g" v-if="node.circulations&&node.circulations.length>0" class="form-approval__instance">
              <div class="form-approval__circulations" @click="showReadDetail(node.circulations)">
                <label>传阅{{node.circulations.length}}人</label>
                <span class="form-approval__circulations-users">已阅{{getCirculationsNum(node.circulations,11)}}人、未阅{{getCirculationsNum(node.circulations,10)}}人</span>
                <i class="form-approval__circulations-arrow">
                  <i class="icon aufontAll">&#xe89b;</i>
                </i>
              </div>
            </div >
          <div :key="g" class="form-approval__trail" style="align-items: start;margin-left:0.98666665rem;"><div class="form-approval__line" style="background: #e8e8e8;flex-basis: 0.3rem"></div></div>

          <template v-if="[18,9,2,17,19].includes(node.workActionType) && node.workItemId==='ADMIN'">
            <div class="node-type" @click="toShowInfo(node)" :key="g">
              <span><i class="icon aufontAll h-icon-all-wrench"></i>{{getNodeType(node.workActionType)}}</span>
              <span class="icon aufontAll h-icon-all-right"></span>
            </div>
            <div :key="g" class="form-approval__line"></div>
          </template>
        </template>

      </div>
    </div>
    <h3-dialog v-model="showSignsture" class="dialog-demo" hide-on-blur>
      <div class="img-box">
        <img :src="signstureImg" style="max-width:100%">
      </div>
      <div @click="showSignsture=false" class="close-bar">
        <span class="h3-close"></span>
      </div>
    </h3-dialog>
  </div>
</template>


<script lang="ts">
import {
  Component, Prop, Inject
} from 'vue-property-decorator';
import {
  H3Avatar,
  H3Dialog
} from 'h3-mobile-vue';
import { mixins } from 'vue-class-component';

import WorkflowMixin from '../workflow';

import WorkflowStatus from '../shared/workflow-status/workflow-status.vue';

import {
  renderer
} from '@cloudpivot/form';

import { workflow, user } from '@cloudpivot/api';


@Component({
  name: 'form-approval',
  components: {
    H3Avatar,
    WorkflowStatus,
    H3Dialog
  }
})
export default class FormApproval extends mixins(WorkflowMixin) {
  @Prop({ default: () => [] }) approvals!: workflow.ApprovalInstance[];// 流程实例

  @Inject()
  emitPreview !: (file: any) => void

  @Inject()
  emitDetail !: (params: any) => void

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
    return '';
  }

  get approvalsData() {

    const approvals = Object.assign([], this.approvals);
    const locale = this.$i18n ? this.$i18n.locale as string : 'zh';
    approvals.forEach((item: workflow.ApprovalInstance) => {
      // 节点名称国际化
      if (item.name_i18n) {
        item.activityName = locale === 'zh' ? item.activityName : item.name_i18n[locale];
      }

      if (!item.subInstanceActivity) {
        if (item.nodes && item.nodes.length) {
          const noStartedApprovaler: user.Info[] = [];
          const inProgressApprovaler: user.Info[] = [];
          item.nodes = item.nodes.map((node: any) => {
            if (node.resources && node.resources.length) {
              node.resources = node.resources.map((signatrue: any) => {
                const s: any = {
                  img: '',
                  file: signatrue
                };
                if (signatrue.name === 'signsture.png') {
                  if (!signatrue) return;
                  s.img = renderer.UploadControl.service.getDownloadUrl(signatrue);
                }
                return s;
              })
            }

            // 过滤 1 未启动 和 2 进行中的节点, 进行数据重组
            if (node.workItemStatus === 1 || node.workItemStatus === 2) {
              node.approvaler.dept = node.dept;
              node.approvaler.trustor = node.trustor;
              node.workItemStatus === 1 ? noStartedApprovaler.push(node.approvaler) : inProgressApprovaler.push(node.approvaler);
              return;
            }
            return node;
          }).filter(Boolean);

          if (noStartedApprovaler.length) {
            item.nodes.push({ workItemStatus: 1, approvaler: noStartedApprovaler } as workflow.ApprovalNode);
          }
          if (inProgressApprovaler.length) {
            item.nodes.push({ workItemStatus: 2, approvaler: inProgressApprovaler } as workflow.ApprovalNode);
          }
        }
      }
    });
    return approvals.reverse();

  }

  approvalsDetails(approvaler: any, title: string) {
    const params = {
      title,
      approvaler
    };
    this.emitDetail(params);
    // this.$router.push({
    //   name: 'FormApprovalDetails',
    //   params
    // });
  }
  /**
   * 图片预览
   */
  signstureImg:any = '';
  showSignsture:boolean = false;
  previewImage(file: any) {
    this.signstureImg = file.img;
    this.showSignsture = true;
    // const url = renderer.UploadControl.service.getPreviewUrl(file.file);
    // url && window.open(url);
    // this.emitPreview(file.file);
    // 
    // renderer.UploadControl.service.preview(file.file,[file.file]);
    // UploadControl.service.download(file.file);
  }

  /*
  *点击审批记录节点
  */
  clickApproval(log: any, isSub: boolean) {
    if (isSub) {
      this.$emit('goSubInstance', log);
    }
  }

  getCirculationsNum(circulations,type){
    return circulations.filter(item => item.workActionType == type).length;
  }

  showReadDetail(params){
    this.$router.push({
      name:"FormReadDetails",
      params:{
        user:params
      }
    }).catch(console.log);
  }

  toShowInfo(params, type){
    this.$router.push({
      name:"approvalInfo",
      params:{
        ...params
      }
    }).catch(console.log);
  }

  getNodeType(type){
    const Obj = {
      2: '流程调整',
      9: '流程调整',
      18: '节点调整',
      17: '人员调整',
      19: '人员调整',
    }
    return Obj[type]
  }
}
</script>


<style lang="less">
@import "~@cloudpivot/common/styles/mixins.less";
@import "../style";
.form-approval {
  text-align: left;
  &__item {
    display: flex;
    flex-direction: column;
    &:first-child {
      .form-approval__line:first-child {
        background: transparent;
      }
    }
  }
  &__trail--line-hide {
    .form-approval__line {
      background: transparent;
    }
  }
  &__workflow {
    display: flex;
    label {
      order: 1;
      color: rgba(0, 0, 0, 0.65);
      .px2rem(font-size, @font-size-base);
      .px2rem(margin-left, 16px);
      .px2rem(padding-top, 62px);
    }
  }

  &__trail {
    order: 0;
    flex: 0 0;
    .px2rem(margin-left, 60px);
    .px2rem(flex-basis, 30px);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  &__line-icon {
    flex: 0 0;
    .px2rem(flex-basis, 30px);
    .px2rem(width, 30px);
    .px2rem(line-height, 30px);
    .px2rem(font-size, @font-size-xxxs);
    color: #ffffff;
    background-color: #32b683;
    border-radius: 50%;
    text-align: center;
  }
  &__line-icon.UNPASS {
    background-color: #f5222d;
  }
  &__line-icon.INPROGRESS {
    background-color: #ffffff;
    .hairline("all", #2970ff, 25%);
  }
  &__line-icon.END {
    background-color: rgba(0, 0, 0, 0.45);
  }
  &__line-icon.PASS:before {
    content: "\e98f";
  }
  &__line-icon.UNPASS:before {
    content: "\e996";
  }
  &__line-icon.END:before {
    content: "\e8d5";
  }
  &__line {
    flex: 0 0;
    .px2rem(width, 2px);
    .px2rem(margin-left, 1px);
    background: rgba(232, 232, 232, 1);
  }
  &__line:first-child {
    .px2rem(flex-basis, 60px);
  }
  &__line:last-child {
    .px2rem(flex-basis, 30px);
  }
  &__instance {
    .px2rem(margin-left, 20px);
    .px2rem(margin-right, 20px);
    .px2rem(padding, 30px);
    background: #ffffff;
    .px2rem(border-radius, 16px);
  }
  &__instance:last-child {
    margin-bottom: 0;
  }
  &__content {
    display: flex;
  }
  &__avatar {
    flex: 0 0;
    .px2rem(flex-basis, 80px);
    .px2rem(height, 80px);
    .px2rem(width, 80px);
    .px2rem(margin-right, 30px);
    border-radius: 50%;
  }
  @tmp_info: (110px / @baseFontSize * 1rem);
  &__info {
    flex: 1 1;
    max-width: calc(100% - @tmp_info);
  }
  &__username {
    overflow: hidden;
    vertical-align: middle;
    text-overflow: ellipsis;
    flex-basis: 40%;
    white-space: nowrap;
    display: inline-block;
    .px2rem(margin-right, 16px);
    .px2rem(font-size, 32px);
    color: #333333;
    font-weight: 600;
  }
  &__date {
    flex: 1 1;
    text-align: right;
    color: rgba(0, 0, 0, 0.45);
  }
  &__info {
    .row {
      display: flex;
      align-items: center;
    }
    .row + .row {
      .px2rem(margin-top, 16px);
    }
  }
  &__org {
    flex: 1 1;
    .px2rem(font-size, 26px);
    color: rgba(0, 0, 0, 0.65);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  &__coming {
    background-color: rgba(0, 0, 0, 0.2);
  }
  &__text {
    position: relative;
    .hairline("top", #eeeeee);
    .px2rem(margin-top, 24px);
    .px2rem(padding-top, 24px);
    .px2rem(font-size, 30px);
    color: rgba(0, 0, 0, 0.65);
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  &__progress {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .px2rem(padding, 30px);
    .px2rem(margin, -30px);
    .px2rem(font-size, 30px);
    > label {
      flex: 0 0;
      .px2rem(flex-basis, 180px);
      color: #666666;
    }
  }
  &__circulations {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .px2rem(padding, 30px);
    .px2rem(margin, -30px);
    .px2rem(font-size, 30px);
    > label {
      flex: 0 0;
      .px2rem(flex-basis, 300px);
      color: #666666;
    }
  }
  &__signsture {
    position: relative;
    img {
      width: 4rem;
      height: 4rem;
    }
  }
  &__progress-users {
    color: #333333;
  }
  &__circulations-users {
    color: #999999;
  }
  &__arrow {
    flex: 0 0;
    .px2rem(flex-basis, 180px);
    text-align: right;
    .icon {
      display: inline-block;
      .px2rem(font-size, 20px);
      color: #999999;
    }
  }
  &__circulations-arrow {
    flex: 0 0;
    .px2rem(flex-basis, 20px);
    text-align: right;
    .icon {
      display: inline-block;
      .px2rem(font-size, 20px);
      color: #999999;
    }
  }
  &__instance--sub {
    position: relative;
  }
  &__status {
    position: absolute;
    .px2rem(right, 30px);
    .px2rem(top, 30px);
    .px2rem(width, 120px);
  }
}
.h3-close {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  color: #999;
  width: 24px;
  height: 24px;
  margin-top: 8px;
  margin-bottom: 8px;
  &:before,
  &:after {
    content: "";
    position: absolute;
    left: 0;
    top: 11px;
    width: 24px;
    height: 1px;
    background-color: currentColor;
    transform: rotate(-45deg);
  }
  &:after {
    transform: rotate(45deg);
  }
}
.close-bar {
  background: rgba(0, 0, 0, 0.1);
}

.node-type{
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  border-radius: 4px;
  .px2rem(margin-left, 20px);
  .px2rem(margin-right, 20px);
  margin-bottom: 0.4rem;
  padding: 0.4rem;
  font-size: 15px;
  color: #2970FF;
  i{
    margin-right: 8px;
  }
  span.icon{
    font-size: 14px;
    color: rgba(153, 153, 153, 1);
  }
  position: relative;
  &::after{
    content: '';
    position: absolute;
    top: 100%;
    height: 0.4rem;
    width: 1px;
    background-color: #e8e8e8;
    left: 26px;
  }
}
</style>
