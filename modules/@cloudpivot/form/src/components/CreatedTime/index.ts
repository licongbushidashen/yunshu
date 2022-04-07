/*
 * @Author: your name
 * @Date: 2020-04-22 11:08:54
 * @LastEditTime: 2020-04-22 17:07:05
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\CreatedTime\index.ts
 */
import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import { DataItemType, FormControlType } from "@cloudpivot/form/schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "@cloudpivot/form/src/common/components/system-control/pc/index.vue";
import mobile from "@cloudpivot/form/src/common/components/system-control/mobile/index.vue";
const info: ComponentInfo = {
  title: "创建时间",
  type: "createdTime",
  icon: "h-icon-all-clock-circle-o",
  dataItemType: DataItemType.Date,
  formControllerType: FormControlType.CreatedTime,
  group: "系统控件",
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
