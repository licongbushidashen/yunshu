
import { FormDetail } from '../form-detail';
import FormActions from './form-actions.vue';

export default {
    FormActionModal: () => import('./form-action-modal.vue'),
    FormActions,
    // FormActions: () => import('./form-actions.vue'),
    FormDetail: FormDetail
};