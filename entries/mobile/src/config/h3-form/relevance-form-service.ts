import { renderer, schema } from "@cloudpivot/form";

import * as platform from "@cloudpivot/platform";

import axios from "axios";
// import appsApi from '../../apis/apps.api';
import OauthApi from "@/apis/oauth";
import moment from "moment";

const { DataItemType } = schema;

import { listApi, listParams, formApi, externalLinkApi } from "@cloudpivot/api";

export enum QueryDisplayType {
  /**
   * 默认展示查询列表配置的显示字段
   */
  Default = "0",

  /**
   * 覆盖展示查询列表配置的显示字段
   */
  Override = "1",

  /**
   * 在查询列表配置的显示字段的基础上新增显示字段
   */
  Append = "2"
}

export class DefaultRelevanceFormService implements renderer.RelevanceFormService {
  search(
    schemaCode: string,
    queryCode: string,
    params: renderer.RelevanceFormSearchParams[],
    columns: string[],
    page: number,
    pageSize: number,
    query?: any[],
    view?: any,
  ) {
    // schemaCode = 'api1';
    // queryCode = 'api1';

    let hasRelevanceForm = false;
    let filters = params.map((x: any) => {
      let val: any = x.value || x.propertyValue;
      if (x.type && x.value) {
        switch (x.type) {
          case renderer.DataItemType.RelevanceForm:
            val = x.value.id || "";
            hasRelevanceForm = true; // 如果有关联表单,需要传display true给后台
            break;
          case renderer.DataItemType.StaffSingle:
          case renderer.DataItemType.StaffMulti:
          case renderer.DataItemType.StaffDeptMix:
          case renderer.DataItemType.DeptMulti:
          case renderer.DataItemType.DeptSingle:
            val = x.value.map((v: any) => ({
              id: v.id,
              type: v.unitType || v.type
            }));
            val = JSON.stringify(val);
            break;
          case DataItemType.Date:
            if (x.value && x.value instanceof Date) {
              const str = moment(x.value).format("YYYY-MM-DD");
              val = str + ';' + str;
            } else if(x.value && x.value.indexOf(';') > -1){
              val = x.value
            } else {
              val = x.value + ';' + x.value;
            }
            break;
          case DataItemType.Time:
            if (x.value && moment.isMoment(x.value)) {
              const str = x.value.format("HH:mm:ss");
              val = str + ';' + str;
            } else if(x.value && x.value.indexOf(';') > -1){
              val = x.value
            } else {
              val = x.value + ';' + x.value;
            }
          case DataItemType.Logic:
            if(x.value && typeof x.value === 'string') {
              if (x.value === 'false' || x.value === '否') {
                val = false;
              } else {
                val = true;
              }
            } else {
              val = x.value
            }
            break;
          case DataItemType.Address:
            if (x.value && typeof x.value === 'object') {
              val = JSON.stringify(x.value);
            } else {
              val = x.value;
            }
            break;
          default:
            if (Array.isArray(x.value)) {
              val = x.value.map(v => v.toString()).join(";");
            } else {
              val = x.value;
            }
            break;
        }
      }

      if (x.code === "sequenceStatus" && schema.FormStatusZhToEn[val]) {
        val = schema.FormStatusZhToEn[val];
      }

      return {
        propertyCode: x.code,
        propertyType: x.type,
        propertyValue: val || ''
      };
    });

    if (query) {
      filters = filters.concat(query);
    }

    const obj: any = {
      queryCode,
      schemaCode,
      mobile: true,
      page: page - 1,
      size: pageSize,
      display: hasRelevanceForm,
      filters,
      view,
    };

    if (columns && columns.length > 0) {
      obj.options = {
        customDisplayColumns: columns,
        queryDisplayType: QueryDisplayType.Append
      };
    }

    return listApi.getQueryList(obj).then((res: any) => {
      if (res.errcode === 0 && res.data) {
        const data = res.data.content;
        // .map((x: any) => x.data);
        return {
          total: res.data.totalElements,
          data
        };
      }
      return {
        total: 0,
        data: []
      };
    });
  }

