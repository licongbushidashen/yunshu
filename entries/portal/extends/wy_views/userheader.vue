<template>
  <div class="wy_header">
    <div>
      <img
        style="position: relative;    top: -2px;height:70px"
        src="../views/logo.png"
        alt=""
      />
      <h1
        style="    vertical-align: sub;
    display: inline-block;"
      >
        之江实验室督查督办系统
      </h1>
    </div>
    <div class="wy_header_info">
      <h2 :class="flag == 0 ? 'active' : ''" @click="lrouter(0)">
        <img
          src="./icon/待办.svg"
          alt=""
          style="    margin-left: 30px;    width: 38px;    object-fit: scale-down;    height: 28px;"
        />
        <span
          v-if="$store.state.wynum > 0"
          style="background: rgb(186, 5, 5);border-radius: 50%;width: 24px;height: 24px;line-height: 24px; display: inline-block;
                    position: absolute;
                    top: 6px;
                    right: 23px;
                    font-size: 12px;
                    color: rgb(255, 255, 255);"
          >{{ $store.state.wynum }}</span
        >
        我的待办
      </h2>
      <h2 :class="flag == 1 ? 'active' : ''" @click="lrouter(1)">
        <img
          src="./icon/待阅.svg"
          alt=""
          style="margin-left:35px ;width:38px;height:28px;    object-fit: scale-down;"
        />
        <span
          v-if="$store.state.wynum1 > 0"
          style="background: rgb(186, 5, 5);border-radius: 50%;width: 24px;height: 24px;line-height: 24px; display: inline-block;
                    position: absolute;
                    top: 6px;
                    right: 23px;
                    font-size: 12px;
                    color: rgb(255, 255, 255);"
          >{{ $store.state.wynum1 }}</span
        >
        我的待阅
      </h2>
      <h2 :class="flag == 2 ? 'active' : ''" @click="lrouter(2)">
        <img
          src="./icon/已办.svg"
          alt=""
          style="margin-left:31px ;width:38px;height:28px;    object-fit: scale-down;"
        />

        我的已办
      </h2>
      <h2 :class="flag == 3 ? 'active' : ''" @click="lrouter(3)">
        <img
          src="./icon/已阅.svg"
          alt=""
          style="margin-left:31px ;width:38px;height:28px;    object-fit: scale-down;"
        />

        我的已阅
      </h2>
      <!-- <h2
        :class="flag == 2 ? 'active' : ''"
        @click="lrouter(4)"
        style="    margin-top: 2px;"
      >
        <img
          src="./work.png"
          alt=""
          style="    margin-left: 32px;    width: 38px;    object-fit: scale-down;    height: 25px;"
        />
        我的督办件
      </h2> -->
      <ul>
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
                    <i class="icon aufontAll h-icon-all-question-circle-o"></i>
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
</template>
//
<script>
// export default {
//   data() {
//     return {
//       flag: 1
//     };
//   },
//   methods: {
//     lrouter(val) {
//       this.flag = val;
//       switch (val) {
//         case 0:
//           this.$router.push("home");
//           break;
//         case 1:
//           this.$router.push("dcdb");
//           break;
//         case 2:
//           this.$router.push("work");
//           break;
//       }
//     }
//   }
// };
//
</script>
<script lang="ts">
import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams,
  homeApi
} from "@cloudpivot/api";
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

  @Watch("$route") routergo(v) {
    switch (v.name) {
      case "wyViewsUser":
        this.flag = 0;
        break;
      case "unfinished":
        this.flag = 0;
        break;
      case "workItem":
        this.flag = 1;
        break;
      case "myYb":
        this.flag = 2;
        break;
      case "myread":
        this.flag = 3;
        break;
      case "my-workflow":
        this.flag = 4;
        break;
    }
  }
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
  flag: number = 1;
  flagNum: number = 0;
  created() {
    // this.getUnfinishedWorkflowItems();
    // 获取当前选中的菜单名称
    this.getUserInfo();
    switch (this.$route.name) {
      case "wyViewsUser":
        this.flag = 0;
        this.lrouter(0);
        break;
      case "unfinished":
        this.flag = 0;
        break;
      case "workItem":
        this.flag = 1;
        break;
      case "myYb":
        this.flag = 2;
        break;
      case "myread":
        this.flag = 3;
        break;
      case "my-workflow":
        this.flag = 4;
        break;
    }
    this.numall();
    // setTimeout(() => {
    //   document.getElementsByTagName("title")[0].innerText = "督查督办系统";
    // }, 0);
  }
  async numall() {
    // const res = await OAuthApi.getUserInfo();
    // let num = await axios.get(
    //   `/weiyuapi/authine-lowCode/RuntimeForm/getWaitToRead?gh=${(res.data
    //     ? res.data.userId
    //     : "") || "000814"}`,
    //   {}
    // );
    // // let num = await axios.get(
    // //   `/weiyuapi/authine-lowCode/RuntimeForm/getWaitToRead?gh=000814`,
    // //   {}
    // // );
    // let data = num.data;
    const res = await homeApi.getWorkCount("DB");
    if (res.errcode === 0) {
      this.$store.state.wynum = res.data.workItemCount;
      this.$store.state.wynum1 = res.data.circulateItemCount;
    }
  }
  async getUnfinishedWorkflowItems(type?: string) {
    const params = {
      wd: "", //以前接口需要的参数
      workflowName: "",
      workflowCode: type,
      originator: "",
      workflowTplName: "",
      batchOperate: false,
      page: 0,
      size: 1,
      workItemSource: ""
    };

    // const res = await workflowCenterApi.searchWorkitems(params);
    // debugger;
    const res = await OAuthApi.getUserInfo();
    // console.log(res, 123123123);
    // res.data?.employeeNo ||
    let num = await axios.get(
      `/weiyuapi/authine-lowCode/RuntimeForm/getWaitTodo?gh=${(res.data
        ? res.data.userId
        : "") || "000814"}`,
      {}
    );
    this.$store.state.wynum = num.data.total;
  }
  lrouter(val) {
    this.flag = val;
    this.numall();
    switch (val) {
      case 0:
        this.$router.push("/wyViewsUser/unfinished");
        break;
      case 1:
        this.$router.push("/wyViewsUser/myUnReadWorkItem");
        break;
      case 2:
        this.$router.push("/wyViewsUser/myYb");
        break;
      case 3:
        // this.$router.push("/wyviews/task");unfinished
        this.$router.push("/wyViewsUser/myread");
        break;
      case 4:
        this.$router.push("/wyViewsUser/my-workflow");
        break;
    }
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
      localStorage.removeItem("token");
      localStorage.removeItem("wydpet");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("expireTime");
      sessionStorage.removeItem("user");
      this.$router.replace({ name: "login" });
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
    debugger;
    if (res.errcode === 0) {
      const info: any = res.data;
      this.userInfo = info;
      info.roleName = info.roleName ? info.roleName.split(",") : "";
      this.$store.state.wyadmin = false;
      this.$store.state.wyld = false;

      if (info.roleName) {
        let admin = info.roleName.find(e => e == window.wyml.glyId);
        if (admin) {
          this.$store.state.wyadmin = true;
        } else {
          let ld = info.roleName.find(e => e == window.wyml.ldroleId);
          if (ld) {
            this.$store.state.wyld = true;
          }
        }

        this.$store.state.dept = {};
      } else {
        this.$store.state.dept = {
          name: info.departmentName,
          id: info.departmentId,
          unitType: 1
        };
      }
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
.wy_header {
  display: flex;
  flex: 0 0 70px;
  width: 100%;
  padding: 0 40px;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgb(30 85 255 / 10%);
  z-index: 99;
  border-bottom: 1px solid #e0e0e0;
  h1 {
    font-size: 22px;
    color: #333;
    font-weight: 600;
  }

  .wy_header_info {
    display: flex;
    height: 70px;
    img {
      display: block;
      margin-left: 35px;
      margin-top: 14px;
    }
    h2 {
      text-align: center;
      width: 108px;
      margin-bottom: 0px;
      font-size: 14px;
      margin-right: 48px;
      position: relative;
      padding: 0px 4px;
    }
    h2.active::before {
      content: "";
      width: 100%;
      height: 4px;
      display: inline-block;
      background: #ba0505;
      position: absolute;
      left: 0px;
    }
    h2.active {
      border-left: 1px solid #cacaca;
      border-right: 1px solid #cacaca;
    }
    h2.active::after {
      content: "";
      background: #fff;
      display: inline-block;
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: -2px;
      left: 0px;
    }
  }
}
</style>
<style lang="less" scoped>
// @import "../../../styles/themes/default.less";
.user-info {
  position: relative;
  display: flex;
  align-items: center;
  height: 64px;
  cursor: pointer;
  // &::before {
  //   content: "";
  //   display: block;
  //   width: 1px;
  //   height: 30px;
  //   background-color: rgba(234, 237, 243, 1);
  //   position: absolute;
  //   left: -20px;
  //   top: 17px;
  // }
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
