<template>
  <div class="header common-header">
    <div class="logo" @click="goHome">
      <img :src="logo" alt />
      <a class="open-blank" v-if="isDingTalk" @click.prevent="openBlank"
        >在浏览器中打开</a
      >
    </div>

    <div class="header-right">
      <div class="menu">
        <ul>
          <application-header ref="applications" />
          <li>
            <a-dropdown :trigger="['click']">
              <div class="user-info">
                <div class="avatar-box">
                  <img
                    v-if="userInfo.imgUrl && userInfo.imgUrl.includes('http')"
                    :src="userInfo.imgUrl"
                  />
                  <img
                    v-else-if="userInfo.imgUrl"
                    :src="getDownloadUrl(userInfo.imgUrl)"
                  />
                  <!-- <img v-if="userInfo.imgUrl" :src="userInfo.imgUrl" /> -->
                  <i
                    v-else
                    class="icon aufontAll h-icon-all-normal_smile default-avatar"
                  ></i>
                  <!-- <a-icon v-else type="user" /> -->
                  <span>{{ userInfo.name }}</span>
                  <i class="icon aufontAll h-icon-all-caret-down"></i>
                </div>
              </div>
              <div class="info-box" slot="overlay">
                <ul>
                  <li class="user" @click="toUserInfo">
                    <div class="user-name">
                      <span>{{ userInfo.name }}</span>
                      <span class="mobile">{{ userInfo.mobile }}</span>
                    </div>
                  </li>
                  <li v-if="isAdmin">
                    <a @click="toAdmin">
                      <i class="icon aufontAll h-icon-all-disassembly-o"></i>
                      {{ $t("languages.common.backStageManager") }}
                    </a>
                  </li>
                  <!-- <li>
                    <a @click="toUserInfo">
                      <i class="icon aufontAll h-icon-all-team-singlechoice-o"></i>
                      {{ $t('languages.common.personalInfo') }}
                    </a>
                  </li> -->
                  <li v-if="isShowToggle">
                    <a @click="toggleLanguage" class="toggle-lang">
                      <i class="icon aufontAll h-icon-all-swap-o"></i>
                      {{ $t("languages.common.switch") }}
                      <span :class="$i18n.locale === 'zh' ? 'active' : ''"
                        >中</span
                      >
                      /
                      <span :class="$i18n.locale === 'en' ? 'active' : ''"
                        >En</span
                      >
                    </a>
                  </li>
                  <!-- <li v-if="isCloudPivot">
                    <a @click="showModal = true">
                      <i class="icon aufontAll h-icon-all-key-o"></i>
                      {{ $t('languages.common.changePwd') }}
                    </a>
                  </li> -->
                  <li v-if="isShowUpdatePwdBtn">
                    <a @click="showModal = true">
                      <i class="icon aufontAll h-icon-all-key-o"></i>
                      {{ $t("languages.common.changePwd") }}
                    </a>
                  </li>
                  <li>
                    <a href="https://www.yuque.com/skwme4" target="_blank">
                      <i
                        class="icon aufontAll h-icon-all-question-circle-o"
                      ></i>
                      {{ $t("languages.common.helpCenter") }}
                    </a>
                  </li>
                  <li v-if="!isDingTalk">
                    <a @click="logout">
                      <i class="icon aufontAll h-icon-all-poweroff-o"></i>
                      {{ $t("languages.common.exitSys") }}
                    </a>
                  </li>
                </ul>
              </div>
            </a-dropdown>
          </li>
        </ul>
      </div>
    </div>

    <!-- 修改密码 -->
    <a-modal
      v-model="showModal"
      :title="$t('languages.common.changePwd')"
      :width="422"
      :cancelText="$t('languages.common.cancel')"
      :okText="$t('languages.common.ok')"
      @ok="changePwd"
      @cancel="cancel"
      :maskClosable="false"
      :keyboard="false"
    >
      <a-row
        class="row-flex"
        :class="{ 'err-input': oldPwdErrTips }"
        type="flex"
      >
        <a-col class="required" :span="5">{{
          $t("languages.common.oldPwd")
        }}</a-col>
        <a-col :span="19">
          <a-input v-model="params.oldPwd" type="password" />
          <p class="err-tips" v-if="oldPwdErrTips">{{ oldPwdErrTips }}</p>
        </a-col>
      </a-row>
      <a-row
        class="row-flex"
        :class="{ 'err-input': newPwdErrTips }"
        type="flex"
      >
        <a-col class="required" :span="5">{{
          $t("languages.common.newPwd")
        }}</a-col>
        <a-col :span="19">
          <a-input v-model="params.newPwd" type="password" />
          <p class="err-tips" v-if="newPwdErrTips">{{ newPwdErrTips }}</p>
        </a-col>
      </a-row>
      <a-row class="row-flex" :class="{ 'err-input': surePwdErr }" type="flex">
        <a-col class="required" :span="5">{{
          $t("languages.common.surePwd")
        }}</a-col>
        <a-col :span="19">
          <a-input v-model="params.surePwd" type="password" />
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import Application from "@cloudpivot/application/pc";

