import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
const info: ComponentInfo = {
  title: "子表汇总",
  type: "sheetStatistic",
  icon: "h-icon-all-text-t",
  dataItemType: DataItemType.ShortText,
  formControllerType: FormControlType.SheetStatistic,
  group: "",
};

export default {
  info,
  schema,
  conduct,
  components: {
    design,
  },
} as ComponentAsset;
