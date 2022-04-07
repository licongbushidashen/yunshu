import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import pc from "./components/pc-sheet.vue";
import mobile from './components/mobile-sheet.vue';
// import design from "./components/design.vue";
const info: ComponentInfo = {
  title: "子表",
  type: "sheet",
  icon: "h-icon-all-table-o",
  dataItemType: DataItemType.Sheet,
  formControllerType: FormControlType.Sheet,
  group: "布局控件",
};

export default {
  info,
  schema,
  conduct,
  components: {
    pc,
    mobile
  },
} as ComponentAsset;
