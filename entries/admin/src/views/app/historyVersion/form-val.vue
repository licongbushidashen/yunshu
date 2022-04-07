<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import router from "@/router/";
import store from "@/store/";
import Modal from "@/components/apps/form-design/modals/index.vue";

import Dialog from "@/components/apps/list-design/aside-addDialog.vue";
import sheetFiters from "@/components/apps/list-design/display-filters.vue";

import { listDesignCommonData } from "@/components/apps/list-design/typings";

import moment from "moment";
import { formItemDirective } from "@/directives/form-validate";
import BizModelsSelector from "@/components/global/biz-models-selector/index.vue";
import { i18n } from "../../../config/i18n";
import {
  ControlAttributeType,
  DropdownAttributeType,
  ModalAttributeType,
} from "@/components/apps/form-design/form-property/typings/form-attribute";

import { schema, renderer } from "@cloudpivot/form";

import rendererComponents from "@cloudpivot/form/src/renderer/components/pc";

import DataModelSummary from "@/components/shared/data-item/summary.vue";

import DataItemInput from "@/components/apps/model/data-title-input.vue";
import { DataItemType } from "@cloudpivot/form/schema";

const Selector = rendererComponents.StaffSelector;

let inputNum: number = 0;

@Component({
  name: "form-val",
  components: {
    Modal,
    BizModelsSelector,
    DataModelSummary,
    DataItemInput,
  },
  directives: {
    "form-item-validate": formItemDirective,
  },
})
export default class FormVal extends Vue {
  @Prop() dataItem!: any;
  @Prop() label!: string;
  @Prop() dom!: string;
  @Prop() field!: string;
  @Prop() type!: ControlAttributeType;
  @Prop() attrType!: ModalAttributeType;
  @Prop() value!: string;
  @Prop({ default: () => ({}) }) options!: any;
  @Prop() attributes!: any;
  @Prop() assistAttribute!: any;
  @Prop() formData!: any;
  @Prop() attributeItem!: any;
  @Prop() control?: any;
  modal: any;
  valueText = this.value;

  refControlKey = "";

  @Inject()
  getFormControls!: () => { [key: string]: schema.FormControl };

  @Inject()
  getControl!: () => schema.FormTabs;

  @Watch("attributes", {
    immediate: true,
  })
  watchOptions() {
    this.valueText = this.value;
    if (this.options && this.options.dataList && !!this.value) {
      if (this.options.dataList instanceof Function) {
        this.options
          .dataList(
            this.attributes.find((a: any) => a.field === this.field),
            this.attributes,
            this
          )
          .then((data: any) => {
            this.$emit("callback", this.field, (key: string, attr: any) => {
              attr.options = Object.assign({}, attr.options, { list: data });
            });
          });
      }
    }
  }

  /**
   * 文本类型的render
   * @param h
   */
  stringRender(h: any): any {
    const self = this;
    const inputGuid = `ozInput-${(inputNum += 1)}`;
    const inputOptions: any = {
      directives: [],
      class: {
        "input-box": this.dom !== "a-textarea",
        "textarea-box": this.dom === "a-textarea",
      },
      props: {
        value: this.valueText,
        autosize: this.dom === "a-textarea" ? { minRows: 1, maxRows: 12 } : "",
      },
      ref: inputGuid,
      on: {
        input: async (e: any) => {
          this.valueText = e.target.value;
          const formItemValidate = e.target._formItemValidate;
          const submit: Function = () => {
            self.$emit("change", self.field, e.target.value);
            if (self.options.callback instanceof Function) {
              self.$emit("callback", self.field, self.options.callback);
            }
          };
          if (formItemValidate) {
            this.$nextTick(() => {
              formItemValidate
                .validatedStatus()
                .then((validatedStatus: boolean) => {
                  if (validatedStatus) {
                    submit();
                  }
                });
            });
          } else {
            submit();
          }
        },
        blur: async (e: any) => {
          this.valueText = e.target.value;
          const formItemValidate = e.target._formItemValidate;
          const submit: Function = () => {
            self.$emit("blur", self.field, e.target.value);
            // if (self.options.callback instanceof Function) {
            //   self.$emit("callback", self.field, self.options.callback);
            // }
          };
          if (formItemValidate) {
            this.$nextTick(() => {
              formItemValidate
                .validatedStatus()
                .then((validatedStatus: boolean) => {
                  if (validatedStatus) {
                    submit();
                  }
                });
            });
          } else {
            submit();
          }
        },
      },
    };
    if (this.options.regexps) {
      inputOptions.directives.push({
        name: "form-item-validate",
        value: Object.assign(
          {
            key: inputGuid,
            value: this.valueText,
          },
          this.options.regexps
        ),
      });
    }

    if (this.dom === "a-textarea") {
      return h("a-textarea", inputOptions);
    }

    return h("a-input", inputOptions);
  }

