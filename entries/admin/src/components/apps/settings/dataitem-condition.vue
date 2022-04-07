
<template>
  <div>
    <div class="condition-wrap" v-if="visible">
      <dataitem-condition
        class="condition-comp"
        ref="dataItemCondition"
        :items="items"
        v-model="conditionValue"
        @change="onConditionValueChange"
      ></dataitem-condition>
    </div>  
  </div>
</template>


<script lang="ts">
import { message } from "@h3/antd-vue";
import { Component, Vue, Prop, Watch, Model } from "vue-property-decorator";

import appsApi from "@/apis/apps";

import permissionApi from "@/apis/system/permission.api";

import DataitemCondition from "@/components/shared/data-item/dataitem-condition.vue";

import { DataItemType, NumberFormatType } from "@cloudpivot/form/schema";

const forbiddenCodes = [
  "id",
  "ownerDeptQueryCode",
  "workflowInstanceId",
  "createdDeptId",
  "ownerDeptId",
  "modifier",
];

@Component({
  name: "dataitem-condition-modal",
  components: {
    DataitemCondition,
  },
})
export default class DataitemConditionModal extends Vue {
  @Prop()
  permission!: BPM.System.AppFunctionPermissionModel;

  visible = false;

  conditionValue = "" as any;

  items = [];

  // 条件变化更新对应的record
  @Watch('conditionValue', {
    immediate: true,
    deep: true
  })
  onConditionValueChange(condition) {
    console.log(condition)

    if(condition) {
      const clearValuePropertyCodeArr: number[] = [
        3, // 日期
        2, // 数值
        0, // 单选框、复选框、主题、出差事由、随行人员
        1,
      ];
    if (this.conditionValue.conditions) {
      this.conditionValue.conditions.forEach((c: any) => {
        c.schemaCode = this.permission.schemaCode;
        c.functionId = this.permission.id;
        if (
          clearValuePropertyCodeArr.includes(c.propertyType) &&
          (c.operatorType === 9 ||
            c.operatorType === 10 ||
            c.operatorType === 11)
        ) {
          c.value = "";
        }
      });

      // 防止业务选人控件有有空值，报错
      let error = this.conditionValue.conditions.filter((item) => {
        return (
          item.propertyType === 5 &&
          item.propertyCode !== "xr" &&
          item.value.length === 0
        );
      });
      if (error.length > 0) {
        // message.error("选人控件的值不能为空！");
        return false;
      }
    }

    this.$emit('updateCondition', this.conditionValue)
    return this.conditionValue

    }
  }


  @Watch("permission", {
    immediate: true,
  })
  onPermissionChange() {
    // 除自定义权限外无需执行逻辑
    if (!this.permission) {
      return;
    }

    const schemaCode = this.permission.schemaCode;
    const functionId = this.permission.id;

    if (schemaCode) {
      const closeLoader = (this.$message as any).loading();
      appsApi
        .getDataItemList({
          schemaCode,
        })
        .then((res) => {
          closeLoader();
          if (res.errcode === 0) {
            this.items = res.data
              .filter((x: any) => {
                if (forbiddenCodes.indexOf(x.code) > -1) {
                  return false;
                }
                // 26迭代需要处理业务选人控件
                // if(!x.defaultProperty && x.propertyType === DataItemType.StaffSingle){
                //   return false;
                // }

                return true;
              })
              .map((x: any) => ({
                code: x.code,
                name: x.name,
                type: x.propertyType,
                isSystem: x.defaultProperty,
              }));
          }
        });

      // permissionApi.listCondition(schemaCode, functionId).then(res => {
      //   if (res.errcode === 0) {
      //     if (res.data && res.data.length) {
      //       this.conditionValue = {
      //         type: this.permission.filterType,
      //         conditions: res.data
      //       };
      //     } else {
      //       this.conditionValue = "";
      //     }
      //   }
      // });
    }
    if (this.permission.conditions.length > 0 && this.permission.dataPermissionType === 4) {
      this.conditionValue = {
        type: this.permission.filterType,
        conditions: this.permission.conditions.slice(0)
      };
      this.show()
    } else {
      this.conditionValue = "";
      if (schemaCode && functionId) {
        permissionApi.listCondition(schemaCode, functionId).then((res) => {
          if (res.errcode === 0) {
            if (res.data && res.data.length) {
              this.conditionValue = {
                type: this.permission.filterType,
                conditions: res.data,
              };
            }
          }
        });
      }
    }

  }


  show() {
    this.visible = true;
  }

  cancel() {
    this.visible = false;
  }
}
</script>

<style lang="less" scoped>
.condition-wrap {
  margin: 15px 0;
  background: #f9f9f9;
  padding: 15px;
  border: 1px solid #d9d9d9;
}

</style>
