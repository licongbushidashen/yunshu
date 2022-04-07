// export default {
//     FormRenderer: () => import(/* webpackChunkName: "pc-form-renderer" */'../pc-form-renderer.vue'),
//     StaffSelector : () => import('../shared/staff-selector.vue'),
//     H3Textarea : () => import('./h3-textarea.vue')
// };

import FormRenderer from "../pc-form-renderer.vue";
// import StaffSelector from '../shared/staff-selector.vue';
import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import H3Textarea from "./h3-textarea.vue";

export default {
  FormRenderer,
  StaffSelector,
  H3Textarea,
};
