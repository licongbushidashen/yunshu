import "vue-router"
import "vue-i18n"
import { Vue, Provide } from "vue-property-decorator"
import { formApi, workflowApi, form, workflow, listApi, bizpropertyApi } from "@cloudpivot/api"
import * as platform from "@cloudpivot/platform"
import { utils } from "@cloudpivot/common"
import cloneDeep from "lodash/cloneDeep"
import { CompareVersion } from "@cloudpivot/form/utils"
import { components, FormControlApiHandler } from "../../renderer"
import { dateFormatter, UploadFile, UploadStatus } from "../../renderer"
import { FormControlType, RendererControl, RendererFormControl, DropdownOptions, FormSheet } from "../../schema"
import * as schema from "../../schema"
import * as renderer from "../../renderer"
import { FormControlOptionsService } from "../../renderer/services"
import { FormActionModalOptions, FormActionModal, FormActionButton } from "../form-action-modal"
import { LifecycleHookNames, LifecycleHooks, parseScript } from "../lifecycle"
import { FormAction } from "../form-action"
import { FormDetailService } from "../services/form-detail-service"
import axios from "axios"
import { RadioControl, ValueControl, RowChangeType } from "h3-forms"
import moment from "moment"

import * as dd from "dingtalk-jsapi"
import "moment/locale/zh-cn"

// ie11 兼容
if ((window as any).Proxy === undefined) {
  require("../proxy.runtime")
  // (window as any).Proxy = ProxyPolyfill;
}
interface Nodes {
  activityCode: string
  activityName: string
  workItemsType: WorkItemsType
  selected: boolean
  id: string
}
enum WorkItemsType {
  // 代办
  WorkItem = 0,
  // 已办
  WorkItemFinished = 1,
  // 待阅
  CirculateItem = 2,
  // 已阅
  CirculateItemFinished = 3
}

export class FormDetailProxyHandler implements ProxyHandler<FormDetail> {
  private _map: any = {}
  get(target: FormDetail, p: PropertyKey, receiver: any): any {
    if (p === "submit") {
      return () => this.doAction(target, p)
    }
    if (p === "doAction") {
      return (code: string) => this.doAction(target, code)
    }
    switch (p) {
      case "$confirm":
      case "$router":
      case "$message":
      case "$i18n":
      case "actions":
      case "workflowInfo":
      case "submited":
      case "currentUser":
      case "isNew":
      case "value":
      case "errors":
      case "validate":
      case "axios":
        return (target as any)[p]
      case "get":
        return (target as any)[p].bind(target)
    }
    if (typeof p === "string") {
      let api = this._map[p]
      if (api) {
        return api
      }
      const control = target.formRenderer.formControlMap[p]
      if (control) {
        if (!control.controller) {
          control["controller"] = target.formRenderer.controller.children[control.key]
        }
        api = new Proxy(control, new FormControlApiHandler())

        this._map[p] = api

        return api
      }
    }
  }

  doAction(target: FormDetail, code: string) {
    const ac = target.actions.find(a => a.code === code)
    if (ac) {
      return target.onAction(ac)
    }
    target.$message.error(`没有${code}权限`)
  }
}

export abstract class FormDetail extends Vue {
  /**
   * 表单按钮列表
   */
  actions: FormActionButton[] = []

  /**
   * 表单渲染器所属数据
   */
  controls: RendererControl[] = []

  formControls: RendererFormControl[] = []

  /**
   * 后端API返回的表单数据
   */
  formObj: form.FormObject = {} as any

  /**
   * 流程表单节点
   */
  nodes: Nodes[] = []

  /**
   * 根据节点不同相应不同的参数
   */
  nodesParams: any = null

  /**
   * 转办说明
   */
  comment = ""

  /**
   * 流程实例ID
   */
  workflowInstanceId = ""

  workItemId: string = ""

  workflowVersion: number = 0
  /**
   * 表单渲染器审批意见控件
   * 移动端的审批意见需要特别处理
   */
  approval: RendererFormControl = "" as any

  /**
   * 拥有者选人控件
   */
  owner?: RendererFormControl

  /**
   * 事件订阅函数列表
   */
  hooks?: LifecycleHooks

  /**
   * 自定义表单API代理
   */
  proxy?: any

  /**
   * 加载自定义表单的iframe
   */
  iframe?: HTMLIFrameElement
  /**
   * 表单的数据模型信息
   */
  dataModalList: any[] = []

  formSystemVersion: any = null

  /**
   * URL query参数
   */
  relevanceQuery?: { [key: string]: string }

  /**
   * 是否进入编辑状态
   */
  inEdit = false

  formVersion: any = "" // 流程表单版本号。用于锁表

  /**
   * 表单按钮操作后页面跳转处理
   * @param ac
   * @param res
   */
  abstract goto(ac: FormActionButton, res: form.HttpResponse<any>): Promise<void>

  /**
   * 表单校验
   */
  abstract validate(onlyUpload?: boolean): boolean

  /**
   * 消息组件对象
   */
  abstract $message: any

  /**
   * 消息组件对象
   */
  abstract $confirm: any

  /**
   * 定时器
   */
  abstract timer: any

  /**
   * 是否是移动端
   */
  abstract isMobile: boolean

  get formRenderer() {
    return this.$refs.formRenderer as any
  }

  get isWorkflowForm() {
    return !!this.formObj.workflowCode
  }

  get version() {
    if (this.$store && this.$store.state && this.$store.state.config) {
      return this.$store.state.config.systemVersion
    } else {
      return "0"
    }
  }

  get workflowInfo() {
    if (!this.isWorkflowForm || !this.formObj) {
      return null
    }
    return {
      code: this.formObj.workflowCode,
      instanceId: this.formObj.workflowInstanceId,
      instanceName: this.formObj.instanceName,
      tokenId: this.formObj.workflowTokenId,
      itemId: this.formObj.workItemId,
      version: this.formObj.workflowVersion,
      activityCode: this.formObj.activityCode,
      activityName: this.formObj.activityName
    }
  }

  @Provide()
  getScrollEl() {
    return this.$el
  }

  /**
   * 是否已提交过
   */
  get submited() {
    if (!this.isWorkflowForm || !this.formObj) {
      return null
    }
    if (this.isWorkflowForm) {
      return !!this.formObj.workflowInstanceIsSubmit
    }
    return this.formObj.bizObject.data.sequenceStatus === "COMPLETED"
  }

  get currentUser() {
    const user = renderer.StaffSelectorControl.service.getCurrentUser() as any
    return user
  }

  get formPath() {
    if (this.hooks && this.hooks.controller) {
      return this.hooks.controller
    }
    return undefined
  }

  get isNew() {
    if (this.formObj && this.formObj.bizObject) {
      return (
        this.formObj.bizObject.sequenceStatus === "" &&
        !["readWorkitem", "unfinishedWorkitem"].includes(this.$route.query.workitemType as string)
      )
    }
    return false
  }

  get isDraft() {
    if (this.formObj && this.formObj.bizObject) {
      return (
        this.formObj.bizObject.sequenceStatus === "DRAFT" &&
        !["readWorkitem", "unfinishedWorkitem"].includes(this.$route.query.workitemType as string)
      )
    }
    return false
  }

  get isWorkFlowSheet() {
    const params: any = this.$route.query
    return params.isWorkFlow && params.isWorkFlow === "true"
  }

  get value() {
    const ctrl = this.getFormCtrl()
    return ctrl.value
  }

  get errors() {
    const ctrl = this.getFormCtrl()
    return ctrl.errors
  }

  get isViewMode() {
    let params = this.$route.query
    if (params.workflowInstanceId) {
      // 业务表单
      return false
    }
    if (params.objectId) {
      return false
    }
    return true
  }

  get(key: string) {
    const control = this.formRenderer.formControlMap[key]
    if (control) {
      if (platform.IS_IE) {
        control.ctrl = true
        control.items = true
      }
      return new Proxy(control, new FormControlApiHandler())
    }
    return undefined
  }

  /**
   * 获取表单控制器
   */
  getFormCtrl() {
    if (this.formRenderer) {
      return this.formRenderer.controller
    }
  }

  isNewForm() {
    if (this.formObj && this.formObj.bizObject) {
      return this.formObj.bizObject.sequenceStatus === ""
    }
    return false
  }

  getLocale(path: string) {
    return this.$t(`cloudpivot.form.runtime.${path}`).toString()
  }
  /**
   * 根据不同节点加载不同表单
   * @param nodes
   */
  getNodesParams(nodes: string) {
    const theNode = this.nodes.find(res => res.activityCode === nodes)
    let str = ""
    if (theNode) {
      switch (theNode.workItemsType) {
        case WorkItemsType.WorkItem:
          str = "unfinishedWorkitem"
          // str = '/workflow-center/my-unfinished-workitem';
          break
        case WorkItemsType.WorkItemFinished:
          str = "finishedWorkitem"
          // str = '/workflow-center/my-finished-workitem';
          break
        case WorkItemsType.CirculateItem:
          str = "unreadWorkitem"
          // str = '/workflow-center/my-unread-workitem';
          break
        default:
          str = "readWorkitem"
          // str = '/workflow-center/my-read-workitem';
          break
      }
    }
    if (str && theNode) {
      this.nodesParams = {
        return: str,
        workitemId: theNode.id
      }
    }
  }

  /**
   * 重新加载数据
   */
  reload() {
    this.clean()
    this.load()
  }

  /**
   * 清理
   */
  clean(excludeNode?: boolean) {
    this.formObj = {} as any
    this.comment = ""
    this.controls = []
    this.actions = []
    this.proxy = null
    if (excludeNode) {
      return
    }
    this.nodesParams = null
    this.nodes = []
  }

  /**
   * 查找上传控件按上传状态
   */
  findUploadBy(status: UploadStatus) {
    const controls = this.formRenderer.findFormControls()

    const filterFunc = (c: RendererFormControl) => c.type === FormControlType.Attachment || c.type === FormControlType.Image

    let control = controls.filter(filterFunc).find((c: any) => {
      if (!c.controller) {
        return false
      }
      const files = c.controller.value as UploadFile[]
      if (!files) {
        return false
      }
      return files.some(f => f.status === status)
    })

    if (control) {
      return control
    }

    control = controls
      .filter((c: any) => c.type === FormControlType.Sheet)
      .find((c: any) => {
        if (!this.formRenderer.controller) {
          return false
        }
        const ctrl = this.formRenderer.controller.children[c.key]
        const vals = ctrl.value
        if (!Array.isArray(vals) || vals.length === 0) {
          return false
        }
        const uploadKeys = (c as any).columns.filter(filterFunc).map((col: any) => col.key) as string[]
        if (uploadKeys.length === 0) {
          return false
        }

        return vals.some(row => {
          return uploadKeys.some(k => row[k] && row[k].some((f: UploadFile) => f.status === status))
        })
      })

    return control
  }

  async getWorkFlowNodes() {
    const params: any = this.$route.query
    const workflowInstanceId: string = params.workflowInstanceId
    const res = await formApi.getWorkFlowNode(workflowInstanceId)
    if (res.errcode === 0 && res.data) {
      return res.data
    }
    return []
  }

  closePopDetail() {
    if (window.top !== window.self) {
      window.parent.postMessage("close", "*")
    } else {
      /**
       * 钉钉浏览器不支持close(),单独处理
       */
      if (dd.biz && (dd.android || dd.ios)) {
        dd.biz.navigation.goBack({
          onSuccess: () => {
            console.log("关闭成功!")
          },
          onFail: () => {
            console.error("关闭失败")
          }
        })
      } else if (dd && dd.pc && !this.isMobile) {
        // pc钉钉
        this.back()
      }
    }
  }

  back() {
    const url = this.$route.query.return as string
    if (url) {
      this.$router
        .push({
          path: url
        })
        .catch((err: any) => {
          err
        })
    } else {
      this.$router.go(-1)
    }
  }

  stringToBoolean(changePublishJson: any[]) {
    Object.values(changePublishJson).forEach((el: any) => {
      // 导入文件，下面changeArr数据里面的值会修改为字符串类型，实际需要布尔类型的值
      let changeArr = ["isScan", "readonlyFormula", "visible", "multi", "displayEmpty", "noRepeat"]
      changeArr.forEach(item => {
        if (el.options[item] === "false") {
          el.options[item] = false
        }
        if (el.options[item] === "true") {
          el.options[item] = true
        }
      })

      if (el.type === 201) {
        // 子表
        el.columns.forEach((column: any) => {
          changeArr.forEach(item => {
            if (column.options[item] === "false") {
              column.options[item] = false
            }
            if (column.options[item] === "true") {
              column.options[item] = true
            }
          })
        })
      }
    })
  }

