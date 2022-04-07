<template>
  <div class="top-header">
    <div class="header-left flex-center">
      <span>
        {{ `${workflowData.workflowName} - 运行` }}
      </span>
    </div>

    <div class="header-right flex-justify-between">
      <div class="close-mock" v-if="hideBtn" @click="closeMock">
        <i class="icon aufontAll h-icon-all-close"></i>
        <span>退出运行模式</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Action, Mutation, namespace } from 'vuex-class';
import workflow from '@/apis/workflow';

const AppItemModule = namespace('Apps/AppItem');

@Component({
  name: 'workflowMockHeader'
})

export default class workflowMockHeader extends Vue {
  @AppItemModule.Action('getWorkflowDetail') getWorkflowDetail: any;

  workflowCode: string = '';
  workflowData: any = {};

  get hideBtn() {
    return !(this.$route.query as any).hideBtn;
  }

  beforeMount() {
    if (this.$route.params && this.$route.params.workflowCode) {
      this.workflowCode = this.$route.params.workflowCode;
      const params = { workflowCode: this.workflowCode };
      this.getWorkflowDetail(params).then((res: any) => {
        if (res.errcode === 0) {
          this.workflowData = res.data;
        }
      });
    }
  }

  closeMock() {
    const { href } = this.$router.resolve({
      name: 'workflowDesign',
      params: {
        appCode: this.$route.params.appCode,
        bizSchemaCode: this.$route.params.bizSchemaCode,
        workflowCode: this.$route.params.workflowCode
      }
    });
    window.location.href = href;
  }
}
</script>


<style lang="less" scoped >
@import "~styles/themes/index.less";
.top-header {
  .header-right{
    position: absolute;
    top: 0;
    right: 24px;
    height: 64px;
    .close-mock{
      cursor: pointer;
      height: 36px;
      padding: 0 12px;
      line-height: 36px;
      text-align: center;
      border-radius: 4px;
      border: 1px solid #D9D9D9;
      color: #fff;
      font-size: 14px;
      i{
        font-size: 14px;
        margin-right: 8px;
        &:hover{
          color: #fff;
        }
      }
    }
  }
}
.header-left {
  position: absolute;
  top: 0;
  left: 24px;
  height: 100%;
  min-width: 170px;
  justify-content: flex-start;
  .icon {
    color: white;
    cursor: pointer;
  }
  span {
    font-size: 18px;
    color: #fff;
    .version {
      font-size: 14px;
      font-weight: normal;
    }
  }
}
</style>

