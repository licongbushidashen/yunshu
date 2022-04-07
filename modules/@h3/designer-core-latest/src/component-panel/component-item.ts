
import { Component, Prop, Vue } from "vue-property-decorator";


@Component
export default class ComponentItem extends Vue {
  @Prop({
    default: ''
  })
  title!: string

  @Prop({
    default: ''
  })
  type!: string

  @Prop({
    default: ''
  })
  icon!: string

  @Prop({
    default: ''
  })
  image!: string

  @Prop({
    default: false
  })
  disabled!: boolean

}