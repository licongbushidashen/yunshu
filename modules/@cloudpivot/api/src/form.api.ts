import axios from "./axios";

import { HttpResponse } from "./response";

import * as form from "./form-params";

import api from "./api.mappings";
import * as _ from "lodash";
export function errorHandle(res: any) {

  if (res.hasOwnProperty('errcode') && res.errcode !== 0) {
    return Promise.reject(res);
  }

  return res;
}

let store:any = {}

export class FormApi {
  /**
   * 表单加载
   * @param params
   */
  load(params: any): Promise<HttpResponse<form.FormObject>> {
    return axios.get(api.form.load, {
      params
    });
  }

  /**
   * 判断附件资源是否存在
   * @param params
   */
   exist(params: any): Promise<HttpResponse<form.FormObject>> {
    return axios.get(api.form.exist, {
      params
    });
  }

  /**
   * 判断是否开启自由审批人
   * @param params
   */
  getParticipantsInfo(params: any): Promise<HttpResponse<form.FormObject>> {
    return axios.post('/api/runtime/form/getParticipantsInfo', params);
  }



  /**
   * 暂存
   * @param params
   */
  save(params: form.SaveParams, path?: string): Promise<HttpResponse<any>> {
    const url = path ? `${path}/save` : api.form.save;
    return axios.post(url, params);
  }

  /**
   * 提交
   * @param params
   */
  submit(
    params: form.SubmitParams,
    path?: string
  ): Promise<HttpResponse<void>> {
    const url = path ? `${path}/submit` : api.form.submit;
    return axios.post(url, params);
  }

  /**
   * 删除业务表单
   * @param params
   */
  delete(
    params: form.DeleteFormParams,
    path?: string
  ): Promise<HttpResponse<void>> {
    const url = path ? `${path}/delete` : api.form.delete;
    return axios.delete(url, {
      params
    });
  }

  /**
   * 检查工作项是否存在
   * @param workflowInstanceId
   */
  workItemExist(
    workflowInstanceId: string,
    ownerId: string
  ): Promise<HttpResponse<string>> {
    return axios.get(api.form.workItemExist, {
      params: {
        workflowInstanceId,
        ownerId
      }
    });
  }

  /**
   * 获取催办记录列表
   */
  getUrgeList(instanceId: string): Promise<HttpResponse<any>> {
    return axios.get(api.form.getUrgeList, {
      params: {
        instanceId
      }
    });
  }

  /**
   * 保存催办消息
   * web端发送消息
   */
  saveDing(params: form.SaveDingParams): Promise<HttpResponse<any>> {
    return axios.post(api.form.saveDing, params);
  }

  /**
   * 获取待办用户id
   */
  getTodoUsers(instanceId: string): Promise<HttpResponse<any>> {
    return axios.get(api.form.getTodoUsers, {
      params: {
        instanceId
      }
    });
  }

  /**
   * 子表导入
   */
  importData(params: form.ImportSheetParams): Promise<HttpResponse<any>> {
    return axios.post(api.form.importData, params);
  }

  /**
   * 子表导出
   */
  exportData(params: form.ImportSheetParams): Promise<HttpResponse<any>> {
    return axios.post(api.form.exportData, params);
  }

  /**
   * 子表模板导出
   */
  exportTemplate(params: form.ImportSheetParams): Promise<HttpResponse<any>> {
    return axios.post(api.form.exportTemplate, params);
  }

  /**
   * 获取表单短码
   */
  getShortCode(params: form.LoadParams): Promise<HttpResponse<any>> {
    return axios.get(api.form.getShortCode, {
      params
    });
  }

  /**
   * 更新子表排序
   */
  updateSortkey(params: form.UpdateSortkeyParams): Promise<HttpResponse<any>> {
    return axios.put(api.form.updateSortkey, params);
  }

  /**
   * 获取打印模板draftAttributesJson的接口
   */
  getPrintAttributesJson(
    params: form.getDraftAttributesJsonParams
  ): Promise<HttpResponse<any>> {
    return axios.get(api.form.get, { params });
  }

  /*
   * @params {"htmlName": "文件名","htmlContent": "文件内容"}
   */
  toHtml(params: object): Promise<HttpResponse<any>> {
    return axios.post(api.form.toHtml, params);
  }

