/*
 * @Author: your name
 * @Date: 2020-04-07 18:21:58
 * @LastEditTime: 2020-05-19 16:33:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\api\src\system-manage.api.ts
 */

import Axios from './axios';

import Mappings from './api.mappings';

import * as systemManage from './system-manage-params';

export class SystemManageApi {
  listBizRuleLog(params: systemManage.ListBizRuleLog): any {
    return Axios.get(Mappings.systemManage.listBizRuleLog, { params });
  }

  getBizRuleLogDetail(id: string): any {
    const params = {
      id
    }
    return Axios.get(Mappings.systemManage.getBizRuleLogDetail, { params });
  }
  /**
   * 获取业务规则执行日志
   * @param params 
   */
  getBusinessRuleLogList(params: systemManage.IbusinessRuleLogResParams) {
    return Axios.get(Mappings.systemManage.businessRuleLogList, { params })
  }

  /**
   * 获取业务规则异常日志详情
   * @param id 
   */
  getBusinessRuleLog(id: string): any {
    const params = {
      flowInstanceId: id
    }
    return Axios.get(Mappings.systemManage.getBusinessRuleLog, { params });
  }

  /**
   * 业务规则日志-重新执行
   * @param flowInstanceId 业务规则实例id
   */
  retryBusinessRule(flowInstanceId: string): any {
    const params = {
      flowInstanceId: flowInstanceId
    }
    return Axios.get(Mappings.systemManage.retryBusinessRule, { params });
  }
}