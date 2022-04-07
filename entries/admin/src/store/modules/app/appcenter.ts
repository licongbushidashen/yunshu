import AppCenterApi from '@/apis/apps';
import appBaseApi from '@/apis/app-settings/base.api';


const state: Apps.AppCenter.State = {
  appList: [],
  loading: false,
  appGroupList: [],
  appGroupListAll: [],
  appCount: 0,
  appInfo: {
    name: "",
    code: "",
  },
  showEditDrawer: false,
  groupKey: "all",
};

const mutations = {
  setAppList(state: any, data: Array<Apps.AppCenter.AppInfo>) {
    state.appList = data;
  },
  setLoading(state: any, data: Array<Apps.AppCenter.AppInfo>) {
    state.loading = data;
  },
  setAppGroupList(state: any, data: Array<Apps.AppCenter.AppGroup>) {
    state.appGroupList = data;
  },
  setAppGroupListAll(state: any, data: Array<Apps.AppCenter.AppGroup>) {
    state.appGroupListAll = data;
  },
  setAppDetail(state: any, data: Apps.AppCenter.AppInfo) {
    state.appInfo = data;
  },
  setShowEditDrawer(state: any, showEditDrawer: boolean) {
    state.showEditDrawer = showEditDrawer;
  },
  setGroupKey(state: any, groupKey: string) {
    state.groupKey = groupKey;
  },
  setAppCount(state: any, appCount: number) {
    state.appCount = appCount;
  },
};

const actions = {
  /**
   * 获取应用列表
   */
  async getAppList({ commit, state }: any, params: any) {
    // const res:any = await AppCenterApi.getAppList();
    commit('setLoading', true);

    // 拆分接口对性能并没有提升，需求要拆就拆了start
    // const res: any = await AppCenterApi.getAppgroupList(params);
    let appGroupList:any = {}
    appGroupList = params.isLoad ? await AppCenterApi.getAppgroup({}) : {
      data: state.appGroupListAll,
      errcode: 0
    }
    const apps:any = await AppCenterApi.getGroupAppByKey({groupCode: params.groupCode})
    let currentGroup = appGroupList.data.find(el => el.code === params.groupCode)
    currentGroup.children = apps.data.children
    let res = appGroupList
    // 拆分接口对性能并没有提升，需求要拆就拆了end

    if (res.errcode === 0) {
      const gourpListAll = res.data.map((d: any) => {
        return {
          id: d.id,
          code: d.code,
          name: d.name,
        };
      });
      const data: any = res.data.find((d: Apps.AppCenter.AppGroup) => d.code === params.groupCode);
      const appList: Array<Apps.AppCenter.AppInfo> = data ? data.children : [];
      let appCount = 0 ;
      commit('setAppList', appList);
      commit('setLoading', false);
      commit("setAppGroupListAll", gourpListAll);
      commit("setAppGroupList", gourpListAll.filter(item => item.code !=='all'));
      res.data.forEach(v => {
        if(v.code === 'all' && v.children)
        {

           appCount = v.children.length;
        }

      })
      if(appCount)
      {
        commit('setAppCount', appCount);
      }
    }
  },

  /**
   * 添加应用
   * @param params
   */
  async addAppPackage({ dispatch }: any, params: Apps.AppCenter.AppInfo) {
    const res = await AppCenterApi.addAppPackage(params);
    if (res.errcode === 0) {
      // 获取应用列表
    const param: any = {
      groupCode: params.groupCode,
      fromRecycle: false,
    };
      // await dispatch('getAppList',param);
    } else {
      return Promise.reject(res);
    }
  },

  /**
   * 检查应用下是否有模型
   * @param params
   */
  async checkIfHasModel({ dispatch }: any, params: Apps.AppCenter.AppInfoParams) {
    return AppCenterApi.checkIfHasModel(params);
  },

  /**
   * 删除应用
   * @param params
   */
  async popAppPackage({ dispatch, commit, state }: any, params: Apps.AppCenter.AppInfoParams) {
    const res = await AppCenterApi.deleteAppPackage(params);
    if (res.errcode === 0) {
      // 删除应用时把当前应用信息清空, 避免一些缓存信息导致错误
      commit('setAppDetail', {
        name: '',
        code: ''
      });
      await dispatch('getAppList', {fromRecycle: false, groupCode: state.groupKey}); // 删除之后忘传默认参数，导致筛选失败
    }
  },

  /**
   * 应用排序
   * @param params
   */
  async updateAppSort({ dispatch }: any, params: Apps.AppCenter.AppSortParams) {
    const res = await AppCenterApi.updateAppSort(params);
    if (res.errcode === 0) {
      await dispatch('getAppList');
    }
  },

  /**
   * 获取单个应用的详情
   * @param params
   */
  async getAppDetail({ commit, state }: any, params: Apps.AppCenter.AppInfoParams) {
    if (state.appInfo.code === params.appCode) {
      return;
    }
    const res = await AppCenterApi.getAppDetail(params);
    if (res.data) {
      commit('setAppDetail', res.data);
    }
  },

  /**
   * 更新应用
   * @param params
   */
  async updateAppPackage({ state, commit }: any, params: Apps.AppCenter.AppInfo) {
    const res: Apps.AppCenter.AppInfo = {
      ...state.appInfo,
      ...params
    };
    const response: Common.Data = await appBaseApi.updatePackage(res);
    if (!response.errcode) {
      const list = state.appList.map((i:any) => {
        if(i.id === res.id){
          i = res
        }
        return i;
      })
      Object.assign(state.appInfo, params);
      commit('setAppDetail', res);
      commit('setAppList', list);
      commit('setShowEditDrawer', false);
    }
    return response;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
