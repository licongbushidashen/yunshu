import { formApi, workflowApi } from "@cloudpivot/api";
import env from "@cloudpivot/list/env";
import common from "@cloudpivot/common";
const { replaceValueData } = common.utils.BusinessFunctions;
import { recursionSearch } from "@cloudpivot/common/src/utils/utils";
import { schema, renderer } from "@cloudpivot/form";
import { DataItemType } from "@cloudpivot/form/schema";
import { ControlHelper } from "@cloudpivot/form/src/common/controls/control-helper";
import moment from 'moment';
import H3PrintRuntime from '@h3print/runtime';
import { UploadControl } from "@cloudpivot/form/src/common/controls/upload-control";
import Bus from "@cloudpivot/form/utils/bus";
import { format } from "@cloudpivot/form/utils/number-formatter";
import {
  textDataItemOperators,
  numberDataItemOperators,
  logicDataItemOperators,
  DateItemOperatorType,
  sequenceStatusOperators,
  staffDataItemOperators,
} from "@cloudpivot/form/src/common/data-item/data-item2";

const pageSettings: any = {
  eleType: "pageSettings",
  direction: 1,
  _papersize: {
    id: 1,
    scale: "A4",
    widthTomm: 210,
    heightTomm: 297,
    widthTopx: "595",
    heightTopx: "842",
  },
  _pagemargin: {
    UpTomm: 20,
    DownTomm: 20,
    LeftTomm: 17,
    RightTomm: 17,
    UpTopx: 57,
    DownTopx: 57,
    LeftTopx: 48,
    RightTopx: 48,
  },
  _headerfooter: {
    header: {
      marginTopTomm: 10,
      marginTopTopx: 28,
      align: "",
      items: { key: [], value: [] },
    },
    footer: {
      marginTopTomm: 10,
      marginTopTopx: 28,
      align: "",
      items: { key: [], value: [] },
    },
  },
  bgImg: {
    uid: "",
    name: "",
    status: "",
    url: "",
  },
  isPrintBgImg: false,
};

