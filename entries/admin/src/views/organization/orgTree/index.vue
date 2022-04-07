<template>
  <div class="org-tree">
    <a-spin :spinning="showLoad">
      <a-tree
        v-if="orgTree && orgTree.length"
        class="tree"
        showIcon
        :expandedKeys="expandedKeys"
        :selectedKeys="selectedKeys"
        :loadedKeys="loadedKeys"
        :treeData="orgTree"
        :loadData="loadChildrenNodes"
        @expand="expandTree"
        @select="selectNode"
      >
        <template slot="custom" slot-scope="{ selected }">
          <i class="icon aufontAll h-icon-all-outer-o"></i>
        </template>
      </a-tree>
    </a-spin>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import OrganizationApi from "@/apis/organization";

import {
  OrgTree,
  TreeNodeScopedSlots,
  TreeNode,
  TreeNodeByKey,
} from "./orgTree.typings";
import TreeUtils from "@/common/TreeUtils";

const UserModule = namespace("Organization/User");

@Component({
  name: "OrgTreeComponent",
})
export default class OrgTreeComponent extends Vue implements OrgTree {
  @Prop() searchList: any;
  @Prop() depdSearch: any;

  // 组织树
  orgTree: Array<TreeNode> = [];

  // 展开的节点key值
  expandedKeys: string[] = [];

  // 当前节点
  curNodeState: TreeNode | null = null;

  // 选中的节点状态key值
  selectedKeys: string[] = [];

  // 当前树的位置信息
  nodePos: string = "";

  showLoad: boolean = false;

  // 已加载的节点key值
  get loadedKeys(): string[] {
    return this.expandedKeys;
  }

  async created() {
    this.init(false);
  }

  /**
   * 初始化树组件
   */
  async init(status: boolean) {
    this.showLoad = true;
    await this.getOrgNodes({ deptId: "", filterType: "admin" });

    // 默认选中第一个组织部门
    if (this.orgTree && this.orgTree.length > 0) {
      const curNodeState: TreeNode = this.orgTree[0];
      const nodePos: string = "0-0";
      this.expandedKeys = [curNodeState.id];
      !status && this.mockSelectNode(curNodeState, nodePos);
    }
    this.showLoad = false;
  }

  @Watch("depdSearch", {
    deep: true,
  })
  showSearchLoad(val: any) {
    this.showLoad = val;
  }

  @Watch("searchList", {
    deep: true,
  })
  changeDepdSearch(val: any, old: any) {
    if (!(val.length === 0 && old.length === 0)) {
      if (val.length) {
        this.orgTree = this.generateOrgTree(this.searchList, null);
        this.expandedKeys = this.expandedKeysData();
      } else if (val.length === 0) {
        this.init(true);
      }
    }
  }

  expandedKeysData() {
    let res: any[] = [];
    res = this.dataChangeAll(this.orgTree, []);
    return res;
  }

  dataChangeAll(list: any, arr: any) {
    list.forEach((list: any) => {
      if (list.children && list.children.length) {
        arr.push(list.key);
        this.dataChangeAll(list.children, arr);
      }
    });
    return arr;
  }
  /**
   * 展开组织树节点
   */
  expandTree(expandedKeys: string[]) {
    this.expandedKeys = expandedKeys;
  }

  /**
   * 加载子节点
   */
  async loadChildrenNodes(e) {
    // 已展开的节点不再请求
    const { expanded, dataRef, pos } = e;

    if (expanded) return;

    if (dataRef.children && dataRef.children.length) return;

    const param: Organization.Users.OrgTreeParams = {
      deptId: dataRef.id,
      filterType: "admin",
    };

    await this.getOrgNodes(param, pos);
  }

  /**
   * 点击组织树节点
   */
  async selectNode(selectedKeys: string[], e: any) {
    // 当前节点信息
    this.curNodeState = e.node.dataRef;
    this.selectedKeys = [e.node.dataRef.id];

    this.nodePos = e.node.pos;

    this.$emit("selectNodeEvent", this.curNodeState);
  }

  /**
   * 加载组织树源数据
   */
  async getOrgNodes(
    params: Organization.Users.OrgTreeParams,
    nodePos?: string
  ) {
    const res: any = await OrganizationApi.getOrgInfo(params);
    const errcode: number = res.errcode;
    const data: any = res.data;
    const errmsg: string = res.errmsg;

    if (errcode !== 0) {
      this.$message.error(errmsg);
      return;
    }

    this.renderOrgTree(data, nodePos);
  }

  /**
   * 根据节点位置判断是更新原有组织树还是初次生成组织树
   */
  renderOrgTree(originalTreeData: any, nodePos?: string) {
    if (nodePos) {
      this.updateOrgTreeByPos(originalTreeData, nodePos);
    } else {
      this.orgTree = this.generateOrgTree(originalTreeData, null, true);
    }
  }

