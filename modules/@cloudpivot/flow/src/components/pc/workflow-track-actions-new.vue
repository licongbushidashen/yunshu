<template>
<!-- 流程跟踪按钮新增流程运维-2021-12-10 -->
  <div class="options">
    <a-button
      v-if="headerAction.showEditable"
      @click="edit"
      type="primary"
    >{{ $t('cloudpivot.flow.pc.Edit') }}</a-button>
<!-- 
    <a-button
      v-if="headerAction.showAdjust"
      @click="adjustNode"
    >{{ $t('cloudpivot.flow.pc.AdjustNode') }}</a-button>

    <a-button v-if="headerAction.showCancel" @click="nullify">{{ $t('cloudpivot.flow.pc.Nullify') }}</a-button>

    <a-button
      v-if="headerAction.showRemove"
      @click="deleteForm"
    >{{ $t('cloudpivot.flow.pc.Delete') }}</a-button>

    <a-button
      v-if="headerAction.showEditOwner"
      @click="editOwner"
    >{{ $t('cloudpivot.flow.pc.EditOwner') }}</a-button> -->

    <!-- 流程运维 -->
    <template v-if="headerAction.showEditable || headerAction.showAdjust || headerAction.showCancel || headerAction.showRemove || headerAction.showEditOwner">
      <a-button @click="processOperationAndMaintenanceHandle">{{ $t('cloudpivot.flow.pc.ProcessOperationAndMaintenance') }}</a-button>
    </template>

    <a-button v-if="headerAction.showUserLog" @click="logs">{{ $t('cloudpivot.flow.pc.Logs') }}</a-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Button } from "@h3/antd-vue";
import confirm from "./confirm";
import { ConfirmOptions } from "./confirm/confirm";
import AdjusNodeModal from "./adjust-node-modal.vue";
import ModifyOwnerModal from "./modify-owner-modal.vue";
import { workflowApi, workflow, listApi } from "@cloudpivot/api";

@Component({
  name: "workflow-track-actions",
  components: {
    AButton: Button
  }
})
export default class WorkflowTrackActions extends Vue {

  @Prop() workflowInstanceId!: string; // 流程实例id

  @Prop() workItemId!: string; // 流程id

  @Prop({ default: () => { } }) headerAction!: workflow.HeaderAction; // 头部按键权限

  @Prop() currentActivityCode!: string; // 当前节点code

  @Prop() workflowState?: string;

  @Prop() workflowVersion!: number;
  @Prop() formVersion!:number;


  @Prop() isWORKFLOW_ADMIN!:boolean;
  @Prop() workflowAdminManageScopes!:string[];

  i18nData: any = {};

  destoryConfirm: any = {};

  flag: boolean = false;