  /**
   * 表单加载入口
   */
  async load(edit?: boolean) {
    let params: any = cloneDeep(this.$route.query)
    delete params.useData
    this.workflowInstanceId = (params.workflowInstanceId as string) || ""
    const relevanceQuery: any = Object.assign({}, params)
    delete relevanceQuery.return
    delete relevanceQuery.startWorkflowCode
    delete relevanceQuery.workItemId
    delete relevanceQuery.workitemId
    delete relevanceQuery.workflowInstanceId
    delete relevanceQuery.objectId
    delete relevanceQuery.schemaCode
    delete relevanceQuery.sheetCode
    delete relevanceQuery.ssc
    delete relevanceQuery.isWorkFlow
    this.relevanceQuery = relevanceQuery as any
    const keys = Object.keys(relevanceQuery)
    if (keys.length > 0) {
      params.relevanceInfo = JSON.stringify(relevanceQuery)
    }
    if (edit || this.$route.query.edit || this.isViewMode) {
      // 流程表单 非编辑 不要 params.perms
      params.perms = "edit"
      this.inEdit = true
    } else {
      this.inEdit = false
    }
    if (this.nodesParams) {
      params = Object.assign({}, params, this.nodesParams)
      // params.return = this.nodesParams.return;
    }
    if (params.workitemType) {
      params.return = params.workitemType
    }
    if (params.workflowMock) {
      // 流程模拟load增加标识参数simulative
      params.simulative = true
    }
    console.log("params", params)
    // 加载数据规则
    const res: any = await formApi.load(params)

    /**
     * 根据后端要求，单独处理该类型报错
     */
    if (res && res.errcode === 550009) {
      this.$message.error(res.errmsg)
      return res
    }

    if (res && (res.errcode === 40002 || res.errcode === 601010)) {
      return res
    }
    this.formVersion = res.data.bizObject.data.version
    this.workItemId = res.data.workItemId

    if (res.data && res.data.bizSheet) {
      this.formSystemVersion = res.data.bizSheet.formSystemVersion
    }

    if (this.$store) {
      this.$store.dispatch("getFormRuleList", {
        bizSchemaCode: res.data.bizSheet.schemaCode
      })
    }

    if (res.data.formPermission.actionPermission.showCheck) {
      res.data.showCheck = true
      res.data.formPermission.actionPermission.showCheck = false
    } else {
      res.data.showCheck = false
    }
    // console.log("res =>", res);
    if (res.errcode !== 0 || !res.data) {
      let msg = ""
      switch (res.errcode) {
        case 550005:
          msg = res.errmsg || this.$t("cloudpivot.form.runtime.tip.errTips19").toString()
          this.$message.error(msg, 3)
          break
        case 550007:
          msg = this.$t("cloudpivot.form.runtime.tip.errTips14").toString()
          break
        case 550008:
          msg = this.$t("cloudpivot.form.runtime.tip.errTips15").toString()
          break
        case 550006:
          msg = this.$t("cloudpivot.form.runtime.tip.errTips16").toString()
          break
        case 550009:
          msg = this.$t("cloudpivot.form.runtime.tip.errTips17").toString()
          break
      }
      if (msg) {
        this.$message.error(msg, 3)
      }
      throw res
    }
    FormDetailService.setReplayToken(this.formPath) // 设置 replayToken
    let isNew = this.isNew
    let isWorkflow = this.workflowInfo
    let user: any = sessionStorage.getItem("user")
    if (user) {
      user = JSON.parse(user)
    }
    if (isNew || (this.inEdit && !isWorkflow)) {
      const modifier = {
        departmentId: user.departmentId,
        departments: user.departments,
        excelType: user.excelType,
        id: user.id,
        imgUrl: user.imgUrl,
        name: user.name,
        parentId: user.parentId,
        type: user.type,
        unitType: user.unitType
      }
      res.data.bizObject.data = Object.assign(res.data.bizObject.data, {
        modifier: [modifier],
        createdTime: res.data.bizObject.data.createdTime ? res.data.bizObject.data.createdTime : dateFormatter(new Date(), "YYYY-MM-DD"),
        modifiedTime: res.data.bizObject.data.modifiedTime ? res.data.bizObject.data.modifiedTime : dateFormatter(new Date(), "YYYY-MM-DD")
      })
    }
    const jsonPublished: any = JSON.parse(res.data.bizSheet.publishedAttributesJson)
    const changePublishJson: any = this.handleChangePublishJson(res.data.bizSchema, jsonPublished)
    this.stringToBoolean(changePublishJson)
    res.data.bizSheet.publishedAttributesJson = JSON.stringify(changePublishJson)
    this.formObj = res.data
    if (this.formObj.commentInfo) {
      const comment = this.formObj.commentInfo
      if (comment.originator) {
        let type = ""
        if (comment.type === 1) {
          type = "转办"
        } else if (comment.type === 2) {
          type = "协办"
        } else if (comment.type === 3) {
          type = "加签"
        } else if (comment.type === 4) {
          type = "传阅"
        }
        const msg = `${comment.originator.name}${type}给你：${comment.comment || ""}`
        this.comment = msg
      }
    }
    this.getDataModal() // 获取表单数据模型信息
    // 处理关联表单读取显示字段一直为单据号的问题
    const bizSheet = this.formObj.bizSheet
    const formData = this.formObj.bizObject.data
    console.log("formData =>", formData)
    const formDefine = this.formObj.bizSheet
    const actionObj = this.formObj.formPermission.actionPermission
    this.actions = this.getActions(Object.assign({}, actionObj))
    // 1自定义表单
    if (formDefine.sheetType === 1) {
      await this.loadCustomForm(formDefine.pcUrl)
    } else {
      await this.initSystemForm()
    }
    //获取常用审批状态
    const obj: any = {
      workitemId: res.data.workItemId,
      workflowInstanceId: res.data.workflowInstanceId
    }
    if (obj.workitemId && obj.workflowInstanceId) {
      this.getOpinionState(obj)
    }
  }

  async getOpinionState(params: any) {
    const res: any = await workflowApi.getOpinionState(params)
    if (res.errcode === 0) {
      sessionStorage.setItem("commonCommentSwitch", res.data.commonCommentSwitch)
      return
    }
    sessionStorage.setItem("commonCommentSwitch", "false")
  }

  initIframe(url: string) {
    const iframe = document.createElement("iframe")
    iframe.width = "0"
    iframe.height = "0"
    iframe.style.position = "absolute"
    iframe.style.top = "-100px"
    iframe.src = url + (url.indexOf("?") > -1 ? "&" : "?") + `t=${new Date().getTime()}`

    this.iframe = iframe

    this.$el.appendChild(iframe)

    if (iframe.contentWindow) {
      const iframeWindow = iframe.contentWindow as any
      iframeWindow.axios = axios
    }
    return iframe
  }

  /**
   * 加载自定义表单
   * @param url
   */
  async loadCustomForm(url: string) {
    try {
      const res = await axios.get(url)
    } catch {
      throw new Error("无法加载自定义表，请检查url配置")
    }

    return new Promise((resolve, reject) => {
      const _this = this
      ;(window as any).initCustomForm = (tpl: any) => {
        _this.initCustomForm(tpl)
        resolve()
      }

      this.initIframe(url)
    })
  }

  /**
   * 初始化自定义表单
   * @param tpl
   */
  async initCustomForm(tpl: any) {
    if (tpl.styles) {
      tpl.styles.forEach((s: any) => this.$el.appendChild(s))
    }

    if (tpl.scripts) {
      tpl.scripts.forEach((s: any) => this.$el.appendChild(s))
    }

    if (tpl.toolbar) {
      tpl.toolbar.forEach((x: any) => {
        x.visible = true
        x.disabled = false
        this.actions.push(x)
      })
    }

    this.hooks = tpl.customScript

    const controls = components.FormRendererHelper.convertTemplate(tpl.template)
    await this.initForm(controls)
  }

  /**
   * 初始化系统表单
   */
  async initSystemForm() {
    const formDefine = this.formObj.bizSheet
    //获取数据模型中关联表单配置的字段引用信息
    const schemaCode: any = this.formObj.bizObject.schemaCode || ""
    // 获取数据模型中关联表单配置的字段引用
    let { data, errcode, errmsg } = await formApi.getRelativeQuote({
      schemaCode
    })
    let qouteList: Array<any> = []
    if (errcode === 0) {
      qouteList = data
    }
    //处理日期控件默认值
    const jsonData: any = JSON.parse(formDefine.publishedAttributesJson)
    const formControls: any = components.FormRendererHelper.handleDataDefault(this.formObj.bizSchema.properties, jsonData, qouteList)
    console.log(formControls, "formControls")
    const layout = JSON.parse(formDefine.publishedViewJson) as string[][]
    this.handleApproval(formControls, layout)

    if (formDefine.publishedActionsJson) {
      const actions = JSON.parse(formDefine.publishedActionsJson)
      if (actions && actions.length > 0) {
        this.actions = this.actions.concat(actions)
      }
    }

    if (formDefine.publishedHtmlJson) {
      const els = JSON.parse(formDefine.publishedHtmlJson) as schema.FormElement[]
      if (els && els.length > 0) {
        const scriptEl = els.find(e => e.id === "customScript")
        if (scriptEl && scriptEl.innerHTML) {
          this.hooks = parseScript(scriptEl.innerHTML)
        }

        const tags = ["style", "script"]

        els
          .filter(el => tags.indexOf(el.tagName) > -1 && el.id !== "customScript")
          .map(el => schema.createHTMLElement(el))
          .filter(el => el !== null)
          .forEach(el => el && this.$el.appendChild(el))
      }
    }
    const controls = components.FormRendererHelper.convertDesign(formControls, layout)
    console.log(controls, "controls----")

    for (let i in formControls) {
      if (formControls[i].type === schema.FormControlType.Sheet) {
        const rowStatus: any = {
          key: "rowStatus",
          options: {
            dataItemName: "rowStatus",
            dataLinkage: "",
            defaultValue: "Unchanged",
            displayFormula: "",
            isScan: false,
            maxLength: 200,
            name: "rowStatus",
            name_i18n: "",
            noRepeat: false,
            onChange: "",
            placeholder: "",
            readonlyFormula: false,
            regexp: "",
            regexpText: "",
            requiredFormula: "",
            shortTextStitch: "",
            style: "",
            tips: "",
            visible: false,
            widgetType: "",
            width: 150
          },
          parentKey: formControls[i].key,
          required: false,
          type: 1,
          width: 150,
          writable: true
        }
        if (formControls[i].columns.find((inner: any) => inner.key !== "rowStatus")) {
          formControls[i].columns.unshift(rowStatus)
        }
      }
    }
    await this.initForm(controls)
  }

  handleChangePublishJson(soure: any, data: any) {
    const modelData = this.modelChange(cloneDeep(soure.properties))
    const ruleData: any[] = soure.bizDataRuleModels ? this.ruleChange(soure.bizDataRuleModels) : []
    for (let i in data) {
      // 清空json数据的必填规则
      // data[i] = this.cleanJsonData(data[i]);
      const modelFilter = modelData.find((o: any) => o.code === i)
      //主表数据项匹配计算规则数据需要加上schemaCode匹配
      const ruleFilter = ruleData.find((o: any) => o.propertyCode === i && o.schemaCode === soure.code)
      if (modelFilter && modelFilter.options) {
        const options = JSON.parse(modelFilter.options) || {}
        if (options && options.hasOwnProperty("format") && CompareVersion(this.version, this.formSystemVersion) === 1) {
          options["format1"] = options["format"]
        }
        delete options.defaultValue
        data[i].options = Object.assign(data[i].options, options)
      }
      if (ruleFilter && ruleFilter.options) {
        data[i].options = Object.assign(data[i].options, ruleFilter.options)
      }
      if (data[i].type === schema.FormControlType.Tabs) {
        this.changeTabs(data[i], modelData, ruleData)
      }
      if (data[i].type === schema.FormControlType.Sheet) {
        this.sheetChange(data[i], modelData, ruleData)
      }
    }
    return data
  }

  //  清空源数据配置
  cleanJsonData(data: any) {
    let updateData: any = data
    switch (data.type) {
      case 1:
      case 2:
        updateData.options.displayFormula = ""
        updateData.options.requiredFormula = ""
        updateData.options.shortTextStitch = ""
        updateData.options.noRepeat = ""
        updateData.options.maxLength = ""
        updateData.options.regexp = ""
        updateData.options.regexpText = ""
        break
      case 3:
      case 17:
        updateData.options.displayFormula = ""
        updateData.options.requiredFormula = ""
        updateData.options.shortTextStitch = ""
        updateData.options.verifyFormula = ""
        break
      case 4:
        updateData.options.displayFormula = ""
        updateData.options.requiredFormula = ""
        updateData.options.computeFormula = ""
        updateData.options.verifyFormula = ""
        break
      case 5:
      case 6:
      case 7:
        updateData.options.displayFormula = ""
        updateData.options.requiredFormula = ""
        break
      case 8:
      case 9:
      case 10:
      case 11:
      case 14:
      case 15:
      case 50:
      case 70:
        updateData.options.displayFormula = ""
        updateData.options.requiredFormula = ""
        break
      case 80:
      case 81:
      case 90:
        updateData.options.displayFormula = ""
        updateData.options.requiredFormula = ""
        updateData.options.displayField = ""
        updateData.options.mappings = ""
        break
      case 201:
        updateData.options.isEmptyRow = false
        break
      case 202: // 描述说明控件不清除显示规则
        break
      default:
        updateData.options.displayFormula = ""
        updateData.options.requiredFormula = ""
        break
    }
    return updateData
  }

  modelChange(list: any) {
    // @ts-ignore
    list.forEach(i => {
      if (i.subSchema && i.subSchema.properties) {
        // @ts-ignore
        list = list.concat(i.subSchema.properties.filter(v => !v.defaultProperty))
      }
    })
    return list
  }

  ruleChange(list: any) {
    let arr: any[] = []
    list.forEach((d: any) => {
      //修改为不去重，因为主表与子表编码可能出现重复
      d.options = d.options ? JSON.parse(d.options) : {}
      arr.push(d)
    })
    return arr
  }