  /**
   * 通过节点位置更新原有组织树
   */
  updateOrgTreeByPos(originalTreeData: any, nodePos: string) {
    const pos: string[] = nodePos.split("-").slice(1);
    let resultNode: any;
    let orgTree: Array<TreeNode> = this.orgTree;

    for (let i = 0, len = pos.length; i < len; i++) {
      resultNode = orgTree[Number(pos[i])];

      if (i < len) {
        orgTree = resultNode.children;
      }
    }

    resultNode.children = this.generateOrgTree(originalTreeData, resultNode.id);
  }

  /**
   * 生成组织树
   */
  generateOrgTree(
    originalTreeData: any,
    parentId: string | null,
    isRoot?: boolean
  ) {
    let tree: Array<TreeNode> = [];
    if (!Array.isArray(originalTreeData)) return tree;

    originalTreeData.forEach((item: any, index: number) => {
      let children: Array<TreeNode> = [];

      if (item.children && item.children.length) {
        children = this.generateOrgTree(item.children, item.id);
      }

      item.parentId = item.parentId ? item.parentId : parentId;

      const node: TreeNode = this.generateOrgNode(item, children, isRoot);

      tree.push(node);
    });

    return tree;
  }

  /**
   * 生成组织树的节点
   */
  generateOrgNode(
    originalData: any,
    children: Array<TreeNode> = [],
    isRoot: boolean = false
  ) {
    return {
      id: originalData.id,
      name: originalData.name,
      children,
      isRoot,
      enabled: originalData.enabled,
      parentId: originalData.parentId,
      hasChild:
        typeof originalData.employees !== "undefined" &&
        originalData.employees > 0,
      type: originalData.unitType === 1 && isRoot ? "org" : "user",
      orglist: isRoot
        ? `${originalData.name} (${originalData.employees || 0})`
        : originalData.name,
      title: isRoot
        ? `${originalData.name} (${originalData.employees || 0})`
        : originalData.name,
      isLeaf: originalData.leaf,
      deptType: originalData.deptType,
      key: originalData.id,
      corpId: originalData.corpId,
      relatedOrgType: originalData.relatedOrgType, // MAIN 主部门 ，RELEVANCE 关联组织
      relatedSyncType: originalData.relatedSyncType, // PULL 从钉钉同步   PUSH推送到钉钉
      scopedSlots: {
        icon: originalData.relatedOrgType === "RELEVANCE" ? "custom" : "",
      },
    };
  }

  /*
   * 重载树
   */
  async reloadTree() {
    this.init(false);
  }

  /**
   * 添加部门时重载树
   */
  async reloadTreeByAddDepartment(res: any) {
    const { isUpdateParentDept, data } = res;

    if (isUpdateParentDept) {
      // 上级部门已改变
      this.addDepartmentByChangeParent(data);
    } else {
      // 上级部门未改变
      this.addDepartmentByNotChangeParent(data);
    }
  }

  /**
   * 编辑部门时重载树
   */
  async reloadTreeByEditDepartment(res: any) {
    const { isUpdateParentDept, data } = res;

    if (isUpdateParentDept) {
      // 上级部门已改变
      this.editDepartmentByChangeParent(data);
    } else {
      // 上级部门未改变
      this.editDepartmentByNotChangeParent(data);
    }
  }

  /**
   * 删除部门时重载树
   */
  async reloadTreeByDelDepartment() {
    // 获取父级部门
    const nodePos: string = this.nodePos.substring(
      0,
      this.nodePos.lastIndexOf("-")
    );
    const parentNodeState: TreeNode = TreeUtils.getTreeNodeStateByPos(
      this.orgTree,
      nodePos
    );

    // 从组织树中移除指定的部门
    this.deleteDepartmentKey(parentNodeState);

    this.mockSelectNode(parentNodeState, nodePos);
  }

  /**
   * 更新组织树上的用户数量
   */
  async updateUserNum() {
    const corpIdParam: any =
      this && this.curNodeState && this.curNodeState.corpId;

    const params: any = {
      corpId: corpIdParam,
      filterType: "admin",
    };

    const data: any = await this.getUserNum(params);

    const employees: string = data.employees;
    const corpId: string = data.corpId;

    for (let item of this.orgTree) {
      if (item.corpId === corpId) {
        item.orglist = item.title = `${item.name} (${employees})`;
        break;
      }
    }
  }

