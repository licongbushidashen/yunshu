<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import router from "@/router/";
import store from "@/store/";
import Modal from "@/components/apps/form-design/modals/index.vue";

import Dialog from "@/components/apps/list-design/aside-addDialog.vue";
import sheetFiters from "@/components/apps/list-design/display-filters.vue";

// import Selector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";

import { listDesignCommonData } from "@/components/apps/list-design/typings";

import moment from "moment";
import { formItemDirective } from "@/directives/form-validate";
import BizModelsSelector from "@/components/global/biz-models-selector/index.vue";
import { i18n } from "../../../../config/i18n";
import {
  ControlAttributeType,
  DropdownAttributeType,
  ModalAttributeType,
} from "./typings/form-attribute";

import { schema, renderer } from "@cloudpivot/form";

import rendererComponents from "@cloudpivot/form/src/renderer/components/pc";

import DataModelSummary from "@/components/shared/data-item/summary.vue";

import DataItemInput from "@/components/apps/model/data-title-input.vue";
import { DataItemType } from "@cloudpivot/form/schema";

const Selector = rendererComponents.StaffSelector;

let inputNum: number = 0;

@Component({
  name: "form-attribute-value",
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
export default class FormControlAttribute extends Vue {
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
  getControls!: Function;


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
    let valueText = this.valueText

    if(self.field === "regexpText"){
      try {
        let regexpText = JSON.parse(valueText)
        valueText = regexpText[localStorage.getItem('locale') || 'zh']
      } catch (error) {

      }
    }

    const inputOptions: any = {
      directives: [],
      class: {
        "input-box": this.dom !== "a-textarea",
        "textarea-box": this.dom === "a-textarea",
      },
      props: {
        value: valueText,
        autosize: this.dom === "a-textarea" ? { minRows: 1, maxRows: 12 } : "",
      },
      ref: inputGuid,
      on: {
        input: async (e: any) => {
          let textValue:any = e.target.value;
          if(this.options.regexps&&this.options.regexps.maxLength){
            let maxChars:any = this.options.regexps.maxLength.len;
            if (textValue.length > maxChars){
              textValue = e.target.value.substring(0, maxChars);
            }
          }

          if(self.field === "regexpText"){
            try {
              let Text = this.valueText
              let regexpText = JSON.parse(Text)
              regexpText[localStorage.getItem('locale') || 'zh'] = textValue
              textValue = JSON.stringify(regexpText)
            } catch (error) {

            }
          }

          this.valueText = textValue;
          const formItemValidate = e.target._formItemValidate;
          const submit: Function = () => {
            self.$emit("change", self.field, textValue);
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
          this.valueText = e.target.value.replace(/(^\s*)/g, ""); // 去除开头空格

          if(self.field === "defaultValue"){ // 默认值
            // this.valueText = this.valueText.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5\{\}\[\]\【\】]/g, '') // 限定可输入范围
            this.valueText = unescape(escape(this.valueText).replace(/\%uD.{3}/g, '')) //只过滤表情，对其他符号不做处理
            self.$emit("change", self.field, this.valueText);
          }

          if(self.field === "maxLength" && this.valueText === '0'){ // 文本最大长度
            this.valueText = '1'
            self.$emit("change", self.field, this.valueText);
          }



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
    console.log('inputOptions===>', inputOptions)
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
      return h("data-item-input");
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
            // 关联查询区分关联单选和关联多选
            let currentItem: any = null;
            let reverseRelevantType: string = "9";
            if (Array.isArray(self.options.list)) {
              currentItem = self.options.list.find(x => x.value === values);
            }
            if (currentItem) {
              reverseRelevantType = String(currentItem.type);
            }
            if (self.options.dataList instanceof Function) {
              self.$emit("callback", self.field, (key: string, attr: any) => {
                attr.options = Object.assign({}, attr.options, { list: [] });
              }, reverseRelevantType);
            }

            (self.$refs[dropdownGuid] as HTMLElement).blur();
            self.$emit(
              "change",
              self.field,
              values instanceof Array ? values.join(",") : values,
              reverseRelevantType
            );
            if (self.options.callback instanceof Function) {
              self.$emit("callback", self.field, self.options.callback, reverseRelevantType);
            }
          },
        },
      },
      options
    );
    options.props.placeholder = '请选择'
    if(options.props.value === ''){
      options.props.value = undefined
    }
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
    const self:any = this;
    let flag:boolean = true
    if(self.field === 'format1') {
      flag = this.handleHistoryFormate()
    }

    let klass: boolean = false
    if(self.field === 'format1') {
      const control = self.getControl()
      const syncFlag = control.options.syncFormate
      if(syncFlag && flag) {
        klass = true
      }
    }

    const subDom = [
        h("span", {
          class: {
            txt: true,
            klass: klass,
          },
          domProps: {
            innerText: self.options.formatter
              ? self.options.formatter(self.value, self.attributes, self.assistAttribute, self.getControl(), flag, self.getControls())
              : self.value,
            title: self.options.formatter
              ? self.options.formatter(self.value, self.attributes, self.assistAttribute, self.getControl(), flag, self.getControls())
              : self.value,
          },

        }),
        h("i", {
          class: {
            "aufontAll h-icon-all-ellipsis-o": true,
          },
        }),
    ]

    if(self.options.modalField === 'templateFile') {
      return h(
        "div",
        {
          class: {
            "input-modal": true,
          },
          on: {
            click: () => {
              self.createModal();
            },
          }
        },
        [
          h("span", {
            class: {
              txt: true,
            },
            domProps: {
            //   innerText: self.options.formatter
            //     ? self.options.modalField === 'templateFile' ? self.value ? '查看模板' : '上传模板' : self.options.formatter(self.value, self.attributes)
            //     : self.options.modalField === 'templateFile' ? self.value ? '查看模板' : '上传模板' : self.value,
              title: self.options.modalField === 'defaultValue' ? self.options.formatter(self.value, self.attributes) : ''
            }

          },
          self.options.modalField === 'templateFile' ? [
            h("span", {
              class: {
                templateFileUpkoad: self.options.modalField === 'templateFile' && !self.value
              }
            },
            [h("i", {
              class: {
                "icon aufontAll h-icon-all-upload-o": !self.value,
              },
            }),
            h("span", {
              class: {
              templateFile: self.options.modalField === 'templateFile' && self.value
            },
            domProps: {
              innerText: self.value ? '查看模板' : '上传模板'
            },
            })]),
          ] : self.options.formatter ? self.options.formatter(self.value, self.attributes): self.value,
          ),
          h("i", {
            class: {
              "aufontAll h-icon-all-ellipsis-o": true,
            },
          }),
        ]
      );
    }else {
      return h(
        "div",
        {
          class: {
            "input-modal": true,
          },
          on: {
            click: () => {
              self.createModal();
            },
          }
        },
        subDom
      );
    }

  }

  // 历史显示格式默认格式兼容处理
  handleHistoryFormate() {
    const self = this
      console.log(self)
      console.log('con', this.getFormControls())
      // 读大JSON处理历史数据
      console.log('大json', this.formData)
      const selfCode: any = self.dataItem.code
      const draft:any = this.formData.draftAttributesJson
      const push:any = this.formData.publishedAttributesJson
      if(push) {
        try {
          const pushJSON: any = JSON.parse(push)
          const target = pushJSON[selfCode]
          if(target.options.format1 && target.options.format !== target.options.format1 && !('syncFormate' in target.options)) {
            // self.$emit("change", 'syncFormate', false);
            return false
          }
        } catch (error) {
        }
      } else if(draft) {
        try {
          const draftJSON: any = JSON.parse(draft)
          const target = draftJSON[selfCode]
          if(target.options.format1 && target.options.format !== target.options.format1 && !('syncFormate' in target.options)) {
            // self.$emit("change", 'syncFormate', false);
            return false
          }
        } catch (error) {
        }
      }
      return true
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
          self.$emit("change", self.field, val);
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
          self.$emit("change", self.field, value);
        },
      },
    });
  }

  createModal() {
    const self = this;
    let component: any;
    let attrType = self.options.attrType || self.attrType || "";
    let readonlyFormula: any = null;
    if (Array.isArray(self.assistAttribute)) {
      readonlyFormula = self.assistAttribute.find((a: any) => a.field === "readonlyFormula");
    }
    console.log(self, 'self')
    const Instance = new Vue({
      store,
      router,
      i18n,
      render(create: any) {
        return create(Modal, {
          props: {
            getFormControls: self.getFormControls,
            getControl: self.getControl,
            dataItem: self.dataItem,
            modalOptions: self.options,
            isShowRequired: (readonlyFormula && readonlyFormula.value && self.attributeItem.field === "requiredFormula") || (self.dataItem && self.dataItem.propertyEmpty && self.attributeItem.field === "requiredFormula"),
            modalData: {
              label: self.label,
              type: attrType,
              attributes: self.attributes,
              items: self.formData
                ? JSON.parse(self.formData.publishedAttributesJson)
                : [],
              data: self.options.importModal(
                {
                  attrType: attrType,
                  value: self.control && self.control.options && self.control.options.dictionariesData || self.control && self.control.options && self.control.options.labels || self.value,
                  options: self.options
                },
                self.attributes,
                self.assistAttribute
              ),
            },
          },
          on: {
            confirm: (value: any) => {
              if(self.field === 'options' && self.label === '选项' && value.value.indexOf('useDictionariesData') === -1 && self.control && self.control.options && self.control.options.dictionariesData){
                self.control.options.dictionariesData = ''
              }
              self.$emit(
                "change",
                self.field,
                self.options.exportModal(
                  value,
                  { attrType: attrType, value: self.value },
                  self.attributes,
                  (field: string, val: any) => {
                    self.$emit("change", field, val);
                  },
                  self
                )
              );

              // 修改同步开关状态
              if (self.field === 'format1') {
                self.$emit("change", 'syncFormate', value.syncFlag);
              }

              if (self.options.callback instanceof Function) {
                self.$emit("callback", self.field, self.options.callback);
              }
              Instance.$destroy();
              document.body.removeChild(component.$el);
            },
            cancel: () => {
              Instance.$destroy();
              document.body.removeChild(component.$el);
            }
          },
        });
      },
    });
    component = Instance.$mount();
    document.body.appendChild(component.$el);
    self.modal = Instance.$children[0] as any;
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
          self.$emit("change", self.field, JSON.stringify(value) || "");
          if (self.options.callback instanceof Function) {
            self.$emit("callback", self.field, self.options.callback);
          }
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
          organization: true
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

            if (self.dataItem || self.field === "schemaCode") {
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
    // console.log('this.options =>', this.options)
    // console.log('this.dataItem =>', this.dataItem)
    // console.log('this.attributeItem =>', this.attributeItem)
  }
}
</script>
<style lang='less' scoped>
.templateFile {
  color: #17BC94;
}
.templateFileUpkoad {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px 0;
  box-sizing: border-box;
  height: 30px;
  width: 100px;
}
</style>