import { Dropdown, Modal, Input, Row, Col } from "@h3/antd-vue";

import { Mutation, namespace } from "vuex-class";

import OAuthApi from "@/apis/oauth";

import env from "@/config/env";
import site from "@/config/site";

import axios from "axios";

const icon = require("@/assets/icons/appicon.svg");

const WorkflowCenterModule = namespace("WorkflowCenter/WorkflowCenter");

const SystemModule = namespace("System/System");

@Component({
  name: "common-header",
  components: {
    ADropdown: Dropdown,
    AModal: Modal,
    AInput: Input,
    ARow: Row,
    ACol: Col,
    ApplicationHeader: Application.ApplicationHeader
  }
})
export default class CommonHeader extends Vue {
  @WorkflowCenterModule.Mutation("setAsideTitle") setAsideTitle: any;

  @WorkflowCenterModule.Mutation("setUserId") setUserId: any;

  @SystemModule.State("isAdmin") isAdmin: any;

  @SystemModule.Mutation("setIsAdmin") setIsAdmin: any;

  @SystemModule.Mutation("setIsPrivilegedPerson") setIsPrivilegedPerson: any;

  @SystemModule.Mutation("setAdmin") setAdmin: any;

  @SystemModule.Mutation("setRootAdmin") setRootAdmin: any;

  @SystemModule.Mutation("setUserInfo") setUserInfo: any;

  get logo() {
    return site.logo;
  }

  get isShowToggle() {
    return this.$store.state.config.multiLanguageSwitch;
  }

  get isCloudPivot() {
    // 是否已打开内部维护组织开关
    return this.$store.state.config.cloudPivot;
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem("token");
  }

  // 只有自维护的用户并且不是admin这个账户才能有修改密码入口 #39826
  isShowUpdatePwdBtn: boolean = true;

  // 用户信息
  userInfo: any = {};

  showModal: boolean = false;

  params: any = {
    oldPwd: "",
    newPwd: "",
    surePwd: ""
  };

  oldPwdErrTips: string = "";

  newPwdErrTips: string = "";

  surePwdErr: boolean = false;

  created() {
    // 获取当前选中的菜单名称
    this.getUserInfo();
  }

  // 跳转到个人中心
  toUserInfo() {
    // window.location.href = '/user/info';
    this.$router.push("/user").catch((err: any) => {
      err;
    });
  }

  // 跳转后台管理
  toAdmin() {
    const token = localStorage.getItem("token");
    if (this.isDingTalk && token) {
      window.open(`${env.portalHost}/admin/?admin_token=${token}`, "_blank");
    } else {
      window.open(`${env.portalHost}/admin/`, "_blank");
    }
  }

  // 退出登录confirm
  logoutConfirm() {
    const vm = this;
    vm.$confirm({
      title: this.$t("languages.common.tip.sureToLogOut").toString(),
      okText: this.$t("languages.common.tip.confirm").toString(),
      cancelText: this.$t("languages.common.tip.cancel").toString(),
      onOk() {
        vm.logout();
      }
    });
  }

