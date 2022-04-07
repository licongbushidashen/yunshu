<!--
 * @Author: Fan
 * @Date: 2020-04-14 12:06:28
 * @LastEditTime: 2020-04-20 18:11:00
 * @LastEditors: Fan
 * @Description: In User Settings Edit
 * @FilePath: /frontend/modules/@cloudpivot/form/src/components/ShortText/components/design.vue
 -->
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
@Component({name: 'LocationDesign'})
export default class LocationDesign extends Vue {
  // @Prop({default:{}})
  // opts!:any
  render(h:Function) {
    return h('a-input', {props:{
      disabled: true,
      placeholder: "请输入"
    }},[
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
      ])
  }
}
</script>
<style scoped>
.location:before{
  content: '';
}
</style>
