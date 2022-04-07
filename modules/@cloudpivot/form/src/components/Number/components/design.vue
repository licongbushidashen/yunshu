<!--
 * @Author: Fan
 * @Date: 2020-04-19 20:12:19
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
@Component({name: 'NumberDesign'})
export default class NumberDesign extends Vue {
  // @Prop({default:{}})
  // opts!:any
  render(h:Function) {
    return h('a-input-number', {props:{
      disabled: true,
      placeholder: "请输入"
    }})
  }
}
</script>