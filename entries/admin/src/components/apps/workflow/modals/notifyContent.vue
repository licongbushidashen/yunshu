<template>
  <div class="textarea-notigy-content">
    <div class="input-select ant-select ant-select-enabled">
      <div class="ant-select-selection ant-select-selection--multiple">
        <div class="ant-select-selection__rendered">
          <div class="ant-select-selection__placeholder" style="display: none">
            请选择
          </div>
          <ul>
            <li class="ant-select-selection__choice" style="user-select: none">
              <div class="ant-select-selection__choice__content">拥有者</div>
              <span class="ant-select-selection__choice__remove"
                ><a-icon type="close"
              /></span>
            </li>
            <li class="ant-select-search ant-select-search--inline">
              <div class="ant-select-search__field__wrap">
                <input
                  autocomplete="off"
                  class="ant-select-search__field"
                /><span class="ant-select-search__field__mirror">&nbsp;</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="select-show" @mouseleave="handleMouseLeave">
      <div class="choose-data" @click="showSelect = true">选择表单数据项</div>
      <div
        v-if="showSelect"
        style="position: absolute; top: 0px; left: 0px; width: 100%"
      >
        <div>
          <div
            class="ant-select-dropdown ant-select-dropdown--multiple ant-select-dropdown-placement-bottomLeft"
            style="width: 100%; left: 0px; top: 30px"
          >
            <div
              class="ant-select-dropdown-content"
              style="overflow: auto; transform: translateZ(0px)"
            >
              <ul
                class="ant-select-dropdown-menu ant-select-dropdown-menu-vertical ant-select-dropdown-menu-root"
              >
                <li class="ant-select-dropdown-menu-item-group">
                  <div class="ant-select-dropdown-menu-item-group-title">
                    <span class="select-title">业务数据项</span>
                  </div>
                  <ul class="ant-select-dropdown-menu-item-group-list">
                    <li
                      class="ant-select-dropdown-menu-item"
                      style="user-select: none"
                    >
                      单行文本<a-icon
                        type="check"
                        class="ant-select-selected-icon"
                      />
                    </li>
                  </ul>
                </li>
                <li class="ant-select-dropdown-menu-item-group">
                  <div class="ant-select-dropdown-menu-item-group-title">
                    <span class="select-title">系统数据项</span>
                  </div>
                  <ul class="ant-select-dropdown-menu-item-group-list">
                    <li
                      class="ant-select-dropdown-menu-item"
                      style="user-select: none"
                    >
                      创建人<a-icon
                        type="check"
                        class="ant-select-selected-icon"
                      />
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component({
  name: "NotifyContent",
})
export default class NotifyContent extends Vue {
  showSelect: boolean = false;

  handleMouseLeave() {
    this.showSelect = false;
  }
}
</script>

<style lang="less" scoped>
.textarea-notigy-content /deep/ {
  position: relative;
  height: 110px;
  .ant-select {
    width: 100%;
    height: 100%;
    .ant-select-search__field {
      width: 100%;
    }
    .ant-select-selection--multiple {
      height: 100%;
    }
  }
  .choose-data {
    width: 84px;
    height: 22px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    line-height: 22px;
    margin: 10px;
    text-decoration: underline;
    cursor: pointer;
    &:hover,
    &:checked {
      color: #2970ff;
    }
  }
  .select-show {
    position: absolute;
    top: 70px;
    width: 100%;
  }
}
</style>