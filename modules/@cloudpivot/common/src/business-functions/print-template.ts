// import moment from 'moment';
import { formatter } from "../utils/date";
import { recursionSearch } from "@cloudpivot/common/src/utils/utils";

/**
 * @params data 是要处理的数据
 * @params obj组件实例或者iconTypes
 * @params str 是替换真实和伪造的数据的标志符
 */

export function replaceValueData(
  env: any,
  data: any[],
  str: string,
  obj?: any,
  list?: any[]
) {
  

  const pages: any[][] = JSON.parse(JSON.stringify(data));
  // @ts-ignore
  if (str.includes("real")) {
    const realData = obj.formObj.bizObject.data;
    const dataType = obj.formObj.bizSchema.properties;
    if (!Object.keys(realData).length || !Object.keys(dataType).length) return;
    console.log("拿到了真实数据", realData);
    for (const tempData of pages) {
      tempData.forEach((item: any, index: number) => {
        if (item.eleType === "sheet") {
          
          // const list = realData[item.id];
          // panwl修改，子表应该根据code获取value值
          const list = realData[item.code];
          if (list) {
            item.value = list.map((x: any) => x);
          }

          return;
        }

        // @ts-ignore
        if (item.eleType.includes("column")) {
          // @ts-ignore
          if (item.leftKey.borderColorValue === "#ccc")
            item.leftKey.borderColorValue = "transparent";
          // @ts-ignore
          if (item.rightValue.borderColorValue === "#ccc")
            item.rightValue.borderColorValue = "transparent";
          // @ts-ignore
          if (item.leftKey.code) {
            // @ts-ignore
            const leftCode: string = item.leftKey.code.split("#_#")[0];
            let itemType: any;
            // @ts-ignore
            if (
              !Object.keys(realData).includes(leftCode) ||
              !realData[leftCode]
            ) {
              item.leftKey.innerTxt = "";
              return;
            }
            dataType.forEach((type: any, i: number) => {
              // @ts-ignore
              if (type.code === leftCode) itemType = type.propertyType;
            });
            realReplace(
              leftCode,
              itemType,
              realData,
              item,
              "leftKey",
              "column",
              obj.formObj,
              obj,
              list
            );
          }
          // @ts-ignore
          if (item.rightValue.code) {
            // @ts-ignore
            const rightCode: string = item.rightValue.code.split("#_#")[0];
            let itemType: any;
            // @ts-ignore
            if (
              !Object.keys(realData).includes(rightCode) ||
              !realData[rightCode]
            ) {
              item.rightValue.innerTxt =
                realData[rightCode] === false ? "否" : "";
              return;
            }
            dataType.forEach((type: any, i: number) => {
              // @ts-ignore
              if (type.code === rightCode) itemType = type.propertyType;
            });
            realReplace(
              rightCode,
              itemType,
              realData,
              item,
              "rightValue",
              "column",
              obj.formObj,
              obj,
              list
            );
          }
        }
        // @ts-ignore
        if (item.eleType.includes("text")) {
          // @ts-ignore
          if (item.borderColorValue === "#ccc")
            item.borderColorValue = "transparent";
          // @ts-ignore
          if (item.code) {
            // @ts-ignore
            const itemCode: string = item.code.split("#_#")[0];
            let itemType: any;
            // @ts-ignore
            if (
              !Object.keys(realData).includes(itemCode) ||
              !realData[itemCode]
            ) {
              item.innerTxt = realData[itemCode] === false ? "否" : "";
              return;
            }
            dataType.forEach((type: any, i: number) => {
              // @ts-ignore
              if (type.code === itemCode) itemType = type.propertyType;
            });
            realReplace(
              itemCode,
              itemType,
              realData,
              item,
              "text",
              "text",
              obj.formObj,
              obj,
              list
            );
          }
        }
        // @ts-ignore
        if (item.eleType.includes("leftQrcodePic")) {
          // @ts-ignore
          item.picUrl = calcQrCodeUrl(env, obj, item.qrCreateOrShow) || "";
        }
        // @ts-ignore
        if (item.eleType.includes("leftBarcodePic")) {
          if (item.barCodeKey === "formColumn") {
            // @ts-ignore
            item.barCodeValue = realData[item.barCodeValue] || "";
          }

          // @ts-ignore
          item.picUrl = `${env.apiHost}/api/qrcode/generate_barcode?text=${item.barCodeValue}&width=${item.widthValue}&height=${item.heightValue}`;
        }
      });
    }
  }
  // @ts-ignore
  if (str.includes("fake")) {
    for (const tempData of pages) {
      tempData.forEach((item: any, index: number) => {
        // @ts-ignore
        if (item.eleType.includes("leftBarcodePic")) {
          // @ts-ignore
          item.picUrl = `${env.apiHost}/api/qrcode/generate_barcode?text=${item.barCodeValue}&width=${item.widthValue}&height=${item.heightValue}`;
        }
        // @ts-ignore
        if (item.eleType.includes("leftQrcodePic")) {
          // @ts-ignore
          item.picUrl = `${env.apiHost}/api/qrcode/generate_qrcode?text=https://www.baidu.com/`;
        }
        if (obj) {
          obj.forEach((fakeItem: any, fakeIndex: number) => {
            // @ts-ignore
            if (item.eleType.includes("column")) {
              // @ts-ignore
              if (item.leftKey.borderColorValue === "#ccc")
                item.leftKey.borderColorValue = "transparent";
              // @ts-ignore
              if (item.rightValue.borderColorValue === "#ccc")
                item.rightValue.borderColorValue = "transparent";
              // @ts-ignore
              item.leftKey.active = false;
              // @ts-ignore
              item.rightValue.active = false;
              // @ts-ignore
              if (
                item.leftKey.code &&
                item.leftKey.code.split("#_#")[1] - 0 === fakeItem.propertyType
              ) {
                // @ts-ignore
                item.leftKey.innerTxt = fakeItem.value;
              }
              // @ts-ignore
              if (
                item.rightValue.code &&
                item.rightValue.code.split("#_#")[1] - 0 ===
                  fakeItem.propertyType
              ) {
                // @ts-ignore
                item.rightValue.innerTxt = fakeItem.value;
              }
            }
            // @ts-ignore
            if (item.eleType.includes("text")) {
              // @ts-ignore
              if (item.borderColorValue === "#ccc")
                item.borderColorValue = "transparent";
              // @ts-ignore
              if (
                item.code &&
                item.code.split("#_#")[1] - 0 === fakeItem.propertyType
              ) {
                // @ts-ignore
                item.innerTxt = fakeItem.value;
              }
            }
          });
        }
        if (item.leftKey && item.leftKey.active) {
          item.leftKey.active = true;
        }
        if (item.rightValue && item.rightValue.active) {
          item.rightValue.active = true;
        }
        // @ts-ignore
        if (item.active) {
          // @ts-ignore
          item.active = false;
        }
      });
    }
  }
  return pages;
}

