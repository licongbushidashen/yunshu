/* 
* 系统公共store
*/
const state:any = {
  isAdmin: false, //是否有登陆后台的权限
  admin: false, //是否为系统管理员
  isRootAdmin: false, // 是否为超级管理员
  loginedUserInfo: null, // 用户信息
  isPrivilegedPerson: false // 是否特权人
};

const mutations = {
  // 设置登陆后台的权限
  setIsAdmin(state: any, params: any) {
    state.isAdmin = params;
  },
  setIsPrivilegedPerson(state: any, params: any) {
    state.isPrivilegedPerson = params;
  },

  // 设置是否为系统管理员
  setAdmin(state: any, params: any) {
    state.admin = params;
  },
  // 设置是否为超级管理员
  setRootAdmin(state: any, params: any) {
    state.isRootAdmin = params;
  },
  // 设置用户信息
  setUserInfo(state: any, params: any) {
    state.loginedUserInfo = params
  }
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
