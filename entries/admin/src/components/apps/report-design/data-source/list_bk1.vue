<template>
  <div
    :class="[prefixCls, comPrefixCls, 'report-design']"
  >

    <div class="report-design__header">
      <router-link
        tag="i"
        :to="{ name: 'report-design',params: { appCode: appCode,reportCode: reportCode } }"
        class="icon aufontAll h-icon-all-arrow-left-o"
      ></router-link>
      <span>高级数据源</span>
    </div>

    <div class="report-design__body">
      <higher-data-source
        :corpId="corpId"
        :config="config"
      >
      </higher-data-source>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Mixins, Watch } from 'vue-property-decorator';
import { DataSource } from '@h3/report';
import ReportBase from '../report-base';
import higherDataSource from './higher-data-source.vue'

@Component({
  name: 'data-source-list',
  components: {
    DataSource,
    higherDataSource
  },
  beforeRouteUpdate(to, from, next) {
    const vm = this as DataSourceList;
    vm.$destroy();
    next();
  },

  beforeRouteLeave(to, from, next) {
    const vm = this as DataSourceList;
    vm.$destroy();
    next();
  }
})
export default class DataSourceList extends Mixins(ReportBase) {
  comPrefixCls = 'h3-report-app';

  prefixCls: string = 'h3-data-source-app';

  addDataSource () {
    console.log('addDataSource');
    this.$destroy();
    this.$router.push({ name: 'ReportDataSourceDesigner' }).catch((err: any) => {err});
  }

  editDataSource ({ objectId, groupId }) {
    console.log('editDataSource', objectId, groupId);
    this.$destroy();
    this.$router.push({ name: 'ReportDataSourceDesigner', query: { objectId, groupId } }).catch((err: any) => {err});
  }

  /**
   * changed by linxh@authine.com
   * description 监听返回按钮
  */

  back () {
    this.$destroy();

    
  }
}
</script>
<style lang="less" scoped>
@import '../report.less';
</style>