  get getDropdownData() {
    if (this.options.formatter) {
      return this.options.formatter(this.attributes);
    }
    if (this.options.getValue) {
      return this.options.getValue(this.value, this.attributes, this.assistAttribute);
    }
    if (
      (this.field === "showField" || this.field === "sheetFiters") &&
      ((this.value && this.value.length <= 0) || !this.value)
    ) {
      return [];
    }
    // return this.value ? this.value.toString().split(",") : "";
    return this.value;
  }
  /**
   * 下拉框类型render
   * @param h
   */
  dropdownRender(h: any): any {
    const self = this;

    if ((this.attrType as any) === DropdownAttributeType.Summary) {
      return h("data-item-input", {attrs: {
        isReadonly: true
      }});
    }
    const props: any = {
      options: self.options.list,
      disabled: self.options.selectorDisabled,
      value: self.getDropdownData,
      allowClear: self.options.allowClear,
      // notFoundContent: "加载中...",

      getPopupContainer: (triggerNode: HTMLElement) => triggerNode.parentNode,
    };
    if (self.options && self.options.mode) {
      props.mode = self.options.mode as any;
    }
    return self.buildDropdown(h, { props });
  }
  /**
   * Boolean类型render
   * @param h
   */
  booleanRender(h: any): any {
    const self = this;
    const list =
      self.options && self.options.list
        ? self.options.list
        : [
            {
              value: "false",
              label: "false",
            },
            {
              value: "true",
              label: "true",
            },
          ];
    return self.buildDropdown(h, {
      props: {
        options: list,
        value: self.value.toString(),
      },
      on: {
        change: (values: any) => {
          self.$emit("change", self.field, values === "true");
          if (self.options.callback instanceof Function) {
            self.$emit("callback", self.field, self.options.callback);
          }
        },
      },
    });
  }
  /**
   * 构建下拉类型
   * @param h
   * @param options
   */
  buildDropdown(h: any, options: any) {
    const self = this;
    const dropdownGuid = `ozDropdown-${(inputNum += 1)}`;
    options = Object.assign(
      {
        class: {
          "input-select": true,
        },
        ref: dropdownGuid,
        on: {
          // blur: () => {
          //   if (self.options.dataList instanceof Function) {
          //     self.$emit("callback", self.field, (key: string, attr: any) => {
          //       attr.options = Object.assign({}, attr.options, { list: [] });
          //     });
          //   }
          // },
          focus: () => {
            if (self.options && self.options.dataList) {
              if (self.options.dataList instanceof Function) {
                self.options
                  .dataList(
                    self.attributes.find((a: any) => a.field === self.field),
                    self.attributes,
                    self
                  )
                  .then((data: any) => {
                    self.$emit(
                      "callback",
                      self.field,
                      (key: string, attr: any) => {
                        attr.options = Object.assign({}, attr.options, {
                          list: data,
                        });
                      }
                    );
                  });
              }
            }
          },
          change: (values: any) => {
            if (self.options.dataList instanceof Function) {
              self.$emit("callback", self.field, (key: string, attr: any) => {
                attr.options = Object.assign({}, attr.options, { list: [] });
              });
            }
            (self.$refs[dropdownGuid] as HTMLElement).blur();
            self.$emit(
              "change",
              self.field,
              values instanceof Array ? values.join(",") : values
            );
            if (self.options.callback instanceof Function) {
              self.$emit("callback", self.field, self.options.callback);
            }
          },
        },
      },
      options
    );
    return h("a-select", options);
  }

