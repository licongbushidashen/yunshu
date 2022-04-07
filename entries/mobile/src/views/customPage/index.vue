<template>
    <div class="custom-page">
        <iframe :src="customMobileUrl" class="iframe" frameborder="0"></iframe>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { State, Action, namespace } from 'vuex-class';

@Component({
name:""
})
export default class ComponentName extends Vue {
    get customMobileUrl() {
        return this.$route.query.customMobileUrl;
    }
}
</script>

<style lang="less" scoped>
.custom-page {
    width: 100%;
    height: 100%;

    .iframe {
        width: 100%;
        height: 100%;
    }
}
</style>