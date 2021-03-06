import Vue from 'vue';
// import Antd from '@h3/antd-vue';
// import '@h3/antd-vue/dist/antd.less';

// Vue.use(Antd);

import { message, Modal } from '@h3/antd-vue';

Vue.prototype.$message = message;
Vue.prototype.$confirm = Modal.confirm;

/**
 * 是否是钉钉
 */
Vue.prototype.isDingTalk = /DingTalk/.test(navigator.userAgent);