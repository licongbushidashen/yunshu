<template>
  <div class="login">
    <div class="login-head">
      <img src="../../assets/images/yslogo.png" />
      <a-select
        v-model="deptId"
        :defaultValue="deptId"
        @change="onDeptChange"
        show-search
        :filter-option="filterOption"
        :showArrow="false"
        class="org-list"
      >
        <a-select-option
          v-for="dept in depts"
          :value="dept.corpId"
          :key="dept.corpId"
          >{{ dept.name ? dept.name : "主组织" }}</a-select-option
        >
      </a-select>
    </div>
    <div class="login-content">
      <div class="login-content-contain">
        <div class="login-content-contain__left">
          <!-- <h1>重塑连接，赋能业务在线</h1>
          <h2>弥合管理碎片，盘活IT资产</h2>-->
          <img class="bj-image" src="../../assets/images/bj.png" />
        </div>

        <div class="login-types">
          <div
            class="tab-bar"
            :class="{
              'only-one': tabsDisplay.length === 1,
              'only-two': tabsDisplay.length === 2
            }"
          >
            <div
              class="tab-bar-item"
              :class="curTab === item.type ? 'active' : ''"
              v-for="(item, index) in tabsDisplay"
              :key="index"
              @click="changeTab(item.type)"
            >
              {{ languages === "zh" ? item.name : "Account Login" }}
            </div>
          </div>

          <div class="tab-content">
            <template v-if="curTab === 'account'">
              <account-login :corpId="corpId" />
            </template>

            <template v-if="curTab === 'dingding'">
              <qrcode-login :appId="appId" :corpId="corpId" ref="qrcodeLogin" />
            </template>

            <template v-if="curTab === 'wechat'">
              <wechat-login :agentid="agentid" :corpId="corpId" />
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="login-footer">
      <div class="login-footer-center">
        <div class="login-line"></div>
        <div>版权所有 &copy;深圳奥哲网络科技有限公司 粤ICP备10083177号</div>
        <div class="login-line"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Model } from "vue-property-decorator";
import { Modal, Select } from "@h3/antd-vue";
import "@h3/antd-vue/dist/antd.css"; // 单独引入css是因为登陆页面select组件无样式
import OAuthApi from "@/apis/oauth";
import { utils } from "@cloudpivot/common";

import QrcodeLogin from "./qrcode-login.vue";

import AccountLogin from "./account-login.vue";

import WechatLogin from "./wechat-login.vue";

enum LoginType {
  OnlyAccount = 0, // 只允许账户密码
  OnlyQrCode = 1, // 只允许扫码
  BothAccountAndQrCode = 2 // 二者均可
}

/**
 * 组织类型
 * */

enum OrgType {
  MAIN = "MAIN",
  RELEVANCE = "RELEVANCE"
}

/**
 * 维护方式
 * */

enum SyncType {
  PUSH = "PUSH",
  PULL = "PULL"
}

/**
 * 登录模式
 * */

enum LoginMode {
  Account = "account",
  Dingtalk = "dingding",
  Wechat = "wechat"
}

/**
 * 关联方式
 * 关联钉钉 或者微信
 * */

enum RelatedType {
  Dingtalk = "DINGTALK",
  Wechat = "WECHAT",
  OTHER = "OTHER"
}

@Component({
  name: "Login",
  components: {
    QrcodeLogin,
    AccountLogin,
    WechatLogin,
    ASelect: Select,
    ASelectOption: Select.Option
  }
})
export default class Login extends Vue {
  appId: string = "";

  agentid: string = ""; // 微信扫码登陆需要agentid

  toggleMode: boolean = false; // 是否展示切换模式

  defaultView: string = "qrcode"; // 默认展示页面

  depts: any[] = [];

  deptId: string = "";

  corpId = "";

  config: any = null;

  loginType: any = -1;

  curTab: string = "";
  languages: string = localStorage.getItem("locale") || "zh";

  tabsAll: any[] = [
    { type: "account", name: "账号登录" },
    { type: "dingding", name: "钉钉登录" },
    { type: "wechat", name: "企业微信登录" }
  ];

  tabs: any[] = [];

  get tabsDisplay() {
    return this.tabs.filter((item: any) => !!item);
  }

  get isCloudPivot() {
    // 是否已打开内部维护组织开关
    return this.$store.state.config.cloudPivot;
  }

