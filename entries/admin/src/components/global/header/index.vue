<template>
  <header class="header-top" v-if="currentHeader">
    <!-- 左侧动态模块 -->
    <component :is="currentHeader" />
    <div class="header-tips" v-if="showTips">
      <div class="header-tips-content"></div>
      <i class="icon aufontAll h-icon-all-exclamation-circle"></i>
      <span>{{ tipText }}</span>
    </div>
    <!-- 右侧静态模块 -->
    <div
      v-if="!hiddenRight.includes(currentHeader)"
      class="header-right flex-justify-between"
    >
      <!-- <span class="market-entrance" @click="onRouteToMarket" v-if="marketPortalSwitch">应用市场</span> -->
      <a-tooltip placement="topLeft">
        <template slot="title"
          >帮助中心</template
        >
        <div>
          <a href="https://www.yuque.com/skwme4" target="_blank">
            <img src="@/assets/images/question-circle-o.svg" />
          </a>
        </div>
      </a-tooltip>
      <div class="user-info">
        <a-dropdown :trigger="['click']">
          <a class="ant-dropdown-link">
            <a-avatar
              v-if="
                loginedUserInfo.imgUrl &&
                  loginedUserInfo.imgUrl.includes('http')
              "
              :src="loginedUserInfo.imgUrl"
            />
            <a-avatar
              v-else-if="loginedUserInfo.imgUrl"
              :src="getDownloadUrl(loginedUserInfo.imgUrl)"
            />
            <!-- <a-avatar v-if="loginedUserInfo.imgUrl" :src="loginedUserInfo.imgUrl"></a-avatar> -->
            <i
              v-else
              class="icon aufontAll h-icon-all-normal_smile default-avatar"
            ></i>
            <span class="login-name">{{ loginedUserInfo.name }}</span>
            <i class="icon aufontAll h-icon-all-down-o" />
          </a>
          <a-menu slot="overlay" class="header-dropdown">
            <a-menu-item class="nocursor">
              <p>{{ loginedUserInfo.name }}</p>
              <p>{{ loginedUserInfo.mobile }}</p>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item>
              <a @click="toProtal">
                <i class="icon aufontAll h-icon-all-warehouse-o"></i>
                <span class="header-menu-content">{{
                  $t("languages.PortalManager")
                }}</span>
              </a>
            </a-menu-item>
            <!-- <a-menu-item>
              <a href="javascript:;" @click="userDetail">
                <i class="icon aufontAll h-icon-all-user-o"></i>
                <span class="header-menu-content">{{ $t('languages.PersonalInformation') }}</span>
              </a>
            </a-menu-item>-->
            <!-- 修改密码 -->
            <a-menu-item v-if="loginedUserInfo.username === 'admin'">
              <a @click="changePwd">
                <i class="icon aufontAll h-icon-all-form-o"></i>
                <span class="header-menu-content">{{
                  $t("languages.ChangePwd")
                }}</span>
              </a>
            </a-menu-item>

            <a-menu-item v-if="isShowToggleLanguage">
              <a @click="toggleLanguage" class="toggle-lang">
                <i class="icon aufontAll h-icon-all-swap-o"></i>
                <span class="header-menu-content">{{
                  $t("languages.Switch")
                }}</span>
                <span :class="$i18n.locale === 'zh' ? 'active' : ''">中</span> /
                <span :class="$i18n.locale === 'en' ? 'active' : ''">En</span>
              </a>
            </a-menu-item>
            <a-menu-item>
              <a @click="exit">
                <i class="icon aufontAll h-icon-all-logout-o"></i>
                <span class="header-menu-content">{{
                  $t("languages.Exit")
                }}</span>
              </a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
    <!-- <div class="tips" v-if="visible">
      <a-alert
        v-if="visible"
        banner
        showIcon
        :message="tipMsg"
        type="warning"
        closable
        :afterClose="handleClose"
      />
    </div>-->
    <a-modal
      v-model="visible"
      :width="566"
      style="top: 68px;"
      wrapClassName="i18n-tips"
      :title="$t('languages.Prompt')"
      :maskClosable="false"
      :closable="true"
      :footer="null"
    >
      <div class="i18n-tips_content">
        <header>
          <i class="icon aufontAll h-icon-all-exclamation-circle-o" />
          <span
            >已切换到【{{ $i18n.locale === "zh" ? "中文" : "英文" }}模式】</span
          >
        </header>
        <article>
          <aside>
            应用名称、应用下的分组名称、模型名称、模型设计区名称（包括表单控件名称、流程节点名称、流程名称、表单名称、列表展示字段、查询条件名称、操作按钮名称等）
          </aside>
          <p>
            以上设置在编辑后将保存为{{
              $i18n.locale === "zh" ? "中文" : "英文"
            }}名称
          </p>
        </article>
      </div>
      <img class="i18n-tips_gif" src="@/assets/images/i18n-guide.gif" />
      <div class="i18n-tips_button">
        <a-button type="primary" @click="handleClose">{{
          $t("languages.Apps.DeleteOk")
        }}</a-button>
      </div>
    </a-modal>

    <EditUser v-model="showEditUser"></EditUser>
  </header>
