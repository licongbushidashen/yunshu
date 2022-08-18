import {
  FormControl,
  FormControlType,
  RendererControl,
  RendererLayoutControl,
  RendererFormControl,
  DesignLayoutControl,
  TemplateControl,
  FormSheet
} from "../typings"

import * as schema from "../../schema"

// import Vue from "vue";
// import "vue-i18n";

import { FormBuilder, FormGroup, FormControlErrorCodes } from "h3-forms"

import { FormBuilderHelper } from "@cloudpivot/form/src/renderer/controls/form-builder-helper"

import { ControlHelper } from "@cloudpivot/form/src/common/controls/control-helper"
import zhToEn from "@cloudpivot/list/src/components/pc/locales/zhToEn"
/**
 * 表单数据权限
 */
export interface FormDataPermission {
  /**
   * 数据项code
   */
  propertyCode?: string

  /**
   * 可写
   */
  e?: boolean

  /**
   * 必填
   */
  r?: boolean

  /**
   * 可见
   */
  v?: boolean

  /**
   * 子表数据项
   */
  subDataPermission?: FormDataPermission[]
}

export abstract class FormRendererHelper {
  /**
   * 转换模板对象
   * @param tplControls
   */
  static convertTemplate(tplControls: TemplateControl[]) {
    const groupIndexs: number[] = []

    tplControls.forEach((c, i) => {
      if (
        c.children &&
        c.children.length === 1 &&
        c.children[0].children &&
        c.children[0].children.length === 1 &&
        c.children[0].children[0].BPMType === FormControlType.Group
      ) {
        groupIndexs.push(i)
      }
    })

    if (groupIndexs.length > 0) {
      groupIndexs.push(tplControls.length)
    }

    groupIndexs.forEach((idx, i) => {
      if (i === groupIndexs.length - 1) {
        return
      }
      const group = (tplControls[idx] as any).children[0].children[0]
      if (group) {
        const children = tplControls.slice(idx + 1, groupIndexs[i + 1])
        if (group.children) {
          group.children = group.children.concat(children)
        } else {
          group.children = children
        }
      }
    })

    groupIndexs.reverse().forEach((idx, i) => {
      if (i === groupIndexs.length - 1) {
        return
      }
      const start = groupIndexs[i + 1] + 1
      tplControls.splice(start, idx - start)
    })

    const convert = (tc: TemplateControl) => {
      const rc: any = {
        id: tc.id,
        nodeName: tc.nodeName,
        class: tc.class,
        style: tc.style,
        value: tc.value,
        edit: false
      }
      if (tc.BPMOptions) {
        rc.key = tc.BPMOptions.key
        rc.options = tc.BPMOptions.options
        rc.type = tc.BPMType
        rc.value = tc.value
        if (tc.BPMOptions.columnKey) {
          rc.columnKey = tc.BPMOptions.columnKey
        }
        if (tc.BPMOptions.columns) {
          rc.columns = tc.BPMOptions.columns
        }
        if (tc.BPMOptions.actions) {
          rc.actions = tc.BPMOptions.actions
        }
        if (tc.BPMOptions.statistics) {
          rc.statistics = tc.BPMOptions.statistics
        }
      }
      if (tc.children) {
        rc.children = tc.children.map(convert)
        const cols = rc.children.filter((c: any) => c.nodeName === "a-col")
        if (cols.length > 0) {
          const span = 24 / cols.length
          cols.forEach((c: any) => (c.span = span))
        }
      }
      return rc
    }

    const controls = tplControls.map(convert)

    return controls
  }

