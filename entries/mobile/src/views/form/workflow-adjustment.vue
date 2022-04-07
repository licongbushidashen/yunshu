<!--
 * @Descripttion: 调整节点
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-15 15:56:38
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-10-15 16:28:31
-->
<template>
  <div class="adjustment-box">
    <div class="sub-title">{{ $t("cloudpivot.flow.pc.ChooseAdjustType") }}</div>
    <div class="adjustment">
      <ul>
        <template v-for="(item, index) in formStatus">
          <li
            v-if="item.show"
            @click="formSatusChange(item)"
            :key="index"
          >
            <span>{{ item.name }}</span>
            <check-box
              :defaultChecked="currentStatus === item.status"
              :radio="true"
              @change="formSatusChange(item)"
            />
            <div
              class="li-hint"
              v-show="currentStatus == '3' && item.status == '3'"
            >
              {{ $t("cloudpivot.flow.pc.AdjustNodeTips") }}
            </div>
          </li>
        </template>
      </ul>
    </div>
    <h3-radio-list
      v-show="selectShow"
      class="cur-other"
      showMode="0"
      :defaultValue="autoSelect"
      :options="options"
      :title="$t('cloudpivot.form.renderer.ChooseNode')"
      :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
      :clearText="$t('cloudpivot.form.renderer.clear')"
      :confirmText="$t('cloudpivot.form.renderer.ok')"
      @onChange="onChange"
    >
    </h3-radio-list>

    <FormAdjustment v-if="currentStatus == '2'" @submit="adjustmentOk" :error.sync="isError" :staff="staff"/>

    <div class="border-top">
      <h3-button class="border-top-btn" @click="ok">{{
        $t("cloudpivot.form.runtime.biz.ok")
      }}</h3-button>
    </div>

  </div>
</template>
<script lang='ts'>
import { Component, Vue, Watch } from "vue-property-decorator";

import { H3RadioList, H3Button } from "h3-mobile-vue";

import common from "@cloudpivot/common/mobile";

import { workflowApi, workflow, listApi } from "@cloudpivot/api";

import FormAdjustment from "@cloudpivot/form/src/runtime/components/mobile/form-adjustment.vue";