  /*
   * @params string htmlName为文件文件名，生成PDF文件
   */
  makePDF(params: any): Promise<HttpResponse<any>> {
    return axios.get(api.form.pdf, { params });
  }

  getMessageFormUrl(
    params: form.getMessageFormUrlParams
  ): Promise<HttpResponse<form.getMessageFormUrlResult>> {
    return axios.get(api.form.getMessageFormUrl, {
      params
    });
  }

  /*
   * @params 获取关联表单title
   */
  getBizModelName(
    schemaCode: string
  ): Promise<HttpResponse<form.getMessageFormUrlResult>> {
    return axios.get(api.form.getBizModelName, {
      params: {
        schemaCode
      }
    });
  }
  /**
   * @Author: Fan
   * @Description: 表单页提交时 的校验码获取接口, 当表单加载时或提交报错(除了重复提交错误)调用接口获取校验码
   * @URL:
   * @param {type}
   * @return:
   * @Date: 2020-01-09 17:18:41
   */
  getReplayToken(path?: string): Promise<HttpResponse<any>> {
    const url = path ? `${path}/getReplayToken` : api.form.getReplayToken;
    return axios.get(url);
  }

  /**
   * 获取当前表单的流程节点数目
   */
  getWorkFlowNode(workflowInstanceId: string): Promise<HttpResponse<any>> {
    return axios.get(api.form.getWorkFlowNode, {
      params: {
        workFlowInstanceId: workflowInstanceId
      }
    });
  }
  /*
  * @params 获取组织机构最大层级数
  */
  getOrgMaxNum() {
    return axios.get(`/api/organization/department/get_max_department_level`).then(errorHandle);
  }

  getUserExtForDingTalk (){
    return axios.post(`/api/organization/user/ext/pick_list`).then(errorHandle);
  }

  deleteDataItem(params: form.DeleteParams): Promise<HttpResponse<any>> { // 删除数据项
    return axios.delete('/api/app/bizproperty/delete', { params });
  }

  /**
 * 获取反向关联数据模型
 */
  listRelatives(schemaCode: string) {
    return axios.get("/api/app/apppackage/list_relatives", {
      params: {
        schemaCode,
      },
    });
  }
  getDataItemList(
    params: any
  ): Promise<HttpResponse<any>> {
    // 获取数据项列表
    return axios.get("/api/app/bizproperty/list", { params });
  }

  getFormList(schemaCode: string) {
    return axios.get(api.form.list, {
      params: {
        schemaCode,
      },
    });
  }

  /**
   * 判断选人控件是否可编辑,涉及权限相关
   * */
  getStaffOperateAble(params:any){
    return axios.get("/api/system/checkPerm", { params });
  }

  /**
   * 获取关联表单引用配置
   * */
  getRelativeQuote(params:any): Promise<HttpResponse<any>>{
    return axios.get("/api/app/bizproperty/quote/list", { params });
  }

  /**
   * 获取计算规则值
   * */ 
   getComputeFormulaVal(params: any): Promise<HttpResponse<any>> {
    // return axios.post("/api/app/bizdatarule/calculate", params);
    // 通过存储相同的计算，减少计算请求
    let _string = JSON.stringify(params)
    return new Promise((res,rej) => {
      if(store[_string] && store[_string].length){
        store[_string].push(res)
      }else{
        store[_string] = [res]
        axios.post("/api/app/bizdatarule/calculate", params).then(data => {
          store[_string].forEach((res:any) => {
            res && res(data)
          });
          store[_string] = []
        });
      }
    })
  }

  // 根据id查询字典数据
  // id=2c928ff579d6def90179d6e17a6f0001&searchWord=fff&page=1&size=10
  searchDictionaryRecord(
    params: any
  ): Promise<HttpResponse<any>> {
    return axios.get("/api/data_dictionary/searchDictionaryRecord", { params });
  }

  getEnableRecordsByDictionaryId    (
    params: any
  ): Promise<HttpResponse<any>> {
    return axios.get("/api/data_dictionary/getEnableRecordsByDictionaryId", { params });
  }

}
