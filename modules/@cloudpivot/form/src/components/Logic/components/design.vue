<!--
 * @Author: Fan
 * @Date: 2020-04-19 19:33:49
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
@Component({name: 'Logic'})
export default class Logic extends Vue {
  // @Prop({default:{}})
  // opts!:any
  render(h:Function) {
    return h('a-switch', {props:{
      disabled: true,
    }})
  }
}
</script>