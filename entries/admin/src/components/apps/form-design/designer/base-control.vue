
<script lang='ts'>
import { Vue, Prop, Component } from "vue-property-decorator";
import {getDesignComponentByControlType, formatterComponentType} from '@cloudpivot/form/utils'

import HImage from './image.vue';

import HLabel from './label.vue';


import {
  FormControl,
  FormControlType,
  FormHtmlControl,
} from "../typings";

import controlBill from '../typings/control-bill';

function getLabel(control : FormControl, locale : string) {
  if (!control || !control.options) {
    return "";
  }

  let name = control.options.name;
  const name_i18n = control.options.name_i18n;
  if (name_i18n) {
    // const map = JSON.parse(name_i18n);
    const map = name_i18n;
    if (map[locale]) {
      name = map[locale];
    }
  }

  return name;
}


@Component({
  name: "base-control",
  components: {
    HImage,
    HLabel
  }
})
export default class BaseControl extends Vue{
  // functional: true,
  @Prop()
  control!: FormControl;

  getPlaceholder(type : FormControlType){
    switch(type){
        case FormControlType.Text:
        case FormControlType.Textarea:
        case FormControlType.Number:
                return this.$t('cloudpivot.form.renderer.peleseInput');
        
        case FormControlType.Date:
        case FormControlType.StaffSelector:
        case FormControlType.StaffMultiSelector:
        case FormControlType.DepartmentSelector:
        case FormControlType.DepartmentMultiSelector:
        case FormControlType.StaffDeptMixed:
        case FormControlType.Dropdown:
        case FormControlType.DropdownMulti:
        case FormControlType.Checkbox:
        case FormControlType.Radio:
        case FormControlType.Address:
        case FormControlType.Location:
        case FormControlType.RelevanceForm:
        case FormControlType.RelevanceFormEx:
            return this.$t('cloudpivot.form.renderer.peleseSelect');

    }

    return '';
  }

