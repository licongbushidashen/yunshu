import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
// import design from "./components/design.vue";
const info: ComponentInfo = {
  title: "标签页",
  type: "tabs",
  icon: "h-icon-all-tab-o",
  dataItemType: DataItemType.ShortText,
  formControllerType: FormControlType.Tabs,
  group: "布局控件",
};

export default {
  info,
  schema,
  conduct,
  components: {
    // design,
  },
} as ComponentAsset;
