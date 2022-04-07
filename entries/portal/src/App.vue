<template>
  <a-config-provider :locale="locale">
    <div id="app" :class="{ ie: isIe }">
      <router-view class="bpm-container" />
    </div>
  </a-config-provider>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { ConfigProvider } from "@h3/antd-vue";

import OAuthApi from "@/apis/oauth";

import env from "@/config/env";

import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";

import app from "@cloudpivot/common/src/constants/globalApplication";

import "moment/locale/zh-cn";

@Component({
  components: {
    AConfigProvider: ConfigProvider
  }
})
export default class App extends Vue {
  get locale() {
    switch (this.$i18n.locale) {
      case "zh":
      default:
        // return require('@h3/antd-vue/lib/locale-provider/zh_CN');
        return zhCN;

      case "en":
        // return require('@h3/antd-vue/lib/locale-provider/en_US');
        return enUS;
    }
  }

  get isIe() {
    if (window.Environment && window.Environment.isIe !== undefined) {
      return window.Environment.isIe;
    }
    return false;
  }

  async mounted() {
    const config = await OAuthApi.getSystemConfig();
    if (config) {
      config.apiHost = env.apiHost;
      this.$store.commit("setConfig", config);
    }
    app.errorManager.getErrorCode();
  }
}
</script>

<style>
.ant-calendar-range-middle {
  padding: 0 !important;
}
</style>
