import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from './components/pc-dropdown.vue';
import mobile from './components/mobile-dropdown.vue';
export const info: ComponentInfo = {
  title: "下拉多选框",
  type: "drop-down-multi",
  icon: "h-icon-all-a-Drop-downmultiple-o",
  dataItemType: DataItemType.DropdownMulti,
  formControllerType: FormControlType.DropdownMulti,
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