</template>

<script lang="ts">
import axios from "axios";
import { Component, Vue, Watch } from "vue-property-decorator";
import { State, namespace, Action } from "vuex-class";
import * as OrgApi from "@/apis/organization";
import systemApi from "@/apis/system/system-manager.api";
import { commonApi } from "@cloudpivot/api";
import OAuthApi from "@/apis/oauth";
import DefaultHeader from "./defaultHeader.vue";
import DataModelHearder from "./datamodelheader.vue";
import AppHeader from "./appHeader.vue";
import WorkflowSettingHeader from "./workflowSettingHeader.vue";
import WorkflowMockHeader from "./workflowMockHeader.vue";
import SettingsHeader from "./settingsHeader.vue";
import EditUser from "../modal/edit-user.vue";
import FormHistory from "./formHistory.vue";
import FormHistoryDetail from "./history.vue";

import env from "@/env.ts";

const UserModule = namespace("System/User");

@Component({
  name: "HeaderBar",
  components: {
    DefaultHeader,
    AppHeader,
    DataModelHearder,
    WorkflowSettingHeader,
    WorkflowMockHeader,
    SettingsHeader,
    EditUser,
    FormHistory,
    FormHistoryDetail
  }
})
export default class HeaderBar extends Vue {
  @UserModule.State("loginedUserInfo") loginedUserInfo!: any;

  @UserModule.Action("getUserInfo") getUserInfo!: any;

  currentHeader: string = "";

  showTips: boolean = false;

  licenseDate: number = 31;

  visible: boolean = false;

  showEditUser: boolean = false;

  tipMsg: string = "";

  hiddenRight: string[] = ["WorkflowMockHeader"];

  marketPortalSwitch: boolean = true; //应用市场入口配置开关

  get isShowToggleLanguage() {
    return this.$store.state.config.multiLanguageSwitch;
  }

  get tipText() {
    const licenseDate = this.licenseDate;
    return licenseDate <= 0
      ? `您的License已过有效期，请联系管理员续期`
      : `您的license有效期剩余${licenseDate}天， 请联系管理员续期！`;
  }

  mounted() {
    this.getUserInfo();
    this.getLicenseExpired();
    this.watchLocalLangChange();
    //获取应用市场入口配置开关
    let windowConfig = (window as any).config;
    console.log("windowConfig", windowConfig);
    //应用市场开关默认为开启状态
    if (
      windowConfig.marketPortalSwitch === false ||
      windowConfig.marketPortalSwitch === "false"
    ) {
      this.marketPortalSwitch = false;
    }
  }

  /**
   * 监听本地语言包变量变化
   */
  watchLocalLangChange() {
    const vm: any = this;
    window.addEventListener("storage", e => {
      console.log("local changed: ", e);
      if (e.key === "locale") {
        const lang: any = e.newValue;
        if (lang !== vm.$i18n.locale) {
          vm.$i18n.locale = lang;
        }
      }
    });
  }

  getLicenseExpired() {
    systemApi.getLicenseExpired().then((res: any) => {
      if (!res.errcode && res.data) {
        this.licenseDate = res.data.remainingDays;
        if (this.licenseDate <= 30) {
          this.showTips = true;
        } else {
          this.showTips = false;
        }
      }
    });
  }

  // 查看个人信息
  userDetail() {}

