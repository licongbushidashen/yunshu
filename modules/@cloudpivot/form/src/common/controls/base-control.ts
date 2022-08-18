import { Subscription } from "rxjs"

import { debounceTime } from "rxjs/operators"

import { Vue, Watch, Prop, Inject } from "vue-property-decorator"

import * as typings from "@cloudpivot/form/schema"

import { listApi, listParams, formApi } from "@cloudpivot/api"

// import { recursionSearch } from "@cloudpivot/common/src/utils/utils";

import dateFormat from "@cloudpivot/common/src/utils/date"

// import { FormBuilderHelper } from "@cloudpivot/form/src/renderer/controls/form-builder-helper";

import moment from "moment"

// @ts-ignore
import isEqual from "lodash/isEqual"
// var dayjs = require('dayjs')

import { FormControl, Control, ControlValueChange, ControlPropertyChange, FormGroup, FormSheet, PropertyNames } from "h3-forms"

import {
  RendererFormControl,
  DataItemLike,
  FormControlType,
  DataItemType,
  OperatorService,
  DateItemOperatorType
} from "@cloudpivot/form/schema"

import { ControlHelper } from "./control-helper"

export abstract class BaseControl<T extends typings.FormControlOptions> extends Vue {
  @Prop()
  readonly control!: RendererFormControl

  styleObj: any = {}

  get id() {
    if (this.control.parentKey) {
      return `${this.control.parentKey}-${this.control.key}`
    }
    return this.control.key
  }

  get ctrl() {
    if (!this.control.controller) {
      if (!this.control.parentKey) {
        const _ctrl = this.findController(this.control.key)
        this.$set(this.control, "controller", _ctrl)
        // this.$set(this.control, "edit", _ctrl.readonly === false);
        // this.control.edit = _ctrl.readonly === false;
      }
    }
    if (this.control.parentKey) {
      // @ts-ignore
      this.control.controller.parentKey = this.control.parentKey
    }

    return this.control.controller as Control
  }

  get readonly() {
    // return this.control.edit === false;
    if (this.ctrl) {
      return !!this.ctrl.readonly
    }
    return false
  }

  @Watch("ctrl.items")
  onCtrlItemsChange(value: any) {
    if (value) {
      ;(this.controlOpts as any).options = Array.isArray(value) ? value.join(";") : value
    }
  }

  get controlOpts(): T {
    return this.control.options as T
  }

  get style(): any {
    return this.controlOpts.style || null
  }

  get label() {
    return ControlHelper.getControlLabel(this.control, this.$i18n.locale)
  }

  get locale() {
    return this.$i18n.locale || "zh"
  }

  get placeholder() {
    // var aa = this.locale;
    if (this.controlOpts.placeholder) {
      return this.controlOpts.placeholder
    }

    switch (this.control.type) {
      case FormControlType.Text:
      case FormControlType.Textarea:
      case FormControlType.Number:
        return this.$t("cloudpivot.form.renderer.peleseInput")

      case FormControlType.Date:
      case FormControlType.StaffSelector:
      case FormControlType.StaffMultiSelector:
      case FormControlType.DepartmentSelector:
      case FormControlType.DepartmentMultiSelector:
      case FormControlType.StaffDeptMixed:
      case FormControlType.Dropdown:
      case FormControlType.DropdownMulti:
      case FormControlType.Checkbox:
      case FormControlType.Radio:
      case FormControlType.Address:
      case FormControlType.Location:
      case FormControlType.RelevanceForm:
      case FormControlType.RelevanceFormEx:
        return this.$t("cloudpivot.form.renderer.peleseSelect")
    }

    return ""
  }

  get readonlyFormula() {
    if (this.controlOpts.readonlyFormula) {
      return this.controlOpts.readonlyFormula
    }
  }

  // 是否为外部用户
  get isExternal() {
    return !!(window as any).isExternal
  }

  @Inject()
  findController!: (key: string, obj?: any) => Control

  @Inject()
  getController!: () => FormGroup

  @Inject()
  getFormControls!: (keys?: string[]) => RendererFormControl[]

  @Inject()
  getScrollEl!: () => HTMLDivElement

  @Inject()
  valChange!: (key: string, fun: Function) => void

  @Inject()
  getDataItem!: (key: string, parentKey?: string) => DataItemLike

  @Inject()
  getRelativeDataList!: (isList?: boolean) => []

  @Inject()
  getSourceType!: () => string

  setControl?(): void

  getIsNew(): boolean {
    let isNew = (window as any).h3form ? !!(window as any).h3form.isNew : true
    return isNew
  }

  onChangeSubscription?: Subscription

  propChangeSubscription?: Subscription

  valueChangeSubscription: Subscription | null = null

  onChangeFn: Function | null = null

  handleValueChange?(value: any, changeInfo: any): void

  getPopupContainer() {
    // if (this.getScrollEl) {
    //   const scrollEl = this.getScrollEl();
    //   if (scrollEl) {
    //     return scrollEl;
    //   }
    // }
    // return triggerNode.parentNode;

    return (triggerNode: any) => {
      if (this.getScrollEl) {
        const scrollEl = this.getScrollEl()
        if (scrollEl) {
          return scrollEl
        }
      }
      return document.body
    }
  }

  getThisProxy() {
    return this.getController().children
  }

  getControllerGroup() {
    return this.getController()
  }

  recordDelFile(delFile: any) {
    if (this.$root.$store.state.delFile) {
      // @ts-ignore
      this.$root.$store.state.delFile.push({
        name: delFile.response ? delFile.response.data.name : delFile.name,
        refId: delFile.response ? delFile.response.data.refId : delFile.refId
      })
    } else {
      // @ts-ignore
      this.$root.$store.state.delFile = [
        {
          name: delFile.response ? delFile.response.data.name : delFile.name,
          refId: delFile.response ? delFile.response.data.refId : delFile.refId
        }
      ]
    }
  }

  setValue(value: any) {
    if (this.ctrl) this.ctrl.value = value
  }

  @Watch("control", {
    immediate: true
  })
  onControlChange(c: RendererFormControl, oldControl: RendererFormControl) {
    // 防止 this.$set(this.control, 'controller', _ctrl) 时再次触发change
    if (c === oldControl) {
      return
    }
    if (this.ctrl && [FormControlType.Dropdown, FormControlType.DropdownMulti].includes(c.type)) {
      this.$set(this.ctrl, "items", "")
    }
    if (this.setControl) {
      this.setControl()
    }
    if (this.style) {
      this.style
        .trim()
        .split(";")
        .forEach(s => {
          let [key, value] = s.trim().split(":")
          this.styleObj[key] = value
        })
    } else {
      this.styleObj = {}
    }
    this.subscribeValueChange()
    this.unRefSubscription(oldControl)
    this.unRefSubscriptionTimer(oldControl)
  }

