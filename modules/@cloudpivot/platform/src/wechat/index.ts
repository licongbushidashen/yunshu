
import { IS_DEBUG } from '../is-platform'

import { wechatApi } from '@cloudpivot/api'

import { wechatJsApi, WechatService } from './wechat-service'

export {
  WechatService
}

export const jsApiList = [
  'openDefaultBrowser'
];

export interface ConfigParams {
  beta: boolean
  debug: boolean
  appId: string
  timestamp: string
  nonceStr:string
  signature: string
  jsApiList: string[]
}


export async function init(client_id: string, scope: string, query: any) {
  const { corpId, code } = query;

  // 临时授权码一次生效，再次刷新无法进入系统，故加此阻断逻辑
  const codeFromLS:any = window.sessionStorage.getItem('code');
  if (!codeFromLS) {
    window.sessionStorage.setItem('code', code);
  } else {
    return;
  }

  if (!corpId) {
    console.log('缺少corpId');
    return;
  }

  if (!code) {
    console.log('缺少code');
    return;
  }
  
  const signResult = await sign(corpId);

  console.log('sign', signResult);
  // wx.config({
//   beta: true,// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
//   debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
//   appId: '', // 必填，企业微信的corpID
//   timestamp: , // 必填，生成签名的时间戳
//   nonceStr: '', // 必填，生成签名的随机串
//   signature: '',// 必填，签名，见 附录-JS-SDK使用权限签名算法
//   jsApiList: [] // 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
// });



  const params:ConfigParams = {
    beta: true,
    debug: IS_DEBUG,
    appId: corpId,
    timestamp: signResult.timeStamp,
    nonceStr: signResult.nonceStr,
    signature: signResult.signature,
    jsApiList
  }

  await ready(params);
  
  const loginReuslt = await login(client_id, scope,corpId, code);

  // if ((loginReuslt as any).errcode === 10002) {
  //   (dd.device.notification.alert as any)({
  //     message: "您无此访问权限，请联系管理员",
  //     buttonName: "确定",
  //     onSuccess: function () {
  //       dd.biz.navigation.close({});
  //     },
  //   });
  // }

  return loginReuslt;
}


export async function sign(corpId) {

  const sourceUrl: string = window.location.href.replace(/#\/(.+)?/, '');
  const params = {
    url: encodeURIComponent(sourceUrl),
    corpId
  };

  const res = await wechatApi.sign(params);

  return res.data;
}




export function ready(params: ConfigParams) {

  (window as any).Wechat = wechatJsApi;
  
  wechatJsApi.config(params);

  return new Promise((resolve, reject) => {

    wechatJsApi.ready(() => {
      // if (IS_IOS) {
      //   dd.ui.webViewBounce.disable({});
      // }
      resolve();
    });

    wechatJsApi.error((err: any) => {
      let msg = '';
      for (const key in err) {
        if (Object.prototype.hasOwnProperty.call(err, key)) {
          msg += `${key}:${err[key]};`;
        }
      }
      if (msg.indexOf('uid is not employee for orgid') > -1) {
        msg = '你不在当前组织机构中，无权限查看！';
      }
    });

  });

}


export async function login(client_id:string, scope:string,corpId: string, code: string) {

  const loginRes = await wechatApi.login({
    code,
    client_id,
    scope,
    corpId
  });

  console.log('login', loginRes);

  return loginRes;
}