function realReplace(
  code: string,
  itemType: number,
  codeObj: any,
  itemOne: any,
  str: string,
  kind: string,
  forDataProperty: any,
  formDeatil: any,
  list? : any[]
) {
  const imgReg = /.[png|jpg|jpeg]/i;
  if (Array.isArray(list)) {
    let currentItem: any = list.find(x => x.code === code);
    if (currentItem) {
      itemType = currentItem.propertyType;
    }
  }
  if (kind.includes("column")) {
    if (itemType === 2) {
      dateAndNumberFilter(
        code,
        forDataProperty,
        itemOne,
        str,
        "number",
        codeObj,
        "column"
      );
    }
    if (itemType === 3) {
      dateAndNumberFilter(
        code,
        forDataProperty,
        itemOne,
        str,
        "date",
        codeObj,
        "column"
      );
    }
    if (itemType === 4) {
      // @ts-ignore
      itemOne[str].innerTxt = codeObj[code] ? "是" : "否";
    }
    if (itemType === 10) {
      // @ts-ignore
      itemOne[str].innerTxt = `${codeObj[code].provinceName || ""}${codeObj[
        code
      ].cityName || ""}${codeObj[code].districtName || ""}${codeObj[code]
        .address || ""}`;
      return;
    }
    if(itemType === 12 || itemType === 13 || itemType === 14 || itemType === 15) {
      if(typeof codeObj[code] === "string") {
        itemOne[str].innerTxt = codeObj[code];
      } else if (Array.isArray(codeObj[code])) {
        itemOne[str].innerTxt = codeObj[code].join(",");
      }
    }
    // @ts-ignore
    if ((itemType === 5 || itemType === 50 || itemType === 51 || itemType === 60 || itemType === 61) && codeObj[code].length) {
      let tempTxt: string[] = [];
      // @ts-ignore
      codeObj[code].forEach((staff: any, i: number) => {
        // @ts-ignore
        tempTxt.push(staff.name);
      });
      // @ts-ignore
      itemOne[str].innerTxt = tempTxt.join(",");
      return;
    }
    // @ts-ignore
    if (typeof codeObj[code] === "string") {
      // @ts-ignore
      itemOne[str].innerTxt = codeObj[code];
      return;
    }
    // @ts-ignore
    if (typeof codeObj[code] === "object") {
      // @ts-ignore
      if (codeObj[code].length && codeObj[code][0].name) {
        const attaches = codeObj[code];
        //打印模板图片显示多张
        let picUrls=[];
        let tempTxt: string[] = [];
        attaches.forEach(attache => {
          if (attache.response && attache.response.data) {
            // @ts-ignore
            picUrls.push(formDeatil.getDownloadUrl(
              attache.response.data
            ));
          } else if (attache.refId) {
            // @ts-ignore
            picUrls.push(formDeatil.getDownloadUrl(attache));
          }
          tempTxt.push(attache.name);
        });
        itemOne.picUrls = picUrls;
        itemOne[str].innerTxt = tempTxt.join("，");
        // if (attaches.length > 0 && imgReg.test(attaches[0].name)) {
        //   if (attaches[0].response && attaches[0].response.data) {
        //     itemOne.picUrl = formDeatil.getDownloadUrl(
        //       attaches[0].response.data
        //     );
        //   } else if (attaches[0].refId) {
        //     itemOne.picUrl = formDeatil.getDownloadUrl(attaches[0]);
        //   }
        // }
        // panwl修改2020-01-21，解决附件无法显示文件名，
        // @ts-ignore
        // itemOne[str].innerTxt = codeObj[code][0].name;
        // else {
        //   // @ts-ignore
        //   itemOne[str].innerTxt = codeObj[code][0].name;
        // }
        return;
        // @ts-ignore
      } else if (itemType === 0 && codeObj[code].length) {
        // @ts-ignore
        itemOne[str].innerTxt = codeObj[code].join(",");
        return;
      } else if (itemType === 9 || itemType === 11) {
        // 关联表单
        // 获取关联表单关联关系
        const formCtrl = formDeatil.formControls;
        const ctrl = formCtrl.find((c: any) => c.key === code);
        const mappings = ctrl.options.displayField;
        const value = codeObj[code][mappings];
        if (mappings) {
          if (Array.isArray(value)) {
            // @ts-ignore
            itemOne[str].innerTxt = codeObj[code][mappings][0].name || "";
          } else {
            switch (codeObj[code][mappings]) {
              case true:
                itemOne[str].innerTxt = "是";
                break;
              case false:
                itemOne[str].innerTxt = "否";
                break;
              case "DRAFT":
                itemOne[str].innerTxt = "草稿";
                break;
              case "PROCESSING":
                itemOne[str].innerTxt = "进行中";
                break;
              case "COMPLETED":
                itemOne[str].innerTxt = "已完成";
                break;
              case "CANCELED":
                itemOne[str].innerTxt = "已作废";
                break;

              default:
                // @ts-ignore
                itemOne[str].innerTxt = codeObj[code][mappings] || "";
                if (typeof value === 'string') {
                  try {
                    const obj = JSON.parse(value);
                    if (typeof obj == 'object' && obj) {
                      //处理地址
                      if (obj.hasOwnProperty('provinceName') || obj.hasOwnProperty('cityName') || obj.hasOwnProperty('districtName') || obj.hasOwnProperty('address')) {
                        // @ts-ignore
                        itemOne[str].innerTxt = `${obj.provinceName || ''}${obj.cityName || ''}${obj.districtName || ''}${obj.address || ''}`;
                      }
                    }
                  } catch (error) {
                    console.log('error：' + str + '!!!' + error);
                  }
                }
                break;
            }
          }
        } else {
          itemOne[str].innerTxt = codeObj[code].name || "";
        }
        return;
      } else if (itemType === 6) {
        
        let tempTxt: string[] = [];
        // @ts-ignore
        codeObj[code].forEach((attach: any, i: number) => {
          // @ts-ignore
          tempTxt.push(attach.name);
        });
        // @ts-ignore
        itemOne[str].innerTxt = tempTxt.join("，");
        return;
      }
    }
  }
  if (kind.includes("text")) {
    
    if (itemType === 2) {
      dateAndNumberFilter(
        code,
        forDataProperty,
        itemOne,
        str,
        "number",
        codeObj,
        "text"
      );
    }
    if (itemType === 3) {
      dateAndNumberFilter(
        code,
        forDataProperty,
        itemOne,
        str,
        "date",
        codeObj,
        "text"
      );
    }
    if (itemType === 4) {
      // @ts-ignore
      itemOne.innerTxt = codeObj[code] ? "是" : "否";
    }
    if (itemType === 10) {
      // @ts-ignore
      itemOne.innerTxt = `${codeObj[code].provinceName || ""}${codeObj[code]
        .cityName || ""}${codeObj[code].districtName || ""}${codeObj[code]
          .address || ""}`;
      return;
    }
    // @ts-ignore
    if (itemType === 5 && codeObj[code].length) {
      let tempTxt: string[] = [];
      // @ts-ignore
      codeObj[code].forEach((staff: any, i: number) => {
        // @ts-ignore
        tempTxt.push(staff.name);
      });
      // @ts-ignore
      itemOne.innerTxt = tempTxt.join("，");
      return;
    }
    // @ts-ignore
    if (typeof codeObj[code] !== "object") {
      // @ts-ignore
      itemOne.innerTxt = codeObj[code];
      return;
    }
    // @ts-ignore
    if (typeof codeObj[code] === "object") {
      // @ts-ignore
      if (codeObj[code].length && codeObj[code][0].name) {
        const attaches = codeObj[code];
        if (attaches.length > 0 && imgReg.test(attaches[0].name)) {
          if (attaches[0].response && attaches[0].response.data) {
            itemOne.picUrl = formDeatil.getDownloadUrl(
              attaches[0].response.data
            );
          } else if (attaches[0].refId) {
            itemOne.picUrl = formDeatil.getDownloadUrl(attaches[0]);
          }
        } else {
          // @ts-ignore
          itemOne.innerTxt = codeObj[code][0].name;
        }
        return;
        // @ts-ignore
      } else if (itemType === 0 && codeObj[code].length) {
        // @ts-ignore
        itemOne.innerTxt = codeObj[code].join(",");
        return;
      } else if (itemType === 9 || itemType === 11) {
        // @ts-ignore
        itemOne.innerTxt = codeObj[code].name || "";
        return;
      } else if (itemType === 6) {
        let tempTxt: string[] = [];
        // @ts-ignore
        codeObj[code].forEach((attach: any, i: number) => {
          // @ts-ignore
          tempTxt.push(attach.name);
        });
        // @ts-ignore
        itemOne.innerTxt = tempTxt.join("，");
        return;
      }
    }
  }
}

