<template>
  <div class="workflow-empty">
    <div class="empty-box">
      <img src="../../../assets/images/empty-workflow.png" />
      <p>赶紧新建属于你的流程吧</p>
      <a-button type="primary" @click="isShowAddWorkflowModal = true">+ 新建流程</a-button>
    </div>

    <!-- 新建流程弹窗 -->
    <AddWorkflowModal
      v-model="isShowAddWorkflowModal"
      :data="curWorkflowData"
      :schemaCode="bizSchemaCode"
      @confirm="handleConfirmWorkflow"
      @cancel="handleCancelWorkflow"
    /> 
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

import AddWorkflowModal from '@/components/apps/modals/addWorkflow.vue';

import {
  State, Mutation, Action, namespace
} from 'vuex-class';

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'workflowEmpty',
  components: {
    AddWorkflowModal
  }
})
export default class WorkflowEmpty extends Vue {
  @WorkflowModule.Action('getWorkflowList') getWorkflowList: any;

  @WorkflowModule.State('workflowMenus') workflows: any;

  curWorkflowData: any = {};

  isShowAddWorkflowModal:boolean = false;

  get bizSchemaCode(){
    return this.$route.params.bizSchemaCode
  }


   handleConfirmWorkflow(workflowData: any) {
    this.isShowAddWorkflowModal = false;
    this.$router.push({
        name: 'workflowDesign',
        params: {
          workflowCode: workflowData.workflowCode
        }
      }).catch((err: any) => {err});
  }

  handleCancelWorkflow() {
    this.isShowAddWorkflowModal = false;
  }

    // 获取流程列表
  getWorkflows() {
    const params = {
      schemaCode: this.bizSchemaCode
    };
    this.getWorkflowList(params);
  }

}
</script>

<style lang="less" scoped>
@import "~styles/themes/index.less";
.workflow-empty {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  .empty-box {
    text-align: center;
    p {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
      margin: 16px 0;
    }
  }
}

</style>