  static handleDataDefault(properties: Array<any>, controls: { [key: string]: FormControl }, quote: any) {
    // 获取controls中所有tabs中对应的所有日期控件数据项与子表控件
    const { tabsItem, sheetItem } = this.getTabsAllDateItem(controls)
    let source: any = ""
    properties.forEach((proper: any) => {
      if (controls[proper.code]) {
        //数据项在主表中
        source = controls[proper.code]
        switch (proper.propertyType) {
          case schema.DataItemType.Date:
            if (source && source.options.defaultValue === "dataItemDefault") {
              source.options.dataItemDefault = proper.defaultValue
            }
            break
          case schema.DataItemType.Sheet:
            if (source) {
              this.handleSheetDataItem(proper, source, quote)
            }
            break
          case schema.DataItemType.RelevanceForm:
            if (source) {
              this.mergeQuoteAndMappings(source, quote)
            }
            break
        }
      } else if (proper.propertyType === schema.DataItemType.Date) {
        //数据项在tab控件中
        source = tabsItem.find((t: any) => t.key === proper.code)
        if (source && proper.code === source.key && source.options.defaultValue === "dataItemDefault") {
          source.options.dataItemDefault = proper.defaultValue
        }
      } else if (proper.propertyType === schema.DataItemType.Sheet) {
        source = sheetItem.find((t: any) => t.key === proper.code)
        if (source) {
          this.handleSheetDataItem(proper, source, quote)
        }
      } else if (proper.propertyType === schema.DataItemType.RelevanceForm) {
        source = tabsItem.find((t: any) => t.key === proper.code)
        if (source) {
          this.mergeQuoteAndMappings(source, quote)
        }
      }
    })
    return controls
  }

  // 把关联保单中的映射配置与字段应用配置合并
  static mergeQuoteAndMappings(source: any, list: Array<any>, sheet?: any) {
    let mappings: any = {}
    if (source.options.mappings) {
      let mappingStr = source.options.mappings
      if (typeof mappingStr === "object") {
        mappingStr = mappingStr.options || ""
      }
      if (mappingStr) {
        mappingStr
          .split(";")
          .filter((x: string) => x)
          .forEach((x: string) => {
            let list: Array<string> = x.split(":")
            mappings[list[1]] = list[0]
          })
      }
    }
    // 对比引用的配置和映射的配置（引用优先级高于映射）
    // 把表单数据项作为key，关联表单数据项作为value;
    // 当映射中的key与引用key相同时覆盖，达到引用优先级高于映射效果
    list.forEach((res: any) => {
      if (source.key === res.relativePropertyCode) {
        if (sheet) {
          mappings[`{${sheet.schemaCode}.${res.code}}`] = res.relativeCode
        } else {
          mappings[`{${res.code}}`] = res.relativeCode
        }
      }
    })
    let result: Array<string> = []
    for (let key in mappings) {
      result.push(`${mappings[key]}:${key}`)
    }
    source.options.mappings = result.join(";")
  }

  static handleSheetDataItem(proper: any, source: any, list: Array<any>) {
    proper.subSchema.properties.forEach((sheetPro: any, index: number) => {
      if (sheetPro.propertyType === schema.DataItemType.Date) {
        let data: any = source.columns.find((s: any) => s.key === sheetPro.code)
        if (data && data.options.defaultValue === "dataItemDefault") {
          data.options.dataItemDefault = sheetPro.defaultValue
        }
      } else if (sheetPro.propertyType === schema.DataItemType.RelevanceForm && source.columns) {
        let data: any = source.columns.find((s: any) => s.key === sheetPro.code)
        data && this.mergeQuoteAndMappings(data, list, sheetPro)
      }
    })
  }

  static getTabsAllDateItem(controls: { [key: string]: FormControl }) {
    const tabsItem: Array<any> = []
    const sheetItem: Array<any> = []
    for (let key in controls) {
      if (controls[key].type === FormControlType.Tabs) {
        let loop: any = [controls[key]]
        while (loop.length) {
          let _tabs: any = loop.shift()
          for (let _panel of _tabs.panels) {
            for (let _ctrlKey of Object.keys(_panel.controls)) {
              let _ctrl: any = _panel.controls[_ctrlKey]
              if (_ctrl.type === FormControlType.Sheet) {
                sheetItem.push(_ctrl)
                _ctrl.columns.forEach((subItem: any) => {
                  tabsItem.push(subItem)
                })
              } else if (_ctrl.type === FormControlType.Tabs) {
                loop.push(_ctrl)
              } else {
                tabsItem.push(_ctrl)
              }
            }
          }
        }
      }
    }
    return {
      tabsItem,
      sheetItem
    }
  }

