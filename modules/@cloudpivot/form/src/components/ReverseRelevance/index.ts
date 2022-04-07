/*
 * @Author: Fan
 * @Date: 2020-04-13 15:08:42
 * @LastEditTime: 2020-04-25 19:37:14
 * @LastEditors: Fan
 * @Description: 短文本组件
 * @FilePath: /frontend/modules/@cloudpivot/form/src/components/ShortText/index.ts
 */
import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "./components/pc-reverse-relevance/reverse-relevance.vue";
import mobile from "./components/mobile-reverse-relevance/reverse-relevance.vue";
export const info: ComponentInfo = {
  title: "关联查询",
  type: "reverse-relevance",
  icon: "h-icon-all-form-related-manycho",
  dataItemType: DataItemType.ShortText,
  formControllerType: FormControlType.ReverseRelevance,
  group: "高级控件",
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
