<template>
  <a-modal
    v-model="modalVisible"
    :bodyStyle="{ padding: 0 }"
    :title="title"
    wrapClassName="role-modal"
    width="700px"
    centered
    :maskClosable="false"
    :keyboard="false"
    @cancel="onCancel"
  >
    <!-- 搜索框 -->
    <div class="role-select__search">
      <i class="aufontAll h-icon-all-search-o"></i>
      <input
        v-model="searchTxt"
        :placeholder="placeholder"
        class="role-select__input"
        @input="searchRole"
      />
      <i
        v-if="searchTxt"
        class="aufontAll h-icon-all-close-circle"
        @click="clearSearch"
      ></i>
    </div>
    <!-- 三栏 -->
    <div class="role-select__warp">
      <template v-if="treeData && treeData.length">
        <a-tree
          v-if="showOrgTree"
          class="role-select__col role-group-list"
          :multiple="multiple"
          showIcon
          :expandedKeys="expandedKeys"
          :selectedKeys="defaultSelectedKeys"
          :loadedKeys="loadedKeys"
          :treeData="treeData"
          :loadData="loadChildrenNodes"
          @expand="getExpandedNodes"
          @select="getUserList"
        >
          <span slot="title" slot-scope="node" class="role-title">
            <span class="title" :title="node.title">{{ node.title }}</span>
            <template v-if="!node.isLeaf">
              <span
                class="title-tip dingdings"
                v-if="node.roleType === 'DINGTALK'"
                >钉钉</span
              >
              <span class="title-tip wx" v-else-if="node.roleType === 'WECHAT'"
                >企微</span
              >
              <span class="title-tip system" v-else-if="node.roleType === 'SYS'"
                >自维护</span
              >
            </template>
          </span>
        </a-tree>
      </template>
      <ul
        v-else-if="searchLoading"
        class="role-select__col role-group-list not-data"
      >
        <a-spin tip="加载中..." />
      </ul>
      <template v-else>
        <ul class="role-select__col role-group-list not-data">
          <div>暂无数据</div>
        </ul>
      </template>
      <!-- <ul class="role-select__col role-group-list" v-show="!searchTxt">
        <li
          v-for="(group, idx) in roleGroups"
          :key="idx"
          :class="{ selected: selected.groupId === group.id }"
          @click="selectGroup(group)"
        >
          {{ group.name }}
        </li>
      </ul> -->

      <!-- <ul
        class="role-select__col role-user-list"
        :class="{ searching: searchTxt }"
        ref="rolesBox"
        @scroll="listenScroll"
      >
        <template v-if="searchTxt">
          <li v-for="(role, idx) in searchRoles" :key="idx">
            <a-checkbox
              :checked="isSelectedRole(role)"
              @change="selectRole(role, $event)"
            ></a-checkbox>
            <span style="padding-left: 8px">
              <span v-html="role.displayName"></span>
              <span class="role-tag">/{{ role.groupName }}</span>
            </span>
          </li>
        </template>
        <template v-else>
          <li v-if="multiple">
            <a-checkbox :checked="selectedAll" @change="selectAll"></a-checkbox>
            <span style="padding-left: 8px">全选</span>
          </li>
          <li v-for="(role, idx) in roles" :key="idx">
            <a-checkbox
              :checked="isSelectedRole(role)"
              @change="selectRole(role, $event)"
            ></a-checkbox>
            <span class="role-name" :title="role.name">{{ role.name }}</span>
          </li>
          <li
            v-if="!loadedGroupAllRoles && roles.length"
            ref="loadSpin"
            class="load-spin"
            @click="loadMoreRoles"
          >
            加载更多...
          </li>
        </template>
      </ul> -->

      <ul class="role-select__col role-select-result">
        <li
          v-for="(item, idx) in selected.roles"
          :key="idx"
          class="role-selector__span"
        >
          <i class="aufontAll h-icon-all-user-o"></i>
          <span>{{ item.name }}</span>
          <i class="aufontAll h-icon-all-close" @click="unSelectRole(item)"></i>
        </li>
      </ul>
    </div>
    <!-- 底部栏 -->
    <div slot="footer" class="role-select__footer">
      <p>已选中：{{ selected.roles.length }}</p>
      <div>
        <a-button type="default" @click="onCancel">取消</a-button>
        <a-button type="primary" @click="onSubmit">确定</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import * as RoleSelectorTypings from "./role-selector.typings";