  static convertDesign(controls: { [key: string]: FormControl }, layout: string[][]) {
    const groupIndexs: number[] = []
    const formControls: FormControl[] = []
    for (const c in controls) {
      formControls.push(controls[c])
    }

    const tabsControlKeys: string[] = []

    const isTabsRR = (c: schema.FormControl) => {
      const is = c.type === FormControlType.ReverseRelevance && c.options.listDisplayMode === schema.ListDispalyMode.Tabs

      return is
    }

    const spliceLayout = (vector: string[][], keys: string[]) => {
      if (keys.length > 0 && vector.length > 0) {
        for (let i = vector.length - 1; i >= 0; i--) {
          if (vector[i].length === 1 && keys.indexOf(vector[i][0]) > -1) {
            vector.splice(i, 1)
          }
        }
      }
    }

    const tabsList = formControls.filter(c => {
      const is = isTabsRR(c)
      if (is) {
        tabsControlKeys.push(c.key)
      }
      return is
    })

    spliceLayout(layout, tabsControlKeys)

    const spliceTabsPanelLayout = (list: FormControl[]) => {
      list
        .filter(c => c.type === schema.FormControlType.Tabs)
        .forEach(c => {
          const tabs = c as schema.FormTabs
          tabs.panels.forEach(panel => {
            const keys: string[] = []

            const panelControls = Object.keys(panel.controls).map(k => panel.controls[k])

            panelControls.forEach(cc => {
              if (isTabsRR(cc)) {
                keys.push(cc.key)
                delete panel.controls[cc.key]
                tabsList.push(cc)
              }
            })

            spliceLayout(panel.layout, keys)

            spliceTabsPanelLayout(panelControls)
          })
        })
    }

    spliceTabsPanelLayout(formControls)

    const reverseRelevanceArr = tabsList.map((c, index) => {
      return {
        code: index + 1,
        name: c.options.name,
        isReverseRelevanceTab: true
      }
    })

    layout.forEach((row, i) => {
      if (Array.isArray(row) && row.length === 1 && controls[row[0]] && controls[row[0]].type === FormControlType.Group) {
        groupIndexs.push(i)
      }
    })

    const mapAndFilter = (row: string[]) => {
      const span = 24 / row.length
      return row
        .map(k => {
          const c = controls[k]
          if (c) {
            ;(c as any).span = span
          }
          return c
        })
        .filter(c => !!c)
    }

    let rendererControls: RendererLayoutControl[] = []
    if (groupIndexs.length > 0) {
      groupIndexs.push(layout.length)
      if (groupIndexs[0] > 0) {
        layout
          .slice(0, groupIndexs[0])
          .map(mapAndFilter)
          .forEach(row => rendererControls.push(FormRendererHelper.buildRow(row)))
      }
      groupIndexs.forEach((idx, i) => {
        if (i === groupIndexs.length - 1) {
          return
        }
        const designControl = controls[layout[idx][0]]

        const children = layout
          .slice(idx + 1, groupIndexs[i + 1])
          .map(mapAndFilter)
          .map(row => FormRendererHelper.buildRow(row))

        const group: DesignLayoutControl = Object.assign(
          {
            nodeName: "a-group-title",
            children
          },
          designControl
        )

        rendererControls.push(group)
      })
    } else {
      rendererControls = layout.map(mapAndFilter).map(row => FormRendererHelper.buildRow(row))
      // return rendererControls;
    }
    if (tabsList.length > 0) {
      // flag-
      reverseRelevanceArr.unshift({ name: "表单详情", code: 0, isReverseRelevanceTab: true })
      const tabs: any = {
        nodeName: "a-tabs",
        children: [],
        props: reverseRelevanceArr,
        class: "reverse-relevance-tabs"
      }
      // reverse-relevance-tabs

      const formDetail = {
        nodeName: "a-tabs-panel",
        children: rendererControls,
        tabsName: "表单详情",
        id: "-1"
      }
      tabs.children.push(formDetail)

      tabsList.forEach(res => {
        const pane = {
          nodeName: "a-tabs-panel",
          children: [res],
          tabsName: res.options.name,
          id: res.key
        }
        tabs.children.push(pane)
      })
      return [tabs]
    }
    return rendererControls
  }

