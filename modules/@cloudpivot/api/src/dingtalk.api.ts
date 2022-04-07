
import axios from './axios';

import qs from 'qs';

import api from './api.mappings';

import * as dingtalk from './dingtalk-params';


export class DingTalkApi {

    sign(params: dingtalk.SignParams) {
        return axios.get(api.dingTalk.sign, {
            params
        });
    }

    login(params: dingtalk.LoginParams) {
        return axios.get(api.dingTalk.login, {
            params
        });
    }

    upload(url: string, isAddWatermark: boolean, locationInfo: string, watermarkFontSize: number) {
        return axios.post(api.dingTalk.upload, qs.stringify({url: url, isAddWatermark: isAddWatermark, locationInfo: locationInfo, fontSize: watermarkFontSize}, {headers: {'Content-Type':'application/x-www-form-urlencoded'}}))
    }

}