  /**
   * 日期类型render
   * @param h
   */
  dateRender(h: any): any {
    const self = this;
    const timer = Date.parse(self.value);
    const date: any = !isNaN(timer)
      ? moment(new Date(timer), self.options.dateFormat)
      : null;
    return h("a-date-picker", {
      class: {
        date: true,
      },
      props: {
        value: date,
        defaultValue: date,
        format: self.options.dateFormat,
        showTime: self.options.showTime,
      },
      on: {
        change: (dateArg: any, dateString: string) => {
          self.$emit("change", self.field, dateString);
          if (self.options.callback instanceof Function) {
            self.$emit("callback", self.field, self.options.callback);
          }
        },
      },
    });
  }

  /**
   * 弹窗render
   * @param h
   */
  modalRender(h: any): any {
    const self = this;
    return h(
      "div",
      {
        class: {
          "input-modal": true,
        },
        on: {
          click: () => {
            // self.createModal(self);
          },
        },
      },
      [
        h("span", {
          class: {
            txt: true,
          },
          domProps: {
            innerText: self.options.formatter
              ? self.options.formatter(self.value, self.attributes)
              : self.value,
          },
        }),
        h("i", {
          class: {
            "aufontAll h-icon-all-ellipsis-o": true,
          },
        }),
      ]
    );
  }

  selectAllRender(h) {
    const self = this;
    return h(Dialog, {
      class: {},
      props: {
        propDataList: self.options.list ? self.options.list : [],
        fieldBlock: 100,
        status: true,
        value: self.getDropdownData,
      },
      on: {
        addcomfirm: (icon, value: any) => {
          const val: any = [];
          value.forEach((i) => {
            if (i.checked) {
              val.push(i.code);
            }
            if (i.propertyType === DataItemType.Sheet && i.subSchema && i.subSchema.properties) {
              i.subSchema.properties.forEach((v) => {
                if (v.checked) {
                  val.push(`${i.code}.${v.code}`);
                }
              });
            }
          });
          // self.$emit("change", self.field, val);
        },
      },
    });
  }

  sheetFiters(h) {
    const self = this;
    return h(sheetFiters, {
      class: {},
      props: {
        propDataList: self.options.list ? self.options.list : [],
        fieldBlock: 100,
        status: true,
        value: self.getDropdownData,
      },
      on: {
        addcomfirm: (icon, value: any) => {
          // self.$emit("change", self.field, value);
        },
      },
    });
  }

  selectTreeRender(h: any): any {
    const self = this;

    return h("a-tree-select", {
      class: {
        date: true,
      },
      props: {
        treeData: self.options.tree(),
        value: self.value && self.value !== "" ? JSON.parse(self.value) : null,
        allowClear: true,
        labelInValue: true,
      },
      on: {
        treeExpand: self.options.onExpand,
        change: (value: any) => {
          // self.$emit("change", self.field, JSON.stringify(value) || "");
          // if (self.options.callback instanceof Function) {
          //   self.$emit("callback", self.field, self.options.callback);
          // }
        },
      },
    });
  }

