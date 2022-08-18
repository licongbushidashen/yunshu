<template>
  <div class="footer">
    <div>
      <div class="footer-left">
        <slot name="isSaveData"></slot>
      </div>

      <div class="footer-right">
        <!-- 提交并继续 -->
        <slot name="upAndCreate"></slot> 

        <slot></slot>
      </div>
    </div>

    
    
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { Button, Dropdown, Menu, Icon, Checkbox } from '@h3/antd-vue';

import { Getter } from 'vuex-class';
import site from '@/config/site';
import dd from 'dingtalk-jsapi';
import env from '@/config/env';

import { externalLinkApi } from '@cloudpivot/api';

import OAuthApi from '@/apis/oauth';

@Component({
  name: 'form-detail-footer',
  components: {
    AButton: Button,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AIcon: Icon,
    ACheckbox: Checkbox
  },
})
export default class FormDetailFppter extends Vue {
  @Getter('getAntLocale') locale!: string;

  @Prop() formObj!: any;

  @Prop() nodes!: any;

  showBigQrcode = false;

  url = '';

  get logo() {
    return site.logo;
  }

   /**
   * 是否是外链
   */
   get isEl():boolean {
    return !!(window as any).externalLinkToken;
  }

  async getUserInfo() {
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      sessionStorage.setItem('user', JSON.stringify(info));
      this.onFormObjChange(this.formObj);
    }
  }

  // 跳转到首页
  goHome() {
    const appCode = (window as any).Environment
      ? (window as any).Environment.appCode
      : null;
    if (appCode) {
      this.$router
        .push({
          name: 'singleApp',
          params: {
            appCode,
          },
        })
        .catch((err: any) => {
          err;
        });
    } else {
      this.$router.push({ name: 'myUnfinishedWorkItem' }).catch((err: any) => {
        err;
      });
    }
  }

  isAdd = false;

  back() {
    const url = this.$route.query.return as string;
    if (url) {
      this.$router
        .push({
          path: url,
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
      navigator.userAgent.indexOf('MSIE') >= 0 &&
      navigator.userAgent.indexOf('Opera') < 0
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
        navigator.userAgent.indexOf('Firefox') >= 0 ||
        navigator.userAgent.indexOf('Opera') >= 0 ||
        navigator.userAgent.indexOf('Safari') >= 0 ||
        navigator.userAgent.indexOf('Chrome') >= 0 ||
        navigator.userAgent.indexOf('WebKit') >= 0
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

  closeIframe(){
    window.parent.postMessage('close', '*')
  }
  copyURL(){ // 复制链接
    try {
      let href:any = location.href
      let iframeAction:any = href.match(/%26iframeAction%3Ddetail/g)
      if(Array.isArray(iframeAction) && iframeAction.length > 1){
        for(let i = 0; i < iframeAction.length - 1;i++){
          href = href.replace('%26iframeAction%3Ddetail', '')
        }
      }
      let oInput = document.createElement('input')
      oInput.value = href
      document.body.appendChild(oInput)
      oInput.select()
      document.execCommand('Copy')
      oInput.style.display = 'none'
      this.$message.success('复制成功')
    } catch (error) {
      this.$message.error('复制失败')
    }
  }

  openBlank() {
    let href:any = location.href
    let iframeAction:any = href.match(/%26iframeAction%3Ddetail/g)
	    if(Array.isArray(iframeAction) && iframeAction.length > 1){
	      for(let i = 0; i < iframeAction.length - 1;i++){
	        href = href.replace('%26iframeAction%3Ddetail', '')
	      }
	    }

    const url = `${href}${
      href.indexOf("?") > -1 ? "&" : "?"
    }T=${localStorage.getItem("token")}`;

    window.open(url, "_blank");
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
    const theNode = this.nodes.find((res) => res.selected);
    if (theNode) {
      return theNode.activityName;
    }
    return '';
  }

  nodesSwitch(index: number) {
    if (this.nodes[index].selected) return;
    let theNode = '';
    this.nodes.forEach((res, idx) => {
      if (idx === index) {
        res.selected = true;
        theNode = res.activityCode;
      } else {
        res.selected = false;
      }
    });
    this.nodes = this.nodes.slice();

    this.$emit('nodesSwitch', theNode);
  }

  get showQrcode() {
    let user: any = sessionStorage.getItem('user');
    if (!user) {
      return;
    }
    user = JSON.parse(user);

    const syncTypeIsCloudPivot = user.relatedType === 'DINGTALK' || user.relatedType === "WECHAT";
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
      this.formObj.bizSheet.qrCodeAble === 'open' ||
      !this.formObj.bizSheet.qrCodeAble
    ) {
      return true;
    }
    return false;
  }

  created() {
    const user = sessionStorage.getItem('user');
    if (!user) {
      this.getUserInfo();
    }
  }

  mounted() {
    document.addEventListener('click', this.outFocus);
  }

  destoryed() {
    document.removeEventListener('click', this.outFocus);
  }
  outFocus() {
    this.showBigQrcode = false;
  }

  relatedType:string = ''
  @Watch('formObj', {
    immediate: true,
  })
  onFormObjChange(formObj: any) {
    if (!formObj.bizSheet) return;

    const { workflowInstanceId, workItemId, workflowCode } = formObj;

    const { id, schemaCode, sheetCode, loadedFromDb } = formObj.bizObject;

    if (!this.$store) {
      return;
    }
    let user: any = sessionStorage.getItem('user');
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

    const { relatedType } = config

    this.isAdd = loadedFromDb;

    let signinUrl = '';
    // 数据来自数据库 生成查看表单
    if (loadedFromDb) {
      // 流程表单
      if (workflowInstanceId && workItemId) {
        // 新增
        signinUrl = `${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&corpId=${corpId}&agentId=${agentId}&mode=form`;
        if (this.nodes.length > 0) {
          signinUrl += '&isWorkFlow=true';
        }
      } else {
        // 业务表单
        signinUrl = `${config.mobileServerUrl}/?corpId=${corpId}&agentId=${agentId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&id=${id}&mode=form`;
      }

      // signinUrl =`${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&id=${id}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&corpId=${corpId}&agentId=${agentId}`;
    } else {
      // 查看
      // 数据无数据，生成新表单或者发起流程

      if (workflowCode) {
        // 发起流程
        signinUrl = `${config.mobileServerUrl}/?workflowCode=${workflowCode}&corpId=${corpId}&agentId=${agentId}&mode=form`;
      } else {
        // 新增业务表单
        signinUrl = `${config.mobileServerUrl}/?corpId=${corpId}&agentId=${agentId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&mode=form`;
      }
      // signinUrl =`${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&corpId=${corpId}&agentId=${agentId}`;
    }
    if(relatedType === "WECHAT"){
      this.relatedType = "WECHAT"
      // 企业微信端
      signinUrl = encodeURIComponent(signinUrl)
      signinUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${signinUrl}&state=STATE#wechat_redirect`
    }
    const that = this;
    // const text: string = decodeURI(encodeURIComponent(signinUrl));
    // this.url= `${env.apiHost}/api/qrcode/generate_qrcode?text=${text}`;

    // 将图片二进制流转成base64，兼容IE11
    externalLinkApi.generateQrcode(signinUrl).then((res: any) => {
      let bytes = new Uint8Array(res);
      let data = '';
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        data += String.fromCharCode(bytes[i]);
      }
      that.url = 'data:image/png;base64,' + window.btoa(data);
    });

    // 
  }
}
</script>


<style lang="less" scoped>
@import '~@/styles/themes/default.less';

.footer {
  padding: 0 @base4-padding-lg!important;
  position: fixed;
  z-index: 100;
  left: 0;
  right: 0;
  bottom: 0;
  height: 52px;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-top: 1px solid rgba(232,232,232,1);
  &-left {
    display: flex;
    align-items: center;
    h4{
      font-size: 16px;
      color: #000;
      margin-bottom: 0;
    }
  }

  .footer-right{
    display: flex;
    &>div{
      margin-left: 8px;
      color: rgba(0, 0, 0, 0.65);
      i{
        margin-right: 8px;
      }
      &:hover{
        span{
          color: #2970FF;
        }
        cursor: pointer;
      }
      &.icon-close{
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
      cursor: url('~@/assets/images/enlarge-o.png'), pointer;
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
    max-height: 30px !important;
  }

  & > div:first-child {
    // border-right: 1px solid rgba(217, 217, 217, 1);
    flex-grow: 1;
    display: flex;
    justify-content: center;

    a.aback {
      font-size: 18px;
      margin-right: 8px;

      &::after {
        content: '';
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
</style>
