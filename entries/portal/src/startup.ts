import Vue from "vue";
import Router from "vue-router";

import VueHtmlToPaper from "vue-html-to-paper";

import App from "./App.vue";
import store from "./store";
import i18n from "./config/i18n";
import axios from "axios";

// // 引入自定义指令
// import directives from './directives';

import env from "@/config/env";

import routes from "./routes";

import * as platform from "@cloudpivot/platform";

import "./config/api";
import "./config/antd";

import "./styles/index.less";

let importReportService = false;

/**
 * 页面禁用拖拽上传时 浏览器默认打开图片
 */
document.addEventListener(
  "drop",
  function(e) {
    e.preventDefault();
  },
  false
);

document.addEventListener(
  "dragover",
  function(e) {
    e.preventDefault();
  },
  false
);
export async function startup(environment: any) {
  // 地址参数上携带access_token的，将token存在localstorage并清理地址上的参数
  if (environment && environment.T) {
    // 通过token获取refresh_token，实现token续期
    await axios
      .post(`${env.oauthHost}/login/Authentication/get_refresh_token`, {
        access_token: environment.T
      })
      .then((res: any) => {
        if (res.errcode === 0 && res.data) {
          const refresh_tokens = (res as any).data.refresh_token;
          let expireTime = (res as any).data.expiration;

          // 时间戳如果为13位则单位是ms,把单位转为s
          if (expireTime.toString().length === 13) {
            expireTime = expireTime.toString().slice(0, -3);
          }

          localStorage.setItem("refresh_token", refresh_tokens);
          localStorage.setItem("expireTime", expireTime);
        }
      });
    //打开表单详情时不清理access_token, 原因为 解决钉钉打开流程表单点击同意后不关闭页面问题
    if (!window.location.href.includes("/form/detail?")) {
      const url = decodeURIComponent(window.location.href).replace("&T", "T");
      window.location.href = url.replace(`T=${environment.T}`, "");
    }
  }

  window.Environment = environment;
  window.Environment.isIe = /Trident/.test(navigator.userAgent);

  Vue.config.productionTip = false;
  Vue.use(Router);

  Vue.use(VueHtmlToPaper);

  // 单应用路由
  if (window.Environment.appCode) {
    (routes[0] as any).redirect = "/app-home";
  } else if (window.Environment.messageId) {
    // 消息路由
  }

  const router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes
  });

  Vue.prototype.router = router;

  router.beforeEach((to: any, from: any, next: any) => {
    // localStorage.setItem(
    //   "token",
    //   "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYXBpIl0sImNvcnBJZCI6bnVsbCwidXNlcl9pZCI6IjhhZTQ5Y2M0N2YzOTE3MWMwMTdmOTMwMDZlMzczMzNkIiwidXNlcl9uYW1lIjoiMDAwODE0Iiwic2NvcGUiOlsicmVhZCJdLCJtb2JpbGUiOmZhbHNlLCJpc0FkbWluIjp0cnVlLCJleHAiOjE2NDc1MzMzOTgsImlzQXBwQWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyJVU0VSIiwiQVVUSF9TWVNURU1fTUFOQUdFIl0sImp0aSI6ImZlYmY2MWMyLWVjYjctNDNkMy05NWZmLTkyNzMyY2U1YTI2ZCIsImNsaWVudF9pZCI6ImFwaSJ9.O1ngHbPcMLZNmWnQJ_DsUlO9aZk1wDxkx3qo_DCSPFhTzM4cpDNiAzjns36AKUhQIwVraX3VK3a0wtUHNSL8qwXxW5OuDbzK5jNAQjipcVK47NgmJbtPhMzsP_4rxYlLIOOCVvzbjVJ-oQeRVkWq8iyuJkcHpL7Uhhn6Lf6x7fxRDo8a0mqZFrRTBJ9JfhFoVm5f04Eq2ux3BEOiaD7tu0Wgw9RiB01BPaAedroQRXBRDwc0Fl_4SMZRFbA0jPu1eg1pkOZZghSWL-iU0X8Sl-x3mx3sS93TGGkMa8LYPQSjuY64m1skveiN3thAm8w5G6bNu_n3JUZ3r64pFgcfIw"
    // );
    let title = "之江实验室";
    if (to.meta && to.meta.title) {
      title = to.meta.title;
    }
    platform.service.setTitle(title);
    if (to.name === "appReport" && !importReportService) {
      importReportService = true;
      import("@/views/applications/report-service");
    }
    if (to.name === "applicationReport" && !importReportService) {
      importReportService = true;
      import("@/views/applications/report-service");
    }

    if (to.name === "applicationReport" && !importReportService) {
      importReportService = true;
      import("@/views/applications/report-service");
    }

    const token = localStorage.getItem("token");

    if (Vue.prototype.$httpRequestList.length > 0) {
      //强行中断时才向下执行
      Vue.prototype.$httpRequestList.forEach((item: any) => {
        item("interrupt"); //给个标志，中断请求
      });
    }
    if (!token) {
      oauth();
    }
    if (env.enableProxy) {
      next();
    } else {
      // document.title = to.meta.title;
      if (!token && to.name !== "login" && to.name !== "oauth") {
        // alert(JSON.stringify(to));
        // window.location.href = '/login';

        next({ name: "login" });
      }

      next();
    }
  });

  async function oauth() {
    const code = getQueryVariable("code");
    const globalSessionId = getQueryVariable("globalSessionId");
    // const code = "c1875736-8981-49bd-9f99-6b95a8e269d6";
    if (!code) {
      window.location.href = `${
        window.wyml.wyml.url
      }/oauth/v20/authorize?response_type=code&client_id=${
        window.wyml.wyml.ID
      }&scope=all&redirect_uri=${window.location.href.split("?")[0]}`;
    } else {
      localStorage.setItem("zj_code", code);
      localStorage.setItem("globalSessionId", globalSessionId);
    }
  }
  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  }
  // 全局注册自定义指令
  // Object.entries(directives).forEach((directive: any) => {
  //     const directiveName = directive[0];
  //     const directiveFunc = directive[1];
  //     Vue.directive(directiveName, directiveFunc);
  // });

  new Vue({
    router,
    i18n,
    store,
    render: (h: any) => h(App)
  }).$mount("#app");
}
