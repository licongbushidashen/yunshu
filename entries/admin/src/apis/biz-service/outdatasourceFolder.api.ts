import axios from 'axios';

export default {
  /**
   * 列出目录
   */
  listFolder(): Promise<Common.Res<BizService.Folder.Item[]>> {
    return axios.get('/api/bizdatasource/category/list')
  },
  /**
   * 添加目录
   * @param params 
   */
  createFolder(params: BizService.Folder.CreateParams): Promise<Common.Response> {
    return axios.post('/api/bizdatasource/category/create', params)
  },
  /**
   * 更新目录
   * @param params 
   */
  updateFolder(params: BizService.Folder.UpdateParams): Promise<Common.Response> {
    return axios.put('/api/bizdatasource/category/update', params)
  },
  /**
   * 删除目录
   * @param params 
   */
  deleteFolder(params: BizService.Folder.DeleteParams): Promise<Common.Response> {
    return axios.delete('/api/bizdatasource/category/delete', {
      params
    })
  },
}