import { RoleService } from "./role-selector.service";
import { organizationApi } from "@cloudpivot/api";

@Component({
  name: "role-selector",
})
export default class RoleSelector extends Vue {
  @Prop({
    default: () => [],
  })
  value!: Array<RoleSelectorTypings.RoleItem>;
  @Prop({
    default: () => {},
  })
  params!: any;

  @Prop({
    default: () => true,
  })
  filterDefaultRoleGroup!: boolean;

  @Prop() visible!: boolean;

  @Prop({
    default: "选择角色",
  })
  title?: string;

  @Prop({
    default: false,
  })
  multiple?: boolean;

  @Prop({
    default: false,
  })
  expandAll?: boolean;

  @Prop({
    default: "id",
  })
  filterKey?: string; // 删除角色时依据

  @Prop() filterDD?: boolean;

  @Prop({
    default: true,
  })
  allowEmpty?: boolean; // 是否允许选择结果置空

  @Prop({
    default: false,
  }) showForm?: boolean; //是否是表单使用

  @Prop({
    default: false,
  })
  showAuthority?: boolean;

  @Prop({
    default: () => [],
  })
  keepRoles?: Array<string>; // 需要保留的角色id/code列表，取决于filterKey

  @Watch("value", { deep: true })
  onValueChange(arr: Array<RoleSelectorTypings.RoleItem>) {
    this.initSelection(arr);
  }

  expandedKeys: string[] = [];

  @Watch("visible")
  onVisibleValueChange(v: boolean) {
    if (v !== this.modalVisible) {
      this.modalVisible = v;
    }
    if (v) {
      this.initSelection();
    }
  }

  modalVisible: boolean = false;

  placeholder: string = "搜索角色";

  // 搜索角色关键字
  searchTxt: string = "";

  lastSearchTxt: string = "";

  // 角色组列表
  roleGroups: any = [];

  // 角色列表
  roles: Array<RoleSelectorTypings.RoleItem> = [];

  // 搜索角色列表
  searchRoles: Array<RoleSelectorTypings.RoleItem> = [];

  dataRef: any = {};

  // 选中的角色组
  selected: any = {
    groupId: null,
    roles: [],
  };

  // 分页获取角色的参数
  groupChildParams: RoleSelectorTypings.GroupRolesParams = {
    groupId: "",
    page: 0,
    size: 20,
  };

  // 是否已加载组下的全部角色
  loadedGroupAllRoles: boolean = false;

  // 是否正在请求角色
  loadingRoles: boolean = false;

  showOrgTree: boolean = false;

  isRoleSearchResult: boolean = false;

  searchTask: any = null;

  orgTreeBySearch: any = null;

  searchLoading: boolean = false;

  roleList: any = [];

  get treeData() {
    if (this.isRoleSearchResult) {
      return this.orgTreeBySearch && this.dataRecursion(this.orgTreeBySearch);
    } else {
      return this.roleGroups && this.dataRecursion(this.roleGroups);
    }
  }
  get selectedAll() {
    return this.roles.every((role: RoleSelectorTypings.RoleItem) =>
      this.isSelectedRole(role)
    );
  }

  dataRecursion(list: []) {
    const arr: any = [];
    list.map((i: any) => {
      i.scopedSlots = { title: "title" };
      // if (i.children && i.children.length) {
      //   i.children = this.dataRecursion(i.children);
      // }
      arr.push(i);
    });
    return arr;
  }

  created() {
    this.getGroups();
  }

  destroyed() {
    this.clearOrgTreeBySearch();
  }

  // 已加载的节点key值
  get loadedKeys(): string[] {
    return this.expandedKeys;
  }

  clearOrgTreeBySearch() {
    this.isRoleSearchResult = false;
    this.orgTreeBySearch = [];
  }

  dataChange(list: any[], arr: any, status: boolean) {
    if (!list[0].isLeaf && list[0].children) {
      !status && arr.push(list[0].key);
      this.dataChange(list[0].children, arr, status);
    } else if (list[0].isLeaf && status) {
      arr.push(list[0].key);
    }
    return arr;
  }