  subscribeValueChange() {
    let ctrl = this.ctrl as FormControl<any>
    if (!ctrl || !ctrl.valueChange) {
      return
    }

    // if (ctrl && ctrl.options && ctrl.options.hasOwnProperty("dataLinkage") && (this.getIsNew() || (this.getIsWorkflow() && !ctrl.readonly))) {

    //@ts-ignore
    let dataLinkage: any = ctrl.options.dataLinkage
    let dataLinkageOption: any = null
    if (dataLinkage) {
      if (dataLinkage.isDataLinkOpen) {
        dataLinkageOption = JSON.parse(dataLinkage.options.value)
      } else {
        // 兼容老数据
        if (dataLinkage.isDataLinkOpen === false) {
          dataLinkageOption = JSON.parse(dataLinkage.options.value)
        } else {
          dataLinkageOption = JSON.parse(dataLinkage)
        }
      }
      // 解析dataLinkage, 获取condition、fillProperty、targetModel
      const { condition, fillProperty, targetModel } = dataLinkageOption
      console.log("------------------dataLinkage-------------", ctrl.id, this.control)

      let fillPropertyArr: string[] = fillProperty ? fillProperty.split("=") : []
      if (fillPropertyArr.length !== 2) return
      let fillSrc = fillPropertyArr[0].substring(1, fillPropertyArr[0].length - 2)
      if (this.control.parentKey) {
        fillSrc = `${this.control.parentKey}.${fillSrc.split(".")[1]}`
      }

      let fillTar = fillPropertyArr[1].substring(2, fillPropertyArr[1].length - 1)
      const condArr: string[] = condition ? condition.split("&&") : []
      let isOnlyMainCondition: boolean = condition.indexOf(".") === -1
      condArr.forEach(x => {
        let arr = x.split("=")
        let { key: currentKey } = this.formatKey(arr[0].substring(1, arr[0].length - 2))
        let controller: any = null
        const idx = currentKey.indexOf(".")
        if (idx > -1) {
          // 子表条件
          let rowIndex = ctrl.options.rowIndex || 0
          const sheetKey = this.control.parentKey || currentKey.substring(0, idx)
          const controlKey = currentKey.substr(idx + 1)
          const sheetCtrl = this.findController(sheetKey) as any
          if (sheetCtrl) {
            const row = sheetCtrl.rows[rowIndex]
            controller = row.findChild(controlKey)
          }
        } else {
          controller = this.findController(currentKey) as any
        }
        if (controller && controller.valueChange) {
          // 有默认值且默认值不为空时触发默认值
          if (
            this.getIsNew() &&
            controller.hasValue &&
            controller.value == controller.options.value &&
            controller.value !== null &&
            controller.value !== undefined &&
            controller.value !== ""
          ) {
            setTimeout(() => {
              let filterArr: any[] = []
              let extraArr: any[] = []
              condArr.forEach(item => {
                let innerArr = item.split("=")
                let innerCurrentKey = innerArr[0].substring(1, innerArr[0].length - 2)
                let innerTargetKey = innerArr[1].substring(2, innerArr[1].length - 1)
                let { key: innerCode } = this.formatKey(innerCurrentKey)
                let ctrl: any = null
                const idx = innerCode.indexOf(".")
                if (idx > -1) {
                  // 子表条件
                  let rowIndex = controller.options.rowIndex || 0
                  const sheetKey = innerCode.substring(0, idx)
                  const controlKey = innerCode.substr(idx + 1)
                  const sheetCtrl = this.findController(sheetKey) as any
                  if (sheetCtrl) {
                    const row = sheetCtrl.rows[rowIndex]
                    ctrl = row.findChild(controlKey)
                  }
                } else {
                  ctrl = this.findController(innerCode) as any
                }
                if (ctrl) {
                  filterArr.push({
                    key: innerTargetKey,
                    val: ctrl.value
                  })
                  extraArr.push(innerCurrentKey)
                }
              })
              this.emitOnDataLinkage({
                filter: filterArr,
                fillProperty: {
                  src: fillSrc,
                  target: fillTar
                },
                extraCond: extraArr,
                targetModel
              })
            }, 500)
          }
          const optimizationValChange = controller.valueChange.pipe(debounceTime(1000))
          optimizationValChange.subscribe((change: any) => {
            console.log("triggered changed ", change, ctrl)
            if (!ctrl.readonly) {
              setTimeout(() => {
                let filterArr: any[] = []
                let extraArr: any[] = []
                condArr.forEach(item => {
                  let innerArr = item.split("=")
                  let innerCurrentKey = innerArr[0].substring(1, innerArr[0].length - 2)
                  let innerTargetKey = innerArr[1].substring(2, innerArr[1].length - 1)
                  let { key: innerCode } = this.formatKey(innerCurrentKey)
                  let ctrl1: any = null
                  const idx = innerCode.indexOf(".")
                  if (idx > -1) {
                    // 子表条件
                    let rowIndex = controller.options.rowIndex || 0
                    // const sheetKey = innerCode.substring(0, idx);
                    const sheetKey = this.control.parentKey || currentKey.substring(0, idx)
                    const controlKey = innerCode.substr(idx + 1)
                    const sheetCtrl = this.findController(sheetKey) as any
                    if (sheetCtrl) {
                      const row = sheetCtrl.rows[rowIndex]
                      ctrl1 = row.findChild(controlKey)
                    }
                  } else {
                    ctrl1 = this.findController(innerCode) as any
                  }
                  if (ctrl1) {
                    filterArr.push({
                      key: innerTargetKey,
                      val: ctrl1.value
                    })
                    extraArr.push(innerCurrentKey)
                  }
                })
                this.emitOnDataLinkage({
                  filter: filterArr,
                  fillProperty: {
                    src: fillSrc,
                    target: fillTar
                  },
                  extraCond: extraArr,
                  targetModel
                })
              }, 500)
            }
          })
        }
      })
    }
    // }
    // if(ctrl.options.hasOwnProperty("computeFormulaNew")){
    //   console.log('---------------------start---------------------------');
    //   console.log('ctrl',ctrl);
    //   console.log('ctrl.id',ctrl.id);
    //   console.log('ctrl.options',ctrl.options);
    //   //@ts-ignore
    //   console.log('ctrl.options.computeFormulaNew',ctrl.options.computeFormulaNew);
    //   console.log('ctrl.options.hasOwnProperty("computeFormulaNew")',ctrl.options.hasOwnProperty("computeFormulaNew"));
    //   console.log('-----------------------end-------------------------');
    // }

    if (ctrl && ctrl.options && ctrl.options.hasOwnProperty("computeFormulaNew")) {
      //@ts-ignore
      let computeFormulaNew: string = ctrl.options.computeFormulaNew
      if (!computeFormulaNew) {
        return
      }
      let formulaStr: string = ""
      try {
        let computeObj: any = JSON.parse(computeFormulaNew)
        if (computeObj) {
          formulaStr = computeObj.formula
        }
      } catch (err) {
        console.log(err)
      }
      // 解析计算规则表达式，订阅发送
      let relevantDataItems: string[] | null = formulaStr.match(/\{.*?\}/g)
      if (Array.isArray(relevantDataItems)) {
        relevantDataItems.forEach((formulaItemKey: string) => {
          const dataItemKey: string = formulaItemKey.substring(1, formulaItemKey.length - 1)
          let controller: any = null
          const idx = dataItemKey.indexOf(".")
          if (idx > -1) {
            // 子表条件
            const sheetKey = dataItemKey.substring(0, idx)
            const controlKey = dataItemKey.substr(idx + 1)
            controller = this.findController(sheetKey) as any
            if (formulaStr.indexOf("COUNT") > -1 && formulaStr.indexOf("COUNTIF") === -1) {
              const sheetColumnSubject: any = controller.getColumnValueChange(controlKey)
              if (sheetColumnSubject) {
                sheetColumnSubject.subscribe((change: any) => {
                  if (!ctrl.readonly) {
                    setTimeout(() => {
                      let bizRuleCalculate: any = {}
                      bizRuleCalculate.expression = formulaStr
                      let dataParamsMap: any = {}
                      if (Array.isArray(relevantDataItems)) {
                        relevantDataItems.forEach((formulaInnerKey: string) => {
                          let innerCode: string = formulaInnerKey.substring(1, formulaInnerKey.length - 1)
                          let relevantCtrl: any = null
                          const idx = innerCode.indexOf(".")
                          if (idx > -1) {
                            // 子表条件
                            const sheetKey = innerCode.substring(0, idx)
                            const controlKey = innerCode.substr(idx + 1)
                            relevantCtrl = this.findController(sheetKey) as any
                            if (relevantCtrl) {
                              let data: any[] = relevantCtrl.value.map((item: any) => item[controlKey]) || []
                              data = data.filter(el => !!el)
                              dataParamsMap[innerCode] = data.length ? data : 0
                            }
                          } else {
                            relevantCtrl = this.findController(innerCode) as any
                            let dataItem = this.getDataItem(innerCode)
                            if (relevantCtrl && dataItem) {
                              let val: any = relevantCtrl.value
                              dataParamsMap[innerCode] = this.formatVal(val, dataItem.propertyType)
                            }
                          }
                        })
                        bizRuleCalculate.dataParamsMap = dataParamsMap
                        let id = ctrl.id as string
                        // @ts-ignore
                        let parentKey = ctrl.parentKey ? ctrl.parentKey : ""
                        let dataItem = this.getDataItem(id, parentKey)
                        if (dataItem) {
                          bizRuleCalculate.schemaCode = dataItem.schemaCode
                          bizRuleCalculate.propertyCode = ctrl.id
                        }
                        formApi
                          .getComputeFormulaVal(bizRuleCalculate)
                          .then((res: any) => {
                            if (res && res.errcode == 0) {
                              if (dataItem) {
                                switch (dataItem.propertyType) {
                                  case DataItemType.ShortText:
                                    ctrl.value = String(res.data || "")
                                    break
                                  case DataItemType.Number:
                                    ctrl.value = res.data ? Number(res.data) : 0
                                    break
                                  default:
                                    ctrl.value = res.data
                                    break
                                }
                              }
                            }
                          })
                          .catch((err: any) => {
                            console.log("获取计算值失败", err)
                          })
                      }
                    }, 500)
                  }
                })
              }
            } else {
              const sheetColumnSubject: any = controller.getColumnValueChange(controlKey)
              if (sheetColumnSubject) {
                sheetColumnSubject.subscribe((change: any) => {
                  // change {index: 3,key: "Date1627012986341",oldValue: [null],parentKey: "Sheet1627012970101",rowIndex: 0,value: [Sat Jul 24 2021 00:00:00 GMT+0800 (中国标准时间)]}
                  if (!ctrl.readonly) {
                    if (!ctrl.inSheet) {
                      //主表字段
                      setTimeout(() => {
                        let bizRuleCalculate: any = {}
                        bizRuleCalculate.expression = formulaStr
                        let dataParamsMap: any = {}
                        if (Array.isArray(relevantDataItems)) {
                          relevantDataItems.forEach((formulaInnerKey: string) => {
                            let innerCode: string = formulaInnerKey.substring(1, formulaInnerKey.length - 1)
                            let relevantCtrl: any = null
                            const idx = innerCode.indexOf(".")
                            if (idx > -1) {
                              // 子表条件
                              const sheetKey = innerCode.substring(0, idx)
                              const innerControlKey = innerCode.substr(idx + 1)
                              let dataItem = this.getDataItem(innerControlKey, sheetKey)
                              let isAggregateFunc =
                                formulaStr.indexOf("SUM") > -1 ||
                                formulaStr.indexOf("AVG") > -1 ||
                                formulaStr.indexOf("MAX") > -1 ||
                                formulaStr.indexOf("MIN") > -1 ||
                                formulaStr.indexOf("COUNTIF") > -1
                              let tmpVal: any = null
                              if (controlKey === innerControlKey) {
                                tmpVal = isAggregateFunc ? change.value : change.value[change.rowIndex]
                              } else {
                                relevantCtrl = this.findController(sheetKey) as any
                                if (relevantCtrl) {
                                  tmpVal = isAggregateFunc
                                    ? relevantCtrl.value.map((item: any) => item[innerControlKey])
                                    : relevantCtrl.value.map((item: any) => item[innerControlKey])[change.rowIndex]
                                }
                              }
                              tmpVal = tmpVal && tmpVal.filter((el: any) => el !== null)
                              dataParamsMap[innerCode] = isAggregateFunc ? tmpVal : this.formatVal(tmpVal, dataItem.propertyType)
                            } else {
                              relevantCtrl = this.findController(innerCode) as any
                              let dataItem = this.getDataItem(innerCode)
                              if (relevantCtrl && dataItem) {
                                let val: any = relevantCtrl.value
                                dataParamsMap[innerCode] = this.formatVal(val, dataItem.propertyType)
                              }
                            }
                          })
                          bizRuleCalculate.dataParamsMap = dataParamsMap
                          let id = ctrl.id as string
                          // @ts-ignore
                          let parentKey = ctrl.parentKey ? ctrl.parentKey : ""
                          let dataItem = this.getDataItem(id, parentKey)
                          if (dataItem) {
                            bizRuleCalculate.schemaCode = dataItem.schemaCode
                            bizRuleCalculate.propertyCode = ctrl.id
                          }
                          formApi
                            .getComputeFormulaVal(bizRuleCalculate)
                            .then((res: any) => {
                              if (res && res.errcode == 0) {
                                // let dataItem = this.getDataItem(ctrl.id as string);
                                if (dataItem) {
                                  switch (dataItem.propertyType) {
                                    case DataItemType.ShortText:
                                      ctrl.value = String(res.data || "")
                                      break
                                    case DataItemType.Number:
                                      ctrl.value = res.data ? Number(res.data) : 0
                                      break
                                    default:
                                      ctrl.value = res.data
                                      break
                                  }
                                }
                              }
                            })
                            .catch((err: any) => {
                              console.log("获取计算值失败", err)
                            })
                        }
                      }, 500)
                    } else {
                      let rowIndex = ctrl.options.rowIndex || 0
                      if (rowIndex === change.rowIndex) {
                        setTimeout(() => {
                          let bizRuleCalculate: any = {}
                          bizRuleCalculate.expression = formulaStr
                          let dataParamsMap: any = {}
                          if (Array.isArray(relevantDataItems)) {
                            relevantDataItems.forEach((formulaInnerKey: string) => {
                              let innerCode: string = formulaInnerKey.substring(1, formulaInnerKey.length - 1)
                              let relevantCtrl: any = null
                              const idx = innerCode.indexOf(".")
                              if (idx > -1) {
                                // 子表条件
                                const sheetKey = innerCode.substring(0, idx)
                                const innerControlKey = innerCode.substr(idx + 1)
                                let dataItem = this.getDataItem(innerControlKey, sheetKey)
                                let tmpVal = null
                                if (controlKey === innerControlKey) {
                                  tmpVal = change.value[change.rowIndex]
                                } else {
                                  relevantCtrl = this.findController(sheetKey) as any
                                  if (relevantCtrl) {
                                    tmpVal = relevantCtrl.value.map((item: any) => item[innerControlKey])[change.rowIndex]
                                  }
                                }
                                dataParamsMap[innerCode] = this.formatVal(tmpVal, dataItem.propertyType)
                              } else {
                                relevantCtrl = this.findController(innerCode) as any
                                let dataItem = this.getDataItem(innerCode)
                                if (relevantCtrl && dataItem) {
                                  let val: any = relevantCtrl.value
                                  dataParamsMap[innerCode] = this.formatVal(val, dataItem.propertyType)
                                }
                              }
                            })
                            bizRuleCalculate.dataParamsMap = dataParamsMap
                            let id = ctrl.id as string
                            // @ts-ignore
                            let parentKey = ctrl.parentKey ? ctrl.parentKey : ""
                            let dataItem = this.getDataItem(id, parentKey)
                            if (dataItem) {
                              bizRuleCalculate.schemaCode = dataItem.schemaCode
                              bizRuleCalculate.propertyCode = ctrl.id
                            }
                            formApi
                              .getComputeFormulaVal(bizRuleCalculate)
                              .then((res: any) => {
                                if (res && res.errcode == 0) {
                                  if (res.data !== undefined && res.data !== null) {
                                    switch (dataItem.propertyType) {
                                      case DataItemType.ShortText:
                                        ctrl.value = String(res.data || "")
                                        break
                                      case DataItemType.Number:
                                        ctrl.value = res.data ? Number(res.data) : 0
                                        break
                                      default:
                                        ctrl.value = res.data
                                        break
                                    }
                                  }
                                }
                              })
                              .catch((err: any) => {
                                console.log("获取计算值失败", err)
                              })
                          }
                        }, 500)
                      }
                    }
                  }
                })
              }
            }
          } else {
            controller = this.findController(dataItemKey) as any
            if (controller && controller.valueChange) {
              if (!ctrl.readonly) {
                if (controller.value == controller.options.value && controller.value) {
                  setTimeout(() => {
                    // 组装参数去调用后台接口获取计算值
                    let bizRuleCalculate: any = {}
                    bizRuleCalculate.expression = formulaStr
                    let dataParamsMap: any = {}
                    if (Array.isArray(relevantDataItems)) {
                      relevantDataItems.forEach((formulaInnerKey: string) => {
                        let innerCode: string = formulaInnerKey.substring(1, formulaInnerKey.length - 1)
                        let relevantCtrl: any = null
                        const idx = innerCode.indexOf(".")
                        if (idx > -1) {
                          // 子表条件
                          const sheetKey = innerCode.substring(0, idx)
                          const controlKey = innerCode.substr(idx + 1)
                          relevantCtrl = this.findController(sheetKey) as any
                          if (relevantCtrl) {
                            let data: any[] = relevantCtrl.value.map((item: any) => item[controlKey]) || []
                            data = data.filter(el => !!el)
                            dataParamsMap[innerCode] = data.length ? data[0] : 0
                          }
                        } else {
                          relevantCtrl = this.findController(innerCode) as any
                          let dataItem = this.getDataItem(innerCode)
                          if (relevantCtrl && dataItem) {
                            // 根据控件类型传入值
                            let val: any = relevantCtrl.value
                            dataParamsMap[innerCode] = this.formatVal(val, dataItem.propertyType)
                          }
                        }
                      })
                      bizRuleCalculate.dataParamsMap = dataParamsMap
                      let id = ctrl.id as string
                      // @ts-ignore
                      let parentKey = ctrl.parentKey ? ctrl.parentKey : ""
                      let dataItem = this.getDataItem(id, parentKey)
                      if (dataItem) {
                        bizRuleCalculate.schemaCode = dataItem.schemaCode
                        bizRuleCalculate.propertyCode = ctrl.id
                      }
                      formApi
                        .getComputeFormulaVal(bizRuleCalculate)
                        .then((res: any) => {
                          if (res && res.errcode == 0) {
                            // let dataItem = this.getDataItem(ctrl.id as string);
                            if (dataItem) {
                              switch (dataItem.propertyType) {
                                case DataItemType.ShortText:
                                  ctrl.value = String(res.data || "")
                                  break
                                case DataItemType.Number:
                                  ctrl.value = res.data ? Number(res.data) : 0
                                  break
                                default:
                                  ctrl.value = res.data
                                  break
                              }
                            }
                          }
                        })
                        .catch((err: any) => {
                          console.log("获取计算值失败", err)
                        })
                    }
                  }, 500)
                }
              }
              const optimizationValChange = controller.valueChange.pipe(debounceTime(500))
              optimizationValChange.subscribe((change: any) => {
                if (!ctrl.readonly) {
                  setTimeout(() => {
                    // 组装参数去调用后台接口获取计算值
                    let bizRuleCalculate: any = {}
                    bizRuleCalculate.expression = formulaStr
                    let dataParamsMap: any = {}
                    if (Array.isArray(relevantDataItems)) {
                      relevantDataItems.forEach((formulaInnerKey: string) => {
                        let innerCode: string = formulaInnerKey.substring(1, formulaInnerKey.length - 1)
                        let relevantCtrl: any = null
                        const idx = innerCode.indexOf(".")
                        if (idx > -1) {
                          // 子表条件
                          const sheetKey = innerCode.substring(0, idx)
                          const controlKey = innerCode.substr(idx + 1)
                          relevantCtrl = this.findController(sheetKey) as any
                          if (relevantCtrl) {
                            let data: any[] = relevantCtrl.value.map((item: any) => item[controlKey]) || []
                            data = data.filter(el => !!el)
                            dataParamsMap[innerCode] = data.length ? data[0] : 0
                          }
                        } else {
                          relevantCtrl = this.findController(innerCode) as any
                          let dataItem = this.getDataItem(innerCode)
                          if (relevantCtrl && dataItem) {
                            // 根据控件类型传入值
                            let val: any = relevantCtrl.value
                            dataParamsMap[innerCode] = this.formatVal(val, dataItem.propertyType)
                          }
                        }
                      })
                      bizRuleCalculate.dataParamsMap = dataParamsMap
                      let id = ctrl.id as string
                      // @ts-ignore
                      let parentKey = ctrl.parentKey ? ctrl.parentKey : ""
                      let dataItem = this.getDataItem(id, parentKey)
                      // console.log('parentKey',parentKey);
                      // console.log('dataItem',dataItem);
                      // console.log('dataItem.code',dataItem.code);
                      // console.log('dataItem.schemaCode',dataItem.schemaCode);
                      if (dataItem) {
                        bizRuleCalculate.schemaCode = dataItem.schemaCode
                        bizRuleCalculate.propertyCode = ctrl.id
                      }
                      formApi
                        .getComputeFormulaVal(bizRuleCalculate)
                        .then((res: any) => {
                          if (res && res.errcode == 0) {
                            // let dataItem = this.getDataItem(ctrl.id as string);
                            if (dataItem) {
                              switch (dataItem.propertyType) {
                                case DataItemType.ShortText:
                                  ctrl.value = String(res.data || "")
                                  break
                                case DataItemType.Number:
                                  ctrl.value = res.data ? Number(res.data) : 0
                                  break
                                default:
                                  ctrl.value = res.data
                                  break
                              }
                            }
                          }
                        })
                        .catch((err: any) => {
                          console.log("获取计算值失败", err)
                        })
                    }
                  }, 500)
                }
              })
            }
          }
        })
      } else {
        // TODAY 函数
        if (formulaStr === "TODAY()") {
          let bizRuleCalculate: any = {}
          bizRuleCalculate.expression = formulaStr
          bizRuleCalculate.dataParamsMap = null
          let id = ctrl.id as string
          // @ts-ignore
          let parentKey = ctrl.parentKey ? ctrl.parentKey : ""
          let dataItem = this.getDataItem(id, parentKey)
          if (dataItem) {
            bizRuleCalculate.schemaCode = dataItem.schemaCode
            bizRuleCalculate.propertyCode = ctrl.id
          }
          formApi
            .getComputeFormulaVal(bizRuleCalculate)
            .then((res: any) => {
              if (res && res.errcode == 0) {
                // let dataItem = this.getDataItem(ctrl.id as string);
                if (dataItem) {
                  switch (dataItem.propertyType) {
                    case DataItemType.ShortText:
                      ctrl.value = String(res.data || "")
                      break
                    case DataItemType.Number:
                      ctrl.value = res.data ? Number(res.data) : 0
                      break
                    default:
                      ctrl.value = res.data
                      break
                  }
                }
              }
            })
            .catch((err: any) => {
              console.log("获取计算值失败", err)
            })
        }
      }
    }

    this.unsubscribeValueChange()

    this.valueChangeSubscription = ctrl.propertyChange.subscribe(change => {
      switch (change.name) {
        case PropertyNames.Value:
          this.emitControlOnChange(change)

          if (this.handleValueChange) {
            if (!isEqual(change.value, change.oldValue)) {
              this.handleValueChange(change.value, change)
            }
          }
          break

        // case PropertyNames.Readonly:
        //   this.control.edit = change.value === false;
        //   break;
      }
    })
  }