/*
 * 计算二维码的url，新增、查看
 */

function calcQrCodeUrl(env: any, _this: any, showOrCreate: string): any {
  const { workflowInstanceId, workItemId, workflowCode } = _this.formObj;
  const { id, schemaCode, sheetCode } = _this.formObj.bizObject;
  const { config } = _this.$store.state;
  const { corpId, agentId } = config;
  let qrText = "";
  // @ts-ignore
  if (!showOrCreate.includes("create")) {
    if (workflowInstanceId && workItemId) {
      // 查看
      qrText = `${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&corpId=${corpId}&agentId=${agentId}&mode=form`;
    } else {
      qrText = `${config.mobileServerUrl}/?corpId=${corpId}&agentId=${agentId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&id=${id}&mode=form`;
    }
  } else {
    // 新增
    if (workflowCode) {
      qrText = `${config.mobileServerUrl}/?workflowCode=${workflowCode}&corpId=${corpId}&agentId=${agentId}&mode=create`;
    } else {
      qrText = `${config.mobileServerUrl}/?corpId=${corpId}&agentId=${agentId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&mode=create`;
    }
  }
  const text = encodeURIComponent(qrText);
  return `${env.apiHost}/api/qrcode/generate_qrcode?text=${text}`;
}

function dateAndNumberFilter(
  code: string,
  forDataProperty: any,
  itemOne: any,
  str: string,
  kind: string,
  codeObj: any,
  eleType: string
) {
  let dataProperties: any;
  // @ts-ignore
  if (forDataProperty.bizSheet.publishedAttributesJson) {
    // @ts-ignore
    dataProperties = JSON.parse(
      forDataProperty.bizSheet.publishedAttributesJson
    );

    // @ts-ignore
    if (!Object.keys(dataProperties).length) {
      // @ts-ignore
      eleType.includes("column")
        ? (itemOne[str].innerTxt = "")
        : (itemOne.innerTxt = "");
      return;
    } else {
      let existCodeObj = recursionSearch(dataProperties, code)
      if (existCodeObj) {
        if (kind.includes("date")) {
          eleType.includes("column")
            ? // @ts-ignore
              (itemOne[str].innerTxt = formatter(
                codeObj[code],
                existCodeObj.options.format
              ))
            : // @ts-ignore
              (itemOne.innerTxt = formatter(
                codeObj[code],
                existCodeObj.options.format
              ));
          return;
        }
        if (kind.includes("number"))
            realFilter(
              existCodeObj.options.format,
              itemOne,
              str,
              codeObj,
              code,
              eleType
            );
      }
    }
  }
}

