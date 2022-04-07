<template functional>
  <a-sub-menu :key="props.menu.id">
    <span slot="title">
      <i class="icon aufontAll" :class="props.menu.icon ? props.menu.icon : 'h-icon-all-folder-open-o'"></i>
      <span :class="props.specStyle  ? 'specStyles' : ''" :title="props.menu.name ">{{ props.menu.name }}</span>
    </span>
    <template v-for="(childMenu) in props.menu.children">
      <sub-menu
        :key="childMenu.id"
        :menu="childMenu"
        :specStyle="props.specStyle"
        :fn="props.fn"
        v-if="childMenu.children"

      ></sub-menu>
      <a-menu-item :key="childMenu.id" @click="props.fn(childMenu)" v-else>
        
        <router-link :title="childMenu.name" :to="''" v-if="childMenu.type === 'BizModel'">
          <i class="icon aufontAll" :class="childMenu.icon"></i>
          <span :class="props.specStyle ? 'specStyles' : ''">{{childMenu.name }}</span>
        </router-link>
        <a :title="childMenu.name" v-else>
          <i class="icon aufontAll" :class="childMenu.icon"></i>
          <span :class="props.specStyle ? 'specStyles' : ''">{{ childMenu.name}}</span>
        </a>
      </a-menu-item>
    </template>
  </a-sub-menu>
</template>
<script>
export default {
  name: "SubMenu",
  components: {},
  props: {
    menu: {},
    fn:void 0,
    specStyle: Boolean,
  },
  computed:{
    isChinese(){
      return this.$i18n.locale === 'zh';
    }
  }
};
</script>

<style scoped></style>
