<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
@Component({name: 'Dropdown'})
export default class Dropdown extends Vue {
  @Prop()
  control!:any // 当前控件的控制器
  render(h:Function) {
      return h("a-input", {props:{
        disabled: true,
        placeholder:"请选择"
      }},[
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
  }
}
</script>