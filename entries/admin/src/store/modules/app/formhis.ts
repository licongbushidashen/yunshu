
const state: Apps.FormHis.State = {
  currentVersion: '',
  currentHistoty: {
    id: '',
    remarks: '',
    createdTime: '',
    modifiedTime: '',
    deleted: false,
    createdBy: '',
    modifiedBy: '',
    name: '',
    name_i18n: '',
    code: '',
    icon: '',
    schemaCode: '',
    published: true,
    sortKey: 0,
    pcUrl: '',
    mobileUrl: '',
    publishedViewJson: '',
    draftAttributesJson: '',
    draftHtmlJson: '',
    publishedHtmlJson: '',
    draftActionsJson: '',
    publishedActionsJson: '',
    shortCode: '',
    printTemplateJson: '',
    qrCodeAble: '',
    pdfAble: '',
    tempAuthSchemaCodes: '',
    borderMode: '',
    layoutType: '',
    formComment: false,
    subTip: '',
    publishBy: '',
    version: 0,
    tempAuthSchemaCodeSet: []
  }
};

const mutations = {
  setCurHistory(state: any, data: Apps.FormHis.FormHisModel) {
    state.currentHistoty = data;
  },
  setCurrentVersion(state: any, data: any) {
    state.currentVersion = data;
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
