import Vue, { VNode } from "vue";
import {
  ControllerConduct,
  ControlAttributeType,
} from "@cloudpivot/form/typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
import { FormControlType } from "@cloudpivot/form/schema";
import {
  StaffSelectorSelectType,
  StaffSelectorValueType,
  DisplayType,
} from "@cloudpivot/form/src/common/component-schema/complex-control-options";
export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "labelVisible", "visible", "style", "tips", "widgetType"],
    },
    controller: {
      label: "控制属性",
      keys: [
        "defaultValue",
        "defaultValueType",
        "readonlyFormula",
        "orgRoot",
        "multi",
        "orgRootValueType",
        "recursive",
        "roles",
        "requiredFormula",
        "dataLinkage",
      ],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
    },
    dataItemName: {
      ...baseAttribute.dataItemName,
    },
    style: {
      ...baseAttribute.style,
    },
    widgetType: {
      ...baseAttribute.widgetType,
      value: "混合控件",
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "混合控件",
    },
    multi: {
      inputMethod: ControlAttributeType.String,
      value: "true",
      options: {
        disabled: true,
        hideField: ['multi'],
      },
    },
    //可选类型
    deptVisible: {
      value: "all",
      label: "全部",
    },
    displayFormula: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "showRule",
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 是否必填
    requiredFormula: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/required-condition.vue"),
      options: {
        formatter: formatterRequiredFormula,
      },
    },
    defaultValueType: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "UserSelectValueSetting",
      inputComponent: () =>
        import(
          "@cloudpivot/form/src/common/components/user-select-value-setting.vue"
        ),
      options: {
        hideField: ["defaultValue"],
        importModal: (attr: any, attrs: any) => {
          const opts: any = {};
          opts.multi = false;
          opts.deptVisible = "all";
          attrs.forEach((attrItem: any) => {
            opts[attrItem.field] = attrItem.value;
          });

          return opts;
        },
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          const val =
            attr.value === StaffSelectorValueType.None
              ? attrs.find((a: any) => a.field === "defaultValue").value
              : null;
          vm.updateAttribute(key, "defaultValue", val);
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: Vue
        ) => {
          const val =
            data.type === StaffSelectorValueType.None ? data.value : null;
          vm.$emit("change", "defaultValue", val);
          return data.type;
        },
        formatter: (valueType: string, attrs: any) => {
          let text = "";

          switch (valueType) {
            case StaffSelectorValueType.None:
              let staff = attrs.find((a: any) => a.field === "defaultValue")
                .value;
              if (staff) {
                if (typeof staff === "string") {
                  staff = JSON.parse(staff);
                }
                text = staff.map((x: any) => x.name).join(";");
              }
              break;
            case StaffSelectorValueType.Originator:
              text = "创建人";
              break;
            case StaffSelectorValueType.OriginatorDept:
              text = "创建人部门";
              break;
          }

          return text;
        },
      },
    },
    orgRootValueType: {
      inputMethod: ControlAttributeType.Modal,
      modalType: "UserSelectOrgValueSetting",
      inputComponent: () =>
        import(
          "@cloudpivot/form/src/common/components/user-select-value-setting.vue"
        ),
      options: {
        hideField: ["orgRoot"],
        importModal: (attr: any, attrs: any) => {
          const opts: any = {};

          attrs.forEach((attrItem: any) => {
            opts[attrItem.field] = attrItem.value;
          });

          return opts;
        },
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          let val = attrs.find((a: any) => a.field === "orgRoot").value;
          vm.updateAttribute(key, "orgRoot", val);
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: Vue
        ) => {
          let val = data.value;
          vm.$emit("change", "orgRoot", val);
          return data.type;
        },
        formatter: (valueType: string, attrs: any, getControls?:Function) => {
          let orgRoot = attrs.find((a: any) => a.field === "orgRoot").value;
          let orgRootObj = attrs.find((a: any) => a.field === "orgRoot")
          let text = "";

          switch (valueType) {
            case StaffSelectorValueType.None:
              if (orgRoot) {
                if (typeof orgRoot === "string") {
                  orgRoot = JSON.parse(orgRoot);
                }
                text = orgRoot.map((x: any) => x.name).join(";");
              }
              break;
            case StaffSelectorValueType.OriginatorDept:
              text = "创建人部门";
              break;
            case StaffSelectorValueType.Ref:
              if (typeof orgRoot === "string") {
                text = orgRoot;
              }
              if(getControls){
                let controls = getControls()
                let key = orgRoot.slice(1, orgRoot.length - 1)
                let control = controls[key]
                if(control){
                  text = control.options.name
                }
              }
              break;
          }

          return text;
        },
      },
    },
    roles: {
      inputMethod: ControlAttributeType.Modal,
      attrType: "rolesModel",
      options: {
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          let val = attrs.find((a: any) => a.field === "roles").value;
          vm.updateAttribute(key, "roles", val);
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: Vue
        ) => {
          let val = data.value;
          vm.$emit("change", "roles", val);
          return data.value;
        },
        formatter: formatterValueToSetStatus,
      },
    },
    mappings: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/user-selection-map2.vue"),
      options: {},
    },
    dataLinkage: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/data-linkage2.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
  },
} as ControllerConduct;