  // 跳转到门户
  toProtal() {
    const token = localStorage.getItem("token");
    if (token) {
      const redirectIP = env.portalHost;
      window.open(`${redirectIP}`, "_blank");
    }
  }

  // 修改密码
  changePwd() {
    this.showEditUser = true;
  }

  // 切换语言
  toggleLanguage() {
    if (this.$i18n.locale === "zh") {
      this.$i18n.locale = "en";
    } else {
      this.$i18n.locale = "zh";
    }
    this.$forceUpdate();
    localStorage.setItem("locale", this.$i18n.locale);
    this.showLangTip();
    //  window.location.reload();
  }

  showLangTip() {
    // if (this.$i18n.locale === 'zh') {
    //   this.tipMsg = '已经切换到中文编辑模式，您设置的应用名称、模型分组名称、模型名称、自定义页面名称以及模型设计区（数据模型、表单设计、流程设计、列表设计）的名称将保存为中文名称！';
    // } else {
    //   this.tipMsg = 'Have changed to English Edit Mode,the names of these area will be saved to English Mode, such as Apps name, model name, model group name, customize page name, and model design area(Data Model, Form design, Workflow design, List Design).';
    // }
    this.visible = true;
  }

  handleClose() {
    this.visible = false;
  }

  // 退出登录
  exit() {
    const redirectIP = env.portalHost;
    let redirectUrl = `${redirectIP}/login`;

    OAuthApi.logout({
      redirect_uri: redirectUrl,
      T: this.token as string
    }).then((res: any) => {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("expireTime");
      sessionStorage.removeItem("user");
      localStorage.removeItem("syncTaskId");
      localStorage.removeItem("orgPartSync");
      let oauthst = window.location.href;
      if (oauthst.indexOf("-test") > -1) {
        window.wyml = {
          wyml: {
            ID: "913bf547-fda9-4c4d-afb6-ec58ab4e3bf4",
            secret: "S7NoMjUwMjIwMjIxNTM5NDg3NjgeiZ",
            url: "https://onekey-test.zhejianglab.com/maxkey"
          },
          // 领导组
          ldroleId: "督办领导组(勿删勿改)",
          // 督查督办管理员
          glyId: "督办管理员(勿删勿改)"
        };
      } else {
        window.wyml = {
          wyml: {
            ID: "ba59c997-fa3a-40fe-b9cf-208d9dbeabc6",
            secret: "KTWvMjUwMjIwMjIxNTMzMTYyMDE1NF",
            url: "https://onekey.zhejianglab.com/maxkey"
          },
          // 领导组
          ldroleId: "督办领导组(勿删勿改)",
          // 督查督办管理员
          glyId: "督办管理员(勿删勿改)"
        };
      }
      if (window.location.href.indexOf("test") == -1) {
        axios
          .post(
            `/maxkey/maxkey/authz/cas/logout/${
              window.wyml.wyml.ID
            }?globalSessionId=${localStorage.getItem("globalSessionId")}`
          )
          .then(res => {
            localStorage.removeItem("token");
            localStorage.removeItem("wydpet");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("expireTime");
            sessionStorage.removeItem("user");
            window.location.href = `${
              window.wyml.wyml.url
            }/oauth/v20/authorize?response_type=code&client_id=${
              window.wyml.wyml.ID
            }&scope=all&redirect_uri=${window.location.href.split("?")[0]}`;
          });
      } else {
        window.location.href = redirectUrl;
      }
    });
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem("token");
  }

  getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if (this.token) {
      url += "&T=" + this.token;
    }
    return url;
  }

  @Watch("$route")
  onRouteChange() {
    // console.log('123132123', this, this.$route.name);
    switch (this.$route.name) {
      case "appSettings":
      case "baseSetting":
      case "permissionSetting":
      case "packageSetting":
        this.currentHeader = "SettingsHeader";
        break;

      case "appitem":
      case "appsettings":
        this.currentHeader = "AppHeader";
        break;

      case "dataModel":
      case "busRules":
      case "dataPermission":
      case "dataRuleCalculation":
      case "list-design":
      case "form-design":
      case "workflowDesign":
      case "workflowEmpty":
      case "biz-rule":
      case "dispatcher":
        this.currentHeader = "DataModelHearder";
        break;

      case "form-preview":
      case "list-preview":
      case "permission":
      case "report-design":
        break;

      case "workflowSetting":
        this.currentHeader = "WorkflowSettingHeader";
        break;
      case "mockForm":
      case "mockDetail":
      case "mockHistory":
        this.currentHeader = "WorkflowMockHeader";
        break;
      case "versionList":
        this.currentHeader = "FormHistory";
        break;
      case "versionDetail":
        this.currentHeader = "FormHistoryDetail";
        break;

      default:
        this.currentHeader = "DefaultHeader";
        break;
    }
  }

  /**
   * 跳转至应用市场首页
   */
  onRouteToMarket() {
    let windowConfig = (window as any).config;
    console.log("windowConfig", windowConfig);
    if (!windowConfig.marketPortalHost) {
      return;
    }
    console.log(windowConfig.marketPortalHost);
    window.open(`${windowConfig.marketPortalHost}`, "_blank");
  }
}
</script>

<style lang="less" scoped>
.header-top {
  background: #052535;
  & > div {
    height: 64px;
    &.ant-alert {
      height: auto;
      position: absolute;
      width: 100%;
    }
  }
  .header-right {
    position: absolute;
    top: 0;
    right: 24px;
    .market-entrance {
      color: #fff;
      cursor: pointer;
    }
    .market-entrance:hover {
      color: #17bc94;
    }
    & > div {
      margin-left: 24px;
      img {
        width: 20px;
        height: 20px;
      }
      i {
        margin-left: 12px;
        font-size: 10px;
        color: #fff;
      }
      span {
        margin-left: 8px;
      }
      & .default-avatar {
        display: inline-block;
        vertical-align: middle;
        font-size: 32px;
        line-height: 32px;
        color: #7165ff;
      }
      & .login-name {
        color: #fff;
        font-size: 14px;
        margin-left: 12px;
      }
    }
  }
  .header-tips {
    height: 64px;
    position: absolute;
    top: 0;
    right: 285px;
    .header-tips-content {
      width: 196px;
      height: 44px;
      margin-top: 10px;
      padding: 0 10px;
      background: @primary-color;
      border-radius: 4px;
      transform: skewX(10deg);
    }
    i {
      font-size: 14px;
      color: #fff;
      margin-right: 8px;
      position: absolute;
      top: 14px;
      left: 8px;
    }
    span {
      position: absolute;
      font-family: PingFangSC-Regular;
      top: 14px;
      color: #fff;
      font-size: 12px;
      text-align: left;
      left: 30px;
    }
  }
  .tips {
    width: 616px;
    position: fixed;
    right: 50%;
    margin-right: -313px;
    top: 68px;
    z-index: 800;
    .ant-alert {
      text-align: left;
    }
  }
}
.header-menu-content {
  margin-left: 8px;
}
.header-dropdown {
  margin-top: 24px;
  min-width: 160px;
  .nocursor:hover {
    background: none;
    cursor: default;
  }
}
.toggle-lang {
  & span.active {
    color: @primary-color;
  }
  .header-menu-content {
    margin-right: 8px;
  }
}
</style>
<style lang="less">
.i18n-tips {
  .ant-modal-body {
    padding-top: 16px;
    // padding-bottom: 24px;
  }
  &_content {
    margin-bottom: 16px;
    header {
      height: 24px;
      line-height: 24px;
      span {
        display: inline-block;
        vertical-align: top;
        font-weight: bold;
      }
    }
    i {
      display: inline-block;
      margin-right: 14px;
      width: 24px;
      height: 24px;
      font-size: 24px;
      color: @warning-color;
    }
    article {
      margin-top: 10px;
      margin-bottom: 12px;
      padding: 6px 10px 4px 12px;
      border: 1px solid #ffe58f;
      border-radius: 4px;
      background-color: #fffbe6;
      aside {
        font-size: 12px;
        line-height: 22px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.65);
      }
      p {
        font-size: 14px;
        line-height: 24px;
        color: #000;
      }
    }
  }
  &_gif {
    display: block;
    max-width: 490px;
    margin: auto;
    height: auto;
    object-fit: contain;
  }
  &_button {
    margin-top: 24px;
    text-align: right;
  }
}
</style>