  /**
   * 将表单设计器数据合成渲染器控件树
   * @param controls 表单设计器控件对象
   * @param layout 表单设计器布局
   * @param value 表单数据对象
   * @param permissions 表单数据权限
   */
  static synthetize(
    // controls: { [key: string]: FormControl },
    // layout: string[][],
    controls: RendererFormControl[],
    value?: { [key: string]: any },
    permissions?: { [key: string]: FormDataPermission },
    setDefaultValue?: boolean
  ) {
    if (value) {
      FormRendererHelper.mergeValue(controls, value, setDefaultValue)
    }

    const setProperty = (c: RendererFormControl, obj: any, type: boolean = true) => {
      // if (obj.e) {
      c.writable = obj.e
      // }
      // 当子表的是否编辑的属性为false，子表中的元素应为不可写状态
      if (!type) {
        c.writable = type
      }

      // 表单不可见优先级最高
      if (obj.v !== undefined && c.options.visible) {
        c.options.visible = obj.v
      }

      // if (obj.r) {
      c.required = obj.r
      // }
    }

    if (permissions) {
      Object.keys(permissions).forEach(k => {
        const c = controls.find(x => x.key === k)
        if (!c) {
          return
        }

        const obj = permissions[k]
        setProperty(c, obj)
        const sheet = c as any as FormSheet
        if (c.type === FormControlType.Sheet && sheet.columns) {
          if (obj.subDataPermission) {
            for (const item of obj.subDataPermission) {
              const col = sheet.columns.find(x => x.key === item.propertyCode)
              if (col) {
                setProperty(col as any, item, c.options.editable)
              }
            }
          } else {
            // for (const col of sheet.columns) {
            //     setProperty(col as any, obj);
            // }
          }
        }
      })
    }
  }

  static mergeValue(controls: RendererFormControl[], values: { [key: string]: any }, setDefaultValue?: boolean) {
    controls.forEach(control => {
      control.writable = true

      let val = values[control.key]

      if (!control.options) {
        return
      }

      if (val === undefined) {
        if (!setDefaultValue) {
          return
        }

        val = FormBuilderHelper.defaultValueOf(control)
      }

      if (control.type === FormControlType.Sheet) {
        ;(control as any).value = val
      } else {
        ;(control as any).value = val
      }
    })
  }

  static buildRow(controls: FormControl[]): RendererLayoutControl {
    // 7771
    const children = controls.map(c => FormRendererHelper.buildCol(c))
    const nodeName = "a-row"
    return {
      nodeName,
      children
    }
  }

  static buildCol(control: FormControl) {
    const span = (control as any).span ? (control as any).span : 24
    ;(control as any).edit = false
    let children: any[] = []
    if (control.type === FormControlType.ReverseRelevance && control.options.listDisplayMode === schema.ListDispalyMode.Tabs) {
      children = []
    } else if (control.type === FormControlType.Tabs) {
      children = [FormRendererHelper.buildTabs(control as schema.FormTabs)]
    } else {
      // 判断当前是否存在英文，如果英文是中文，做一次映射
      if (control && (control as any).name_i18n && (control as any).name_i18n.en) {
        // @ts-ignore
        control.options.name_i18n.en = zhToEn[control.options.name] || control.options.name
      } else {
        // @ts-ignore
        let enName: string = zhToEn[control.options.name] || control.options.name
        if (control.options.name_i18n && control.options.name_i18n.en) {
          enName = control.options.name_i18n.en
        }
        control.options.name_i18n = {
          en: enName
        }
      }
      children = [control]
    }
    const nodeName = "a-col"
    return {
      nodeName,
      span,
      children
    }
  }

  static buildTabs(tabs: schema.FormTabs) {
    const mobileTitles: any[] = []

    const children = (tabs.options as schema.TabsOptions).heads.map((head, index) => {
      const panel = tabs.panels.find(h => h.key === head.key)
      if (!panel) {
        throw new Error("Tabs panel not found")
      }

      const tabsName = head ? head.title : ""
      const tabsKey = head ? head.key : ""

      const rows = FormRendererHelper.convertDesign(panel.controls, panel.layout)

      mobileTitles.push({
        code: index,
        name: tabsName,
        key: tabsKey
      })

      return {
        id: panel.key,
        nodeName: "a-tabs-panel",
        children: rows,
        tabsName
      }
    })

    return {
      nodeName: "a-tabs",
      props: mobileTitles,
      options: tabs.options,
      type: tabs.type,
      key: tabs.key,
      children
    }
  }

