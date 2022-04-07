import Axios from "./axios"

import Mappings from "./api.mappings"

import * as Application from "./application"
import { HttpResponse } from "./response"

export class ListApi {
  /**
   * 导入文件上传地址
   */
  fileUploadUrl = `/api/runtime/query/upload_file`

  /**
   * 点击新增按钮判断用户是否有权限创建业务表单
   * @param params
   */
  getJurisdiction(params: Application.ApiImplicitParam): any {
    return Axios.post(Mappings.form.add, params)
  }

  getDataItems(params: any): Promise<HttpResponse<any>> {
    return Axios.get(`/api/app/bizproperty/list`, { params })
  }

  /**
   * 关闭弹框时触发清除临时文件
   * @param params
   */
  deleteTemporaryFile(params: Application.fileNameType): any {
    return Axios.post(Mappings.application.deleteTemporaryFile, params)
  }

  /**
   * 下载示例文件
   * @param params
   */
  exportTemplate(params: Application.ExportTemplateParams): any {
    return Axios.post(Mappings.application.queryExportTemplate, params, {
      responseType: "arraybuffer"
    })
  }

  /**
   * 导入失败错误信息下载
   * @param params
   */
  exportErrorResult(fileName: string): any {
    const params = {
      fileName
    }
    return Axios.post(Mappings.application.queryDownloadResult, params, {
      responseType: "arraybuffer"
    })
  }
  /**
   * 导入失败错误信息下载-新增
   * @param params
   */
  downErrorResult(fileName: string): any {
    const params = {
      fileName
    }
    return Axios.post(Mappings.application.downloadResult, params, {
      responseType: "arraybuffer"
    })
  }
  /**
   * 导入数据
   * @param params
   */
  importData(params: Application.ImportParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.queryImportData, { params })
  }

  /**
   * 按姓名选人错误，二次确认导入数据
   * @param params
   */
  secondImportData(params: Application.SecondImportParams): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.secondImportData, params)
  }

  sheetSecondImportData(params: Application.SheetSecondImportParams): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.sheetSecondImportData, params)
  }

  /**
   * 查询导入进度
   */
  getImportingProgress(params?: any): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.queryImportProgress, {
      params
    })
  }

  // 注释和注释风格
  list(params: Application.IsMobileSchema): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.appListApps, { params })
  }

  listByGroup(params: Application.IsMobileSchema): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.appListAppsByGroup, { params })
  }
  //
  listForTrust(params: Application.IsMobileSchema): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.appListAppsForTrust, {
      params
    })
  }

  // 获取目录
  getFolder(params: Application.FolderSchema): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.appListFunctionsByCode, {
      params
    })
  }

  // 获取子目录,即模型
  getModel(params: Application.folderIdSchema): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.appListFunctionsById, {
      params
    })
  }

  // 获取模型配置信息
  getListConfigData(params: Application.ListConfigSchame): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.appQueryGet, { params })
  }

  getListConfigList(schemaCode: string, isPublish?: boolean, appCode?: string): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.appQueryList, {
      params: {
        schemaCode,
        isPublish,
        currentAppCode: appCode
      }
    })
  }

  // 获取已点亮视图列表
  getQueryHeaders(params: Application.QueryHeaderParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.queryHeaders, { params })
  }

  // 获取查询列表数据
  getQueryList(params: Application.QueryListParams): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.queryList, params)
  }
  // 跳过列表查询
  listSkipQueryList(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.listSkipQueryList, params)
  }

  //多了id赋值
  listSkipQueryListV2(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.listSkipQueryListV2, params)
  }

  //判断模型数据存在
  getExistItem(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.getExistItem, params)
  }

  // 获取查询列表数据
  queryReverse(params: Application.QueryListParams): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.queryListReverseSheet, params)
  }

  // 获取查询列表表单Url
  getFormUrl(params: Application.FormUrlParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.getFormUrl, { params })
  }

  // 删除列表
  deleteListData(params: Application.DeleteListParams): Promise<HttpResponse<any>> {
    return Axios.delete(Mappings.application.deleteListData, {
      data: params
    })
  }

  // 导出数据
  exportData(params: Application.ExportDataParams): any {
    return Axios.post(Mappings.application.queryExportData, params, {
      responseType: "arraybuffer"
    })
  }

  // 导出数据(后台异步导出文件)
  exportAsyncData(params: Application.ExportDataParams): any {
    return Axios.post(Mappings.application.queryAsyncExportData, params)
  }

  /**
   * 查询导出进度
   */
  getExportingProgress(params: Application.ExportId): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.queryExportProgress, {
      params
    })
  }

  getExportFile(params: Application.ExportId): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.getExportData, params, {
      responseType: "arraybuffer"
    })
  }

  getExportTaskList(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.getExportTaskList, params)
  }

  /* 获取应用目录、模型 */
  getAppItem(params: Application.AppCode): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.appPackageTree, {
      params
    })
  }

  /* 根据模型编码获取应用编码 */
  getAppCodeByModelCode(params: Application.AppCodeByModelCodeParam) {
    return Axios.get(Mappings.application.getAppCodeByModelCode, {
      params
    })
  }

  /**
   * 获取所有应用列表
   */
  getAllApps(params?: Application.appManagerModel): Promise<HttpResponse<any>> {
    return Axios.get("/api/app/apppackage/list_all", {
      params
    })
  }

  appSearch(params: Application.AppPackageSearch) {
    return Axios.get(Mappings.application.appPackageSearch, {
      params
    })
  }
  /**
   * 根据名称搜索流程模板
   */
  searchWorkflowByName(params: any) {
    return Axios.get(Mappings.application.searchWorkflowByName, {
      params
    })
  }

  /**
   * 获取流程
   *  */
  getWorkflowList(params: Application.WorkflowSchemaCode): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.workflowList, { params })
  }

  /**
   * 获取流程-委托
   *  */
  getWorkflowListTrust(params: Application.WorkflowSchemaCode): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.workflowListTrust, { params })
  }

  /**
   * 获取单应用信息
   * @param appCode
   */
  getSingleAppInfo(appCode: string): Promise<HttpResponse<any>> {
    const params = {
      appCode
    }
    return Axios.get(Mappings.application.appPackageGetSingleInfo, {
      params
    })
  }

  /**
   * 单应用查询表单
   * @param appCode
   */
  searchBizModels(params: Application.SearchBizModelRequest): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.appSearchBizModels, {
      params
    })
  }

  /**
   * 最近使用的业务模型
   */
  listRecentBizModel(): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.appListRecentBizModels)
  }

  /**
   * 业务模型数据项列表
   */
  getDataItemList(params: Application.WorkflowSchemaCode): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.importQueryField, { params })
  }

  /**
   * 检查删除数据是：流程数据还是业务数据，是否父流程数据
   */
  checkDeleteItems(params: Application.DeleteListParams): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.checkDeleteItem, params)
  }

  /**
   * 批量生成二维码
   */
  genShortCodes(params: Application.GenShortCodesParams): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.genShortCodes, params)
  }

  getReport(params: Application.GetReportParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.getReport, {
      params
    })
  }

  //修改拥有者
  modifyOwner(params: any): Promise<HttpResponse<void>> {
    return Axios.post(Mappings.application.bizobjects, params)
  }

  //批量修改拥有者时获取无权限修改的数量
  getNoPresentationNumber(params: any): Promise<HttpResponse<void>> {
    return Axios.post(Mappings.application.objectIds, params)
  }

  getAppPackage(code: string): Promise<HttpResponse<any>> {
    const params = {
      code
    }
    return Axios.get(Mappings.application.getAppPackage, {
      params
    })
  }

  //获取自定义打印模板
  getLoadData(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.form.batchLoad, params)
  }

  //获取是否有自定义打印模板
  getConfirmIsPrint(params: any): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.getBizFormPrint, {
      params
    })
  }

  /**
   * 导入数据
   * @param params
   */
  selectFormTitle(params: any): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.selectFormTitle, { params })
  }

  /**
   * 查询列表表单留痕
   * @param params
   */
  getFormMarkingList(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.getFormMarkingList, params)
  }

  /**
   * 查询详情页表单留痕
   * @param params
   */
  getFormMarkingDetail(params: any): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.getFormMarkingDetail, { params })
  }

  /**
   * 获取应用分组列表接口
   * @param {Object} params
   * @returns
   */
  getAppgroupList(params: any): Promise<any> {
    return Axios.get("/api/app/appgroup/list", { params })
  }

  /**
   * 获取所有分组
   */
  getAllAppGroups(params?: any): Promise<any> {
    return Axios.get("/api/app/apppackage/list_all_group", {
      params
    })
  }

  /* 获取应用中心首页列表 */
  getAppList(): Promise<any> {
    return Axios.get("/api/app/apppackage/list")
  }

  // 批量修改
  batchUpdate(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.application.batchUpdate, params)
  }
  // 获取批量修改记录
  getBatchUpdateLog(params: any): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.application.batchUpdateLog, { params })
  }
}
