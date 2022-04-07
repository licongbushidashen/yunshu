import axios from 'axios';
import env from "@/env";

/**
 * 导入文件上传地址
 */
 const fileUploadUrl = `${env.apiHost}/api/runtime/query/upload_file`;

export default {
  fileUploadUrl,
  /**
   * 创建集成服务
   * @param params 
   */
  createService(params: BizService.Service.CreateParams): Promise<Common.Response> {
    return axios.post('/api/bizservice/service/create', params)
  },
  /**
   * 删除服务
   * @param params 
   */
  deleteService(params: BizService.Service.DeleteParams): Promise<Common.Response> {
    return axios.delete('/api/bizservice/service/delete', {
      params
    })
  },

  /**
   * 导出服务
   */
  exportService(params: BizService.Service.ExportParams): Promise<Common.Response> {
    return axios.post('/api/bizservice/service/export', params, {
      responseType: "arraybuffer",
    })
  },

  /**
   * 
   * 导入服务
   */
  importService(params: BizService.Service.ImportParams): Promise<Common.Response> {
    return axios.post('/api/bizservice/service/import', params)
  },

  /**
   * 
   * 校验服务
   */
  checkService(params: BizService.Service.CheckParams): Promise<Common.Response> {
    return axios.post('/api/bizservice/service/check', params)
  },

  
  /**
   * 列出服务列表——用于业务方法绑定服务时
   */
  listServices(): Promise<Common.Response> {
    return axios.get('/api/bizservice/service/list')
  },
  /**
   * 根据目录ID列出服务列表
   * @param params 
   */
  listServicesById(params: BizService.Service.ListParams)
    : Promise<Common.Res<BizService.Service.Item[]>> {
    return axios.get('/api/bizservice/service/list_by_category_id', {
      params
    })
  },
  /**
   * 更新服务
   * @param params 
   */
  updateService(params: BizService.Service.UpdateParams): Promise<Common.Response> {
    return axios.put('/api/bizservice/service/update', params)
  },
  /**
   * 获取服务详情
   * @param params 
   */
  getServiceDetails(params: BizService.Service.DeleteParams)
    : Promise<Common.Res<BizService.Service.Item>> {
    return axios.get('/api/bizservice/service/get', {
      params
    })
  },
  /**
   * 获取适配器配置选项
   */
  getAdapterConfigs(): Promise<Common.Response> {
    return axios.get('/api/bizservice/service/adapter_config')
  },

  /**
   * 获取集成方法绑定的业务方法数量
   * @param params 
   */
  getServiceBizBindInfo(params: BizService.Service.QueryBindBizmethodParams) {
    return axios.get('/api/app/bizmethod/count_mapping', {
      params
    })
  },

  /**
   * 获取集成方法的被绑定引用信息
   * @param params 
   */
  getReference(params: BizService.Service.GetReferenceParams){
    return axios.get('/api/bizservice/method/viewReference', {
      params
    })
  },

  /**
   * 刷新SOAP服务的方法列表
   * @param params 
   */
  refreshSoapMethods(params: BizService.Service.RefreshSoapParams) {
    return axios.get('/api/bizservice/service/refresh',{
      params
    })
  }
}