  emitControlOnChange(change: ControlValueChange) {
    const opts = this.controlOpts as any
    if (this.ctrl.inSheet) {
      // 如果在子表内触发了事件 则要标记当前行状态
      const parentKey: any = this.control.parentKey
      const key: any = this.control.key
      const options: any = this.ctrl.options
      if (parentKey) {
        this.changeFormSheetRowStatus(parentKey, key, options)
      }
    }
    if (!opts.onChange) {
      return
    }

    if (!this.onChangeFn) {
      this.onChangeFn = new Function("value", "oldValue", "form", opts.onChange)
    }
    const proxy = this.getThisProxy()

    this.onChangeFn.call(proxy, change.value, change.oldValue, proxy)
  }

  emitOnDataLinkage(params: any) {
    // 传入的参数格式key_dataItemType_fromControlType
    let isOnlyMainCondition: boolean = params.extraCond.join("&&").indexOf(".") === -1
    let isSheetItem: boolean = params.fillProperty.src.indexOf(".") > -1
    let { key: srcKey } = this.formatKey(params.fillProperty.src)
    const ctrl = this.ctrl as FormControl<any>
    let controller: any = null
    let rowIndex: number = 0
    let filterArr: listParams.Filters[] = []
    let mulRelevantKeyArr: string[] = []
    params.filter.forEach((x: any) => {
      let targetKeyArr: any = x.key.split("|")
      if (Array.isArray(targetKeyArr) && targetKeyArr.length === 2) {
        if (Number(targetKeyArr[1]) === DataItemType.RelevanceFormEx) {
          mulRelevantKeyArr.push(x.key)
        }
        let filterVal = this.formatVal(x.val, Number(targetKeyArr[1]), true)
        filterArr.push({
          propertyCode: targetKeyArr[0],
          propertyType: Number(targetKeyArr[1]),
          propertyValue: filterVal,
          //@ts-ignore
          op: this.formatOpByDataItemType(Number(targetKeyArr[1]), filterVal)
        })
      } else {
        let { key: xKey, dataItemType: xDataItemType, formControlType: xFormControlType } = this.formatKey(x.key)
        if (Number(xFormControlType) === 81) {
          mulRelevantKeyArr.push(xKey)
        }
        let filterVal = this.formatVal(x.val, Number(xFormControlType), true)
        filterArr.push({
          propertyCode: xKey,
          propertyType: Number(xDataItemType),
          propertyValue: filterVal,
          //@ts-ignore
          op: this.formatOpByFormControlType(Number(xFormControlType), filterVal)
        })
      }
    })

    let targetKey: string = params.fillProperty["target"]
    let xKey: any = null
    let targetKeyArr: any = targetKey.split("|")
    let targetType: number = 0
    let targetControlType: number = -1
    if (Array.isArray(targetKeyArr) && targetKeyArr.length === 2) {
      xKey = targetKeyArr[0]
      targetType = targetKeyArr[1]
    } else {
      let { key, dataItemType, formControlType } = this.formatKey(targetKey)
      xKey = key
      targetType = Number(dataItemType)
      targetControlType = Number(formControlType)
    }
    let mixParams: listParams.QueryListParams = {
      filters: filterArr,
      mobile: false,
      page: 0,
      size: 20,
      queryCode: "",
      schemaCode: params.targetModel,
      // @ts-ignore
      options: {
        // @ts-ignore
        customDisplayColumns: [xKey].concat(mulRelevantKeyArr),
        // @ts-ignore
        queryDisplayType: 1
      },
      // @ts-ignore
      customizedQuery: true
    }
    if (ctrl.options.inSheet) {
      if (isOnlyMainCondition && isSheetItem) {
        // 只有主表条件并且联动项是子表项, 需求要求将满足条件的数据项加到子表中
        if (rowIndex === 0) {
          listApi.getQueryList(mixParams).then(res => {
            let sheetKey = srcKey.substring(0, srcKey.indexOf("."))
            let itemKey = srcKey.substring(srcKey.indexOf(".") + 1)
            let sheet = this.findController(sheetKey)
            let sheetControl = this.getFormControls([sheetKey])[0] as any
            if (res.errcode === 0 && res.data && Array.isArray(res.data.content) && res.data.content.length > 0) {
              let rows: any[] = []
              res.data.content.forEach((item: any) => {
                let vals: any = Object.create(null)
                vals[itemKey] = ""
                rows.push(vals)
              })
              sheet.value = rows
              setTimeout(() => {
                let rows: any[] = []
                res.data.content.forEach((item: any, index: number) => {
                  let rowData: any = Object.create(null)
                  let val: any = item.data[xKey]
                  rowData[itemKey] = this.formatValByType(val, targetType, targetControlType)
                  rows.push(rowData)
                })
                sheet.value = rows
              }, 10)
            } else {
              sheet.value = []
            }
          })
        }
      } else {
        const idx = srcKey.indexOf(".")
        rowIndex = ctrl.options.rowIndex || 0
        const sheetKey = srcKey.substring(0, idx)
        const controlKey = srcKey.substr(idx + 1)
        const sheetCtrl = this.findController(sheetKey) as any
        if (sheetCtrl) {
          const row = sheetCtrl.rows[rowIndex]
          controller = row.findChild(controlKey)
        }
        listApi.getQueryList(mixParams).then(res => {
          if (res.errcode === 0 && res.data && Array.isArray(res.data.content) && res.data.content.length > 0) {
            let val = res.data.content[0]["data"][xKey]
            //根据目标控件类型格式化值
            controller.value = this.formatValByType(val, targetType, targetControlType)
          } else {
            switch (Number(targetType)) {
              case DataItemType.Date:
              case DataItemType.Attachment:
              case DataItemType.StaffSingle:
              case DataItemType.StaffMulti:
              case DataItemType.DeptSingle:
              case DataItemType.DeptMulti:
              case DataItemType.StaffDeptMix:
              case DataItemType.Sheet:
              case DataItemType.RelevanceForm:
              case DataItemType.RelevanceFormEx:
              case DataItemType.Sheet:
              case DataItemType.Address:
              case DataItemType.Number:
              case DataItemType.Checkbox:
              case DataItemType.Logic:
              case DataItemType.Time:
                controller.value = null
                break
              case DataItemType.DropdownMulti: // 下拉多选数据格式是数组，清空操作
                controller.value = []
                break
              default:
                controller.value = ""
                break
            }
          }
        })
      }
    } else {
      controller = this.findController(srcKey)
      listApi.getQueryList(mixParams).then(res => {
        if (res.errcode === 0 && res.data && Array.isArray(res.data.content) && res.data.content.length > 0) {
          let val = res.data.content[0]["data"][xKey]
          //根据目标控件类型格式化值
          controller.value = this.formatValByType(val, targetType, targetControlType)
        } else {
          switch (Number(targetType)) {
            case DataItemType.Date:
            case DataItemType.Attachment:
            case DataItemType.StaffSingle:
            case DataItemType.StaffMulti:
            case DataItemType.DeptSingle:
            case DataItemType.DeptMulti:
            case DataItemType.StaffDeptMix:
            case DataItemType.Sheet:
            case DataItemType.RelevanceForm:
            case DataItemType.RelevanceFormEx:
            case DataItemType.Sheet:
            case DataItemType.Address:
            case DataItemType.Number:
            case DataItemType.Checkbox:
            case DataItemType.Logic:
            case DataItemType.Time:
              controller.value = null
              break
            case DataItemType.DropdownMulti: // 下拉多选数据格式是数组，清空操作
              controller.value = []
              break
            default:
              controller.value = ""
              break
          }
        }
      })
    }
  }