const dataFormatter = [
  { format: "none", fix: "", precision: 0 }, // 无格式
  { format: "integer", fix: "", precision: 0 }, // 整数
  { format: "tenths", fix: "", precision: 1 },
  { format: "percentile", fix: "", precision: 2 },
  { format: "Millimeter", fix: "", precision: 3 },
  { format: "tenThousand", fix: "", precision: 4 },
  { format: "ratio", fix: "%", precision: 0 },
  { format: "ratio.tenths", fix: "%", precision: 1 },
  { format: "ratio.percentile", fix: "%", precision: 2 },
  { format: "ratio.Millimeter", fix: "%", precision: 3 },
  { format: "ratio.tenThousand", fix: "%", precision: 4 },
  { format: "RMB.percentile", fix: "￥", precision: 2 },
  { format: "RMB.Millimeter", fix: "￥", precision: 3 },
  { format: "RMB.tenThousand", fix: "￥", precision: 4 },
  { format: "dollar.percentile", fix: "$", precision: 2 },
  { format: "dollar.Millimeter", fix: "$", precision: 3 },
  { format: "dollar.tenThousand", fix: "$", precision: 4 },
  { format: "euro.percentile", fix: "€", precision: 2 },
  { format: "euro.Millimeter", fix: "€", precision: 3 },
  { format: "euro.tenThousand", fix: "€", precision: 4 },
  { format: "HK.percentile", fix: "HK$", precision: 2 },
  { format: "HK.Millimeter", fix: "HK$", precision: 3 },
  { format: "HK.tenThousand", fix: "HK$", precision: 4 }
];

