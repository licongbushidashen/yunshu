<template>
  <mobile-staff-selector
    v-model="staff"
    :options="staffSelectorOpts"
    @change="onChange"
    title="请选择"
  ></mobile-staff-selector>
</template>

<script lang="ts">
import { Component, Vue, Prop,Watch } from "vue-property-decorator";
import components from "@cloudpivot/form/src/renderer/components/mobile";
import { DefaultUserService } from "@/config/h3-form/user-service";
import { renderer } from "@cloudpivot/form";
import { schema } from '@cloudpivot/form';
renderer.StaffSelectorControl.service = new DefaultUserService();

@Component({
  name: "reportOrg",
  components: {
    MobileStaffSelector: components.StaffSelector
  }
})
export default class ReportOrg extends Vue {
  @Prop({
    default() {
      return [];
    }
  })
  value!: any[];

  @Prop({
    default: () => ({})
  })
  field!: any;

  @Prop({
    default: ""
  })
  formula!: string;
  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
  };

  staff: Array<any> = [];
    // 是否可以多选
  get isMulpitle () {
    return ['In', 'NotIn'].includes(this.formula);
  }

  onChange(fileList) {
    const temp = fileList.map(item => ({ value: item.id, label: item.name, type: item.unitType }));
    this.$emit("input", temp);
  }
  created() {
    // this.value.forEach(item => {
    //   this.staff.push({
    //     id: item.value || item.id,
    //     name: item.label || item.name,
    //     type: item.type || item.unitType
    //   });
    // });
    // this.staffSelectorOpts.mulpitle = this.isMulpitle;
  }

  @Watch("field", {
    immediate: true,
  })
  onFieldChange(val: any) {
    const dataType = val.dataType
    switch (dataType) {
      case schema.DataItemType.StaffSingle:
        this.staffSelectorOpts.selectOrg = false
        this.staffSelectorOpts.selectUser = true;
        if(this.formula ==='In'|| this.formula ==='NotIn'){
          this.staffSelectorOpts.mulpitle = true
        } else{ 
          this.staffSelectorOpts.mulpitle = false
        }
        break;
      case schema.DataItemType.StaffMulti:
        this.staffSelectorOpts.selectUser = true
        this.staffSelectorOpts.mulpitle = true
        this.staffSelectorOpts.selectOrg = false
        break;
      case schema.DataItemType.DeptMulti:
        this.staffSelectorOpts.selectOrg = true
        this.staffSelectorOpts.selectUser = false
        this.staffSelectorOpts.mulpitle = true
        break;        
      case schema.DataItemType.DeptSingle:
        this.staffSelectorOpts.selectOrg = true;
        this.staffSelectorOpts.selectUser = false;
        if(this.formula ==='In'|| this.formula ==='NotIn'){
          this.staffSelectorOpts.mulpitle = true
        } else{ 
          this.staffSelectorOpts.mulpitle = false
        }
        break;          
      case schema.DataItemType.StaffDeptMix:
        this.staffSelectorOpts.selectOrg = true
        this.staffSelectorOpts.selectUser = true
        this.staffSelectorOpts.mulpitle = true
        break;
    }
  }

  @Watch("formula", {
    immediate: true,
  })
  onFormulaChange(formula: string) {
    //注册的选择组件为人员单选或者部门单选时
    if(this.field.dataType === schema.DataItemType.StaffSingle || this.field.dataType === schema.DataItemType.DeptSingle){
      //表达式为等于任意一个或者不等于任意一个
      if(formula ==='In'|| formula ==='NotIn'){
        let mulpitle = true;
        this.staffSelectorOpts = Object.assign({}, this.staffSelectorOpts, {
          mulpitle,
        });
      } else {
        let mulpitle = false;
        this.staffSelectorOpts = Object.assign({}, this.staffSelectorOpts, {
          mulpitle,
        });
      }
    }
    this.staff = [];
  }

  @Watch("value", {
    immediate: true,
  })
  onValueChange() {
    if (Array.isArray(this.value)) {
      this.staff = this.value.map((item) => ({
        id: item.value || item.id,
        name: item.label || item.name,
        type: item.type || item.unitType
      }));
    } else {
      this.staff = [];
    }
  }
}
</script>

<style lang="less">
.h3-org-select{
  z-index:20001;
}
</style>
