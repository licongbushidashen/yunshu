<template>
  <div class="integration-panel">
    <a-tabs v-model="currentTab" @change="toggleTab">
      <a-tab-pane :tab="'集成服务'" :key="tabs[0]">
        <integration class="panel-wrap"/>
      </a-tab-pane>
      <a-tab-pane :tab="'数据源'" :key="tabs[1]">
        <sqlpool class="panel-wrap"/>
      </a-tab-pane>
      <a-tab-pane :tab="'报表高级数据源'" :key="tabs[2]">
        <outdatasource class="panel-wrap"/>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name:"integration-panel",
  components: {
    integration: () => import('./integration/index.vue'),
    sqlpool: () => import('./sql-pool/index.vue'),
    outdatasource: () => import('./outdatasource/index.vue'),
  }
})
export default class IntegrationPanel extends Vue {
  
  tabs: string[] = [
    'integration',
    'connections',
    "outdatasource"
  ];

  currentTab: string = '';

  toggleTab() {
    sessionStorage.setItem('intergrationTab',this.currentTab);
  }

  mounted() {
    const tab = sessionStorage.getItem('intergrationTab');
    if (tab) {
      this.currentTab = tab;
    } else {
      this.currentTab = this.tabs[0];
    }
  }

}
</script>
<style lang="less" scoped>
.integration-panel {
  text-align: left;
  .panel-wrap {
    height: 100%;
  }
  /deep/.ant-tabs {
    overflow: hidden;
    height: calc(100vh - 64px);
  }
  /deep/.ant-tabs-bar {
    margin: 0;
  }
  /deep/.ant-tabs-content {
    height: 100%;
  }
  /deep/.ant-tabs-nav {
    margin: 0 24px;
  }
  /deep/.ant-table-body,
  /deep/.ant-table-header {
    &::-webkit-scrollbar {
      width: 0;
    }
  }
}
</style>
