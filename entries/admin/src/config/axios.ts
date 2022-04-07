import Vue from "vue";
import axios from "axios";
import router from "@/router/";
import encryptApi from "@cloudpivot/common/src/utils/aes/index";

const CancelToken = axios.CancelToken;
Vue.prototype.$httpRequestList = [];

import env from "@/env";
// import OAuthApi from '../apis/oauth';

const prefixs = ["/api", "/logout"];

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    if (
      !env.enableProxy &&
      prefixs.some(
        (pre) => !!config.url && config.url.slice(0, pre.length) === pre
      )
    ) {
      config.url = `${env.apiHost}${config.url}`;
    }

    const expiration = localStorage.getItem("expireTime")
      ? localStorage.getItem("expireTime")
      : "";
    const refresh_token = localStorage.getItem("refresh_token");
    const nowDate = new Date().getTime();
    const isOther = /login\/Authentication\/get_refresh_token/g.test(
      config.url as string
    );
    // 距离超时时间20分钟时刷新token
    if (
      nowDate > parseInt(expiration as string) * 1000 - 1200000 &&
      !isOther &&
      nowDate <= parseInt(expiration as string) * 1000 &&
      refresh_token
    ) {
      const params = {
        url: `${env.oauthHost}`,
        client_id: "api",
        client_secret: `${env.secret}`,
        refresh_token,
      };
      axios
        .get(`${env.oauthHost}/login/Authentication/get_refresh_token`, {
          params,
        })
        .then((res: any) => {
          if (res) {
            const token = (res as any).access_token;
            const refresh_tokens = (res as any).refresh_token;
            const expireTime = (res as any).exp;

            localStorage.setItem("refresh_token", refresh_tokens);
            localStorage.setItem("expireTime", expireTime);
            localStorage.setItem("token", token);
          }
        });
    }
    // 每次发送请求之前检测sessionstorage存有token,那么都要放在请求头发送给服务器
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.cancelToken = new CancelToken((c) => {
      //强行中断请求要用到的
      Vue.prototype.$httpRequestList.push(c);
    });
    let isEncrypt: boolean = window.localStorage.getItem("isEncrypt") === '1';
    if (isEncrypt && config.data) {
      console.log(config.url+ ":" + JSON.stringify(config.data));
      config.data = {
        param: encryptApi.encrypt(JSON.stringify(config.data))
      }
    }
    if (isEncrypt && config.params) {
      let formatParams = {};
      const params = config.params;
      for(let element in params) {
        if (params.hasOwnProperty(element) && params[element] !== undefined) {
          formatParams[element] = encryptApi.encrypt(params[element]);
        }
      }
      config.params = formatParams;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    // errcode为700017代表没有权限访问这个接口，跳转无权限提示页面
    if (response.config.url && response.config.url.indexOf('/public/system/config') > -1) {
      // 从这个接口中获取后端是否加密的参数, 如果加密的话
      for(let item in response.headers) {
        if (response.headers.hasOwnProperty(item) && item.toLowerCase() === 'isencrypt') {
          window.localStorage.setItem("isEncrypt",response.headers[item] === 'true' ? '1' : '0');
        }
      }
    }
    let isEncrypt: boolean = window.localStorage.getItem("isEncrypt") === '1';
    if (isEncrypt) {
      let resJSON: any = encryptApi.decrypt(response.data);
      let resObj:any = JSON.parse(resJSON);
      if(resObj.errcode === 700017 || resObj.errcode === 40005) {
        window.location.href = env.redirectHost + "/no-permission.html";
      }
      return resObj;
    } else {
      if (
        response.data &&
        (response.data.errcode === 700017 || response.data.errcode === 40005)
      ) {
        window.location.href = env.redirectHost + "/no-permission.html";
      }
      return response.data;
    }
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // window.location.href = OAuthApi.OAuthLoginUrl;
          const corpId: string = localStorage.getItem("corpId") || "";
          let url: string = `${env.portalHost}/login`;

          if (corpId) {
            url = `${url}?corpId=${corpId}`;
          }

          window.location.href = url;
          // Vue.prototype.$router && Vue.prototype.$router.replace({path: '/login'});
          break;
        default:
          Vue.prototype.$message.error(error.response.data);
          break;
      }
    } else {
      if(error.message !== 'interrupt') Vue.prototype.$message.error(error.message);
    }
    return Promise.reject(error);
  }
);
export default axios;