@Component({
  name: "workflow-adjustment",
  components: {
    H3RadioList,
    H3Button,
    CheckBox: common.components.Checkbox,
    FormAdjustment,
  },
})
export default class WorkflowAdjustment extends Vue {
  // workItemId:string ="";
  workflowInstanceId: string = "";
  options: any[] = [];
  autoSelect: any = "";
  showOperat: boolean = true;
  formStatus: any[] = [
    {
      name: "提前结束流程",
      status: "1",
      code: "finishWorkflow",
      show:false,
    },
    {
      name: "调整当前处理人",
      status: "2",
      code: "adjustOriginator",
      show:false,
    },
    {
      name: "取消当前节点所有任务",
      status: "3",
      code: "cancelAllTask",
      show:false,
    },
    {
      name: "激活其它节点",
      status: "4",
      code: "activateNodes",
      show:true,
    },
  ];
  currentStatus: string = "";
  staff :any[] = [];
  flag: boolean = false;
  participantors: any = [];
  loadData: any = {};
  staffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: "",
  };
  currentActivityCode: string = "";
  workItemId: string = "";
  isError: boolean =false;
  selectShow: Boolean = false;
  nodes: any[] = []; //所有节点信息

  formSatusChange(statusItem: any) {
    this.selectShow=false;
    this.currentStatus = statusItem.status;
    const tmpOptions: any[] = [];
    this.currentActivityCode = "";
    switch (this.currentStatus) {
      case "2":
      case "3":
        this.nodes.forEach((item: any) => {
          if (item.status) {
            tmpOptions.push({
              value: item.activityCode,
              label: item.activityName,
              name: item.participantors
            });
          }
        });
        if (tmpOptions.length > 1) {
          this.selectShow = true;
          this.options=tmpOptions;
        }
        break;
      case "4":
        this.selectShow=true;
        this.nodes.forEach((node: any) => {
          if(node.status===0){
            tmpOptions.push({
              value: node.activityCode,
              label: node.activityName,
            });
          }
        });
        this.options = tmpOptions;
        break;
    }
  }

  /**
   * 激活其他节点
   */
  async jumpToActivity() {
    if(!this.currentActivityCode){
      this.$h3.toast.show({
        text: '请选择激活节点',
        iconType: "",
      });
      return;
    }
    
    const res = await workflowApi.activateActivity({
      activityCode: this.currentActivityCode,
      workflowInstanceId: this.workflowInstanceId,
    });
    if (res && res.errcode === 0) {
      this.isReturn();
    } else {
      this.$h3.toast.show({
        text: res.errmsg,
        iconType: "",
      });
    }
  }

  /**
   * 提前结束流程
   */
  async forceFinishWorkflow() {
    const res = await workflowApi.finishInstance(this.workflowInstanceId);
    if (res && res.errcode === 0) {
      this.isReturn();
    } else {
      this.$h3.toast.show({
        text: res.errmsg,
        iconType: "",
      });
    }
  }

  /**
   * 调整当前处理人
   */
  async adjustCurrentParticipant() {
    if (this.flag) {
      return;
    }
    
    if(!this.participantors[0] || !this.participantors[0].username){
       this.$h3.toast.show({
        text: "请选择当前处理人",
        iconType: "",
      });
      // this.isError=true;
      return;
    }
    
    
    const currentItem = this.loadData.logInfoList.find(item=> item.activityCode===this.loadData.activityCode);
    
    if (currentItem.originator.id === this.participantors[0].id) {
      this.$h3.toast.show({
        text: "选择处理人已经是当前处理人了",
        iconType: "",
      });
      return;
    }

    this.flag = true;
    const res = await workflowApi.adjustParticipantors({
      activityCode: this.currentActivityCode || this.loadData.activityCode,
      participantors: [this.participantors[0].id],
      workflowInstanceId: this.workflowInstanceId,
    });
    this.flag = false;
    if (res && res.errcode === 0) {
      this.isReturn();
    } else {
      this.$h3.toast.show({
        text: res.errmsg,
        iconType: "",
      });
    }
  }
  /**
   * 取消节点所有任务
   */
  async cancelWorkitems() {
    const res = await workflowApi.cancelActivity({
      activityCode: this.currentActivityCode || this.loadData.activityCode,
      workflowInstanceId: this.workflowInstanceId,
    });
    if (res && res.errcode === 0) {
      this.isReturn();
    } else {
      this.$h3.toast.show({
        text: res.errmsg,
        iconType: "",
      });
    }
  }

  adjustmentOk(item: any) {
    this.participantors = item;
  }

  isReturn() {
    this.$h3.toast.show({
      text: "操作成功",
      iconType: "check",
    });
    setTimeout(() => {
      const url: any = this.$route.query.return;
      this.$router.push({ path: url + "?" + new Date().getTime() });
    }, 1000);
  }

  /**
   * 调整提交
   */
  ok() {
    switch (this.currentStatus) {
      case "1":
        this.forceFinishWorkflow();
        break;
      case "2":
        this.adjustCurrentParticipant();
        break;
      case "3":
        this.cancelWorkitems();
        break;
      case "4":
        this.jumpToActivity();
        break;
    }
  }

  onChange(e) {
    this.currentActivityCode = e.value;
  }

  async getLoadData() {
    const res: any = await workflowApi.getOpinionState({
      workflowInstanceId: this.workflowInstanceId,
      workitemId: this.workItemId,
    });
    if (res.errcode !== 0) {
      this.$h3.toast.show({
        text: res.errmsg,
        iconType: "close",
      });
      return;
    }
    this.loadData = res.data;

    /**
     * 处理当前处理人
     */
    if(this.loadData.activityCode && Array.isArray(this.loadData.logInfoList)){
      const activity = this.loadData.logInfoList.find(item=>item.activityCode===this.loadData.activityCode);
      if(activity){
        this.staff=[
           {
             id:activity.originator.id,
             name:activity.originator.name,
             username:activity.originator.name,
             type:3
           }
        ]
      }
    }
    this.participantors=[...this.staff];
  }

  async getListWorkflow() {
    const res: any = await workflowApi.getWorkflowNodes({
      workflowInstanceId: this.workflowInstanceId,
    });
    if (res.errcode === 0) {
      let optList = {};
      res.data.forEach((r: any) => {
        if (r.status === 0) {
          optList = {
            key: r.activityCode,
            value: r.activityCode,
            label: r.activityName,
          };
          this.options.push(optList);
        }
      });
      const status = res.data.filter((i: { status: any }) => i.status);
      if (status <= 0) {
      this.showOperat = false;
    }
    this.nodes=res.data;
    }
  }
  async getWorkflowBaseInfo() {
    const res: any = await workflowApi.getWorkflowBaseInfo({
      workflowInstanceId: this.workflowInstanceId,
    });
    if (res.errcode === 0) {
         let i18nData = new Map()
        .set("finishWorkflow", "cloudpivot.flow.pc.FinishWorkflow")
        .set("adjustOriginator", "cloudpivot.flow.pc.AdjustOriginator")
        .set("cancelAllTask", "cloudpivot.flow.pc.CancelAllTask")
        .set("activateNodes", "cloudpivot.flow.pc.ActivateNodes");
      this.formStatus.forEach((item,index) => {
        item.name = this.$t(`${i18nData.get(item.code)}`);
      });
      
      if(res.data.status!=='COMPLETED'){
        this.formStatus[0].show=true;
        if(this.showOperat){
           this.formStatus[1].show=true;
           this.formStatus[2].show=true;
        }
      }
      this.currentStatus=this.formStatus[0].status;
    }
  }

  created() {
    this.workflowInstanceId = this.$route.params.workflowInstanceId;
    this.workItemId = this.$route.query.workItemId as string;
    this.getLoadData();
    this.getListWorkflow();
    this.getWorkflowBaseInfo();

  }
}
</script>
<style lang='less' scoped>
@import "~@/styles/mixins.less";

.adjustment-box {
  width: 100vw;
  height: 100%;
}
.sub-title {
  width: 100%;
  .px2rem(height, 88px);
  .px2rem(padding-left, 30px);
  .px2rem(padding-right, 30px);
  color: #666;
  .px2rem(font-size, 30px);
  text-align: left;
  .px2rem(line-height, 88px);
}

.adjustment {
  width: 100%;
  background-color: #fff;
  .px2rem(padding-left, 30px);
  .px2rem(padding-right, 30px);
  li {
    height: auto;
    .px2rem(padding-top, 26px);
    .px2rem(padding-bottom, 26px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    border-bottom: 1px solid #f5f5f5;
    color: #333;
    .px2rem(font-size, 30px);
    .li-hint {
      width: 80%;
      text-align: left;
      color: #999;
      .px2rem(font-size, 24px);
      .px2rem(margin-top, 24px);
      line-height: 1.5em;
    }
  }
}
.cur-other {
  background-color: #fff;
}
.border-top {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  .px2rem(height, 88px);
  .border-top-btn {
    color: #2970ff;
    .px2rem(font-size, 30px);
  }
}
</style>