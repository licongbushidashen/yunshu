<style lang="less" src="./at.less"></style>

<template>
  <div
    ref="wrap"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
    @input="handleInput()"
    @keydown.capture="handleKeyDown"
    @blur="onAtwhoViewBlur"
    class="atwho-wrap"
    tabindex="0"
  >
    <div
      v-if="atwho"
      :style="style"
      class="atwho-panel"
    >
      <div class="atwho-inner">
        <div
          ref="view"
          class="atwho-view"
          @mousedown="setScroll"
          @mouseup="setScrollFalse"
          @scroll="onAtWhoViewScroll"
        >
          <ul class="atwho-ul">
            <li
              v-for="(item, index) in atwho.list"
              :key="index"
              :class="isCur(index) && 'atwho-cur'"
              :ref="isCur(index) && 'cur'"
              :data-index="index"
              @mouseenter="handleItemHover"
              @click="handleItemClick"
              class="atwho-li"
            >
              <slot :item="item" name="item">
                <span v-text="itemName(item)"></span>
              </slot>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <span ref="embeddedItem">
      <slot :current="currentItem" name="embeddedItem"></slot>
    </span>
  </div>
</template>
