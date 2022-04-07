import axios from "./axios";

import Mappings from "./api.mappings";

import * as user from "./users.typings";

import { HttpResponse } from "./response";

export class UserApi {
  getUserInfo(id: string): Promise<HttpResponse<user.Info>> {
    return axios.get(Mappings.user.getInfo, {
      params: {
        id
      }
    });
  }

  getUserDepartments(id: string): Promise<HttpResponse<any[]>> {
    return axios.get(Mappings.user.departments, {
      params: {
        id
      }
    });
  }

  getOrganizationLevel(userId: string): Promise<HttpResponse<any[]>> {
    return axios.get(Mappings.user.orgLevel, {
      params: {
        userId
      }
    });
  }
  /**
   * @Author: Fan
   * @Description: 根据用户id获取部门主管信息
   * @URL:http://47.106.247.123:8080/swagger-ui.html#!/32452324552642626500585829992251432550921475/getDeptLeaderInfoByUserIdUsingGET
   * @param {type} userId/用户id
   * @return:
   * @Date: 2020-01-14 16:06:45
   */
  getDeptLeader(userId: string): Promise<HttpResponse<any[]>> {
    return axios.get(Mappings.user.getDeptLeader, {
      params: {
        userId
      }
    });
  }

  getverifyPersonSelectMapping(params: any): Promise<HttpResponse<any[]>> {
    return axios.get(Mappings.user.verifyPersonSelectMapping, { params });
  }

  getverifyPersonIsMapping(params: any): Promise<HttpResponse<any[]>> {
    return axios.post(Mappings.user.verifyPersonIsMapping, params );
  }

}
