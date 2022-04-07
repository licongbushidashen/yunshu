import OrganizationApi from "@/apis/organization";

enum UnitType {
  User = 0,
  Deaprtment = 1,
  Company = 2,
}

const state: Organization.Users.State = {
  orgUserList: [],
  /* 用户信息参数 */
  userInfoParams: {
    id: "",
  },
  hasCloudPivotPerm: false,
  eduUserInfoParams: {
    userId: "",
    deptId: "",
  },
  orgUserInfo: null,
  loading: false,
  noUser: true,
  loadCompleted: false,
  searchTitle: "",
  showIEBtn: false, // 部门导入导出按钮权限
  firstLoad: true, // 是否第一次加载
  paramsOpts: {},
  userExt: {
    orgList: [],
    groupList: [],
    title: ""
  },
  userExtension: []
};

const mutations = {
  // 设置权限
  setBtnPermission(state: any, bl: boolean) {
    state.showIEBtn = bl;
  },
  setCloudPivotPerm(state: any, bl: boolean) {
    state.hasCloudPivotPerm = bl;
  },
  clearUserList(state: any) {
    state.orgUserList = [];
  },
  setLoadCompleted(state: any, bl: boolean) {
    state.loadCompleted = bl;
    state.noUser = bl;
  },
  setLoadCompletedNew(state: any, bl: boolean) {
    state.loadCompleted = bl;
    state.loading = !bl;
  },
  setUserList(state: any, payload: Organization.Users.OrgUserListPayload) {
    const { data, isSearch, params } = payload;
    // 设置组织机构用户列表
    if (data && data.content) {
      // 当用户数据等于100条时显示加载更多
      state.noUser = false;
      // if (!data.content.length && data.first) {
      //   state.noUser = true;
      // }
      // state.loadCompleted = data.last;
      state.searchTitle = `"${params.wd}"相关的搜索结果：共${
        data.totalElements
        }个`;
      // if (data.first) {
      //   state.orgUserList = [];
      // }
      const page = params.page;
      if (page === 0) {
        state.orgUserList = data.content;
      } else {
        state.orgUserList = state.orgUserList.concat(data.content);
      }
      if (!state.orgUserList.length) {
        state.noUser = true;
      }

      console.log(data.totalElements, state.orgUserList.length, page);

      if (data.totalElements === state.orgUserList.length) {
        state.loadCompleted = true;
      } else {
        state.loadCompleted = false;
      }
      const admins = state.orgUserList.filter((x: any) => x.leader);
      const rest = state.orgUserList.filter((x: any) => !x.leader);
      state.orgUserList = [...admins, ...rest];
      state.orgUserList.forEach((org: any) => {
        Object.entries(org).forEach((item: any) => {
          const [key, value] = item;
          if (typeof value !== "boolean" && !value) {
            org[key] = "- -";
          }
        });
      });
      state.orgUserList = state.orgUserList.filter(
        (x: any) => x.status !== "DISABLE"
      );
      const orgUserListLength = state.orgUserList.length;
      for (let i = 0; i < orgUserListLength; i += 1) {
        state.orgUserList[i].index = i + 1;
      }
    } else {
      state.noUser = true;
      console.log("返回数据不能为空");
    }
    state.loading = false;
  },
  assignUserInfoParams(state: any, params: Organization.Users.RequestParams) {
    state.userInfoParams = params;
  },
  setEduUserInfoParams(
    state: any,
    params: Organization.Users.EduRequestParams
  ) {
    state.eduUserInfoParams = params;
  },
  setUserInfo(state: any, data: Organization.Users.OrgUserNode) {
    if (data.departmentName) {
      data.otherDepartments = data.departmentName.split(",");
    } else {
      data.otherDepartments = [];
    }
    state.orgUserInfo = data;
  },
  clearUserInfo(state: any) {
    state.orgUserInfo = null;
  },
  setUserExt(state: any, data: Organization.Users.OrgUserExt) {
    state.userExt = data;
  },
  setUserExtension(state: any, data: any[]) {
    state.userExtension = data;
  }
};

const actions = {
 
  async getOrgUserList({ commit, state }: any, paramsObj: any) {
    const { params, isSearch } = paramsObj;
    state.loading = true;
    let res: any = {};
    if (isSearch) {
      // 根据用户名搜索请求组织机构用户列表
      state.searchTitle = `"${params.wd}"相关的搜索结果：共0个`;
      res = await OrganizationApi.searchOrgUserList(params);
    } else {
      // 请求组织机构用户列表
      res = await OrganizationApi.getOrgList(params);
    }
    if (res.data && res.errcode === 0) {
      commit("setUserList", { data: res.data, isSearch, params });
    } else {
      state.noUser = true;
      state.loading = false;
    }
  },
  async getOrgUserInfo({ commit, state }: any, isHomeSchool?: boolean) {
    // 根据用户ID获取用户详情信息
    if (isHomeSchool) {
      const res = await OrganizationApi.getEduUserInfo(state.eduUserInfoParams);
      if (res.errcode === 0 && res.data) {
        commit("setUserInfo", res.data);
      }
    } else {
      const res = await OrganizationApi.getOrgUserInfo(state.userInfoParams);
      if (res.errcode === 0 && res.data) {
        commit("setUserInfo", res.data);
      }
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