  sheetChange(data: any, modelData: any, ruleData: any) {
    const rule = ruleData.find((o: any) => o.propertyCode === data.key)
    // 清空json数据的必填规则
    // data = this.cleanJsonData(data);
    // console.log(data, 'data---')
    if (rule && rule.options) {
      data.options = Object.assign(data.options, rule.options)
    }
    if (data.columns) {
      data.columns.forEach((v: any) => {
        // 清空json数据的必填规则
        // v = this.cleanJsonData(v);
        const filter = modelData.find((c: any) => c.code === v.key)
        //子表中数据项匹配计算规则数据需要增加o.schemaCode === v.parentKey，否则可能匹配到主表的数据项导致计算混乱
        const ruleFilter = ruleData.find((o: any) => o.propertyCode === v.key && o.schemaCode === v.parentKey)
        if (filter && filter.options) {
          v.options = Object.assign(v.options, JSON.parse(filter.options))
        }
        if (ruleFilter && ruleFilter.options) {
          v.options = Object.assign(v.options, ruleFilter.options)
        }
      })
    }
  }

  changeTabs(tab: any, modelData: any, ruleData: any) {
    if (tab.panels && Array.isArray(tab.panels)) {
      tab.panels.forEach((i: any) => {
        if (i.controls) {
          for (let o in i.controls) {
            if (i.controls[o].type === schema.FormControlType.Tabs) {
              this.changeTabs(i.controls[o], modelData, ruleData)
            } else if (i.controls[o].type === schema.FormControlType.Sheet) {
              //子表
              this.sheetChange(i.controls[o], modelData, ruleData)
            } else {
              const filters = modelData.find((c: any) => c.code === i.controls[o].key)
              const ruleFilter = ruleData.find((c: any) => c.propertyCode === i.controls[o].key)
              if (filters && filters.options) {
                i.controls[o].options = Object.assign(i.controls[o].options, JSON.parse(filters.options))
              }
              if (ruleFilter && ruleFilter.options) {
                i.controls[o].options = Object.assign(i.controls[o].options, ruleFilter.options)
              }
            }
          }
        }
      })
    }
  }

  /**
   * 迭代20需求
   * 将表单中的审批意见控件去除，并根据操作按钮添加固定key值的审批意见
   */
  handleApproval(controls: any, layout: string[][]) {
    layout.forEach((row, ri) => {
      row
        .map((col, ci) => {
          const c = controls[col]
          if (c && c.type === FormControlType.ApprovalOpinion) {
            return ci
          }
          return -1
        })
        .filter(i => i !== -1)
        .reverse()
        .forEach(i => row.splice(i, 1))
    })

    layout
      .map((row, i) => (row.length === 0 ? i : -1))
      .filter(i => i !== -1)
      .reverse()
      .forEach(i => layout.splice(i, 1))

    // 只要有驳回按钮就显示审批意见

    // this.actions.forEach(ac => {
    //   if(ac.code === FormAction.showCheck){
    //     // @ts-ignore
    //     this.$set(ac, 'visible', false)
    //   }
    // });
    // this.formObj
    // if (this.actions.some((ac) => ac.code === FormAction.showCheck)) {
    if (this.formObj.showCheck) {
      const key = "$approval"

      if (!this.isMobile) {
        const groupControlOpts = new schema.GroupTitleOptions()
        groupControlOpts.name = this.$t("cloudpivot.form.renderer.opinion").toString()
        const groupControl = {
          key: key + "_group",
          options: groupControlOpts,
          type: FormControlType.Group
        }

        controls[groupControl.key] = groupControl
        layout.push([groupControl.key])
      }

      const options = new schema.ApprovalOpinionOptions()
      if (this.isMobile) {
        options.visible = false
      }
      options.name = this.$t("cloudpivot.form.renderer.opinion").toString()
      options.limit = schema.UploadLimitType["10M"]

      // @ts-ignore
      options.commonCommentSwitch = this.formObj.commonCommentSwitch

      const control = {
        key,
        options,
        type: FormControlType.ApprovalOpinion,
        required: false
      }

      controls[key] = control

      this.approval = control as any

      // if (!this.isMobile) {
      //   layout.push([key]);
      // }

      layout.push([key])
    }
  }

  /**
   * 初始化表单
   * @param controls
   */
  async initForm(controls: any) {
    const formControls: RendererFormControl[] = []
    components.FormRendererHelper.findFormControl(controls, formControls)
    this.formControls = formControls
    const titleControl = formControls.find(c => c.type === FormControlType.Title)
    if (titleControl && this.formObj.instanceName) {
      titleControl.options.name = this.formObj.instanceName
    }

    const data = this.formObj.bizObject.data

    data.schemaCode = this.formObj.bizObject.schemaCode
    data.sheetCode = this.formObj.bizObject.sheetCode
    ;(window as any).axios = axios

    let tasks = this.callLifecycleHook(LifecycleHookNames.OnLoad, [
      this.formObj.bizObject.data,
      this.formObj.formPermission.dataPermissions
    ])

    if (tasks) {
      tasks = tasks.filter(r => r && r.then)
      if (tasks.length > 0) {
        const results = await Promise.all(tasks)
        if (results[0]) {
          this.formObj.bizObject.data = results[0]
        }
      }
    }

    this.toFormData(controls, this.formObj.bizObject.data)

    let useData: string = (this.$route.query.useData as string) || ""
    if (useData) {
      let oldData: any = localStorage.getItem(useData) as string
      if (oldData) {
        oldData = JSON.parse(oldData)
        delete oldData.id

        function formatData(oldData: any, isSub = false, sheetCode = "") {
          Object.keys(oldData).forEach(key => {
            let item = formControls.find((el: any) => el.key === key)
            if (isSub) {
              let sheet: any = formControls.find((el: any) => el.key === sheetCode)
              item = sheet.columns.find((el: any) => el.key === key)
            }

            // 地址控件
            if (item && [11].includes(item.type) && typeof oldData[key] === "string" && oldData[key].indexOf("lat") !== -1) {
              try {
                oldData[key] = JSON.parse(oldData[key])
              } catch (error) {}
            }

            if (item && [9, 10, 15].includes(item.type)) {
              // 附件、签名、图片不使用历史数据
              delete oldData[key]
            }

            // 时间格式
            if (item && [3].includes(item.type) && oldData[key]) {
              oldData[key] = new Date(oldData[key])
            }

            if (item && [201].includes(item.type)) {
              oldData[key].forEach((element: any) => {
                formatData(element, true, key)
              })
            }
          })
        }
        formatData(oldData)

        this.formObj.bizObject.data = Object.assign(this.formObj.bizObject.data, oldData)
        localStorage.removeItem(useData)
        // @ts-ignore
        this.isSaveAndCreate = true
      }
    }
    components.FormRendererHelper.synthetize(
      formControls,
      this.formObj.bizObject.data,
      this.formObj.formPermission.dataPermissions,
      this.isNew
    )
    this.controls = controls
    this.onRendered([data])
  }

  editing(addSave?: boolean) {
    this.$nextTick(() => {
      this.formRenderer.edit()
    })

    const btnSave = {
      code: FormAction.Save,
      disabled: false,
      visible: true,
      text: this.getLocale(`action.${FormAction.Save}`)
    }
    // 流程外链表单不追加暂存按钮
    if (this.isWorkflowForm && addSave && !(window as any).isExternal) {
      const index = this.actions.findIndex(ac => ac.code === FormAction.Save)
      if (index === -1) {
        this.actions.splice(0, 0, btnSave)
      }
    }
  }

  onRendered(args: any) {
    setTimeout(() => {
      if (this.formRenderer) {
        if (this.isWorkflowForm) {
          // 如果是系统管理员，所有表单控件都是可写的
          if (this.inEdit) {
            if (this.currentUser.isAdmin) {
              const formControls: RendererFormControl[] = []
              components.FormRendererHelper.findFormControl(this.controls, formControls)
              for (const control of formControls) {
                control.writable = true
                if (control.type === schema.FormControlType.Sheet) {
                  ;(control as any).columns.forEach((col: any) => (col.writable = true))
                }
              }
            }
          }
          this.editing(this.inEdit)
        } else {
          const canEdit = this.formObj.formPermission.actionPermission[FormAction.Edit]

          if (!this.formObj.bizObject.sequenceStatus) {
            this.editing()
          } else if (this.inEdit && canEdit) {
            this.editing()
          }
        }

        const controls = this.formRenderer.findFormControls()

        setTimeout(() => {
          if (this.relevanceQuery) {
            const keys = Object.keys(this.relevanceQuery)

            const rfControls = controls.filter(
              (c: any) =>
                (c.type === schema.FormControlType.RelevanceForm || c.type === schema.FormControlType.RelevanceFormEx) &&
                keys.indexOf(c.key) > -1
            )

            for (const c of rfControls) {
              const item = this.formObj.bizObject.data[c.key]
              if (!item) {
                continue
              }

              const val = Object.assign({}, item)
              const ctrl = c.controller as RadioControl
              const mappings = (ctrl.options as any).mappings
              if (mappings) {
                for (const key in mappings) {
                  if (val[key] === undefined) {
                    continue
                  }
                  const target = mappings[key]
                  const control = controls.find((itemObj: any) => itemObj.key === (Array.isArray(target) ? target[0] : target))
                  if (control) {
                    if (control.type === schema.FormControlType.Sheet && Array.isArray(val[key])) {
                      ;(control as any as schema.FormSheet).columns.forEach(col => {
                        for (const row of val[key]) {
                          delete row.id
                          row[col.key] = this.convertFormControlValue(key, col, row[col.key])
                        }
                      })
                    }

                    val[key] = this.convertFormControlValue(key, control, val[key])
                  }
                }
              }
              ctrl.value = val
            }
          }
        }, 500)

        if (this.formObj.workItemId) {
          setTimeout(() => {
            this.loadComment()
          }, 500)
        }
        // 流程表单也需要执行initRelevanceForm
        if (this.inEdit || this.isNew || this.isWorkflowForm) {
          //编辑状态也需要对关联表单控件进行初始化动作
          setTimeout(() => {
            // 子表中如果有关联表单,需要等待 row构建好
            this.initRelevanceForm(controls)
          }, 1000)
        }

        setTimeout(() => {
          this.callLifecycleHook(LifecycleHookNames.OnRendered, args)
        }, 1000)
      } else {
        this.onRendered(args)
      }
    }, 50)
  }

  initRelevanceForm(controls: any[]) {
    let _tempCol: any[] = []
    controls
      .filter(
        c => (c.type === schema.FormControlType.RelevanceForm || c.type === schema.FormControlType.RelevanceFormEx) && c.options.defaultVal
      )
      .forEach((c, i) => {
        // ;
        const ctrl = c.controller
        ctrl &&
          ctrl.commander.next({
            name: "init",
            args: i
          })
      })

    controls
      .filter((c: FormSheet) => c.type === schema.FormControlType.Sheet)
      .forEach(c => {
        const cols = c.columns.filter(
          (col: any) =>
            (col.type === schema.FormControlType.RelevanceForm || col.type === schema.FormControlType.RelevanceFormEx) &&
            col.options.defaultVal
        )
        if (cols.length === 0) {
          return
        }

        const fn = (index: number) => {
          const row = c.controller.rows[index]
          for (const col of cols) {
            const child = row.findChild(col.key)
            if (child) {
              child.commander.next({
                name: "init",
                args: index
              })
            }
          }
        }
        if (!c.controller) {
          _tempCol.push(c)
        }
        for (let i = 0; i < c.controller.rows.length; i++) {
          // setTimeout(() => fn(i), 500);
          fn(i)
        }

        c.controller.rowChange.subscribe((change: any) => {
          if (change.type === RowChangeType.Insert) {
            // setTimeout(() => fn(change.index), 500);
            fn(change.index)
          } else if (change.type === RowChangeType.InsertMulti) {
            if (change.insertCount) {
              // setTimeout(() => {
              for (let i = 0; i < change.insertCount; i++) {
                fn(change.index + i)
              }
              // }, 500);
            }
          }
        })
      })
    if (_tempCol.length) {
    }
  }

  convertFormControlValue(sourceKey: string, control: schema.FormControl, val: any) {
    if (sourceKey === "sequenceStatus") {
      if (val && this.$i18n.locale === "zh") {
        const text = form.sequenceStatusZh[val]
        if (text) {
          return text
        }
      }
    }
    return renderer.FormControlValueService.convert(control.type, val, control.options.multi)
  }

  /**
   * 加载暂存的审批意见
   */
  async loadComment() {
    const instanceId = this.formObj.workflowInstanceId
    const tokenId = this.formObj.workflowTokenId
    const itemId = this.formObj.workItemId

    if (!itemId || !instanceId || !tokenId) {
      return
    }

    if (this.approval) {
      const res = await workflowApi.getComment({
        workflowInstanceId: instanceId,
        tokenId,
        workItemId: itemId
      })

      if (res.errcode === 0 && res.data) {
        this.approval.controller.value = res.data
      }
    }
  }

  /**
   * 根据表单权限创建表单按钮列表
   * @param actionObj
   */
  getActions(actionObj: any) {
    const actions: FormActionButton[] = []

    if (!actionObj) {
      return actions
    }

    if (actionObj[FormAction.Edit]) {
      // 流程表单不显示编辑按钮
      if (this.workflowInstanceId) {
        delete actionObj[FormAction.Edit]
      } else {
        delete actionObj[FormAction.Save]
        delete actionObj[FormAction.Submit]
      }
    }

    Object.keys(FormAction).forEach(k => {
      const code = (FormAction as any)[k]
      if (actionObj[code]) {
        actions.push({
          code,
          disabled: false,
          visible: true,
          loading: false,
          text: this.getLocale(`action.${code}`).toString()
        })
      }
    })

    const sorts: any = {
      [FormAction.Submit]: 1,
      [FormAction.Agree]: 1,
      [FormAction.DisAgree]: 2,
      [FormAction.Save]: 2,
      [FormAction.Reject]: 2,
      [FormAction.Edit]: 2,
      [FormAction.Urge]: 3,
      [FormAction.Comment]: 4
    }

    actions.sort((a, b) => (sorts[a.code] ? sorts[a.code] : 99) - (sorts[b.code] ? sorts[b.code] : 99))

    return actions
  }

