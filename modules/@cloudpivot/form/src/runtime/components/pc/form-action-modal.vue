

<template>
  <a-modal
    v-model="visible"
    :title="options.title"
    :maskClosable="false"
    :keyboard="false"
    :okText="$t('languages.common.ok')"
    :cancelText="$t('languages.common.cancel')"
    :destroyOnClose="true"
    @ok="ok"
    :class="modalClass"
     @cancel="cancelClick"
  >
    <component
      ref="component"
      :is="modal"
      :options="options"
      @nodeOk="handleNextNodeOk"
    />
  </a-modal>
</template>


<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { Modal } from "@h3/antd-vue";

import FormReject from "./form-reject.vue";
import FormForward from "./form-forward.vue";
import FormDeptSelect from "./form-dept-select.vue";
import FormUrge from "./form-urge/index.vue";
import EditOwner from "./form-modify-owner.vue";
import FormNextNode from "./form-next-node.vue";

// import FormMarking from "@cloudpivot/list/src/components/pc/components/form-marking.vue"

import {
  FormActionComponent,
  FormActionModalOptions
} from "../../form-action-modal";

import { FormAction } from "../../form-action";

@Component({
  name: "form-reject-modal",
  components: {
    AModal: Modal,
    FormDeptSelect,
    FormReject,
    FormForward,
    FormUrge,
    EditOwner,
    FormNextNode
  }
})
export default class FormActionModal extends Vue {
  // @Prop()
  options: FormActionModalOptions = {} as any;

  visible = false;

  modal = "";

  get modalClass() {
    return {
      "form-action-model_urge": this.modal === "FormUrge",
      "form-action-model_common": !(this.modal === "FormUrge"),
      "form-dept-select-model": this.modal === "FormDeptSelect"
    };
  }

  show(opts: FormActionModalOptions) {
    this.options = opts;

    switch (opts.code) {
      case FormAction.ChangeNextNodeUser:
        this.modal = "FormNextNode";
        break;
      case FormAction.Reject:
        this.modal = "FormReject";
        break;
      case FormAction.Assist:
      case FormAction.Circulate:
      case FormAction.Forward:
      case FormAction.AdjustParticipant:
        this.modal = "FormForward";
        break;
      case FormAction.Submit:
      case FormAction.Agree:
      case FormAction.DisAgree:
        this.modal = "FormDeptSelect";
        break;
      case FormAction.Urge:
        this.modal = "FormUrge";
        break;
      case FormAction.EditOwner:
        this.modal = "EditOwner";
        break;
      default:
        this.modal = "";
        break;
    }

    this.visible = !!this.modal;
  }

  close() {
    this.visible = false;
  }

  ok() {
    if (!this.modal) {
      return;
    }

    const modal = (this.$refs.component as any) as FormActionComponent;
    const data = modal.submit();
    if (data === null || data === undefined) {
      return false;
    }
    this.$emit(
      "ok",
      {
        code: this.options.showNextNode && this.options.code !== 'changeNextNodeUser' ? 'changeNextNodeUser' : this.options.code === 'changeNextNodeUser' ? 'submit' : this.options.code,
        text: this.options.title
      },
      data
    );
    this.close();
  }
 cancelClick() {
    if (this.modal == 'FormReject' && this.options && this.options.approval && this.options.approval.controller && this.options.approval.controller.value && this.options.approval.controller.value.content == '不同意') {
      this.options.approval.controller.value.content = ''
    }
  }
  handleNextNodeOk(data:any){
    this.$emit(
      "ok",
      {
        code: this.options.showNextNode && this.options.code !== 'changeNextNodeUser' ? 'changeNextNodeUser' : this.options.code === 'changeNextNodeUser' ? 'submit' : this.options.code,
        text: this.options.title
      },
      data
    );
    this.close();
  }
}
</script>

<style lang="less">
.form-action-model_urge {
  .ant-modal-header {
    border-bottom: 0;
  }
  .ant-modal-footer {
    border-top: 0;
  }
}

.form-action-model_common {
  .ant-modal-body {
    max-height: calc(100vh - 56px - 70px - 100px);
    overflow-y: auto;
  }
}
.form-dept-select-model {
  .field__control {
    max-height: 600px !important;
  }
  width: 520px;
  .ant-radio-wrapper {
    white-space: normal;
    word-break: break-all;
    word-wrap: break-word;
  }
  .ant-radio-wrapper > span + span {
    display: block;
    padding-left: 25px;
    margin-top: -20px;
  }
}
</style>
