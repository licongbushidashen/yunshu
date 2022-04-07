/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-08-27 14:40:29
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-08-27 19:02:41
 */
import axios from "axios";

export default {
  //新增api接口配置
  saveConfiguration(
    params: any
  ): Promise<Common.Res<void>> {
    return axios.post("/api/client/create", params);
  },

  //修改api接口配置
  updateConfiguration(
    params: any
  ): Promise<Common.Res<void>> {
    return axios.post("/api/client/update", params);
  },


  //删除api接口配置
  deleteConfiguration(
    params: any
  ): Promise<Common.Res<void>> {
    return axios.delete(`/api/client/delete?clientId=${params}`);
  },

  //获取api接口列表
  searchConfiguration(
    params: any
  ): Promise<Common.Res<void>> {
    return axios.post("/api/client/list", params);
  },

};