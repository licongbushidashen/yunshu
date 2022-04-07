
// export default {
//     FormRenderer: () => import('../mobile-form-renderer.vue'),
//     StaffSelector: () => import('../shared/mobile-staff-selector.vue'),
//     ApproveOpinion: () => import('./approve-opinion.vue'),
//     H3Scroll: () => import('../layout/h3-mescroll.vue'),
// };

import FormRenderer from '../mobile-form-renderer.vue';
import StaffSelector from '../shared/mobile-staff-selector.vue';
import ApproveOpinion from './approve-opinion.vue';
import ApproveOpinion1 from './approve-opinion1.vue';
import H3Scroll from '../layout/h3-mescroll.vue';

export default {
    FormRenderer,
    StaffSelector,
    ApproveOpinion,
    ApproveOpinion1,
    H3Scroll
}