  // 更新子表某一行的状态
  /**
   * 初始状态，未做任何改变
   * Unchanged
   */
  /**
   * 已新增，保存所有离线的新增
   * Added
   */
  /**
   * 已删除，对应数据库中的需要删除的记录
   * Deleted
   */
  /**
   * 已修改，对应数据库中需要修改的记录
   * Modified
   */
  changeFormSheetRowStatus(parentKey: any, key: any, options: any) {
    // 通过当前控件「parentKey」找到子表
    const sheetCtrl = this.findController(parentKey) as FormSheet
    const value: any = sheetCtrl.value
    value.forEach((item: any, index: number) => {
      if (index === options.rowIndex) {
        if (!item.id) {
          item.rowStatus = "Added"
        } else {
          item.rowStatus = "Modified"
        }
      }
    })
    sheetCtrl.value = value
  }

  // 传入的参数格式key_dataItemType_fromControlType
  formatKey(keyStr: string) {
    const isOldStyle: boolean = /\w+\_(\d+|null)\_(\d+|null)/.test(keyStr)
    if (isOldStyle) {
      let _lastIndex = keyStr.lastIndexOf("_")
      let _last2rdIndex = keyStr.lastIndexOf("_", _lastIndex - 1)
      let key = keyStr.substring(0, _last2rdIndex)
      let dataItemType = keyStr.substring(_last2rdIndex + 1, _lastIndex)
      let formControlType = keyStr.substr(_lastIndex + 1)
      return {
        key,
        dataItemType,
        formControlType
      }
    } else {
      return {
        key: keyStr,
        dataItemType: -1,
        formControlType: -1
      }
    }
  }

