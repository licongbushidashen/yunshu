
<template>
  <div class="report-custom-selector-wrap">
    <a-radio-group v-model="current" @change="currentChange" class="custom-radio">
      <!-- <a-radio :value="1" v-if="componentType === 1 || componentType === 3">
        本人
      </a-radio>
      <a-radio :value="2" v-if="componentType === 2 || componentType === 3">
        本部门
      </a-radio> -->
      <a-radio :value="3"> 自定义 </a-radio>
    </a-radio-group>

    <template v-if="current === 3">
      <div class="customer-pannel">
        <staff-select
          :options="selectOpts"
          :value="selectValue"
          @ok="onSaveSelectedStaff"
          @cancel="onCancel"
          @focus="onFocus"
          @change="onChange"
        ></staff-select>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Model, Prop, Watch, Inject } from "vue-property-decorator";
import { DataItemType } from "@cloudpivot/form/schema";
import rendererComponents from "@cloudpivot/form/src/renderer/components/pc";
import { State, namespace } from "vuex-class";

enum DataType {
  Staff = 1, // 人员
  Department = 2, // 部门
  Mix = 3, // 混合
}

const UserModule = namespace("System/User");

@Component({
  name: "ReportCustomSelector",
  components: {
    // ReportStaffSelect: ReportStaffSelect,
    StaffSelect: rendererComponents.StaffSelector,
  },
})
export default class ReportCustomSelector extends Vue {
  @UserModule.State("loginedUserInfo") userInfo!: any;

  @Prop({
    default: "",
  })
  formula!: string;

  @Prop({})
  field!: any;

  @Model("input", {
    default: () => [],
  })
  value!: any;

  selectValue: any[] = [];

  selectOpts = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    recursive: true,
    showPart: true,
    maxTagCount: 3
  };

  @Inject({default:()=>{}})
  toggleVisible!:Function;

  // 控件分类
  get componentType() {
    const dataType = this.field.dataType;
    switch (dataType) {
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
        return DataType.Staff;
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return DataType.Department;
      case DataItemType.StaffDeptMix:
        return DataType.Mix;
    }
  }

  @Watch("field", {
    immediate: true,
  })
  onFieldChange(val: any) {
    console.log(val)
    const dataType = val.dataType
    switch (dataType) {
      case DataItemType.StaffSingle:
        this.selectOpts.selectOrg = false
        this.selectOpts.selectUser = true;
        if(this.formula ==='In'|| this.formula ==='NotIn'){
          this.selectOpts.mulpitle = true
        } else{ 
          this.selectOpts.mulpitle = false
        }
        break;
      case DataItemType.StaffMulti:
        this.selectOpts.selectOrg = false
        this.selectOpts.selectUser = true
        this.selectOpts.mulpitle = true
        break;
      case DataItemType.DeptMulti:
        this.selectOpts.selectOrg = true
        this.selectOpts.selectUser = false
        this.selectOpts.mulpitle = true
        break;        
      case DataItemType.DeptSingle:
        this.selectOpts.selectOrg = true;
        this.selectOpts.selectUser = false;
        if(this.formula ==='In'|| this.formula ==='NotIn'){
          this.selectOpts.mulpitle = true
        } else{ 
          this.selectOpts.mulpitle = false
        }
        break;          
      case DataItemType.StaffDeptMix:
        this.selectOpts.selectOrg = true
        this.selectOpts.selectUser = true
        this.selectOpts.mulpitle = true
        break;
    }
    this.initViews()
  }


  current: number = 3;

  @Watch("formula", {
    immediate: true,
  })
  onFormulaChange(formula: string) {
    console.log(this.field);
    console.log(this.formula);
    //注册的选择组件为人员单选或者部门单选时
    if(this.field.dataType === DataItemType.StaffSingle || this.field.dataType === DataItemType.DeptSingle){
      //表达式为等于任意一个或者不等于任意一个
      if(formula ==='In'|| formula ==='NotIn'){
        const mulpitle = true;
        this.selectOpts = Object.assign({}, this.selectOpts, {
          mulpitle,
        });
      } else {
        const mulpitle = false;
        this.selectOpts = Object.assign({}, this.selectOpts, {
          mulpitle,
        });
      }
    }
    this.initViews();
  }

  /**
   * 保存选择人与部门
   */
  onSaveSelectedStaff(val:any) {
    this.selectValue = val;
  }

  onFocus(){
    if(this.toggleVisible){
      this.toggleVisible(true);
    }
  }

  onCancel(){
    
  }

  onChange(values: any[]){
    if(this.toggleVisible){
      this.toggleVisible(true);
    }
    const vals = values.map((x) => ({
      label: x.name,
      value: x.id,
      type: x.unitType
    }));
    this.$emit("input", vals);
  }

  @Watch("value", {
    immediate: true,
  })
  onValueChange() {
    if (Array.isArray(this.value)) {
      this.selectValue = this.value.map((x) => ({
        name: x.label,
        id: x.value,
        type: x.type
      }));
    } else {
      this.selectValue = [];
    }
  }

  currentChange(e: any) {
    const val = e.target.value
    let result: any = {}
    switch (val) {
      case 1:
        result = {
          label: this.userInfo.name,
          value: this.userInfo.id,
          type: 3
        };
        this.$emit("input", result)
        break;
      case 2:
        result = {
          label: this.userInfo.departmentName,
          value: this.userInfo.departmentId,
        };
        this.$emit("input", result)
        break;
      case 3:
        // 切换自定义清除value
        this.$emit("input", '')
        break;
    }
  }

  initViews() {
    // 回显本人本部门自定义
    let result:number = 3
    if(this.value && this.value.length === 1) {
      this.value.forEach((item: any) => {
        // if(item.label === this.userInfo.name && item.value === this.userInfo.id){
        //   result = 1
        // }
        // if(item.label === this.userInfo.departmentName && item.value === this.userInfo.departmentId){
        //   result = 2
        // }
      })
    }
    this.current = result
  }

}
</script>

<style lang="less" scoped>
.report-custom-selector-wrap {
  .custom-radio {
    background: #f0f8fe;padding: 3px 5px;
    border-radius: 3px;
    color: rgba(0, 0, 0, 0.65);
  }
  .customer-pannel {
    margin-top: 10px;
  }
}
</style>
