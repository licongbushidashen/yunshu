/*
 * @Author: your name
 * @Date: 2020-05-07 11:40:42
 * @LastEditTime: 2020-05-07 16:03:27
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \frontend\entries\admin\src\views\app\biz-rule\property-desgner-extend\index.ts
 */
import { register as propReg } from "@h3/ui-designer/property-panel";

import { register } from "@h3/ui-designer";

register.groups.push({
  label: "高级",
  value: "senior"
});

propReg.components = Object.assign(propReg.components, {
  JudgeCondition: () =>
    import("../modal/property-modal-judgement-condition.vue"),
  DataTitle: () => import("./data-title2.vue"),

  TriggerSchemaCode: () => import("./trigger-schema-code.vue"),
  ModelsSelect: () => import("./models-selector.vue"),
  FormSelect: () => import("./form-selector.vue"),
  TargetOjectCode: () => import("./target-oject-code.vue"),
  PropertyModalDataFilters: () =>
    import("../modal/property-modal-data-filters.vue"),
  PropertyModalRecipientSettings: () =>
    import("../modal/property-modal-recipient-settings.vue"),
  BindBizMethod: () => import("../modal/property-modal-bind-biz-method.vue"),
  ExecuteCondition: () =>
    import("../modal/property-modal-execute-condition.vue"),
  TimingTask: () => import("../modal/property-modal-timing-task.vue"),
  PropertyFilterCondition: () =>
    import("../modal/property-modal-filter-condition.vue"),
  PropertyFilterCondition2: () =>
    import("../modal/property-modal-filter-condition2.vue"),
  PropertyFilterCondition3: () =>
    import("../modal/property-modal-filter-condition3.vue"),
  ExistCondition: () => import("../modal/exist-condition.vue"),
  dataAction: () => import("../modal/property-modal-data-action.vue"),
  PropertyValidationCondition: () =>
    import("../modal/property-modal-validation-condition.vue"),
  dataActionWrap: () => import('./data-action-wrap.vue'),
  assignActionWrap: () => import('./assign-action-wrap.vue')
});

// import assets from './assets'

// assets.forEach(asset => register.assets[asset.info.type] = asset);
