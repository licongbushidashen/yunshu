<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
@Component({name: 'SignatureDesign'})
export default class SignatureDesign extends Vue {
  // @Prop({default:{}})
  // opts!:any
  render(h:Function) {
    return h('a-textarea', {props:{
      disabled: true,
      placeholder: "请输入"
    }})
  }
}
</script>