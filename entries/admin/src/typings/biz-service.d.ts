declare namespace BizService {
  interface ParamterItem {
    code: string,
    name: string,
    desc: string,
    required: boolean,
    value?: string
  }
  interface AuthItem {
    code: string,
    name: string,
    parameterlist: ParamterItem[]
  }

  interface AdapterConfig {
    code: string,
    name: string,
    config: {
      authList: AuthItem[],
      commonList: ParamterItem[]
    }
  }

  namespace Category {
    interface CreateParams {
      name: string
    }
    interface DeleteParams {
      id: string
    }
    interface Item {
      id: string,
      name: string,
      showPop?: boolean,
    }
    interface UpdateParams extends Item { }
  }

  namespace Service {
    interface CreateParams {
      code: string,
      configJson: string,
      description: string,
      name: string,
      adapterCode: string,
      serviceCategoryId: string,
      shared: boolean,
      userIdList: any
    }
    interface DeleteParams {
      id: string
    }
   
    interface ExportParams {
      serviceCodes:any[]
    }

    interface ImportParams {
      fileName:string,
      groupId:string,
      overWrite?:boolean,
    }

    interface CheckParams {
      fileName:string,
      overWrite:boolean,
      modifiedServiceCodes:any,
    }
     
    interface ListParams {
      categoryId: string
    }
    interface Item extends CreateParams {
      id: string,
      modifiedTime: string,
      methods?: Method.Item[],
      isRestful?: boolean,
      isSoap?: boolean,
      isDatabase?: boolean,
    }
    interface UpdateParams extends CreateParams {
      id: string,
    }
    interface OptionItem {
      code: string,
      name: string,
      id: string,
      modifiedTime: string,
      disabled?: boolean
    }
    interface QueryBindBizmethodParams {
      serviceMethodCode?: string,
      serviceCode: string,
    }

    interface GetReferenceParams {
      serviceCode: string,
      serviceMethodCode: string,
    }

    interface RefreshSoapParams {
      serviceCode: string
    }
  }

  namespace Method {
    interface CreateParams {
      code: string,
      adapterType?: any,
      configJson: string,
      description: string,
      inputParametersJson: string,
      name: string,
      outputParametersJson: string,
      serviceCode: string,
    }
    interface Item extends CreateParams {
      id: string,
      adapterType?: number
    }
    interface UpdateParams extends CreateParams {
      id: string
    }
    interface TestParams {
      code: string,
      serviceCode: string,
      testInputParametersMap: object,
    }

    interface DeleteParams {
      id: string
    }
    interface DetailsParams extends DeleteParams { }
    interface ListByCodeParams {
      serviceCode: string
    }

    interface InputParam {
      code: string,
      name: string,
      configJson?: {
        position?: number
      },
      bizPropertyType: number,
      description: string,
      index?: number,
      sortKey?: string,
    }
    interface sqlParam {
      code: string,
      name: string,
      type: string,
      description: string,
      index?: number,
      sortKey?: string,
      operator: string,
      value: any,
    }
    interface OutputParam extends InputParam { }

    interface MethodConfig {
      httpType: number,
      requestBodyType: number,
      url: string
    }

    interface SqlMethodConfig {
      sql?: string,
      countSql?: string,
      sqlType?: string,
      dataTable?: string,
      returnType?: string,
      functionName?: string,
      structName?: string,
      tableName?: string
    }

    interface ListDatatableParams {
      serviceCode: string
    }

    interface ListDatatableColumnParams {
      serviceCode: string,
      tableName: string,
    }

    interface DatatableColumn {
      sql: string,
      sqlType: string,
    }
  }

  namespace Folder {
    interface CreateParams {
      name: string
    }
    interface DeleteParams {
      id: string
    }
    interface Item {
      id: string,
      name: string,
      showPop?: boolean,
    }
    interface UpdateParams extends Item { }
  }

  namespace Datasource {
    interface CreateParams {
      code: string,
      configJson: string,
      description: string,
      name: string,
      outputParametersJson: string,
      datasourceCategoryId?: string,
      dataBaseConnectId: string,
      sqlConfig: string,
      serviceCategoryId: string,
      shared: boolean,
      userIdList: any,
      sharedIds: any,
      inputParamConfig: string
    }
    interface DeleteParams {
      id: string
    }
    interface ListParams {
      categoryId: string
    }
    interface Item extends CreateParams {
      id: string,
      dataBaseConnectId: string,
      sqlConfig: string,
      outputParametersJson: string,
      inputParamConfig: string,
      modifiedTime: string,
      methods?: Method.Item[],
      isRestful?: boolean,
      isSoap?: boolean,
      isDatabase?: boolean,
      serviceCode: string
    }
    interface UpdateParams extends CreateParams {
      id: string,
    }
    interface OptionItem {
      code: string,
      name: string,
      id: string,
      modifiedTime: string,
      disabled?: boolean
    }
    interface QueryBindBizmethodParams {
      serviceMethodCode?: string,
      serviceCode: string,
    }

    interface GetReferenceParams {
      serviceCode: string,
      serviceMethodCode: string,
    }

    interface RefreshSoapParams {
      serviceCode: string
    }

    interface SqlMethodConfig {
      sql: string,
      countSql: string,
      sqlType?: string,
      dataTable?: string,
      returnType?: string,
      dbconnpool:string,
    }

  }
}