  formatValByType(val: any, targetType: number, targetControlType: number) {
    let retVal: any = val
    if (Number(targetControlType) === -1) {
      switch (Number(targetType)) {
        case DataItemType.ShortText:
        case DataItemType.Radio:
        case DataItemType.Dropdown:
          if (typeof val === "string" && val.length <= 200) {
            retVal = val
          } else if (typeof val !== "object") {
            retVal = val.toString()
          } else if (typeof val === "object") {
            retVal = JSON.stringify(val) !== "null" ? JSON.stringify(val) : ""
          }
          break

        case DataItemType.LongText:
          if (typeof val === "string") {
            retVal = val
          }
          break

        case DataItemType.Number:
          if (val === "") {
            retVal = null
          }
          retVal = Number(val)
          break

        case DataItemType.Logic:
          retVal = Boolean(val)
          break

        case DataItemType.Date:
          if (val instanceof Date) {
            retVal = val
          } else if (typeof val === "string" && val) {
            try {
              let str = val
                .replace(/-/g, "/") // iOS兼容
                .replace(/T/g, " ") //修复2019-09-17T06:21:07.000字符不能new Date的问题

              let date = new Date(str)
              if (date.getFullYear() > 0) {
                retVal = date
              }
            } catch {}
          }
          break
        case DataItemType.Time:
          if (typeof val === "string" && val) {
            retVal = moment(val, "HH:mm:ss")
          }
          break
        case DataItemType.Checkbox:
        case DataItemType.DropdownMulti:
          if (typeof val === "string") {
            retVal = val.split(";").filter(x => !!x)
          } else if (typeof val === "object") {
            retVal = [val]
          } else if (Array.isArray(val) && val.some(x => typeof x === "string")) {
            retVal = val
          }
          break

        case DataItemType.Address:
          if (typeof val === "string") {
            try {
              val = JSON.parse(val)
            } catch {}
          }
          if (typeof val === "object") {
            retVal = val
          }
          break

        case DataItemType.Attachment:
        case DataItemType.StaffSingle:
        case DataItemType.StaffMulti:
        case DataItemType.DeptSingle:
        case DataItemType.DeptMulti:
        case DataItemType.StaffDeptMix:
        case DataItemType.Sheet:
          if (typeof val === "string") {
            try {
              val = JSON.parse(val)
            } catch {}
          }
          if (Array.isArray(val) && val.some(x => typeof x === "object")) {
            retVal = val
          }
          break

        case DataItemType.ApprovalOpinion:
          if (typeof val === "string") {
            retVal = {
              content: val
            }
          } else if (typeof val === "object" && typeof val.content === "string") {
            retVal = val
          }
          break
        case DataItemType.RelevanceForm:
        case DataItemType.RelevanceFormEx:
        case DataItemType.Address:
          if (typeof val === "string") {
            try {
              val = JSON.parse(val)
            } catch {}
          }
          if (typeof val === "object") {
            retVal = val
          }
          break
      }
    } else {
      switch (Number(targetControlType)) {
        case FormControlType.Text:
        case FormControlType.Radio:
        case FormControlType.Dropdown:
          if (typeof val === "string" && val.length <= 200) {
            retVal = val
          } else if (typeof val !== "object") {
            retVal = val.toString()
          } else if (typeof val === "object" && val !== null) {
            retVal = JSON.stringify(val)
          }
          break

        case FormControlType.SequenceNo:
        case FormControlType.Textarea:
        case FormControlType.Description:
        case FormControlType.Title:
          if (typeof val === "string") {
            retVal = val
          }
          break

        case FormControlType.Number:
          if (val === "") {
            retVal = null
          }
          retVal = Number(val)
          break
        case FormControlType.Logic:
          retVal = Boolean(val)
          break
        case FormControlType.Date:
        case FormControlType.CreatedTime:
        case FormControlType.ModifiedTime:
          if (val instanceof Date) {
            retVal = val
          } else if (typeof val === "string" && val) {
            try {
              let str = val
                .replace(/-/g, "/") // iOS兼容
                .replace(/T/g, " ") //修复2019-09-17T06:21:07.000字符不能new Date的问题

              let date = new Date(str)
              if (date.getFullYear() > 0) {
                retVal = date
              }
            } catch {}
          }
          break
        case FormControlType.Time:
          if (typeof val === "string" && val) {
            retVal = moment(val, "HH:mm:ss")
          }
          break

        case FormControlType.Checkbox:
          if (typeof val === "string") {
            retVal = val.split(";").filter(x => !!x)
          } else if (typeof val === "object") {
            retVal = [val]
          } else if (Array.isArray(val) && val.some(x => typeof x === "string")) {
            retVal = val
          }
          break

        case FormControlType.Location:
          if (typeof val === "string") {
            try {
              val = JSON.parse(val)
            } catch {}
          }
          if (typeof val === "object") {
            retVal = val
          }
          break

        case FormControlType.Image:
        case FormControlType.Attachment:
        case FormControlType.Signature:
        case FormControlType.StaffSelector:
        case FormControlType.StaffMultiSelector:
        case FormControlType.DepartmentSelector:
        case FormControlType.DepartmentMultiSelector:
        case FormControlType.CreateBy:
        case FormControlType.ModifyBy:
        case FormControlType.OwnerId:
        case FormControlType.CreateByParentId:
        case FormControlType.Sheet:
          if (typeof val === "string") {
            try {
              val = JSON.parse(val)
            } catch {}
          }
          if (Array.isArray(val) && val.some(x => typeof x === "object")) {
            retVal = val
          }
          break

        case FormControlType.ApprovalOpinion:
          if (typeof val === "string") {
            retVal = {
              content: val
            }
          } else if (typeof val === "object" && typeof val.content === "string") {
            retVal = val
          }
          break

        case FormControlType.DateRange:
        case FormControlType.NumberRange:
        case FormControlType.TimeRange:
          if (Array.isArray(val)) {
            retVal = val
          }
          break

        case FormControlType.ReverseRelevance:
        case FormControlType.RelevanceForm:
        case FormControlType.RelevanceFormEx:
        case FormControlType.Address:
          if (typeof val === "string") {
            try {
              val = JSON.parse(val)
            } catch {}
          }
          if (typeof val === "object") {
            retVal = val
          }
          break
      }
    }
    return retVal
  }