  treeRender(h: any): any {
    const self = this;
    if (self.field === "schemaCode") {
      let appPackageCode = "";
      let appFunctionCode = "";
      let appCodeAttr: any;
      let funCodeAttr: any;
      const currentCode = this.$route.params.appCode;

      if (self.dataItem) {
        appPackageCode = self.dataItem.appPackageCode;
        appFunctionCode = self.dataItem.appFunctionCode;
      } else {
        appCodeAttr = self.attributes.find(
          (a: any) => a.field === "appPackageCode"
        );
        if (appCodeAttr) {
          appPackageCode = appCodeAttr.value;
        }

        funCodeAttr = self.attributes.find(
          (a: any) => a.field === "appFunctionCode"
        );
        if (funCodeAttr) {
          appFunctionCode = funCodeAttr.value;
        }
      }

      const setAppCode = (val: string) => {
        if (self.dataItem) {
          self.dataItem.appPackageCode = val;
        }
        // else {
        //   appCodeAttr.value = val;
        // }
      };

      const setFunCode = (val: string) => {
        if (self.dataItem) {
          self.dataItem.appFunctionCode = val;
        }
        // else {
        //   funCodeAttr.value = val;
        // }
      };
      return h("biz-models-selector", {
        props: {
          value: self.value,
          appCode: appPackageCode,
          folderId: appFunctionCode,
          disabled: self.options.disabled,
          currentCode: currentCode,
          appManagerFilter: true,
        },
        on: {
          // change: (value: any) => {
          //   self.$emit('change', self.field, value || '');
          //   if (self.options.callback instanceof Function) {
          //     self.$emit('callback', self.field, self.options.callback);
          //   }
          // },
          select: (value: string[]) => {
            let schemaCode = "";
            if (value.length > 0) {
              schemaCode = value[value.length - 1];
              if (value.length > 1) {
                setAppCode(value[0]);
              }
              if (value.length > 2) {
                setFunCode(value[1]);
              } else {
                setFunCode("");
              }
            } else {
              setAppCode("");
              setFunCode("");
            }

            if (self.dataItem) {
              self.$emit("change", self.field, schemaCode);
            } else {
              self.$emit("change", self.field, value);
            }
            if (self.options.callback instanceof Function) {
              self.$emit("callback", self.field, self.options.callback);
            }
          },
        },
      });
    }
  }

  UserpickerRender(h: any): any {
    const self = this;
    return h(Selector, {
      props: {
        value: this.value !== "" ? JSON.parse(this.value) : [],
        options: this.options.pickerOptions,
      },
      on: {
        change(list: any) {
          const pickerList = list.map((item: any) => ({
            id: item.id,
            unitType: item.unitType,
            name: item.name,
          }));
          self.$emit(
            "change",
            self.field,
            pickerList.length ? JSON.stringify(pickerList) : ""
          );
          if (self.options.callback instanceof Function) {
            self.$emit("callback", self.field, self.options.callback);
          }
        },
      },
    });
  }

  render(h: any) {
    let render: any = null;
    if (this.options && this.options.disabled && this.field !== "schemaCode") {
      render = h("span", {
        class: {
          "attr-val-disabled": true,
        },
        domProps: {
          title: this.value,
          innerText: this.value,
        },
      });
    } else {
      // console.log(this.label,this.options, this.type)
      let _type = this.options.inputMethod || this.type;
      switch (_type as any) {
        case ControlAttributeType.String:
        case "string":
        case "number":
        case "integer":
          render = this.stringRender(h);
          break;
        case ControlAttributeType.Dropdown:
          render = this.dropdownRender(h);
          break;
        case ControlAttributeType.Boolean:
        case "boolean":
          render = this.booleanRender(h);
          break;
        case ControlAttributeType.Date:
          render = this.dateRender(h);
          break;
        case ControlAttributeType.Modal:
          render = this.modalRender(h);
          break;
        case ControlAttributeType.SelectTree:
          render = this.selectTreeRender(h);
          break;
        case ControlAttributeType.Userpicker:
          render = this.UserpickerRender(h);
          break;
        case ControlAttributeType.Tree:
          render = this.treeRender(h);
          break;
        case "array":
          if (this.field === 'sheetFiters') {
            // 子表筛选条件
            render = this.sheetFiters(h);
          } else {
            // 弹出框字段
            render = this.selectAllRender(h);
          }
          
          break;
        default:
          render = h("span", {
            class: {
              "attr-val-text": true,
            },
            domProps: {
              title: this.value,
              innerText: this.value,
            },
          });
          break;
      }
    }
    return render;
  }
  created() {
  }
}
</script>
