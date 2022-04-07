
<template>
  <div class="relevance-form-modal">
    <a-input
      :value="text"
      :readonly="true"
      :placeholder="placeholder"
      @click="onClick"
      @mouseover="onMouseenter"
      @mouseout="onMouseleave"
    >
      <a-icon
        v-show="hover"
        slot="suffix"
        type="close-circle"
        @click="clear"
        @mouseenter="onMouseenter"
      />
      <a-icon v-show="!hover" slot="suffix" type="file" />
    </a-input>

    <a-modal
      :title="formTitle"
      :visible="visible"
      :width="full ? '100%' : '1200px'"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      :dialogClass="dialogClass"
      :closable="!full"
      @ok="onModalOk"
      @cancel="onModalCancel"
    >
      <a-tooltip placement="top" v-show="!full">
        <template slot="title">
          <span>{{ $t("cloudpivot.form.runtime.biz.fullScreen") }}</span>
        </template>
        <span @click="fullScreen(true)" class="fullscreen icon aufontAll"
          >&#xe8e5;</span
        >
      </a-tooltip>

      <a-tooltip placement="top" v-show="full">
        <template slot="title">
          <span>{{ $t("cloudpivot.form.runtime.biz.smallScreen") }}</span>
        </template>
        <span @click="fullScreen(false)" class="fullscreen icon aufontAll"
          >&#xe8e7;</span
        >
      </a-tooltip>
      <list-selector
        v-model="selected"
        :newCol="newCol"
        multiple="true"
        :listCode="controlOpts.queryCode"
        :schemaCode="controlOpts.schemaCode"
        :cols="2"
        :columns="columns"
        :relevanceFormCode="this.control"
        :showActions="false"
        :query="query"
        :reverseViewFlag="!!this.control.options.showField"
        :defuaultShowSearch="false"
        @change="onListChange"
        :isAuthorize="isAuthorize"
        :control="control"
      ></list-selector>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Provide } from "vue-property-decorator";

import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";
import common from "@cloudpivot/common";

import {
  DataItemType,
  RelevanceFormSelectMode,
  convertDataItemExp,
  RendererFormControl,
  FormControlType,
} from "@cloudpivot/form/schema";

import {
  // TreeSelect,
  Modal,
  Tooltip,
  Icon,
  Spin,
  Input,
} from "@h3/antd-vue";
import { ReverseQueryService } from "@cloudpivot/form/src/common/services";
import { formApi } from "@cloudpivot/api";
import { deepCopy } from "@cloudpivot/form/utils";
import { listApi } from "@cloudpivot/api";
import cloneDeep from "lodash/cloneDeep";

@Component({
  name: "relevance-form-modal",
  components: {
    ATooltip: Tooltip,
    AModal: Modal,
    AInput: Input,
    AIcon: Icon,
    ASpin: Spin,
  },
})
export default class RelevanceFormModal extends RelevanceFormControl {
  @Prop({
    default : {}
  })
  control !: any

  visible = false;

  selected = new Array();

  selectedNew = new Array();

  allSelect = new Array();

  query = {};

  hover = false;

  full = false;
  newCol: any = [];

  @Provide()
  isMultiStatus() {
    return true;
  }

