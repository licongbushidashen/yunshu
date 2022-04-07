<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-27 10:23:06
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-11-30 10:47:07
-->
<template>
  <!-- <a-config-provider :getPopupContainer="getPopupContainer"> -->
  <a-config-provider :locale="locale">
    <div id="app">
      <div v-show="!switchHeader" class="head-wrap">
        <Header />
      </div>
      <div v-show="switchHeader">
      </div>
      <router-view :class="{ 'container' : !this.$route.fullPath.includes('pre-view') }" />
    </div>
  </a-config-provider>
  <!-- </a-config-provider> -->
</template>

<script lang="ts">
// eslint-disable-next-line
import { Component, Vue, Watch } from "vue-property-decorator";
// eslint-disable-next-line
import { Getter } from "vuex-class";
// eslint-disable-next-line
import { Route } from "vue-router";
// eslint-disable-next-line
import { ConfigProvider } from '@h3/antd-vue';

import Header from "./components/global/header/index.vue";

import OAuthApi from "@/apis/oauth";
import app from "@cloudpivot/common/src/constants/globalApplication"

import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";
import 'moment/locale/zh-cn';

@Component({
  name: "apps",
  components: {
    Header,
    AConfigProvider: ConfigProvider
  },
})
export default class Apps extends Vue {
  //@Getter('getAntLocale') locale!: string;
  switchHeader: boolean = false;
  get locale() {
    switch (this.$i18n.locale) {
      case "zh":
      default:
        return zhCN;

      case "en":
        return enUS;
    }
  }

  async mounted() {
    // 获取配置文件
    const config = await OAuthApi.getSystemConfig();
    if (config) {
      this.$store.commit("setConfig", config);
    }
    app.errorManager.getErrorCode();
  }

  @Watch("$route")
  routeChange(n: Route, o: Route) {
    // eslint-disable-next-line
    n.fullPath.includes("print-template") || n.fullPath.includes("pre-view")
      ? (this.switchHeader = true)
      : (this.switchHeader = false);
  }
}
</script>

<style>
 .ant-calendar-range-middle{
   padding: 0!important;
 }
</style>
