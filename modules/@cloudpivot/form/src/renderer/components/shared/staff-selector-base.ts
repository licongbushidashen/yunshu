import { Vue, Prop, Watch } from "vue-property-decorator"

import { StaffSelectorControl, UserStatus, DepartmentInfo, OrganizationType } from "../../controls"
const MAPPING_FIELD_OPERATE = "MAPPING_FIELD_OPERATE_" // 选人控件 特殊的映射字段 额外处理方法名 前缀

export abstract class StaffSelectorBase extends Vue {
  mainDepartment: any = null // 主部门

  partTimerDepartment: any = null // 兼职部门

  @Prop({
    default: () => {}
  })
  options!: any
  // 过滤条件需要的参数
  @Prop({
    default: () => {}
  })
  params!: any

  //表单列表多选控件才具有精简功能
  @Prop({
    default: false
  })
  onlyForm!: boolean

  @Prop({
    default: false
  })
  disabled!: boolean

  @Prop()
  controlOpts: any

  org: any[] = []

  searchList: any[] = []

  @Prop()
  value!: any[]
  @Prop({ default: "" })
  placeholder!: string

  /**
   * 基于此bug #43245
   * 涉及子管理员组织管理范围的某些部门不可删除，但是可以查看
   * 故将不可删除的部门传进来，做删除才做时，可做判断
   * 20200507 不要John
   * */
  @Prop({ default: () => [] })
  keepDeptIds!: any[]

  selected: any = []

  currentDept?: DepartmentInfo
  blackList?: Array<string> = ["#/system/manager-setting"]
  isFirstLoad: boolean = true

  @Prop({
    default: false
  })
  appManagerFilter?: boolean

  get locale() {
    return localStorage.getItem("locale") || "zh"
  }

  @Watch("value", {
    immediate: true
  })
  setValue(vals: any[]) {
    if (!vals) {
      return
    }
    if (Array.isArray(vals)) {
      this.selected = vals.map(this.convert)
    } else {
      this.selected = [vals].map(this.convert)
    }
  }

  mounted() {
    console.log("ds")
  }

  @Watch("options", {
    immediate: true
  })
  handleFocus(opts: any) {
    if (!opts.showSelect && opts.showModel) {
      this.treeFocus()
    }
  }

  convert(x: any) {
    return {
      id: x.id || x.key,
      key: x.id || x.key,
      name: x.name,
      type: x.type === 3 ? "user" : "org",
      source: x,
      avatar: x.imgUrl,
      /**
       * 基于此bug #43245 做一个拓展
       * 拓展逻辑：当前部门不在子管理员的组织管理范围内的，只可查看，不可删除
       * 故增加此字段以做删除逻辑时判断
       * 2020-05-07 by John
       * */
      operatable: x.operatable
    }
  }

  get rootId() {
    let id = ""
    if (this.options && this.options.rootNode && this.options.rootNode.length > 0) {
      id = this.options.rootNode[0].id || ""
    }
    return id
  }

  get rootIds() {
    let resId = ""
    if (this.options && this.options.rootNode && this.options.rootNode.length > 0) {
      // resId = this.options.rootNode[0].id || '';
      resId = this.options.rootNode
        .map((node: any) => node.id as string)
        .filter((id: string) => !!id)
        .join(",")
    }
    return resId
  }

  get roleId() {
    if (this.options && this.options.role) {
      return this.options.role.value || ""
    }
    return ""
  }

  get filterType() {
    if (this.options.appManagerFilter || this.appManagerFilter) {
      return "admin"
    } else {
      return ""
    }
  }

  treeFocus() {
    this.onClickTrunBack()
  }

  // 树-返回
  onClickTrunBack() {
    this.currentDept = undefined
    this.getOrgsAndUsers()
  }

  // 树-下一级
  onClickNextHierarchy(val: any) {
    if (val && val.id) {
      this.currentDept = val.source
      this.getOrgsAndUsers()
    }
  }

  onClickBreadcrumb(val: any) {
    if (val && val.id) {
      this.currentDept = val.source
      this.getOrgsAndUsers()
    }
  }

  onChange(items?: any[]) {
    let selecteds: any[] = []
    if (items && items.length > 0) {
      const ids: string[] = items.map(x => x.key)
      selecteds = this.selected.filter((item: any) => ids.indexOf(item.id) > -1)
    }
    let list: any[] = []
    if (selecteds.length > 0) {
      list = selecteds.map(x => x.source)
    }

    this.$emit("change", list)
  }

