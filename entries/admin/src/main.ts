import "babel-polyfill";
import Vue from "vue";
import App from "./app.vue";
import router from "./router/";
import store from "./store/";
import Filters from "./common/filters";
import { i18n } from "./config/i18n";
import "./config/print";
import "./config/index";
import "./config/h3-form";

import "./styles/index.less";

import "./directives/hight-light";
import "./directives/ellipsis";

import env from "./env";
Vue.config.devtools = true;
// localStorage.setItem('token', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYXBpIl0sImNvcnBJZCI6bnVsbCwidXNlcl9pZCI6ImFmZWIyMDRlN2I4NzM2NTcwMTdiOTRmZDUwNmMwN2YwIiwidXNlcl9uYW1lIjoiYmRzIiwic2NvcGUiOlsicmVhZCJdLCJtb2JpbGUiOmZhbHNlLCJpc0FkbWluIjp0cnVlLCJleHAiOjE2NDA4NTg3MzIsImlzQXBwQWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyJVU0VSIiwiQVVUSF9TWVNURU1fTUFOQUdFIl0sImp0aSI6IjBhYWViYTVkLTQzNGYtNGQ0ZS1hNWY0LThhNDczZTAxMWFkOCIsImNsaWVudF9pZCI6ImFwaSJ9.cn5y3eDXV8B32gSR2kuC64WMD4DS-JDlBUXrzXPvpFB107iXmAvV3efNebSvZ4Pk_ohKe_zUEGRuUPuj9divRxsBDUXdquRW-dOPZ9BRvWVv2Ng1XwrrZ8a9JtlddoF8vfaAGaP2T0lOV_uueWN15iclfrBOoUTguw1lqi3Zh7zHu05ZOTuNuIIp-eSuI7bZ_rIhv3wIt5AZWYcnhPYUbqKYz4v4VZb5Ewks120KfTjBtXB6-b2LAX_gGZc_REzp2LynSVAIm4abPWMJyPTMh4Np5q2bRdXpH5YTeok8Y-xqLOChzMVdtfJGP2i_hIk5E3qFSHPcYdBX-d5IM20GXQ')
import { parseSearch, parseUrlParam, getParamObj } from "./common/utils";

import OAuthApi from "./apis/oauth";
import { getUserInfoLogin } from "./apis/organization";

import initFormComponent from "@cloudpivot/form/registerComponent";

import { Base64 } from "js-base64";
import { utils } from "@cloudpivot/common";

initFormComponent();
// 配置全局的校验默认规则
(window as any).$defaultRuleOptions = {
  local: "cn", // 语言 默认中文 （暂时不支持）
  errMsg: () => ({
    // 默认的错误提示
    required: "字段不能为空",
    noRegexp: "没有找到正则规则",
  }),
  cnChart: false, // 中文字节 true 算两个字节，false算一个字节
  formRegexp: {},
  error: () => {},
  success: () => {},
};

// const token:any = localStorage.getItem('token');

// if(!token) {
//   window.location.href = OAuthApi.OAuthLoginUrl;
// }

/**
 * 下拉元素绑定再元素节点下
 */
Vue.prototype.getPopupContainer = (triggerNode: any) => {
  return triggerNode.parentNode
};

// 钉钉应用跳转后台免登
const admin_token = parseUrlParam(window.location.href, "admin_token") || getParamObj(window.location.href, "T");

let query = utils.parseQuery();
query.T = admin_token;
utils.copyURL(query,'admin');

if (window.location.hash.endsWith("/oauth")) {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("expireTime");

  // const code = parseUrlParam(window.location.href, 'code');
  const query = parseSearch(window.location.search);

  const params: OAuth.RequestParams = {
    client_id: `${env.client_id}`,
    client_secret: `${env.secret}`,
    grant_type: "authorization_code",
    redirect_uri: `${env.redirectHost}`,
    code: query.code,
  };

  OAuthApi.getSSOToken(params).then((res) => {
    const token = (res as any).access_token;
    const refresh_tokens = (res as any).refresh_token;
    const expireTime = (res as any).exp;

    localStorage.setItem("refresh_token", refresh_tokens);
    localStorage.setItem("expireTime", expireTime);
    localStorage.setItem("token", token);
    window.location.href = env.redirectHost + query.state;
  });
} else {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = OAuthApi.OAuthLoginUrl;
  } else {
    getUserInfoLogin().then((res) => {
      if (res.errcode === 0) {
        setUserInfo(res.data);
        mount();
      } else {
        console.error(res.errmsg);
      }
    });
  }
}

function setUserInfo(info: any) {
  const isAppAdmin: boolean = info.permissions.includes("APP_MNG");
  const isSysAdmin: boolean = info.permissions.includes("SYS_MNG");
  const isRootAdmin: boolean = info.permissions.includes("ADMIN");
  window.sessionStorage.setItem("user", JSON.stringify(info)); // staff-selectot-base.ts 需要使用这个内容

  const isAdmin: boolean = isAppAdmin || isSysAdmin || isRootAdmin;
  const isOnlyAppAdmin: boolean = isAppAdmin && !isSysAdmin && !isRootAdmin;

  const isRoleManage: boolean = info.roleManage

  store.commit("System/User/setOnlyAppAdmin", isOnlyAppAdmin);
  store.commit("System/User/setIsAdmin", isAdmin);
  store.commit(
    "System/User/setIsJustAdmin",
    info.permissions.includes("ADMIN")
  );
  store.commit(
    "System/User/setIsRoleManage",
    isRoleManage
  )
}

function mount() {
  Object.entries(Filters).forEach(([k, v]) => {
    Vue.filter(k, v);
  });
  Vue.config.productionTip = false;

  const vm = new Vue({
    router,
    i18n,
    store,
    render: (h) => h(App),
  }).$mount("#app");
}
