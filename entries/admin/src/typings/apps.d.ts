declare namespace Apps {
  /* 应用中心首页 */
  namespace AppCenter {
    /* 应用状态声明 */
    interface State {
      appList: Array<AppInfo>,
      appGroupList: Array<AppGroup>
      loading?: boolean,
      appGroupListAll: Array<AppGroup>
      appInfo: AppInfo,
      showEditDrawer: boolean,
      groupKey: string,
      appCount: number
    }
    /* 单个应用分组的信息 */
    interface AppGroup {
      id: string,
      code: string,
      name: string,
      children?: any
    }
    /* 单个应用的信息 */
    interface AppInfo {
      agentId?: '',
      appKey?: '',
      appSecret?: '',
      code: string,
      createdTime?: string,
      disable?: boolean,
      id?: string,
      logoUrl?: string,
      logoUrlId?: string,
      modifiedTime?: string
      name: string,
      name_i18n?: string,
      displayName?: string,
      sortKey?: number,
      appNameSpace?: string,
      groupCode?: string
    }
    /* 应用中心首页应用列表信息 */
    interface AppList {
      list: Array<AppInfo>
    }
    /* 删除引用传参信息 */
    interface AppInfoParams {
      appCode: string
    }
    /* 应用排序传参信息 */
    interface AppSortParams {
      appCode: string,
      sortKey: number
    }

    /* 应用管理新建编辑表单信息 */
    interface AppFormParams {
      formName: string,
      formCode: string,
      icon?: string,
      formType?: number,
      pcUrl?: string,
      mobileUrl?: boolean,
      mobileUrlInput?: string,
      printUrl?: boolean,
      printUrlInput?: string
    }

    /* 应用管理新建编辑表单信息 */
    interface AppFormParams {
      formName: string,
      formCode: string,
      icon?: string,
      formType?: number,
      pcUrl?: string,
      mobileUrl?: boolean,
      mobileUrlInput?: string,
      printUrl?: boolean,
      printUrlInput?: string
    }

    /* 应用管理新建编辑表单信息 */
    interface AppFormParams {
      formName: string,
      formCode: string,
      icon?: string,
      formType?: number,
      pcUrl?: string,
      mobileUrl?: boolean,
      mobileUrlInput?: string,
      printUrl?: boolean,
      printUrlInput?: string
    }

    /* 应用管理新建编辑表单信息 */
    interface AppFormParams {
      formName: string,
      formCode: string,
      icon?: string,
      formType?: number,
      pcUrl?: string,
      mobileUrl?: boolean,
      mobileUrlInput?: string,
      printUrl?: boolean,
      printUrlInput?: string
    }

    interface DefinePageParams {
      code: string
      icon: string
      id: string
      mobileUrl: string
      name: string
      openMode: string
      parentId: string
      pcUrl: string
      appCode: string
    }

    interface DefinePage {
      code: string
    }

  }
  /* 表单设计 */
  namespace ListDesign {
    interface AsideInfo {
      index: number,
      thefieldBlock: number,
      operationAarry: any[],
      showFieldArray: any[],
      sortArray: any[],
      payloadOptions: Array<Query>,
      saveFlag: boolean,
      ChangeFlag: boolean,
      queryActiBtn: Array<Object>,
      edit: boolean,
      name: string,
      code: string,
      name_i18n: string,
      backupsName: string,
      formList: any[],
      headerList: any[],
      workflowList: any[],
      clientType: string,
      isShowPop: boolean,
      filterTipsFlag: boolean,
      presentationType: string,
      isPublish: boolean,
      saveCompleted: boolean,
      queryViewDataSource: any
    }
    interface Query {
      default: string,
      name: string,
      options: any,
      isShow: boolean,
      showType: number,
      data: any
    }
  }
  /* 应用目录、模型 */
  namespace AppItem {
    interface ItemTree {
      // 定义目录树结构请求参数
      appCode?: string
      isPortal?: boolean
      groupId?: string
    }
    interface appManagerModel {
      // 定义获取子管理员管理的应用模型过滤参数
      filterType?: string
    }
    interface AddFolders {
      // 定义新建目录请求参数
      appCode: string,
      name: string,
      parentId: string,
      name_i18n: string
    }
    interface UpdateFolders {
      // 定义修改目录请求参数
      parentId?: string,
      id: string,
      name: string,
      name_i18n: string
    }
    interface DeleteFolders {
      // 定义删除目录请求参数
      folderId: string
    }
    interface ValidFolder {
      // 校验目录节点下是否存在业务模型请求参数
      folderId: string,
      appCode: string
    }
    interface AddBizModel {
      // 定义新增业务模型请求参数
      appCode: string,
      name: string,
      modelType: string,
      parentId: string,
      bizSchemaCode: string,
      icon: string,
      name_i18n: string,
      pcAble: boolean,
      mobileAble: boolean,
    }
    interface UpdateBizModel {
      // 定义修改业务模型请求参数
      id: string,
      name: string,
      bizSchemaCode: string,
      icon: string,
      parentId: string,
      modelType: string,
      name_i18n: string,
      pcAble: boolean,
      mobileAble: boolean
    }
    interface DeleteBizModel {
      // 定义删除业务模型请求参数
      bizModelId: string
    }
    interface AddReport {
      appCode: string,
      name: string,
      parentId: string,
      code: string,
      icon: string,
      name_i18n: string,
      pcAble: boolean,
      mobileAble: boolean
    }
    interface UpdateReport extends AddReport {
      id: string
    }

    interface DeleteReport {
      code: string
    }

    interface ValidBizModel {
      // 校验业务模型节点下是否存在业务数据请求参数
      bizModelId: string,
      appCode: string
    }
    interface AppItemSortParams {
      // 应用目录排序参数
      code: string,
      sortKey: number,
      parentId: string
    }
    interface State {
      appMenu: Array<AppMenu>,
      appMenuLoaded: boolean,
      appInfo: ItemTree,
      floders: Array<AppMenu>,
      openKeys: Array<string>,
      menuId: string
    }
    interface AppMenu {
      // 应用目录、业务模型
      code?: string,
      id: string,
      icon: string,
      name: string,
      parentId?: string,
      type: string,
      sortKey: number,
      children?: Array<AppMenu>
    }

    interface ExportModelParams { // 业务模型导出参数
      schemaCode: string
    }
    interface bizpropertyReferParams { // 数据模型查看应用参数
      schemaCode: string,
      bizPropertyCode: string
    }

    interface CheckModelParams { // 业务模型校验参数
      fileName: string,
      schemaCode: string,
      coverAble: boolean,
      map?: object
    }

    interface ImportModelParams { // 导入模型参数
      schemaCode: string,
      fileName: string,
      coverAble: boolean,
      parentId: string
    }

    interface ValidateRespone {
      count: number,
      errorType: number,
      name: string,
      repeated: boolean,
      result: boolean,
      schemaCode: string,
      resultInfo: string
    }

    interface CheckAppParams {
      appCode: string
      fileName: string
      override: boolean
      dmCodeList: any[],
      subCodeList: any[],
      fromAppMarket: boolean
    }
  }
  /* 数据模型 */
  namespace Datamodel { // 数据模型
    interface SavaDataItem {
      bizPropertyJson: string,
      subSchemaJson: string,
      propertiesJson: string
    }
    interface State {
      bizSchemaCode: string,
      bizSheetCode: string,
      bizPropertyCode: string,
      isLoading: boolean,
      dataItemList: Array<DataItem>,
      filterDataItemList: Array<DataItem>,
      summaryList: Array<any>
      dataItemTypeList: Array<DataType>,
      keyWords: string,
      relativeCode: string, // 业务模型code
      bussinessType: any[], // 业务模型
      dataItemDetails: object, // 数据项详情
      editMode: string,
      drawerVisible: boolean, // drawer显示隐藏
      bizPropertyModel: object // 发送给服务器属性
      bizSchemaModelList: any[] // 发送给服务器-子表
      targetSummary: Array<Summary>,
      defaultSummary: Array<string>,
      formData: {}, // 表单数据详情
      loading?: boolean,
      dataItem?: Array<DataItem>, //所有数据项
      formRuleList?: any[], //所有的校验规则
      formSystemVersion?: string, // 表单版本
    }

    interface Summary {
      isDataItem: number,
      code: string
    }
    interface DataType {
      name: string,
      index: number
    }
    interface PostDataItemParms { // 保存数据项
      bizPropertyModel: DataItem
    }
    interface StorageItem { // 存储选项
      StorageItem: any[]
    }
    interface StorageTypes {
      empty: boolean,
      index: boolean
    }
    interface DataItem {
      defaultProperty: boolean,
      index?: number,
      name: string,
      code: string,
      bizSchemaCode: string,
      published: boolean,
      propertyType: string,
      formPropertyType?: any,
      defaultValue: any,
      propertyIndex: boolean,
      propertyEmpty: boolean,
      subBizSchemaCode: string,
      id: string,
      children: Array<ChildeDataItem>,
      key: string,
      propertyName: string,
      propertyNum: number,
      subSchema: SubSchemaObj,
      isSchema: boolean,
      isSubItem?: boolean,
    }
    interface ChildeDataItem {
      index?: number,
      name: string,
      code: string,
      bizSchemaCode: string,
      published: boolean,
      propertyType: string,
      defaultValue: any,
      propertyIndex: boolean,
      propertyEmpty: boolean,
      subBizSchemaCode: string,
      id: string,
      key: string,
      propertyName: string,
      propertyNum: number,
      isSchema: boolean,
      defaultProperty: any
    }
    interface SubSchemaObj {
      properties: Array<ChildeDataItem>
    }
    /* { // 子表
      name: string,
      code: string,
      published: boolean,
      summary: string,
      id: string,
      remarks: string,
      createdTime: string,
      modifiedTime: string,
      deleted: boolean,
      creater: string,
      modifier: string

    } */
    interface CommonParmas {
      id: string
    }
    interface DataItemListParams {
      schemaCode: string,
      formCode?: string,
      isPublish?: boolean,
      sortType?: string
    }
    interface DeleteParams {
      bizSchemaCode: string,
      bizPropertyCode: string
    }
    interface PublishParams {
      bizSchemaCode: string,
    }
    interface SummaryParams {
      schemaCode: string,
      summary: string
    }
  }
  /* 流程设计 */
  namespace Workflow {
    /* 应用管理请求流程列表 */
    interface WorkflowSchemaCode {
      schemaCode: string
      isPortal?: boolean
    }

    interface WorkflowCode {
      workflowCode: string
    }

    interface CreateWorkflowParams {
      schemaCode?: string,
      id?: string,
      workflowCode: string,
      workflowName: string,
      icon: string
    }

    interface workflowList {
      icon: string,
      id: string,
      mobileOriginate: true,
      pcOriginate: true,
      schemaCode: string,
      sortKey: number,
      workflowCode: string,
      workflowName: string
    }

    // 获取函数列表传参
    interface FormulaParams {
      schemaCode: string,
      type: string,
    }

    interface ValidateFormulaParams {
      function: string,
      schemaCode: string,
    }

    interface FormularItem {
      childrenFunctions: Array<FormularItem> | null,
      code: string | null,
      description: string | null,
      displayName: string,
      fullName: string | null,
      id: string | null,
      parentId: string | null,
    }

    interface FormularTreeItem {
      children?: Array<FormularTreeItem>,
      code: string | null,
      icon?: string,
      id: string | null,
      isLeaf: boolean,
      key: string,
      selectable?: boolean,
      title: string,
      expression?: string,
      parentCode?: string | null
    }

    interface ParticipantForm {
      formula: string,
      expression: string,
      subExpression?: string
    }

    interface FormulaDescription {
      code: string,
      text: string,
    }

    /* 条件设置弹窗数据 */
    interface LineConditionForm {
      expression: string,
      formula: string
    }

    interface LineConditions {
      connection: string,
      ruleList: Array<LineConditionItem>
    }

    interface LineConditionItem {
      dataItemCode: string,
      rule: string,
      text: string,
      valueType: string,
      errorMsg?: string,
    }
  }
  /* 流程设置 */
  namespace WorkflowSetting {
    // 创建流程权限请求参数
    interface CreatePermissionParams {
      unitId: string,
      unitType: number,
      workflowCode: string
    }
    // 获取流程权限列表请求参数 && 获取流程模板历史列表
    interface GetPermissionListParams {
      workflowCode: string
    }
    // 删除流程权限请求参数
    interface DeletePermissionParams {
      permissionId: string
    }
    //获取某个版本且为发布状态的流程模板参数
    interface GetHistoryWorkflowParams {
      workflowCode: string,
      workflowVersion: number
    }
  }
  /* 表单发布历史 */
  namespace FormHis {
    interface State {
      currentVersion?: string,
      currentHistoty: FormHisModel
    }
    interface FormHisModel {
      id?: string,
      remarks?: string,
      createdTime?: string
      modifiedTime?: string,
      deleted?: boolean,
      createdBy?: string,
      modifiedBy?: string,
      name?: string,
      name_i18n?: string,
      code?: string,
      icon?: string,
      schemaCode?: string,
      published?: boolean,
      sortKey?: number,
      pcUrl?: string,
      mobileUrl?: string,
      publishedViewJson?: string,
      draftAttributesJson?: string,
      draftHtmlJson?: string,
      publishedHtmlJson?: string,
      draftActionsJson?: string,
      publishedActionsJson?: string,
      shortCode?: string,
      printTemplateJson?: string,
      settingPrint?: boolean,
      qrCodeAble?: string,
      pdfAble?: string,
      tempAuthSchemaCodes?: string,
      borderMode?: string,
      layoutType?: string,
      formComment?: boolean,
      subTip?: string,
      publishBy?: string,
      version?: number,
      tempAuthSchemaCodeSet: Array<any>
    }
  }
}
