import methodApi from '@/apis/biz-service/method.api';

const state = {
  list: [],
  clist: [],
  wd: '',
  isLoading: false,
  locationTypes: [],
  paramTypes: [],
  httpTypes: [],
  requestBodyTypes: [],
}

const mutations = {
  setLoading(state: any, payload: boolean) {
    state.isLoading = payload;
  },
  setList(state: any, payload: any) {
    payload.forEach((item, index) => {
      item.index = index + 1;
    })
    state.list = payload;
    state.clist = payload;
  },
  filterServices(state: any, payload: string) {
    state.wd = payload.toLowerCase();
    if (payload) {
      const wd = state.wd.toLowerCase()
      state.list = state.clist.filter((item: BizService.Service.Item) => new RegExp(wd).test((item.name).toLowerCase()) || new RegExp(wd).test((item.code).toLowerCase()));
    } else {
      state.list = state.clist;
    }
    state.list.forEach((item: any, index: number) => {
      item.index = index + 1;
    })
  },
  setLocationTypes(state: any, payload: any) {
    state.locationTypes = payload.filter((item: any) => item.index === '0' || item.index === '2' || item.index === '3').map((item: any) => ({
      label: item.name,
      value: +item.index
    }));
  },
  setParamTypes(state: any, payload: any) {
    state.paramTypes = payload.map((item: any) => ({
      label: item.name,
      value: +item.index
    }));
  },
  setHttpTypes(state: any, payload: any) {
    state.httpTypes = payload.http.map((item: any) => ({
      label: item.name,
      value: +item.index
    }));
    state.requestBodyTypes = payload.requestbody.map((item: any) => ({
      label: item.name,
      value: +item.index
    }));
  },
}

const actions = {
  getTypes({ commit }: any) {
    Promise.all([
      methodApi.listLocationType(),
      methodApi.listParamType(),
      methodApi.listHttpType()
    ]).then(([locations, params, requests]) => {
      commit('setLocationTypes', locations.data);
      commit('setParamTypes', params.data);
      commit('setHttpTypes', requests.data);
    })
  },
  getParamTypes({ commit }: any) {
    methodApi.listParamType().then((params) => {
      commit('setParamTypes', params.data);
    })
  },
  getMethods({ }: any, params: BizService.Method.ListByCodeParams) {
    return methodApi.listMethodsByCode(params)
  },
  createDatasourceMethods({ }: any, params: BizService.Method.CreateParams) {
    return methodApi.createDatasourceMethods(params)
  },
  updateDatasourceMethods({ }: any, params) {
    return methodApi.updateDatasourceMethods(params);
  },
  deleteDatasourceMethods({ }: any, params) {
    return methodApi.deleteDatasourceMethods(params);
  },
  getListDatasourceMethods({ commit }: any, categoryId) {
    commit('setLoading', true);
    return methodApi.getListDatasourceMethods({ categoryId }).then(res => {
      commit("setList", Array.isArray(res.data) ? res.data : []);
      commit("filterServices", "");
      commit('setLoading', false);
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}