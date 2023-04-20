<!--  -->
<template>
    <svg aria-hidden="true" class="cp-icon">
        <use :href="`#icon-${name}`" />
    </svg>
</template>

<script lang='ts' setup>
import { reactive, toRefs, ref } from 'vue'
defineProps<{
  name: string
}>()
</script>
<style lang='scss' scoped>
.cp-icon {
    // 和字体一样大
    width: 1em;
    height: 1em;
}
</style>