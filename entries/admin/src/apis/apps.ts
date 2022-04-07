import Axios from "axios";
import env from "@/env";
import { create } from "./list";

/**
 * 导入文件上传地址
 */
const fileUploadUrl = `${env.apiHost}/api/runtime/query/upload_file`;
// 考虑到后端分布式部署，会出现上传文件找不到的问题， upload_file2直接将附件上传至ftp或oss
const fileUploadUrl2 = `${env.apiHost}/api/runtime/query/upload_file2`;

export default {
  getDataItemList(
    params: Apps.Datamodel.DataItemListParams
  ): Promise<Common.Data> {
    // 获取数据项列表
    return Axios.get("/api/app/bizproperty/list", { params });
  },

  // 获取当前模型未被引用的数据项列表
  getQuoteDataItemList(
    params: Apps.Datamodel.DataItemListParams
  ): Promise<Common.Data> {
    return Axios.get("/api/app/bizproperty/quote", { params });
  },

  getDataItemType(): Promise<Common.Response> {
    // 获取数据项类型
    return Axios.get("/api/app/bizproperty/list_type");
  },
  getDataItemDetails(params: object): Promise<Common.Response> {
    // 获取数据项详情 [编辑]
    return Axios.get("/api/app/bizproperty/get", { params });
  },
  getBussinessType(params: object): Promise<Common.Response> {
    // 获取业务模型
    return Axios.get("/api/app/bizmodels/list", { params });
  },
  saveDataItem(params: Apps.Datamodel.SavaDataItem): Promise<Common.Response> {
    // 添加数据项
    return Axios.post("/api/app/bizproperty/create", params);
  },
  updateDataItem(params: Apps.Datamodel.DataItem): Promise<Common.Response> {
    // 更新数据项
    return Axios.put("/api/app/bizproperty/update", params);
  },
  deleteSchemaDataItem(
    params: Apps.AppItem.ExportModelParams
  ): Promise<Common.Response> {
    return Axios.get("/api/app/bizproperty/count_relation", { params });
  },
  bizpropertyRefer(
    params: Apps.AppItem.bizpropertyReferParams
  ): Promise<Common.Data> {
    return Axios.get("/api/app/bizproperty/list_referenced", { params });
  },
  deleteDataItem(
    params: Apps.Datamodel.DeleteParams
  ): Promise<Common.Response> {
    // 删除数据项
    return Axios.delete("/api/app/bizproperty/delete", { params });
  },
  forceDeleteDataItem(
    params: Apps.Datamodel.DeleteParams
  ): Promise<Common.Response> {
    // 强制删除数据项
    return Axios.delete("/api/app/bizproperty/force_delete", { params });
  },
  publishDataItem(
    params: Apps.Datamodel.PublishParams
  ): Promise<Common.Response> {
    // 数据项发布
    return Axios.put("/api/app/bizproperty/publish", params);
  },
  getBizmodeltitle(
    params: Apps.Datamodel.DataItemListParams
  ): Promise<Common.Response> {
    // 获取业务模型名称
    return Axios.get("/api/app/bizmodels/get", { params });
  },
  getSummary(
    params: Apps.Datamodel.DataItemListParams
  ): Promise<Common.Response> {
    // 获取摘要
    return Axios.get("/api/app/bizmodels/get_summary", { params });
  },
  /* 获取应用中心首页列表 */
  getAppList(): Promise<Common.Response> {
    return Axios.get("/api/app/apppackage/list");
  },
  /* 新增应用 */
  addAppPackage(params: Apps.AppCenter.AppInfo): Promise<Common.Data> {
    return Axios.post("/api/app/apppackage/create", params);
  },
  /* 检查应用下是否有模型 */
  checkIfHasModel(params: Apps.AppCenter.AppInfoParams): Promise<Common.Data> {
    return Axios.get("/api/app/apppackage/bizmodels/exits", {
      params,
    });
  },
  /* 删除应用 */
  deleteAppPackage(params: Apps.AppCenter.AppInfoParams): Promise<Common.Data> {
    return Axios.delete("/api/app/apppackage/logical_delete", {
      params,
    });
  },
  /* 更新应用排序 */
  updateAppSort(params: Apps.AppCenter.AppSortParams): Promise<Common.Data> {
    return Axios.put("/api/app/apppackage/sortkeys", params);
  },
  /* 查询单个应用的详情 */
  getAppDetail(params: Apps.AppCenter.AppInfoParams): Promise<Common.Response> {
    return Axios.get("/api/app/apppackage/get", {
      params,
    });
  },
  /* 更新单个应用 */
  renewAppPackage(params: Apps.AppCenter.AppInfo): Promise<Common.Response> {
    return Axios.put("/api/app/apppackage/update", params);
  },
  /* 获取应用目录、模型 */
  getAppItem(params: Apps.AppItem.ItemTree): Promise<Common.Response> {
    return Axios.get("/api/app/apppackage/trees", {
      params,
    });
  },
  /* 获取通过groupId获取应用目录、模型 */
  getGroupTrees(params: Apps.AppItem.ItemTree): Promise<Common.Response> {
    return Axios.get("/api/app/apppackage/group_trees", {
      params,
    });
  },
  /**
   * 获取反向关联数据模型
   */
  listRelatives(schemaCode: string) {
    return Axios.get("/api/app/apppackage/list_relatives", {
      params: {
        schemaCode,
      },
    });
  },

  /* 新建目录 */
  addAppFolder(params: Apps.AppItem.AddFolders): Promise<Common.Data> {
    return Axios.post("/api/app/folders/create", params);
  },
  /* 修改目录 */
  updateAppFolder(params: Apps.AppItem.UpdateFolders): Promise<Common.Data> {
    return Axios.put("/api/app/folders/update", params);
  },
  /* 删除目录 */
  deleteAppFolder(params: Apps.AppItem.DeleteFolders): Promise<Common.Data> {
    return Axios.delete("/api/app/folders/delete", {
      params,
    });
  },
  /* 校验目录节点下是否存在业务模型 */
  validFolder(params: Apps.AppItem.ValidFolder): Promise<Common.Data> {
    return Axios.get("/api/app/bizmodels/exits", {
      params,
    });
  },
  /* 新增模型 */
  addAppModel(params: Apps.AppItem.AddBizModel): Promise<Common.Data> {
    return Axios.post("/api/app/bizmodels/create", params);
  },
  /* 修改模型 */
  updateAppModel(params: Apps.AppItem.UpdateBizModel): Promise<Common.Data> {
    return Axios.put("/api/app/bizmodels/update", params);
  },
  /* 删除模型 */
  deleteAppModel(params: Apps.AppItem.DeleteBizModel): Promise<Common.Data> {
    return Axios.delete("/api/app/bizmodels/logical_delete", {
      params,
    });
  },
  /* 校验业务模型节点下是否存在业务数据 */
  validBizModel(params: Apps.AppItem.ValidBizModel): Promise<Common.Data> {
    return Axios.get("/api/app/bizmodels/exits_bizschema", {
      params,
    });
  },
  /* 更新应用的树结构节点的排序 */
  appItemSort(params: Apps.AppItem.AppItemSortParams): Promise<Common.Data> {
    return Axios.put("/api/app/apppackage/appfuncsortkeys", params);
  },
  /* 加载当前应用下的目录 */
  getFolders(params: Apps.AppItem.ItemTree): Promise<Common.Response> {
    return Axios.get("/api/app/apppackage/folders", {
      params,
    });
  },
  submitSummary(
    params: Apps.Datamodel.SummaryParams
  ): Promise<Common.Response> {
    return Axios.put("/api/app/bizmodels/update_summary", params);
  },
  fileUploadUrl,
  fileUploadUrl2,

  /**
   * 业务模型导出
   */
  export_package(params: Apps.AppItem.ExportModelParams): Promise<Common.Data> {
    return Axios.post("/api/workflow/package/export_package", params);
  },

  /**
   * 业务模型校验
   */
  check_package(params: Apps.AppItem.CheckModelParams): Promise<Common.Data> {
    return Axios.post("/api/workflow/package/check_package", params);
  },

  /**
   * 业务模型校验
  */
  check_package_new(params: Apps.AppItem.CheckModelParams): Promise<Common.Data> {
    return Axios.post("/api/workflow/package/validate_package", params);
  },
  /**
   * 业务模型校验
  */
   check(params: Apps.AppItem.CheckModelParams): Promise<Common.Data> {
    return Axios.post("/api/workflow/package/check", params);
  },
  

  /**
   * 业务模型导入
   */
  import_package(params: Apps.AppItem.ImportModelParams): Promise<Common.Data> {
    return Axios.post("/api/workflow/package/import_package", params);
  },

  /**
   * 获取所有应用列表
   */
  getAllApps(params?: any): Promise<Common.Data> {
    return Axios.get("/api/app/apppackage/list_all", {
      params,
    });
  },
  /**
   * 获取所有分组
   */
   getAllAppGroups(params?: any): Promise<Common.Data> {
    return Axios.get("/api/app/apppackage/list_all_group", {
      params,
    });
  },
  /**
   * 创建自定义页面
   */
  createDefinePage(
    params: Apps.AppCenter.DefinePageParams
  ): Promise<Common.Data> {
    return Axios.post("/api/custom/create", params);
  },
  updateDefinePage(params: Apps.AppCenter.DefinePageParams) {
    return Axios.post("/api/custom/update", params);
  },
  /**
   * 获取自定义页面详情
   */
  getDefinePage(params: Apps.AppCenter.DefinePage): Promise<Common.Data> {
    return Axios.get("/api/custom/get", { params });
  },
  /**
   * 删除自定义页面
   */
  deleteDefinePage(params: Apps.AppCenter.DefinePage): Promise<Common.Data> {
    return Axios.delete("/api/custom/logical_delete", { params });
  },
  getAppReport(params: Apps.AppItem.DeleteReport): Promise<Common.Data> {
    return Axios.get("/api/report/get", {
      params,
    });
  },
  /* 新增报表 */
  addAppReport(params: Apps.AppItem.AddReport): Promise<Common.Data> {
    return Axios.post("/api/report/create", params);
  },
  /* 修改报表 */
  updateAppReport(params: Apps.AppItem.UpdateReport): Promise<Common.Data> {
    return Axios.post("/api/report/update", params);
  },
  /* 删除报表 */
  deleteAppReport(params: Apps.AppItem.DeleteReport): Promise<Common.Data> {
    return Axios.delete("/api/report/logical_delete", {
      params,
    });
  },
  /* 同步数据源 */
  syncDataSource(): Promise<Common.Data> {
    return Axios.get(`${env.apiHost}/v1/dashboard/sync/datasource`);
  },
  /* 应用导出 */
  exportApp(params: any): Promise<Common.Data> {
    return Axios.post("/api/app/apppackage/export", params, {
      responseType: "arraybuffer",
    });
  },

  /* 应用校验 */

  checkApp(params: Apps.AppItem.CheckAppParams): Promise<Common.Data> {
    return Axios.post("/api/app/apppackage/check", params);
  },

  /* 应用导入 */
  importApp(params: Apps.AppItem.CheckAppParams): Promise<Common.Data> {
    return Axios.post("/api/app/apppackage/import", params);
  },

  /* 判断已选业务服务是否有权限 */
  getCode(params: any): Promise<Common.Data> {
    return Axios.get("/api/bizservice/service/get_by_code", { params });
  },

  // 判断是否有流程
  getIsWorkflow(params: any): Promise<Common.Data> {
    return Axios.get("/api/workflow/isworkflow", { params });
  },
  getFormHistory(params: Common.FormHistoryParam): Promise<Common.Data> {
    return Axios.post("/api/app/bizsheet/history/list", params);
  },
  getFormHistoryById(id: string): Promise<Common.Data> {
    return Axios.get("/api/app/bizsheet/history/get?id=" + id);
  },
  checkVersion(params: any): Promise<Common.Data> {
    return Axios.get("/api/app/bizsheet/history/checkVersion", { params });
  },
  /* 获取回收站列表接口 */
  getRecycleList(params: any): Promise<Common.Response> {
    return Axios.get("/api/app/apppackage/recycle/list", { params });
  },
  /* 还原回收站资源 */
  RecycleRestore(params: Array<string>): Promise<Common.Response> {
    return Axios.post("/api/app/apppackage/recycle/restore", params);
  },
  /* 彻底删除 */
  RecycleDelete(params: any): Promise<Common.Data> {
    return Axios.delete("/api/app/apppackage/physically_delete", { data: params });
  },

  /**
   * 获取应用分组：纯分组
   * @param {Object} params
   * @returns 
   */
  getAppgroup(params: any): Promise<Common.Data> {
    return Axios.get("/api/app/appgroup/list/v2", { params });
  },

  /**
   * 获取分组下应用
   * @param {Object} params
   * @returns 
   */
   getGroupAppByKey(params: any): Promise<Common.Data> {
    return Axios.get("/api/app/appgroup/get", { params });
  },

  /**
   * 获取应用分组列表接口
   * @param {Object} params
   * @returns 
   */
  getAppgroupList(params: any): Promise<Common.Data> {
    return Axios.get("/api/app/appgroup/list", { params });
  },
  /**
   * 创建应用分组接口
   * @param {Object} params
   * @returns 
   */
  AppgroupCreate(params: any): Promise<Common.Data> {
    return Axios.post("/api/app/appgroup/create", params);
  },
  /**
   * 更新应用分组接口
   * @param {Object} params
   * @returns 
   */
  AppgroupUpdate(params: any): Promise<Common.Data> {
    return Axios.put("/api/app/appgroup/update", params);
  },
  /**
   * 删除应用分组接口
   * @param {Object} params
   * @returns 
   */
  AppgroupDelete(params: any): Promise<Common.Data> {
    return Axios.delete("/api/app/appgroup/delete", { params });
  },
  /**
   * 清空所有回收站
   * @returns 
   */
  physically_deleteAll(): Promise<Common.Data> {
    return Axios.delete("/api/app/apppackage/physically_deleteAll");
  },
  /**
   * 还原所有回收站
   * @returns 
   */
  restoreAll(): Promise<Common.Data> {
    return Axios.post("/api/app/apppackage/recycle/restoreAll");
  },
};
