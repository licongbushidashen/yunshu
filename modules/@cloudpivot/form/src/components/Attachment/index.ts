/*
 * @Author: panwl
 * @Date: 2020-04-22 11:25:39
 * @LastEditTime: 2020-04-22 19:24:29
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\Attachment\index.ts
 */
import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "./components/pc-upload.vue";
import mobile from "./components/mobile-upload.vue";
export const info: ComponentInfo = {
  title: "附件",
  type: "attachment",
  icon: "h-icon-all-user-o",
  dataItemType: DataItemType.Attachment,
  formControllerType: FormControlType.Attachment,
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