  get text() {
    let itemKey = this.getDisplayField;
    if (Array.isArray(this.ctrl.value) && this.ctrl.value.length > 0) {
      let s = "";
      this.ctrl.value.forEach((item) => {
        let currentTitle = this.parseDisplayFieldValue(item[itemKey], itemKey);
        s += currentTitle + ";";
      });
      s = s.substring(0, s.length - 1);
      return s;
    } else if (this.ctrl.value) {
      // 考虑到关联多选导入时没有传itemKey, 服务给出showName, 这种情况直接取showName
      if (this.ctrl.value.hasOwnProperty("showName")) {
        let showName = this.ctrl.value["showName"];
        if (showName) {
          let nameArr = showName.split(";");
          showName = nameArr.map((item) => (item ? item : "空")).join(";");
        }
        return showName;
      } else if (this.ctrl.value.hasOwnProperty(itemKey)) {
        let showName = this.ctrl.value[itemKey];
        if (showName) {
          let nameArr = showName.split(";");
          showName = nameArr.map((item) => (item ? item : "空")).join(";");
        }
        return showName;
      } else if (this.ctrl.value.hasOwnProperty("name")) {
        let showName = this.ctrl.value["name"];
        if (showName) {
          let nameArr = showName.split(";");
          showName = nameArr.map((item) => (item ? item : "空")).join(";");
        }
        return showName;
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  get dialogClass() {
    // { 'full-modal': full, 'relevance-form': true }
    if (this.full) {
      return 'full-modal relevance-form';
    } else {
      return 'relevance-form';
    }
  }

  async onClick() {
    this.query = this.getParams();
    let relevanceFormCode = this.control.parentKey
      ? `${this.control.parentKey}.${this.control.key}`
      : this.control.key;
    if (this.control.path) {
      relevanceFormCode = this.control.path.join(".");
    }
    if (
      this.control.options.showField &&
      Array.isArray(this.control.options.showField) &&
      this.control.options.showField.length > 0
    ) {
      const param = {
        sheetCode: this.control.options.sheetParams.sheetCode,
        schemaCode: this.control.options.sheetParams.schemaCode,
        relevanceFormCode: relevanceFormCode,
      };
      const res: any = await listApi.selectFormTitle(param);
      if (res.errcode === 0) {
        res.data.configBizPropertyList.map((options) => {
          options.code = options.code === "id" ? "ids" : options.code;
          options.propertyCode = options.code;
          options.width = "120";
          options.childColumns =
            options.subSchema && options.subSchema.properties;
          if (
            options.propertyType === DataItemType.Sheet &&
            options.childColumns
          ) {
            options.childColumns = options.childColumns.map((v) => {
              v.propertyCode = v.code;
              v.vcTitle = v.name;
              v.width = "150";
              return v;
            });
          }
          return options;
        });

        this.newCol = res.data.configBizPropertyList;
        this.visible = true;
        this.formTitleObj = await RelevanceFormControl.service.getBizmodelTitle(
          this.controlOpts.schemaCode || ""
        );
      }
    } else {
      this.visible = true;
    }
  }

  onMouseenter() {
    this.hover = true;
  }

  onMouseleave() {
    this.hover = false;
  }

  clear() {
    this.ctrl.value = null;
    this.selected = [];
    this.selectedNew = [];
  }

  onListChange(rows: any) {
    this.selected = rows;
    const data = cloneDeep(rows);
    data.forEach((o) => {
      for (let key in o) {
        if (Array.isArray(o[key])) {
          var i = o[key].length;
          while (i--) {
            if (o[key][i].checked === false) {
              o[key].splice(i, 1);
            }
          }
        }
      }
    });
    this.selectedNew = data;
  }

  fullScreen(full: boolean) {
    this.full = full;
  }

  async onModalOk() {
    this.allSelect = cloneDeep(this.selected);
    let item = await this.convertForMappings(this.selectedNew);
    this.visible = false;
    if (item) {
      this.interceptorValue(item);
      setTimeout(() => {
        this.setValue(cloneDeep(item));
      }, 300);
    }
    // this.interceptorValue(item);
    // this.setValue(item);
    // setTimeout(() => {
    //   this.setValue(deepCopy(item));
    // }, 500);
  }

  onModalCancel() {
    this.visible = false;
    this.full = false;
    if (this.allSelect) {
      this.selected = this.allSelect;
    } else {
      this.selected = [];
    }
    if (this.ctrl.value) {
      // this.selected = this.ctrl.value;
    }
  }

  get isAuthorize(){
    return this.control.options.isAuthorize
  }

  beforeCreate() {
    const comp = RelevanceFormControl.loadListSelector();

    (this.$options as any).components.ListSelector = comp;
  }
}
</script>

<style lang="less" scoped>
.ant-input-suffix > i {
  color: #ccc;
}

.relevance-form-modal .anticon-close-circle {
  cursor: pointer;
  transition: color 0.3s;
  font-size: 12px;

  &:hover {
    color: #999;
  }

  &:active {
    color: #666;
  }
}

.fullscreen {
  position: absolute;
  top: 16px;
  right: 60px;
  cursor: pointer;
}

.full-modal .fullscreen {
  right: 16px;
}
</style>

<style lang="less">
.relevance-form:not(.full-modal) .ant-modal-body .list-selector {
  height: 56vh;
  overflow: auto;
}
</style>
