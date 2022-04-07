/*
 * @Author: your name
 * @Date: 2020-04-13 15:10:38
 * @LastEditTime: 2020-04-22 16:35:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /frontend/modules/@cloudpivot/form/src/components/Number/index.ts
 */
import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "./components/pc-input-number.vue";
import mobile from "./components/mobile-input-number.vue";
const info: ComponentInfo = {
  title: "数值",
  type: "number",
  icon: "h-icon-all-number",
  dataItemType: DataItemType.Number,
  formControllerType: FormControlType.Number,
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
