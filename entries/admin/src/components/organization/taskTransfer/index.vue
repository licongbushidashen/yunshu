<template>
  <div class="work-handover" :class="showHandlerTip && 'hasTip'">
    <div class="work-handover_tip" v-show="showHandlerTip">
      <a-alert
        message="后台已启动交接全部数据动作，完成后将通过消息通知你！"
        type="warning"
        closable
        showIcon
        :afterClose="hideTip"
      />
    </div>
    <div class="work-handover-tabs">
      <a-tabs defaultActiveKey="1">
        <a-tab-pane :tab="'待办任务'" key="1">
          <div class="tabs__wrap">
            <TodoTask :userid="userid"/>
          </div>
        </a-tab-pane>
        <a-tab-pane :tab="'应用数据'" key="2">
          <div class="tabs__wrap">
            <AppsData :userid="userid" @showTip="switchShowTip"/>
          </div>
        </a-tab-pane>

        <a-tab-pane v-if="curTab" :tab="'角色'" key="3">
          <div class="tabs__wrap">
            <Role :userid="userid" :corpid="corpid" @showTip="switchShowTip"/>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop
} from 'vue-property-decorator';
import TodoTask from './todoTask.vue';
import AppsData from './appsData.vue';
import Role from './role.vue';

@Component({
  name: 'TaskTransfer',
  components: {
    TodoTask,
    AppsData,
    Role
  }
})
export default class TaskTransfer extends Vue {
  @Prop() userid!: string;
  @Prop() corpid!: string;
  @Prop() curTab!: string;

  showHandlerTip: boolean = false;

  /**
   * 是否显示交接全部提示
   */
  switchShowTip(flag?: boolean) {
    this.showHandlerTip = !!flag;
  }
  /**
   * 关闭后重置变量
   */
  hideTip() {
    console.log('tip closed');
    this.showHandlerTip = false;
  }
}
</script>
<style lang="less" scoped>
  .work-handover{
    height: 100%;
    .work-handover_tip {
      max-height: 40px;
      overflow: hidden;
    }
    .work-handover-tabs{
      height: 100%;
    }
    /deep/.ant-tabs{
      height: 100%;
    }
    /deep/.ant-tabs-nav-wrap{
      margin: 0 24px;
    }
    .tabs__wrap{
      margin: 0 24px;
    }
    /deep/.ant-tabs-bar{
      margin-bottom: 16px !important;
    }

    &.hasTip {
      .work-handover-tabs {
        height: calc(100% - 40px);
      }
    }
  }
</style>
