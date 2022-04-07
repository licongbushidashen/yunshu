/*
 * @Author: your name
 * @Date: 2020-04-22 11:08:54
 * @LastEditTime: 2020-04-22 15:26:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\StaffSelector\index.ts
 */
import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "@cloudpivot/form/src/common/components/form-staff-selector/pc/index.vue";
import mobile from "@cloudpivot/form/src/common/components/form-staff-selector/mobile/index.vue";
export const info: ComponentInfo = {
  title: "人员单选",
  type: "staffSelector",
  icon: "h-icon-all-add-user-o",
  dataItemType: DataItemType.StaffSingle,
  formControllerType: FormControlType.StaffSelector,
  group: "基础控件",
};

export default {
  info,
  schema,
  conduct,
  components: {
    design,
    pc,
    mobile
  },
} as ComponentAsset;
