
<template>
  <div>
    <template v-if="!readonly">
      <relevance-form-modal v-if="isModal" :control="control" :parseDisplayFieldValue="parseDisplayFieldValue"></relevance-form-modal>

      <relevance-form-dropdown v-else :control="control" :parseDisplayFieldValue="parseDisplayFieldValue"></relevance-form-dropdown>
    </template>

    <template v-else-if="ctrl.value">
      <a
        class="link"
        v-if="showLink"
        @click.stop.prevent="onClick">
        {{ lookUpModalValue }}
      </a>
      <div v-else>{{ lookUpModalValue }}</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Provide } from "vue-property-decorator";

import RelevanceFormDropdown from "./relevance-form-dropdown.vue";
import RelevanceFormModal from "./relevance-form-modal.vue";

import { RelevanceFormControl } from "../../../controls";

import {
  RendererFormControl,
  RelevanceFormOptions,
  RelevanceFormSelectMode
} from "../../../typings";

import { formApi, listApi } from "@cloudpivot/api";

import {
  // TreeSelect,
  Select,
  Tooltip,
  Icon,
  Spin
} from "@h3/antd-vue";

@Component({
  name: "relevance-form",
  components: {
    RelevanceFormDropdown,
    RelevanceFormModal
  }
})
export default class RelevanceForm extends RelevanceFormControl {
  onClick() {
    this.open();
  }

  async created() {
    let d:any = await this.getDataModal()
    let field = ''
    if (d) {
      field = d.relativePropertyCode || this.getDisplayField || 'name'
    } else {
      field = this.getDisplayField || 'name'
    }
    if (field === 'name') return
    if (!d) return
    let res = await listApi.getDataItemList({
      schemaCode: d.relativeCode
    });
    if(res.errcode === 0) {
      let r = false
      for(let val of res.data) {
        if (val.code === field) {
           r = true
          break
        }
      }
      this.control.options.displayField = r ? d.relativePropertyCode : 'name'
    }
  }
}
</script>

<style scoped>

  a.link{
    word-break: break-all;
  }

</style>