function realFilter(
  format: string,
  itemOne: any,
  str: string,
  codeObj: any,
  code: string,
  eleType: string
) {
  let tempTxt: string = "";
  let tempNumber: any;
  let strTxt: string = "";
  dataFormatter.forEach((formatItem: any, index: number) => {
    // @ts-ignore
    if (formatItem.format === format) {
      // @ts-ignore
      tempNumber = codeObj[code];
      strTxt =
        tempNumber.toString().split(".")[1] === undefined
          ? ""
          : tempNumber.toString().split(".")[1];
      // @ts-ignore
      if (!formatItem.fix) {
        // @ts-ignore
        tempTxt = formatItem.precision
          ? `${tempNumber}${strTxt === "" ? "." : ""}${"".padEnd(
              formatItem.precision - strTxt.length,
              "0"
            )}`
          : tempNumber;
      }
      // @ts-ignore
      if (formatItem.fix === "%") {
        // @ts-ignore
        tempTxt = formatItem.precision
          ? `${tempNumber}${strTxt === "" ? "." : ""}${"".padEnd(
              formatItem.precision - strTxt.length,
              "0"
            )}%`
          : `${tempNumber}%`;
      } else {
        // @ts-ignore
        tempTxt = formatItem.precision
          ? `${formatItem.fix}${tempNumber}${
              strTxt === "" ? "." : ""
            }${"".padEnd(formatItem.precision - strTxt.length, "0")}`
          : `${formatItem.fix}${tempNumber}`;
      }
    }
  });
  // @ts-ignore
  eleType.includes("column")
    ? (itemOne[str].innerTxt = tempTxt)
    : (itemOne.innerTxt = tempTxt);
  return;
}

