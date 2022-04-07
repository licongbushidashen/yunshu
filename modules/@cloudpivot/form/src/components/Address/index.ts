/*
 * @Author: Fan
 * @Date: 2020-04-20 17:08:13
 * @description: 地址
 * @LastEditors: Fan
 */
import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "./components/pc-address.vue";
import mobile from "./components/mobile-address.vue";
export const info: ComponentInfo = {
  title: "地址",
  type: "inputAddress",
  icon: "h-icon-all-position-o",
  dataItemType: DataItemType.Address,
  formControllerType: FormControlType.Address,
  group: "",
};
export default {
  info,
  schema,
  conduct,
  components: {
    design,
    pc,
    mobile,
  },
} as ComponentAsset;
