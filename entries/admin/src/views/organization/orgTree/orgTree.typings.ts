export interface OrgTree {

  /**************** data ********************/

  // 组织树数据
  orgTree: any[]

  // 已展开的节点key值
  expandedKeys: string[]

  // 当前节点数据
  curNodeState: any

  // 已选中的节点状态key值
  selectedKeys: string[]

  // 当前树的位置信息
  nodePos: string


  /**************** methods ********************/
  
  /**
   * @desc 展开树节点
   * @params expandedKeys: 已展开树的key, e: 事件对象
   */
  expandTree(expandedKeys: any, e: any) : void


  /**
   * @desc 选中组织树节点
   * @params selectedKeys 已选中节点的key, e: 事件对象
   */
  selectNode(selectedKeys: any, e: any) : void


  /**
   * @desc 加载组织树源数据，包括节点展开懒加载
   * @params params 获取源数据的参数, nodePos: 当前节点在树中的位置，形如'0-0-0'
   */
  getOrgNodes(params: Organization.Users.OrgTreeParams, nodePos?: string) : void


  /**
   * @desc 根据节点位置判断是更新原有组织树还是初次生成组织树
   * @params originalTreeData 组织树源数据, nodePos: 当前节点在树中的位置，形如'0-0-0'
   */
  renderOrgTree(originalTreeData: any, nodePos?: string) : void


  /**
   * @desc 通过节点位置更新原有组织树
   * @params originalTreeData 获取到的组织树源数据, nodePos: 当前节点在树中的位置，形如'0-0-0'
   */
  updateOrgTreeByPos(originalTreeData: any, nodePos: string) : void


  /**
   * @desc 生成组织树树形数据
   * @params originalTreeData 获取到的组织树源数据, parentId：父级ID， isRoot: 判断是否展示组织人数
   * @return 生成的树树形数据
   */
  generateOrgTree(originalTreeData: any, parentId: string | null, isRoot?: boolean): any

  /**
   * @desc 生成组织树的节点
   * @params item：节点源数据，children：子节点，isRoot：是否为根节点
   * @return 返回组织树的节点
   */
  generateOrgNode(item: any, children: any[], isRoot?: boolean) : any

  /**
   * @desc 重载树
   */
  reloadTree() : void


  /**
   * @desc 删除部门时重载树
   */
  reloadTreeByDelDepartment() : void

  /**
   * @desc 追加新增的部门到组织树（上级部门未改变）
   * @param data 新增的部门数据
   */
  addDepartmentByNotChangeParent(data: any) : void


  /**
   * @desc 添加部门时重载树
   * @params res: 已添加部门的数据
   */
  reloadTreeByAddDepartment(res: any) : void
  
  /**
   * @desc 编辑部门时重载树
   * @params res: 已编辑部门的数据
   */
  reloadTreeByEditDepartment(res: any)  : void

  /**
   * @desc 更新组织树用户数量, 根据corpId更新
   */
  updateUserNum() : void

}


export enum ImportModalCons {
  upload = "upload",
  import = "import",
  info = "info",
}

export enum ImportType {
  department = "department",
  person = "person",
}

export interface TreeNodeScopedSlots {
  icon: string;
}

export interface TreeNode {
  id: string;
  name: string;
  type: string;
  hasChild: boolean;
  isRoot: boolean;
  children: Array<TreeNode>;
  orglist: string;
  title: string;
  isLeaf: boolean;
  deptType: number;
  key: string;
  parentId: string;
  corpId: string;
  relatedOrgType: string; // MAIN 主部门 ，RELEVANCE 关联组织
  relatedSyncType: string; // PULL 从钉钉同步   PUSH推送到钉钉
  scopedSlots: TreeNodeScopedSlots;
}

export interface TreeNodeByKey {
  nodeState: TreeNode;
  nodePos: string;
}

export interface ReloadDepartmentInfo {
  data: any, // todo
  type: DeptOperationType,
  isUpdateParentDept: boolean
}

export interface BtnsDisplayPermision {
  copyID: boolean
  edit: boolean
  deleteAble: boolean
  importPerson: boolean
  exportPerson: boolean
  syncDepartment: boolean
  syncPerson: boolean
  createUser: boolean
  createDepartment: boolean
  batchOperation: boolean
}

export enum  DeptSyncType {
  Push = "PUSH", // 自维护(云枢自维护)
  Pull = 'PULL' // 钉钉维护
}

export enum  DeptOrgType {
  Main = "MAIN", // 主组织
  Relevance = 'RELEVANCE' // 关联组织
}


export enum  DeptOperationType {
  Edit = 'edit',
  Add = 'add'
}