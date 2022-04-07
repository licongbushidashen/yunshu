import { Vue, Component, Prop } from 'vue-property-decorator';

import { PropertyDisplaySettings, PropertyInfo } from '../typings';

@Component
export default class PropertyComponent extends Vue {
    
    @Prop({
        default: ''
    })
    propKey!: string

    @Prop({
        default: () => ({})
    })
    propInfo!: PropertyInfo

    @Prop()
    value!: any

    @Prop()
    hidden!: boolean

    @Prop()
    disabled!: boolean

    @Prop()
    required!: boolean

    @Prop()
    settings!: PropertyDisplaySettings

    @Prop()
    formatText!: string

    emitChange(value: any) {
        this.$emit('change', value)
    }

}