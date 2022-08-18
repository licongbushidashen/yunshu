<template>
  <div class="header">
    <div>
      <div class="header-left" :style="isInIframe ? '' : 'width: 100%;'">
        <a v-if="isDingTalk" class="aback" @click="back">返回</a>
        <img v-if="!isInIframe" class="logo" :src="logo" @click="goHome" />
        <ul class="wy_home_to" v-if="!isInIframe">
          <li>
            <a href="https://portal.zhejianglab.com/portal/index">首页</a>
          </li>
          <li>
            <a href="https://portal.zhejianglab.com/portal/service">服务大厅</a>
          </li>
          <li>
            <a href="https://portal.zhejianglab.com/portal/task">任务中心</a>
          </li>
          <li style="width:20px"><span class="wyicon"></span></li>
          <li>
            <span class="wydl"
              ><a
                href="https://portal.zhejianglab.com/oa/home"
                style="font-size:13px"
              >
                欢迎登录</a
              ></span
            >
          </li>
        </ul>
        <slot name="h4" v-if="isInIframe" />
        <!-- <h4>发起流程</h4> -->

        <a v-if="isDingTalk" class="open-blank" @click.prevent="openBlank"
          >在浏览器中打开</a
        >

        <div class="header-dropdown" v-if="nodes.length > 0 && isInIframe">
          <a-dropdown :trigger="['click']">
            <div>
              <span>{{ activeNodes }}</span>
              <a-icon type="down" />
            </div>
            <!-- <a class="ant-dropdown-link" href="#">  <a-icon type="down" /> </a> -->
            <a-menu slot="overlay">
              <a-menu-item
                v-for="(node, index) in nodes"
                :key="node.activityCode"
                :class="{ 'a-menu-item-active': node.selected }"
                class="node-switch-menu-item"
              >
                <a href="javascript:;" @click="nodesSwitch(index)">{{
                  node.activityName
                }}</a>
              </a-menu-item>
              <!-- <a-menu-item>
                <a href="javascript:;">2nd menu item</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;">3rd menu item</a>
              </a-menu-item>-->
            </a-menu>
          </a-dropdown>
        </div>
      </div>

      <div class="header-right">
        <div @click="proxyAction()" v-if="showTrack">
          <span
            ><a-icon type="history" />{{
              $t("cloudpivot.list.pc.FormTrack")
            }}</span
          >
        </div>

        <div
          @mouseover="showBigQrcode = true"
          @mouseout="showBigQrcode = false"
          @click.stop="showBigQrcode = true"
          v-if="!isEl && ['DINGTALK', 'WECHAT'].includes(relatedType)"
          class="qrcode"
        >
          <!--<img  @click.stop="showBigQrcode = !showBigQrcode" src="~@/assets/images/qrcode-icon.png"/>-->
          <!-- <img src="~@/assets/images/qrcode-icon.png" /> -->
          <span> <a-icon type="qrcode" />二维码 </span>
          <div class="qrcode-enlarge" v-show="showBigQrcode">
            <img :src="url" />
            <p v-if="isAdd">
              {{ relatedType === "WECHAT" ? "企业微信" : "钉钉" }}扫码查看数据
            </p>
            <p v-else>
              {{ relatedType === "WECHAT" ? "企业微信" : "钉钉" }}扫码填写数据
            </p>
          </div>
        </div>

        <div @click="copyURL" v-if="isInIframe">
          <span
            ><a-icon type="link" />{{ $t("cloudpivot.list.pc.CopyLink") }}</span
          >
        </div>

        <div @click.prevent="openBlank" v-if="isInIframe">
          <span>
            <a-icon type="file-add" />
            新页面打开
          </span>
        </div>

        <!-- <div class="icon-close" @click="closeIframe">
          <span><a-icon type="close" /></span>
        </div> -->
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { Button, Dropdown, Menu, Icon } from "@h3/antd-vue";

import { Getter } from "vuex-class";
import site from "@/config/site";
import dd from "dingtalk-jsapi";
import env from "@/config/env";

import { externalLinkApi } from "@cloudpivot/api";

import OAuthApi from "@/apis/oauth";

