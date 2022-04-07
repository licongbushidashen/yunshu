import { exportModal, importModal } from "./control-attribute-transaction";
import {
  ControlAttributeType,
  DropdownAttributeType,
  ModalAttributeType,
} from "./form-attribute";
import { getChildrenRole2 } from "@/apis/organization";
import store from "@/store/";

/**
 * 下拉配置项
 * @param type 下拉类型
 */
export const dropdownOptions: Function = (type: DropdownAttributeType) => {
  let options = {};
  switch (type) {
    case DropdownAttributeType.Number:
      options = {
        list: [
          {
            value: "none",
            label: "空",
          },
          {
            value: "integer",
            label: "2000",
          },
          {
            value: "tenths",
            label: "2,000.0",
          },
          {
            value: "percentile",
            label: "2,000.00",
          },
          {
            value: "Millimeter",
            label: "2,000.000",
          },
          {
            value: "tenThousand",
            label: "2,000.0000",
          },
          {
            value: "hundredThousand",
            label: "2,000.00000",
          },
          {
            value: "millionDecimals",
            label: "2,000.000000",
          },
          {
            value: "tenMillionDecimals",
            label: "2,000.0000000",
          },
          {
            value: "billionDecimals",
            label: "2,000.00000000",
          },
          {
            value: "ratio",
            label: "20%",
          },
          {
            value: "ratio.tenths",
            label: "20.0%",
          },
          {
            value: "ratio.percentile",
            label: "20.00%",
          },
          {
            value: "ratio.Millimeter",
            label: "20.000%",
          },
          {
            value: "ratio.tenThousand",
            label: "20.0000%",
          },
          {
            value: "ratio.hundredThousand",
            label: "20.00000%",
          },
          {
            value: "ratio.millionDecimals",
            label: "20.000000%",
          },
          {
            value: "ratio.tenMillionDecimals",
            label: "20.0000000%",
          },
          {
            value: "ratio.billionDecimals",
            label: "20.00000000%",
          },
          {
            value: "RMB.percentile",
            label: "￥2,000.00",
          },
          {
            value: "RMB.Millimeter",
            label: "￥2,000.000",
          },
          {
            value: "RMB.tenThousand",
            label: "￥2,000.0000",
          },
          {
            value: "RMB.hundredThousand",
            label: "￥2,000.00000",
          },
          {
            value: "RMB.millionDecimals",
            label: "￥2,000.000000",
          },
          {
            value: "RMB.tenMillionDecimals",
            label: "￥2,000.0000000",
          },
          {
            value: "RMB.billionDecimals",
            label: "￥2,000.00000000",
          },
          {
            value: "dollar.percentile",
            label: "$2,000.00",
          },
          {
            value: "dollar.Millimeter",
            label: "$2,000.000",
          },
          {
            value: "dollar.tenThousand",
            label: "$2,000.0000",
          },
          {
            value: "dollar.hundredThousand",
            label: "$2,000.00000",
          },
          {
            value: "dollar.millionDecimals",
            label: "$2,000.000000",
          },
          {
            value: "dollar.tenMillionDecimals",
            label: "$2,000.0000000",
          },
          {
            value: "dollar.billionDecimals",
            label: "$2,000.00000000",
          },
          {
            value: "euro.percentile",
            label: "€2,000.00",
          },
          {
            value: "euro.Millimeter",
            label: "€2,000.000",
          },
          {
            value: "euro.tenThousand",
            label: "€2,000.0000",
          },
          {
            value: "euro.hundredThousand",
            label: "€2,000.00000",
          },
          {
            value: "euro.millionDecimals",
            label: "€2,000.000000",
          },
          {
            value: "euro.tenMillionDecimals",
            label: "€2,000.0000000",
          },
          {
            value: "euro.billionDecimals",
            label: "€2,000.00000000",
          },
          {
            value: "HK.percentile",
            label: "HK$2,000.00",
          },
          {
            value: "HK.Millimeter",
            label: "HK$2,000.000",
          },
          {
            value: "HK.tenThousand",
            label: "HK$2,000.0000",
          },
          {
            value: "HK.hundredThousand",
            label: "HK$2,000.00000",
          },
          {
            value: "HK.millionDecimals",
            label: "HK$2,000.000000",
          },
          {
            value: "HK.tenMillionDecimals",
            label: "HK$2,000.0000000",
          },
          {
            value: "HK.billionDecimals",
            label: "HK$2,000.00000000",
          },
        ],
      };
      break;
    case DropdownAttributeType.Summary:
      options = {
        list: [
          {
            value: "none",
            label: "空",
          },
          {
            value: "integer",
            label: "2000",
          },
          {
            value: "tenths",
            label: "2,000.0",
          },
          {
            value: "percentile",
            label: "2,000.00",
          },
          {
            value: "ratio",
            label: "20%",
          },
          {
            value: "ratio.tenths",
            label: "20.0%",
          },
          {
            value: "ratio.percentile",
            label: "20.00%",
          },
          {
            value: "RMB.percentile",
            label: "￥2,000.00",
          },
          {
            value: "dollar.percentile",
            label: "$2,000.00",
          },
          {
            value: "euro.percentile",
            label: "€2,000.00",
          },
          {
            value: "HK.percentile",
            label: "HK$2,000.00",
          },
        ],
      };
      break;
    // 1 M、5 M、10 M、20 M、50 M、100 M、200M，默认大小为5M
    case DropdownAttributeType.UploadSize:
      options = {
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
      };
      break;
    case DropdownAttributeType.ControlType:
      options = {
        list: [
          {
            value: 1,
            label: "单行文本",
          },
          {
            value: 5,
            label: "单选框",
          },
          {
            value: 6,
            label: "复选框",
          },
          {
            value: 7,
            label: "下拉框",
          },
          // {
          //   value: '11',
          //   label: '位置'
          // }
        ],
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          const opts = vm.controlAttributeColumns.find((res) => {
            return res.field === "options";
          });
          if (opts) {
            try {
              if (vm.allControls.control.type !== 7) {
                JSON.parse(opts.value);
                vm.allControls.control.options.options = "选项1;选项2;选项3";
              }
            } catch {}
          }
        },
      };
      break;
  }
  return options;
};
/**
 * 弹窗配置项
 * @param type
 */
