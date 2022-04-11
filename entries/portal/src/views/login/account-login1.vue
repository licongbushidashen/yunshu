<template>
  <div v-if="!tokenerror">loading....</div>
  <div v-else class="logincenter">
    <img src="./error.png" alt="" />
    <div>{{ tokenerror }}</div>
    <button @click="backhome">返回登录</button>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, PropSync, Watch } from "vue-property-decorator";
import axios from "axios";
import OAuthApi from "@/apis/oauth";
import qs from "qs";
import env from "@/config/env";

import common from "@cloudpivot/common";
import { Modal, Input, Button, Tooltip } from "@h3/antd-vue";

@Component({
  name: "login-account",
  components: {
    AInput: Input,
    AModal: Modal,
    AButton: Button,
    ATooltip: Tooltip
  }
})
export default class LoginAccount extends Vue {
  @Prop({
    default: false
  })
  toggleMode!: boolean;

  @PropSync("corpId") syncCorpId!: string;

  redirectUrl: string = ""; // 登陆回跳地址

  getTokenParams: any = {
    code: "",
    url: "",
    client_secret: "",
    client_id: "",
    redirect_uri: ""
  };

  languages: string = localStorage.getItem("locale") || "zh";

  passwordErr: boolean = false; // 账户密码错误

  passwordType: string = "password"; // 密码的展示形式

  showPassword: boolean = false;

  overflowTips: boolean = false; // 密码输入已超过3次提示

  loginDisabled: boolean = false; // 登录禁用状态

  userName: string = ""; // 登录账号

  passWord: string = ""; // 登录密码

  visible: boolean = false; // 忘记密码提示窗

  unAuthed: boolean = false; // 未授权提示窗

