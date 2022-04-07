

export const IS_DEBUG = process.env.NODE_ENV === 'debug';

export const IS_DINGTALK = /DingTalk/.test(navigator.userAgent);

export const IS_IOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判断是否ios终端

export const IS_IE = /Trident/.test(navigator.userAgent);  //是否是IE

//是否是企业微信, 在企业微信输出ua为 Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36 QBCore/4.0.1268.400 QQBrowser/9.0.2524.400 Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko)
// export const IS_WECHAT_PC = /QBCore/.test(navigator.userAgent); 
// export const IS_WECHAT_MOBILE = /wxwork/.test(navigator.userAgent); 
export const IS_WECHAT = /wxwork/.test(navigator.userAgent) || /WeChat/.test(navigator.userAgent) || /MicroMessenger/.test(navigator.userAgent); 
export const IS_WECHAT_PC_MAC = /Mac/.test(navigator.userAgent) && /WeChat/.test(navigator.userAgent); 
export const IS_WECHAT_PC_WINDOW = /WindowsWechat/.test(navigator.userAgent); 
