<!--
 * @Author: Fan
 * @Date: 2020-04-14 12:06:28
 * @LastEditTime: 2020-04-21 10:19:05
 * @LastEditors: Fan
 * @Description: In User Settings Edit
 * @FilePath: /frontend/modules/@cloudpivot/form/src/components/ShortText/components/design.vue
 -->
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
@Component({name: 'ShortTextDesign'})
export default class ShortTextDesign extends Vue {
  @Prop({default:{}})
  control!:any
  render(h:Function) {
    return h('a-input', {props:{
      disabled: true,
      placeholder: "请输入"
    }})
  }
}
</script>