  /**
   * 调用生命周期钩子
   * @param hook
   * @param argus
   */
  callLifecycleHook(hook: LifecycleHookNames, argus?: any[]) {
    // @ts-ignore
    this.axios = axios
    if (!this.proxy) {
      if (platform.IS_IE) {
        this.proxy = this
      } else {
        this.proxy = new Proxy(this, new FormDetailProxyHandler())
      }
      ;(window as any).h3form = this.proxy
    }

    if (!this.hooks) {
      return
    }

    const funcs = this.hooks[hook]
    if (!funcs || funcs.length === 0) {
      return
    }

    try {
      const results = funcs.map(f => f.apply(this.proxy, argus))
      return results
    } catch (e) {
      console.log(`callLifecycleHook${e}`)
    }
  }

  validateApproval() {
    if (this.approval && this.approval.required) {
      const val = this.approval.controller.value
      if (!val || !val.content) {
        const msg = this.$t("cloudpivot.form.runtime.modal.pleaseInputOpinion").toString()
        this.$message.error(msg, 3)
        return false
      }
    }
    return true
  }

  // 移动端复制数据创建
  createByData(vm: any) {
    vm.isSaveAndCreate = true
    this.createEmpty(vm, true)
  }

  // 创建空白表单
  createEmpty(vm: any, isSave: boolean = false) {
    if (!isSave) {
      vm.isSaveAndCreate = false
    }
    let ac = {
      code: "submit",
      disabled: false,
      loading: false,
      text: "提交",
      visible: true,
      isSubmitAndCreate: true
    }
    // @ts-ignore
    this.onAction(ac)
    vm.isAddAndCreateVisible = false
  }

  /**
   * 表单按钮Click事件处理
   * @param ac
   */
  async onAction(ac: FormActionButton) {
    // @ts-ignore
    this.isSubmitAndCreate = ac.isSubmitAndCreate
    if (ac.code === "addAndCreate") {
      // 提交并继续创建
      // @ts-ignore
      this.isAddAndCreateVisible = true
    }

    let arrs = [FormAction.Reject, FormAction.Agree, FormAction.DisAgree]
    if (arrs.includes(ac.code)) {
      this.setApproval(ac)
    }
    if (
      ac.code === FormAction.Assist ||
      ac.code === FormAction.Circulate ||
      ac.code === FormAction.Reject ||
      ac.code === FormAction.Forward ||
      ac.code === FormAction.AdjustParticipant ||
      ac.code === FormAction.Urge ||
      ac.code === FormAction.Comment ||
      ac.code === FormAction.EditOwner
    ) {
      this.showActionModal(ac)
    } else if (ac.code === FormAction.ChangeNextNodeUser) {
      this.showNextNode(ac, "")
    } else if (ac.code === FormAction.Agree || ac.code === FormAction.Submit || ac.code === FormAction.DisAgree) {
      if (this.formObj.participantChoose) {
        this.formObj.nextNodeParticipant = "PARTICIPANT"
        const bizObjectData = this.buildSaveParams() as workflow.RejectParams
        this.formatData(bizObjectData.bizObject.data)

        const params = {
          workflowInstanceId: this.formObj.workflowInstanceId,
          workflowCode: this.formObj.workflowCode,
          workflowVersion: this.formObj.workflowVersion,
          activityCode: this.formObj.activityCode,
          bizObject: bizObjectData.bizObject
        }
        const gerRes: any = await formApi.getParticipantsInfo(params)
        if (gerRes.errcode === 0) {
          this.formObj.participantInfos = gerRes.data.participantInfos
          this.formObj.participantChoose = gerRes.data.participantChoose
        }
      }

      this.disableActionBtn(ac, true)
      this.$nextTick(async () => {
        const valid = await this.doValidate(ac)
        if (valid === true) {
          this.presubmit(ac)
        } else {
          this.disableActionBtn(ac, false)
        }
      })
    } else if (
      ac.code === FormAction.Cancel ||
      ac.code === FormAction.Retrieve ||
      ac.code === FormAction.FinishInstance ||
      ac.code === FormAction.Delete
    ) {
      if (!this.isWorkflowForm && ac.code === FormAction.Cancel) {
        const hideLoader = this.$message.loading(false)
        this.clean()
        this.load().then(() => {
          hideLoader()
        })
      } else {
        const okText = ac.code === FormAction.Delete ? this.$t("languages.common.okAndDelete") : this.$t("languages.common.ok")

        const self = this

        this.$confirm({
          title: ac.text,
          content: this.getLocale(`tip.${ac.code}`),
          okText: okText.toString(),
          cancelText: this.$t("languages.common.cancel").toString(),
          onOk() {
            self.doAction(ac)
          }
        })
      }
    } else if (ac.code === FormAction.FormTrack) {
      const markingInstance: any = this.$refs.FormMarking
      if (!markingInstance) return
      markingInstance.changeVisible(true)
    } else {
      const sequenceStatus = this.formObj.bizObject.data.sequenceStatus
      ac.code === FormAction.Save && this.disableActionBtn(ac, true)
      this.$nextTick(async () => {
        if (ac.code === FormAction.Save) {
          if (sequenceStatus && sequenceStatus !== form.SequenceStatus.Draft) {
            const valid = await this.doValidate(ac)
            if (valid !== true) {
              this.disableActionBtn(ac, false)
              return
            }
          } else {
            if (this.validate(true) === false) {
              this.disableActionBtn(ac, false)
              return
            }
          }
        }
        this.doAction(ac)
      })
    }
  }

  // 顶部操作按钮 禁用和放开
  disableActionBtn(ac: FormActionButton, status: boolean) {
    let reloadCodeType = [FormAction.Save, FormAction.Submit, FormAction.Agree]
    let $btn: any = ""
    if (reloadCodeType.includes(ac.code)) {
      this.actions.forEach(val => (val.disabled = status))
    }
  }

  /**
   * @desc 用户没有输入值的时候点击确认自动赋值
   * @param ac 按钮对象
   */
  setApproval(ac: any) {
    let content = ac.text
    if (ac.code === FormAction.Reject) {
      content = "不同意"
    }
    if (ac.code === FormAction.Agree) {
      content = "同意"
    }
    if (
      "approval" in this &&
      typeof this.approval === "object" &&
      (!this.approval.controller.value || (this.approval.controller.value && !this.approval.controller.value.content))
    ) {
      if (this.isMobile) {
        // 移动端先将内容存储
        window.sessionStorage.setItem("$approval", content)
      } else {
        if (typeof this.approval.controller.value === "object") {
          this.approval.controller.value.content = content
        } else {
          this.approval.controller.value = {
            content
          }
        }
      }
    }
  }

  /**
   * 表单按钮Click事件处理
   * @param ac
   */
  async doAction(ac: FormActionButton, data?: any) {
    let res: any
    try {
      const beforeReuslt = await this.beforeAction(ac)
      if (beforeReuslt === false) {
        return
      }

      let err: any
      const actionResult = this.executeAction(ac, data)
      console.log(actionResult, "actionResult")
      // 处理 Firefox 兼容性
      if (actionResult) {
        try {
          res = await actionResult
        } catch (e) {
          err = e
        }
      }

      const afterReuslt = await this.onActionDone(ac, res, err)
      if (afterReuslt === false) {
        return
      }
    } catch (error) {
      console.error("doAction 执行错误!", error)
      this.disableActionBtn(ac, false)
      throw error
    } finally {
      // 暂存,提交,同意 防止重复点击;
      // this.disableActionBtn(ac, false);
    }

    if (res) {
      if (res.errcode === 0) {
        if (ac.code === FormAction.Retrieve) {
          this.retrieveCallBack(ac)
        } else if (ac.code === FormAction.EditOwner) {
          this.reload()
        } else {
          this.goto(ac, res)
        }

        // 关联表单需要刷新标签页
        window.localStorage.setItem("relevanceFormAddData", "true")
      } else {
        this.handleError(res)
        setTimeout(() => {
          this.disableActionBtn(ac, false)
        }, 1000)
      }
    }
  }

  /**
   * 表单撤回后
   */
  retrieveCallBack(ac: FormActionButton) {
    const workflowInstanceId = this.$route.query.workflowInstanceId as string
    const vm = this
    this.timer = setInterval(() => {
      const params = {
        workflowInstanceId,
        activityCode: this.formObj.activityCode as string
      }
      workflowApi.isRetrieve(params).then(res => {
        if (res.errcode === 0) {
          if (!res.data) {
            // 撤回成功获得新流程实例id 刷新表单
            workflowApi.getWorkitemByInstanceid({ workflowInstanceId }).then(result => {
              if (result.errcode === 0) {
                vm.goto(ac, result)
              }
            })
            clearInterval(vm.timer)
          }
        } else {
          this.$message.error(res.errmsg || "", 3)
          clearInterval(vm.timer)
        }
      })
    }, 1000)
  }

  /**
   * 构建按钮事件数据
   */
  buildActionData() {
    // const data = this.getFormValue(false);
    const formRenderer = this.formRenderer
    const data = formRenderer.getValue()
    if (data && this.formObj && this.formObj.bizObject) {
      data.id = this.formObj.bizObject.id
      data.schemaCode = this.formObj.bizSchema.code
      data.sheetCode = this.formObj.bizSheet.code
      data.sequenceStatus = this.formObj.bizObject.sequenceStatus
      data.sequenceNo = this.formObj.bizObject.sequenceNo
    }
    return data
  }

  /**
   * 表单按钮操作前事件
   * @param ac
   */
  async beforeAction(ac: FormActionButton) {
    const data = this.buildActionData()

    const args = [ac, data]
    if (ac.code !== FormAction.Print) {
      const results = this.callLifecycleHook(LifecycleHookNames.OnPreAction, args)

      if (results) {
        if (results.some(r => r === false)) {
          return false
        }

        const tasks = results.filter(r => r instanceof Promise)
        if (tasks.length > 0) {
          const taskResults = await Promise.all(tasks)
          if (taskResults.some(r => r === false)) {
            return false
          }
        }
      }
    }

    return true
  }

  /**
   * 执行表单按钮逻辑
   * @param ac
   */
  executeAction(ac: FormActionButton, data?: any): Promise<any> | any {
    if (ac.code === FormAction.Submit) {
      const isEl: boolean = !!(window as any).externalLinkToken
      const isAdmin: boolean = localStorage.getItem("_isAdmin") === "true"
      if (!isEl && isAdmin) {
        this.$message.warn("拥有者没有所属部门，不能提交表单")
        return
      }
    }
    switch (ac.code) {
      case FormAction.ChangeNextNodeUser:
        this.showNextNode(ac, data)
        break
      case FormAction.Save:
        return this.save()

      case FormAction.Agree:
      case FormAction.Submit:
        this.disableActionBtn(ac, true)
        return this.submit(ac.code, data.deptId, true, data.trustor, data)

      case FormAction.DisAgree:
        this.disableActionBtn(ac, true)
        return this.submit(ac.code, data.deptId, false)

      case FormAction.Print:
        this.print(ac)
        break

      case FormAction.Edit:
        this.edit()
        break

      case FormAction.Cancel:
        return this.cancel()

      case FormAction.Retrieve:
        return this.retrieve()

      case FormAction.FinishInstance:
        return this.finish()

      case FormAction.Delete:
        return this.delete()

      case FormAction.Assist:
      case FormAction.Circulate:
      case FormAction.Reject:
      case FormAction.Forward:
      case FormAction.AdjustParticipant:
      case FormAction.Urge:
        return this.onActionModalOk(ac, data)
      case FormAction.EditOwner:
        return this.handleEditOwner(data)
      default:
        return this.onCustomAction(ac)
    }
  }

  // 处理修改拥有者
  async handleEditOwner(data: any) {
    let res: any = await listApi.modifyOwner(data)
    return res
  }

  /**
   * 自定义按钮事件处理
   * @param ac
   */
  onCustomAction(ac: FormActionButton) {
    const data = this.buildActionData()
    const args = [ac, data]
    const results = this.callLifecycleHook(LifecycleHookNames.OnCustomAction, args)
    if (results && results.length > 0) {
      return results[0]
    }
  }

  /**
   * 表单按钮操作后事件
   * @param ac
   */
  async onActionDone(ac: FormActionButton, res: any, err: any) {
    const data = this.buildActionData()
    const args = [ac, data, res, err]
    const results = this.callLifecycleHook(LifecycleHookNames.OnActionDone, args)

    if (results) {
      if (results.some(r => r === false)) {
        return false
      }

      const tasks = results.filter(r => r instanceof Promise)
      if (tasks.length > 0) {
        const taskResults = await Promise.all(tasks)
        if (taskResults.some(r => r === false)) {
          return false
        }
      }
    }
    return true
  }

