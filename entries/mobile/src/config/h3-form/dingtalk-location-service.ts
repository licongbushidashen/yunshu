import {
  renderer
} from '@cloudpivot/form';

// import { isDingtalk, isiOS } from '../../utils/common';
// import {
//   getLocation, searchMapLocation, locateMapLocation, locateNavigation
// } from '../../utils/dingtalk';

import * as platform from '@cloudpivot/platform';

import Vue from 'vue';

import Utils from '@/utils';

let vueAMap : any;

export class DingTalkLocationService implements renderer.LocationService {
  
  async initMap() {
    if (vueAMap) {
        return vueAMap;
    }

    vueAMap = await import(/* webpackChunkName: "vue-amap" */'vue-amap');

    Vue.use(vueAMap.default);

    vueAMap.initAMapApiLoader({
        key: 'de01827a5c46df0ffa956bc2d6b11ca0',
        plugin: ['Geocoder', 'AMap.Geolocation', 'AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor', 'AMap.Map'],
        // 默认高德 sdk 版本为 1.4.4
        v: '1.4.14',
        uiVersion: '1.0.11'
    });

    return vueAMap;
  }

  position(range?: number, showMap?: boolean): Promise<renderer.LocationPositionResult> {
    if (showMap) {
      range = range || 10000000000;
      // return searchMapLocation(range).then((result: any) => {
      return platform.service.mapSearch({
        scope : range
      }).then((result: any) => {
        const obj = {
          provinceName: result.province||'',
          cityName: result.city||'',
          districtName: result.adName||'',
          address: (result.snippet + result.title)||'',
          lat: result.latitude,
          lng: result.longitude,
          adcode: result.adCode||''
        };
        return obj;
      });
    }
    return new Promise((resolve, reject) => {
      platform.service.getLocation({
        accuracy : 200,
        reGeocode : !showMap
      }).then((data: any) => {
        resolve(data);
      }, (err: any) => {
        reject(err);
        // alert('无法获取您的位置信息，请到设置中打开定位并允许钉钉使用定位服务');
      });
    });

    // return new Promise((resolve, reject) => {
    //     if (isDingtalk) {
    //         searchMapLocation((result: any) => {
    //             const obj = {
    //                 address: result.province + result.city + result.adName + result.snippet + result.title,
    //                 lat: result.latitude,
    //                 lng: result.longitude,
    //             };
    //             resolve(obj);
    //         });
    // getLocation((data: any) => {
    //     if (showMap) {
    //         searchMapLocation((result: any) => {
    //             const obj = {
    //                 address: result.province + result.city + result.adName + result.snippet + result.title,
    //                 lat: data.latitude,
    //                 lng: data.longitude,
    //             };
    //             resolve(obj);
    //         }, data.latitude, data.longitude);
    //     } else {
    //         resolve(data);
    //     }
    // }, !showMap, (err: any) => {
    //     reject(err);
    //     alert('无法获取您的位置信息，请到设置中打开定位并允许钉钉使用定位服务');
    // });
    //     }
    // });
  }

  navigation(latitude: number, longitude: number, title: string): void {
    platform.service.mapView({
      latitude,
      longitude,
      title
    });
    // if (isDingtalk) {
    //   locateNavigation(latitude, longitude, title);
    // }
  }
  /**
   * 是否是外链
   */
  isEl():boolean {
    return !!(window as any).externalLinkToken;
  }
}