  // 退出登录
  logout() {
    const logoutIP = env.oauthHost;
    const redirectIP = env.redirectHost;
    const token: string = localStorage.getItem("token") || "";

    // window.location.href = `${logoutIP}/logout?redirect_uri=${redirectIP}/login&T=${token}`;

    OAuthApi.logout({
      redirect_uri: `${redirectIP}/login`,
      T: token
    }).then((res: any) => {
      // console.log(res);
      localStorage.removeItem("token");
      localStorage.removeItem("wydpet");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("expireTime");
      sessionStorage.removeItem("user");

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
        this.$router.replace({ name: "login" });
      }
    });
  }

  // 跳转到首页
  goHome() {
    const appCode = window.Environment ? window.Environment.appCode : null;
    if (appCode) {
      this.$router
        .push({
          name: "singleApp",
          params: {
            appCode
          }
        })
        .catch((err: any) => {
          err;
        });
    } else {
      this.$router.push({ name: "myUnfinishedWorkItem" }).catch((err: any) => {
        err;
      });
      // 如果回到首页, 重新调整顶部导航栏下的 slider
      (this.$refs.applications as any).initSlider();
    }
  }

  openBlank() {
    let href: any = location.href;
    let iframeAction: any = href.match(/%26iframeAction%3Ddetail/g);
    if (Array.isArray(iframeAction) && iframeAction.length > 1) {
      for (let i = 0; i < iframeAction.length - 1; i++) {
        href = href.replace("%26iframeAction%3Ddetail", "");
      }
    }

    const url = `${href}${
      href.indexOf("?") > -1 ? "&" : "?"
    }T=${localStorage.getItem("token")}`;

    window.open(url, "_blank");
  }

  // 获取当前用户信息
  async getUserInfo() {
    const res = await OAuthApi.getUserInfo();

    if (res.errcode === 0) {
      const info: any = res.data;
      this.userInfo = info;
      this.setUserId(info);
      this.isShowUpdatePwdBtn =
        (res.data.relatedSyncType === "PUSH" ||
          this.$store.state.config.loginType === 0 ||
          this.$store.state.config.loginType === 2) &&
        res.data.username !== "admin"; // admin这个账号 hide || 或者开启了账号密码登陆的时候
      sessionStorage.setItem("user", JSON.stringify(info));
      // if(localStorage.getItem('userId') && localStorage.getItem('userId') != JSON.parse(sessionStorage.getItem('user') || '').id) {
      //   localStorage.removeItem('daily');
      //   localStorage.removeItem('temp')
      // }
      if (localStorage.getItem("temp")) {
        let tempArr = JSON.parse(localStorage.getItem("temp") || "[]");
        if (tempArr > 2) {
          tempArr.shift();
        }
        localStorage.setItem("temp", JSON.stringify(tempArr));
      } else if (localStorage.getItem("daily")) {
        let dailyArr = JSON.parse(localStorage.getItem("daily") || "[]");
        if (dailyArr > 2) {
          dailyArr.shift();
        }
        localStorage.setItem("daily", JSON.stringify(dailyArr));
      }
      localStorage.setItem(
        "userId",
        JSON.parse(sessionStorage.getItem("user") || "").id
      ); //用户ID
      // 判断当前用户角色
      const isAppAdmin: boolean = info.permissions.includes("APP_MNG");
      const isSysAdmin: boolean = info.permissions.includes("SYS_MNG");
      const isRootAdmin: boolean = info.permissions.includes("ADMIN");
      const isAdmin: boolean = isAppAdmin || isSysAdmin || isRootAdmin;
      this.setIsAdmin(isAdmin);

      // 设置是否特权人
      const isWORKFLOW_ADMIN: boolean = info.permissions.includes(
        "WORKFLOW_ADMIN"
      );
      this.setIsPrivilegedPerson(isWORKFLOW_ADMIN);

      this.setRootAdmin(isRootAdmin);
      this.setAdmin(isSysAdmin || isRootAdmin);
      this.setUserInfo(info);
      // 禁止无权限访问流程查询页面
      if (
        !isSysAdmin &&
        !isRootAdmin &&
        this.$route.name &&
        ["queryInstance", "queryParticipantWorkItem"].includes(this.$route.name)
      ) {
        this.$router.replace({ name: "myUnfinishedWorkItem" });
      }
      // 禁止超管访问流程委托页面
      if (
        isRootAdmin &&
        this.$route.name &&
        ["delegationWorkflow"].includes(this.$route.name)
      ) {
        this.$router.replace({ name: "myUnfinishedWorkItem" });
      }
    }
  }

  getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if (this.token) {
      url += "&T=" + this.token;
    }
    return url;
  }

  /**
   * 切换多语言
   */
  toggleLanguage() {
    if (this.$i18n.locale === "zh") {
      this.$i18n.locale = "en";
    } else {
      this.$i18n.locale = "zh";
    }
    this.$forceUpdate();
    localStorage.setItem("locale", this.$i18n.locale);
  }

  /*
   * 修改密码
   */
  async changePwd() {
    this.resetErrTips();
    if (!this.params.oldPwd) {
      this.oldPwdErrTips = this.$t("languages.common.oldPwdRequied").toString();
      return;
    }
    if (!this.params.newPwd) {
      this.newPwdErrTips = this.$t("languages.common.newPwdRequied").toString();
      return;
    }
    if (this.params.newPwd !== this.params.surePwd) {
      this.surePwdErr = true;
      this.newPwdErrTips = this.$t("languages.common.newPwdNotSame").toString();
      return;
    }

    const params = {
      username: this.userInfo.username,
      corpId: this.userInfo.corpId,
      oldPassword: this.params.oldPwd,
      newPassword: this.params.newPwd
    };
    const res = await OAuthApi.changePassword(params);
    if (res.errcode) {
      this.$message.error(res.errmsg);
      return;
    }

    this.$message.success(`${this.$t("languages.common.changePwdSuccess")}`);
    this.logout();
  }

  /*
   * 重置密码错误提示
   */
  resetErrTips() {
    this.oldPwdErrTips = "";
    this.newPwdErrTips = "";
    this.surePwdErr = false;
  }

  cancel() {
    this.showModal = false;
    this.params = {
      oldPwd: "",
      newPwd: "",
      surePwd: ""
    };
    this.resetErrTips();
  }
}
</script>
<style lang="less" scoped>
@import "../../../styles/themes/default.less";
@menu-box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.1);
.common-header {
  height: 64px;
  padding: 0 @base4-padding-lg!important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @base4-padding-lg;
  box-shadow: @menu-box-shadow;
  .logo {
    margin-right: 10px;
    cursor: pointer;
    & > img {
      max-height: 30px !important;
    }
  }
  .header-right {
    .menu {
      height: 100%;
      ul {
        display: flex;
        align-items: center;
        margin: 0;
      }
    }
    .menu > ul > li {
      flex: none;
      margin-right: @base4-padding-lg * 2;
      &:last-of-type {
        margin-right: 0;
      }
      a {
        font-size: @font-size-14;
        color: @light-color-1;
        text-decoration: none;
        position: relative;
        display: block;
        line-height: 64px;
        span {
          max-width: 7em;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        &:hover {
          color: @primary-color;
        }
        &.router-link-active {
          color: @primary-color;
          &::after {
            content: "";
            display: block;
            position: absolute;
            left: -7px;
            bottom: 1px;
            width: calc(100% + 14px);
            height: 3px;
            border-radius: 2px;
            background: @primary-color;
          }
        }
      }
      &.more {
        position: relative;
        height: 64px;
        width: 33px;
        margin-right: 20px;
        cursor: pointer;
        .icon {
          display: block;
          height: 100%;
          line-height: 64px;
          color: @light-color-3;
          &.active {
            color: @primary-color;
            //   &::after {
            //   content: '';
            //   display: block;
            //   position: absolute;
            //   left: -7px;
            //   width: 100%;
            //   height: 3px;
            //   border-radius: 2px;
            //   background: @primary-color;
            // }
          }
        }
        &.active {
          color: @primary-color;
          &::after {
            content: "";
            display: block;
            position: absolute;
            left: -7px;
            width: calc(100% + 14px);
            height: 3px;
            border-radius: 2px;
            background: @primary-color;
          }
        }
      }
      & > .user-info {
        position: relative;
        display: flex;
        align-items: center;
        height: 64px;
        cursor: pointer;
        &::before {
          content: "";
          display: block;
          width: 1px;
          height: 30px;
          background-color: rgba(234, 237, 243, 1);
          position: absolute;
          left: -20px;
          top: 17px;
        }
        .avatar-box {
          & > img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
          }
          & > span {
            padding-left: 8px;
            color: rgba(0, 0, 0, 0.85);
          }
          & > .icon {
            margin-left: 5px;
            display: inline-block;
            vertical-align: middle;
            font-size: 14px;
            color: #8c8c8c;
            &.default-avatar {
              color: #fff;
              width: 32px;
              height: 32px;
              line-height: 32px;
              border-radius: 50%;
              font-size: 32px;
              text-align: center;
              color: #ffb131;
            }
            &.h-icon-all-caret-down {
              transform: scale(0.7);
            }
          }
        }
      }
    }
  }
}
.info-box {
  background-color: white;
  text-align: left;
  box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.15);
  border-radius: @border-radius-lg;
  & > ul > li {
    padding: 5px @base10-padding-md;
    &.user {
      cursor: pointer;
      border-bottom: 1px solid @base-border-color;
      &::before {
        display: none;
      }
    }
    & > .user-name {
      text-align: left;
      span {
        display: block;
        color: @light-color-1;
        &.mobile {
          color: @light-color-3;
          &::before {
            display: none;
          }
        }
      }
    }
    a {
      color: @light-color-1;
      & > .icon {
        margin-right: 8px;
      }
    }
    &:hover {
      background-color: rgba(240, 247, 255, 1);
    }
  }
  .toggle-lang {
    & span.active {
      color: @primary-color;
    }
  }
}
.row-flex {
  margin-bottom: 16px;
  align-items: center;
  &:last-child {
    margin-bottom: 0;
  }
  &.err-input {
    position: relative;
    margin-bottom: 24px;
    /deep/ .ant-input {
      border-color: #f5222d !important;
      &:focus {
        box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
      }
    }
    .err-tips {
      font-size: 12px;
      color: #f5222d;
      text-align: left;
      line-height: 20px;
      position: absolute;
      top: 32px;
      left: 8px;
    }
  }
  .required {
    position: relative;
    &:before {
      content: "*";
      color: @error-color;
      position: absolute;
      left: -0.5em;
    }
  }
}
</style>
