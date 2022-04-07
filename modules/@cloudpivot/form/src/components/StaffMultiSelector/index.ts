import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "@cloudpivot/form/src/common/components/form-staff-selector/pc/index.vue";
import mobile from "@cloudpivot/form/src/common/components/form-staff-selector/mobile/index.vue";
export const info: ComponentInfo = {
  title: "人员多选",
  type: "staffMultiSelector",
  icon: "h-icon-all-add-user-group-o",
  dataItemType: DataItemType.StaffMulti,
  formControllerType: FormControlType.StaffMultiSelector,
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
