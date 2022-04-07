import OrganizationApi from "../../../apis/organization";

function changeData(data: any,nodes:any) {
  const result: any = [];
  data.forEach((node: any) => {
    let obj: any = {
      id: node.id,
      value: node.id,
      name: node.name,
      title: `${node.name}`,
      isLeaf: !node.group,
      corpName: node.corpName,
      group: node.group,
      key: node.id,
      code: node.code,
      groupId: node.groupId,
      parentId: nodes.id,
      roleType: node.roleType,
      corpId: node.corpId,
      children: null,
    };
    if (node.children && node.children.length) {
      obj.children = changeData(node.children,node);
    }
    result.push(obj);
  });
  return result;
}

function userInfoChangeData(list: any, roleTitle: any) {
  if (list[0].group && list[0].children && list[0].children.length > 0) {
    userInfoChangeData(list[0].children, roleTitle);
  } else if (!list[0].group) {
    roleTitle.name = list[0].name;
    roleTitle.code = list[0].code;
    roleTitle.id = list[0].id;
  }
  return roleTitle;
}

function changeChildData(orgTree: any ,params: any){
  const { tree, key } = params;
  orgTree.forEach((o) => {
    if (o.id === key) {
      o.children = [...tree]; // 插入children
    }else if(o.children && o.children.length > 0) {
      changeChildData(o.children,params);
    }
  });
}

const state: Organization.Roles.RoleState = {
  orgTree: null,
  roleGroupList: [],
  orgTreeBySearch: null,
  isRoleSearchResult: false,
  loading: false,
  isLoadMore: false,
  treeParams: {
    groupId: "",
  },
  roleList: [],
  dataRef: {},
  roleTitle: {
    name: "",
    code: "",
    id: "",
  },
  searchTips: false,
};
const mutations = {
  assignTreeParams(
    state: any,
    params: Organization.Roles.RequestChildrenTreeParams
  ) {
    state.treeParams.groupId = params.groupId;
  },
  clearRoleList(state: any) {
    state.roleList = [];
  },
  clearOrgTreeBySearch(state: any) {
    state.isRoleSearchResult = false;
    state.searchTips = false;
    state.orgTreeBySearch = [];
  },
  setRoleOrgNode(state: any, params: any) {
    changeChildData(state.orgTree,params);
    state.orgTree = [...state.orgTree];
  },
  setUserInfo(state: any, data: Array<Organization.OrgNode>) {
    if (data.length > 0) {
      state.roleTitle = userInfoChangeData(data, {});
    }
  },
  setRoleGroupList(state: any, data: Array<Organization.OrgNode>) {
    if (!Array.isArray(data) || !data.length) {
      console.log("返回数据不能为空");
      return;
    }
    const result: any[] = changeData(data,{});
    state.roleGroupList = result;
    console.log(state.roleGroupList,'state.roleGroupList');
    
  },

  setOrgNode(state: any, data: Array<Organization.OrgNode>) {
    if (!Array.isArray(data) || !data.length) {
      console.log("返回数据不能为空");
      return;
    }
    if (!state.treeParams.groupId) {
      const result: any[] = changeData(data,{});
      console.log(result, "result");

      // 角色搜索时，赋值给orgTreeBySearch
      if (state.isRoleSearchResult) {
        state.searchTips = !result.length;
        state.orgTreeBySearch = result;
      } else {
        state.orgTree = result;
      }
    } else {
      const childNode = data;
      state.dataRef.children = [];
      const childNodeLength = childNode.length;
      for (let i = 0; i < childNodeLength; i += 1) {
        state.dataRef.children.push({
          id: childNode[i].id,
          value: childNode[i].id,
          name: childNode[i].name,
          title: `${childNode[i].name}`,
          isLeaf: !childNode[i].group,
          key: childNode[i].id,
          group: childNode[i].group,
          corpName: childNode[i].corpName,
          code: childNode[i].code,
          groupId: childNode[i].groupId,
          groupName: state.dataRef.name,
          corpId: childNode[i].corpId,
          roleType: childNode[i].roleType,
        });
      }
      // 角色搜索时，赋值给orgTreeBySearch
      if (state.isRoleSearchResult) {
        state.orgTreeBySearch = [...state.orgTreeBySearch];
      } else {
        state.orgTree = [...state.orgTree];
      }
    }
  },
  setEventKey(state: any, params: Organization.SelectTreeNode) {
    state.dataRef = params.dataRef;
  },
  async setOrgRoleList(
    state: any,
    result: Organization.Roles.RoleListMutation
  ) {
    // if (result.last) {
    //   state.isLoadMore = true;
    // }
    if (!result.content.length) {
      state.isLoadMore = true;
      state.loading = false;
      return;
    }
    let list: any = [];
    if (result.first || result.page === 0) {
      list = result.content;
    } else {
      list = state.roleList.concat(result.content);
    }

    await list.forEach((res: any, index: number) => {
      res.index = index + 1;
      if (Array.isArray(res.ouScope)) {
        res.ouScope = res.ouScope
          .map((item: any) => {
            return item.name;
          })
          .join(";");
      }
      Object.entries(res).forEach((dataObj: any) => {
        const [key, value] = dataObj;
        if (!value && key !== "unitType" && key !== "corpId") {
          // corpId 不能为 '- -'
          res[key] = "- -";
        }
      });
      res.hover = false;
      res.checked = false;
    });
    state.roleList = [].concat(list).map((x: object, idx: number) => ({
      ...x,
      index: idx + 1,
    }));
    state.isLoadMore = result.last;
    state.loading = false;
  },
};
const actions = {
  async getOrgRoleNode({ commit, state }: any) {
    const res = await OrganizationApi.getRoleLeveOneInfoNew();
    commit("clearOrgTreeBySearch");
    commit("setOrgNode", res.data);
    commit("setRoleGroupList", JSON.parse(JSON.stringify(res.data)));
    commit("setUserInfo", res.data);
  },
  async searchOrgRoleNode({ commit, state }: any, params: string) {
    const res = await OrganizationApi.searchRoleListNew(params);
    state.isRoleSearchResult = true;
    if (!res.data) {
      state.searchTips = true;
      return;
    }
    commit("setOrgNode", res.data);
  },
  async getOrgRoleList({ commit, state }: any, obj: any) {
    // if (state.loading) {
    //   return;
    // }
    state.loading = true;

    try {
      let res: any = {};
      if (obj.type === "search") {
        res = await OrganizationApi.searchRoleUserList(obj.params);
      } else {
        res = await OrganizationApi.getOrgRoleList(obj.params);
      }
      commit("setOrgRoleList", {
        content: res.data.content,
        first: res.data.first,
        last: res.data.last,
        total: res.data.totalElements,
        page: obj.params.page,
      });
      if (!res.data.empty) {
        state.isLoadMore = false;
      }
    } catch (error) {
      state.loading = false;
      state.isLoadMore = true;
    }
  },
  async getChildrenRole({ commit, state }: any) {
    const res = await OrganizationApi.getChildrenRoleNew(state.treeParams);
    commit("setOrgNode", res.data);
  },
  actionTreeOrg({ commit, state }: any, params: any) {
    commit("setRoleOrgNode", params);
    // commit('setOrgNode', params);
  },
};
export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