  get defaultSelectedKeys() {
    // let res: any[] = [];
    // if (this.searchTxt) return res;
    if (this.selected.roles && this.selected.roles.length) {
      return this.selected.roles.map((i) => i.id);
    }

    return [];
  }

  /**
   * 加载子节点
   */
  async loadChildrenNodes(e) {
    // 已展开的节点不再请求
    const { expanded, dataRef, pos } = e;

    if (expanded) return;

    if (dataRef.children && dataRef.children.length) return;
    if (!this.searchTxt) {
      this.setEventKey({ dataRef });
      this.getChildrenRole();
    }
  }

  async getChildrenRole() {
    const res = await organizationApi.getChildrenRoleNew({
      groupId: this.dataRef.id,
    });

    this.setTreeNode(this.roleGroups, this.dataRef.id, res.data);
    this.roleGroups = this.changeData(
      JSON.parse(JSON.stringify(this.roleGroups)),
      null
    );
  }

  setTreeNode(list: any, code: any, tree: any) {
    list.forEach((i: any) => {
      if (i.value === code) {
        i.children = tree;
      } else if (i.children && i.children.length > 0) {
        this.setTreeNode(i.children, code, tree);
      }
    });
  }
  setEventKey(params: any) {
    this.dataRef = params.dataRef;
  }

  // 获取角色组下的角色
  getExpandedNodes(expandedKeys: any, e: any) {
    this.expandedKeys = expandedKeys;
  }

  // 获取角色下的用户
  getUserList(checkedKeys, e) {
    this.$emit("selectBlocked", checkedKeys);
    const list: any = [];
    checkedKeys.forEach((i) => {
      const arr = this.selected.roles.filter((n) => n.id === i);
      const arrs = e.selectedNodes.filter((n) => n.key === i);
      if (arr.length > 0) {
        list.push({
          name: arr[0].name,
          id: arr[0].id,
          code: arr[0].code,
          groupId: arr[0].groupId,
          groupName: arr[0].groupName,
          displayName: arr[0].displayName,
        });
      } else if (arrs.length > 0) {
        list.push({
          name: arrs[0].data.props.dataRef.name,
          id: arrs[0].data.props.dataRef.id,
          code: arrs[0].data.props.dataRef.code,
          groupId: arrs[0].data.props.dataRef.groupId,
          groupName: arrs[0].data.props.dataRef.groupName,
          displayName: arrs[0].data.props.dataRef.displayName,
        });
      }
    });

    this.selected.roles = list;

    // if (this.isRoleSearchResult) {
    //   this.selected.roles = this.roleList.concat(list);
    // } else {
    // }

    // this.roleInfoId =
    //   e.node.dataRef.roleType === "SYS" && !e.node.isLeaf && e.node.dataRef.corpId ? e.node.dataRef.id : "";
    // // 子节点才展示数据，父节点只做展开操作
    // if (!e.node.isLeaf) {
    //   return;
    // }
  }

  /**
   * 初始化选中结果
   */
  initSelection(roles?: Array<RoleSelectorTypings.RoleItem>) {
    const selected: any = roles || this.value;

    if (!selected || (Array.isArray(selected) && selected.length < 1)) {
      this.selected.roles = [];
      return;
    }

    if (Array.isArray(selected) && selected.length) {
      this.selected.roles = selected;
      // 默认定位到已选第一个角色所属的角色组上
      const [role] = selected;
      const group: any = this.roleGroups.find(
        (gr: RoleSelectorTypings.RoleGroupItem) => gr.id === role.groupId
      );
      if (group) {
        this.selectGroup(group);
      }
    }
  }

  /**
   * 获取角色组
   */
  async getGroups() {
    let appsResult: any = await organizationApi.getRoleLeveOneInfoNew(false, this.showAuthority);
    this.showOrgTree = true;

    appsResult = appsResult.data;

    if (appsResult.length) {
      this.setOrgNode(appsResult);
    }
  }

