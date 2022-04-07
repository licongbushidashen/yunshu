import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
const info: ComponentInfo = {
  title: "描述说明",
  type: "description",
  icon: "h-icon-all-text-t",
  dataItemType: DataItemType.ShortText,
  formControllerType: FormControlType.Description,
  group: "布局控件",
};

export default {
  info,
  schema,
  conduct,
  components: {
    design,
  },
} as ComponentAsset;