  async onOk(items: any[]) {
    //主部门、兼职部门
    items.map((item: any) => {
      if (item.source && item.source.departments) {
        //主部门的id
        this.mainDepartment = item.source.departments.filter((x: any) => x.id === item.source.departmentId)
        //兼职部门的id
        this.partTimerDepartment = item.source.departments.filter((x: any) => x.id !== item.source.departmentId)
      }
    })
    // 给数据设置区分主部门和兼职部门
    items.forEach((x: any) => {
      x.source.departments = this.mainDepartment
      x.source.partTimerDepartment = this.partTimerDepartment
    })
    items.length && (await this.onlyFormModal(items))
    if (items.length === 1) {
      this.getOrganizationLevel(items)
    } else {
      const list = items.map(x => x.source)
      this.$emit("ok", list)
      this.$emit("change", list)
    }
  }
  // 单选模式下 ok 或 change事件需要处理的 业务
  async onlyFormModal(items: any[]) {
    await this.mappingOperate(items[0])
  }
  // 选人控件 映射相关的业务
  async mappingOperate(item: any) {
    let self: any = this
    if (this.controlOpts && this.controlOpts.mappings) {
      let mappings = this.controlOpts.mappings
      if (mappings) {
        // 获取所有映射的 字段
        let arr_mapping = mappings
          .slice(0, -1)
          .split(";")
          .map((val: any) => val.split(":")[0])
        for (let mapping_item of arr_mapping) {
          if (self[MAPPING_FIELD_OPERATE + mapping_item]) {
            await self[`${MAPPING_FIELD_OPERATE}${mapping_item}`](item)
          }
        }
      }
    }
  }

  // 映射字段-manager-主管 获取信息
  async [MAPPING_FIELD_OPERATE + "manager"](item: any) {
    let params = { userId: item.id, ...this.params }
    // portal端参数处理
    if (this.controlOpts && this.controlOpts.params) {
      let opts = JSON.parse(this.controlOpts.params)
      params = { ...params, ...opts }
    }
    return new Promise((resolve, reject) => {
      StaffSelectorControl.service.getDeptLeader({ userId: item.id, ...params }).then((data: any) => {
        if (data.length) {
          item.source["manager"] = data
        }
        // else {
        //   item.source["manager"] = [{ name: "陈总", id: 12323 }];
        // }
        resolve(item)
      })
    })

    // const list = items.map(x => x.source);
    // this.$emit("ok", list);
    // this.$emit("change", list);
  }

  onCancle() {
    this.$emit("cancel")
  }

  // 获取组织层级（部门）
  getOrganizationLevel(items: any[]) {
    StaffSelectorControl.service.getOrganizationLevel(items[0].id).then(data => {
      if (this.controlOpts && this.controlOpts.mappings) {
        const mappings = this.controlOpts.mappings
        let item: any = items[0]
        if (data) {
          if (data.length > 0) {
            if (mappings) {
              if (mappings.indexOf("LEVEL") > -1) {
                mappings.split(";").forEach((m: any) => {
                  if (m.indexOf("LEVEL") > -1) {
                    let level = m.split(":")[0]
                    //判断当前返回的组织层级是否与映射的组织层级对应
                    if (level.split(",")[1] < data.length) {
                      item.source[level] = []
                      item.source[level].push(data[level.split(",")[1]])
                    } else {
                      item.source[level] = []
                      item.source[level].push(data[data.length - 1])
                    }
                  }
                })
              }
            }
          }
        }
      }
      const list = items.map(x => x.source)
      this.$emit("ok", list)
      this.$emit("change", list)
    })
  }

  // 获取该级的树和用户
  getOrgsAndUsers() {
    let promises: any[] = []
    if (this.currentDept) {
      const dept = this.currentDept
      // if (dept.leaf && dept.employees === 0) {
      //   this.org = [];
      // } else {
      //   if (dept.leaf === false) {
      if (this.options.appManagerFilter || this.appManagerFilter) {
        promises.push(this.getDepts(dept.id, "admin"))
        promises.push(this.getUsers(dept.id, "admin"))
      } else {
        promises.push(this.getDepts(dept.id))
        promises.push(this.getUsers(dept.id))
      }

      // }
      // if (dept.employees > 0) {

      // }
      // }
    } else {
      const roots = this.options.rootNode
      if (!roots || roots.length < 2) {
        const rootId = this.rootId
        if (this.options.appManagerFilter || this.appManagerFilter) {
          promises.push(this.getDepts(rootId, "admin"))
        } else {
          promises.push(this.getDepts(rootId))
        }
        if (rootId) {
          promises.push(this.getUsers(rootId))
        }
      } else if (roots && roots.length > 1) {
        promises.push(this.getDepts(this.rootIds))
      }
    }

    Promise.all(promises).then(res => {
      let orgs: any[] = []
      res.forEach(x => (orgs = orgs.concat(x)))
      this.org = orgs
    })
  }

