<!--  -->
<template>
    <div class="login-page" @submit="login">
        <cp-nav-bar rightText="注册"></cp-nav-bar>
        <div class="login-head">
            <h3>{{ isPass? '密码登录': '短信验证码登录' }}</h3>
            <a href="javascript:;" @click="isPass = !isPass">
                <span>{{ !isPass ? '密码登录' : '短信验证码登录' }}</span>
                <van-icon name="arrow"></van-icon>
            </a>
        </div>
        <van-form autocomplete="off">
            <van-field placeholder="请输入手机号" name="mobile" v-model="mobile" :rules="mobileRules" type="tel" />
            <van-field v-if="isPass" placeholder="请输入密码" v-model="password" :rules="passwordRules"
                :type="show ? 'text' : 'password'">
                <template #button>
                    <cp-icon @click="show = !show" :name="`login-eye-${show ? 'on' : 'off'}`"></cp-icon>
                </template>
            </van-field>
            <van-field v-else placeholder="短信验证码" v-model="code" :rules="codeRules">
                <template #button>
                    <span class="btn-send" :class="{ active: time > 0 }" @click="send">
                        {{ time > 0 ? `${time}s后再次发送` : '发送验证码' }}
                    </span>
                </template>
            </van-field>
            <div class="cp-cell">
                <van-checkbox v-model="agree">
                    <span>我已同意</span>
                    <a href="javascript:;">用户协议</a>
                    <span>及</span>
                    <a href="javascript:;">隐私条款</a>
                </van-checkbox>
            </div>
            <div class="cp-cell">
                <van-button type="primary" block round size="large" native-type="submit">登 录</van-button>
            </div>
            <div class="cp-cell">
                <a href="javascript:;">忘记密码？</a>
            </div>
        </van-form>
        <div class="login-other">
            <van-divider>第三方登录</van-divider>
            <div class="icon">
                <van-icon name="qq" size="40" color="#44cef6" />
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { reactive, toRefs, ref, onUnmounted } from 'vue'
import { showToast, Toast, type FormInstance } from 'vant';
import { mobileRules, passwordRules, codeRules } from '@/utils/rulers'
import { loginByPassword, sendMobileCode, loginByMobile } from '@/services/user'
import { useUserStore } from '@/stores'
import { useRoute, useRouter } from 'vue-router'

const mobile = ref<string>('')
const password = ref<string>('')
const agree = ref<boolean>(false)
const show = ref<boolean>(false)
const isPass = ref(true)
const code = ref('')

const store = useUserStore()
const router = useRouter()
const route = useRoute()

// 表单提交
const login = async () => {
    if (!agree.value) return showToast('请勾选我已同意')
    // 验证完毕，进行登录
    const res = isPass.value ? await loginByPassword(mobile.value, password.value) : await loginByMobile(mobile.value, code.value)
    store.setUser(res.data)
    router.push((route.query.returnUrl as string) || '/home')
    showToast('登录成功')
}
// 发送验证码
const form = ref<FormInstance>()
const time = ref(0)
let timeId: number
const send = async () => {
    if (time.value > 0) return
    // 验证不通过报错，阻止程序继续执行
    await form.value?.validate('mobile')
    await sendMobileCode(mobile.value, 'login')
    showToast('发送成功')
    time.value = 60
    //倒计时
    clearInterval(timeId)
    timeId = window.setInterval(() => {
        time.value--
        if (time.value <= 0) window.clearInterval(timeId)
    }, 1000);
}
onUnmounted(() => {
    window.clearInterval(timeId)
})
</script>
<style lang='scss' scoped>
.login {
    &-page {
        padding-top: 46px;
    }

    &-head {
        display: flex;
        padding: 30px 30px 50px;
        justify-content: space-between;
        align-items: flex-end;
        line-height: 1;

        h3 {
            font-weight: normal;
            font-size: 24px;
        }

        a {
            font-size: 15px;
        }
    }

    &-other {
        margin-top: 60px;
        padding: 0 30px;

        .icon {
            display: flex;
            justify-content: center;
        }
    }
}

.van-form {
    padding: 0 14px;

    .cp-cell {
        height: 52px;
        line-height: 24px;
        padding: 14px 16px;
        box-sizing: border-box;
        display: flex;
        align-items: center;

        .van-checkbox {
            a {
                color: var(--cp-primary);
                padding: 0 5px;
            }
        }
    }

    .btn-send {
        color: var(--cp-primary);

        &.active {
            color: rgba(22, 194, 163, 0.5);
        }
    }
}
</style>