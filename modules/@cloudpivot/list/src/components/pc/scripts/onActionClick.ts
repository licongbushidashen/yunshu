import { listApi, listParams, formApi } from "@cloudpivot/api";
import * as platform from "@cloudpivot/platform";
import printFormCode from "./printFormCode";
import dataFormChange from "./dataFormChange";
import { modalTypes } from "@cloudpivot/form/src/typings";

export default {
  /*
   * 新增按钮
   */
  async handleAdd(vm: any, obj: listParams.QueryActions, _schemaCode?: string , isRelationForm: boolean = false) {
    //判断是否有权限发起流程表单
    const params: listParams.ApiImplicitParam = {
      schemaCode: obj.schemaCode,
      relativeCode: obj.associationCode,
      isMobile: false,
      queryActionType: obj.queryActionType,
      queryActionRelativeType: obj.associationType,
    };
    const res = await listApi.getJurisdiction(params);
    if (res.errcode === 700020) {
      vm.$message.warning(vm.$t("cloudpivot.list.pc.NoPermissionAdd"), 4);
      return;
    } else if (res.errcode === 401033) {
      vm.$message.warning(vm.$t("cloudpivot.list.pc.NoPublish"), 4);
      return;
    }
    console.log("新增按钮--------", obj);
    let url: string = "";
    const code = obj.associationCode;
    if (obj.associationType === 1) {
      // 关联流程
      url = `/form/detail?startWorkflowCode=${code}`;
    } else {
      // 关联表单
      // let { schemaCode } = vm.$route.params;
      let { schemaCode } = obj;
      schemaCode === undefined ? (schemaCode = _schemaCode as string) : schemaCode;
      url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${code}&queryCode=${vm.curListCode}`;
    }
    console.log("url--------", url);
    let search = location.search;
    search = search ? `${search}&iframeAction=add` : `?iframeAction=add`;
    url += `&return=${location.pathname + encodeURIComponent(search)}`;
    if (platform.IS_DINGTALK) {
      vm.$router.push(url).catch((err: any) => {
        err;
      });
    } else {
      // const opens = window.open(url);
      vm.showIframeForm = true;
      vm.IframeFormUrl = url;
    }
    if (isRelationForm){
      window.open(url,)
    }
    
  },

  /*
   * 删除按钮
   */
  async handleDeleteListData(vm: any) {
    const { schemaCode } = vm.$route.params;

    let _ids: string[] = [];
    const allObjectIds: any = [];
    
    vm.checkeds.forEach((c: boolean, index: number) => {
      if (c) {
        _ids.push(vm.dataSource[index].id);
      }
      allObjectIds.push(vm.dataSource[index].id);
    });
    if(vm.modelType === "TREE"){
      _ids = vm.treeCheck;
    }
    console.log(_ids,"_ids=----------------------------");
    
    // 如果当前未勾选任何数据，默认全部生成
    if (_ids.length === 0) {
      _ids = allObjectIds;
    }

    const params: listParams.DeleteListParams = {
      ids: _ids,
      schemaCode,
    };

    const res = await listApi.checkDeleteItems(params);
    if (res.errcode === 0 && Array.isArray(res.data)) {
      let countObj: any = {};
      res.data.forEach((data: any) => {
        switch (data.resultCode) {
          case 1000:
            countObj.count1 = data.objectIds ? data.objectIds.length : 0;
            break;
          case 1001:
            countObj.count2 = data.objectIds ? data.objectIds.length : 0;
            break;
          case 1002:
            countObj.count3 = data.objectIds ? data.objectIds.length : 0;
            break;
          case 1003:
            countObj.count4 = data.objectIds ? data.objectIds.length : 0;
            break;
          case 1004:
            countObj.count5 = data.objectIds ? data.objectIds.length : 0;
            break;
          case 1005:
            countObj.count6 = data.objectIds ? data.objectIds.length : 0;
            break;
          case 550010:
            countObj.count7 = data.objectIds ? data.objectIds.length : 0;
            let schemaName = "";
            vm.$i18n.locale === "zh"
              ? (schemaName = res.data.schemaName || "")
              : (schemaName = JSON.parse(res.data.schemaName_i18n).en || "");
            countObj.schemaName = schemaName;
            countObj.businessRuleName = res.data.businessRuleName;
            countObj.nodeName = res.data.nodeName;
            countObj.propertyCode = res.data.propertyCode;
            break;

          case 550006:
            countObj.count8 = data.objectIds ? data.objectIds.length : 0;
            let targetSchemaName = "";
            vm.$i18n.locale === "zh"
              ? (targetSchemaName = res.data.targetSchemaName || "")
              : (targetSchemaName =
                  JSON.parse(res.data.targetSchemaName_i18n).en || "");
            countObj.targetSchemaName = targetSchemaName;
            countObj.nodeName = res.data.nodeName;
            break;

          default:
            break;
        }
      });
      const h = vm.$createElement;
      const _this = this;
      vm.$confirm({
        title: h("span", { class: "delete-title" }, [
          `${vm.$t("cloudpivot.list.pc.DeleteItems").toString()}`,
        ]), // 以下数据删除后不能恢复，确定要删除吗？
        content: h("div", { class: "delete-content" }, [
          h("div", { class: { hidden: !countObj.count1 } }, [
            h("img", { attrs: { src: require("../image/dot.png") } }),
            `${vm.$t("cloudpivot.list.pc.BizData")} `,
            h("span", `${countObj.count1}`),
            ` ${vm.$t("cloudpivot.list.pc.Items")}`,
          ]),
          h("div", { class: { hidden: !countObj.count2 } }, [
            h("img", { attrs: { src: require("../image/dot.png") } }),
            `${vm.$t("cloudpivot.list.pc.wlData1")} `,
            h("span", `${countObj.count2}`),
            ` ${vm.$t("cloudpivot.list.pc.Items")}`,
            h(
              "p",
              { class: "tip-text" },
              `${vm.$t("cloudpivot.list.pc.DeleteItems1")}`
            ),
          ]),
          h("div", { class: { hidden: !countObj.count3 } }, [
            h("img", { attrs: { src: require("../image/dot.png") } }),
            `${vm.$t("cloudpivot.list.pc.wlData2")} `,
            h("span", `${countObj.count3}`),
            ` ${vm.$t("cloudpivot.list.pc.Items")}`,
            h(
              "p",
              { class: "tip-text" },
              `${vm.$t("cloudpivot.list.pc.DeleteItems2")}`
            ),
          ]),
          h("div", { class: { hidden: !countObj.count4 } }, [
            h("img", { attrs: { src: require("../image/dot.png") } }),
            `${vm.$t("cloudpivot.list.pc.wlData3")} `,
            h("span", `${countObj.count4}`),
            ` ${vm.$t("cloudpivot.list.pc.Items")}`,
            h(
              "p",
              { class: "tip-text" },
              `${vm.$t("cloudpivot.list.pc.DeleteItems3")}`
            ),
          ]),
          h("div", { class: { hidden: !countObj.count5 } }, [
            h("img", { attrs: { src: require("../image/dot.png") } }),
            `${vm.$t("cloudpivot.list.pc.NotAllowedDelete")} `,
            h("span", `${countObj.count5}`),
            ` ${vm.$t("cloudpivot.list.pc.Items")}`,
          ]),
          h("div", { class: { hidden: !countObj.count6 } }, [
            h("img", { attrs: { src: require("../image/dot.png") } }),
            `${vm.$t("cloudpivot.list.pc.NotDraftDelete")} `,
            h("span", `${countObj.count6}`),
            ` ${vm.$t("cloudpivot.list.pc.Items")}`,
          ]),
          h("div", { class: { hidden: !countObj.count7 } }, [
            h("img", { attrs: { src: require("../image/dot.png") } }),
            `${vm.$t("cloudpivot.list.pc.LogicCheckException", {
              targetSchemaName: countObj.targetSchemaName,
              nodeName: countObj.nodeName,
            })} `,
            h("span", `${countObj.count8}`),
            ` ${vm.$t("cloudpivot.list.pc.Items")}`,
          ]),
          h("div", { class: { hidden: !countObj.count8 } }, [
            h("img", { attrs: { src: require("../image/dot.png") } }),
            `${vm.$t("cloudpivot.list.pc.LogicCheckException", {
              targetSchemaName: countObj.targetSchemaName,
              nodeName: countObj.nodeName,
            })} `,
            h("span", `${countObj.count8}`),
            ` ${vm.$t("cloudpivot.list.pc.Items")}`,
          ]),
        ]),
        width: "520px",
        okText: vm.$t("cloudpivot.list.pc.OK").toString(),
        cancelText: vm.$t("cloudpivot.list.pc.Cancel").toString(),
        onOk() {
          window.postMessage('delete', '*')
          _this.deleteListItems(vm);
        },
        onCancel() {
          if (vm.eventHooksHandler) {
            vm.eventHooksHandler.exec(
              "onActionDone",
              vm.getAction("delete"),
              false
            );
          }
        },
        class: "test",
        className: "test1",
      } as any);
    }
  },

  /*
   * 删除列表项
   */
  async deleteListItems(vm: any) {
    vm.$message.loading(vm.$t("cloudpivot.list.pc.DeleteLoading"), 0);
    let _ids: string[] = [];
    vm.checkeds.forEach((c: boolean, index: number) => {
      if (c) {
        _ids.push(vm.dataSource[index].id);
      }
    });
    if(vm.modelType === "TREE"){
      _ids = vm.treeCheck;
    }
    const { schemaCode } = vm.$route.params;

    const params: listParams.DeleteListParams = {
      ids: _ids,
      schemaCode,
    };

    const res = await listApi.deleteListData(params);
    if (res.errcode === 0) {
      // 当前为最后一页时，且删除了所有数据，把当前页码减一
      if (
        _ids.length === vm.dataSource.length &&
        res.data.successCount === _ids.length &&
        vm.curPage > 1
      ) {
        vm.curPage -= 1;
      }

      if (res.data && res.data.errorCount > 0) {
        if (res.data.successCount === 0) {
          vm.$message.warning(
            vm.$t("cloudpivot.list.pc.NoPermissionDelete"),
            4
          );
        } else {
          vm.$message.warning(
            vm.$t("cloudpivot.list.pc.DeleteItemsTips", {
              successCount: res.data.successCount,
              errorCount: res.data.errorCount,
            }),
            4
          );
        }
      } else if (res.data && res.data.errorCount === 0) {
        if (res.data.successCount > 0) {
          vm.$message.success(vm.$t("cloudpivot.list.pc.DeleteSuccess"));
        }
      }

      vm.resetSelectAll(vm);
      vm.getQueryList("delete");
      if (vm.eventHooksHandler) {
        vm.eventHooksHandler.exec("onActionDone", vm.getAction("delete"), true);
      }
    } else if (res.errcode === 550006) {
      vm.$message.error(
        vm.$t("cloudpivot.form.runtime.tip.errTips13").toString()
      );
      if (vm.eventHooksHandler) {
        vm.eventHooksHandler.exec(
          "onActionDone",
          vm.getAction("delete"),
          false
        );
      }
    } else {
      // vm.$message.error(vm.$t('cloudpivot.list.pc.DeleteFailed'));
      // #42813 Delete中配置逻辑校验节点，不满足条件，在列表删除时返回后台返回错误信息
      if (res.errmsg) {
        vm.$message.error(res.errmsg);
      } else {
        vm.$message.error(vm.$t("cloudpivot.list.pc.DeleteFailed"));
      }
      if (vm.eventHooksHandler) {
        vm.eventHooksHandler.exec(
          "onActionDone",
          vm.getAction("delete"),
          false
        );
      }
    }
  },

  /**
   * 开始导入数据
   */
  async import(vm: any) {
    const params: listParams.ImportParams = {
      fileName: vm.importFileName,
      schemaCode: vm.schemaCode,
      queryCode: vm.curListCode,
      queryField: vm.importrQueryField,
    };
    const res = await listApi.importData(params);
    if (res.errcode !== 0) {
      vm.isImporting = false;
      vm.importStatus = listParams.ImportResult.SystemError;
    } else {
      vm.isImporting = true;
      this.simulateImport(vm, false);
    }
  },

  /**
   * 导入结束（不管成功与失败）
   */
  importEnd(vm: any, data: any) {
    vm.isImporting = false;
    vm.isImportEnd = true;
    vm.importFileName = data.fileName;
    vm.successNum = data.successCount;
    vm.failNum = data.errorCount;
    vm.importStatus = data.errorType;
    vm.errorMsg = data.errorMsg;
    if (data.errorType === 0) {
      vm.getQueryList();
    } else if (data.errorType === 1 || data.errorType === 8) {
      if (data.headColumns && data.secondImportData) {
        vm.secondSuccessNum = data.successCount;
        vm.secondFailNum = data.errorCount;
        vm.secondImportStatus = data.errorType;
        vm.handleCancel();
        vm.importData = {
          headColumns: data.headColumns,
          secondImportData: data.secondImportData,
          queryField: data.queryField,
        };
        vm.showImportErrModal = true;
      } else if (data.errorType === 1) {
        vm.getQueryList();
      }
    } else if (data.errorType === 3) {
      vm.importSize = data.importSize;
    }
  },

  /**
   * 模拟导入处理进度
   */
  simulateImport(vm: any, isReset?:boolean) {
    let percent = 1;
    if (isReset) {
      clearInterval(vm.percentInterval);
      // 进度重置为0
      vm.importPercent = 0;
    } else {
      // const interval = setInterval(() => {
      vm.percentInterval = setInterval(() => {
        if (!vm.isImportEnd) {
          if (percent <= 90) {
            percent += this.random(5);
            vm.importPercent = percent;
          }
        } else {
          clearInterval(vm.percentInterval);
          // 进度重置为0
          vm.importPercent = 0;
        }
      }, 3000);
    }
  },

  /**
   * 产生随机整数
   */
  random(num: number) {
    return Math.ceil(Math.random() * 5);
  },

  /*
   * 导出列表
   */
  async handleExportData(vm: any, data: any) {
    // const loading = vm.$message.loading(
    //   vm.$t("cloudpivot.list.pc.ExportLoading"),
    //   0
    // );

    const params: any = vm.queryParamsFormater();

    // utils.downloadFileByPost('/api/runtime/query/export_data', params);
    console.log("selectData", data);
    // 导出的数据项参数
    params.columns = data;

    // 20190604 导出一选中的项 isChecked
    params.objectIds = [];

    vm.checkeds.forEach((c: boolean, index: number) => {
      if (c) {
        params.objectIds.push(vm.dataSource[index].id);
      }
    });

    // 导出时传出所有的objectId
    params.allObjectId = [];

    vm.checkeds.forEach((c: boolean, index: number) => {
      params.allObjectId.push(vm.dataSource[index].id);
    });

    // 没有勾选，导出全部
    if (params.objectIds.length <= 0) {
      params.size = 0;
    }
    console.log(JSON.stringify(params));
    let result = "";
    const res = await listApi.exportAsyncData(params);
    if (res.errcode !== 0) {
      vm.$message.error(vm.$t("cloudpivot.list.pc.ExportFailure"));
      result = "";
    } else {
      result = res.data.id;
    }
    // 导出结果: 因为是文件形式, 也会触发下载, 所以返回简单 true/false 即可?

    // if (res.errcode && res.errcode !== 0) {

    // } else {
    //   loading();
    //   const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
    //   const date = new Date();
    //   const mounth = date.getMonth() > 8 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    //   const days = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    //   const hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    //   const minutes = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
    //   const seconds = date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;

    //   const stamp = `${date.getFullYear()}${mounth}${days}${hours}${minutes}${seconds}`;
    //   const fileName = `${vm.applicationPageTitle}导出${stamp}.xlsx`;

    //   if (window.navigator.msSaveOrOpenBlob) {
    //     navigator.msSaveBlob(blob, fileName);
    //   } else {
    //     const a = document.createElement('a');
    //     const url = URL.createObjectURL(blob);
    //     a.download = fileName;
    //     a.href = url;
    //     a.click();
    //     URL.revokeObjectURL(url);
    //   }
    //   result = true;
    // }

    return result;
  },
  /*
   * 批量打印from表单
   */
  async handlePrintForm(vm: any, codeTemp: string) {
    const { schemaCode } = vm.$route.params;
    const queryCode = vm.curListCode;

    const sheetCode = codeTemp;

    const { data, errcode, errmsg } = await formApi.getPrintAttributesJson({
      sheetCode,
      schemaCode,
    });
    if (errcode !== 0) {
      vm.$message.error(errmsg, 3);
      return;
    }

    let _ids: string[] = [];
    const allObjectIds: any = [];
    vm.checkeds.forEach((c: boolean, index: number) => {
      if (c) {
        _ids.push(vm.dataSource[index].id);
      }
      allObjectIds.push(vm.dataSource[index].id);
    });
    // 如果当前未勾选任何数据，默认全部生成
    if (_ids.length === 0) {
      _ids = allObjectIds;
    }

    // if (_ids.length >= 10) {
    //   vm.$message.warning(
    //     vm.$t("cloudpivot.list.pc.printformTips", {
    //       size: 10,
    //     }),
    //     4
    //   );
    //   return false;
    // }
    const printHtmlCloseLoading = (vm.$message as any).loading(
      vm.$t("cloudpivot.list.pc.loading").toString(),
      0
    );
    const list = await this.loopLoadInterface(_ids, schemaCode, queryCode);
    if (!list.arr) {
      vm.$message.error(list.errmsg, 4);
      return;
    }
    printFormCode.printBatchForm(vm, list, sheetCode, printHtmlCloseLoading);
  },
  async loopLoadInterface(
    _ids: string[],
    schemaCode: string,
    queryCode: string
  ) {
    let arr: any = null;
    let errmsg: string = "";
    const params = {
      objectIds: _ids,
      schemaCode: schemaCode,
      queryCode,
    };
    await listApi.getLoadData(params).then((res: any) => {
      if (res.data && !res.errcode) {
        arr = res.data;
      } else {
        errmsg = res.errmsg;
      }
    });
    if (!arr) {
      return { errmsg };
    }
    const changeArr = arr.map((i: any) => {
      return dataFormChange.initSystemForm(i);
    });
    return { arr, changeArr };
  },
};
