import { utils } from "@cloudpivot/common";

import { dingTalk } from "@cloudpivot/api";

import {
  IS_DEBUG,
  IS_DINGTALK,
  IS_IOS,
  IS_IE,
  IS_WECHAT,
  IS_WECHAT_PC_MAC,
  IS_WECHAT_PC_WINDOW,
} from "./is-platform";

import { PlatformServiceLike, BrowserService } from "./platform-service";

// import { DingTalkService } from './dingtalk/dingtalk-service';

import { Base64 } from "js-base64";

function parseToken(token: string) {
  const useInfoBs: string = token.split(".")[1];
  const useInfo = JSON.parse(Base64.decode(useInfoBs));
  return useInfo;
}

export {
  IS_DEBUG,
  IS_DINGTALK,
  IS_IOS,
  IS_IE,
  IS_WECHAT,
  IS_WECHAT_PC_MAC,
  IS_WECHAT_PC_WINDOW,
};

let service: PlatformServiceLike = new BrowserService();

export async function start(client_id: string, scope: string) {
  let _service: PlatformServiceLike | null = null;

  let query = utils.parseQuery();

  let urls = window.location.pathname;

  let loginInfo: any;

  let p: Promise<dingTalk.LoginResult> | null = null;

  if (IS_DEBUG) {
  } else {
    if (IS_DINGTALK) {
      const dingtalk = await import(
        /* webpackChunkName: "dingtalk" */ "./dingtalk"
      );
      p = dingtalk.init(client_id, scope, query) as any;
      _service = new dingtalk.DingTalkService();
    }

    if (IS_WECHAT) {
      // 企业微信统一配置pc端地址，在此判断是否跳转至移动端

      if (IS_WECHAT_PC_MAC || IS_WECHAT_PC_WINDOW) {
        const wechat = await import(
          /* webpackChunkName: "dingtalk" */ "./wechat"
        );
        p = wechat.init(client_id, scope, query) as any;
        _service = new wechat.WechatService();
      } else {
        if (window.location.href.indexOf("mobile") <= -1) {
          const { origin, search } = window.location;
          const url: string = `${origin}/mobile${search}`;
          window.location.href = url;
          return;
        } else {
          const wechat = await import(
            /* webpackChunkName: "dingtalk" */ "./wechat"
          );
          p = wechat.init(client_id, scope, query) as any;
          _service = new wechat.WechatService();
        }
      }
    }
  }

  if (_service) {
    service = _service;
  }

  if (p) {
    const res: any = await p;

    if (res) {
      const { access_token, userinfo, refresh_token, expiration } = res;

      loginInfo = res;

      const info = parseToken(access_token);
      if (info) {
        const user = userinfo as any;
        user.isAppAdmin = info.isAppAdmin;
        user.isAdmin = info.isAdmin;
      }
      sessionStorage.setItem("user", JSON.stringify(userinfo));
      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", JSON.stringify(refresh_token));
      localStorage.setItem("expireTime", `${expiration}`);
    }
  } else {
    utils.copyURL(query,'portal');
  }

  return {
    query,
    loginInfo,
  };
}

export { service };
