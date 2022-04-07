/*
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-06 17:37:05
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-09-07 22:02:46
 */
import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import System from "./modules/system/index";
import WorkflowCenter from "./modules/workflow-center/index";
import { bizproperty, bizpropertyApi } from "@cloudpivot/api";

const vuexLocal = new VuexPersistence({
  key: "vuex",
  storage: localStorage,
  reducer: (state: any) => ({
    appCode: state.appCode
  })
});

Vue.use(Vuex);

export default new Vuex.Store({
  namespace: true,
  state: {
    appCode: "", // 单应用appCode,
    config: {},
    formRuleList: [],
    motalflag: null,
    wynum: 0,
    wynum1: 0,
    dept: {},
    wyld: false,
    wyadmin: false
  },
  mutations: {
    setAppCode(state: any, appCode: string) {
      state.appCode = appCode;
    },
    setConfig(state: any, config: string) {
      state.config = config;
    },
    setFormRuleList(state: any, val: Array<any>) {
      state.formRuleList = val;
    },
    setMotalflag(state: any, flag: any) {
      state.motalflag = flag;
    }
  },
  actions: {
    async getFormRuleList({ commit, state }: any, param?: any) {
      const params: bizproperty.dataRlueParam = {
        schemaCode: param.bizSchemaCode
      };
      const res = await bizpropertyApi.getDataRules(params);
      if (res.errcode === 0) {
        commit("setFormRuleList", res.data);
      }
    }
  },
  modules: {
    WorkflowCenter,
    System
  },
  plugins: [vuexLocal.plugin]
} as any);