  // 根据表单控件类型去格式化值
  formatVal(val: any, type: number, isDataLink: boolean = false) {
    let propertyValue: any = null
    if (val) {
      switch (type) {
        case DataItemType.Number:
          propertyValue = Number(val)
          break
        case DataItemType.ShortText:
        case DataItemType.LongText:
        case DataItemType.Radio:
        case DataItemType.Dropdown:
          propertyValue = String(val)
          break
        case DataItemType.Logic:
          propertyValue = Boolean(val)
          break
        case DataItemType.Date: // 日期
          propertyValue = val instanceof Date ? dateFormat.formatter(val, "YYYY-MM-DD HH:mm:ss") : val
          break
        case DataItemType.Checkbox: // 复选框
        case DataItemType.DropdownMulti: // 下拉多选框
          propertyValue = val.join(";")
          break
        case DataItemType.Address: // 地址
          if (val && Object.keys(val).length > 0) {
            propertyValue = JSON.stringify(val)
          } else {
            propertyValue = null
          }
          break
        case DataItemType.StaffSingle: // 人员单复选
        case DataItemType.StaffMulti:
        case DataItemType.DeptSingle:
        case DataItemType.DeptMulti:
        case DataItemType.StaffDeptMix:
          if (isDataLink) {
            let tmpVal = val.map((m: any) => {
              return {
                id: m.id,
                unitType: m.unitType,
                name: m.name
              }
            })
            propertyValue = JSON.stringify(tmpVal)
          } else {
            propertyValue = val.map((x: any) => x.name).join(";")
          }
          break
        case DataItemType.RelevanceForm:
          propertyValue = val.id
          break
        case DataItemType.RelevanceFormEx:
          propertyValue = val.map((x: any) => x.id).join(";")
          break
        default:
          propertyValue = String(val)
          break
      }
    } else {
      switch (type) {
        case DataItemType.Logic:
          return Boolean(val)
        case DataItemType.Number:
          //参数为空字符串时转换为0传递到后端计算
          return Number(val)
        default:
          return ""
      }
    }
    return propertyValue
  }