  open(
    schemaCode: string,
    queryCode: string,
    id: string,
    sheetId: string,
    isAuthorize: boolean,
    code: string,
    value: any
  ) {
    const params = {
      bizObjectId: value.id,
      schemaCode: schemaCode
    };
    listApi.getFormUrl(params).then((res: any) => {
      const hash = window.location.hash.substr(1);
      let url = window.location.href.replace(hash, res);

      if (isAuthorize) {
        url +=
          "&tempAuthSheetId=" +
          sheetId +
          "&tempAuthObjectId=" +
          id +
          "&tempAuthPropertyCode=" +
          code;
      }

      window.location.href = url;

      // platform.service.openLink();
      // console.log(url);
      // if (common.isDingtalk) {
      //   dingtalk.openLink(url);
      // } else {
      //   window.open(url);
      // }
    });
  }

  dataitemsOf(schemaCode: string) {
    return axios
      .get("/api/app/bizproperty/list", {
        params: {
          schemaCode,
          isPublish: true
        }
      })
      .then((res: any) => {
        if (res.errcode === 0) {
          return res.data;
        }
        return [];
      });
  }

  getBizmodelTitle(schemaCode: string) {
    return formApi.getBizModelName(schemaCode).then(res => {
      if (res.errcode === 0) {
        return res.data;
      }
      return null;
    });
  }

  async getListQueryConditions(
    schemaCode: string,
    listCode: string,
    params: renderer.RelevanceFormSearchParams[]
  ) {
    const res = await listApi.getListConfigData({ code: listCode, schemaCode, clientType: "APP" });
    if (res.errcode !== 0 || !res.data) {
      return null;
    }

    const conditions: any[] = res.data.queryConditions || [];
    const queryActions: any[] = res.data.queryActions || [];
    const queryColumns: any[] = res.data.queryColumns || [];
    // if (!conditions || conditions.length === 0) {
    //   return null;
    // }
    // if (!res.data) {

    // }
    const sequenceStatus: any = conditions.find(c => c.propertyCode === "sequenceStatus");
    if (sequenceStatus && sequenceStatus.defaultValue) {
      const state = sequenceStatus.defaultValue.split(";");
      const vals_zh: string[] = [];
      state.forEach(s => {
        switch (s) {
          case "DRAFT":
            vals_zh.push("草稿");
            break;
          case "PROCESSING":
            vals_zh.push("进行中");
            break;
          case "COMPLETED":
            vals_zh.push("已完成");
            break;
          case "CANCELED":
            vals_zh.push("已作废");
            break;
          default:
            break;
        }
      });
      sequenceStatus.defaultValue = vals_zh.join(";");
    }

    params.forEach(x => {
      const item = conditions.find((q: any) => q.propertyCode === x.code);
      if (item) {
        switch (item.propertyType) {
          case DataItemType.Date:
          case DataItemType.Time:
          case DataItemType.Number:
            if (x.value !== "") {
              item.defaultValue = [x.value, x.value];
            }
            break;
          case DataItemType.Logic:
            if (x.value === "false" || x.value === false) {
              item.defaultState = 0;
              item.defaultValue = false;
            } else {
              item.defaultState = 1;
              item.defaultValue = true;
            }
            break;
          default:
            if (x.value !== undefined && x.value !== null) {
              item.defaultValue = x.value;
            }
            break;
        }
      }
    });
    console.log(conditions);
    return {
      conditions,
      queryActions,
      queryColumns
    };
  }

