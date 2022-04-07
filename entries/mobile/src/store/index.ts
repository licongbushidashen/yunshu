import Vue from 'vue';
import Vuex from 'vuex';

import circulate from '@cloudpivot/flow-center/src/components/mobile/store/circulate';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    circulate
  },
  state: {
    userinfo: {
      id: '',
      name: '',
      username: '',
    },
    appCode: '',
    hasControlOpen: false,
    config: {},
    appName: '',
    curAppData: {},
  },
  mutations: {
    setUserinfo(state: any, payload: OAuth.Userinfo) {
      state.userinfo = payload;
    },
    setAppCode(state: any, appCode: string) {
      state.appCode = appCode;
    },
    setControlOpenStatus(state: any, status: boolean) {
      state.hasControlOpen = status;
    },
    setConfig(state: any, config:any){
      state.config = config;
    },
    setAppName(state: any, name:any){
      state.appName = name;
    },
    setCurAppData(state: any, data:any){
      state.curAppData = null;
      if (data && Array.isArray(data.dataList)) {
        data.dataList.forEach((d:any) => {
          d.open = false;
        });
      }
      state.curAppData = data;
    },
  },
  actions: {
  },
});