  static buildTabsPanel(tabs: schema.FormTabs) {}

  static findFormControl(controls: RendererControl[], formControls: RendererFormControl[]) {
    controls.forEach(c => {
      const fc = c as RendererFormControl

      if (
        fc.type &&
        fc.type !== FormControlType.Html
        // && fc.type !== FormControlType.Tabs
        // && fc.type !== FormControlType.Group
        // &&      fc.type !== FormControlType.Title
        // && fc.type !== FormControlType.Description
      ) {
        formControls.push(fc)
      }

      if ((fc as any).children) {
        this.findFormControl((fc as any).children, formControls)
      }
    })
    // for (const c of controls) {

    // }
  }

  static buildController(controls: RendererControl[]) {
    const formControls: RendererFormControl[] = []

    this.findFormControl(controls, formControls)

    if (formControls.length === 0) {
      return
    }

    const opts: any = {}

    for (const control of formControls) {
      const c = control as RendererFormControl
      const opt = FormBuilderHelper.buildOptionsOf(c)
      opts[c.key] = opt
    }
    const formGroup = FormBuilder.build(opts)
    // for (const control of formControls) {
    //   if (control.type !== FormControlType.Sheet) {
    //     (control as any).controller = formGroup.findChild(control.key);
    //   }
    // }
    return formGroup
  }

  static render(h: Function, control: RendererControl, mobile: boolean, vm?: any): any {
    let opts: any = {
      props: {
        control: control
      },
      attrs: {}
    }

    if ((control as any).type) {
      const className = FormBuilderHelper.getClass((control as any).type)
      if (className) {
        opts.class = [className]
      }
    }

    if (control.style) {
      opts.attrs.style = control.style
    }

    if (control.class) {
    }

    if (control.id) {
      opts.attrs.id = control.id
    }

    const children = (control as any).children
    if (Array.isArray(children)) {
      const nodes = (control as RendererLayoutControl).children.map(c => FormRendererHelper.render(h, c, mobile, vm))

      switch (control.nodeName) {
        case "a-row":
          const allSystem = children
            .map((col: RendererLayoutControl) => col.children)
            .every(arr => {
              return arr.every(c => FormRendererHelper.isSystem((c as RendererFormControl).type))
            })

          // 判断是否为系统拥有者组件
          const isOwnerSys = children
            .map((col: RendererLayoutControl) => col.children)
            .every(arr => {
              return arr.every(c => FormRendererHelper.isOwner((c as RendererFormControl).type, (c as RendererFormControl).key))
            })

          if (children.length > 0) {
            const type = (children.map((col: RendererLayoutControl) => col.children)[0][0] as any).type

            if (type === FormControlType.Title) {
              opts.class = ["form-title-flex"]
            }
          }

          const list = children.map((col: RendererLayoutControl) => col.children)

          let visible = false
          list.forEach((l: any) => {
            if (Array.isArray(l)) {
              l.forEach((i: any) => {
                //区分部分控件没有visible 属性
                if (i.controller && i.controller.display) {
                  visible = true
                }
              })
            } else {
              if (l.controller && l.controller.display) {
                visible = true
              }
            }
          })

          if (allSystem || isOwnerSys) {
            opts.class = {
              dashed: true,
              "system-info-box": true
            }
          }

          if (!visible) {
            opts.class = {
              "not-visible-border": true
            }
          }

          return h("form-row", opts, nodes)

        case "a-col":
          if (mobile) {
            ;(opts.props as any).span = 24
          }
          if (children.length === 1 && children[0].options) {
            const first = children[0]
            const v = first.options.visible
            if ((v !== undefined && Boolean(v) === false) || (first.controller && !first.controller.display)) {
              ;(opts.props as any).span = 0
            }
          }
          return h("form-col", opts, nodes)

        case "a-group-title":
          if (!mobile) {
            if (!opts.class) {
              opts.class = {}
            }
            opts.class.xl = true
          }
          opts.props.isMobile = mobile
          return h("form-group", opts, nodes)

        case "a-tabs":
          ;(opts.props as any).itemList = (control as any).props
          if ((control as any).class) {
            opts.class = [(control as any).class]
          }
          if (children.length > 0) {
            if ((control as any).options && (control as any).options.tabDefaultValue) {
              opts.props.defaultActiveKey = (control as any).options.tabDefaultValue
            } else {
              opts.props.defaultActiveKey = children[0].id
            }
          }
          return h("form-tabs", opts, nodes)

        case "a-tabs-panel":
          opts.attrs.tab = control.tabsName
          opts.attrs.forceRender = true
          opts.key = control.id
          opts.forceRender = true

          if (mobile) {
            return h("h3-swiper-item", opts, [h("div", [h("div", vm.$slots.default), ...nodes])])
          } else {
            return h("a-tab-pane", opts, nodes)
          }

        default:
          return h(control.nodeName, opts, nodes)
      }
    } else {
      const c = control as any
      if (c.options) {
        return h("control-adapter", opts)
      } else {
        if (control.nodeName && control.nodeName !== "#text") {
          if (control.value) {
            opts.attrs.value = control.value
          }
          return h(control.nodeName, opts, [control.value])
        } else {
          return h("span", [control.value])
        }
      }
    }
  }

