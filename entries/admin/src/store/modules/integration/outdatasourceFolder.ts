import FolderApi from '@/apis/biz-service/outdatasourceFolder.api';

const state = {
  Folders: [],
}

const mutations = {
  setFolders(state: any, payload: BizService.Folder.Item[]) {
    state.Folders = payload
  },
  deleteFolder(state: any, payload: BizService.Folder.Item){
    state.Folders = state.Folders.filter((item: BizService.Folder.Item) => item.id !== payload.id)
  }
}

const actions = {
  getFolders({ commit }: any) {
    return FolderApi.listFolder().then((res: Common.Res<BizService.Folder.Item[]>) => {
      if (!res.errcode && res.data) {
        commit('setFolders', res.data)
      }
    })
  },
  createFolder({ dispatch }: any, item: BizService.Folder.CreateParams) {
    return FolderApi.createFolder(item).then(async (res: any) => {
      if (!res.errcode) {
        await dispatch('getFolders');
      }
      return res;
    })
  },
  updateFolder({ dispatch }: any, item: BizService.Folder.UpdateParams) {
    return FolderApi.updateFolder(item).then((res: any) => {
      if (!res.errcode) {
        dispatch('getFolders');
      }
      return res;
    })
  },
  deleteFolder({ commit }: any, item: BizService.Folder.Item) {
    return FolderApi.deleteFolder(item).then((res: any) => {
      if (!res.errcode) {
        commit('deleteFolder', item)
      }
      return res
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}