  changeData(data: any, parents: any) {
    const result: any = [];
    data.forEach((node: any) => {
      let obj: any = {
        id: node.id,
        value: node.id,
        name: node.name,
        title: `${node.name}`,
        isLeaf: !node.group,
        group: node.group,
        key: node.id,
        code: node.code,
        selectable: !node.group,
        groupId: node.groupId,
        roleType: node.roleType,
        corpId: node.corpId,
        groupName: parents && parents.name,
        children: null,
      };
      if (node.children && node.children.length) {
        obj.children = this.changeData(node.children, node);
      }
      result.push(obj);
    });
    return result;
  }

  setOrgNode(data: any) {
    const result: any[] = this.changeData(data, null);
    // 角色搜索时，赋值给orgTreeBySearch
    if (this.isRoleSearchResult) {
      this.orgTreeBySearch = result;
    } else {
      this.roleGroups = result;
    }
  }
  /**
   * 根据关键字搜索角色
   */
  async searchRole() {
    clearTimeout(this.searchTask);
    this.searchLoading = true;
    this.searchTask = setTimeout(() => {
      if (!this.searchTxt) {
        this.clearSearch();
        return;
      } else {
        this.doSearch();
      }
    }, 300);
  }

  async doSearch() {
    this.searchTxt = this.searchTxt.trim();
    // searchRoleKeys为空时，不做搜索并清空上次搜索结果
    if (!this.searchTxt) {
      this.isRoleSearchResult = false;
      this.clearRoleKey();
      return;
    }
    this.showOrgTree = false;
    this.dataRef = {};
    this.isRoleSearchResult = true;
    this.searchOrgRoleNode(this.searchTxt).then(() => {
      this.searchLoading = false;
      this.expandedKeys = this.expandedKeysData();
      this.showOrgTree = true;
    });
  }

  async searchOrgRoleNode(params: string) {
    const res = await organizationApi.searchRoleListNew(params,this.showAuthority);
    if (!res.data) {
      return this.setOrgNode([]);
    }
    this.roleList = this.selected.roles;
    return this.setOrgNode(res.data);
  }

  /*
   * 清空搜索角色关键字、结果
   */
  clearRoleKey() {
    this.showOrgTree = false;
    this.searchTxt = "";
    this.roleList = [];
    this.getGroups();
    setTimeout(() => {
      // 重新渲染tree, 默认展开搜索的角色组
      this.showOrgTree = true;
      this.expandedKeys = this.expandedKeysData();
    }, 1);
  }