  /**
   * 按钮弹窗
   * @param ac
   */
  async showActionModal(ac: FormActionButton) {
    let opts: FormActionModalOptions

    if (ac.code === FormAction.Reject) {
      opts = {
        title: ac.text,
        code: ac.code,
        data: this.formObj,
        approval: this.approval,
        createrName: this.formObj.bizObject && this.formObj.bizObject.creater.name
      }
    } else {
      opts = {
        title: ac.text,
        code: ac.code,
        data: this.formObj,
        approval: this.approval
      }
    }

    const modal = this.$refs.actionModal as any as FormActionModal
    modal.show(opts)
    // const data = await modal.show(opts);

    // const p = ac.code === FormAction.Reject ? this.reject(data) : this.forword(data, ac);

    // return p.then((res) => {
    //   if (res.errcode === 0) {
    //     modal.close();
    //   }
    //   return res;
    // });
  }

  async onActionModalOk(ac: FormActionButton, data: any) {
    if (ac.code === FormAction.Urge) {
      this.urgeHandler(data)
      return
    } else {
      const p = ac.code === FormAction.Reject ? this.reject(data) : this.forword(data, ac)

      const res = await p

      if (res.errcode === 0) {
        if (window.top !== window.self) {
          window.parent.postMessage("close", "*")
        }
      }

      if (res.errcode === 0) {
        const modal = this.$refs.actionModal as any as FormActionModal
        modal.close()
      }

      return res
    }

    // return p.then((res) => {
    //   if (res.errcode === 0) {
    //     const modal = this.$refs.actionModal as any as FormActionModal;
    //     modal.close();
    //   }
    //   return res;
    // });
  }

  async doValidate(ac: FormActionButton) {
    // 流程模拟不做表单校验
    if (this.$route.query.workflowMock) {
      return true
    }
    const valid = this.validate()
    if (valid === false) {
      return Promise.resolve(false)
    }

    const data = this.buildActionData()

    const args = [ac, data]
    const results = this.callLifecycleHook(LifecycleHookNames.OnValidate, args)

    if (results) {
      if (results.some(r => r === false)) {
        return Promise.resolve(false)
      }

      const tasks = results.filter(r => r instanceof Promise)
      if (tasks.length > 0) {
        const taskResults = await Promise.all(tasks)
        if (taskResults.some(r => r === false)) {
          return false
        }
      }
    }

    return true
  }

  /**
   * 驳回
   */
  async reject(data: any) {
    if (!this.approval.controller.value || !(!!this.approval.controller.value.content || !!this.approval.controller.value.resources)) {
      this.approval.controller.value = {
        content: "不同意"
      }
    }
    const params = this.buildSaveParams() as workflow.RejectParams
    this.formatData(params.bizObject.data)
    params.rejectToActivityCode = data.rejectToActivityCode
    params.submitToReject = data.submitToReject
    params.formType = "1"
    params.bizObject.data.version = this.formVersion

    return workflowApi.rejectWorkItem(params).then(res => {
      if (res.errcode === 302036) {
        return this.popErr(res)
      }

      const msg = this.$t("cloudpivot.form.runtime.tip.rejectSuccess").toString()
      this.$message.success(msg, 3)
      return res
    })
  }

  /**
   * 转办
   * @param data
   * @param ac
   */
  async forword(data: any, ac: FormActionButton) {
    const params: workflow.ForwardParams = {
      workItemId: this.formObj.workItemId,
      workflowInstanceId: this.formObj.workflowInstanceId,
      activityCode: this.formObj.activityCode,
      comment: data.comment,
      participantors: data.participantors.map((x: any) => x.id)
    } as any

    if (ac.code === FormAction.Forward) {
      return workflowApi.forwardWorkItem(params)
    }

    const assistParams = params as workflow.AssistParams
    // assistParams.circulateResource = '1';

    let promise: Promise<any>
    if (ac.code === FormAction.Assist) {
      promise = workflowApi.assistWorkItem(assistParams)
    } else if (ac.code === FormAction.Circulate) {
      promise = workflowApi.circulateWorkItem(assistParams)
    } else if (ac.code === FormAction.AdjustParticipant) {
      promise = workflowApi.adjustWorkItemParticipators(assistParams)
    } else {
      throw new Error(ac.code)
    }

    return promise.then(res => {
      if (res.errcode === 0) {
        const lang = this.$i18n.locale || "zh"
        let msg = ""
        if (lang === "zh") {
          msg = `已成功${ac.text}给${data.participantors[0].name}等${data.participantors.length}人`
        } else {
          const acStraight = ac.text.toLowerCase()
          msg = `You have ${acStraight} the task to ${data.participantors[0].name}`
        }

        this.$message.success(msg, 3)
      }
      return res
    })
  }

  /**
   * 打印
   * @param ac
   */
  print(ac: FormActionButton) {
    setTimeout(() => {
      window.print()
    }, 500)

    // const beforePrint = function beforeSafari() {
    //   console.log('before printing.');
    // };

    // const afterPrint = function afterSafari() {
    //   // 打印后的至灰回调
    //   console.log('after printing.');
    //   Vue.set(ac, 'disabled', true);
    // };

    // // if mac
    // if (window.matchMedia) {
    //   const mediaQueryList = window.matchMedia('print');
    //   mediaQueryList.addListener((mql) => {
    //     if (mql.matches) {
    //       beforePrint();
    //     } else {
    //       afterPrint();
    //     }
    //   });
    // }
    // window.onbeforeprint = beforePrint;
    // window.onafterprint = afterPrint;
  }

  /**
   * 编辑
   */
  edit() {
    if (this.isWorkflowForm) {
      // const index = this.actions.findIndex(ac => ac.code === FormAction.Edit);
      // this.actions.splice(index, 1, {
      //   code: FormAction.Save,
      //   disabled: false,
      //   visible: true,
      //   text: this.getLocale(`action.${FormAction.Save}`)
      // });
      // const permission = this.formObj.formPermission.dataPermissions;
      // if (!permission) {
      //   return false;
      // }
      // // const keys = Object.keys(permission).filter(k => permission[k].e).map(k => k);
      // const formRenderer = this.$refs.formRenderer as any;
      // formRenderer.edit();
    } else {
      const hideLoader = this.$message.loading(false)
      this.clean()
      this.load(true).then(() => {
        hideLoader()

        const btnSave = {
          code: FormAction.Save,
          disabled: false,
          visible: true,
          text: this.getLocale(`action.${FormAction.Save}`)
        }

        let index = this.actions.findIndex(ac => ac.code === FormAction.Edit)
        if (index > -1) {
          this.actions.splice(index, 1, btnSave)
        }

        let code = FormAction.Submit
        let text = ""

        if (this.formObj.bizObject.sequenceStatus === form.SequenceStatus.Completed) {
          code = FormAction.Cancel
          btnSave.text = this.getLocale(`action.save2`)
          // text = this.getLocale(`action.cancel2`);
          // index++;
        } else {
          code = FormAction.Submit
          text = this.getLocale(`action.${code}`)

          this.actions.splice(index, 0, {
            code,
            disabled: false,
            visible: true,
            text
          })
        }
      })
    }
  }

  /**
   * 默认值的查询条件转换使用
   * @param str
   * @returns
   */
  operatorToZh(str: string) {
    // 历史数据兼容，转换历史判断条件为运算符 => 中文名称
    let Mappings = {
      "==": "等于",
      "!=": "不等于",
      ">=": "大于等于",
      "<=": "小于等于",
      ">": "大于",
      "<": "小于",
      NotContains: "不包含",
      Contains: "包含",
      IsNotEmpty: "不为空",
      IsEmpty: "为空"
    }
    // 兼容性处理，格式化默认值
    let res: any = []
    let arr = str.split("&&")
    arr.forEach(el => {
      let elArr: any[] = el.split(" ")
      elArr = this.removeEmpty(elArr)
      if (elArr[1] && Object.keys(Mappings).includes(elArr[1])) {
        // @ts-ignore
        elArr[1] = Mappings[elArr[1]]
        res.push(elArr.join(" "))
      }
    })
    return res.join(" && ")
  }

  /**
   * 显示条件与必填条件转换使用，
   * @param str
   * @returns
   */
  operatorFormula(str: string) {
    let Mappings = {
      "==": "等于",
      "!=": "不等于",
      ">=": "大于等于",
      "<=": "小于等于",
      ">": "大于",
      "<": "小于",
      NotContains: "不包含",
      Contains: "包含",
      IsNotEmpty: "不为空",
      IsEmpty: "为空"
    }
    // 兼容性处理，格式化默认值
    let res = str || ""
    let arr = res.split("&&")
    arr.forEach(el => {
      let elArr: any[] = el.split(" ")
      if (elArr[1] && Object.keys(Mappings).includes(elArr[1])) {
        // @ts-ignore
        elArr[1] = Mappings[elArr[1]]
        res = elArr.join(" ")
      }
    })
    return res
  }

