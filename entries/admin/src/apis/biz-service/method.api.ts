import axios from 'axios';

export default {
  /**
   * 根据服务编码获取服务方法
   * @param params 
   */
  listMethodsByCode(params: BizService.Method.ListByCodeParams)
    : Promise<Common.Res<BizService.Method.Item[]>> {
    return axios.get('/api/bizservice/method/list_by_service_code', {
      params
    })
  },
  /**
   * 创建服务方法
   * @param params 
   */
  createMethod(params: BizService.Method.CreateParams): Promise<Common.Response> {
    return axios.post('/api/bizservice/method/create', params)
  },
  /**
   * 删除服务方法
   * @param params 
   */
  deleteMethod(params: BizService.Method.DeleteParams): Promise<Common.Response> {
    return axios.delete('/api/bizservice/method/delete', {
      params
    })
  },
  /**
   * 更新服务方法
   * @param params 
   */
  updateMethod(params: BizService.Method.UpdateParams): Promise<Common.Response> {
    return axios.put('/api/bizservice/method/update', params)
  },
  /**
   * 获取服务方法详情
   * @param params 
   */
  getMethodDetails(params: BizService.Method.DetailsParams)
    : Promise<Common.Res<BizService.Method.Item>> {
    return axios.get('/api/bizservice/method/get', {
      params
    })
  },
  /**
   * 运行服务方法
   * @param params 
   */
  testMethod(params: BizService.Method.TestParams): Promise<Common.Response> {
    return axios.put('/api/bizservice/method/service_test', params)
  },
  /**
   * 列出参数应用位置选项
   */
  listLocationType(): Promise<Common.Response> {
    return axios.get('/api/bizservice/method/list_location_type')
  },
  /**
   * 列出参数类型选项
   */
  listParamType(): Promise<Common.Response> {
    return axios.get('/api/bizservice/method/list_param_type')
  },
  /**
   * 列出http请求方式
   */
  listHttpType(): Promise<Common.Response> {
    return axios.get('/api/bizservice/method/list_http_type')
  },
  /**
   * 列出服务下绑定的数据库的所有数据表
   */
  listDataTable(params: BizService.Method.ListDatatableParams): Promise<Common.Data> {
    return axios.get('/api/bizservice/method/get_tablename_list', { params })
  },
  /**
   * 列出实体表的所有方法
   */
  listDataTableColumns(params: BizService.Method.ListDatatableColumnParams): Promise<Common.Data> {
    return axios.get('/api/bizservice/method/get_table_column', { params })
  },
  /**
   * 创建实体表集成方法
   */
  createDatatableMethods(params: Array<BizService.Method.CreateParams>): Promise<Common.Data> {
    return axios.post('/api/bizservice/method/create_list', params)
  },

  // 第三方数据源

  createDatasourceMethods(params): Promise<Common.Data> {
    return axios.post('/api/bizdatasource/method/create', params)
  },
  updateDatasourceMethods(params: Array<BizService.Method.CreateParams>): Promise<Common.Data> {
    return axios.put('/api/bizdatasource/method/update', params)
  },
  deleteDatasourceMethods(params: Array<BizService.Method.CreateParams>): Promise<Common.Data> {
    return axios.delete('/api/bizdatasource/method/delete', {params})
  },
  getDatasourceMethods(params: Array<BizService.Method.CreateParams>): Promise<Common.Data> {
    return axios.post('/api/bizdatasource/method/get', params)
  },
  getListDatasourceMethods(params): Promise<Common.Data> {
    return axios.get('/api/bizdatasource/method/list_by_category_id', {params})
  },
  serviceTestDatasourceMethods(params): Promise<Common.Data> {
    return axios.put('/api/bizdatasource/method/service_test', params)
  }
}