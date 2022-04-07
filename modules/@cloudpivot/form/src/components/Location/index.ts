/*
 * @Author: Fan
 * @Date: 2020-04-20 17:08:00
 * @description: 地图定位 组件
 * @LastEditors: Fan
 */
import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "./components/pc-location.vue";
import mobile from "./components/mobile-location.vue";
export const info: ComponentInfo = {
  title: "地址",
  type: "inputLocation",
  icon: "h-icon-all-position-o",
  dataItemType: DataItemType.Address,
  formControllerType: FormControlType.Location,
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
