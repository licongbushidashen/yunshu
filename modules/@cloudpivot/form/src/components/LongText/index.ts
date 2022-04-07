/*
 * @Author: panwl
 * @Date: 2020-04-13 15:09:39
 * @LastEditTime: 2020-04-22 14:58:08
 * @LastEditors: Please set LastEditors
 * @Description: 表单重构-长文本
 * @FilePath: /frontend/modules/@cloudpivot/form/src/components/LongText/index.ts
 */
import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "./components/pc-input-textarea/input-textarea.vue";
import mobile from "./components/mobile-input-text.vue";
const info: ComponentInfo = {
  title: "长文本",
  type: "text-multiline",
  icon: "h-icon-all-text-multiline",
  dataItemType: DataItemType.LongText,
  formControllerType: FormControlType.Textarea,
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