  render(h: Function, context: any) {
    // const control: FormControl = context.data.attrs.control;
    const control = this.control;

    // const locale = context.parent.$i18n.locale;
    const locale = this.$i18n.locale;
    // const label = getLabel(control,this.$i18n.locale);

    const opts : any = {
      props: {
        disabled: true
      }
    };

    const placeholder = this.getPlaceholder(control.type);
    if(placeholder){
      opts.props.placeholder = placeholder;
    }

    if(control.type === FormControlType.Radio || control.type === FormControlType.Checkbox){
      // const items = ['选项1','选项2','选项3'];
      opts.props.options = control.options.options ? control.options.options.split(';') : [];
      // if(control.parentKey){
      //   opts.props.options.pop();
      // }
    }


    // 使用了字典数据
    if ([5, 6, 7, 19].includes(control.type)) {
      let options = control.options.options
      try {
        let opt: any = JSON.parse(control.options.options)
        if (opt.useDictionariesData){
          options = opt.useDictionariesData.map(el => el.name).join(';')
          control.options.dictionariesData = control.options.options
        }
        if(opt.labels.length > 0) {
          options = opt.labels.map(el => el.data[opt.sheetDataItem]).join(';')
          control.options.labels = control.options.options
        }
      } catch (error) {
        
      }
      control.options.options = options
    }


    const createHtml = (hc:FormHtmlControl) => {
      const attrs : any = {};
      hc.attrs.forEach(a => attrs[a.name] = a.value);
      const domProps = {
        innerHTML : hc.innerHTML
      };
      return h(hc.tagName, {
        attrs,
        domProps
      });
    };

    const createH2 = () => h("h2", `${getLabel(control,locale)}`);

    const createH3 = () => h("h3", `${getLabel(control,locale)}`);

    const createLabel = () => h("h-label", opts);

    const createInput = () => h("a-input", opts);

    const createTextarea = () => h("a-textarea", opts);

    const createDate = () => h("a-date-picker", opts);

    const createNumber = () => h("a-input-number", opts);

    const createRadio = () => h("a-radio-group", opts);

    const createCheckboxGroup = () => h("a-checkbox-group", opts);

    const createCheckbox = () => h("a-checkbox", opts);

    const createDropdown = () => {
      opts.defaultValue = '选项1';
      // return h("a-select", opts,[
      //   h('a-select-option',{
      //     props:{
      //       'value':opts.defaultValue
      //     }
      //   },[opts.defaultValue])
      // ]);
      return h("a-input", opts,[
        h("i", {
          props: {
            type: "user"
          },
          slot: 'suffix',
          'class': [
            'aufontAll',
            'h-icon-all-down-o'
          ]
        })
      ]);
    };

    const createLogic = () => h("a-switch", opts);

    // const createUpload = () =>
    //   h("a-button", opts, [
    //     h("a-icon", {
    //       props: {
    //         type: "upload"
    //       }
    //     }),
    //     " 点击或拖拽附件上传"
    //   ]);

    // const createImage = () =>
    //   h("a-button", opts, [
    //     h("a-icon", {
    //       props: {
    //         type: "upload"
    //       }
    //     }),
    //     " 点击或拖拽图片上传"
    //   ]);
    const createUpload = () =>
      h('h-image', opts);

    const createImage = () =>
      h("h-image", opts);

    const createLocation = () =>
      h("a-input", opts,[
        h("i", {
          props: {
            type: "user"
          },
          slot: 'suffix',
          'class': [
            'aufontAll',
            'h-icon-all-position-o'
          ]
        })
      ]);
    const createAddress = () => {
      let child: any[] = [
        h("a-input",opts,[
          h("i", {
            props: {
              type: "user"
            },
            slot: 'suffix',
            'class': [
              'aufontAll',
              'h-icon-all-down-o'
            ]
          })
        ])
      ];
      const { addressDetail }  = control.options;
      if ( addressDetail === 'true') {
        const _opts = Object.assign(opts);
        _opts.props.placeholder = this.$t('cloudpivot.form.renderer.peleseInput');
        child.push(h("a-textarea",_opts));
      }
     return h("div",{
       class: 'address'
     },child)
    }
    const createStaffSelector = () =>
      h("a-input", opts,[
        h("i", {
          props: {
            type: "user"
          },
          slot: 'suffix',
          'class': [
            'aufontAll',
            'h-icon-all-process-o'
          ]
        })
      ]);
    let designComponent = getDesignComponentByControlType(control.type)
    if(designComponent) {
      return h(formatterComponentType(control.key),{props: {
        control
      }})
    }
    switch (control.type) {
      // case FormControlType.Label:
      // case FormControlType.CreateBy:
      // case FormControlType.CreatedTime:
      // case FormControlType.CreateByParentId:
      // case FormControlType.ModifyBy:
      // case FormControlType.ModifiedTime:
      // case FormControlType.SequenceNo:
      // case FormControlType.SystemOther:
      //   opts.props.text = "系统自动填充";
      //   return createLabel();

      // case FormControlType.SheetStatistic:
      // case FormControlType.Description:
        // opts.props.text = control.options.name;
        // return createLabel();

      // case FormControlType.Text:
      //   return createInput();

      // case FormControlType.ApprovalOpinion:
      // case FormControlType.Textarea:
      // case FormControlType.Signature:
      //   return createTextarea();

      // case FormControlType.Date:
      //   return createDate();

      // case FormControlType.Number:
      //   return createNumber();

      // case FormControlType.Radio:
      //   return createRadio();

      // case FormControlType.Location:
      //   return createLocation();
      // case FormControlType.Address:
      //   return createAddress();
      // case FormControlType.Logic:
      //   return createLogic();

      // case FormControlType.Checkbox:
      //   return createCheckboxGroup();

      // case FormControlType.Dropdown:
      //   return createDropdown();

      // case FormControlType.Attachment:
      //   opts.props.text = '点击或拖拽上传';
      //   return createUpload();

      // case FormControlType.Image:
      //   opts.props.text = '点击或拖拽上传';
      //   return createImage();
      
      // case FormControlType.Title:
      //   return createH2();

      // case FormControlType.Group:
      //   return createH3();
      
      // case FormControlType.OwnerId:
      // case FormControlType.StaffSelector:
      // case FormControlType.StaffMultiSelector:
      // case FormControlType.DepartmentSelector:
      // case FormControlType.DepartmentMultiSelector:
      //   return createStaffSelector();

      case FormControlType.Html:
        return createHtml(control as FormHtmlControl);

      default:
        break;
    }
    return createInput();
  }
  created() {
    // 获取当前组件的 设计时的组件
    let designComponent = getDesignComponentByControlType(this.control.type)
    if(designComponent) {
      const components = this.$options.components
      if (components) {
        components[formatterComponentType(this.control.key)] = designComponent
      }
    }
  }
  beforeUpdate() {
    let designComponent = getDesignComponentByControlType(this.control.type)
    if(designComponent) {
      const components = this.$options.components
      if (components) {
        components[formatterComponentType(this.control.key)] = designComponent
      }
    }
  }
};
</script>

