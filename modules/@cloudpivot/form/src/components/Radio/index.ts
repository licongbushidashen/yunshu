/*
 * @Author: Fan
 * @Date: 2020-04-13 15:11:45
 * @LastEditTime: 2020-04-22 18:22:53
 * @LastEditors: Please set LastEditors
 * @Description: 单选框组件
 * @FilePath: /frontend/modules/@cloudpivot/form/src/components/Radio/index.ts
 */
import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "./components/pc-checkbox-group.vue";
import mobile from "./components/mobile-checkbox-group.vue";
export const info: ComponentInfo = {
  title: "单选框",
  type: "single-selection",
  icon: "h-icon-all-single-selection-o",
  dataItemType: DataItemType.Radio,
  formControllerType: FormControlType.Radio,
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
