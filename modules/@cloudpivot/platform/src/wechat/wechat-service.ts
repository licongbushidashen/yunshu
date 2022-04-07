
import * as typing from '../platform-service';

import { IS_DINGTALK, IS_WECHAT, IS_WECHAT_PC_MAC, IS_WECHAT_PC_WINDOW } from '../is-platform'

// @ts-ignore
import wechatJsApi from 'wx-jsapi';

import dd from 'dingtalk-jsapi';

export {
    wechatJsApi,
    dd
}

export class WechatService implements typing.PlatformServiceLike {

    // private setLeftFn?: (e: any) => void;

    setTitle(title: string) {
        dd.biz.navigation.setTitle({
            title
        });
    }

    openLink(url: string) {
        // jsapi打开系统默认浏览器仅支持PC端， 移动端调用"openDefaultBrowser"会报"fail_nosupport",企业微信移动端用window.open来处理
        if (IS_WECHAT_PC_MAC || IS_WECHAT_PC_WINDOW) {
            wechatJsApi.invoke('openDefaultBrowser', {
                'url': url, // 在默认浏览器打开redirect_uri，并附加code参数；也可以直接指定要打开的url，此时不会附带上code参数。
            }, function (res:any) {
                if (res.err_msg != "openDefaultBrowser:ok") {
                    //错误处理
                } else {

                }
            });
        } else {
            window.open(url);
        }
    }

    close() {
        dd.biz.navigation.close({});
    }

    setLeft(params: typing.SetLeftParams) {
        const fn = params.fn;

        const text = params.text || '返回';

        // if (IS_IOS) {
        // this.setLeftFn = fn;
        dd.biz.navigation.setLeft({
            text, // 控制显示文本，空字符串表示显示默认文本
            // show: true, // 控制按钮显示， true 显示， false 隐藏， 默认true
            control: true, // 是否控制点击事件，true 控制，false 不控制， 默认false
            // showIcon: true, // 是否显示icon，true 显示， false 不显示，默认true； 注：具体UI以客户端为准
            android: true,
            onSuccess() {
                fn.apply(this, []);
            },
            // onFail() { },
        });
        // } else {
        //     // this.setLeftFn = (e: any) => {
        //     //     fn();
        //     //     if (e) {
        //     //         e.preventDefault();
        //     //     }
        //     // };

        //     const listener = function (e: Event) {
        //         if (e) {
        //             e.preventDefault();
        //         }
        //         fn();
        //     };

        //     window.document.addEventListener('backbutton', listener, false);
        // }
    }

    getLocation(params: typing.GetLocationParams): Promise<typing.GetLocationResult> {
        return Promise.reject();
        // return new Promise((resolve, reject) => {
        //     wechatJsApi.getLocation({
        //         type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        //         success: function (res: any) {
        //             let geocoder = new AMap.Geocoder({
        //                 radius: 1000,
        //                 extensions: "all"
        //             });
        //             geocoder.getAddress([res.longitude, res.latitude], (status: any, result: any) => {
        //                 if (status === "complete" && result.info === "OK") {
        //                     if (result && result.regeocode) {
        //                         resolve(Object.assign(result.regeocode.addressComponent, { longitude: res.longitude, latitude: res.latitude, address: result.regeocode.formattedAddress }));
        //                     }
        //                 }
        //             });
        //         },
        //         fail: function (res: any) {
        //             reject(res);
        //         }
        //     });
        // })
    }

    mapSearch(params: typing.MapSearchParams): Promise<typing.MapSearchResult> {
        return Promise.reject();
        // return new Promise((resolve, reject) => {
        //     wechatJsApi.getLocation({
        //         type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        //         success: function (res: any) {
        //             const latitude = res.latitude
        //             const longitude = res.longitude
        //             wechatJsApi.openLocation({
        //                 latitude,
        //                 longitude,
        //                 scale: 18
        //             })
        //             resolve(res);
        //         },
        //         fail: function (res: any) {
        //             reject(res);
        //         }
        //     });
        // })
    }

    mapView(params: typing.MapViewParams): void {
        dd.biz.map.view(params);
    }

    scan(params: typing.scanParams) {
        wechatJsApi.scanQRCode({
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果。
            scanType: ["qrCode", "barCode"],// 可以指定扫二维码还是一维码，默认二者都有
            success: function (data: any) {
                params.successFn(data.resultStr)
                //onSuccess将在扫码成功之后回调
            },
            fail: function (err: any) {
                console.log(err)
            }
        })
    }

    uploadImageFromCamera(params: typing.uploadParams): void {
        // todo
    }
}