  /**
   * 编辑已改变父级部门的部门
   */
  async editDepartmentByChangeParent(data: any) {
    // 获取父级部门
    const nodePos: string = this.nodePos.substring(
      0,
      this.nodePos.lastIndexOf("-")
    );
    const parentNodeState: TreeNode = TreeUtils.getTreeNodeStateByPos(
      this.orgTree,
      nodePos
    );

    // 从组织树中移除指定的部门
    this.deleteDepartmentKey(parentNodeState);

    // 转移编辑部门的层层父级部门到指定部门
    await this.moveParentDepartment(data);

    // 获取编辑部门的信息
    const treeNodeState: TreeNodeByKey = TreeUtils.getTreeNodeStateByKey(
      data.id,
      "id",
      this.orgTree
    );

    // 关闭当前部门的展开状态
    const index: number = this.expandedKeys.findIndex(
      (id: string) => id === data.id
    );
    if (index >= 0) this.expandedKeys.splice(index, 1);

    // 模拟单击选中部门
    this.mockSelectNode(treeNodeState.nodeState, treeNodeState.nodePos);
  }

  /**
   * 编辑未改变父级部门的部门
   */
  editDepartmentByNotChangeParent(data: any) {
    const curNode: TreeNode = TreeUtils.getTreeNodeStateByPos(
      this.orgTree,
      this.nodePos
    );

    curNode.name = data.name;
    curNode.title = curNode.orglist = curNode.isRoot
      ? `${data.name} (${data.employees || 0})`
      : data.name;

    // 模拟单击选中部门
    this.mockSelectNode(curNode, this.nodePos);
  }

  /**
   * 渲染新增的部门所在的组织树（上级部门已改变）
   */
  async addDepartmentByChangeParent(data: any) {
    await this.moveParentDepartment(data);

    // 获取新增部门的信息
    const treeNodeState: TreeNodeByKey = TreeUtils.getTreeNodeStateByKey(
      data.id,
      "id",
      this.orgTree
    );

    // 模拟单击部门事件对象
    this.mockSelectNode(treeNodeState.nodeState, treeNodeState.nodePos);
  }

  /**
   * 追加新增的部门到组织树（上级部门未改变）
   */
  async addDepartmentByNotChangeParent(data: any) {
    const node: TreeNode = this.generateOrgNode(data);
    const parentId: string = data.parentId;

    // 通过parentId获取父级部门信息
    const parentNodeState: TreeNodeByKey = TreeUtils.getTreeNodeStateByKey(
      parentId,
      "id",
      this.orgTree
    );
    const nodeState = parentNodeState.nodeState;
    const nodePos = parentNodeState.nodePos;

    if (!nodeState) return;

    if (nodeState.children && nodeState.children.length) {
      /*******如果父部门已经展开过的情况下，则往父部门追加新增的部门*****/

      // 自动向父级部门追加新增的部门
      nodeState.children.push(node);

      // 如果没有展开,则展开父级 部门
      if (!this.expandedKeys.includes(parentId))
        this.expandedKeys.push(parentId);
    } else {
      /******如果父部门未展开过的情况下，则模拟展开父级部门，并加载父级部门的所有子部门******/

      // 如果父级部门还没有子部门的情况下，则更新父级部门信息
      if (nodeState.isLeaf) nodeState.isLeaf = false;

      const expandEvent: any = {
        expanded: false,
        dataRef: nodeState,
        pos: nodePos,
      };

      // this.expandedKeys.push(parentId);

      await this.loadChildrenNodes(expandEvent);
    }

    // 展开所有父级部门
    this.expandParentDepartment();

    /*****模拟单击选中新增的部门******/

    // 自动获取新增部门的位置信息
    const newNodePos: string = `${nodePos}-${nodeState.children.length - 1}`;

    // 模拟单击部门事件对象
    this.mockSelectNode(node, newNodePos);
  }

  /**
   * 展开所有父级部门
   */
  expandParentDepartment() {
    const pos: string[] = this.nodePos.split("-").slice(1);
    let orgTree: TreeNode | Array<TreeNode> = this.orgTree;

    for (let i = 0, len = pos.length; i < len; i++) {
      const orgTreeObject = orgTree[Number(pos[i])];

      if (i < len) {
        orgTree = orgTreeObject.children;
        const nodeId = orgTreeObject.id;

        if (!this.expandedKeys.includes(nodeId)) this.expandedKeys.push(nodeId);
      }
    }
  }

  /**
   * 转移新增或编辑部门的层层父级部门到指定部门
   */
  async moveParentDepartment(data: any) {
    const parentId: string = data.parentId;

    // 获取新增部门所在树的所有父级部门
    const allParentTreeOriginalData: any = await this.getAllParentTree(
      parentId
    );

    if (!allParentTreeOriginalData) return;

    // 生成组织树
    const allParentOrgTree: Array<TreeNode> = this.generateOrgTree(
      allParentTreeOriginalData,
      null,
      true
    );

    this.reRenderTree(allParentOrgTree, parentId);
  }

