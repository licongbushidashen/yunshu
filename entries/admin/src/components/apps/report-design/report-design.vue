
<template>
  <div class="report-design">
    <div class="report-design__header">
      <router-link
        tag="i"
        :to="{ name: 'appitem',params: { appCode: appCode } }"
        class="icon aufontAll h-icon-all-arrow-left-o"
      ></router-link>
      <span>{{ title }}</span>
      <div class="report-design__header-right">
        <!-- 报表3.1.x版本以后已经不需要这个了 -->
        <!-- <span @click="syncDataSource">
          <i class="icon aufontAll h-icon-all-sync-o" :class="syncing ? 'syncing' : ''"></i>
          同步数据源
        </span>
        <a-divider type="vertical" /> -->
        <router-link
          tag="a"
          :to="{ name: 'ReportDataSourceList',params: { appCode: appCode, reportCode: reportCode} }"
        >
          <i class="icon aufontAll h-icon-all-logout-o"></i> 高级数据源
        </router-link>
      </div>
    </div>

    <div class="report-design__body">
      <h3-report-design-pro
        v-if="loaded"
        v-model="title"
        :class="['report-design__designer']"
        :reportId="objectId"
        :corpId="corpId"
        :config="config"
        :showAdvancedDataSource="true"
        :isAdmin="true"
        :isAddNew="isAddNew"
        :limit="{ list: { dimension: 50 } }"
      ></h3-report-design-pro>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { State, Action, namespace } from 'vuex-class';

import { DashboardPro } from '@h3/report';

import appsApi from '@/apis/apps';

import { LanguageTransform } from '@/utils';



const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: "report-design",
  components: {
    H3ReportDesignPro: DashboardPro
  },
})
export default class ReportDesign extends Vue {
  /* State */
  @AppCenterModule.State('appInfo') appInfo: any;

  /* Action */
  @AppCenterModule.Action('getAppDetail') getAppDetail: any;

  title = '';

  corpId = 'a';

  objectId = '';

  loaded = false;

  syncing: boolean = false;

  isAddNew: boolean = false;

  get reportCode() {
    return this.$route.params.reportCode;
  }

  get appCode() {
    return this.$route.params.appCode;
  }

  get token() {
    return localStorage.getItem('token')
  }

  get config() {
    return {
      token: this.token,
      reportCode: this.reportCode,
      appCode: this.appCode
    }
  }

  // reportLoaded() {

  // }

  load() {
    this.loaded = false;
    const closeLoad = (this.$message as any).loading();

    return appsApi.getAppReport({
      code: this.reportCode
    }).then((res: any) => {
      closeLoad();
      if (res.errcode === 0) {
        this.title = res.data.name;
        //  this.objectId = res.data.reportObjectId || '';
        this.isAddNew = !res.data.reportObjectId;  // 使用pro 新建时无reportId需要关联数据id
        this.objectId = res.data.reportObjectId || res.data.id || '';
      } else {
        this.$message.error(res.errmsg);
      }
    }, () => closeLoad()).finally(() => this.loaded = true);
  }

  getAppInfo() {
    if (this.appCode) {
      this.getAppDetail({
        appCode: this.appCode
      }).then(() => {
        const appName = LanguageTransform.getLang(this.appInfo.name, this.appInfo.name_i18n);
        document.title = appName + '-' + this.title;
      })
    }
  }

  /**
   * 同步数据源 全量
   * */
  async syncDataSource() {
    if (this.syncing) return;

    this.syncing = true;
    const res: any = await appsApi.syncDataSource();
    this.syncing = false;
    if (res.errcode === 0) {
      this.$message.success('同步成功');
    } else {
      this.$message.error('同步失败');
    }
  }

  mounted() {
    this.load().then(this.getAppInfo);
  }

}
</script>


<style lang="less" scoped>
@import "./report.less";

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.syncing {
  display: inline-block;
  animation: loading 1s infinite linear;
}
</style>