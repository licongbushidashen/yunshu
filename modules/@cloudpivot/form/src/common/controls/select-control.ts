import * as typings from "@cloudpivot/form/schema"

import { BaseControl } from "@cloudpivot/form/src/common/controls/base-control"
import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control"
import { ControlHelper } from "@cloudpivot/form/src/common/controls/control-helper"

export abstract class SelectControl<T extends typings.SelectControlOptions> extends BaseControl<T> {
  val: any = []

  options: string[] = []

  isCustomOption = false

  get text() {
    if (Array.isArray(this.val)) {
      let text = this.val.filter(x => x).join(";")
      if (text.length > 0) {
        text += ";"
      }
      return text
    }
    return this.val
  }

  get items() {
    return this.controlOpts.options
  }

  initOptions(isRadio: boolean) {
    const opts = this.controlOpts
    if (!opts || !opts.options) {
      return []
    }
    if (/^(\{).*(\})$/.test(opts.options)) {
      const opt = JSON.parse(opts.options)
      if (opt.options && !/^(\{).*(\})$/.test(opt.options)) {
        opts.options = opt.options
      }
    }
    try {
      if (opts.hasLabel) {
        throw new Error("ss")
      }
      const optSet = JSON.parse(opts.options)
      this.isCustomOption = true
      const curFormCode: string[] = []
      if (optSet.condition && !this.readonly) {
        let sheetConditon: any = {}
        let optSetCondition = optSet.condition.split("&&").filter((res: string | string[]) => res.indexOf("===") < 0)
        optSetCondition.map((res: any) => {
          const item: string[] = res.split(" ")
          curFormCode.push(item[2])
          if (item[2].indexOf(".") > 0) {
            const codes = item[2].split(".")
            const sheetCtrl: any = this.findController(codes[0])
            if (sheetConditon[codes[0]]) {
              sheetConditon[codes[0]].push(codes[1])
            } else {
              sheetConditon[codes[0]] = []
              sheetConditon[codes[0]].push(codes[1])
            }
          } else {
            this.valChange(item[2], (this as any).clearOption)
          }
        })
        if (Object.keys(sheetConditon).length > 0) {
          const _this: any = this
          const subscriptions: any[] = []
          const subscriptionTimers: any = []
          for (const k in sheetConditon) {
            const sheetCtrl: any = this.findController(k)
            if (sheetCtrl && this.ctrl.options && typeof this.ctrl.options.rowIndex === "number") {
              // 表单初始化完成后才对表单进行监听
              const _c = this.ctrl
              const subscriptionTimer = setTimeout(() => {
                const subscription = sheetCtrl.getRowValueChange(_this.ctrl.options.rowIndex).subscribe((change: any) => {
                  sheetConditon[k].forEach((v: any) => {
                    if (change.oldValue[v] !== undefined && change.value[v] !== undefined && change.oldValue[v] !== change.value[v]) {
                      _this.options = []
                      _c.value = null
                    }
                  })
                })
                subscriptions.push(subscription)
                this.$set(this.control, "refSubscription", subscriptions)
              }, 0)
              // 防止快速翻页导致延时注册的订阅事件不能取消
              subscriptionTimers.push(subscriptionTimer)
              this.$set(this.control, "refSubscriptionTimer", subscriptionTimers)
            }
          }
        }
      }
      return []
    } catch (err) {
      const items = opts && opts.options && opts.options.split(";").filter(s => s.length > 0)
      var value = this.ctrl.value || opts.defaultValue
      // 只有新建表单才取默认值.
      let isNew = (window as any).h3form ? !!(window as any).h3form.isNew : true
      if (isNew) {
        value = this.ctrl.value || opts.defaultValue
      } else {
        value = this.ctrl.value
      }

      if (value && value.length > 0 && typeof value === "string") {
        const defaults = value.split(";").filter(s => s.length > 0)

        if (defaults && this.ctrl) {
          this.ctrl.value = isRadio ? defaults[0] : defaults
        }
      }
      return items
    }
  }

