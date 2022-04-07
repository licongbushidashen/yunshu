<template>
  <div class="selector-user" style="min-width: 20px;">
    <div @click="setUser" class="selector">
      <i
        :class="rows.propertyType === DataItemType.DeptMulti || rows.propertyType === DataItemType.DeptSingle  ? 'h-icon-all-department-o': 'h-icon-all-add-user-o'"
        class="icon aufontAll"
      ></i>
    </div>
    <staff-selector
      :options="staffSelectorOpts"
      :params="{sourceType: 'portal' }"
      @cancel="cancel"
      @ok="submitUser"
      v-model="selectorData"
    ></staff-selector>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import StaffSelector from '@cloudpivot/form/src/renderer/components/shared/staff-selector.vue';
  import {DataItemType} from "@cloudpivot/form/schema";

  @Component({
    name: "select-user",
    components: {
      StaffSelector
    }
  })

  export default class SelectUser extends Vue {

    @Prop() value!: any;

    @Prop() row!: any;

    @Prop() sheetKey!: string;

    @Prop({default: false}) batch!: boolean; //批量修改

    @Prop({default: false}) isSheet!: boolean; //是否为子表z

    @Prop() batchStatus!: boolean;

    rows:any = {};

    selectorData: any = [];

    DataItemType: any = DataItemType;

    staffSelectorOpts = {
      selectOrg: true,
      selectUser: true,
      showModel: false,
      mulpitle: true,
      showSelect: false,
      placeholder: '请选择'
    }

    getStaffSelectorOpts(row) {
      const obj = {
        selectOrg: true,
        selectUser: true,
        mulpitle: true,
        showModel: false,
        showSelect: false,
        placeholder: "请选择",
      }
      switch (row.propertyType) {
        case DataItemType.StaffSingle:
          obj.selectOrg = false;
          obj.selectUser = true;
          obj.mulpitle = false;
          break;
        case DataItemType.StaffMulti:
          obj.selectOrg = false;
          obj.selectUser = true;
          obj.mulpitle = true;
          break;
        case DataItemType.DeptSingle:
          obj.selectOrg = true;
          obj.selectUser = false;
          obj.mulpitle = false;
          break;
        case DataItemType.DeptMulti:
          obj.selectOrg = true;
          obj.selectUser = false;
          obj.mulpitle = true;
          break;
      }
      return obj;
    }

    /*
    * 打开选人控件
    */
    setUser(selector: any) {
      if (this.batch) {
        //批量修改时判断是否有选择数据
        let resouce: any = this.value.find((v: any) => v.checked);
        if (!resouce) {
          this.$message.error(this.$t('cloudpivot.list.pc.chooseData') as string);
          return;
        }
        //判断是否选择子表数据
        if (this.isSheet) {
          let sheetArr: Array<any> = [];
          this.value.forEach((v: any) => {
            if (v.checked) {
              sheetArr = sheetArr.concat(v[this.sheetKey])
            }
          })
          let sheetResouce = sheetArr.find((s: any) => s.checked);
          if (!sheetResouce) {
            this.$message.error(this.$t('cloudpivot.list.pc.chooseSheetData') as string);
            return;
          }
        }
      }
      
      let propertyType:any = this.rows.propertyType
      if(!propertyType && this.rows.type && this.rows.type.includes('$$$')){
        propertyType = this.rows.type.split('$$$')[1] * 1
      }

      const obj = {
        selectOrg: true,
        selectUser: true,
        mulpitle: true,
        showModel: true,
        showSelect: false,
        placeholder: "请选择",
      }
      switch (propertyType) {
        case DataItemType.StaffSingle:
          obj.selectOrg = false;
          obj.selectUser = true;
          obj.mulpitle = false;
          break;
        case DataItemType.StaffMulti:
          obj.selectOrg = false;
          obj.selectUser = true;
          obj.mulpitle = true;
          break;
        case DataItemType.DeptSingle:
          obj.selectOrg = true;
          obj.selectUser = false;
          obj.mulpitle = false;
          break;
        case DataItemType.DeptMulti:
          obj.selectOrg = true;
          obj.selectUser = false;
          obj.mulpitle = true;
          break;
      }
      this.staffSelectorOpts = obj;
    }

    /*
    * 选人控件确定事件
    */
    submitUser(val: any) {
      const value = val.map((v: any) => {
        return {
          excelType: v.excelType,
          id: v.id,
          type: v.type,
          name: v.name,
          imgUrl: v.imgUrl,
          departmentId: null,
          departments: null,
          parentId: null,
        }
      });
      if (this.batch) {
        const resouce: any = this.value.forEach((v: any) => {
          if (v.checked) {
            if (this.isSheet) {
              v[this.sheetKey].forEach((s: any) => {
                if (s.checked) {
                  s[this.row.key] = value;
                }
              })
            } else {
              v[this.row.key] = value;
            }
          }
        });
        this.$emit('input', resouce);
      } else {
        this.$emit('input', value);
      }
      this.staffSelectorOpts.showModel = false;
    }

    /*
    * 选人控件取消事件
    */
    cancel() {
      this.staffSelectorOpts.showModel = false;
    }

    @Watch('row', {deep: true, immediate: true})
    handleChangeRow(val) {
      let value = JSON.parse(JSON.stringify(val));
      if (this.batchStatus) {
        let list:any = [];
        value.dataItem.forEach(i => {
          if (i.key === val.data || value.data.includes(i.key)) {
            list.push(i);
          }
        })
        if (list.length > 0) {
          value.propertyType = list[0].propertyType
        }
      }
      this.rows = value;
      this.selectorData = [];
    }

    @Watch('value', {deep: true, immediate: true})
    onUserDataChange(value: any) {
      if (this.batch) {
        this.selectorData = [];
      } else {
        // 必填且返回为空的值，不写入选人控件
        if (value && value[0] && value[0].excelType === 3) {
          this.selectorData = [];
          return;
        }
        this.selectorData = value;
      }

    }
  }
</script>

<style lang="less" scoped>
  .selector-user {
    .selector {
      text-align: right;
      color: @primary-color;
      cursor: pointer;
      
      i {
        font-size: 14px;
        margin-right: 4px;
      }
    }
  }
</style>
