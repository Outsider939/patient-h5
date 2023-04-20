<!--  -->
<template>
<div class="login-page">login-callback</div>
</template>

<script lang='ts' setup>
import { onMounted, ref } from 'vue'
import { loginByQQ } from '@/services/user'

const openId = ref('')
const isBind = ref(true)
onMounted(() => {
  if (window.QC.Login.check()) {
    window.QC.Login.getMe((id) => {
      openId.value = id
      // QQ，登录
      loginByQQ(id)
        .then((res) => {
          // 登录成功
        })
        .catch(() => {
          // 登录失败
          isBind.value = false
        })
    })
  }
})

</script>
<style lang='scss' scoped>
</style>