<template>
  <div class="login-qrcode">
    <!-- <div class="login-qrcode-header">微信登录</div> -->
    <!-- <a-tooltip placement="left" v-if="toggleMode">
      <template slot="title">
        <span>密码登录</span>
      </template>
      <div class="login-qrcode-type" @click="$emit('toggle')">
        <img src="../../assets/images/login.svg" />
      </div>
    </a-tooltip> -->
    <div id="qrcode-box" class="qrcode"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, PropSync, Watch } from "vue-property-decorator";

import { utils } from "@cloudpivot/common";

import { Tooltip } from "@h3/antd-vue";

import env from "@/config/env";

@Component({
  name: "wechat-login",
  components: {
    ATooltip: Tooltip
  }
})
export default class WechatLogin extends Vue {
  @Prop({
    default: false
  })
  toggleMode!: boolean;

  @Prop() corpId!: string;

  @Prop() agentid!: string;

  redirectUrl: string = ""; // 登陆成功回调地址

  gotoUrl: string = ""; // 钉钉扫码回调地址

  @Watch("corpId", { immediate: true })
  onCorpIdChange(corpId: any) {
    if (corpId) {
      this.initWechatLoginQrcode();
      this.insertQrcode();
    }
  }
  beforeDestroy() {
    if (typeof window.removeEventListener !== "undefined") {
      window.removeEventListener("message", this.handleMessage);
    } else if (typeof (window as any).detachEvent !== "undefined") {
      (window as any).detachEvent("onmessage", this.handleMessage);
    }
  }

  /**
   * 嵌入微信登陆二维码
   * @sourceFile http://rescdn.qqmail.com/node/ww/wwopenmng/js/sso/wwLogin-1.0.0.js
   */
  initWechatLoginQrcode() {
    function wechatLogin(c) {
      let d = document.createElement("iframe") as any;
      let e =
        "https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=" +
        c.appid +
        "&agentid=" +
        c.agentid +
        "&redirect_uri=" +
        c.redirect_uri +
        "&state=" +
        c.state +
        "&login_type=jssdk";
      e += c.style ? "&style=" + c.style : "";
      e += c.href ? "&href=" + c.href : "";
      d.src = e;
      d.frameBorder = "0";
      d.allowTransparency = "true";
      d.scrolling = "no";
      d.width = "210px";
      d.height = "300px";
      let f = document.getElementById(c.id) as any;
      f.innerHTML = "";
      f.appendChild(d);
      d.onload = function() {
        d.contentWindow.postMessage &&
          window.addEventListener &&
          (window.addEventListener("message", function(b) {
            (document as any).data &&
              document.origin.indexOf("work.weixin.qq.com") > -1 &&
              (window.location.href = b.data);
          }),
          d.contentWindow.postMessage("ask_usePostMessage", "*"));
      };
    }

    (window as any).WwLogin = wechatLogin;
  }

  insertQrcode() {
    this.generateUrls();
    const { portalHost, redirectHost } = env;
    const { agentid, corpId, redirectUrl } = this;
    let styleSheet =
      "LmltcG93ZXJCb3ggLnFyY29kZSB7d2lkdGg6IDIxMHB4O30KLmltcG93ZXJCb3ggLnRpdGxlIHtkaXNwbGF5OiBub25lO30KLmltcG93ZXJCb3ggLmluZm8ge3dpZHRoOiAyMTBweDt9Ci5pbXBvd2VyQm94IC53cnBfY29kZSB7bWFyZ2luLXRvcDogMCFpbXBvcnRhbnQ7fQouc3RhdHVzX2ljb24ge2Rpc3BsYXk6IG5vbmUgICFpbXBvcnRhbnR9Ci5pbXBvd2VyQm94IC5zdGF0dXMgewogIG1hcmdpbi10b3A6IDA7Cn0KLmltcG93ZXJCb3ggLmljb24zOF9tc2cuc3VjYyB7CiAgZGlzcGxheTogbm9uZTsKfQ==";
    this.$nextTick(() => {
      (window as any).WwLogin({
        id: "qrcode-box",
        appid: corpId,
        agentid: agentid,
        redirect_uri: redirectUrl,
        state: "",
        href: `data:text/css;base64,${styleSheet}` //企业微信只支持https,加载http协议下的样式表会跨域，这种方法可以兼容
      });

      if (typeof window.addEventListener !== "undefined") {
        window.addEventListener("message", this.handleMessage, false);
      } else if (typeof (window as any).attachEvent !== "undefined") {
        (window as any).attachEvent("onmessage", this.handleMessage);
      }
    });
  }

  /**
   * 组装回调链接地址
   */
  generateUrls() {
    // 基础参数
    const { scope, client_id, redirectHost, oauthHost, portalHost } = env;
    const failUrl: string = `${portalHost}/login`;
    // 组装地址
    this.redirectUrl = `${oauthHost}/login/wx/scan_login?redirect_uri=${encodeURIComponent(
      `${oauthHost}/oauth/authorize?client_id=${client_id}&response_type=code&scope=${scope}&redirect_uri=${redirectHost}/oauth`
    )}&login_fail_redirect_uri=${encodeURIComponent(failUrl)}`;
  }

  /**
   * 扫码结果处理
   */
  handleMessage(event: any) {
    const { origin } = event;
    if (origin === "https://open.work.weixin.qq.com") {
      const code = utils.getUrlVar("code", `?${event.data.split("?")[2]}`);
      window.location.href = `${this.redirectUrl}&corpId=${
        this.corpId
      }&code=${code}`;
    }
  }
}
</script>
<style lang="less" scoped>
.login-qrcode {
  // float: right;
  // margin-top: 110px;
  // position: relative;
  // background: #fff;
  // border-radius: 6px;
  // text-align: center;
  // padding-top: 20px;
  padding-top: 30px;
  &-header {
    font-size: 30px;
    color: #333;
    line-height: 40px;
    margin: 50px 0 0 0;
  }
  &-type {
    position: absolute;
    top: 32px;
    right: 32px;
    cursor: pointer;
  }
}
</style>
