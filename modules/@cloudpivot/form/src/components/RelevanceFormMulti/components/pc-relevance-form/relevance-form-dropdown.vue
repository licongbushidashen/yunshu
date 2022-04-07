
<template>
  <!-- <a-tree-select
    showSearch
    allowClear
    :filterTreeNode="false"
    @focus="onSearch('')"
    @search="onSearch"
    style="width:100%"
    >

    <a-icon slot="suffixIcon" type="smile" />

    <a-tree-select-node 
        v-for="opt in options" 
        :key="opt.id" 
        :value="opt.id" 
        :title="opt.name" 
    />

  </a-tree-select>-->
  <a-select
    mode="multiple"
    :value="selectedId"
    showSearch
    allowClear
    :filterOption="false"
    :notFoundContent="fetching ? undefined : '无匹配结果'"
    :placeholder="placeholder"
    :getPopupContainer="getPopupContainer()"
    @focus="onFocus"
    @search="onSearch"
    @change="onChange"
    style="width: 100%"
  >
    <!-- <a-icon slot="suffix" type="file"/> -->

    <a-spin v-if="fetching" slot="notFoundContent" size="small" />

    <a-select-option
      v-if="selectedId && list.length === 0 && selectedItem"
      :value="selectedId"
      >{{ selectedItem }}</a-select-option
    >

    <a-select-option
      v-for="item in drowdownList"
      :key="item.id"
      :value="item.id"
      >{{ item[getDisplayField] }}</a-select-option
    >
  </a-select>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

// import {
//   // RelevanceFormControl,
//   RelevanceFormSearchResult
// } from "../../../controls";

import {
  RelevanceFormSearchParams,
  RelevanceFormSearchResult,
} from "@cloudpivot/form/src/common/controls";

import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";

import {
  // TreeSelect,
  Select,
  Tooltip,
  Icon,
  Spin,
} from "@h3/antd-vue";

import { formApi } from "@cloudpivot/api";
import { ReverseQueryService } from "@cloudpivot/form/src/common/services";

import { deepCopy } from "@cloudpivot/form/utils";

@Component({
  name: "relevance-form-dropdown",
  components: {
    ATooltip: Tooltip,
    ASelect: Select,
    ASelectOption: Select.Option,
    // ATreeSelect: TreeSelect,
    // ATreeSelectNode: TreeSelect.TreeNode,
    AIcon: Icon,
    ASpin: Spin,
  },
})
export default class RelevanceFormDropdown extends RelevanceFormControl {
  list: RelevanceFormSearchResult[] = [];

  searchTimeoutRef: any;

  fetching = false;

  listAll: RelevanceFormSearchResult[] = [];

  created() {
    this.onSearch("");
  }

  get selectedId() {
    if (Array.isArray(this.ctrl.value)) {
      return this.ctrl.value.map((i) => i.id);
    } else if (this.ctrl.value) {
      if (this.ctrl.value.id) {
        return this.ctrl.value.id.split(";");
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  get selectedItem() {
    if (this.selectedId.length > 0 && this.list.length === 0) {
      let strRes = "";
      if (Array.isArray(this.ctrl.value)) {
        this.selectedId.forEach((item) => {
          let chosenOne = this.ctrl.value.find((x) => x.id === item);
          if (chosenOne) {
            strRes += chosenOne[this.getDisplayField] + ";";
          }
        });
        if (!strRes) {
          strRes = strRes.substring(0, strRes.length - 1);
        }
        return strRes;
      } else if (this.ctrl.value) {
        return this.ctrl.value[this.getDisplayField];
      } else {
        return "";
      }
    }
    return "";
  }

  get drowdownList() {
    if (this.list.length) {
      let arr: any[] = [];
      for (let val of this.list) {
        if (val[this.getDisplayField] !== null) {
          let value = this.parseDisplayFieldValue(
            val[this.getDisplayField],
            this.getDisplayField
          );
          arr.push({
            id: val.id,
            [this.getDisplayField]: value,
          });
        }
      }

      return arr;
    } else {
      return [];
    }
  }

  setControl() {
    super.setControl();
    if (this.selectedId.length > 0) {
      this.onFocus();
    }
  }

  onFocus() {
    this.search("");
  }

  onSearch(value: string) {
    clearTimeout(this.searchTimeoutRef);
    this.searchTimeoutRef = setTimeout(() => {
      this.search(value);
    }, 300);
  }

  async search(value: string) {
    if (!value) {
      this.fetch(0, 1000, value).then((seg) => {
        this.listAll = seg.data;
        this.list = seg.data;
      });
    } else {
      if (this.queryConditions.length === 0 && this.controlOpts.conditions) {
        const res = await this.getConfig();
        if (res && res.conditions) {
          this.queryConditions = res.conditions;
        }
      }

      if (this.fetching) {
        return;
      }
      this.fetching = true;
      this.list = [];
      this.fetch(0, 1000, value).then(
        (seg) => {
          this.fetching = false;
          this.list = seg.data;
        },
        () => (this.fetching = false)
      );
    }
  }

  async onChange(selectedId: string[]) {
    if (selectedId.length) {
      let arr: any[] = [];
      selectedId.forEach((i) => {
        let current = this.listAll.find((x) => x.id === i);
        if (current) {
          arr.push(current);
        }
      });

      let newArr = await this.convertForMappings(arr);
      this.interceptorValue(newArr);
      this.setValue(newArr);
      setTimeout(() => {
        this.setValue(deepCopy(newArr));
      }, 500);
    } else {
      this.ctrl.value = null;
    }
  }
}
</script>

<style>
</style>