  formatOpByDataItemType(type: number, val: any) {
    switch (type) {
      case DataItemType.Checkbox:
      case DataItemType.Address:
      case DataItemType.RelevanceForm:
      case DataItemType.RelevanceFormEx:
        return "Like"
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.DeptSingle:
      case DataItemType.DeptMulti:
      case DataItemType.StaffDeptMix:
        // 选人选组织控件 当没有值时 需要传Eq,有值需要传Like
        if (!val) {
          return "Eq"
        } else {
          return "Like"
        }
      default:
        return "Eq"
    }
  }

  formatOpByFormControlType(type: number, val: any) {
    switch (type) {
      case 6:
      case 14:
      case 80:
      case 81:
        return "Like"
      case 50:
      case 51:
      case 60:
      case 61:
        // 选人选组织控件 当没有值时 需要传Eq,有值需要传Like
        if (!val) {
          return "Eq"
        } else {
          return "Like"
        }
      default:
        return "Eq"
    }
  }

  validate() {
    ;(this.ctrl as FormControl<any>).validate(false)
  }

  // countLengthOf(s: string) {
  //     if (!s) {
  //         return 0;
  //     }
  //     const reg = /[\u4e00-\u9fa5]+/;
  //     let result: RegExpExecArray | null;
  //     let len = 0;
  //     while (result = reg.exec(s), result !== null) {
  //         len += result[0].length * 2;
  //         s = s.replace(reg, '');
  //     }
  //     len += s.length;
  //     return len;
  // }
  /**
   *
   * @param formControls 所有的control
   * @param exp
   */
  parseConditions(formControls: typings.RendererFormControl[], exp: string) {
    let segs: string[] = []
    const results: any[] = []

    if (exp.indexOf("||") > -1) {
      segs = exp.split(" || ")
    } else {
      if (exp.indexOf("&&") > -1) {
        segs = exp.split(" && ")
      } else {
        segs = [exp]
      }
    }

    for (const seg of segs) {
      const fields = seg.split(" ")
      const code = fields[2].substring(1, fields[2].length - 1)

      let ctrl: any
      let control: typings.RendererFormControl | undefined

      const idx = code.indexOf(".")
      if (idx > -1) {
        const parentCode = code.substring(0, idx)
        const childCode = code.substring(idx + 1)
        const sheet = formControls.find(c => c.key === parentCode) as any as typings.FormSheet
        if (sheet) {
          control = sheet.columns.find(c => c.key === childCode) as any
        }

        const sheetCtrl = this.findController(parentCode) as FormSheet

        if (sheetCtrl && this.ctrl.options && typeof this.ctrl.options.rowIndex === "number") {
          const row = sheetCtrl.rows[this.ctrl.options.rowIndex]
          ctrl = row.findChild(childCode)
        }
      } else {
        ctrl = this.findController(code)
        control = formControls.find(c => c.key === code)
      }

      if (!ctrl || !control) {
        continue
      }

      const type = ControlHelper.mapToDataItemType(control.type)

      let operator = OperatorService.findByLabel(type, fields[1])

      if (!operator) {
        continue
      }

      // let val: any;

      // if (
      //   !(
      //     operator.value === DateItemOperatorType.IsNull ||
      //     operator.value === DateItemOperatorType.IsNotNull
      //   )
      // ) {
      //   val = fields[2];

      //   switch (type) {
      //     case DataItemType.Number:
      //       val = Number(val);
      //       break;
      //     case DataItemType.Logic:
      //       val = val === "true" ? 1 : 0;
      //       break;
      //     case DataItemType.Date:
      //     case DataItemType.ShortText:
      //     case DataItemType.LongText:
      //       val = val.substring(1, val.length - 1);
      //       break;
      //     case DataItemType.StaffSingle:
      //       if (val) {
      //         try {
      //           val = JSON.parse(val);
      //         } catch (e) {
      //           console.log("initModel", e);
      //         }
      //       }
      //       break;
      //   }
      // }

      results.push({
        code: fields[0],
        control,
        controller: ctrl,
        propertyType: type,
        operatorType: operator.value
        // value: val
      })
    }

    return results
  }

