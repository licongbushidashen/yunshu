import Axios from 'axios';

export default {
  /* 流程相关请求 */

  createWorkflow(params: Apps.Workflow.CreateWorkflowParams): Promise<Common.Data> {
    return Axios.post('/api/workflow/create', params);
  },

  getWorkflowList(params: Apps.Workflow.WorkflowSchemaCode): Promise<Common.Data> {
    return Axios.get('/api/workflow/list', { params });
  },

  getWorkflowDetails(params: Apps.Workflow.WorkflowSchemaCode): Promise<Common.Data> {
    return Axios.get('/api/workflow/get_header', { params });
  },

  deleteWorkflow(params: Apps.Workflow.WorkflowCode): Promise<Common.Data> {
    return Axios.delete('/api/workflow/delete', { params });
  },

  updateWorkflow(params: Apps.Workflow.CreateWorkflowParams): Promise<Common.Data> {
    return Axios.put('/api/workflow/update_header', params);
  },

  getWorkflowDraft(params: Apps.Workflow.WorkflowCode): Promise<Common.Data> {
    return Axios.get('/api/workflow/get_draft', { params });
  },

  updateWorkflowDraft(params: any): Promise<Common.Data> {
    return Axios.put('/api/workflow/update', params);
  },

  validateWorkflow(params:any): Promise<Common.Data> {
    return Axios.post('/api/workflow/validate', params);
  },

  releaseWorkflow(params:any): Promise<Common.Data> {
    return Axios.post('/api/workflow/publish', params);
  },

  simulateWorkflow(params:any): Promise<Common.Data> {
    return Axios.post('/api/workflow/simulate', params);
  },

  getFormulaList(params: Apps.Workflow.FormulaParams): Promise<Common.Data> {
    return Axios.get('/api/function/list', { params });
  },
  validateFormula(params: Apps.Workflow.ValidateFormulaParams): Promise<Common.Data> {
    return Axios.post('/api/function/validate', params);
  },

  /* 流程设置相关请求 */
  //创建流程权限
  createPermission(params:Apps.WorkflowSetting.CreatePermissionParams): Promise<Common.Data> {
    return Axios.post('/api/workflow/create_permission', params);
  },
  //获取流程权限列表
  getPermissionList(params:Apps.WorkflowSetting.GetPermissionListParams): Promise<Common.Response> { 
    return Axios.get('/api/workflow/list_permission', { params });
  },
  //删除流程权限
  deletePermission(params:Apps.WorkflowSetting.DeletePermissionParams): Promise<Common.Data> {
    return Axios.delete('/api/workflow/delete_permission', { params });
  },
  //获取流程模板历史列表
  getHistoryList(params:Apps.WorkflowSetting.GetPermissionListParams): Promise<Common.Response> {
    return Axios.get('/api/workflow/list_history', { params });
  },
  //获取流程模板历史列表
  getHistoryListExcludeContent(params:Apps.WorkflowSetting.GetPermissionListParams): Promise<Common.Response> {
    return Axios.get('/api/workflow/list_history_exclude_content', { params });
  },
  //获取某个版本且为发布状态的流程模板
  getHistoryWorkflow(params:Apps.WorkflowSetting.GetHistoryWorkflowParams): Promise<Common.Data> {
    return Axios.get('/api/workflow/get_published', { params });
  },

  /**
   * 获取流程所在目录路径
   */
  getParentByWorkflowCode(params:any){
    return Axios.get(`/api/workflow/get_parent_by_workflow_code`, { params });
  },
  /*获取历史流程版本*/ 
  getMockHistoryWorkflow(params: any){
    return Axios.get(`/api/runtime/workflow/list_instances`, { params });
  },
  /*按节点查询模拟流程任务列表*/
  getMockTaskList(params: any){
    return Axios.get(`/api/runtime/workflow/simulative/search_task`, { params });
  },
  /*提交待办任务*/
  submitMockData(params: any){
    return Axios.post(`/api/runtime/form/simpleSubmit`, params);
  },
  /*驳回待办任务接口*/
  rejectWorkItem(params: any){
    return Axios.post(`/api/runtime/workflow/reject_workItem`, params);
  },
  /*根据流程实例id获取驳回页面的流程节点列表*/
  getRejectActivity(params: any){
    return Axios.get(`/api/runtime/workflow/list_reject_activities`, {params});
  }
  
};
