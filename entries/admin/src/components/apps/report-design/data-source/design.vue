<template>
  <div :class="[prefixCls, comPrefixCls, 'report-design']">

    <div class="report-design__header">
      <router-link
        tag="i"
        :to="{ name: 'ReportDataSourceList',params: { appCode: appCode,reportCode: reportCode } }"
        class="icon aufontAll h-icon-all-arrow-left-o"
      ></router-link>
      <span>数据源设计</span>
    </div>

    <div class="report-design__body">
      <h3-data-source-designer
        ref="design"
        v-model="dataSourceTitle"
        :class="[`${comPrefixCls}__main`]"
        :corpId="corpId"
        :config="config"
        :needLimit="false"
        :groupId="groupId"
        :dataSourceId="dataSourceId"
        @change-title="changeTitle"
        @change-status="changeStatus"
      />
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Mixins, Vue } from 'vue-property-decorator';
import { DataSource } from '@h3/report';
import { Modal } from '@h3/antd-vue';
import ReportBase from '../report-base';

@Component({
  name: 'h3-data-source-list',
  components: {
    H3DataSourceDesigner: DataSource.Designer,
  },
  beforeRouteUpdate(to, from, next) {
    const vm = this as DataSourceDesigner;
    vm.confirmSave().then(
        () => {
          vm.$destroy();
          next();
        },
        () => {
          next(false);
        }
      );
  },

  beforeRouteLeave(to, from, next) {
    const vm = this as DataSourceDesigner;
    vm.confirmSave().then(
        () => {
          vm.$destroy();
          next();
        },
        () => {
          next(false);
        }
      );
  }
})
export default class DataSourceDesigner extends Mixins(ReportBase) {
  comPrefixCls = 'h3-report-app';

  prefixCls: string = 'h3-data-source-app';

  dataSourceTitle: string = '未命名的数据源';

  get groupId(){
    return this.$route.query.groupId;
  }

  get dataSourceId(){
    return this.$route.query.objectId;
  }

  isEdit: boolean = false;
  /**
   * changed by linxh@authine.com
   * description 监听返回按钮
  */
  confirmSave () {
    return new Promise((resolve, reject) => {
    let self = this;
    if(this.isEdit) {
      Modal.confirm({
        title: '返回提示',
        content: '内容已更改，是否需要保存',
        okText: '保存',
        okType: 'danger',
        cancelText: '暂不保存',
        onOk() {
          (self.$refs.design as any).save();
          resolve();
        },
        onCancel(){
          resolve()
        }
      });
    } else {
      resolve();
    }
    });
  }
  /**
   * 改变状态
   */
  changeStatus(status: string) {
    this.isEdit = (status  === 'edit');
  }

  /**
   * 修改高级数据源标题
   * @param title
   */
  changeTitle (title: string) {
    this.dataSourceTitle = title;
  }

}
</script>
<style lang="less" scoped>
@import '../report.less';
</style>