  getOptions(schemaCode: string, queryCode: string, params: any[], sheetDataItem: string, orderByFields: string[], orderType: number, condition: any) {
    // ;
    const filters = params.map(x => {
      // if( !x ) return;
      let val: any = x.value;

      if(x.propertyCode === 'sequenceStatus') {
        switch (val) {
          case "草稿":
            x.value = "DRAFT";
            break;
          case "进行中":
            x.value = "PROCESSING";
            break;
          case "已完成":
            x.value = "COMPLETED";
            break;
          case "已作废":
            x.value = "CANCELED";
            break;
          default:
            break;
        }
      }
      switch (x.type) {
        case DataItemType.RelevanceForm:
          val = x.value.id || "";
          break;
        case DataItemType.StaffSingle:
        case DataItemType.StaffMulti:
        case DataItemType.StaffDeptMix:
        case DataItemType.DeptMulti:
        case DataItemType.DeptSingle:
          val = x.value.map((v: any) => ({
            id: v.id,
            type: v.unitType || v.type
          }));
          val = JSON.stringify(val);
          break;
        case DataItemType.Number:
          if (Array.isArray(x.value)) {
            val = x.value.map(v => v.toString()).join(";");
          } else {
            val = x.value;
          }
          break;
        default:
          if (Array.isArray(x.value)) {
            val = x.value.map(v => v.toString()).join(";");
          } else {
            val = x.value;
          }
          break;
      }
      // switch(x.ctrlType) {
      //   case schema.FormControlType.CreateBy:
      //   case schema.FormControlType.ModifyBy:
      //   case schema.FormControlType.CreateByParentId:
      //     val = JSON.stringify(x.propertyValue);
      //     break;
      //   case schema.FormControlType.Dropdown:
      //   case schema.FormControlType.Checkbox:
      //   case schema.FormControlType.Radio:
      //     if(typeof val !== 'string') {
      //       val = val.join(';');
      //     }
      //     break;
      //   default:
      //       val = x.propertyValue
      //     break;
      // }
      return {
        propertyCode: x.propertyCode,
        propertyValue: val,
        op: "Eq"
      };
    });
    let options = {
      customDisplayColumns: [sheetDataItem]
    };
    const obj: any = {
      queryCode,
      schemaCode,
      options,
      orderByFields,
      orderType,
      page: 0,
      size: 1000,
      filters,
      condition
    };
    return listApi.listSkipQueryList(obj).then(res => {
      if (res.errcode === 0) {
        const data: string[] = [];
        res.data.content.forEach((x: any) => {
          const s = x.data[sheetDataItem];
          let t = "";
          if (s && data.indexOf(s) === -1) {
            if (sheetDataItem === "sequenceStatus") {
              switch (s) {
                case "DRAFT":
                  t = "草稿";
                  break;
                case "PROCESSING":
                  t = "进行中";
                  break;
                case "COMPLETED":
                  t = "已完成";
                  break;
                case "CANCELED":
                  t = "已作废";
                  break;
                default:
                  break;
              }
              data.push(t);
            } else {
              data.push(s);
            }
          }
        });
        return data;
      }
      return [];
    });
  }

  queryDefaultValue(schemaCode: string, queryCode: string, columns: string[], filters: any[]) {
    const obj: any = {
      queryCode,
      schemaCode,
      mobile: false,
      page: 0,
      size: 2,
      filters
    };

    if (columns && columns.length > 0) {
      obj.options = {
        customDisplayColumns: columns,
        queryDisplayType: listParams.QueryDisplayType.Append
      };
    }

    return listApi.listSkipQueryList(obj).then(res => {
      if (res.errcode === 0) {
        const data = res.data.content.map((x: any) => x.data);
        return {
          total: res.data.totalElements,
          data
        };
      }
      return {
        total: 0,
        data: []
      };
    });
  }
  scan(successFn: (data: string) => void, failFn?: Function) {
    const params = {
      successFn
    }
    platform.service.scan(params)
  }
  uploadImageFromCamera(successFn: (data: string[]) => void, failFn?: Function) {
    const params = {
      successFn
    }
    platform.service.uploadImageFromCamera(params)
  }
  loadForm(params:any) {
    return formApi.load(params).then(res => {
      return res;
    });
  }
  externalLinkSheet(id:string, type:string) {
    const params = {
      id,
      type,
    }
    return externalLinkApi.sheet(params).then(res => {
      return res;
    })
  }

  shortCodeConfig(sCode:string) {
    return OauthApi.getShortCode(sCode).then((sCodeRes: any) => {
      return sCodeRes;
    });
  }
}
