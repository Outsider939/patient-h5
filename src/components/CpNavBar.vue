<!--  -->
<template>
  <van-nav-bar :title="title" :right-text="rightText" fixed left-arrow @click-left="onClickLeft"
    @click-right="onClickRight" />
</template>

<script lang='ts' setup>
import { reactive, toRefs, ref } from 'vue'
import { useRouter } from 'vue-router';
const props = defineProps<{
  title?: string,
  rightText?: string,
  back?: () => void,
  leftClick?:() => void
}>()
const router = useRouter()
const onClickLeft = () => {
  if (props.back) {
    return props.back()
  }
  if (history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}
const onClickRight = () => {
  if(props.leftClick) return props.leftClick()
}
</script>
<style lang='scss' scoped>
:deep() {
  .van-nav-bar {
    &__arrow {
      font-size: 18px;
      color: var(--cp-text1);
    }

    &__text {
      font-size: 15px;
    }
  }
}
</style>