export default new class ValidateForm {
    validate(value: any, rule: any) {

        if (rule.required) {
            this.isEmpty(value, rule);
            return;
        }; 

        if (rule.validator && typeof rule.validator === 'function') {
            rule.validator(value, rule);
            return;
        };
        
        if (rule.type && this[rule.type] && typeof this[rule.type] === 'function') {
            this[rule.type](value, rule);
        }
    }

    /**
     * 是否是空值
     * @param value 
     * @param rule 
     */
    private isEmpty(value: any, rule: any) {
        if (value === '') {
            rule.isError = true
        } else {
            rule.isError = false
        };
    }


    /**
     * 字符长度
     * @param value 
     * @param rule 
     */
    private length(value: any, rule: any) {
        if (value.length < rule.min || value.length > rule.max) {
            rule.isError = true
        } else {
            rule.isError = false
        };
    }
    
    /**
     * 是否是纯数值
     * @param value 
     * @param rule 
     */
    private isNumber(value: any, rule: any) {
        if (!/^[0-9]*$/.test(value)) {
            rule.isError = true
        } else {
            rule.isError = false
        };
    }

    /**
     * 是否邮箱地址
     * @param value 
     * @param rule 
     */
    private isEmail(value: any, rule: any) {
        if (!/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(value)) {
            rule.isError = true;
        } else {
            rule.isError = false;
        }
    }

    /**
     * 是否是手机号码
     * @param value 
     * @param rule 
     */
    private isPhone(value: any, rule: any) {
        if (!(/^1[3456789]\d{9}$/.test(value))) {
            rule.isError = true;
        } else {
            rule.isError = false;
        }
    }
}()