  expandedKeysData() {
    let res: any[] = [];
    if (this.isRoleSearchResult) {
      if (this.orgTreeBySearch && this.orgTreeBySearch.length) {
        res = this.dataChangeAll(this.orgTreeBySearch, []);
      }
      return res;
    } else {
      if (this.roleGroups && this.roleGroups.length) {
        res = this.dataChange(this.roleGroups, [], false);
      }
      return res;
    }
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
   * 清空搜索内容，同时切换至角色组界面
   */
  clearSearch() {
    this.searchTxt = "";
    this.lastSearchTxt = "";
    this.searchRoles = [];
    this.expandedKeys = [];
    this.roleList = [];
    this.clearOrgTreeBySearch();
    // 清空关键字，默认展示默认分组下的第一个角色下的用户
    this.getGroups();
  }

  /**
   * 选中角色组
   */
  async selectGroup(group: RoleSelectorTypings.RoleGroupItem) {
    if (!group) {
      return;
    }
    this.selected.groupId = group.id;
    this.groupChildParams.groupId = group.id;
    this.groupChildParams.page = 0;
    if (group.total && group.total === group.children.length) {
      // 已加载组下的所有角色
      this.loadedGroupAllRoles = true;
      this.roles = group.children;
    } else {
      const roles: Array<RoleSelectorTypings.RoleItem> = await RoleService.getGroupRoles(
        this.groupChildParams,
        group
      );
      group.children = roles;
      this.roles = roles;
      this.loadedGroupAllRoles = !!(group.total === group.children.length);
    }
  }

  /**
   * 加载角色组下更多角色
   */
  async loadMoreRoles() {
    if (this.loadingRoles) {
      return;
    }
    const { groupId } = this.selected;
    const group: any = this.roleGroups.find(
      (item: RoleSelectorTypings.RoleGroupItem) => item.id === groupId
    );
    this.loadingRoles = true;
    if (group) {
      if (group.total === group.children.length) {
        this.loadedGroupAllRoles = true;
        this.loadingRoles = false;
        return;
      }
      this.groupChildParams.page += 1;
      const roles: Array<RoleSelectorTypings.RoleItem> = await RoleService.getGroupRoles(
        this.groupChildParams,
        group
      );
      group.children = roles;
      this.roles = roles;
    }
    this.loadingRoles = false;
  }

  /**
   * 监听是否滚动到底部，是则触发加载更多
   */
  listenScroll() {
    const box: any = this.$refs.rolesBox;
    const spin: any = this.$refs.loadSpin;

    if (!box || !spin) {
      return;
    }

    const boxTop = box.getBoundingClientRect().top;
    const spinTop = spin.getBoundingClientRect().top;
    const scrollTop = spinTop - boxTop - box.offsetHeight;

    if (scrollTop < 10) {
      this.loadMoreRoles();
    }
  }

  /**
   * 选中角色
   */
  selectRole(role: RoleSelectorTypings.RoleItem, evt: Event) {
    const checked: boolean = (evt.target as any).checked;
    this.doSelectRole(role, checked);
  }

  /**
   * 执行角色选择
   */
  doSelectRole(role: RoleSelectorTypings.RoleItem, checked: boolean) {
    const { filterKey, keepRoles } = this;
    if (checked) {
      if (this.multiple) {
        if (
          !this.selected.roles.some(
            (item: RoleSelectorTypings.RoleItem) =>
              item[filterKey as string] === role[filterKey as string]
          )
        ) {
          this.selected.roles.push(role);
        }
      } else {
        this.selected.roles = [role];
      }
    } else {
      if (Array.isArray(keepRoles) && keepRoles.length) {
        if (
          keepRoles.some(
            (item: any) =>
              item[filterKey as string] === role[filterKey as string]
          )
        ) {
          this.$emit("selectBlocked", role);
          return;
        }
      }

      let roles: Array<RoleSelectorTypings.RoleItem> = [];
      if (this.multiple) {
        roles = this.selected.roles.filter(
          (item: RoleSelectorTypings.RoleItem) =>
            item[filterKey as string] !== role[filterKey as string]
        );
      } else {
        roles = [];
      }
      if (!this.allowEmpty && !roles.length) {
        this.$emit("clearBlocked");
        return;
      }
      // const ids = roles.map((i) => i.id);
      this.selected.roles = roles;
      // this.roleList = this.roleList.filter((i) => {
      //   const arr = ids.filter((o) => o === i.id);
      //   return arr.length > 0;
      // });
      // console.log(this.roleList, "ddd", roles);
    }
  }

  /**
   * 取消选中角色
   */
  unSelectRole(role: RoleSelectorTypings.RoleItem) {
    if (role.name === "部门主管") return;
    this.doSelectRole(role, false);
  }

  /**
   * 判断角色是否已被选中
   */
  isSelectedRole(role: RoleSelectorTypings.RoleItem) {
    const { filterKey } = this;
    return this.selected.roles.some(
      (item: RoleSelectorTypings.RoleItem) =>
        item[filterKey as string] === role[filterKey as string]
    );
  }

  /**
   * 选中当前所有角色
   */
  selectAll(evt: Event) {
    if (!this.multiple) {
      return;
    }
    const checked: boolean = (evt.target as any).checked;
    this.roles.forEach((role: RoleSelectorTypings.RoleItem) => {
      this.doSelectRole(role, checked);
    });
  }

  /**
   * 点击取消
   */
  onCancel() {
    this.$emit("hide");
    this.reset();
  }

  mounted() {
    if(this.showForm){
      if (this.visible !== this.modalVisible) {
        this.modalVisible = this.visible;
      }
      if (this.visible) {
        this.initSelection();
      }
      this.initialSelected();
    }
  }
  /**
   * 渲染默认值
   *
   * ① 传入对象数组：Array<RoleSelectorTypings.RoleItem>
   * ② 传入code字符串数组：Array<string>
   * ③ 传入单个角色code: string
   */
  async initialSelected() {
    this.selected.roles = this.value.map((i:any) => {
      return {id: i.value,name:i.label};
    });
  }

  /**
   * 点击确定
   */
  onSubmit() {
    this.$emit("input", this.selected.roles);
    this.$nextTick(() => {
      this.reset();
    });
  }

  reset() {
    this.modalVisible = false;
    this.searchTxt = this.lastSearchTxt = "";
    this.searchRoles = [];
    this.lastSearchTxt = "";
    this.expandedKeys = [];
    this.roleList = [];
    this.clearOrgTreeBySearch();
    // this.selected.roles = [];
  }
}
</script>
<style lang="less" scoped>
.role-selector__span {
    display: inline-block;
    vertical-align: middle;
    height: 22px;
    line-height: 22px;
    padding-left: 8px;
    padding-right: 8px;
    white-space: nowrap;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background-color: #fafafa;
    font-size: 0;
    cursor: pointer;
    > i {
      display: inline-block;
      vertical-align: middle;
      font-size: 12px;
      color: #bfbfbf;
    }
    > span {
      display: inline-block;
      vertical-align: middle;
      max-width: 180px;
      margin-left: 4px;
      margin-right: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      line-height: 22px;
    }
  }
.role-modal {
  .tree {
    height: 400px;
    overflow: auto;
  }
  .role-title {
    position: relative;
    display: block;
    padding-right: 10px;
    overflow: hidden;
    .title {
      // max-width: calc(100% - 55px);
      text-overflow: ellipsis;
      overflow: hidden;
      display: block;
      float: left;
      margin-right: 3px;
    }

    .edit {
      position: absolute;
      top: 0;
      right: 0;

      display: none;
    }
    .title-tip {
      display: inline-block;
      font-size: 12px;
      width: 40px;
      height: 20px;
      border-radius: 10px;
      text-align: center;
      line-height: 20px;
      background: #ffffff;
    }
    .dingdings {
      color: #3296fa;
      border: 1px solid #3296fa;
    }
    .wx {
      color: #4a74c1;
      border: 1px solid #4a74c1;
    }
    .system {
      width: 45px;
      color: #17bc94;
      border: 1px solid #17bc94;
    }
  }
  .role-select {
    &__search {
      display: flex;
      align-items: center;
      width: 100%;
      height: 46px;
      padding: 12px 24px;
      box-sizing: border-box;
      border-bottom: 1px solid #e8e8e8;
      i {
        flex: none;
        cursor: pointer;
      }
      input {
        flex: 1;
        flex-grow: 1;
        padding-left: 8px;
        padding-right: 8px;
        font-size: 14px;
        border: none;
        caret-color: @primary-color;
      }
      /deep/.h-icon-all-search-o,
      /deep/.h-icon-all-close-circle,
      input::-webkit-input-placeholder {
        color: rgba(0, 0, 0, 0.25);
      }
      /deep/.h-icon-all-close-circle {
        font-size: 12px;
        &:hover {
          color: #666;
        }
      }
    }
    &__warp {
      width: 100%;
      height: 100%;
      display: flex;
    }
    &__col {
      display: block;
      flex: 1;
      height: 350px;
      max-height: 495px;
      overflow-y: auto;
      box-sizing: content-box;
      &:not(:last-child) {
        border-right: 1px solid #e8e8e8;
        > li {
          margin-bottom: 8px;
        }
      }
    }
    &__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
    }
  }
  .not-data {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    color: #797777;
  }

  .role-group-list {
    padding: 4px 0 4px 0;
    > li {
      width: 100%;
      height: 32px;
      line-height: 32px;
      margin-bottom: 8px;
      padding: 0 24px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }
    .selected {
      // color: #17BC94;
      font-weight: 600;
      background-color: #e8fcf4;
      cursor: default;
    }
  }

  .role-user-list {
    &.searching {
      padding: 8px 24px;
    }
    padding: 8px;
    .role-tag {
      color: rgba(0, 0, 0, 0.45);
    }
    .load-spin {
      font-size: 12px;
      color: @primary-color;
      text-align: center;
      cursor: pointer;
    }

    .role-name {
      display: inline-block;
      max-width: 170px;
      overflow: hidden;
      white-space: nowrap;
      vertical-align: middle;
      text-overflow: ellipsis;
      padding-left: 8px;
    }
  }

  .role-select-result {
    flex: none;
    width: 310px;
    padding: 8px 16px;
    font-size: 0;
    box-sizing: border-box;
    > li {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }
}
</style>