  /*
    提交、暂存、驳回、作废 数据已经修改弹窗提示
  */ 
  popErr(res: any){
    let vm = this
    this.$confirm({
      content: res.errmsg + '将重新加载数据',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        vm.$emit('loadData')
      },
      onCancel() {
        console.log('Cancel');
      },
    });
    return false
  }

  processOperationAndMaintenanceHandle(){
    this.$emit('processOperationAndMaintenanceHandle')
  }

  /**
   * 编辑事件
   */
  edit() {
    this.$emit('edit');
  }

  /**
   * 作废事件
   */
  nullify() {
    const formOptions: ConfirmOptions = {
      title: `${this.$t('cloudpivot.flow.pc.Nullify')}`,
      content: `${this.$t('cloudpivot.flow.pc.NullifyTips')}`,
      ok: async () => {
        const res = await workflowApi.abortInstance(this.workflowInstanceId, this.workItemId, this.formVersion);
        if(res.errcode === 302036){
          return this.popErr(res)
        }
        this.$emit("loadData", res.data);
      },
      buttonsText: [`${this.$t('cloudpivot.flow.pc.Cancel')}`, `${this.$t('cloudpivot.flow.pc.OK')}`]
    };
    confirm(formOptions);
  }

  closePopDetail(){
    if(window.top !== window.self){
      window.parent.postMessage('close', '*')
    }
  }

  /**
   * 删除事件
   */
  deleteForm() {
    let self = this
    const formOptions: ConfirmOptions = {
      title: `${this.$t('cloudpivot.flow.pc.Delete')}`,
      content: (h: any) =>
        h("div", [
          `${this.$t('cloudpivot.flow.pc.DeleteTips1')}`,
          h(
            "span",
            {
              style: {
                color: "rgba(244, 69, 78, 1)"
              }
            },
            `${this.$t('cloudpivot.flow.pc.DeleteTips2')}`
          ),
          `${this.$t('cloudpivot.flow.pc.DeleteTips3')}`
        ]),
      ok: async () => {
        const res = await workflowApi.deleteInstance(this.workflowInstanceId, this.workItemId, this.formVersion);
        if (res.errcode === 0) {
          // this.$router.replace({ name: "shared-empty" });
          // 定义页签关闭前发出重载信号
          console.log(1111111111111);
          
          const url: any = this.$route.query.return;
          const opener = window.opener;
          window.onbeforeunload = () => {
            opener.postMessage(url, opener.location.href);
          };
          self.closePopDetail()
          window.close();
        } else if (res.errcode === 550006) {
          const msg = this.$t("cloudpivot.form.runtime.tip.errTips13").toString();
          this.$message.error(msg);
        } else {
          if(res.errcode === 302036){
            return this.popErr(res)
          }
          this.$message.error(res.errmsg as string);
        }
        

      },
      buttonsText: [`${this.$t('cloudpivot.flow.pc.Cancel')}`, `${this.$t('cloudpivot.flow.pc.OK')}`]
    };
    confirm(formOptions);
  }

  // 修改拥有者
  editOwner() {
    let i18nData = {
      selectOwner: `${this.$t('cloudpivot.list.pc.selectOwner')}`,
      ownerDepartment: `${this.$t('cloudpivot.list.pc.ownerDepartment')}`,
      modifyExplain: `${this.$t('cloudpivot.list.pc.modifyExplain')}`
    }
    const newLocale = this.$i18n.locale;
    const formOptions: ConfirmOptions = {
      title: `${this.$t('cloudpivot.list.pc.modifyOwner')}`,
      width: 520,
      content: (h: any) =>
        h(ModifyOwnerModal, {
          props: { i18nData: i18nData, newLocale }
        }),
      ok: (e: any, content: Vue) => {
        this.editOwnerHandle(content);
      },
      oKCallBack: (destory: any) => {
        if (destory) {
          this.destoryConfirm = destory;
        }
      },
      oKDestoryed: false,
      buttonsText: [`${this.$t('cloudpivot.flow.pc.Cancel')}`, `${this.$t('cloudpivot.flow.pc.OK')}`]
    };
    confirm(formOptions);
  }

  async editOwnerHandle(item: any) {
    if (item.owner.length === 0) {
      this.$message.error(this.$t('cloudpivot.list.pc.pleaseSelectOwner') as string);
      return
    }
    let source: any = {
      mobile: false,
      isSheet: true,
      schemaCode: this.$route.query.schemaCode,
      ownerId: item.owner[0].id,
      objectIds: [this.$route.query.objectId],
      ownerDeptId: item.departments,
      remark: item.remark
    }
    let res: any = await listApi.modifyOwner(source);
    if (res && res.errcode === 0) {
      this.$message.success(this.$t("cloudpivot.list.pc.modifySuccess") as string);
      setTimeout(() => {
        window.location.reload();
      }, 2000)

    } else {
      this.$message.error(res.errmsg);
    }
  }

  /**
   * 调整节点事件
   */
  adjustNode() {
    this.i18nData = {
      chooseAdjustType: `${this.$t('cloudpivot.flow.pc.ChooseAdjustType')}`,
      finishWorkflow: `${this.$t('cloudpivot.flow.pc.FinishWorkflow')}`,
      adjustOriginator: `${this.$t('cloudpivot.flow.pc.AdjustOriginator')}`,
      cancelAllTask: `${this.$t('cloudpivot.flow.pc.CancelAllTask')}`,
      activateNodes: `${this.$t('cloudpivot.flow.pc.ActivateNodes')}`,
      adjustNodeTips: `${this.$t('cloudpivot.flow.pc.AdjustNodeTips')}`,
      chooseNode: `${this.$t('cloudpivot.flow.pc.ChooseNode')}`,
      clickChoose: `${this.$t('cloudpivot.flow.pc.ClickChoose')}`,
      null: `${this.$t('cloudpivot.flow.pc.Null')}`,
      chooseHandler: `${this.$t('cloudpivot.flow.pc.ChooseHandler')}`,
      notNodeTips: `${this.$t('cloudpivot.flow.pc.notNodeTips')}`,
    };

    const formOptions: ConfirmOptions = {
      title: `${this.$t('cloudpivot.flow.pc.AdjustNode')}`,
      width: 552,
      content: (h: any) =>
        h(AdjusNodeModal, {
          props: {
            workflowInstanceId: this.workflowInstanceId,
            i18nData: this.i18nData,
            workflowState: this.workflowState
          }
        }),
      ok: (e: any, content: Vue) => {
        this.adjustNodeHandle(content);
        console.log("调整节点事件回调", e, content);
      },
      oKCallBack: (destory: any) => {
        if (destory) {
          this.destoryConfirm = destory;
        }
      },
      oKDestoryed: false,
      buttonsText: [`${this.$t('cloudpivot.flow.pc.Cancel')}`, `${this.$t('cloudpivot.flow.pc.OK')}`]
    };
    confirm(formOptions);
  }

  /**
   * 处理节点操作
   */
  async adjustNodeHandle(content: any) {
    
    if(content.value === 2){

      //单独针对异常流程处理
      if(!content.nodeName || content.nodeName.length<1){
        this.$message.error("请选择节点");
         return;
      } 
      const id  = content.nodeName.map((i: { id: any; }) => i.id);
      const newId = content.userValue.map((i: { id: any; }) => i.id);

      if(JSON.stringify(id) === JSON.stringify(newId)){
        this.$message.error('选择处理人已经是当前处理人了')
        return
      }

    }
    
    switch (content.value) {
      case 1:
        this.forceFinishWorkflow();
        break;
      case 2:
        this.adjustCurrentParticipant(content);
        break;
      case 3:
        this.cancelWorkitems(content);
        break;
      case 4:
        this.jumpToActivity(content);
        break;
      default:
        break;
    }
    if (content.value !== 2 && this.destoryConfirm.$destroy instanceof Function) {
      this.destoryConfirm.$destroy();
    }
  }

  /**
   * 提前结束流程
   */
  forceFinishWorkflow() {
    const formOptions = {
      title: `${this.$t('cloudpivot.flow.pc.FinishWorkflow')}`,
      content: `${this.$t('cloudpivot.flow.pc.FinishWorkflowTips')}`,
      ok: async () => {
        const res = await workflowApi.finishInstance(this.workflowInstanceId);
        if (res && res.errcode === 0) {
          this.$emit("loadData");
        } else {
          this.$message.error(res.errmsg as string)
        }
      },
      buttonsText: [`${this.$t('cloudpivot.flow.pc.Cancel')}`, `${this.$t('cloudpivot.flow.pc.OK')}`]
    };
    confirm(formOptions);
  }

  /**
   * 调整当前处理人
   */
  async adjustCurrentParticipant(content: any) {
    // 防止重复请求过多导致的报错
    if (this.flag) {
      return;
    }
    this.flag = true;
    let activityCode: string = this.currentActivityCode;
    if (typeof content.selectValue === 'string' && content.selectValue) {
      activityCode = content.selectValue;
    }



    const res = await workflowApi.adjustParticipantors({
      activityCode,
      participantors: content.userValue.map((u: any) => u.id),
      workflowInstanceId: this.workflowInstanceId
    });

    this.flag = false;

    if (res && res.errcode === 0) {
      this.$emit("loadData")
      if (this.destoryConfirm.$destroy instanceof Function) {
        this.destoryConfirm.$destroy();
      }
    } else {
      this.$message.error(res.errmsg as string)
    }
  }

  /**
   *  取消当前节点所有任务 
   */
  async cancelWorkitems(content: any) {
    let activityCode: string = this.currentActivityCode;
    if (typeof content.selectValue === 'string' && content.selectValue) {
      activityCode = content.selectValue;
    }
    const res = await workflowApi.cancelActivity({
      activityCode,
      workflowInstanceId: this.workflowInstanceId,
    });

    if (res && res.errcode === 0) {
      this.$emit("loadData")
    } else if(res.errcode === 10005){
       this.$message.error("请选择节点");
    } else {
      this.$message.error(res.errmsg as string)
    }
  }

  /**
   * 激活其他节点
   */
  async jumpToActivity(content: any) {
    const res = await workflowApi.activateActivity({
      activityCode: content.selectValue,
      workflowInstanceId: this.workflowInstanceId
    });

    if (res && res.errcode === 0) {
      this.$emit("loadData")
    } else if(res.errcode === 10005){ //TO 单独给异常流程做个提示语处理
        this.$message.error("请选择激活节点")
    } else {
      this.$message.error(res.errmsg as string)
    }
  }

  /**
   * 跳转日志
   */
  logs() {
    this.$emit('logs');
  }

}
</script>
<style lang="less">
.options {
  flex: 1 1;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  button {
    margin-left: @base4-padding-xs;
  }
}
</style>
