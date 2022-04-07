
import axios from '../axios';

import api from '../api.mappings';

export class WechatApi {

    sign(params: any) {
        return axios.get(api.wechat.sign, {
            params
        });
    }

    login(params: any) {
        return axios.get(api.wechat.login, {
            params
        });
    }

}