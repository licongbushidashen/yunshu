<!--
 * @Author: Fan
 * @Date: 2020-04-14 12:06:28
 * @LastEditTime: 2020-04-20 18:13:40
 * @LastEditors: Fan
 * @Description: In User Settings Edit
 * @FilePath: /frontend/modules/@cloudpivot/form/src/components/ShortText/components/design.vue
 -->
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
@Component({name: 'AddressDesign'})
export default class AddressDesign extends Vue {
  @Prop({default:{}})
  control!:any
  render(h:Function) {
    let opts ={
      props:{
        disabled: true,
        placeholder:"请选择"
      }
    }
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
    const { addressDetail }  = this.control.options;
      if ( addressDetail === 'true') {
        const _opts = Object.assign(opts);
        _opts.props.placeholder = this.$t('cloudpivot.form.renderer.peleseInput');
        child.push(h("a-textarea",_opts));
      }
     return h("div",{
       class: 'address'
     },child)
  }
}
</script>
