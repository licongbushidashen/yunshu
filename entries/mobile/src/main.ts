// import FastClick from 'fastclick';
import Vue from "vue";
import Router from "vue-router";
import App from "./App.vue";
import routes from "./routes";
import store from "./store";
import i18n from "./config/i18n";
import * as platform from "@cloudpivot/platform";
import { formApi } from "@cloudpivot/api";
import initFormComponent from "@cloudpivot/form/registerComponent";
import "./config/h3-mobile";
import Axios from "./config/axios";
// import './config/h3-form';
import "./config/api";
import * as dd from "dingtalk-jsapi";

// import '@/views/apps/report-service';
// localStorage.setItem('token', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYXBpIl0sImNvcnBJZCI6bnVsbCwidXNlcl9pZCI6ImFmZWIyMDRlN2I4NzM2NTcwMTdiOTRmZDUwNmMwN2YwIiwidXNlcl9uYW1lIjoiYmRzIiwic2NvcGUiOlsicmVhZCJdLCJtb2JpbGUiOmZhbHNlLCJpc0FkbWluIjp0cnVlLCJleHAiOjE2MzY3NDE3MzYsImlzQXBwQWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyJVU0VSIiwiQVVUSF9TWVNURU1fTUFOQUdFIl0sImp0aSI6ImY1MmJiOWM2LWQyMDktNDkwNi1iNDNjLWEzYjUwNjc0OGE5ZiIsImNsaWVudF9pZCI6ImFwaSJ9.bVthyTjclvLCFcQjZmo-ZBCVQRjmPwosaIVmg09ruBc3Np1OVptv6pT48f3T_zsKXa-Ej7M8OZGycbpg5kxzvKnizxHuY-4ckm21sJs2E_2kJ2zOe2_tag9jpOSzZfkHvcZDLTYxS7cp2m12D1499jZfkEp_NprLI0-GbPYgevbY2hFDZHqHB-P3Cb4pSIMTMwhSvMp75xsJLAWMxz9_epwV1I80bYycqw1qItCOlmzf4gV19ktILhiYjbho8a7sxfUb4K1dl4hoGtP8B-ur4OvkAnXxYV8RIgYE2HqlY_S5J3lwasaFQrgXh3SQZ0Nnr9EOpN0BVj7GHursfJkWvg')
import "h3-mobile-vue/lib/theme/h3-mobile-vue.css";
import "./lib/rem";

import "./directives/hight-light";
import "./directives/slider-left";

import * as FormCommentIns from "@cloudpivot/api";

// 钉钉设置title
import zh from "./locale/common.zh-CN";
import en from "./locale/common.en-US";

let importReportService = false;
initFormComponent();
const titleMap: any = {
  zh,
  en
};
// 钉钉设置title

// 钉钉授权导入
import env from "@/config/env";

import OauthApi from "@/apis/oauth";
// 钉钉授权导入__End

// 钉钉全局返回监听
import Back from "@/config/back";

// vconsole 调试 start
// if (true) {
//   /* eslint-disable-next-line */
//   const VConsole = require('vconsole');
//   new VConsole();
// }
// vconsole 调试 end

// if ('addEventListener' in document) {
//   document.addEventListener('DOMContentLoaded', () => {
//     FastClick.attach(document.body);
//   }, false);
// }
Vue.config.productionTip = false;

Vue.use(Router);

window.Environment = {
  corpId: "",
  agentId: "",
  messageId: "",
  appCode: "",
  messageJson: null,
  isDingTalk: platform.IS_DINGTALK
};
Vue.prototype.getPopupContainer = (triggerNode: any) => {
  // console.log(triggerNode,'triggerNodetriggerNode',triggerNode.parentNode)
  return triggerNode.parentNode.parentNode;
};
/**
 * 设置路由集合
 * @param routeName 目标路由的名称
 */
function setRoute(routeName: string, options: any = {}) {
  let routeIndex = -1;
  // 寻找匹配的单个路由
  const route: any = routes.find((r: any, idx: number) => {
    if (r.name === routeName) {
      routeIndex = idx;
      return r;
    }
  });
  if (route) {
    // 如果是表单详情，则清空路由数组，仅保留表单详情并带入查询参数
    if (routeName === "form-detail") {
      const formRoutes = require("./routes/form");
      routes.splice(0, routes.length);
      routes.push({
        ...route,
        query: options.query
      });
      routes.push(...formRoutes.default);
      return;
    }
    // 普通路由设置，则将该路由重置为默认根路径的路由
    routes.splice(routeIndex, 1);
    routes[0] = Object.assign({}, route, { path: "/" }, options);
  }
}

/**
 * 设置移动端默认首页地址
 */
