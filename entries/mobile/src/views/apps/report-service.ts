
import ReportOptions from '@h3/report/dist/options';
import reportOrg from "./report-org.vue";
import ReportAddress from "./report-address.vue";
let inited = false;
import { schema } from '@cloudpivot/form';

import env from '@/config/env';

export function init() {

    if (inited) {
        return;
    }

    inited = true;

    ReportOptions.baseUrl = env.portalHost;
    ReportOptions.charts = { list: { dimension: 50 } };
    
    ReportOptions.download.list = true;
    ReportOptions.download.pivotTable = true;
    
    ReportOptions.requestHeader = () => {
        const token = localStorage.getItem('token');
        if(!token){
            return null;
        }

        return {
            Authorization : 'Bearer ' + token
        }
    }
    ReportOptions.integrateComponents = (field: any): any | null => {
      let components: any = null;
      switch (field.dataType) { 
        case schema.DataItemType.Address:
            components = ReportAddress;
            break;
      }
      switch (field.dataType) {
        case schema.DataItemType.StaffSingle:
        case schema.DataItemType.StaffMulti:
        case schema.DataItemType.DeptSingle:
        case schema.DataItemType.DeptMulti:
        case schema.DataItemType.StaffDeptMix:
          components = reportOrg;
          break;
      }
      return components;
    };

}

init();