  getOptions() {
    let dateItem: any
    if ((this.control as any).parentKey) {
      dateItem = this.getDataItem(this.control.key, this.control.parentKey)
    } else {
      dateItem = this.getDataItem(this.control.key)
    }

    try {
      JSON.parse(this.controlOpts.options)
    } catch (error) {
      this.options = this.controlOpts.options.split(";")
    }
    const opts = this.controlOpts
    let optionsSet: any

    try {
      if (dateItem) {
        const optionsJson = dateItem.options ? JSON.parse(dateItem.options) : ""
        if (optionsJson) {
          let dropDownOptionsJson = optionsJson.options ? JSON.parse(optionsJson.options) : ""
          //业务模型配置方式并且配置查询条件
          if (dropDownOptionsJson && dropDownOptionsJson.schemaCode && dropDownOptionsJson.condition) {
            optionsSet = dropDownOptionsJson
          } else {
            throw new Error()
          }
        } else {
          throw new Error()
        }
      } else {
        throw new Error()
      }
    } catch (error) {
      this.options = this.controlOpts.options.split(";")
      optionsSet = JSON.parse(opts.options)
    }

    if (!optionsSet.schemaCode) {
      let schemaCode: any = ""
      try {
        schemaCode = JSON.parse(optionsSet.options)
      } catch (error) {}
      if (schemaCode) {
        optionsSet = schemaCode
      }
    }
    const schemaCode = optionsSet.schemaCode
    const sheetDataItem = optionsSet.sheetDataItem
    const orderByFields: string[] = optionsSet.orderByFields ? [optionsSet.orderByFields] : []
    const orderType: number = optionsSet.orderType ? Number(optionsSet.orderType) : 3
    let condition: any = []
    if (optionsSet.condition) {
      const conditionStr: string[] = optionsSet.condition.split("&&").filter((res: string | string[]) => res.indexOf("===") < 0)
      conditionStr.forEach(res => {
        const item: any = res.split(" ")
        const _ctrl: any = this.getFormControls(item[2])
        let ctrl: any = null

        if (item[2].indexOf(".") > 0) {
          const codes = item[2].split(".")
          const sheetCtrl: any = this.findController(codes[0])
          if (sheetCtrl && this.ctrl.options && typeof this.ctrl.options.rowIndex === "number") {
            const row = sheetCtrl.rows[this.ctrl.options.rowIndex]
            ctrl = row.findChild(codes[1])
          }
        } else {
          ctrl = this.findController(item[2])
        }

        const type = ControlHelper.mapToDataItemType(_ctrl[0].type)
        if (ctrl.value !== null) {
          const queryItem = {
            propertyCode: item[0],
            value: ctrl.value,
            type: type
          }
          condition.push(queryItem)
        }
      })

      if (condition.length < conditionStr.length) {
        this.options = []
        return
      }
    }

    if (RelevanceFormControl.service.getOptions) {
      RelevanceFormControl.service
        .getOptions(schemaCode, "", condition, sheetDataItem, orderByFields, orderType, optionsSet.condition)
        .then(res => {
          if (JSON.stringify(this.options) !== JSON.stringify(res)) {
            this.options = res
          }
        })
    }
  }

  convertValue(multiple: boolean, value: any): string | string[] {
    if (multiple) {
      return Array.isArray(value) ? value : []
    } else {
      if (this.IsPC()) {
        if (Array.isArray(value) && value.length > 0) {
          return value[0]
        } else if (typeof value === "string" && !value) {
          return []
        } else if (typeof value === "string" && value) {
          return value
        } else {
          return ""
        }
      } else {
        if (Array.isArray(value) && value.length > 0) {
          return value[0]
        } else if (typeof value === "string") {
          return value
        } else {
          return ""
        }
      }
    }
  }

  destroyed() {
    super.destroyed()
  }

  IsPC() {
    if (document.querySelector(".design__preview")) {
      // 如果是预览模式的移动端，按移动端算
      return false
    }
    var userAgentInfo = navigator.userAgent
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod")
    var flag = true
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false
        break
      }
    }
    return flag
  }
}
