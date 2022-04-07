
<script lang='ts'>
import { Component, Vue, Prop, Provide } from "vue-property-decorator";
import { listApi } from "@cloudpivot/api";
import ControlAdapter from "./pc/control-adapter.vue";
import FormCol from "./pc/form-col.vue";
import FormRow from "./pc/form-row.vue";

import FormGroup from "./layout/form-group.vue";

import FormTabs from "./layout/pc-form-tabs.vue";

// import zhToEn from "@cloudpivot/list/src/components/pc/locales/zhToEn"
// import FormTabsPane from "./layout/pc-form-tabs-pane.vue";

import { FormRenderer } from "./form-renderer";
import { Tabs } from "@h3/antd-vue";

@Component({
  name: "pc-form-renderer",
  components: {
    ControlAdapter,
    FormCol,
    FormRow,
    FormGroup,
    FormTabs,
    // FormTabsPane,
    ATabPane: Tabs.TabPane
  }
})
export default class PcFormRenderer extends FormRenderer {
  @Prop()
  relevanceDataList!: [];

  // 关联组织介入之后需要根据某些参数去获取不同场景的用户
  @Prop()
  sourceType!: string;

  @Prop() schemaCode!:string;

  @Provide()
  getSourceType() {
    return this.sourceType;
  }

  @Provide()
  getController() {
    return this.controller;
  }

  @Provide()
  findController(key: string | number, rowIndex?:number) {
    if (!this.controller) {
      return;
    }
    // @ts-ignore
    return this.controller.findChild(key, rowIndex);
  }

  @Provide()
  getFormControls(keys?: string[]) {
    return super.findFormControls(keys);
  }

  @Provide()
  emitSheetColumnResize(data: any) {
    this.$emit("sheetColumnResize", data);
  }

  @Provide()
  valChange(keys: string, fun: Function) {
    if (this && this.controller) {
      const _ctrl: any = this.controller.findChild(keys);
      // if (!_ctrl) return;
      _ctrl.valueChange.subscribe((change:any) => {
        fun(change);
      });
    }
  }

  @Provide()
  getDataItem(keys: string, parentKey?: string) {
    if (parentKey) {
      const sheet = this.dataItems.find(res => {
        return res.code === parentKey;
      });
      if (sheet && sheet.subSchema) {
        return sheet.subSchema.properties.find(res => res.code === keys);
      }
    } else {
      return this.dataItems.find(res => res.code === keys);
    }
  }

  @Provide()
  getFormPermission() {
    return this.formPermission;
  }

  @Provide()
  async getRelativeDataList(isList?:boolean) {
    if (!this.relevanceDataList || !this.relevanceDataList.length) {
      let {schemaCode} = this.$route.params
      if(!schemaCode){
        schemaCode = this.$route.params.bizSchemaCode
      }
      if (!schemaCode) {
        schemaCode = this.$route.query.schemaCode as string;
      }
      if (!schemaCode) {
        schemaCode = this.schemaCode;
      }
      if (isList && this.schemaCode) {
        schemaCode = this.schemaCode;
      }
      if (!schemaCode) {
        return;
      }
      const res = await listApi.getDataItemList({
        schemaCode
      });
      const { errcode, errmsg, data } = res;
      if (errcode === 0) {
        return data
      } else {
        this.$message.error(errmsg as string);
      }
    }

    return this.relevanceDataList;
  }

  render(h: Function) {
    return super.render(h, false);
  }
}
</script>


<style lang="less" scoped>
// /deep/.ant-select-selection__rendered {
//   overflow-x: hidden;
// }
</style>
