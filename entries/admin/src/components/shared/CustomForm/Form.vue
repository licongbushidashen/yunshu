<template>
    <div class="custom-form">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Provide } from "vue-property-decorator";
import validateForm from './validate'

@Component({
    name: 'Form'
})
export default class Form extends Vue {
    @Prop() model!: any;
    @Prop() rules!: any;

    // 内联表单
    @Prop({default: false}) inline!: boolean; 

    // 表单名称位置
    @Prop({default: 'left'}) labelPosition!: string;

    // 表单名称宽度
    @Prop({default: '80px'}) labelWidth!: string;

    @Provide('FormProp')
    FormProp: any = {
        rules: this.rules,
        model: this.model,
        inline: this.inline,
        labelPosition: this.labelPosition,
        labelWidth: this.labelWidth
    };

    validate() {
        let isValid: boolean = true;

       for (const [key, value] of Object.entries(this.model)) {
           const rules = this.rules[key];

           if (!rules || !Array.isArray(rules)) return;

           for (const rule of rules) {
               this.$set(rule, 'isError', false);

               validateForm.validate(value, rule);

               if (rule.isError) {
                   isValid = false;
                   break;
               }
           }
       }
       
       return isValid;
    }

}

</script>