  async mounted() {
    // 获取环境配置
    localStorage.removeItem("token");
    localStorage.removeItem("wydpet");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expireTime");
    const config = await OAuthApi.getSystemConfig();
    ``;
    // const config = {"pcServerUrl":"http://120.24.79.179",
    // "ssoServerUrl":"http://47.106.239.118/api/login",
    // "adminServerUrl":"http://47.106.239.118/admin",
    // "mobileServerUrl":"http://120.24.79.179/mobile",
    // "scanAppId":"dingoa4knnozidu6k6vlsg",
    // "loginType":2,
    // "multiLanguageSwitch":true,
    // "systemVersion":"1.6.0-alpha.33-SNAPSHOT",
    // "agentId":"507634795",
    // "corpId":"dingf0c82042933117caf5bf40eda33b7ba0",
    // "isCloudPivot":0,"organizationRelated":true}

    // console.log('config', config);
    if (config) {
      this.config = config;
      this.loginType = config.loginType;
    }

    const res: any = await OAuthApi.getDepts();
    if (res.errcode !== 0) {
      this.$message.error(res.errmsg);
      return;
    }

    this.depts = res.data;

    // this.depts = [
    //   {"corpId":"ding2b61f798e1e0353c35c2f4657eb6378f","scanAppId":"dingoapafnay0mrrb4erhb","pcServerUrl":"http://47.112.182.161","mobileServerUrl":"http://47.112.182.161/mobile","orgType":"MAIN","name":"主组织PUll","syncType":"PULL","orgTypeStr":"主组织PUll"},
    //   {"corpId":"ding2b61f798e1e0353c35c2f4657eb637uiuo","scanAppId":"dingoapafnay0mrrb4erhb","pcServerUrl":"http://47.112.182.161","mobileServerUrl":"http://47.112.182.161/mobile","orgType":"MAIN","name":"主组织自维护PUSH","syncType":"PUSH","orgTypeStr":"主组织自维护PUSH"}
    //   ]

    // this.depts = [
    //  {
    //    agentId: "",
    //     corpId: "wwc226455248094acd",
    //     mobileServerUrl: "https://wx-dev.h3yun.com/mobile",
    //     name: "微信关联组织",
    //     orgType: "RELEVANCE",
    //     orgTypeStr: "关联组织",
    //     pcServerUrl: "https://wx-dev.h3yun.com",
    //     relatedType: "OTHER",
    //     scanAppId: "",
    //     syncType: "PUSH"
    //  }
    //   ]

    if (this.depts.length > 0) {
      let deptId = this.depts[0].corpId;
      if (this.$route.query.corpId) {
        deptId = this.$route.query.corpId;
        localStorage.setItem("corpId", deptId);
      } else {
        // localStorage.removeItem('corpId')
        // 如果query中没有corpid 则设置第一个企业的corpid
        localStorage.setItem("corpId", deptId);
      }
      this.deptId = deptId;
      this.onDeptChange(deptId, {});
    } else {
      this.$router
        .push({
          name: "loginError"
        })
        .catch((err: any) => {
          err;
        });
      return;
    }

    const errcode = utils.parseUrlParam(window.location.href, "errcode");
    if (errcode && errcode === "201018") {
      Modal.error({
        title: "该用户已被停用，请联系管理员！"
      });
    } else if (errcode) {
      Modal.error({
        title: "您无此访问权限，请联系管理员！"
      });
    }
  }

  onDeptChange(deptId: string, obj: any) {
    // ;
    const dept = this.depts.find(d => d.corpId === deptId);
    if (!dept) {
      Modal.error({
        title: "找不到组织机构记录"
      });
      return;
    }

    // 切换登录界面的组织时，获取到组织变化，拿到选择的组织对应的pcServerUrl地址，变更浏览器地址栏地址
    let pcServerUrl: string = "";
    // ;
    if (obj.key) {
      for (let item of this.depts) {
        if (item.corpId === deptId) {
          pcServerUrl = item.pcServerUrl;
          break;
        }
      }

      // const index: number = pcServerUrl.indexOf('/');

      // if (index > -1) pcServerUrl = pcServerUrl.substring(0, index);

      window.location.href = pcServerUrl + "/login?corpId=" + dept.corpId;
    }

    this.appId = dept.scanAppId;
    this.agentid = dept.agentId;
    this.corpId = dept.corpId;

    // 展示逻辑更改 20200511  by John
    const { orgType, syncType, relatedType } = dept;

    if (orgType === OrgType.MAIN) {
      // 主组织
      if (syncType === SyncType.PUSH) {
        // 自维护
        if (
          this.loginType === LoginType.BothAccountAndQrCode ||
          this.loginType === LoginType.OnlyAccount
        ) {
          // 配置文件支持账户登陆
          this.tabs = this.tabsAll.map((item: any) => {
            if (item.type === LoginMode.Account) return item;
          });
        } else {
          Modal.error({
            title: "账号密码登录方式未打开，请联系系统维护人员处理！"
          });
        }
      } else {
        // 第三方维护
        this.showByConfig(this.config, relatedType);
      }
    } else {
      // 关联组织
      this.showByConfig(this.config, relatedType);
    }

    this.curTab = this.tabsDisplay[0].type;
  }

