<template>
  <div class="login-account" :class="{ 'login-err-box': passwordErr }">
    <div class="login-account-login">
      <img src="./logo.svg" />
    </div>
    <div class="login-account-form">
      <login-input
        :placeholder="'请输入账号'"
        :lable="'账号'"
        v-model="userName"
        @change="becanLogin"
        :type="'text'"
      />

      <login-input
        :placeholder="'请输入密码'"
        :lable="'账号密码'"
        class="login-last-input"
        v-model="passWord"
        @change="becanLogin"
        :type="'password'"
      />
    </div>

    <div class="login-account-button">
      <h3-button @click="login"> 登&nbsp;录 </h3-button>
    </div>

    <div class="login-forget-tips clearfix">
      <span @click="toggle">忘记密码</span>
    </div>

    <div>
      <h3-dialog v-model="showToast" class="dialog-main">
        <div>
          <div class="dialog-content">
            <p>请联系系统管理员重置密码</p>
          </div>

          <div class="dialog-footer">
            <span @click="showToast = false">确定</span>
          </div>
        </div>
        <!-- <div @click="showToast=false">
          <span class="h3-close"></span>
        </div> -->
      </h3-dialog>
    </div>
    <div>
      <h3-dialog v-model="showTips" class="dialog-main">
        <div>
          <div class="dialog-content">
            <p>请先选择组织</p>
          </div>
          <div class="dialog-footer">
            <span @click="showTips = false">确定</span>
          </div>
        </div>
      </h3-dialog>
    </div>
  
    <div class="switch-org">
      <p> {{ orgName }} </p>
      <h3-radio-list
        showMode="0"
        :defaultValue="autoSelect"
        :options="options"
        title="切换组织"
        :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
        :clearText="$t('cloudpivot.form.renderer.clear')"
        :confirmText="$t('cloudpivot.form.renderer.ok')"
        @onShow="show"
        @onHide="close"
        @onChange="onChange"
        @onClear="onChange"
      >
      </h3-radio-list>
    </div>

  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import OAuthApi from "./oauth-api";

import env from "@/config/env";

import LoginInput from "./login-input.vue";

import { H3Input, H3Button, datetime, H3Modal, H3RadioList  } from "h3-mobile-vue";

import H3Dialog from "h3-mobile-vue/src/components/h3-dialog/index";

import common from '@cloudpivot/common';
import Axios from 'axios';
enum loginError {
  passwordErr = 1000,
  overThreeErr = 10001
}

@Component({
  name: "login-account",
  components: {
    LoginInput,
    H3Button,
    H3Dialog,
    H3Modal,
    H3RadioList
  }
})
export default class LoginAccount extends Vue {
  @Prop({
    default: false
  })
  toggleMode!: boolean;

  redirectUrl: string = ""; // 登陆回跳地址

  getTokenParams: any = {
    code: "",
    url: "",
    client_secret: "",
    client_id: "",
    redirect_uri: ""
  };

  depts: any[] = [];

  deptId : string = '';

  corpId = '';

  config : any = null;

  options: any = [];


  orgName: string = '';

  showModal: boolean = false;

  autoSelect:any = '';

  showTips:boolean = false;

  show() {
    this.showModal = true;
  }

  close() {
    this.showModal = false;
  }

  onChange(value: any) {
    if(value && value.key && value.label ){
      this.onDeptChange(value.key,value.label)
    }
  }

  passwordErr: boolean = false; // 账户密码错误

  passwordType: string = "password"; // 密码的展示形式

  showPassword: boolean = false;

  overflowTips: boolean = false; // 密码输入已超过3次提示

  loginDisabled: boolean = false; // 登录禁用状态

  userName: string = ""; // 登录账号

  passWord: string = ""; // 登录密码

  visible: boolean = false; // 忘记密码提示窗

  async mounted(){
    const res:  any= await OAuthApi.getDepts();
      if (res.errcode !== 0) {
       this.showError(res.errmsg);
        return;
      }

      this.depts = res.data;
      this.options = [];
      let optList = {};
      res.data.forEach((r:any)=>{
        optList = {
          key:r.corpId,
          value:r.name || '主组织',
          label:r.name || '主组织'
        }
        this.options.push(optList);
      });
      this.autoSelect = this.options[0].label;
      if(this.depts.length > 0){
        let deptId = this.depts[0].corpId;
        if(this.$route.query.deptId){
          deptId = this.$route.query.deptId;
        }
        this.deptId = deptId;
        this.onDeptChange(this.deptId,this.depts[0].name);
      }
  }