const setDefaultHomeAddress = () => {
  const {
    appCode,
    mode,
    messageId,
    messageJson,
    sheetCode,
    schemaCode,
    id,
    sCode
  } = window.Environment;
  // 包含单应用的编码，进入单应用
  if (appCode) {
    setRoute("singleApp");
  }
  // 进入通知消息页面——表单详情
  else if (messageId) {
    setRoute("form-detail", {
      query: messageJson
    });
  }
  // 进入发起流程填写表单页——表单详情
  else if (mode === "create") {
    try {
      const query = JSON.parse(
        `{"${window.location.search.replace("?", "")}"}`.replace(/&/g, '","').replace(/=/g, '":"')
      );
      setRoute("form-detail", {
        query
      });
    } catch (error) {
      console.error(error);
    }
  }
};

/**
 * 启用Vue实例挂载
 */
const startApp = () => {
  setDefaultHomeAddress();
  // alert('wait---:'+ JSON.stringify(routes[0]));
  const router = new Router({
    // mode: 'history',
    base: process.env.BASE_URL,
    routes
  });
  window.Environment.historyLength = 0;
  router.beforeEach((to, form, next) => {
    if (to.path === "/signature" && to.query.T) {
      localStorage.setItem("token", to.query.T as string);
    }
    if (to.name === "apps-report" && !importReportService) {
      importReportService = true;
      import("@/views/apps/report-service");
    }

    if (to.name === "singleApp") {
      const appName: string = window.Environment.appName || "";
      if (appName) {
        platform.service.setTitle(appName);
      }
    } else {
      const title: string = to.meta.title; // || '云枢';
      const titleKey: string = to.meta.titleKey; // 通过这个key值去映射国际化标题
      if (titleKey) {
        const locale: string = ((window as any).localStorage.getItem("locale") as string) || "zh";
        const t: string = titleMap[locale][titleKey];

        platform.service.setTitle(t);
        // setTitle(t);
      } else if (title) {
        platform.service.setTitle(title);
        // setTitle(title);
      }
    }
    window.Environment.historyLength += 1;
    if (!to.name && /unfinishedWorkitem/.test(to.path)) {
      // next({ name: "workitems" });
      next();
    } else {
      next();
    }
  });
  new Vue({
    router,
    i18n,
    store,
    created() {
      // 会导致无法跳转到目标路由
      const {
        appCode,
        mode,
        messageId,
        messageJson,
        schemaCode,
        sheetCode,
        id,
        workflowInstanceId,
        workItemId,
        workflowCode,
        sCode
      } = window.Environment;
      // if (window.history.length <= 1 && !(this.$route.query.goindex || appCode || mode || messageId)) {
      //   this.$router.replace({ path: window.location.pathname.replace(process.env.BASE_URL, '') + window.location.search, query: Object.assign({}, this.$route.query, { goindex: 'true' }) });
      // }
      // 从钉钉通知到达
      if (messageId) {
        if (messageJson.url) {
          window.location.href = messageJson.url;
        } else {
          router.replace({
            path: "/form/detail/",
            query: messageJson
          });
        }
      } else if (mode === "create") {
        // 从发起表单到达
        const params = window.location.search;
        router.replace({
          path: `/form/detail/${params}`
        });
      } else if (mode === "form") {
        if (workflowInstanceId && workItemId) {
          // 流程表单
          const params = {
            workflowInstanceId,
            workitemId: workItemId
          };
          router.replace({
            name: "form-detail",
            // path: '/form/detail/',
            query: params
          });
        } else if (workflowCode) {
          // 发起流程
          router.replace({
            name: "form-detail",
            // path: '/form/detail/',
            query: {
              startWorkflowCode: workflowCode
            }
          });
        } else if (schemaCode) {
          // 查看业务表单
          const params: any = {
            schemaCode,
            sheetCode
          };
          if (id) {
            params.objectId = id;
          }
          router.replace({
            path: "/form/detail/",
            query: params
          });
        }
      } else if (sCode) {
        // 批量打印二维码扫码查看表单
        // 通过短码去获取相关参数
        OauthApi.getShortCode(sCode).then((sCodeRes: any) => {
          if (sCodeRes.errcode === 0) {
            const json: any = JSON.parse(sCodeRes.data.pairValue);
            // const { sheetCode, schemaCode, id } = json;
            if (json.sheetCode && json.schemaCode && json.id) {
              const qrcodeParams: OAuth.GetFormUrlParams = {
                formCode: json.sheetCode,
                schemaCode: json.schemaCode,
                bizObjectId: json.id
              };
              OauthApi.getFormUrl(qrcodeParams).then((res: any) => {
                if (res) {
                  router.replace(res);
                }
              });
            }
          } else {
            console.log(sCodeRes.errmsg);
          }
        });
      }
    },
    mounted() {
      if (platform.IS_DINGTALK) {
        // const back = require('./config/back');
        this.$nextTick(() => {
          // back.default();
          Back();
        });
      }
    },
    render: h => h(App)
  }).$mount("#app");
  Vue.prototype.router = router;
};