  static getErrorMessage(control: RendererFormControl, errCode: FormControlErrorCodes, locale: string) {
    const label = ControlHelper.getControlLabel(control, locale)
    let { status, errMsg } = getVerifyError(control) // 数值类型 控件 错误检测
    if (status) return errMsg
    switch (errCode) {
      case FormControlErrorCodes.Required:
        const selectTypeControl = [
          FormControlType.Radio,
          FormControlType.Checkbox,
          FormControlType.Dropdown,
          FormControlType.DropdownMulti,
          FormControlType.RelevanceForm,
          FormControlType.RelevanceFormEx,
          FormControlType.Address,
          FormControlType.Date,
          FormControlType.Time,
          FormControlType.StaffSelector,
          FormControlType.StaffMultiSelector,
          FormControlType.DepartmentSelector,
          FormControlType.DepartmentMultiSelector
        ]
        if (selectTypeControl.includes(control.type)) {
          return "请选择正确内容"
          return (window as any)["globalI18n"].t("cloudpivot.form.renderer.errorCode.select", {
            label
          })
          // return `请选择${label}`;
        }
        if (label === "数值") {
          return "请输入正确内容"
        }
        return (window as any)["globalI18n"].t("cloudpivot.form.renderer.errorCode.input", {
          label
        })
      // return `请输入${label}`;

      case FormControlErrorCodes.Pattern:
        const lang: string = localStorage.getItem("locale") || "zh"

        let msg = ""
        const regexpText = (control.options as any).regexpText
        if (regexpText) {
          try {
            const langObj: any = JSON.parse(regexpText)
            msg = langObj[lang]
          } catch {
            msg = regexpText
          }
        }
        return msg

      case FormControlErrorCodes.Min:
        return (window as any)["globalI18n"].t("cloudpivot.form.renderer.errorCode.min", {
          label
        })
      case FormControlErrorCodes.Max:
        return (window as any)["globalI18n"].t("cloudpivot.form.renderer.errorCode.max", {
          label
        })
      case FormControlErrorCodes.MinCount:
        return (window as any)["globalI18n"].t("cloudpivot.form.renderer.errorCode.minCount", {
          label,
          num: control.controller ? (control.controller as any).minCount : control.options.minCount
        })
      case FormControlErrorCodes.MaxCount:
        return (window as any)["globalI18n"].t("cloudpivot.form.renderer.errorCode.maxCount", {
          label,
          num: control.controller ? (control.controller as any).maxCount : control.options.maxCount
        })
    }
  }

  static isSystem(type: FormControlType) {
    return type >= FormControlType.SequenceNo && type <= FormControlType.SystemOther
  }

  static isOwner(type: FormControlType, key: string) {
    return (type >= FormControlType.SequenceNo && type <= FormControlType.SystemOther) || key === "owner"
  }
}

