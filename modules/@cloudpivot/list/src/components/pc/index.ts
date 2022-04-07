
// import DataExport from './components/data-export.vue';
// import PrintQrcode from './components/print-qrcode.vue';
// import DataUpload from './components/import/data-upload.vue';
// import DataImport from './components/import/data-import.vue';
// import DataImportStatus from './components/import/data-import-status.vue';

export default {
  ApplicationList: () => import("./application-list.vue"),
  ApplicationCustomIframe: () => import("./application-custom-iframe.vue"),
  ListSelector: () => import("./list-selector.vue"),
  QueryForm: () => import("./components/query-form.vue"),
  // DataUpload,
  // DataImport,
  // DataImportStatus,
  // DataExport,
  // PrintQrcode,
  DataUpload: () => import("./components/import/data-upload.vue"),
  DataImport: () => import("./components/import/data-import.vue"),
  DataImportStatus: () => import("./components/import/data-import-status.vue"),
  DataExport: () => import("./components/data-export.vue"),
  PrintQrcode: () => import("./components/print-qrcode.vue")
};