/**
 * 获取消息打开地址
 */
const getMessageUrl = async (messageId: any) => {
  const params: OAuth.FormUrlParams = {
    messageId: window.Environment.messageId
  };

  const token = localStorage.getItem("token");
  // const res = await OauthApi.getFormUrl(params);
  const res = await formApi.getMessageFormUrl(params);
  if (res.errcode === 0 && res.data) {
    // alert('获取消息参数结果：'+ res.data);
    // 跳转到消息地址或者第三方浏览器直接打开地址
    const { bizObjectId, workItemId, workflowInstanceId, schemaCode, sheetCode, url } = res.data;

    window.Environment.messageJson = {
      objectId: bizObjectId,
      workitemId: workItemId,
      workflowInstanceId,
      T: token,
      schemaCode,
      sheetCode,
      url
    };
    startApp();
  }
};

export function init() {
  let acce = getQueryVariable("accessToken");
  let acce1=localStorage.getItem('accessToken');
  if(acce){
    if(acce!=acce1){
      localStorage.removeItem('token')
      localStorage.setItem("accessToken", `${acce}`);
    }
  }

  // if (acce) {
  //   localStorage.setItem("accessToken", `${acce}`);
  // }

  if (window.location.href.indexOf("#/login") == -1) {
    if(acce){
      localStorage.setItem("wyyurl", `${window.location.href}`);
    }if(!localStorage.getItem('wyyurl')){
        localStorage.setItem("wyyurl", `${window.location.href}`);
    }
  }

  platform.start(env.client_id, env.scope).then((result: any) => {
    console.log(result, "main init error");
    const { query } = result;
    const token = localStorage.getItem("token");
    // platform.IS_DINGTALK &&

    if (platform.IS_DINGTALK && !localStorage.getItem("jobnumber")) {
      loadData();
    } else {
      if (!token && query.messageId) {
        localStorage.setItem(
          "isShowEmailResquest",
          `${env.portalHost}/mobile/?messageId=${query.messageId}`
        );

        const theUrl = `${env.portalHost}/mobile/#/login?accessToken=${localStorage.getItem(
          "accessToken"
        )}`;
        window.location.href = theUrl;
      }
      if (token) { 
        window.Environment = query;
        FormCommentIns.FormCommentApi.getUserInfo().then((res: any) => {
          if (res.errcode === 0) {
            sessionStorage.setItem("user", JSON.stringify(res.data));
          }
        });
        if (query.messageId) {
          getMessageUrl(query.messageId);
        } else {
          // alert('开始请求消息参数:消息id：'+window.Environment.messageId);
          startApp();
        }
      } else {
        startApp();
      }
    }
  });
}
function getQueryVariable(variable) {
  var query = window.location.href.split("?")[1];
  if (!query) {
    return false;
  }
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return false;
}
init();
async function loadData() {
  var userInfos = false;
  var serviceType = "";
  if (!userInfos) {
    await GetCode((code: any) => {
      serviceType = code;
    });
    // 获取企业内部应用的access_token,

    let access_token = await Axios.get(
      "/ddapi/gettoken?appkey=dinggvcm3deyv1tboa4v&appsecret=PJhuuVMpdEfdUmvpROAk1l9jm21n9E_DCWb2pGF97v9KIe-2H4wX6G8xlj973eiU"
    )
      .then((response: any) => {
        return response.access_token;
      })
      .catch((err: Error) => {});
    // 通过免登码和access_token获取用户信息
    let userId = await Axios.get(
      `/ddapi/user/getuserinfo?access_token=${access_token}&code=${serviceType}`
    )
      .then((res: any) => {
        return res.userid;
      })
      .catch((err: Error) => {});
    // 通过userId和access_token获取用户详情
    Axios.get(`/ddapi/user/get?access_token=${access_token}&userid=${userId}`)
      .then((res: any) => {
        localStorage.setItem("jobnumber", `${res.jobnumber}`);
        const theUrl = `${env.portalHost}/mobile/#/login?jobnumber=${res.jobnumber}`;
        // const theUrl = `http://localhost:8089/mobile/#/login?jobnumber=${res.jobnumber}`;
        window.location.href = theUrl;
        window.location.reload();
      })
      .catch((err: Error) => {});
  } else {
  }
}

function GetCode(callback) {
  const corpId = "ding97a70c201a7533a335c2f4657eb6378f"; //钉钉企业id
  if (dd.env.platform !== "notInDingTalk") {
    dd.ready(() => {
      dd.runtime.permission.requestAuthCode({
        corpId: corpId,
        onSuccess: info => {
          callback(info.code);
        },
        onFail: err => {}
      });
    });
  }
}