  /**
   * 重新渲染树
   */
  reRenderTree(orgTree: Array<TreeNode>, parentId: string) {
    const node: any = this.getChildrenNode(orgTree);
    const children: Array<TreeNode> = node.children;

    // 如果没有目标节点的父节点未打开，并且是目标父节点，则直接替换
    if (!this.expandedKeys.includes(node.id) || node.id === parentId) {
      const nodeStateKey = TreeUtils.getTreeNodeStateByKey(
        node.id,
        "id",
        this.orgTree
      );

      // Object.assign(nodeStateKey.nodeState, node || {});

      // 更新目标节点信息
      if (nodeStateKey && nodeStateKey.nodeState) {
        nodeStateKey.nodeState.isLeaf = node.leaf;
        nodeStateKey.nodeState.children = node.children;
      }

      // 展开新增部门所在树的所有父级部门
      const expandedDeptKeys: string[] = this.expandedDeptKeys(orgTree);

      this.expandedKeys = [
        ...new Set([...this.expandedKeys, ...expandedDeptKeys]),
      ];
      return;
    }

    this.reRenderTree(children, parentId);
  }

  /**
   * 获取子节点
   */
  getChildrenNode(tree: Array<TreeNode>) {
    let node: TreeNode | null = null;

    // 找到同级，同时拥有子部分的节点
    for (let i = 0, len = tree.length; i < len; i++) {
      const item = tree[i];

      const children = item.children;

      if (children && children.length) {
        node = item;
        break;
      }
    }

    return node;
  }

  /**
   * 获取需要展开的部门的key，展开组织树
   */
  expandedDeptKeys(orgTree: Array<TreeNode>) {
    const expandedKeys: string[] = [];
    let i: number = 0;
    let curOrgTree: Array<TreeNode> = orgTree;
    let orgObject: TreeNode;
    let children: Array<TreeNode> = [];

    while (i < curOrgTree.length) {
      orgObject = curOrgTree[i];
      children = orgObject.children;

      if (children && children.length) {
        expandedKeys.push(orgObject.id);
        curOrgTree = children;
        i = 0;
        continue;
      }

      i++;
    }

    return expandedKeys;
  }

  /**
   * 移除部门Key
   */
  deleteDepartmentKey(parentNodeState: TreeNode) {
    // 移除已删除的部门
    const deletedNodePos: number = Number(this.nodePos.split("-").pop());
    parentNodeState.children.splice(deletedNodePos, 1);

    // 如果父级部门没有子部门，则父级部门变成叶子
    if (!parentNodeState.children.length) {
      const parentExpandedKeyIndex: number = this.expandedKeys.findIndex(
        (item: any) => item.id === parentNodeState.id
      );

      this.expandedKeys.splice(parentExpandedKeyIndex, 1);
      parentNodeState.isLeaf = true;
    }
  }

  /**
   * 模拟单击选中部门
   */
  mockSelectNode(nodeState: TreeNode, nodePos: string) {
    // 模拟单击选中父级部门
    const selectEvent: any = {
      node: {
        dataRef: nodeState,
        pos: nodePos,
      },
    };

    const expandedKeys: string[] = [nodeState.id];

    this.selectNode(expandedKeys, selectEvent);
  }

  /**
   * 通过id获取层层父级部门
   */
  async getAllParentTree(parentId: string) {
    const res: any = await OrganizationApi.getAllParentTree(parentId);
    const errcode: number = res.errcode;
    const errmsg: string = res.errmsg;

    if (errcode !== 0) {
      this.$message.error(errmsg);
      return;
    }

    return res.data;
  }

  /**
   * 通过id获取部门的信息
   */
  async getDeptInfo(id: string) {
    const res: any = await OrganizationApi.getDeptInfo({ deptId: id });
    const errcode: number = res.errcode;
    const errmsg: string = res.errmsg;

    if (errcode !== 0) {
      this.$message.error(errmsg);
      return;
    }

    return res.data;
  }

  /**
   * 获取组织用户数量
   */
  async getUserNum(params: any) {
    const res: any = await OrganizationApi.getUserNum(params);
    const errcode: number = res.errcode;
    const errmsg: string = res.errmsg;

    if (errcode !== 0) {
      this.$message.error(errmsg);
      return;
    }

    return res.data;
  }
}
</script>

<style lang="less" scoped>
.org-tree {
  text-align: center;
  .tree {
    text-align: left;
    margin-left: 12px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    max-height: calc(100vh - 220px);
    overflow: auto;
    /deep/ & > li:first-child {
      padding-top: 5px;
    }
    /deep/ li {
      padding: 8px 0 0 0;
      span.ant-tree-node-content-wrapper {
        &:hover {
          background-color: #e8fcf4;
        }
      }
      span.ant-tree-node-selected {
        background-color: #eeeeee !important;
        font-weight: 500;
      }
    }
  }

  .tree::-webkit-scrollbar {
    width: 0;
    height: 7px;
    background: #fff;
  }
  .tree::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.45);
    border-radius: 4px;
  }
}
</style>