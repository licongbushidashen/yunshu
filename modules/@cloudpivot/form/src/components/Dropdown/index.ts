import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from './components/pc-dropdown.vue';
import mobile from './components/mobile-dropdown.vue';
export const info: ComponentInfo = {
  title: "下拉单选框",
  type: "drop-down",
  icon: "h-icon-all-a-Drop-downsingle-o",
  dataItemType: DataItemType.Dropdown,
  formControllerType: FormControlType.Dropdown,
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