@Component({
  name: "form-detail-header",
  components: {
    AButton: Button,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AIcon: Icon
  }
})
export default class FormDetailHeader extends Vue {
  @Getter("getAntLocale") locale!: string;

  @Prop() formObj!: any;

  @Prop() nodes!: any;

  showBigQrcode = false;

  url = "";

  // showTrack:boolean =true;

  get logo() {
    return site.logo;
  }

  isInIframe: boolean = false;

  /**
   * 是否是外链
   */
  get isEl(): boolean {
    return !!(window as any).externalLinkToken;
  }

  async getUserInfo() {
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      sessionStorage.setItem("user", JSON.stringify(info));
      this.onFormObjChange(this.formObj);
    }
  }

  // 跳转到首页
  goHome() {
    window.location.href = "https://portal.zhejianglab.com/oa/home";
    // const appCode = (window as any).Environment
    //   ? (window as any).Environment.appCode
    //   : null;
    // if (appCode) {
    //   this.$router
    //     .push({
    //       name: "singleApp",
    //       params: {
    //         appCode
    //       }
    //     })
    //     .catch((err: any) => {
    //       err;
    //     });
    // } else {
    //   this.$router.push({ name: "myUnfinishedWorkItem" }).catch((err: any) => {
    //     err;
    //   });
    // }
  }

  isAdd = false;

  proxyAction() {
    this.$emit("action", {
      code: "formTrack",
      disabled: false,
      loading: false,
      text: "表单留痕",
      visible: true
    });
  }

  back() {
    const url = this.$route.query.return as string;
    if (url) {
      this.$router
        .push({
          path: url
        })
        .catch((err: any) => {
          err;
        });
    } else {
      this.isHistory() ? this.$router.go(-1) : dd.biz.navigation.close({});
    }
    // const back = sessionStorage.getItem('backList');
    // if (back) {
    //   const url : any = sessionStorage.getItem('backListUrl');
    //   sessionStorage.removeItem('backList');
    //   this.$router.push(url);
    //   this.$router.go(-1);
    // } else {
    //   const url : any = sessionStorage.getItem('backListUrl');
    //   this.$router.go(-1);
    // }
  }

  /**
   * 判断是否有history记录
   * @return boolean
   */
  isHistory(): boolean {
    if (
      navigator.userAgent.indexOf("MSIE") >= 0 &&
      navigator.userAgent.indexOf("Opera") < 0
    ) {
      // IE
      if (history.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      //非IE浏览器
      if (
        navigator.userAgent.indexOf("Firefox") >= 0 ||
        navigator.userAgent.indexOf("Opera") >= 0 ||
        navigator.userAgent.indexOf("Safari") >= 0 ||
        navigator.userAgent.indexOf("Chrome") >= 0 ||
        navigator.userAgent.indexOf("WebKit") >= 0
      ) {
        if (window.history.length > 1) {
          return true;
        } else {
          return false;
        }
      } else {
        //未知的浏览器
        return true;
      }
    }
  }

  closeIframe() {
    window.parent.postMessage("close", "*");
  }
  copyURL() {
    // 复制链接
    try {
      let href: any = location.href;
      let iframeAction: any = href.match(/%26iframeAction%3Ddetail/g);
      if (Array.isArray(iframeAction) && iframeAction.length > 1) {
        for (let i = 0; i < iframeAction.length - 1; i++) {
          href = href.replace("%26iframeAction%3Ddetail", "");
        }
      }
      let oInput = document.createElement("input");
      oInput.value = href;
      document.body.appendChild(oInput);
      oInput.select();
      document.execCommand("Copy");
      oInput.style.display = "none";
      this.$message.success("复制成功");
    } catch (error) {
      this.$message.error("复制失败");
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

    const parent = window.parent;
    parent.open(url, "_blank");
  }

  // get url() {
  //   // const config:any = this.$store.state.config;
  //   // const corpId = config.corpId;
  //   // const agentId = config.agentId;

  //   // const locHref = window.location.pathname + window.location.search;

  //   // const signinUrl = '47.107.160.206' + "/mobile/?meetingId="+"&corpId=ding6a0a954b9b413bcf35c2f4657eb6378f&agentId=235111190&mode=create&schemaCode=meeting_signin&sheetCode=signin&num=" + new Date().getTime();
  //   //

  //   return src;
  // }

  get isEL() {
    return (window as any).externalLinkToken;
  }

  get activeNodes() {
    const theNode = this.nodes.find(res => res.selected);
    if (theNode) {
      return theNode.activityName;
    }
    return "";
  }

  nodesSwitch(index: number) {
    if (this.nodes[index].selected) return;
    let theNode = "";
    this.nodes.forEach((res, idx) => {
      if (idx === index) {
        res.selected = true;
        theNode = res.activityCode;
      } else {
        res.selected = false;
      }
    });
    this.nodes = this.nodes.slice();

    this.$emit("nodesSwitch", theNode);
  }

  get showQrcode() {
    let user: any = sessionStorage.getItem("user");
    if (!user) {
      return;
    }
    user = JSON.parse(user);

    const syncTypeIsCloudPivot =
      user.relatedType === "DINGTALK" || user.relatedType === "WECHAT";
    // console.log(this.$store.state.config.isCloudPivot,'this.$store.state.config.cloudPivot');
    if (!syncTypeIsCloudPivot) {
      return false;
    }
    // ;
    if (!this.formObj.bizSheet) {
      return false;
    }
    // 表单二维码码默认开启
    if (
      this.formObj.bizSheet.qrCodeAble === "open" ||
      !this.formObj.bizSheet.qrCodeAble
    ) {
      return true;
    }
    return false;
  }

  created() {
    const user = sessionStorage.getItem("user");
    if (!user) {
      this.getUserInfo();
    }

    this.isInIframe = window.top !== window.self;

    // this.showTrack= (this.formObj.bizObject.loadedFromDb && this.formObj.formPermission.actionPermission.formTrack) ? true : false ;
  }

  get showTrack() {
    return this.formObj &&
      this.formObj.bizObject &&
      this.formObj.formPermission &&
      this.formObj.formPermission.actionPermission &&
      this.formObj.bizObject.loadedFromDb &&
      this.formObj.formPermission.actionPermission.formTrack
      ? true
      : false;
  }

  mounted() {
    document.addEventListener("click", this.outFocus);
  }

  destoryed() {
    document.removeEventListener("click", this.outFocus);
  }
  outFocus() {
    this.showBigQrcode = false;
  }

  relatedType: string = "";
  @Watch("formObj", {
    immediate: true
  })
  onFormObjChange(formObj: any) {
    if (!formObj.bizSheet) return;

    const { workflowInstanceId, workItemId, workflowCode } = formObj;

    const { id, schemaCode, sheetCode, loadedFromDb } = formObj.bizObject;

    if (!this.$store) {
      return;
    }
    let user: any = sessionStorage.getItem("user");
    if (!user) {
      return;
    }
    user = JSON.parse(user);
    const config = {
      corpId: user.corpId,
      agentId: user.agentId,
      mobileServerUrl: user.mobileServerUrl,
      relatedType: user.relatedType
    };
    // const { config } = this.$store.state;

    // if (!config) {

    // }

    const { corpId } = config;

    const { agentId } = config;

    const { relatedType } = config;

    this.relatedType = relatedType;

    this.isAdd = loadedFromDb;

    let signinUrl = "";
    // 数据来自数据库 生成查看表单
    if (loadedFromDb) {
      // 流程表单
      if (workflowInstanceId && workItemId) {
        // 新增
        signinUrl = `${
          config.mobileServerUrl
        }/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&corpId=${corpId}&agentId=${agentId}&mode=form`;
        if (this.nodes.length > 0) {
          signinUrl += "&isWorkFlow=true";
        }
      } else {
        // 业务表单
        signinUrl = `${
          config.mobileServerUrl
        }/?corpId=${corpId}&agentId=${agentId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&id=${id}&mode=form`;
      }

      // signinUrl =`${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&id=${id}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&corpId=${corpId}&agentId=${agentId}`;
    } else {
      // 查看
      // 数据无数据，生成新表单或者发起流程

      if (workflowCode) {
        // 发起流程
        signinUrl = `${
          config.mobileServerUrl
        }/?workflowCode=${workflowCode}&corpId=${corpId}&agentId=${agentId}&mode=form`;
      } else {
        // 新增业务表单
        signinUrl = `${
          config.mobileServerUrl
        }/?corpId=${corpId}&agentId=${agentId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&mode=form`;
      }
      // signinUrl =`${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&corpId=${corpId}&agentId=${agentId}`;
    }
    if (relatedType === "WECHAT") {
      this.relatedType = "WECHAT";
      // 企业微信端
      signinUrl = encodeURIComponent(signinUrl);
      signinUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${signinUrl}&state=STATE#wechat_redirect`;
    }
    const that = this;
    // const text: string = decodeURI(encodeURIComponent(signinUrl));
    // this.url= `${env.apiHost}/api/qrcode/generate_qrcode?text=${text}`;

    // 将图片二进制流转成base64，兼容IE11
    externalLinkApi.generateQrcode(signinUrl).then((res: any) => {
      let bytes = new Uint8Array(res);
      let data = "";
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        data += String.fromCharCode(bytes[i]);
      }
      that.url = "data:image/png;base64," + window.btoa(data);
    });

    //
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/themes/default.less";

.header {
  padding: 0 @base4-padding-lg!important;
  &-left {
    display: flex;
    align-items: center;
    h4 {
      font-size: 16px;
      color: #000;
      margin-bottom: 0;
    }
  }

  .header-right {
    display: flex;
    padding-right: 40px;
    align-items: center;
    & > div {
      margin-left: 25px;
      color: rgba(0, 0, 0, 0.65);
      i {
        margin-right: 8px;
      }
      &:hover {
        span {
          color: #2970ff;
        }
        cursor: pointer;
      }
      &.icon-close {
        margin-right: -16px;
        font-size: 16px;
        color: #d8d8d8;
      }
    }
  }
  &-dropdown {
    display: flex;
    align-items: center;
    margin-left: 16px;
    padding-left: 16px;
    height: 32px;
    border-left: 1px solid rgba(217, 217, 217, 1);
    .ant-dropdown-trigger {
      & > span {
        display: inline-block;
        max-width: 140px;
        margin-right: 3px;
        // width: 140px;
      }
    }
  }
  .qrcode {
    // margin-left: 33px;
    // margin-right: 16px;
    position: relative;
    & > img {
      width: 26px;
      cursor: url("~@/assets/images/enlarge-o.png"), pointer;
      margin: 2px;
    }
    .qrcode-enlarge {
      position: absolute;
      top: 28px;
      border: 1px solid rgba(221, 221, 221, 1);
      background: #fff;
      img {
        width: 250px;
        height: 250px;
        // max-height: 250px !important;
      }
      p {
        text-align: center;
        padding-bottom: 16px;
      }
      // left: 0;
      right: -1px;
    }
  }
  img.logo {
    cursor: pointer;
    max-height: 35px !important;
    margin-left: 24%;
  }

  & > div:first-child {
    // border-right: 1px solid rgba(217, 217, 217, 1);
    flex-grow: 1;
    display: flex;
    justify-content: space-between;

    a.aback {
      font-size: 18px;
      margin-right: 8px;

      &::after {
        content: "";
        height: 18px;
        width: 1px;
        background-color: #d8d8d8;
        display: inline-block;
        position: relative;
        top: 3px;
        margin-left: 8px;
      }
    }
  }
}
</style>

<style lang="less">
.node-switch-menu-item {
  width: 180px;
  &.a-menu-item-active {
    background: rgba(240, 247, 255, 1);
    font-weight: 600;
  }
}
.wy_home_to {
  margin: 0 auto;
  width: 50%;
  min-height: 64px;
  position: relative;
  left: 0;
  float: right;
  margin-right: 0px;
  li {
    display: inline;
    padding-top: 20px;
    width: 15%;
    float: left;
    text-align: center;
    .wyicon {
      background: url("./wyicon.png");
      width: 20px;
      height: 20px;
      display: inline-block;
      position: relative;
      top: 1px;
    }
    .wydl {
      position: relative;
    }
    .wydl::before {
      content: "";
      display: inline-block;
      height: 42px;
      width: 1px;
      position: absolute;
      top: -10px;
      left: -20px;
      background: #e1e1e1;
    }
    a {
      color: rgb(34, 34, 34);
      text-align: center;
      font-size: 15px;
      font-family: 微软雅黑;
    }
  }
}
</style>
