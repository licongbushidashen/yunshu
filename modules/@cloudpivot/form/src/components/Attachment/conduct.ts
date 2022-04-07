import {
  ControllerConduct,
  ControlAttributeType, DataType,
} from "@cloudpivot/form/typings";
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
  formatterValueNoUp,
} from "@cloudpivot/form/utils";
import baseAttribute from "@cloudpivot/form/src/common/component-base-attribute";
import { FormControlType } from "@cloudpivot/form/schema";
import {StaffSelectorValueType} from "../../common/component-schema";

export default {
  groups: {
    base: {
      label: "基础信息",
      keys: ["name", "labelVisible", "visible", "style", "tips", "widgetType"],
    },
    controller: {
      label: "控制属性",
      keys: [
        "limit",
        "batch",
        "fileTypes",
        "displayTemplate",
        "templateFile",
        "dataLinkage"
      ],
    },
    scripts: {
      label: "控件事件",
      keys: ["onUpload", "onDelete"],
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
      inputMethod: ControlAttributeType.Dropdown,
      value: FormControlType.Attachment,
      options: {
        // Todo 将控件编码 换成 说明文字, 创建所有组件的 编码说明文件
        list: [
          {
            value: FormControlType.Attachment,
            label: "附件",
          },
          {
            value: FormControlType.Image,
            label: "图片",
          },
          {
            value: FormControlType.Signature,
            label: "手写签名",
          },
        ],
      },
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: "附件",
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
    dataLinkage: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/data-linkage2.vue"),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    limit: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: "1M",
            label: "1M",
          },
          {
            value: "5M",
            label: "5M",
          },
          {
            value: "10M",
            label: "10M",
          },
          {
            value: "20M",
            label: "20M",
          },
          {
            value: "50M",
            label: "50M",
          },
          {
            value: "100M",
            label: "100M",
          },
          {
            value: "200M",
            label: "200M",
          },
          // {
          //   value: '512M',
          //   label: '512M'
          // },
          // {
          //   value: '1G',
          //   label: '1G'
          // }
        ],
      },
    },
    fileTypes: {
      tip: {
        content:
          "设置附件上传的文件名格式，限定类型为office、图片、压缩包等，示例:.jpg,.gif.<br>以下类型不支持:<br>.php.php5.php4.php3.php2.php1&nbsp;.html.htm.phtml.pHp.pHp5.pHp4.pHp3.pHp2.pHp1&nbsp;.Html.Htm.pHtml.jsp.jspa.jspx.jsw.jsv.jspf.jtml.jSp&nbsp;.jSpx.jSpa.jSw.jSv.jSpf.jHtml.asp.aspx.asa.asax&nbsp;.ascx.ashx.asmx.cer.aSp.aSpx.aSa.aSax.aScx.aShx.aSmx.cEr.sWf.swf",
        icon: "question-circle-o",
      } as any,
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: "长度不能超过200字节",
          },
        },
      },
    },
    displayTemplate: {
      inputMethod: ControlAttributeType.Boolean,
      options: {
        hideField: (value: string) => {
          // console.log(value, 'value');
          if (!value) {
            return ["templateFile"];
          } else {
            return [];
          }
        },
      },
    },
    templateFile: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
          import("@cloudpivot/form/src/common/components/attachment-file.vue"),
      options: {
        formatter: formatterValueNoUp,
      },
    },
    onUpload: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/script-input.vue"),
    },
    onDelete: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import("@cloudpivot/form/src/common/components/script-input.vue"),
    },
  },
} as ControllerConduct;