  async getDepts(deptIds?: string, filterType?: string, deptIdTwo?: any) {
    // 额外需要的过滤参数
    let params = { deptIds, filterType, ...this.params }
    // portal端参数处理
    if (this.controlOpts && this.controlOpts.params) {
      let opts = JSON.parse(this.controlOpts.params)
      params = { ...params, ...opts }
    }
    params = this.processParams(params)
    console.log(params, "params")
    // @ts-ignore
    const res = await StaffSelectorControl.service.getDepartmentsBy(
      params.deptIds || "",
      params.filterType || "",
      params.sourceType || "",
      params.corpId || "",
      params.excludeCorpId || "",
      params.selectUserIds || ""
    )

    const nodes = res.departments
    const orgTree = this.resetTree(nodes, [])

    let myDepartentTree: any[] = []
    let exitSameDepartent = true

    if (res.myDepartment) {
      const myDepartent: any = res.myDepartment
      // myDepartent. = '';
      myDepartentTree = this.resetTree(myDepartent, [])
      // 增加我的部门显示
      myDepartentTree.forEach(res2 => {
        res2.copyName = "我的部门"
      })

      // 判断我的部门是不是和当前部门一致 一致的话就不现实
      const myDepartentID = myDepartentTree[0].id
      exitSameDepartent = orgTree.some(i => i.id === myDepartentID)
    }

    return exitSameDepartent ? orgTree : [...orgTree, ...myDepartentTree]
  }

  async getUsers(deptId: string, filterType?: string) {
    let param = {}
    if (this.params) {
      // @ts-ignore
      param = JSON.parse(JSON.stringify(this.params))
    }
    // if (param.hasOwnProperty('sourceType')) {
    //   // @ts-ignore
    //   delete param.sourceType

    // }
    let params: any = { deptId, roleId: this.roleId, filterType, ...param }
    // params = this.processParams(params);
    // @ts-ignore
    const users: any = await StaffSelectorControl.service.getUsersBy(
      params.deptId || "",
      params.roleId || "",
      params.filterType || "",
      params.sourceType || ""
    )

    // 过滤没激活状态的用户
    let enableUsers = users.filter((u: any) => u.status === UserStatus.Enable)
    if (this.options && this.options.filterUser && this.options.filterUser.length > 0) {
      //加签状态选择加签人员过滤当前处理人
      this.options.filterUser.forEach((f: any) => {
        enableUsers.forEach((e: any, i: number) => {
          if (e.id === f.id) {
            enableUsers.splice(i, 1)
          }
        })
      })
    }
    const userTree = this.resetTree(enableUsers, [])

    return userTree
  }

  // 组装接口异步数据
  resetTree(nodes: any, orgTree: Array<any>) {
    nodes.forEach((node: any) => {
      // 是否递归为false，不让进入下级部门
      let hasChild = true
      // if (this.options.recursive === false) {
      //   hasChild = false;
      // } else {
      //   hasChild = !node.leaf || (node.employees && node.employees > 0);
      // }
      orgTree.push({
        id: node.id,
        name: node.name,
        avatar: node.imgUrl,
        type: node.type === OrganizationType.User ? "user" : "org",
        hasChild,
        orglist: node.parentDepartmentName || "",
        title: `${node.name} (${node.employees || 0})`,
        isLeaf: node.leaf,
        key: node.id,
        sortKey: "0", // ERROR
        parentId: node.parentId,
        children: [],
        source: node
      })
    })
    return orgTree
  }

  onSearch(name: string) {
    if (!name) {
      return
    }
    let params = {
      name,
      deptIds: this.rootIds,
      roleIds: this.roleId,
      filterType: this.filterType,
      ...this.params
    }
    // portal端参数处理
    if (this.controlOpts && this.controlOpts.params) {
      let opts = JSON.parse(this.controlOpts.params)
      params = { ...params, ...opts }
    }
    params = this.processParams(params)
    // @ts-ignore
    StaffSelectorControl.service
      .search(
        params.name || "",
        params.queryType || "",
        params.deptIds || "",
        params.roleIds || "",
        params.filterType || "",
        params.sourceType || "",
        params.corpId || "",
        params.excludeCorpId || "",
        params.workflowInstanceId || "",
        params.activityCode || "",
        params.formRootDeptIds || ""
      )
      .then((data: any) => {
        const list: any[] = []
        if (data.departments && this.options.selectOrg) {
          this.resetTree(data.departments, list)
        }
        if (data.users && this.options.selectUser) {
          this.resetTree(data.users, list)
        }
        this.searchList = list
      })
  }

  /**
   * @desc 选人控件前台筛选
   * @param params 请求参数
   */
  processParams(params: any) {
    return params

    let path = this.$route.path
    // admin端不需要做处理
    if (path.includes("admin")) {
      return params
    }
    let userInfo: any = sessionStorage.getItem("user")
    if (userInfo) {
      userInfo = JSON.parse(userInfo)
    }
    // 主组织可以看到关联组织的信息管理不能看到主组织的信息
    // MAIN 主
    // Re   关联组织
    if (userInfo.relatedOrgType === "MAIN") {
      // params.sourceType = 'admin'
    } else {
      delete params.sourceType
    }
    // 表单有根节点的时候需要特殊处理
    if (this.isFirstLoad && path === "/form/detail") {
      let { deptIds } = params
      this.isFirstLoad = false

      // 如果说有根节点 需要删除sourceType参数
      if (deptIds) {
        delete params.sourceType
      }
    }
    // 有根节点需要删除sourceType
    return params
  }
}