// 数值类型 校验规则 错误提示
function getNumberVerifyError(control: any) {
  let status = false,
    errMsg = ""
  // 只检测数值类型
  // if (control.type !== schema.FormControlType.Number) {
  //   return { status, errMsg };
  // }
  let verifyFormula = control.options.verifyFormula // 获取校验规则 字段
  if (!verifyFormula) return { status, errMsg }
  let verifyObj: any = {}
  if (isJSONString(verifyFormula)) {
    verifyObj = JSON.parse(verifyFormula)
  } else {
    let arr = verifyFormula.split("_")
    for (let item of arr) {
      let [key, val] = item.split(":")
      verifyObj[key] = val
    }
  }
  if (+verifyObj.type === 1) {
    if (verifyObj.rule === "~") {
      if (("" + verifyObj.lInput).length && ("" + verifyObj.rInput).length) {
        return _getVerifyPrompt(verifyObj)
      }
    } else {
      if (("" + verifyObj.input).length) {
        return _getVerifyPrompt(verifyObj)
      }
    }
  } else {
    if (verifyObj.rule === "~") {
      if (verifyObj.rSelect && verifyObj.lSelect) {
        return _getVerifyPrompt(verifyObj)
      }
    } else {
      if (verifyObj.select) {
        return _getVerifyPrompt(verifyObj)
      }
    }
  }
  return { status, errMsg }
}
function isJSONString(str: string) {
  try {
    if (typeof JSON.parse(str) == "object") {
      return true
    }
  } catch (e) {}
  return false
}
// 日期类型 校验规则 错误提示
function getDateVerifyError(control: any) {
  let status = false,
    errMsg = ""
  let verifyFormula = control.options.verifyFormula // 获取校验规则 字段
  if (!verifyFormula) return { status, errMsg }
  let format = control.options.format1
  let verifyObj: any = {}
  if (isJSONString(verifyFormula)) {
    verifyObj = JSON.parse(verifyFormula)
  } else {
    let arr = verifyFormula.split("_")
    for (let item of arr) {
      if (/defaultPrompt/.test(item)) {
        verifyObj["defaultPrompt"] = item.slice("defaultPrompt:".length)
      } else if (/prompt/.test(item)) {
        verifyObj["prompt"] = item.slice("prompt:".length)
      } else {
        let [key, val] = item.split(":")
        verifyObj[key] = val
      }
    }
  }
  if (+verifyObj.type === 1) {
    if (verifyObj.rule === "~") {
      if (verifyObj.lDate && verifyObj.rDate) {
        return _getVerifyPrompt(verifyObj)
      }
    } else {
      if (verifyObj.date) {
        return _getVerifyPrompt(verifyObj)
      }
    }
  } else {
    if (+verifyObj.day === 1) {
      if (verifyObj.rule === "~") {
        if (("" + verifyObj.lInput).length && ("" + verifyObj.rInput).length) {
          return _getVerifyPrompt(verifyObj)
        }
      } else {
        if (("" + verifyObj.input).length) {
          return _getVerifyPrompt(verifyObj)
        }
        if (("" + verifyObj.prompt).length) {
          return _getVerifyPrompt(verifyObj)
        }
      }
    } else {
      if (verifyObj.rule === "~") {
        if (verifyObj.lSelect && verifyObj.rSelect) {
          return _getVerifyPrompt(verifyObj)
        }
      } else {
        if (verifyObj.select) {
          return _getVerifyPrompt(verifyObj)
        }
      }
    }
  }
  return { status, errMsg }
}
// 获取提示信息
function _getVerifyPrompt(verifyObj: any) {
  console.log("verifyObj", verifyObj)
  return {
    status: true,
    errMsg: verifyObj.prompt ? verifyObj.prompt : verifyObj.defaultPrompt
  }
}

// 24迭代 校验规则 错误提示
const getVerifyErrorFn = {
  [schema.FormControlType.Number](control: any) {
    console.error("数值校验错误", control)
    return getNumberVerifyError(control)
  },
  [schema.FormControlType.Date](control: any) {
    console.error("日期校验错误", control)
    return getDateVerifyError(control)
  }
}

function getVerifyError(control: any) {
  if (control.type !== schema.FormControlType.Number && control.type !== schema.FormControlType.Date) {
    return { status: false, errMsg: "" }
  }
  return getVerifyErrorFn[control.type as schema.FormControlType.Number | schema.FormControlType.Date](control)
}
