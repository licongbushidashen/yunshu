import Axios from './axios';

import Mappings from './api.mappings';

import { HttpResponse } from './response';

import * as WorkflowCenter from './workflow-center-params';

export class WorkflowCenterApi {
  /* *
  * 待办列表
  */
  searchWorkitems(params: WorkflowCenter.SearchParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.searchWorkitems, { params });
  }

  /* *
  * 待阅列表
  */
  searchCirculates(params: WorkflowCenter.SearchParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.searchCirculates, { params });
  }

  /* *
  * 已阅操作
  */
  updateCirculateReaded(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.workflow.updateCirculateReaded, params);
  }

  /* *
  * 已阅列表
  */
  listReadWorkitems(params: WorkflowCenter.FinishedWorkItemParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.listFinishedCirculates, { params });
  }

  /* *
  * 已办列表
  */
  listFinishedWorkitems(params: WorkflowCenter.FinishedWorkItemParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.listFinishedWorkitems, { params });
  }

  /* *
  * 加载可发起的流程列表
  */
  getMyWorkflowList(isMobile: boolean = false): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.listMyWorkflow, {
      params: {
        isMobile: !!isMobile
      }
    });
  }

  /* *
  * 根据目录id加载目录下可发起的流程
  */
  getMyWorkflowFolderList(params: WorkflowCenter.WorkflowFolderParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.listMyWorkflowByFolderId, { params });
  }

  /* *
  * 根据流程名称查询可发起的流程
  */
  searchMyWorkflowList(params: WorkflowCenter.SearchWorkflowParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.listMyWorkflowByName, { params });
  }


  /* 
  * 获取当前用户的信息
  */
  getUserInfo(params: WorkflowCenter.UserInfoSchema): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.user.getInfo, { params });
  }

  /* *
  * 获取常用流程列表
  */
  getFavoriteWorkflowList(): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.listFavoritesWorkflow);
  }

  /* *
  * 设为常用流程
  */
  setFavoriteWorkflow(params: WorkflowCenter.WorkflowParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.createFavoriteWorkflow, { params });
  }


  /* *
  * 取消常用流程
  */
  deleteFavoriteWorkflow(params: WorkflowCenter.WorkflowParams): Promise<HttpResponse<any>> {
    return Axios.delete(Mappings.workflow.deleteFavoriteWorkflow, { params });
  }


  /* *
  * 获取待办待阅消息条数
  */
  getWorkCount(appCode: string = ''): Promise<HttpResponse<any>> {
    const params = {
      appCode
    };
    return Axios.get(Mappings.workflow.getWorkCount, { params });
  }

  /* *
  * 获取我的流程列表
  */
  getMyInstanceList(params: WorkflowCenter.FinishedWorkItemParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.listMyInstances, { params });
  }

  /* *
  * 流程实例查询
  */
  listInstances(params: WorkflowCenter.ListInstancesParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.listInstances, { params });
  }

  /* *
  * 任务查询
  */
  listWorkitems(params: WorkflowCenter.ListInstancesParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.listWorkitems, { params });
  }

  /* *
  * 获取当前处理人列表
  */
  getParticipants(params: WorkflowCenter.participantParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.getParticipants, { params });
  }

  /* *
  * 创建流程委托
  */
  createWorkflowTrust(params: WorkflowCenter.trustParams): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.workflow.createWorkflowTrust, params);
  }

  /* *
  * 修改流程委托
  */
  updateWorkflowTrust(params: WorkflowCenter.trustParams): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.workflow.updateWorkflowTrust, params);
  }

  /* *
  * 删除流程委托
  */
  deleteWorkflowTrust(params: WorkflowCenter.deleteTrustParams): Promise<HttpResponse<any>> {
    return Axios.delete(Mappings.workflow.deleteWorkflowTrust, { params });
  }

  /* *
  * 删除流程委托
  */
  deleteCanceledWorkflowInstances(params: WorkflowCenter.deleteInstances): Promise<HttpResponse<any>> {
    return Axios.delete(Mappings.workflow.deleteCanceledWorkflowInstances, { data: params });
  }

  /* *
 * 获取流程委托列表
 */
  getWorkflowTrustList(params: WorkflowCenter.getTrustParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.queryWorkflowTrust, { params });
  }
  /* *
 * 批量处理待办项
 */
  batchUnfinishWorkflow(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.form.batchUnfinishWorkItem, params);
  }
  /* *
  * 获取流程委托列表
  */
  getWorkflowTrust(params: WorkflowCenter.deleteTrustParams): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.getWorkflowTrust, { params });
  }
  /* *
 * 新增、修改常用审批意见
 */
  saveCommonComment(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.workflow.saveCommonComment, params);
  }
  /* *
  * 获取常用审批意见列表
  */
  getCommonCommentList(params: any): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.getCommonCommentList, { params });
  }

  /* *
 * 删除常用审批意见
 */
  deleteCommonComment(params: any): Promise<HttpResponse<any>> {
    return Axios.delete(Mappings.workflow.deleteCommonComment, {params});
  }

  /* *
 * 常用审批意见排序
 */
  updateCommonComment(params: any): Promise<HttpResponse<any>> {
    return Axios.post(Mappings.workflow.updateCommonComment, params);
  }

  /* *
 * 常用审批意见排序
 */
  batchForwardWorkItem(params: any): Promise<HttpResponse<any>> {
    return Axios.post('/api/runtime/workflow/batch_forward_workItem', params);
  }

  
}