  countLengthOf(s: string) {
    if (!s) {
      return 0
    }
    return s.length
  }

  subscribePropertyChange(fn: (change: ControlPropertyChange) => void) {
    const ctrl = this.findController(this.id)
    if (!ctrl) {
      return
    }

    if (this.propChangeSubscription) {
      this.propChangeSubscription.add(ctrl.propertyChange.subscribe(fn))
    } else {
      this.propChangeSubscription = ctrl.propertyChange.subscribe(fn)
    }
  }

  unsubscribeValueChange() {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe()
    }
  }

  unsubscribe() {
    if (this.onChangeSubscription) {
      this.onChangeSubscription.unsubscribe()
    }

    if (this.propChangeSubscription) {
      this.propChangeSubscription.unsubscribe()
    }
  }

  /**
   * 取消control中注册的订阅事件
   * @param control
   */
  unRefSubscription(control: RendererFormControl) {
    if (control && control.refSubscription && control.refSubscription.length) {
      control.refSubscription.forEach(subscription => {
        subscription.unsubscribe()
      })
    }
  }

  /**
   * 清理control中订阅事件延时器
   * @param control
   */
  unRefSubscriptionTimer(control: RendererFormControl) {
    if (control && control.refSubscriptionTimer && control.refSubscriptionTimer.length) {
      control.refSubscriptionTimer.forEach(timer => {
        clearTimeout(timer)
      })
    }
  }

  destroyed() {
    this.unsubscribe()
    this.unsubscribeValueChange()
    this.unRefSubscription(this.control)
    this.unRefSubscriptionTimer(this.control)
  }
}
