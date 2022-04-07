import {nameValidator} from '@/common/utils';
import {DataItemType} from "@cloudpivot/form/schema";

export const rules = {
  name: [
    {
      required: true,
      message: '请填写数据项名称'
    },
    {
      validator: nameValidator,
      message: '请输入不以空格开头长度不超过50个字符'
    }
  ],
  code: [
    {
      required: true,
      message: '请填写数据项编码'
    },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/,
      message: '以字母开头,包括字母或下划线或数字,不超过28个字符'
    }
  ]
}

export const storageOptions = [
  {
    label: '创建索引',
    value: 'propertyIndex',
    disabled: false
  },
  {
    label: '不允许空',
    value: 'propertyEmpty',
    disabled: false
  }
];

export const relationBIzOptions = [
  {
    label: '创建索引',
    value: 'propertyIndex',
    disabled: true
  },
  {
    label: '不允许空',
    value: 'propertyEmpty',
    disabled: false
  }
];

// 数据项类型
export const dataItemTypeList: any[] = [
  {
    name: '单行文本',
    disabled: false,
    index: DataItemType.ShortText
  }, {
    name: '长文本',
    disabled: false,
    index: DataItemType.LongText
  }, {
    name: '数值',
    disabled: false,
    index: DataItemType.Number
  }, {
    name: '日期',
    disabled: false,
    index: DataItemType.Date
  }, {
    name: '逻辑',
    disabled: false,
    index: DataItemType.Logic
  }, {
    name: '人员单选',
    disabled: false,
    index: DataItemType.StaffSingle
  }, {
    name: '人员多选',
    disabled: false,
    index: DataItemType.StaffMulti
  }, {
    name: '附件',
    disabled: false,
    index: DataItemType.Attachment
  },
  {
    name: '关联单选',
    disabled: false,
    index: DataItemType.RelevanceForm
  },
  {
    name: '地址',
    disabled: false,
    index: DataItemType.Address
  },
  {
    name: '关联多选',
    disabled: false,
    index: DataItemType.RelevanceFormEx
  },
  {
    name: '单选框',
    disabled: false,
    index: DataItemType.Radio
  },
  {
    name: '复选框',
    disabled: false,
    index: DataItemType.Checkbox
  }, {
    name: '下拉单选框',
    disabled: false,
    index: DataItemType.Dropdown
  },
  {
    name: '下拉多选框',
    disabled: false,
    index: DataItemType.DropdownMulti
  },
  {
    name: '部门单选',
    disabled: false,
    index: DataItemType.DeptSingle
  },
  {
    name: '部门多选',
    disabled: false,
    index: DataItemType.DeptMulti
  },
  {
    name: '混合选人',
    disabled: false,
    index: DataItemType.StaffDeptMix
  },
]

// 数据项类型
export const dataItemTypeSchema: any[] = [
  // {
  //   name: '审批意见',
  //   index: '7'
  // },
  {
    name: '子表',
    index: DataItemType.Sheet,
    disabled: false,
  }
]

// 子表表格
export const dataItemColumns: any[] = [
  {
    dataIndex: 'id',
    slots: {title: 'idTitle'},
    width: 60,
    align: 'center',
    scopedSlots: {customRender: 'id'}
  },
  {
    required: true,
    dataIndex: 'code',
    slots: {title: 'codeTitle'},
    scopedSlots: {customRender: 'code'},
    width: 120,
    align: 'left'
  },
  {
    required: true,
    dataIndex: 'name',
    slots: {title: 'nameTitle'},
    scopedSlots: {customRender: 'name'},
    width: 120,
    align: 'left'
  },
  {
    required: true,
    dataIndex: 'type',
    slots: {title: 'typeTitle'},
    scopedSlots: {customRender: 'type'},
    width: 120,
    align: 'left'
  },
  {
    dataIndex: 'defaultValue',
    slots: {title: 'defaultValueTitle'},
    scopedSlots: {customRender: 'defaultValue'},
    align: 'left',
    width: 120
  },
  {
    dataIndex: 'displayFiled',
    slots: {title: 'displayFiledTitle'},
    scopedSlots: {customRender: 'displayFiled'},
    align: 'left',
    width: 120
  },
  {
    dataIndex: 'propertyIndex',
    slots: {title: 'propertyIndexTitle'},
    scopedSlots: {customRender: 'propertyIndex'},
    width: 63,
    align: 'center'
  },
  {
    dataIndex: 'propertyEmpty',
    slots: {title: 'propertyEmptyTitle'},
    scopedSlots: {customRender: 'propertyEmpty'},
    width: 90,
    align: 'center'
  },
  {
    dataIndex: 'operation',
    slots: {title: 'operationTitle'},
    // fixed: 'right',
    // width: 60,
    align: 'right',
    scopedSlots: {customRender: 'operation'}
  }
]
