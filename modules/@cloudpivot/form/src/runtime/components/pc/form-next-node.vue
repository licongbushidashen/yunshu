<template>
  <div class="form-submit">
    <span :key="v" v-for="(i,v) in list">
      <div class="field">
      <a-row>
        <a-col :span="6">{{$t('cloudpivot.form.runtime.modal.nextNodeName')}}</a-col>
        <a-col :span="18">
          <a-tag>{{i.activityName}}</a-tag>
        </a-col>
      </a-row>
    </div>
    <div class="field">
      <a-row>
        <a-col :span="6">{{$t('cloudpivot.form.runtime.modal.participantChoose')}}</a-col>
        <a-col :span="18">
          <template v-if="nextNodeParticipant === 'PARTICIPANT'">
            <a-select :mode="i.participantType === 'SINGLE_PARTICIPANT' ? '': 'multiple'"
                      :placeholder="$t('cloudpivot.form.runtime.modal.pleaseChoose')"
                      style="width:100%" v-model="i.participantList">
              <a-select-option
                :key="item.id"
                :value="item.id"
                v-for="item in i.participants"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </template>
          <template v-else-if="nextNodeParticipant === 'ORGANIZATION'">
           <staff-selector :options="staffSelectorOpts(i.participantType === 'SINGLE_PARTICIPANT')"
                           v-model="i.participantList"></staff-selector>
          </template>
        </a-col>
      </a-row>
    </div>
    </span>
  </div>
</template>


<script lang="ts">

  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import {Checkbox, Col, Icon, Radio, Row, Select, Tag} from '@h3/antd-vue';

  import {FormActionComponent, FormActionModalOptions} from '../../form-action-modal';
  import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";

  @Component({
    name: 'FormNextNode',
    components: {
      ARadio: Radio,
      ARadioGroup: Radio.Group,
      ATag: Tag,
      ACheckbox: Checkbox,
      ACheckboxGroup: Checkbox.Group,
      ASelect: Select,
      ASelectOption: Select.Option,
      AIcon: Icon,
      ARow: Row,
      ACol: Col,
      StaffSelector
    }
  })
  export default class FormNextNode extends Vue implements FormActionComponent {

    list: any = [];
    // ORGANIZATION，PARTICIPANT
    nextNodeParticipant: string = 'PARTICIPANT';

    deptId: any = '';

    staffSelectorOpts(mulpitle: any) {
      return {
        selectOrg: false,
        selectUser: true,
        showModel: true,
        mulpitle: !mulpitle,
        showSelect: true,
        placeholder: ''
      }
    }

    @Prop()
    options !: FormActionModalOptions

    @Watch('options', {
      immediate: true
    })
    setOptions(opts: FormActionModalOptions) {
      if (!opts) {
        return false;
      }
      const formObject = opts.data;
      this.nextNodeParticipant = formObject.nextNodeParticipant;
      this.deptId = opts.deptId;
      this.list = formObject.participantInfos.map(i => {
        if (i.participantType !== 'SINGLE_PARTICIPANT') {
          i.participantList = [];
        }
        return i
      });
    }

    submit() {
      let status: any = [];
      this.list.forEach(i => {
        if (!i.participantList || (Array.isArray(i.participantList) && i.participantList.length <= 0)) {
          status.push(i);
        }
      })
      if (status.length > 0) {
        this.$confirm({
          title: this.$t('cloudpivot.form.runtime.modal.nextNodeTips', {
            nodeName: status[0].activityName
          }), // `确定要删除“${'流程名称'}”吗？`,
          okText: this.$t('cloudpivot.form.runtime.modal.yes').toString(),
          cancelText: this.$t('cloudpivot.form.runtime.modal.selectParticipant').toString(),
          onOk: () => {
            const arr = this.changeData();
            this.$emit('nodeOk', {participantInfos: arr, deptId: this.deptId});
          },
          onCancel: () => {
          },
        });
      } else {
        const arr = this.changeData();
        return {participantInfos: arr, deptId: this.deptId};
      }
    }

    changeData() {
      let arr = JSON.parse(JSON.stringify(this.list));
      if (this.nextNodeParticipant === 'ORGANIZATION') {
        arr = arr.map(i => {
          i.participantList = i.participantList.map(v => v.id);
          return i;
        })
      }
      return arr
    }
  }

</script>

<style lang="less" scoped>
  
  /deep/ .ant-radio-wrapper {
    display: block;
  }
  
  .field__control__checkbox {
    /deep/ .ant-checkbox-wrapper {
      display: block;
      margin-bottom: 10px;
    }
  }
  
  .form-submit {
    position: relative;
    
    .ant-checkbox-wrapper {
      display: block;
      margin-left: 0;
      margin-bottom: 10px;
    }
    
    .error {
      color: #f5222d;
      font-size: 12px;
      position: absolute;
      bottom: -22px;
      left: 0;
    }
  }

</style>