  showByConfig(config: any, relatedType: string) {
    if (!config) return;
    const { loginType } = config;

    if (loginType === LoginType.OnlyAccount) {
      this.tabs = this.tabsAll.map((item: any) => {
        if (item.type === LoginMode.Account) return item;
      });
    } else if (loginType === LoginType.OnlyQrCode) {
      this.tabs = this.showByRelativeType(relatedType);
    } else {
      // 二者均可
      const temTabs = this.tabsAll.map((item: any) => {
        if (item.type === LoginMode.Account) return item;
      });
      this.tabs = this.showByRelativeType(relatedType);
      this.tabs = temTabs.concat(this.tabs);
    }
  }

  showByRelativeType(relatedType: string) {
    let tabs: any[] = [];
    if (relatedType === RelatedType.Wechat) {
      tabs = this.tabsAll.map((item: any) => {
        if (item.type === LoginMode.Wechat) return item;
      });
    } else if (relatedType === RelatedType.Dingtalk) {
      tabs = this.tabsAll.map((item: any) => {
        if (item.type === LoginMode.Dingtalk) return item;
      });
    } else if (relatedType === RelatedType.OTHER) {
      tabs = this.tabsAll.map((item: any) => {
        if (item.type === LoginMode.Dingtalk) return item;
      });
    }
    return tabs;
  }

  changeTab(type: string) {
    if (!type) return;
    this.curTab = type;
  }

  filterOption(input, option) {
    console.log(option.componentOptions);
    return (
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.trim().toLowerCase()) >= 0
    );
  }
}
</script>

<style lang="less" scoped>
.login {
  .ant-select {
    vertical-align: middle;
    margin-left: 1em;
  }
  .org-list {
    width: 200px;
  }

  .login-head {
    width: 100%;
    height: 64px;
    line-height: 64px;
    padding-left: 24px;

    & > img {
      max-height: 30px !important;
    }
  }
  .login-content {
    height: 736px;
    min-width: 1066px;
    background: #002638;
    &-contain {
      width: 1066px;
      height: 100%;
      overflow: hidden;
      margin: 0 auto;
      &__left {
        position: relative;
        height: 100%;
        float: left;
        h1 {
          font-size: 40px;
          margin-top: 80px;
          margin-left: 82px;
          font-weight: 400;
          line-height: 48px;
          color: #fff;
        }
        h2 {
          font-size: 28px;
          margin-top: 8px;
          margin-left: 82px;
          margin-bottom: 8px;
          font-weight: 400;
          color: #fff;
        }
        .bj-image {
          margin-top: 102px;
        }
      }
    }
  }
  .login-types {
    float: right;
    margin-top: 110px;
    width: 360px;
    height: 400px;
    position: relative;
    background: #fff;
    border-radius: 6px;
    text-align: center;
    padding: 40px;
    & > .tab-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #d1f2ea;
      padding-bottom: 16px;
      &.only-one {
        display: block;
        & > .tab-bar-item.active:after {
          display: none;
        }
      }

      &.only-two {
        justify-content: space-around;

        .tab-bar-item {
          width: 100%;
        }
      }
      & > .tab-bar-item {
        cursor: pointer;
        user-select: none;
        color: rgba(0, 0, 0, 0.65);
        width: auto;
        position: relative;
        &.active {
          font-size: 20px;
          color: #000;
          &:after {
            content: "";
            display: block;
            position: absolute;
            left: 0;
            bottom: -17px;
            width: 100%;
            height: 2px;
            background: #17bc94;
          }
        }
      }
    }
    & > .tab-content {
    }
  }
  .login-footer {
    height: 79px;
    font-size: 12px;
    line-height: 79px;
    background: #fff;
    z-index: 9;
    text-align: center;
    .login-footer-center {
      width: 600px;
      overflow: hidden;
      margin: 0 auto;
      div {
        float: left;
      }
      .login-line {
        width: 94px;
        height: 1px;
        margin: 39px 16px;
        background: #efefef;
      }
    }
  }
}

/deep/.hide-toggle .login-account-type,
/deep/ .hide-toggle .login-qrcode-type {
  display: none;
}
</style>