  userTips: string = "";
  tokenerror: string = "";
  created() {
    this.generateUrls();
  }
  async mounted() {
    // this.login();
    if (localStorage.getItem("token")) {
      this.$router.push({ path: "" });
    }
    if (localStorage.getItem("zj_code")) {
      this.vtoken();
    } else {
      this.backhome();
    }
  }
  backhome() {
    axios
      .post(
        `/maxkey/maxkey/authz/cas/logout/${
          window.wyml.wyml.ID
        }?globalSessionId=${localStorage.getItem("globalSessionId")}`
      )
      .then(res => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("expireTime");
        sessionStorage.removeItem("user");
        window.location.href = `${
          window.wyml.wyml.url
        }/oauth/v20/authorize?response_type=code&client_id=${
          window.wyml.wyml.ID
        }&scope=all&redirect_uri=${window.location.href.split("?")[0]}`;
      });
    // window.location.href = `https://onekey-test.zhejianglab.com/maxkey/oauth/v20/authorize?response_type=code&client_id=913bf547-fda9-4c4d-afb6-ec58ab4e3bf4&scope=all&redirect_uri=${
    //   window.location.origin
    // }`;
  }
  vtoken() {
    // https://onekey-test.zhejianglab.com/maxkey
    axios
      .post(
        `/maxkey/maxkey/oauth/v20/token?client_id=${
          window.wyml.wyml.ID
        }&client_secret=${window.wyml.wyml.secret}&code=${localStorage.getItem(
          "zj_code"
        )}&grant_type=authorization_code&redirect_uri=${
          window.location.href.split("?")[0]
        }`
      )
      .then(res => {
        if (res.access_token) {
          this.infos(res.access_token);
        } else {
          this.tokenerror = "未能获取token,请返回登录页面";
        }
      });
  }
  infos(val) {
    //   `/maxkey/maxkey/api/oauth/v20/me`,
    axios
      .post(
        `/maxkey/maxkey/api/oauth/v20/me`,
        qs.stringify({
          access_token: val
        })
      )
      .then((res: any) => {
        if (res.username) {
          this.login(res.username);
        } else {
          this.tokenerror = "未能获取用户信息,请返回登录页面";
        }
      });
  }

  // 切换组织的时候需要重新初始化
  @Watch("syncCorpId")
  onSyncCorpIdChange(syncCorpId: any) {
    if (syncCorpId) {
      this.generateUrls();
    }
  }

  /**
   * 初始化地址和固定传参
   */
  generateUrls() {
    const { oauthHost, client_id, scope, secret, redirectHost } = env;
    // 回跳地址
    this.redirectUrl = `${oauthHost}/login?redirect_uri=${encodeURIComponent(
      `${oauthHost}/oauth/authorize?client_id=${client_id}&response_type=code&scope=${scope}&redirect_uri=${redirectHost}/oauth`
    )}`;
    // 请求token参数
    this.getTokenParams = {
      code: "",
      url: oauthHost,
      client_secret: secret,
      client_id: client_id,
      redirect_uri: `${redirectHost}/oauth`
    };
  }

  passwordVisible() {
    if (this.showPassword) {
      this.passwordType = "password";
    } else {
      this.passwordType = "text";
    }
    this.showPassword = !this.showPassword;
  }

  becanLogin() {
    if (this.userName && this.passWord) {
      this.loginDisabled = true;
    } else {
      this.loginDisabled = false;
    }
  }

  /**
   * 回车登陆
   */
  enterLogin() {
    const { userName, passWord } = this;

    if (!passWord || !userName) return;

    this.login();
  }

  /**
   * 账户密码登录
   */
  async login(val) {
    // if (!this.loginDisabled || !this.userName || !this.passWord) {
    //   return;
    // }
    this.passwordErr = false;
    this.userTips = "";
    // rsa加密
    const result = await OAuthApi.getRsaKey();
    const flag: boolean =
      typeof result === "object" &&
      result.hasOwnProperty("index") &&
      result.hasOwnProperty("key");
    if (!flag) {
      return;
    }
    // WeiYu82658572@@@
    // lxf123456!@#
    const { index, key } = result;
    const password: any = common.utils.RsaEncrypt("WeiYu82658572@@@", key);
    // rsa加密结束
    const params = {
      username: val,
      password,
      url: this.redirectUrl,
      portal: true,
      index,
      corpId: this.syncCorpId
    };
    const res = await OAuthApi.login(params);
    if (res.errcode === 200 && res.code) {
      this.getTokenParams.code = res.code;
      this.getToken(this.getTokenParams);
    } else if (res.errcode === 1000) {
      this.tokenerror = res.errmsg + ",请联系管理员";
      this.passwordErr = true;
    } else if (res.errcode === 10001) {
      this.tokenerror = res.errmsg;
      this.passwordErr = true;
      this.overflowTips = true;
    } else if (res.errcode === 10002) {
      this.tokenerror = res.errmsg;
      this.unAuthed = true;
    } else if (res.errcode === 1001) {
      this.tokenerror = res.errmsg;
      let msg = res.errmsg;
      if (
        msg === "当前用户不在组织内或者用户不存在" &&
        this.languages === "en"
      ) {
        msg = "The current user is not in the organization or does not exist";
      }
      this.userTips = msg;
    }
  }

  /**
   * 获取token
   */
  async getToken(params: any) {
    const res = await OAuthApi.getToken(params);

    if (res && res.success) {
      const token = (res as any).access_token;
      const refresh_tokens = (res as any).refresh_token;
      const expireTime = (res as any).exp;
      const isAdmin = (res as any).user_name === "admin";

      localStorage.setItem("refresh_token", refresh_tokens);
      localStorage.setItem("expireTime", expireTime);
      localStorage.setItem("token", token);
      localStorage.setItem("_isAdmin", isAdmin + "");

      const isShowEmailResquest = localStorage.getItem("isShowEmailResquest");
      if (isShowEmailResquest) {
        if (this.isDingTalk) {
          this.$router
            .push({
              path: isShowEmailResquest
            })
            .catch((err: any) => {
              err;
            });
        } else {
          window.location.href = isShowEmailResquest;
        }
      } else {
        const copyUrl = localStorage.getItem("copy_link_url_path");
        if (copyUrl) {
          localStorage.removeItem("copy_link_url_path");
          window.open(copyUrl, "_self");
        }
        this.$router
          .push({ name: "myUnfinishedWorkItem" })
          .catch((err: any) => {
            err;
          });
      }
    }
  }
}
</script>
<style lang="less" scoped>
.logincenter {
  height: 100%;
  text-align: center;
  margin-top: 10%;
  > div {
    margin: 10px 0px;
  }
  button {
    color: #fff;
    background-color: #1890ff;
    border-color: #1890ff;
    text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
    box-shadow: 0 2px 0 rgb(0 0 0 / 5%);
    height: 32px;
    padding: 0 15px;
    font-size: 14px;
  }
}
.login-account {
  // float: right;
  // margin-top: 110px;
  // width: 360px;
  // height: 400px;
  // position: relative;
  // background: #fff;
  // border-radius: 6px;
  // text-align: center;
  // padding: 0 40px;
  padding-top: 30px;
  &-header {
    font-size: 30px;
    color: #333;
    line-height: 40px;
    margin: 50px 0 42px 0;
  }
  &-type {
    position: absolute;
    top: 32px;
    right: 32px;
    cursor: pointer;
    img {
      width: 44px;
    }
  }
  &-forget {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    text-align: right;
    cursor: pointer;
  }
  .login-btn {
    width: 280px;
    background: #17bc94;
    border-radius: 4px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    color: #fff;
    margin: 42px auto;
    cursor: pointer;
  }
  .loginDisabled {
    color: rgba(255, 255, 255, 0.6);
  }
  .icon {
    cursor: pointer;
  }

  .login-account-forget {
    float: right;
  }
}
.login-err-box {
  position: relative;
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
    top: 5px;
    left: 0;
  }
}
/deep/ .ant-modal {
  width: 520px !important;
}
/deep/ .ant-input-affix-wrapper {
  text-align: left;
}
.ant-modal-content {
  .ok-btn {
    background: #17bc94;
    border: 1px solid #17bc94;
  }
  .ant-modal-body {
    .img {
      margin-top: 26px;
    }
    .img-text {
      margin: 16px 0 18px 0;
    }
    .overflow-text {
      font-size: 16px;
    }
  }
}
</style>