const modalOptions: Function = (type: ModalAttributeType) => {
  return { type: type, importModal: importModal, exportModal: exportModal };
};

/**
 * 树配置项
 * @param type
 */
const treeOptions: Function = (type: string) => {};
/**
 * 下拉树获取组织函数
 * @param v
 */
const onExpand = (v: any) => {
  const len = v.length;
  if (len === 0) {
    return;
  }
  const key = v[len - 1];
  getChildrenRole2(key).then((res: any) => {
    const nodes = res.data;
    const tree: any = [];
    nodes.forEach((node: any) => {
      tree.push({
        id: node.id,
        name: node.name,
        avatar: node.imgUrl,
        type: typeof node.employees === "undefined" ? "user" : "org",
        hasChild: typeof node.employees !== "undefined" && node.employees > 0,
        orglist: node.name,
        title: node.name,
        isLeaf: node.leaf,
        key: node.id,
        value: node.id,
        sortKey: "0",
        parentId: node.parentId,
      });
    });
    if (tree.length > 0) {
      store.dispatch("Organization/Role/actionTreeOrg", { tree, key });
    }
  });
};
/**
 * 下拉树配置项
 * @param type
 */
const selectTreeOptions: Function = (type: string) => {
  const state: any = store.state;
  !state.Organization.Role.orgTree &&
    store.dispatch("Organization/Role/getOrgRoleNode");
  console.log(state.Organization.Role.orgTree,'state.Organization.Role.orgTree');
  
  return {
    tree: () => {
      return state.Organization.Role.orgTree && state.Organization.Role.orgTree.length > 0
        ? changeTree(state.Organization.Role.orgTree)
        : [];
    },
    onExpand,
  };
};

function changeTree(data: any) {
  const result: any = [];
  data.forEach((node: any) => {
    const tmpTree = Object.assign({}, node);
    tmpTree.disabled = tmpTree.group;
    if (tmpTree.children && tmpTree.children.length > 0) {
      tmpTree.children = changeTree(tmpTree.children);
    }
    result.push(tmpTree);
  });
  return result;
}

export default (type: ControlAttributeType | string, attrType: any) => {
  let options: any = null;
  switch (type) {
    case ControlAttributeType.Boolean:
      break;
    case ControlAttributeType.String:
    case "string":
      break;
    case ControlAttributeType.Dropdown:
      options = dropdownOptions(attrType as DropdownAttributeType);
      break;
    case ControlAttributeType.Modal:
      if (attrType) {
        options = modalOptions(attrType as ModalAttributeType);
      }
      break;
    case ControlAttributeType.Date:
      break;
    case ControlAttributeType.SelectTree:
      options = selectTreeOptions(attrType as ModalAttributeType);
      break;
    case ControlAttributeType.Tree:
      break;
    default:
      break;
  }
  return options;
};