   onDeptChange(deptId: string,name:string){
   const dept = this.depts.find(d => d.corpId === deptId);
    if(!dept){
      this.showError("找不到组织机构记录");
      return;
    }
    this.corpId = dept.corpId;
  }



  created() {
    this.generateUrls();
  }

  /**
   * 初始化地址和固定传参
   */
  generateUrls() {
    const { oauthHost, client_id, scope, secret, redirectHost } = env;
    // ;
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
    // ;
    if (this.userName && this.passWord) {
      this.loginDisabled = true;
    } else {
      this.loginDisabled = false;
    }
  }

  /**
   * 账户密码登录
   */
  async login() {
    if (!this.loginDisabled) {
      return;
    }
    this.passwordErr = false;
    // rsa加密
    const result = await OAuthApi.getRsaKey();
    const flag:boolean = typeof result === 'object' && result.hasOwnProperty('index') && result.hasOwnProperty('key');
    if (!flag) {
      return;
    }
    const { index, key } = result;
    const password:any = common.utils.RsaEncrypt(this.passWord, key);
    // rsa加密结束
    const params = {
      corpId: this.corpId,
      username: this.userName,
      password,
      url: this.redirectUrl,
      portal: true,
      index
    };
    const res = await OAuthApi.login(params);
    if (res.errcode === 200 && res.code) {
      this.getTokenParams.code = res.code;
      this.getToken(this.getTokenParams);
    } else if (res.errcode === loginError.passwordErr) {
      this.passwordErr = true;
      this.showError("用户名或密码错误，请重新输入");
    } else if (res.errcode === loginError.overThreeErr) {
      this.passwordErr = true;
      this.overflowTips = true; // 超过3次
      this.showError("密码输入错误已超过3次,请1分钟后再尝试");
    } else if (res.errcode === 1001) {
      this.showError(res.errmsg);
    }
  }

  showError(text: string) {
    this.$h3.toast.show({
      text,
      autoHide: true,
      iconType: text.length < 8 ? "close" : ""
    });
  }

  /**
   * 获取token
   */
  async getToken(params: any) {
    const res = await OAuthApi.getToken(params);
    if (res && res.success) {
      // ;
      const token = (res as any).access_token;
      const refresh_tokens = (res as any).refresh_token;
      const expireTime = (res as any).exp;

      localStorage.setItem("refresh_token", refresh_tokens);
      localStorage.setItem("expireTime", expireTime);
      localStorage.setItem("token", token);
      await this.getUserInfo();
      const isShowEmailResquest = localStorage.getItem('isShowEmailResquest');
      if(isShowEmailResquest){
          window.location.href = isShowEmailResquest;
      }else{
        this.$router.push({ name: "home" }).catch((err: any) => {err});
      }
    }
  }
  showToast = false;
  toggle() {
    // this.showError('请联系系统管理员重置密码');
    this.showToast = true;
  }
  async getUserInfo() {
    const res: any = await Axios.get("/api/organization/user/info_login");
    if (res.errcode === 0) {
      const info:any = res.data;
      sessionStorage.setItem('user', JSON.stringify(info));
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.login-account {
  background: #fff;
  overflow: hidden;
  height: 100%;
  height: 100%;
  .login-account-login {
    padding-top: 2rem;
    padding-bottom: 1.76rem;
    img {
      width: 1.86rem;
    }
  }
  .login-account-form {
    margin: 0 0.86rem;
    .login-last-input {
      margin-top: 0.387rem;
    }
  }
  .login-account-button {
    margin: 0 0.86rem;
    margin-top: 1.6rem;
    /deep/.h3-button {
      border-radius: 47px;
      background-color: @primary-color;
      color: #fff;
    }
  }
  .login-forget-tips {
    margin: 0 0.86rem;
    padding-top: 0.63rem;
    span {
      float: right;
      color: rgba(153, 153, 153, 1);
      font-size: 0.373rem;
    }
  }
  .dialog-main {
    border-radius: 0.186rem;
    .dialog-footer {
      span {
        line-height: 1.33rem;
        color: @primary-color;
        font-size: 0.453rem;
      }
      position: relative;
      .hairline("top", rgba(221, 221, 221, 1));
    }
    .dialog-content {
      min-height: 2.266rem;
      display: flex;
      justify-content: center;
      // justify-items: center;
      align-items: center;
      p {
        font-size: 0.4rem;
        color: rgba(51, 51, 51, 1);
      }
    }
  }

  .switch-org {
    margin: 1rem 0.35rem 1rem 0.5rem;
    p {
      margin-bottom: 0.2rem;
      font-size: 0.4rem;
    }
  }

}
</style>