  removeEmpty(arr: any[]) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == "" || typeof arr[i] == "undefined") {
        arr.splice(i, 1)
        i = i - 1 // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位
      }
    }
    return arr
  }

  /**
   * 将API数据转换为表单控件数据
   * @param controls
   * @param data
   */
  toFormData(controls: RendererControl[], data: { [key: string]: any }) {
    for (const key in data) {
      if (Array.isArray(data[key])) {
        for (const item of data[key]) {
          if (Array.isArray(item.departments)) {
            item.parentId = item.departments.filter((d: any) => d && d.id).map((d: any) => d.id)
          }
        }
      }
    }

    const formControls: RendererFormControl[] = []
    components.FormRendererHelper.findFormControl(controls, formControls)

    const user = renderer.StaffSelectorControl.service.getCurrentUser() as any
    const owner = formControls.find(c => c.type === FormControlType.OwnerId)
    // 如果没有提交过，则更改选人控件
    if (owner) {
      if (!(this as any).formObj) {
        return
      }
      const formPermission = (this as any).formObj.formPermission
      let edit = false
      // || (user && user.isAdmin) permissions
      // 表单新增 或者 流程表单且表单状态为草稿，可以编辑
      if (this.isNew || (this.isWorkflowForm && this.formObj.bizObject && this.formObj.bizObject.sequenceStatus === "DRAFT")) {
        edit = true
      } else if (formPermission && formPermission.dataPermissions && formPermission.dataPermissions.owner) {
        if (formPermission.dataPermissions.owner.e && user && this.inEdit) {
          if (user.permissions.includes("SYS_MNG") || user.permissions.includes("ADMIN")) {
            edit = true
          }
        } else if (this.formObj.bizObject && this.formObj.bizObject.sequenceStatus === "DRAFT" && formPermission.dataPermissions.owner.e) {
          edit = true
        }
      }
      if (edit) {
        owner.type = FormControlType.StaffSelector
        owner.required = true
        owner.value = data[owner.key]
        owner.writable = false
        owner.edit = edit
        const options = FormControlOptionsService.buildFor(owner.type, owner.options)
        if (options) {
          options.defaultValueType = schema.StaffSelectorValueType.Originator
          owner.options = options
        }
        this.owner = owner
      }
    }

    //

    // if (this.isNew || (user && user.isAdmin)) {

    //   if (owner) {
    //     owner.type = FormControlType.StaffSelector;
    //     owner.required = true;
    //     owner.value = data[owner.key];
    //     owner.writable = false;
    //     owner.edit = this.isNew;
    //     const options = FormControlOptionsService.buildFor(
    //       owner.type,
    //       owner.options
    //     );
    //     if (options) {
    //       options.defaultValueType = schema.StaffSelectorValueType.Originator;
    //       owner.options = options;
    //     }
    //     this.owner = owner;
    //   }
    // }

    formControls.forEach((control: RendererFormControl) => {
      // 显示条件，必填条件
      ;["displayFormula", "requiredFormula"].forEach((el: string) => {
        if (control.options[el] && typeof control.options[el] === "string" && control.options[el] !== "true") {
          control.options[el] = this.operatorFormula(control.options[el])
        }
      })
    })

    formControls
      .filter(c => c.type === FormControlType.Sheet)
      .forEach((c: any) => {
        const sheetParams = {
          id: this.formObj.bizObject.id,
          sheetid: this.formObj.bizSheet.id,
          formCode: this.formObj.bizSheet.code, // 表单编码
          sheetCode: this.formObj.bizSheet.code, // 表单编码
          schemaCode: this.formObj.bizSchema.code, // 模型编码
          objectId: this.formObj.bizObject.id, // 表单id
          sequenceStatus: this.formObj.bizObject.sequenceStatus, // 流程状态
          subSchemaCode: c.key,
          workitemId: this.formObj.workItemId
        }
        const sheetValue = data[c.key]
        c.options.sheetParams = sheetParams
        if (Array.isArray(sheetValue)) {
          sheetValue.sort((a, b) => a.sortKey - b.sortKey)
          sheetValue.forEach(v => this.toFormData((c as any).columns, v))
        }

        if (Array.isArray(c.columns)) {
          c.columns.forEach(async (c: any) => {
            if (c.type === FormControlType.RelevanceForm || c.type === FormControlType.RelevanceFormEx) {
              // 默认值:兼容历史数据
              ;["defaultVal"].forEach((el: string) => {
                if (c.options[el] && typeof c.options[el] === "string") {
                  c.options[el] = this.operatorToZh(c.options[el])
                }
              })
            }
            // 转换业务数据
            if ([FormControlType.Dropdown, FormControlType.DropdownMulti].includes(c.type)) {
              function getOptions(
                schemaCode: string,
                queryCode: string,
                sheetDataItem: string,
                orderByFields: string[],
                orderType: number,
                condition: any
              ) {
                let options = {
                  customDisplayColumns: [sheetDataItem]
                }
                const obj: any = {
                  queryCode,
                  schemaCode,
                  options,
                  orderByFields,
                  orderType,
                  page: 0,
                  size: 1000,
                  filters: [],
                  condition
                }
                return listApi.listSkipQueryList(obj).then(res => {
                  if (res.errcode === 0) {
                    const data: string[] = []
                    res.data.content.forEach((x: any) => {
                      const s = x.data[sheetDataItem]
                      let t = ""
                      if (s && data.indexOf(s) === -1) {
                        if (sheetDataItem === "sequenceStatus") {
                          switch (s) {
                            case "DRAFT":
                              t = "草稿"
                              break
                            case "PROCESSING":
                              t = "进行中"
                              break
                            case "COMPLETED":
                              t = "已完成"
                              break
                            case "CANCELED":
                              t = "已作废"
                              break
                            default:
                              break
                          }
                          data.push(t)
                        } else {
                          data.push(s)
                        }
                      }
                    })
                    return data
                  }
                  return []
                })
              }
              try {
                if (c.options && c.options.options && this.checkIsJSON(c.options.options)) {
                  const options = JSON.parse(c.options.options)
                  //自定义和数据字典类型没有schemaCode，不需要去获取业务模型数据
                  if (options.schemaCode) {
                    let res = await getOptions(
                      options.schemaCode,
                      "",
                      options.sheetDataItem,
                      [options.orderByFields],
                      options.orderType,
                      ""
                    )
                    if (res) {
                      c.options.options = res.join(";") + ";"
                    }
                  }
                }
              } catch (error) {
                console.log("error==>", error)
              }
            }
            // 转换字典数据
            if (
              [FormControlType.Checkbox, FormControlType.Dropdown, FormControlType.DropdownMulti, FormControlType.Radio].includes(c.type)
            ) {
              let checkedDictionary = ""
              let dictionaryOptions = ""
              let useDictionariesData: any[] = []
              let options: any
              try {
                if (c.options && c.options.options && this.checkIsJSON(c.options.options)) {
                  options = JSON.parse(c.options.options)
                }
                if (options && options.checkedDictionary) {
                  checkedDictionary = options.checkedDictionary
                }
                if (options && options.useDictionariesData) {
                  useDictionariesData = options.useDictionariesData
                }
              } catch (error) {
                console.log("error==>", error)
              }
              if (checkedDictionary) {
                if (useDictionariesData && useDictionariesData.length) {
                  useDictionariesData.forEach(element => {
                    dictionaryOptions += element.name + ";"
                  })
                } else {
                  let res: any = await formApi.getEnableRecordsByDictionaryId({
                    dicId: checkedDictionary
                  })
                  if (res.errcode === 0) {
                    let data: any[] = res.data.content
                    data.forEach(element => {
                      dictionaryOptions += element.name + ";"
                    })
                  }
                }

                dictionaryOptions = dictionaryOptions.replace(/;$/, "")
                c.options.options = dictionaryOptions
              }
            }
          })
        }
      })

    formControls
      .filter(c => c.type === FormControlType.Attachment || c.type === FormControlType.Image)
      .forEach(c => {
        const files = data[c.key]
        if (files && Array.isArray(files)) {
          data[c.key] = files.map((f: any) => {
            if (f.refId) {
              return {
                uid: f.refId,
                name: f.name,
                status: UploadStatus.Done,
                size: f.fileSize,
                response: {
                  data: f
                }
              }
            } else if (f.uid) {
              return f
            }
          })
        }
      })

    formControls
      .filter(
        c =>
          c.type === FormControlType.Checkbox ||
          c.type === FormControlType.Dropdown ||
          c.type === FormControlType.DropdownMulti ||
          c.type === FormControlType.Radio
      )
      .forEach(async c => {
        let checkedDictionary = ""
        let dictionaryOptions = ""
        let useDictionariesData: any[] = []
        let options: any
        try {
          if (c.options && c.options.options && this.checkIsJSON(c.options.options)) {
            options = JSON.parse(c.options.options)
            if (options.checkedDictionary) {
              checkedDictionary = options.checkedDictionary
            }
            useDictionariesData = options.useDictionariesData
          }
        } catch (error) {
          console.log("error==>", error)
        }
        if (checkedDictionary) {
          if (useDictionariesData && useDictionariesData.length) {
            useDictionariesData.forEach(element => {
              dictionaryOptions += element.name + ";"
            })
          } else {
            let res: any = await formApi.searchDictionaryRecord({
              id: checkedDictionary,
              page: 1,
              size: 10,
              searchWord: ""
            })
            if (res.errcode === 0) {
              let data: any[] = res.data.content
              data.forEach(element => {
                dictionaryOptions += element.name + ";"
              })
            }
          }
          dictionaryOptions = dictionaryOptions.replace(/;$/, "")
          c.options.options = dictionaryOptions
        }
        if (typeof options === "object" && options.labels && options.labels.length > 0) {
          c.options.hasLabel = true
          c.options.options = options.labels.map((i: any) => i.data[options.sheetDataItem]).join(";")
        }

        const str = data[c.key] as string
        if (
          c.type === FormControlType.Checkbox ||
          c.type === FormControlType.DropdownMulti ||
          (c.type === FormControlType.Dropdown && (c.options as DropdownOptions).multi)
        ) {
          if (typeof str === "string") {
            data[c.key] = str ? str.split(";") : []
          }
        }
      })

    formControls
      .filter(c => c.type === FormControlType.Location)
      .forEach(c => {
        const str = data[c.key]
        if (str) {
          try {
            if (typeof str === "object") {
              data[c.key] = str
            } else {
              data[c.key] = JSON.parse(str)
            }
          } catch (error) {
            console.log(error)
          }
        }
      })

    formControls
      .filter(c => c.type === FormControlType.Date)
      .forEach(c => {
        let str = data[c.key]
        if (typeof str === "string") {
          try {
            // iOS兼容
            str = str.replace(/-/g, "/")
            data[c.key] = new Date(str)
          } catch (error) {
            console.log(error)
          }
        }
      })

    formControls
      .filter(c => c.type === FormControlType.Time)
      .forEach(c => {
        let str = data[c.key]
        if (typeof str === "string") {
          try {
            data[c.key] = moment(str as any, c.options.format1 || "HH:mm:ss")
          } catch (error) {
            console.log(error)
          }
        }
      })

    formControls
      .filter(c => c.type === FormControlType.Address)
      .forEach(c => {
        const str = data[c.key]
        if (typeof str === "string") {
          try {
            // iOS兼容
            data[c.key] = JSON.parse(str)
          } catch (error) {
            console.log(error)
          }
        }
      })

    formControls
      .filter(c => c.type === FormControlType.RelevanceForm || c.type === FormControlType.RelevanceFormEx)
      .forEach(c => {
        // 默认值:兼容历史数据
        ;["defaultVal"].forEach((el: string) => {
          if (c.options[el] && typeof c.options[el] === "string") {
            c.options[el] = this.operatorToZh(c.options[el])
          }
        })

        if (data[c.key] && !data[c.key].id) {
          data[c.key] = {}
        }
        const sheetParams = {
          id: this.formObj.bizObject.id,
          sheetid: this.formObj.bizSheet.id,
          sheetCode: this.formObj.bizSheet.code, // 表单编码
          schemaCode: this.formObj.bizSchema.code // 模型编码
        }
        c.options.sheetParams = sheetParams
      })

    formControls
      .filter(c => c.type === FormControlType.ReverseRelevance)
      .forEach(c => {
        const sheetParams = {
          id: this.formObj.bizObject.id,
          sheetid: this.formObj.bizSheet.id,
          formCode: this.formObj.bizSheet.code,
          sheetCode: this.formObj.bizSheet.code, // 表单编码
          schemaCode: this.formObj.bizSheet.schemaCode,
          sequenceStatus: this.formObj.bizObject.sequenceStatus
        }
        c.options.sheetParams = sheetParams
        // ;
        // c.value = {
        //   id: this.formObj.bizObject.id,
        //   formCode: this.formObj.bizSheet.code,
        //   schemaCode: this.formObj.bizSheet.schemaCode
        // };
      })

    //  let {
    //     str,
    //     subStr,
    //     getValue
    //   } = calcText;
    // formControls.filter(c => c.type === FormControlType.Text && c.options.shortTextStitch)
    // .forEach(c => {

    //   if (!c.value) {

    //     let { shortTextStitch } = c.options;
    //     let calcStr = shortTextStitch
    //       .replace(/substring/ig, 'subStr')
    //       .replace(/string/ig, 'str')
    //       .replace(/\{/ig, '"{')
    //       .replace(/\}/ig, '}"');

    //     c.value = (new Function('controls', `${str.toString()};${subStr.toString()}; ${getValue.toString()};return ${calcStr}`))(formControls);
    //   }

    // })
  }

  /**
   * 将表单数据转换为后端API所需数据结构
   * @param data
   * @param controls
   * @param filterSystem
   * @param agree
   */
  formDataHandle(data: { [key: string]: any }, controls: RendererControl[], filterSystem: boolean, agree?: boolean) {
    const formControls: RendererFormControl[] = []
    components.FormRendererHelper.findFormControl(controls, formControls)
    if (filterSystem) {
      const systemControls = formControls.filter(
        c =>
          (c.type > 99 && c.type < 200) ||
          c.type === FormControlType.Title ||
          c.type === FormControlType.Description ||
          c.type === FormControlType.Group
      )

      systemControls.forEach(c => delete data[c.key])
    }
    // formControls = formControls.filter(c => !(c.type > 99 && c.type < 200));
    //暂存不对数值控件做处理
    if (agree) {
      formControls
        .filter(c => c.type === FormControlType.Number)
        .forEach(c => {
          const ctrl = c.controller as ValueControl<number>
          if (data[c.key] === "") {
            data[c.key] = null
          } else if (
            ctrl &&
            typeof ctrl.max === "number" &&
            data[c.key] !== null && // 如果 ctrl.max是负数 且 data[c.key] 是 null 则 会将 max赋值给 data[c.key]
            data[c.key] !== "" && // 如果 ctrl.max是负数 且 data[c.key] 是 '' 则 会将 max赋值给 data[c.key]
            data[c.key] > ctrl.max
          ) {
            data[c.key] = ctrl.max
          }
        })
    }

    formControls
      .filter(c => c.type === FormControlType.Date)
      .forEach(c => {
        const val = data[c.key]
        if (val === "") {
          data[c.key] = null
        } else if (val instanceof Date) {
          data[c.key] = {
            value: dateFormatter(val, c.options.format1 || "YYYY-MM-DD HH:mm:ss"),
            val: val,
            isDate: true
          }
        }
      })

    formControls
      .filter(c => c.type === FormControlType.Time)
      .forEach(c => {
        const val = data[c.key]
        if (moment.isMoment(val)) {
          // 时间为moment类型
          data[c.key] = val.format(c.options.format1 || "HH:mm:ss")
        }
      })

    formControls
      .filter(c => c.type === FormControlType.Checkbox || c.type === FormControlType.Dropdown || c.type === FormControlType.DropdownMulti)
      .forEach(c => {
        if (Array.isArray(data[c.key])) {
          data[c.key] = {
            value: data[c.key].join(";"),
            isString: true
          }
        }
      })

    formControls
      .filter(c =>
        [
          FormControlType.StaffSelector,
          FormControlType.StaffMultiSelector,
          FormControlType.DepartmentSelector,
          FormControlType.DepartmentMultiSelector,
          FormControlType.StaffDeptMixed
        ].includes(c.type)
      )
      .forEach(c => {
        const arr = data[c.key]
        if (Array.isArray(arr)) {
          data[c.key] = arr.map(x => ({
            id: x.id,
            type: x.unitType || x.type, // x.type === 'org' ? 1 : 3
            name: x.name
          }))
        }
      })

    formControls
      .filter(c => c.type === FormControlType.Location)
      .forEach(c => {
        const val = data[c.key]
        if (val && Object.keys(val).length > 0) {
          data[c.key] = JSON.stringify(val)
        }
      })

    formControls
      .filter(c => c.type === FormControlType.Attachment || c.type === FormControlType.Image)
      .forEach(c => {
        let files = data[c.key]
        if (files && Array.isArray(files)) {
          data[c.key] = files
            .map((f: any) => {
              if (f.refId) {
                return f
              }
              if (!f || !f.response || !f.response.data || !f.response.data.refId) {
                return null
              }
              return f.response.data
            })
            .filter(f => f)
        }
      })

    formControls
      .filter(c => c.type === FormControlType.Sheet)
      .forEach(c => {
        const sheetValue: any = data[c.key]
        if (Array.isArray(sheetValue)) {
          console.log(sheetValue, "sheetValue")
          const removeList: any = (c.controller as any).removeList // 删除列表
          let listDelete: any = [] // 过滤后台返回的删除数据
          let modifyList: any = [] // 修改的数据
          if (Array.isArray(removeList) && removeList.length > 0) {
            listDelete = removeList.filter((item: any) => item.id)
            removeList.forEach((item: any) => (item.rowStatus = "Deleted"))
            console.log(listDelete, "listDelete")
          }
          modifyList = sheetValue.filter((item: any) => item.rowStatus !== "Unchanged")
          console.log(modifyList, "modifyList")
          const finalValues: any = [...listDelete, ...modifyList]
          console.log(finalValues, "finalValues")
          //把最终修改过的行数据提交 未修改过的不提交
          data[c.key] = finalValues
          if (Array.isArray(finalValues) && finalValues.length > 0) {
            finalValues.forEach((v: any) => this.formDataHandle(v, (c as any).columns, filterSystem, agree))
          }
        }
      })

    formControls
      .filter(c => c.type === FormControlType.RelevanceForm)
      .forEach(c => {
        const value = data[c.key]
        if (value) {
          // data[c.key] = value.id || "";
          data[c.key] = {
            displayCode: c.options.displayField,
            id: value.id || "",
            // name: value[c.options.displayField],
            propertyType: 0,
            schemaCode: c.options.schemaCode,
            onlyId: true
          }
          if (data[c.key]) {
            data[c.key][c.options.displayField] = value[c.options.displayField]
          } else {
            data[c.options.displayField] = value[c.options.displayField]
          }
        }
      })

    formControls
      .filter(c => c.type === FormControlType.RelevanceFormEx)
      .forEach(c => {
        const value = data[c.key]
        if (Array.isArray(value) && value.length > 0) {
          // data[c.key] = value.map((item) => item.id).join(";");
          data[c.key] = value.map(item => {
            let res: any = {
              displayCode: c.options.displayField,
              id: item.id || "",
              propertyType: 0,
              schemaCode: c.options.schemaCode,
              onlyId: true
            }
            res[c.options.displayField] = item[c.options.displayField]
            return res
          })
        }
      })

    formControls
      .filter(c => c.type === FormControlType.ReverseRelevance)
      .forEach(c => {
        delete data[c.key]
      })

    if (this.formObj) {
      let result: number | null = null

      if (agree !== undefined) {
        result = agree ? 1 : 2
      }

      formControls
        .filter(c => c.type === FormControlType.ApprovalOpinion)
        .forEach(c => {
          const val = data[c.key]
          if (val) {
            val.workItemId = this.formObj.workItemId
            val.workflowInstanceId = this.formObj.workflowInstanceId
            val.workflowTokenId = this.formObj.workflowTokenId
            val.activityCode = this.formObj.activityCode
            val.activityName = this.formObj.activityName
            val.result = result
          }
          // @ts-ignore
          let isCommon: boolean = c.controller.isCommon || false
          if (isCommon) {
            val.commonSet = isCommon
          }
        })
    }
  }

  getFormValue(filterSystem: boolean, agree?: boolean) {
    const formRenderer = this.formRenderer
    const formData = formRenderer.getValue()
    if (formData) {
      for (let i in formData) {
        if (formData[i] && Array.isArray(formData[i])) {
          formData[i].forEach((v: any) => {
            for (let e in v) {
              if (v[e] && typeof v[e] === "string") {
                try {
                  let obj = JSON.parse(v[e])
                  if (obj && obj.marked && (obj.marked === true || obj.marked === false)) {
                    v[e] = obj.value
                  }
                } catch {}
              } else if (v[e] && Array.isArray(v[e])) {
                v[e] = v[e].map((g: any) => {
                  if (g.marked === true || g.marked === false) {
                    g = g.value
                  }
                  return g
                })
              }
            }
          })
        }
      }
    }
    // console.log("formRenderer获取表单数据", JSON.stringify(formData));
    // console.log("开始将表单数据转换为后端API所需数据结构");
    //
    this.formDataHandle(formData, this.controls, filterSystem, agree)
    // console.log("结束将表单数据转换为后端API所需数据结构");
    // console.log("formRenderer获取表单数据", JSON.stringify(formData));
    this.filterNullVal(formData)
    return formData
  }

  /**
   * @desc 过滤子表空数据行
   * @param data 需要处理的数据
   */
  filterNullVal(data: any) {
    let contrs = this.formControls.filter(item => item.type === schema.FormControlType.Sheet)
    if (contrs.length <= 0) return data
    let filterData = (key: any, columns: any) => {
      // 所有的模型类型
      let types = columns.reduce((prev: any, next: any) => {
        prev[next.key] = next.type
        return prev
      }, {})
      data[key] = data[key].filter((info: any) => {
        let keys = Object.keys(info)
        for (let i = 0, len = keys.length; i < len; i++) {
          let k = keys[i]
          // 如果有逻辑控件直接保存
          if (types[k] === FormControlType.Logic) {
            return true
          }
          if (types[k] !== FormControlType.Logic && info[k]) {
            return true
          }
        }
        return false
      })
      return data
    }
    contrs.map((item: any) => {
      let { key, columns } = item
      filterData(key, columns)
    })
    // console.log('data', data)
    return data
  }

  /**
   * 构建表单暂存参数
   */
  buildSaveParams(agree?: boolean) {
    let formData = this.getFormValue(true, agree)
    formData.id = this.formObj.bizObject.id

    if (this.$root.$store) {
      formData.delete_attachment_2147483647 = this.$root.$store.state.delFile
    }
    if (this.formObj.bizObject.sequenceNo) {
      formData.sequenceNo = this.formObj.bizObject.sequenceNo
    }

    const data: form.SaveParams = {
      workflowCode: this.formObj.workflowCode,
      workItemId: this.formObj.workItemId,
      workflowInstanceId: this.formObj.workflowInstanceId,
      bizObject: {
        id: this.formObj.bizObject.id,
        data: formData,
        schemaCode: this.formObj.bizSchema.code,
        sheetCode: this.formObj.bizSheet.code,
        workflowInstanceId: this.formObj.workflowInstanceId
      }
    }

    if (this.approval) {
      data.approval = formData[this.approval.key]
      delete formData[this.approval.key]
    }
    return data
  }

  /**
   * 暂存、保存
   */
  async save() {
    // const hideLoader = this.$message.loading(null, 0);
    // 如果没有拥有者，或者拥用者控件没有选中用户，都取当前用户ID
    let ownerId = ""

    if (this.owner) {
      const ownerVal = this.owner.controller.value as any[]
      if (ownerVal && ownerVal.length > 0) {
        ownerId = ownerVal[0].id
      }
    }

    if (!ownerId) {
      const user = renderer.StaffSelectorControl.service.getCurrentUser()
      if (user) {
        ownerId = user.id
      }
    }

    const params: any = this.$route.query
    let data: any = this.buildSaveParams()
    this.formatData(data.bizObject.data)

    const showSuccess = () => {
      this.inEdit = false
      // hideLoader();
      const msg = this.$t("cloudpivot.form.runtime.tip.saveSuccess").toString()
      this.$message.success(msg, 3)
    }

    let res: form.HttpResponse<any>

    try {
      data = FormDetailService.mergeReplayToken(data) // 合并 校验码
      // if(data.bizObject && typeof data.bizObject.data==='object'){
      //    Object.keys(data.bizObject.data).forEach(key=>{
      //      if(key.includes("Number") && typeof data.bizObject.data[key]==='number' && data.bizObject.data[key]>0){
      //        data.bizObject.data[key]=Number(data.bizObject.data[key])/100;
      //      }
      //    })
      // }
      console.log("data=========>", data)
      data.bizObject.data.version = this.formVersion
      res = await formApi.save(data, this.formPath)

      if (res.errcode === 302036) {
        return this.popErr(res)
      }

      if (this.$root.$store) {
        this.$root.$store.state.delFile = []
      }
      // if (res.errcode === 0) {
      //   const workItem = res.data.workItem;
      //   const workflowInstanceId = res.data.workflowInstanceId;
      //   data.workflowInstanceId = workflowInstanceId;
      //   data.bizObject.workflowInstanceId = workflowInstanceId;
      //   data.workItemId = workItemId;
      // }
      if (res.errcode === 0) {
        if (window.top !== window.self) {
          window.parent.postMessage("reload", "*")
        }
        const workItem = res.data.workItem
        const workflowInstanceId = res.data.workflowInstanceId

        if (!params.startWorkflowCode || (workItem && workItem.id)) {
          showSuccess()
        } else {
          let workItemId: string
          do {
            workItemId = await this.existWorkItem(workflowInstanceId, ownerId)
          } while (!workItemId)

          const workItem = {
            id: (workItemId as any).data,
            instanceId: workflowInstanceId
          }

          res.data.workItem = workItem

          // data.workflowInstanceId = workflowInstanceId;
          // data.bizObject.workflowInstanceId = workflowInstanceId;
          // data.workItemId = workItemId;
          // data.saveBizObject = false;
          // res = await formApi.save(data, this.formPath);
          showSuccess()
        }
      }
    } catch (e) {
      // hideLoader();
      throw e
    }

    return res
  }

  existWorkItem(workflowInstanceId: string, ownerId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        formApi.workItemExist(workflowInstanceId, ownerId).then(
          res => {
            if (res.errcode === 0) {
              resolve(res.data)
            } else {
              resolve()
            }
          },
          res => reject(res)
        )
      }, 1000)
    })
  }

  /**
   * 提交前业务逻辑处理
   * @param ac
   * @param agree 是否同意
   */
  async presubmit(ac: FormActionButton) {
    if (this.submited) {
      if (this.isMobile && this.approval) {
        const modal = this.$refs.actionModal as any as FormActionModal
        modal.show({
          title: ac.text,
          code: ac.code,
          data: this.formObj.participantChoose ? this.formObj : [],
          approval: this.approval,
          showNextNode: this.formObj.participantChoose
        })
        this.disableActionBtn(ac, false)
      } else {
        if (this.formObj.participantChoose) {
          this.showNextNode(ac, "")
        } else {
          //如果提交过，不用再选择部门
          const deptId =
            (this.formObj.bizObject.data && this.formObj.bizObject.data.ownerDeptId && this.formObj.bizObject.data.ownerDeptId.id) || null
          this.doAction(ac, {
            deptId
          })
        }
      }
    } else {
      let depts: any[] = []
      let trustList: any = []
      // 流程模拟,发起流程时提交处理-预设部门为发起人部门
      if (this.$route.query.workflowMock && this.$route.query.startWorkflowCode) {
        const startWorkflowCode = `${this.$route.query.startWorkflowCode}-mock`
        const _preMockData: any = window.sessionStorage.getItem(startWorkflowCode)
        const mockData = JSON.parse(_preMockData)
        if (mockData && mockData.originatorDept) {
          this.doAction(ac, {
            deptId: mockData.originatorDept
          })
          return
        }
      }

      // 如果有拥有者控件，则取拥有者的部门列表
      // if (this.owner) {
      //   const val = this.owner.controller.value as any[];
      //   if (val && val.length > 0) {
      //     const hideLoader = (this.$message as any).loading();
      //     try {
      //       const _depts = await renderer.StaffSelectorControl.service.getUserDepartments(
      //         val[0].id
      //       );
      //       if (_depts) {
      //         depts = _depts;
      //       }
      //     } finally {
      //       hideLoader();
      //     }
      //   }
      // } else {
      //   // 如果没有拥有者控件，则取创建人的部门列表
      //   depts = this.formObj.departments;
      // }
      let ownerInfo: any = {}
      let createrInfo: any = {}
      this.formObj && this.formObj.bizObject && this.formObj.bizObject.owner ? (ownerInfo = this.formObj.bizObject.owner) : ownerInfo
      this.formObj && this.formObj.bizObject && this.formObj.bizObject.creater
        ? (createrInfo = this.formObj.bizObject.creater)
        : createrInfo
      let userId: string = ""
      if (this.formObj && this.formObj.bizSheet && this.formObj.bizSheet.draftAttributesJson) {
        let obj = JSON.parse(this.formObj.bizSheet.draftAttributesJson)
        console.log(obj)
      }
      // 使用接口的loading动画，不额外触发，一面生成两个加载动画
      // const hideLoader = (this.$message as any).loading();
      if (this.owner) {
        const val = this.owner.controller.value as any[]
        if (val && val.length > 0) {
          userId = val[0].id
        }
      } else {
        // 如果没有拥有者控件，则取创建人的Id
        !ownerInfo.id ? (userId = createrInfo.id || "") : (userId = ownerInfo.id || "")
        // depts = this.formObj.departments;
      }
      try {
        const _depts = await renderer.StaffSelectorControl.service.getUserDepartments(userId)
        if (_depts) {
          depts = _depts
        }
        const params: any = {
          workflowCode: this.formObj.workflowCode || ""
        }
        if (this.formObj.workflowInstanceId) {
          params.workflowInstanceId = this.formObj.workflowInstanceId
        }
        //如果没有流程id就不请求
        if (params.workflowInstanceId) {
          const res = await workflowApi.getTrustOriginatorList(params)
          if (!res.errcode && Array.isArray(res.data)) {
            trustList = res.data
          }
        }
      } finally {
        // hideLoader();
      }

      if (!depts || depts.length === 0) {
        // 无拥有者 无创建人 loadedFromDb false 识别数据来自业务方法,不需要校验拥有者部门；
        if (!platform.IS_DEBUG) {
          if (userId) {
            this.$message.error(this.$t("cloudpivot.form.runtime.tip.noDeptTips"), 3)
            return
          }
        }
      }

      // 如果有多个部门需要选一个
      // 移动端的审批意见需要弹页面填写
      const filterTrust = trustList.filter((tl: any) => tl.isTrustor)
      if (ac.code === "submit" && filterTrust.length) {
        // 发起委托选择委托人弹窗，当存在委托人时出现
        const modal = this.$refs.actionModal as any as FormActionModal
        modal.show({
          title: this.$t("cloudpivot.form.runtime.modal.selectIdentity").toString(),
          code: ac.code,
          data: depts,
          approval: this.approval,
          trusts: trustList,
          workflowName: this.formObj.workflowName,
          showNextNode: this.formObj.participantChoose
        })
        this.disableActionBtn(ac, false)
      } else if (depts.length > 1 || (this.isMobile && this.approval)) {
        const modal = this.$refs.actionModal as any as FormActionModal
        modal.show({
          title: ac.text,
          code: ac.code,
          data: depts,
          approval: this.approval,
          showNextNode: this.formObj.participantChoose
        })
        this.disableActionBtn(ac, false)
      } else {
        if (this.formObj.participantChoose) {
          this.showNextNode(ac, "")
        } else {
          this.doAction(ac, {
            deptId: !depts[0] ? "" : depts[0].id
          })
        }
      }
    }
  }

  showNextNode(ac: any, data: any) {
    this.disableActionBtn(ac, true)
    this.$nextTick(async () => {
      const valid = await this.doValidate(ac)
      if (valid === true) {
        const modal = this.$refs.actionModal as any as FormActionModal
        modal.show({
          title: ac.text,
          code: FormAction.ChangeNextNodeUser,
          data: this.formObj,
          deptId: data && data.deptId,
          approval: this.approval
        })
        this.disableActionBtn(ac, false)
      } else {
        this.disableActionBtn(ac, false)
      }
    })
  }

  /*
    处理用于 复制并新建 时的数据
  */
  formatOldData(data: any) {
    for (const key in data) {
      // 提交给后台只需要id的数据项，复制新建需要给对象数据
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const item = data[key]

        // 复制新增下拉框，复选框需要数组数据
        if (typeof item === "object" && item !== null && item.isString) {
          data[key] = item.value.split(";")
        }
        // 时间格式
        if (typeof item === "object" && item !== null && item.isDate) {
          data[key] = item.val
        }

        // 子表
        if (Array.isArray(item) && item.length) {
          item.forEach(el => {
            this.formatOldData(el)
          })
        }
      }
    }
  }

  /*
    因新增 复制并新建功能 部分控件值构建时返回变更，提交数据需要做对应处理
  */
  formatData(data: any) {
    for (const key in data) {
      // 提交给后台只需要id的数据项，复制新建需要给对象数据
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const item = data[key]

        // 关联单选-提交数据处理（复制表单需要其他数据信息，构建值的时候需要返回对象数据）
        if (typeof item === "object" && item !== null && item.onlyId) {
          data[key] = item.id
        }
        // 关联多选-提交数据处理
        if (Array.isArray(item) && item.length && item[0].onlyId) {
          data[key] = item.map(el => el.id).join(";")
        }

        // 提交下拉框，复选框需要字符串数据
        if (typeof item === "object" && item !== null && item.isString) {
          data[key] = item.value
        }

        // 时间格式
        if (typeof item === "object" && item !== null && item.isDate) {
          data[key] = item.value
        }

        // 子表
        if (Array.isArray(item) && item.length) {
          item.forEach(el => {
            this.formatData(el)
          })
        }
      }
    }
  }

  /**
   * 提交、同意、不同意
   * @param deptId
   * @param agree
   */
  async submit(actionCode: string, deptId: string, agree: boolean, trustor?: string, dataParams?: any) {
    const closeLoader = (this.$message as any).loading()
    let data = this.buildSaveParams(agree) as form.SubmitParams
    let oldData = cloneDeep(data) // 用来做复制新建数据备份
    this.formatOldData(oldData.bizObject.data)
    this.formatData(data.bizObject.data)
    data.agree = agree
    data.actionCode = actionCode
    data.depatmentId = deptId
    data.trustor = trustor
    if (dataParams && dataParams.participantInfos) {
      data.participantInfos = dataParams.participantInfos.map((i: any) => {
        if (typeof i.participantList === "string") {
          i.participantList = i.participantList.split()
        }
        return i
      })
    }
    // 流程模拟，发起流程时提交处理
    if (this.$route.query.workflowMock && this.$route.query.startWorkflowCode) {
      const startWorkflowCode = `${this.$route.query.startWorkflowCode}-mock`
      const _preMockData: any = window.sessionStorage.getItem(startWorkflowCode)
      const mockData = JSON.parse(_preMockData)
      data.simulative = true
      if (mockData && mockData.originator && mockData.originator.length) {
        data.runMode = mockData.runMode
        let isAdmin = false
        if (window.sessionStorage.getItem("user")) {
          // 当前用户为超管的话，在流程模拟时取预设人作为拥有者
          const user: any = JSON.parse(window.sessionStorage.getItem("user") as string)
          isAdmin = user.permissions.includes("ADMIN")
        }
        if (data.bizObject.data["owner"] && !isAdmin) {
          // 如果表单设置了拥有者，流程模拟时需将部门清空，后台默认取主部门
          data.depatmentId = ""
        } else {
          // 如果表单未设置拥有者，流程模拟时取预设发起人作为拥有者
          data.bizObject.data["owner"] = [{ id: mockData.originator[0].id, type: 3 }]
        }
      }
    }
    // 1流程表单 2非流程表单
    data.formType = this.formObj.workflowCode ? "1" : "2"
    data = FormDetailService.mergeReplayToken(data) // 合并 校验码
    let vm = this
    try {
      data.bizObject.data.version = this.formVersion
      const res: any = await formApi.submit(data, this.formPath)
      if (res.errcode === 0) {
        let time = +new Date() + ""
        // @ts-ignore
        if (vm.isSaveAndCreate) {
          // 开启使用历史数据
          localStorage.setItem(time, JSON.stringify(oldData.bizObject.data))
        }
        // @ts-ignore
        if (vm.isSubmitAndCreate) {
          // 提交并继续创建
          if (window.top !== window.self) {
            window.parent.postMessage("reload", "*")
          }

          let href = location.href
          let match = href.match(/useData\=\d+/)
          if (match) {
            href = href.replace(match[0], "useData=" + time)
            location.href = href
            return
          } else {
            location.href = location.href + "&useData=" + time
            return
          }
        } else {
          // this.closePopDetail();
          // return
        }
      } else if (res.errcode === 302036) {
        return this.popErr(res)
      }
      return res
    } finally {
      closeLoader()
    }
  }

  /*
    提交、暂存、驳回、作废 数据已经修改弹窗提示
  */
  popErr(res: any) {
    let vm = this
    this.$confirm({
      content: res.errmsg + "将重新加载数据",
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        vm.reload()
      },
      onCancel() {
        console.log("Cancel")
      }
    })
    return false
  }

  /**
   * 处理异常信息
   * @param res
   * @param defaultMsg
   */
  handleError(res: any, defaultMsg?: string) {
    let msg: string
    switch (res.errcode) {
      case 300004:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips4").toString()
        break
      case 300006:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips5").toString()
        break
      case 301005:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips6", {
          msg: res.errmsg
        }).toString()
        break
      case 304001:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips7").toString()
        break
      case 402500:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips8").toString()
        break
      case 402501:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips9").toString()
        setTimeout(() => {
          this.reload()
        }, 1000)
        break
      case 402517:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips21").toString()
        break
      case 402509:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips10").toString()
        break
      case 402510:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips11").toString()
        break
      case 402511:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips1").toString()
        break
      case 402512:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips2").toString()
        break
      case 402515:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips3").toString()
        break
      case 402513:
        msg = this.$t("cloudpivot.form.runtime.tip.errTips12").toString()
        break
      case 402514:
        msg = res.errmsg //'参与者数量选择不能超过8个用户！';
        break
      case 550010:
        // 直接使用接口返回数据
        msg = res.errmsg
        // let schemaName = "";
        // this.$i18n.locale === "zh"
        //   ? (schemaName = res.data.schemaName)
        //   : (schemaName = JSON.parse(res.data.schemaName_i18n).en || "");
        // msg = this.$t("cloudpivot.form.runtime.tip.errTips18", {
        //   schemaName: schemaName,
        //   businessRuleName: res.data.businessRuleName,
        //   nodeName: res.data.nodeName,
        //   propertyCode: res.data.propertyCode,
        // }).toString();
        break
      case 550006:
        let schemaName = ""
        let targetSchemaName = ""
        this.$i18n.locale === "zh"
          ? (targetSchemaName = res.data.targetSchemaName)
          : (schemaName = JSON.parse(res.data.targetSchemaName_i18n).en || "")
        msg = this.$t("cloudpivot.form.runtime.tip.errTips20", {
          targetSchemaName: targetSchemaName,
          nodeName: res.data.nodeName
        }).toString()
        break
      default:
        msg = defaultMsg || res.errmsg //this.$t('languages.common.tip.operationFail').toString();
        break
    }
    // 重复提交不获取 校验码,否则需要重新获取校验码
    if (res.errcode !== 100005) {
      FormDetailService.setReplayToken(this.formPath)
    }
    this.$message.error(msg, 3)
  }

  /**
   * 作废
   */
  async cancel() {
    let res = await workflowApi.abortInstance(this.workflowInstanceId, this.workItemId, this.formVersion)
    if (res.errcode === 302036) {
      return this.popErr(res)
    }
    return res
  }

  /**
   * 删除
   */
  delete() {
    let p
    if (this.workflowInstanceId) {
      p = workflowApi.deleteInstance(this.workflowInstanceId, this.workItemId, this.formVersion)
    } else {
      const params = this.$route.query as any
      p = formApi.delete(
        {
          schemaCode: params.schemaCode,
          objectId: params.objectId
        },
        this.formPath
      )
    }
    return p.then(res => {
      if (res.errcode === 302036) {
        return this.popErr(res)
      }

      const msg = this.$t("cloudpivot.form.runtime.tip.deleteSuccess").toString()
      this.$message.success(msg, 3)
      this.closePopDetail()
      return res
    })
  }

  /**
   * 结束
   */
  finish() {
    return workflowApi.finishInstance(this.workflowInstanceId)
  }

  /**
   * 撤回
   */
  retrieve() {
    const params = {
      workflowInstanceId: this.workflowInstanceId,
      activityCode: this.formObj.activityCode,
      workItemId: this.formObj.workItemId
    } as any
    return workflowApi.revokeWorkItem(params).then(res => {
      const msg = this.$t("cloudpivot.form.runtime.tip.retrieveSuccess").toString()
      this.$message.success(msg, 3)
      return res
    })
  }

  /**
   * 催办
   * 客户端调用dd接口，web端调用api接口
   * @param data { content: 催办内容, instanceId: 实例id }
   */
  urgeHandler(data: any) {
    const type: number = utils.Common.isDingtalk ? 0 : 1
    this.urgeHandler_common(data, type)
  }

  /**
   * 催办通用
   * @params urgeType 0：客户端ding消息；1：web端钉钉通知
   */
  async urgeHandler_common(data: any, urgeType: number) {
    const { content, instanceId } = data
    const params: form.SaveDingParams = {
      urgeType: urgeType,
      instanceId: instanceId,
      text: content
    }
    const res = await formApi.saveDing(params)
    if (res.errcode === 0) {
      this.$message.success(this.$t("cloudpivot.form.runtime.urge.urgeSuccess"), 3)
      const modal = this.$refs.actionModal as any as FormActionModal
      modal.close()
    } else if (res.errcode === 10024) {
      // 当前处理人是你自己，不能催办自己
      this.$message.error(this.$t("cloudpivot.form.runtime.urge.cantUrgeSelf"), 3)
    } else {
      this.$message.error(this.$t("cloudpivot.form.runtime.urge.urgeFailed"), 3)
    }
  }

  /**
   * 催办钉钉客户端
   * type mobile 移动端   pc 客户端
   */
  async urgeHandler_dd(data: any) {
    const { content, instanceId, type } = data
    const { corpId } = (window as any).Environment
    const vm: any = this
    const res = await formApi.getTodoUsers(instanceId)
    if (res.errcode === 0) {
      const users = res.data
      const owner: string = this.formObj.bizObject.owner.name
      const instanceName: string = this.formObj.instanceName as string

      const text = `内容: ${content}\n发起人: ${owner}\n流程名称: ${instanceName}`

      // 2.0版本接口报权限错误 故使用1.0版本 20190610
      ;(window as any).dd.biz.ding.post({
        users, //用户列表，userid
        corpId, //加密的企业id
        type: 1, //钉类型 1：image  2：link
        alertType: 2,
        alertDate: { format: "yyyy-MM-dd HH:mm", value: "2015-05-09 08:00" },
        attachment: {
          images: [""] //只取第一个image
        }, //附件信息
        text, //消息体
        onSuccess: function (result: any) {
          // tip: 点击取消也会执行这个回调，但是点击取消的时候，result为空
          // tip: result不为空时，此时点击了发送并成功
          // result在移动端 undefinded -> 点击取消   object -> 点击了发送
          // result在pc端相反
          if (type === "mobile") {
            if (result && result.dingCreateResult) {
              vm.urgeHandler_common(data, 0)
            }
          }

          if (type === "pc") {
            if (!result) {
              vm.urgeHandler_common(data, 0)
            }
          }
        },
        onFail: function () {}
      })
    } else if (res.errcode === 10024) {
      // 当前处理人是你自己，不能催办自己
      this.$message.error(this.$t("cloudpivot.form.runtime.urge.cantUrgeSelf"), 3)
    } else {
      this.$message.error(this.$t("cloudpivot.form.runtime.urge.netError"), 3)
    }
  }

  async getDataModal() {
    // const res = await listApi.getDataItemList({
    //   schemaCode: this.formObj.bizSchema.code
    // });
    // const { errcode, errmsg, data } = res;
    // if (errcode === 0) {
    // } else {
    //   this.$message.error(errmsg);
    // }
    this.dataModalList = this.formObj.bizSchema.properties
  }

  //  判断是否json字符串
  checkIsJSON(str: any) {
    if (typeof str == "string") {
      try {
        const obj: any = JSON.parse(str)
        return !!(typeof obj == "object" && obj)
      } catch (e) {
        return false
      }
    }
    return false
  }

  destroyed() {
    delete (window as any).h3form
  }
}
