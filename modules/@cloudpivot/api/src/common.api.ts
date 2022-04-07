
import axios from './axios';

import api from './api.mappings';

import * as Common from './common'


export class CommonApi{

    systemConfig() {
        return axios.get(api.common.systemConfig);
    }

    /**
     * 退出登录
     */
    logout(params: Common.LogoutParams): Promise<Common.Data> {
        return axios.post('/logout', params, {
        headers: {
            Authentication: `Bearer ${params.T}`
        }
        });
    }

    systemErrorCode() {
        return axios.get(api.common.systemErrorCode);
    }

}