class unitConversion {
  // let self: any = this as any;
  /**
   * 获取DPI
   * @returns {Array}
   */
  conversion_getDPI() {
    var arrDPI = new Array();
    let screen: any = window.screen;
    if (screen.deviceXDPI) {
      arrDPI[0] = screen.deviceXDPI;
      arrDPI[1] = screen.deviceYDPI;
    } else {
      var tmpNode: any = document.createElement("DIV");
      tmpNode.style.cssText =
        "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
      document.body.appendChild(tmpNode);
      arrDPI[0] = parseInt(tmpNode.offsetWidth);
      arrDPI[1] = parseInt(tmpNode.offsetHeight);
      tmpNode.parentNode.removeChild(tmpNode);
    }
    return arrDPI;
  }
  /**
   * px转换为mm
   * @param value
   * @returns {number}
   */
  pxConversionMm(value: any) {
    var inch = value / this.conversion_getDPI()[0];
    var c_value = inch * 25.4;
    //      console.log(c_value);
    return c_value;
  }
  /**
   * mm转换为px
   * @param value
   * @returns {number}
   */
  mmConversionPx(value: any) {
    var inch = value / 25.4;
    var c_value = inch * this.conversion_getDPI()[0];
    //      console.log(c_value);
    return c_value;
  }
}
export function getMmFromPx(val: number) {
  // return (val / 10 / 2.54) * 72;
  return (new unitConversion() as any).pxConversionMm(val);
}

export function getPxFromMm(val: number) {
  // return (val / 72) * 2.54 * 10;
  return (new unitConversion() as any).mmConversionPx(val);
}