export default {
  async printBatchForm(vm: any, list: any, sheetCode: string, loadingFn: any = null) {
    const { schemaCode } = vm.$route.params;
    const arrList: any = [];
    const tempList: any = [];
    const { data, errcode, errmsg } = await formApi.getPrintAttributesJson({
      sheetCode,
      schemaCode,
    });
    if (errcode !== 0) {
      if (loadingFn) {
        loadingFn();
      }
      vm.$message.error(errmsg, 3);
      return;
    }

    if (!data.draftAttributesJson || !JSON.parse(data.draftAttributesJson).length) {
      if (loadingFn) {
        loadingFn();
      }
      vm.$message.warning("???????????????????????????", 3);
      return;
    }

    try {
      if(data.printJson) {
        // ????????????????????????
        this.packageData(vm, data, list, schemaCode, loadingFn);
      } else {
        for (let i = 0; i < list.arr.length; i++) {
          const arr: any = await this.printFormCode(
            vm,
            {
              arr: list.arr[i],
              changeArr: list.changeArr[i].map,
              formControls: list.changeArr[i].formControls,
            },
            data
          );
          arr.draftAttributesJson.length && arrList.push(arr.draftAttributesJson);
          arr.tempPrientList.length && tempList.push(arr.tempPrientList);
        }
        vm.tempPrintEleArray = tempList;
        vm.draftAttributesJsonSet = arrList;
        if (!tempList.length) {
          this._startPrintHtml(vm);
          if (loadingFn) {
            loadingFn();
          }
        }
      }
    } catch(err) {
      if (loadingFn) {
        loadingFn();
      }
    }
  },

  /*
   * ??????????????????
   */
  async printFormCode(
    vm: any,
    { arr, changeArr, formControls }: any,
    data: any
  ) {
    vm.formdata = arr;
    vm.formControls = formControls || [];

    vm.printHtmlCloseLoading = (vm.$message as any).loading(
      vm.$t("cloudpivot.list.pc.loading").toString(),
      0
    );
    if (
      !data.draftAttributesJson ||
      !JSON.parse(data.draftAttributesJson).length
    ) {
      vm.$message.warning("???????????????????????????", 3);
      return;
    }
    vm.formObj = arr;
    // @ts-ignore
    vm.draftAttributesJson = replaceValueData(
      env,
      JSON.parse(data.draftAttributesJson) || [],
      "real",
      vm
    );
    findPageSettingInfo: for (let pages of vm.draftAttributesJson) {
      for (let item of pages) {
        if (item.eleType === "pageSettings") {
          item.top = -999;
          vm.tempPrintPageSettings = item;
          break findPageSettingInfo;
        }
      }
    }
    // ????????????????????????pageSettings??????????????????
    vm.tempPrintPageSettings === ""
      ? (vm.tempPrintPageSettings = pageSettings)
      : vm.tempPrintPageSettings;
    for (let page of vm.draftAttributesJson) {
      page.sort((a, b) => a.top - b.top);
    }
    const publishedAttributesJson = arr.bizSheet.publishedAttributesJson;
    let publishObjJSON = null;
    if (publishedAttributesJson) {
      publishObjJSON = JSON.parse(publishedAttributesJson);
    }
    const formDataVal: any = arr.bizObject.data;
    for (const page of vm.draftAttributesJson) {
      for (let ii = page.length - 1; ii >= 0; ii--) {
        let y = page[ii];
        let isCheckVisible = this.checkVisible(y, publishObjJSON, formDataVal);
        if (!isCheckVisible) {
          page.splice(ii, 1);
        }
        if (y.eleType !== "sheet") continue;
        const value = arr.bizObject.data[y.code];
        if (value && value.length > 0) {
          const valueCopy = JSON.parse(JSON.stringify(value));

          const controls = this.findFormControls(changeArr, [y.code]);
          if (controls && controls.length > 0) {
            const control = (controls[0] as any) as schema.FormSheet;
            if (control) {
              const map: any = {};
              control.columns.map((c) => (map[c.key] = c));

              for (const row of valueCopy) {
                for (const key of Object.keys(row)) {
                  if (map[key]) {
                    if (
                      map[key].type !== schema.FormControlType.Attachment &&
                      map[key].type !== schema.FormControlType.Image &&
                      map[key].type !== schema.FormControlType.RelevanceForm &&
                      map[key].type !==
                        schema.FormControlType.RelevanceFormEx &&
                      map[key].type !== schema.FormControlType.Signature
                    ) {
                      row[key] = renderer.FormControlValueService.format(
                        map[key],
                        row[key]
                      );
                    } else {
                      if (
                        map[key].type ===
                          schema.FormControlType.RelevanceForm ||
                        map[key].type === schema.FormControlType.RelevanceFormEx
                      ) {
                        let str: any = "";

                        row[key] && row[key][row[key]["displayCode"]]
                          ? (str = row[key][row[key]["displayCode"]])
                          : str;
                        // ??????
                        if (row[key] && row[key].propertyType === 4) {
                          str === true ? (str = "???") : (str = "???");
                        }

                        // ????????????
                        if (row[key] && row[key].propertyType === 10 && str) {
                          let obj = JSON.parse(str);
                          if (
                            obj &&
                            (obj.hasOwnProperty("provinceName") ||
                              obj.hasOwnProperty("cityName") ||
                              obj.hasOwnProperty("districtName") ||
                              obj.hasOwnProperty("address"))
                          ) {
                            // @ts-ignore
                            str = `${obj.provinceName || ""}${
                              obj.cityName || ""
                            }${obj.districtName || ""}${obj.address || ""}`;
                          }
                        }
                        // ??????????????????
                        if (row[key] && row[key].propertyType === 5 && str) {
                          let arrStr: string = "";
                          str.map((arr: any) => {
                            arrStr === ""
                              ? (arrStr = arr.name)
                              : (arrStr += `???` + arr.name);
                          });
                          str = arrStr;
                        }

                        switch (str) {
                          case "DRAFT":
                            str = "??????";
                            break;
                          case "PROCESSING":
                            str = "?????????";
                            break;
                          case "COMPLETED":
                            str = "?????????";
                            break;
                          case "CANCELED":
                            str = "?????????";
                            break;
                        }
                        row[key] = str.toString();
                      }
                      // ????????????
                      else if (
                        map[key].type === schema.FormControlType.Signature
                      ) {
                        let signature: any = {};
                        Array.isArray(row[key]) && row[key].length > 0
                          ? (signature = row[key][0])
                          : (signature = []);
                        if (signature && signature.refId) {
                          const url = renderer.UploadControl.service.getDownloadUrl(
                            signature
                          );
                          row[key][0].url = url;
                          row[key][0].type = map[key].type;
                        }
                      } else {
                        row[key].forEach((v) => (v.type = map[key].type));
                      }
                    }

                    // ?????????????????????????????? ??????????????????
                    if (map[key].key.includes("Logic")) {
                      row[key] = row[key] === "true" ? "???" : "???";
                    }
                  } else {
                    const val = row[key];
                    if (Array.isArray(val)) {
                      row[key] = val
                        .map((v: any) => v.name)
                        .filter((f) => !!f)
                        .join(";");
                    } else if (typeof val === "object" && val) {
                      if (val.name) {
                        row[key] = val.name;
                      } else if (val.provinceName && val.cityName) {
                        row[
                          key
                        ] = `${val.provinceName} ${val.cityName} ${val.districtName} ${val.address}`;
                      } else if (val.address) {
                        row[key] = val.address;
                      } else {
                        row[key] = "";
                      }
                    }
                  }
                }
              }
            }
          }
          y.value = valueCopy;
        } else {
          // ???????????????????????????????????????
          page.splice(ii, 1);
        }
      }
    }
    let tempPrientList: any = [];
    for (let i = 0; i < vm.draftAttributesJson.length; i++) {
      let page = vm.draftAttributesJson[i];
      for (let j = 0; j < page.length; j++) {
        let ele = page[j];
        if (ele.eleType === "column" && ele.rightValue && ele.rightValue.code) {
          let code = ele.rightValue.code.split("#_#")[0];
          let [ctrl] = this.findFormControls(changeArr, [code]);
          if (!ctrl) continue;
          if (!!ctrl) {
            ele.ctrlType = ctrl.type;
            ele.ctrlValue = ctrl.value;
          }
          if (ctrl.type === schema.FormControlType.Textarea) {
            ++vm.tempPrintEleNumber;
            tempPrientList.push({
              tempPrintEle: ele,
              isShowTempPrintHtmlEle: true,
              key: `${code}_${i}_${j}`,
            });

            // ?????????????????????
            if (
              ctrl.options &&
              ctrl.options.textAreaType &&
              ctrl.options.textAreaType === "current"
            ) {
              ele.rightValue.renderType = "editor";
            }
          } else if (ctrl.type === schema.FormControlType.Image) {
            ++vm.tempPrintEleNumber;
            tempPrientList.push({
              tempPrintEle: ele,
              isShowTempPrintHtmlEle: true,
              key: `${code}_${i}_${j}`,
            });
          }
        } else if (ele.eleType === "sheet") {
          let code = ele.code;
          ++vm.tempPrintEleNumber;
          tempPrientList.push({
            tempPrintEle: ele,
            isShowTempPrintHtmlEle: true,
            key: `${code}_${i}_${j}`,
          });
        }
      }
    }
    console.log(tempPrientList, "tempPrintEleArray", vm.tempPrintEleNumber);
    return { tempPrientList, draftAttributesJson: vm.draftAttributesJson };
  },
  _findPrintEleIndex(id: any, value, vm: any) {
    let num = [-1, -1, -1];
    vm.draftAttributesJsonSet.forEach((e: any, c: number) => {
      e.forEach((i: any, v: number) => {
        i.forEach((n: any, k: number) => {
          let a = JSON.stringify(n.value);
          let b = JSON.stringify(value);
          if (
            n.id === id &&
            ((n.value && a === b) || !value)
          ) {
            num = [c, v, k];
          }
        });
      });
    });
    return num;
  },
  // ?????????????????? ?????????????????????
  collectorTempPrintInfo({ id, calcDiff, value, ...other }, vm: any) {
    if (!("_num" in vm.collectorTempPrintContainer)) {
      vm.collectorTempPrintContainer._num = 0;
    }
    ++vm.collectorTempPrintContainer._num;

    let [aIndex, pIndex, sIndex] = this._findPrintEleIndex(id, value, vm);
    if (!vm.collectorTempPrintContainer[aIndex]) {
      vm.collectorTempPrintContainer[aIndex] = {};
    }
    if (!vm.collectorTempPrintContainer[aIndex][pIndex]) {
      vm.collectorTempPrintContainer[aIndex][pIndex] = {};
    }
    vm.collectorTempPrintContainer[aIndex][pIndex][sIndex] = {
      id,
      calcDiff,
      ...other,
    };
    this.printPageAlgorithm(vm, value, aIndex, pIndex, sIndex);
  },
  printPageAlgorithm(vm: any, value: any, page: any, p: any, eleIndex: any) {
    console.log(
      "PcFormDetail -> printPageAlgorithm -> vm.collectorTempPrintContainer",
      vm.collectorTempPrintContainer
    );
    let eleInfo = vm.collectorTempPrintContainer[page][p][eleIndex];
    if (eleInfo.calcDiff) {
      let [aIndex, pIndex, sIndex] = this._findPrintEleIndex(
        eleInfo.id,
        value,
        vm
      ); // ??????id????????????????????????, ?????????for????????????draftAttributesJson
      let ele = vm.draftAttributesJsonSet[aIndex][pIndex][sIndex];
      let eleContentWidth = "";
      let eleMinWidth = "";
      let eleMaxWidth = "";
      let eleDefaultBottomHeight = ele.top + ele.heightValue;
      let newPageNum = 0; // ele ????????????
      let eleBottomToTop = 0; // ele ??????????????????, ???????????????????????????
      let lastPageHeight = 0; // ele??????,???????????????????????????
      if (
        ele.top + eleInfo.eleContentHeight + eleInfo.pageUpToPx >
        eleInfo.PageHeightPx
      ) {
        newPageNum = Math.ceil(
          Math.abs(
            (eleInfo.eleContentHeight) -
              (eleInfo.PageHeightPx - ele.top - eleInfo.pageUpToPx)
          ) / (eleInfo.PageHeightPx + eleInfo.pageUpToPx + eleInfo.downTopx)
        );
        lastPageHeight = Math.ceil(
          (eleInfo.eleContentHeight) -
            (eleInfo.PageHeightPx - ele.top - eleInfo.pageUpToPx) -
            (newPageNum - 1) * (eleInfo.PageHeightPx + eleInfo.pageUpToPx + eleInfo.downTopx)
        );
        // console.log(newPageNum,'newPageNum');
        // ???????????? ??????????????????,?????????????????????????????????????????????
        if (eleInfo.sheetHeaderPagingAttr) {
          lastPageHeight = lastPageHeight + newPageNum * eleInfo.headerHeight;
        }
      } else {
        eleBottomToTop = ele.top + eleInfo.eleContentHeight;
      }
      if (ele.eleType === "column") {
        eleContentWidth = ele.leftKey.widthValue + ele.rightValue.widthValue;
        eleMinWidth = ele.left;
        eleMaxWidth = ele.left + eleContentWidth;
      } else if (ele.eleType === "sheet") {
        eleContentWidth = ele.widthValue;
        eleMinWidth = ele.left;
        eleMaxWidth = ele.left + eleContentWidth;
      }
      let eleSibling: any = [];
      let eleSiblingIndex: number[] = [];
      let passivity_eleSibling: any = []; // ?????? ???????????????. ??????????????????????????????,???????????????????????????????????????,??????????????????????????????????????????.
      let passivity_eleSiblingIndex: any = []; // ?????? ????????????????????????
      let passivity_newPageNum: any = 0; // ?????? ???????????????.?????????????????????. ??????????????????1???0
      let _widthValueEleType = ["leftBarcodePic", "leftQrcodePic", "sheet"];
      // ????????????????????? ????????????????????????.
      console.log(
        vm.draftAttributesJsonSet[aIndex][pIndex].length > sIndex + 1,
        "dd",
        vm.draftAttributesJsonSet[aIndex][pIndex]
      );

      if (vm.draftAttributesJsonSet[aIndex][pIndex].length > sIndex + 1) {
        let l = vm.draftAttributesJsonSet[aIndex][pIndex].length;
        for (let i = sIndex + 1; i < l; i++) {
          let tItem = vm.draftAttributesJsonSet[aIndex][pIndex][i];
          if (tItem.eleType === "pageSettings") continue;
          let tItemContentWidth: any = "";
          if (
            tItem.eleType === "column" ||
            (tItem.leftKey &&
              (tItem.leftKey.widthValue || tItem.leftKey.widthValue == "0") &&
              tItem.rightValue &&
              (tItem.rightValue.widthValue ||
                tItem.rightValue.widthValue == "0"))
          ) {
            tItemContentWidth =
              tItem.leftKey.widthValue + tItem.rightValue.widthValue;
          } else if (_widthValueEleType.includes(tItem.eleType)) {
            tItemContentWidth = tItem.widthValue;
          }
          let diffTop = tItem.top - ele.top - ele.heightValue;
          if (
            !(
              tItem.left + tItemContentWidth <= eleMinWidth ||
              tItem.left >= eleMaxWidth
            ) ||
            diffTop >= 0
          ) {
            // ?????? ????????? ?????????????????? X???????????? ??? ???????????????????????????,????????????X?????????
            if (newPageNum) {
              // ???????????????????????????. ??????????????????????????????????????????????????? ?????????
              tItem.top = lastPageHeight + diffTop;
            } else {
              // ?????????????????????
              tItem.top = diffTop + eleBottomToTop;
              if (tItem.top > eleInfo.PageHeightPx) {
                tItem.top = tItem.top - eleInfo.PageHeightPx;
                passivity_eleSiblingIndex.push(i);
                passivity_newPageNum = 1;
              }
            }
            console.log(diffTop, tItem.top);
            eleSiblingIndex.push(i);
          }
        }
        // ????????????????????????,?????????????????????????????????????????????
        if (eleSiblingIndex.length && newPageNum) {
          for (let i = 0; i < eleSiblingIndex.length; i++) {
            let [s] = vm.draftAttributesJsonSet[aIndex][pIndex].splice(
              eleSiblingIndex[i] - i,
              1
            );
            eleSibling.push(s);
          }
        } else if (passivity_eleSiblingIndex.length && passivity_newPageNum) {
          for (let i = 0; i < passivity_eleSiblingIndex.length; i++) {
            let [s] = vm.draftAttributesJsonSet[aIndex][pIndex].splice(
              passivity_eleSiblingIndex[i] - i,
              1
            );
            passivity_eleSibling.push(s);
          }
        }
      }
      let tempPage: any = [];
      for (let i = 0; i < newPageNum; i++) {
        tempPage.push([]);
      }
      if (newPageNum) {
        // ???????????????????????????
        if (eleSibling.length) {
          // ?????????????????????
          tempPage[tempPage.length - 1] = [...eleSibling];
        }
        vm.draftAttributesJsonSet[aIndex].splice(pIndex + 1, 0, ...tempPage);
      } else {
        // ??????????????????????????????
        if (passivity_newPageNum && passivity_eleSiblingIndex.length) {
          for (let i = 0; i < passivity_newPageNum; i++) {
            tempPage.push([]);
          }
          tempPage[tempPage.length - 1] = [...passivity_eleSibling];
          vm.draftAttributesJsonSet[aIndex].splice(pIndex + 1, 0, ...tempPage);
        }
      }
    }
    console.log(
      "PcFormDetail -> printPageAlgorithm -> this.draftAttributesJson",
      vm.draftAttributesJsonSet
    );
    if (vm.tempPrintEleNumber === vm.collectorTempPrintContainer._num) {
      vm.tempPrintEleArray = [];
      vm.tempPrintEleNumber = 0;
      delete vm.collectorTempPrintContainer._num;
      vm.$nextTick(() => {
        this._startPrintHtml(vm);
      });
    }
  },
  _startPrintHtml(vm: any) {
    vm.isPrintGenerateHtml = true;
    setTimeout(async () => {
      // ???????????????????????????????????????html??????
      await this.waitPrintRender(vm);
    }, 2000);
  },
  async waitPrintRender(vm: any) {
    const printRenderer = vm.$refs.printRenderer as any;
    if (printRenderer) {
      // isEdage  ????????????Edage?????????  Edge??????????????????onload ?????????????????????
      const isEdage: boolean =
        window.navigator.userAgent.indexOf("Edge") !== -1;
      if (
        isEdage ||
        !!(window as any).ActiveXObject ||
        "ActiveXObject" in window
      ) {
        // const iframe: any = document.getElementById("pdfFrame");
        // this.$nextTick(() => {
        //   this.srcdoc = printRenderer.getHtml();
        //   console.log(this.srcdoc);
        //   iframe.contentWindow.document.body.innerHTML = this.srcdoc;
        //   iframe.contentWindow.print();
        // });
        const newWindow: any = window.open();
        newWindow.document.write(printRenderer.getHtml());
        newWindow.document.close();
        newWindow.focus();
        newWindow.print();
        newWindow.close();
        vm.printHtmlCloseLoading();
      } else {
        const isTrident: boolean =
          window.navigator.userAgent.indexOf("Trident") !== -1;
        setTimeout(async () => {
          vm.$nextTick(() => {
            vm.srcdoc = printRenderer.getHtml();
            console.log("print html:", vm.srcdoc);
            const iframe: any = document.getElementById("pdfFrame");
            vm.isPrintGenerateHtml = false;
            // let page = window.open('', '_blank');// ????????????????????????????????????
            // page.document.body.innerHTML = vm.srcdoc;// ???????????????????????????
            iframe.onload = () => {
              vm.printHtmlCloseLoading();
              setTimeout(() => {
                if (!vm.srcdoc) return;
                if (isTrident) {
                  iframe.contentWindow.document.execCommand(
                    "print",
                    false,
                    null
                  );
                } else {
                  iframe.contentWindow.print();
                }
                vm.srcdoc = "";
              }, 300);
            };
            if (isTrident) {
              iframe.onload();
            }
          });
        }, 1800);
      }
    } else {
      setTimeout(() => {
        this.waitPrintRender(vm.printHtmlCloseLoading());
      }, 500);
    }
  },
  findFormControls(formControlMap: any, keys?: string[]) {
    return Object.keys(formControlMap)
      .filter((k) => {
        if (keys) {
          return keys.indexOf(k) > -1;
        }
        return true;
      })
      .map((k) => formControlMap[k]);
  },
  /*
   * ????????????????????????????????????????????????????????????????????????
   */
  checkVisible(ele, publishedJSONObj, formDataVal) {
    let isVisible = true;
    let tplEle: any = null;
    if (ele.eleType === "column" && ele.rightValue && ele.rightValue.code) {
      let code = ele.rightValue.code.split("#_#")[0];
      tplEle = recursionSearch(publishedJSONObj, code);
    } else if (ele.eleType === "sheet") {
      tplEle = recursionSearch(publishedJSONObj, ele.code);
    }
    if (tplEle && tplEle.options) {
      let displayFormula = tplEle.options.displayFormula;
      if (displayFormula) {
        if (displayFormula.indexOf("&&") > -1) {
          // ??????And???????????? ??????isShow
          let andArr: any[] = displayFormula.split("&&");
          return andArr.every((item) => {
            return this.checkCondition(item, publishedJSONObj, formDataVal);
          });
        } else if (displayFormula.indexOf("||") > -1) {
          // ??????Or???????????? ??????isVisible
          let orArr: any[] = displayFormula.split("||");
          return orArr.some((item) => {
            return this.checkCondition(item, publishedJSONObj, formDataVal);
          });
        } else {
          // ???????????????????????? ??????isVisible
          return this.checkCondition(
            displayFormula,
            publishedJSONObj,
            formDataVal
          );
        }
      } else {
        return isVisible;
      }
    }
    return isVisible;
  },

  checkCondition(tplStr: string, publishedJSONObj: any, formDataVal: any) {
    let isCheck = true;
    let factors = tplStr.split(" ");
    if (Array.isArray(factors) && factors.length > 1) {
      let propertyCode = factors[0].substring(1, factors[0].length - 1);
      let propertyVal = recursionSearch(formDataVal, propertyCode);
      let operator = factors[1];
      let val: any = null;
      if (factors.length > 2) {
        val = factors[2];
      }
      let condElement = recursionSearch(publishedJSONObj, propertyCode);
      if (condElement) {
        // ????????????????????????????????????????????????, ??????factor[1]???????????????
        let type:any = ControlHelper.mapToDataItemType(condElement.type);
        let op: any = null;
        switch (type) {
          case schema.DataItemType.Number:
          case schema.DataItemType.Date:
            op = numberDataItemOperators.find((item) => {
              return item.label === operator;
            });
            if (op) {
              switch (op.value) {
                case DateItemOperatorType.IsNull:
                  return propertyVal == null;
                case DateItemOperatorType.IsNotNull:
                  return propertyVal != null;
                case DateItemOperatorType.Equal:
                  return propertyVal == val;
                case DateItemOperatorType.NotEqual:
                  return propertyVal != val;
                case DateItemOperatorType.GreaterThan:
                  return propertyVal > val;
                case DateItemOperatorType.GreaterThanOrEqual:
                  return propertyVal >= val;
                case DateItemOperatorType.LessThan:
                  return propertyVal < val;
                case DateItemOperatorType.LessThanOrEqual:
                  return propertyVal <= val;
                default:
                  return false;
              }
            } else {
              return false;
            }

          case schema.DataItemType.Logic:
            op = logicDataItemOperators.find((item) => {
              return item.label === operator;
            });
            if (op) {
              switch (op.value) {
                case DateItemOperatorType.Equal:
                  return propertyVal == val;
                default:
                  return false;
              }
            } else {
              return false;
            }

          case schema.DataItemType.ShortText:
          case schema.DataItemType.LongText:
            if (condElement.type === schema.FormControlType.SequenceStatus) {
              op = sequenceStatusOperators.find((item) => {
                return item.label === operator;
              });
              if (op) {
                switch (op.value) {
                  case DateItemOperatorType.IsNull:
                    return propertyVal == null;
                  case DateItemOperatorType.IsNotNull:
                    return propertyCode != null;
                  case DateItemOperatorType.Equal:
                    return propertyVal == val;
                  case DateItemOperatorType.NotEqual:
                    return propertyVal != val;
                  default:
                    return false;
                }
              } else {
                return false;
              }
            } else {
              op = textDataItemOperators.find((item) => {
                return item.label === operator;
              });
              if (op) {
                switch (op.value) {
                  case DateItemOperatorType.IsNull:
                    return propertyVal == null;
                  case DateItemOperatorType.IsNotNull:
                    return propertyCode != null;
                  case DateItemOperatorType.Equal:
                    return propertyVal == val.substring(1, val.length - 1);
                  case DateItemOperatorType.NotEqual:
                    return propertyVal != val.substring(1, val.length - 1);
                  case DateItemOperatorType.Contains:
                    return propertyVal.indexOf(val) > -1;
                  case DateItemOperatorType.NotEqual:
                    return propertyVal.indexOf(val) === -1;
                  case DateItemOperatorType.In:
                    return val.indexOf(propertyVal) > -1;
                  case DateItemOperatorType.NotIn:
                    return val.indexOf(propertyVal) === -1;
                  default:
                    return false;
                }
              } else {
                return false;
              }
            }

          case DataItemType.StaffSingle:
          case DataItemType.StaffMulti:
          case DataItemType.StaffDeptMix:
          case DataItemType.DeptMulti:
          case DataItemType.DeptSingle:
            op = staffDataItemOperators.find((item) => {
              return item.label === operator;
            });
            let valJSONObj = val ? JSON.parse(val) : null;
            if (op) {
              switch (op.value) {
                case DateItemOperatorType.IsNull:
                  return propertyVal == null;
                case DateItemOperatorType.IsNotNull:
                  return propertyVal != null;
                case DateItemOperatorType.Contains:
                case DateItemOperatorType.Have:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.parentId === item.id || x.id === item.id;
                      }) > -1
                    );
                  });
                case DateItemOperatorType.NotContains:
                case DateItemOperatorType.NotHave:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.parentId === item.id || x.id === item.id;
                      }) === -1
                    );
                  });

                case DateItemOperatorType.Of:
                case DateItemOperatorType.In:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.id === item.parentId || x.id === item.id;
                      }) > -1
                    );
                  });
                case DateItemOperatorType.NotOf:
                case DateItemOperatorType.NotIn:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.id === item.parentId || x.id === item.id;
                      }) === -1
                    );
                  });
                default:
                  return false;
              }
            } else {
              return false;
            }

          case schema.DataItemType.RelevanceForm:
            // todo
            return true;
        }
      }
    }
    return isCheck;
  },
  // ???????????????????????????
  async packageData(vm: any, data: any, list: any, schemaCode: string, loadingFn: any) {
    const {id, name, draftAttributesJson, printJson} = data;
    let templateData: any = {
      id,
      content: draftAttributesJson,
      settings: printJson,
      templateName: name,
      template: {
        Id: id,
        SchemaCode: schemaCode,
        TemplateName: name,
        Remark: '',
        CreatedTime: new Date().getTime()
      }
    }

    let packageArr: any[] = [];
    let contentArr: [] = JSON.parse(draftAttributesJson);
    if (list && Array.isArray(list.arr)) {
      console.log("List: "+list.arr.lenght);
      for(let i = 0; i < list.arr.length; i++) {
        let x: any = list.arr[i];
        const formDataVal: any = x.bizObject.data;
        const logInfoList = x.workFlowLog || [];
        let formData: any = {};
        let tempSheetInfo = {};
        let logInfo = {};
        contentArr.forEach((item: any) => {
          console.log(item.cells);
          if(!item.cells){
             return;
          }
          Object.keys(item.cells).forEach((row: any) => {
            let rowContent = item.cells[row];
            Object.keys(rowContent).forEach((col:any) => {
              let colContent = rowContent[col];
              if (colContent && colContent.content && colContent.content.hasOwnProperty("fieldCode")) {
                if (colContent.content.hasOwnProperty("parentFieldCode")) {
                  let parentFieldCode = colContent.content["parentFieldCode"];
                  if (!formData.hasOwnProperty(parentFieldCode)) {
                    formData[parentFieldCode] = [];
                    tempSheetInfo[parentFieldCode] = {};
                  }
                  tempSheetInfo[colContent.content["parentFieldCode"]][colContent.content["fieldCode"]] = "";
                  
                } else if (colContent.content['fieldCode'] === 'QRCode') {
                  let qrCodeArr: any = formData[colContent.content["fieldCode"]];
                  let qrContent: any = colContent.content;
                  // ?????????
                  if (!Array.isArray(qrCodeArr)) {
                    qrCodeArr = [];
                  }
                  qrCodeArr.push(JSON.stringify(qrContent))
                  formData['QRCode'] = qrCodeArr;
                } else if (colContent.content['fieldCode'] === 'BarCode') {
                  // ?????????
                } else {
                  formData[colContent.content["fieldCode"]] = "";
                }
              }
            })
          })
          let workflowLogArray = recursionSearch(item.workflowLogRanges, "workflowLogArray");
          if (Array.isArray(workflowLogArray)) {
            workflowLogArray.forEach((item: any) => {
              if(item.checked){
                logInfo[item.fieldCode] = '';
              }
            })
          }
        })

        let controls: any[] = [];
        Object.keys(formData).forEach((key: string) => {
          let findControl: any = list.changeArr[i].formControls.find((i: any) => {
            return i.key === key;
          })
          if(findControl) {
            controls.push(findControl);
          }
        });
        Object.keys(formData).forEach((key: string) => {
          if (key === 'WorkFlowLog') {
            formData[key] = logInfoList.filter(item => {
              return logInfo.hasOwnProperty(item.logStatus);
            }).map(item => {
              return {
                activityName: item.activityName,
                receiveTime: item.receiveTime,
                finishTime: item.finishTime,
                usedTime: item.usedTime,
                name: item.name,
                operating: item.operating,
                content: item.comment || '', // ????????????
                signature: [renderer.UploadControl.service.getDownloadUrlByRefId(item.signature)] || [], // ????????????
              }
            })
          } else

          if (key === 'QRCode') {
            let qrConfig:any = formData[key];
            formData[key] = this.formatQRCode(controls, formDataVal, tempSheetInfo, qrConfig, x, vm)
          } else {
            let control = controls.find(item => item.key === key);
            let value = formDataVal[key];
            if (control) {
              formData[key] = this.formatChuanyunData(value, control.type, tempSheetInfo[key], control);
            } else {
              formData[key] = this.formatSystemData(value, key);
            }
          }
        });
        // ??????????????????
        if (x.workflowInstanceId) {
          const res = await workflowApi.getWorkflowBaseInfo({workflowInstanceId: x.workflowInstanceId})
          if(res && res.data && res.data.status) {
            const status:string = res.data.status
            switch (status) {
              case 'COMPLETED':
                formData['F0000020'] = 'finished'
                break;
              case 'DRAFT':
                formData['F0000020'] = 'draft'
                break;
              case 'PROCESSING':
                formData['F0000020'] = 'running'
                break;          
              case 'CANCELED':
                formData['F0000020'] = 'canceled'
                break;
            }
          }
        }
        packageArr.push(formData);
      }
      // list.arr.forEach((el, index) => {
      //   packageArr[index].WorkFlowLog = el.workFlowLog
      // });
      Bus.$emit("startToPrintBatch",{templateData, packageArr, loadingFn});
    }
  },

  formatQRCode(controls:any, formDataVal: any, sheetInfo: any, configArr: any, x: any, vm: any) : Object {
    let objRet: any = {};
    if (Array.isArray(configArr)) {
      configArr.forEach((configJsonStr: any) => {
        let config: any = JSON.parse(configJsonStr);
        // {"?????????????????????????????????": "????????????????????????"}
        let qrCodeKey: string  = '', qrCodeValue: string = '';
        if(Array.isArray(config.children) && config.children.length > 0) {
          qrCodeKey = config.children[0].fieldCode;
        }
        if (config.data && config.data.fieldTypeContent) {
          let type: number = config.data.fieldTypeContent.key;
          let keys: any = config.data.fieldTypeContent.attrs;
          switch(type) {
            case 1: // ?????????????????????
              qrCodeValue = this.calcQrCodeUrl(env, vm, 'create', x);
              break;
            case 2: // ?????????????????????
              qrCodeValue = this.calcQrCodeUrl(env, vm, 'view', x);
              break;
            case 3: // ??????????????????
              let val: string = '';
              keys.forEach(key => {
                let control = controls.find(item => item.key === key);
                let value = formDataVal[key];
                if (control) {
                  val += this.formatChuanyunData(value, control.type, sheetInfo[key], control) + '&';
                } else {
                  val += this.formatSystemData(value, key) + '&';
                }
              })
              qrCodeValue = val.substring(0, val.length - 1);
              break;
            case 4: // ?????????????????????
              qrCodeValue = keys;
              break;
          }
        }
        objRet[qrCodeKey] = qrCodeValue;
      })
    }
    return objRet;
  },

  /*
 * ??????????????????url??????????????????
 */

  calcQrCodeUrl(env: any, _this: any, showOrCreate: string, x: any): any {
    const { workflowInstanceId, workItemId, workflowCode } = x;
    const { id, schemaCode, sheetCode } = x.bizObject;
    const { config } = _this.$store.state;
    // const { corpId, agentId } = config;
    let user:any = sessionStorage.getItem('user');
    try {
      user = JSON.parse(user);
      const { corpId, agentId } = user;
      let qrText = "";
      // @ts-ignore
      if (!showOrCreate.includes("create")) {
        if (workflowInstanceId && workItemId) {
          // ??????
          qrText = `${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&corpId=${corpId}&agentId=${agentId}&mode=form`;
        } else {
          qrText = `${config.mobileServerUrl}/?corpId=${corpId}&agentId=${agentId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&id=${id}&mode=form`;
        }
      } else {
        // ??????
        if (workflowCode) {
          qrText = `${config.mobileServerUrl}/?workflowCode=${workflowCode}&corpId=${corpId}&agentId=${agentId}&mode=create`;
        } else {
          qrText = `${config.mobileServerUrl}/?corpId=${corpId}&agentId=${agentId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&mode=create`;
        }
      }
      return qrText;
    } catch {
      return "error";
    }
  },

  formatChuanyunData(value: any, type: number, extra: any, control:any) {
    switch(type) {
      case schema.FormControlType.Text:
      case schema.FormControlType.Textarea:
      case schema.FormControlType.Radio:
        return value;
        break;
      case schema.FormControlType.Date:
        if (value instanceof Date) {
          let dateFormat: any = control.options.format1 ? control.options.format1 : control.options.format;
          return moment(value).utcOffset(480).format(dateFormat);
        } else if (typeof value === "string") {
          return value;
        }
        break;
      case schema.FormControlType.Number:
        let numFormat: any = control.options.format1 ? control.options.format1 : control.options.format;
        if (typeof value === 'number' && !Number.isNaN(value)) {
          return format(numFormat, value);
        } else {
          return "";
        }
        break;

        break;
      case schema.FormControlType.Checkbox:
      case schema.FormControlType.Dropdown:
      case schema.FormControlType.DropdownMulti:
        if (Array.isArray(value)) {
          return value.join(";");
        } else if(typeof value === "string") {
          return value;
        } else if (typeof value === "object") {
          if (value) {
            return JSON.stringify(value);
          } else {
            return "";
          }
        }
        break;
      case schema.FormControlType.Logic:
        return String(value);
        break;
      case schema.FormControlType.Attachment:
        if (Array.isArray(value) && value.length > 0) {
          return value.map(item => item ? item.name : '').join();
        }
        break;
      case schema.FormControlType.Image:
      case schema.FormControlType.Signature:
        if (Array.isArray(value) && value.length > 0) {
          return value.map(item => {
            if(item && item.url) {
              return item.url
            } else if(item && item.refId) {
              return this.getDownloadUrlByRefId(item.refId)
            } else {
              return ''
            }
          });
        }
        break;
      case schema.FormControlType.Location:
      case schema.FormControlType.Address:
        if (typeof value === "string") {
          return value;
        } else if (typeof value === "object") {
          if (value) {
            if (value.hasOwnProperty("address")) {
              return value["address"];
            } else {
              return JSON.stringify(value);
            }
          } else {
            return "";
          }
        }
        break;
      case schema.FormControlType.DateRange:
      case schema.FormControlType.NumberRange:
      case schema.FormControlType.TimeRange:
        break;
      case schema.FormControlType.Tips:
        break;
      case schema.FormControlType.Time:
        if (typeof value === "string") {
          return value;
        } else if (moment.isMoment(value)) {
          console.log('value', value)
          return moment(value).format("HH:mm:ss");
        }
        break;
      case schema.FormControlType.StaffSelector:
      case schema.FormControlType.StaffMultiSelector:
      case schema.FormControlType.DepartmentSelector:
      case schema.FormControlType.DepartmentMultiSelector:
      case schema.FormControlType.StaffDeptMixed:
        if (Array.isArray(value)) {
          return value.map(item => item.name).join(";");
        } else if (typeof value === "string") {
          return value;
        }
        break;
      case schema.FormControlType.ApprovalOpinion:
        break;
      case schema.FormControlType.RelevanceForm:
      case schema.FormControlType.RelevanceFormEx:
        if (typeof value === "object") {
          if (value && value.hasOwnProperty("displayCode")) {
            return value[value["displayCode"]];
          }
        }
        break;
      case schema.FormControlType.Sheet:
        let sheetVal: any[] = [];
        Object.keys(extra).forEach((key: string) => {
          let sheetColCtrl: any = control.columns.find((item: any) => {
            return item.key === key;
          })

          if (sheetColCtrl) {
            if (Array.isArray(value)) {
              value.forEach((row: any) => {
                row[key] = this.formatChuanyunData(row[key], sheetColCtrl.type, null, sheetColCtrl);
              })
            }
          }
        })
        return value;
        break;
      case schema.FormControlType.ReverseRelevance:
        break;
      case schema.FormControlType.SequenceNo:
      case schema.FormControlType.CreatedTime:
      case schema.FormControlType.ModifiedTime:
        return value ? value : '';
        break;
      case schema.FormControlType.CreateBy:
      case schema.FormControlType.ModifyBy:
      case schema.FormControlType.OwnerId:
      case schema.FormControlType.CreateByParentId:
        if (Array.isArray(value) && value.length === 1) {
          return value[0]["name"];
        } else {
          return "";
        }
        break;
      case schema.FormControlType.SystemOther:
      case schema.FormControlType.SequenceStatus:
      case schema.FormControlType.Group:
      case schema.FormControlType.Description:
      case schema.FormControlType.Title:
      case schema.FormControlType.Html:
        return "";
        break;
    }
  },

  formatSystemData(value: any, key: string) {
    switch(key) {
      case "createdDeptId":
      case "creater":
      case "modifier":
      case "owner":
      case "ownerDeptId":
        if (Array.isArray(value) && value.length > 0) {
          return value.map(item => item.name).join(",");
        } else {
          return "";
        }
        break;
      case "createdTime":
      case "modifiedTime":
      case "sequenceNo":
      case "sequenceStatus":
      case "name":
        return value ? value : '';
        break;
    }
  },

  getDownloadUrlByRefId(refId: string) {
		return UploadControl.service.getDownloadUrlByRefId(refId);
	}
};
