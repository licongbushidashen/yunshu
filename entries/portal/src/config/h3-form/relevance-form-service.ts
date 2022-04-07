import { renderer, schema } from "@cloudpivot/form";

const { DataItemType } = schema;

import { listApi, listParams, formApi, externalLinkApi } from "@cloudpivot/api";

import axios from "axios";

import common from "@cloudpivot/common";
import moment from "moment";

export const isDingtalk = /DingTalk/.test(navigator.userAgent);

import * as platform from '@cloudpivot/platform';

export class DefaultRelevanceFormService implements renderer.RelevanceFormService {
  search(
    schemaCode: string,
    queryCode: string,
    params: renderer.RelevanceFormSearchParams[],
    columns: string[],
    ...arg
  ) {
    // schemaCode = 'api1';
    // queryCode = 'api1';
    let hasRelevanceForm = false;
    const filters = params.map((x:any) => {
      let val: any = x.value;

      if (x.value !== null && x.value !== undefined) {
        switch (x.type) {
          case DataItemType.RelevanceForm:
            val = x.value.id || "";
            hasRelevanceForm = true; // 如果有关联表单 则返回display true 给后台
            break;
          case DataItemType.StaffSingle:
          case DataItemType.StaffMulti:
          case DataItemType.StaffDeptMix:
          case DataItemType.DeptMulti:
          case DataItemType.DeptSingle:
            // 关联下拉配置了筛选条件可能是个对象 非数组
            if (Array.isArray(x.value) && x.value.length > 0) {
              val = x.value.map((v: any) => ({
                id: v.id,
                type: v.unitType || v.type
              }));
              val = JSON.stringify(val);
            } else {
              val = JSON.stringify([]);
            }
            break;
          case DataItemType.Number:
            if (Array.isArray(x.value)) {
              val = x.value.map(v => v.toString()).join(";");
            } else {
              val = x.value + ";" + x.value;
            }
            break;
          case DataItemType.Date:
            if (x.value && x.value instanceof Date) {
              const str = moment(x.value).format("YYYY-MM-DD");
              val = str + ';' + str;
            } else if (x.value && x.value.indexOf(';') > -1) {
              val = x.value
            } else {
              val = x.value + ';' + x.value;
            }
            break;
          case DataItemType.Time:
            if (x.value && moment.isMoment(x.value)) {
              const str = x.value.format("HH:mm:ss");
              val = str + ';' + str;
            } else if (x.value && x.value.indexOf(';') > -1) {
              val = x.value
            } else {
              val = x.value + ';' + x.value;
            }
            break;
          case DataItemType.Logic:
            if (x.value && typeof x.value === 'string') {
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

    const obj: any = {
      queryCode,
      schemaCode,
      mobile: false,
      page: arg[0] || 0,
      size: 1000,//关联单选调用最多获取1000条数据
      pageSize: arg[1] || undefined,
      display: hasRelevanceForm,
      filters,
      view: arg[3] || {}
    };
    if (columns && columns.length > 0) {
      obj.options = {
        customDisplayColumns: columns,
        queryDisplayType: listParams.QueryDisplayType.Append
      };
    }

    return listApi.getQueryList(obj).then(res => {
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
      schemaCode
    };
    listApi.getFormUrl(params).then((res: any) => {
      // ;
      if (isDingtalk) {
        res += "&T=" + localStorage.getItem("token");
      }
      if (isAuthorize) {
        res +=
          "&tempAuthSheetId=" +
          sheetId +
          "&tempAuthObjectId=" +
          id +
          "&tempAuthPropertyCode=" +
          code;
      }
      window.open(res);
    });
  }

  async getListQueryConditions(
    schemaCode: string,
    listCode: string,
    params: renderer.RelevanceFormSearchParams[]
  ) {
    const res = await listApi.getListConfigData({ code: listCode, schemaCode });
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
    // axios.get('/api/app/bizproperty/list', {
    //   params: {
    //     schemaCode,
    //     isPublish: true
    //   }
    // }).then((res: any) => {
    //   if (res.errcode === 0) {
    //     return res.data;
    //   }
    //   return null;
    // });
  }

  getOptions(schemaCode: string, queryCode: string, params: any[], sheetDataItem: string, orderByFields: string[], orderType: number, condition: any) {
    // ;
    const filters = params.map(x => {

      // if( !x ) return;
      let val: any = x.value;

      if (x.propertyCode === 'sequenceStatus') {
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
        case DataItemType.Logic:
          val = `${x.value}`;
          break;
        case DataItemType.Date:
          val = common.utils.DateHandle.dateFormat(new Date(x.value), "YYYY-MM-DD");
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
        debugger
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
      size: 9999,
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
    // todo
  }
  loadForm(params: any) {
    return formApi.load(params).then(res => {
      return res;
    });
  }
  externalLinkSheet(id: string, type: string) {
    const params = {
      id,
      type,
    }
    return externalLinkApi.sheet(params).then(res => {
      return res;
    })
  }
  shortCodeConfig(sCode: string) {
    return Promise.resolve(null);
  }
}
