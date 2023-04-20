<!--  -->
<template>
    <div class="room-page">
        <cp-nav-bar title="医生问诊室" />
        <room-status :status="consult?.status" :countdown="consult?.countdown"></room-status>
        <van-pull-refresh v-model="loading" @refresh="onRefresh">
            <room-message :list="list" />
        </van-pull-refresh>
        <room-action :disabled="consult?.status !== OrderType.ConsultChat" @send-text="sendText"
            @send-image="sendImage"></room-action>
    </div>
</template>

<script lang='ts' setup>
import RoomStatus from './components/RoomStatus.vue'
import RoomMessage from './components/RoomMessage.vue'
import RoomAction from './components/RoomAction.vue'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { onMounted, onUnmounted, ref, nextTick, provide } from 'vue'
import { baseURL } from '@/utils/request'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import { MsgType, OrderType } from '@/enums'
import type { Message, TimeMessages } from '@/types/room'
import type { ConsultOrderItem, Image } from '@/types/consult'
import { getConsultOrderDetail } from '@/services/consult'
import dayjs from 'dayjs'
import { showToast } from 'vant'

const store = useUserStore()
const route = useRoute()

const list = ref<Message[]>([])
const consult = ref<ConsultOrderItem>()
provide('consult', consult)
let socket: Socket

const loading = ref(false)
const onRefresh = () => {
    // 触发下拉
    socket.emit('getChatMsgList', 20, time.value, route.query.orderId)
}

const time = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const initialMsg = ref(true)

onUnmounted(() => {
    socket.close()
})
onMounted(async () => {
    const res = await getConsultOrderDetail(route.query.orderId as string)
    consult.value = res.data
    console.log(res);

    // 建立链接，创建 socket.io 实例
    socket = io(baseURL, {
        auth: {
            token: `Bearer ${store.user?.token}`
        },
        query: {
            orderId: route.query.orderId
        }
    })

    socket.on('connect', () => {
        // 建立连接成功
        // 默认一个空的聊天数组
        list.value = []
        console.log('connect')
    })

    socket.on('error', (err) => {
        // 错误异常消息
        console.log('error', err)
    })

    socket.on('disconnect', () => {
        // 已经断开连接
        console.log('disconnect')
    })
    // 聊天记录
    socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
        // 准备转换常规消息列表
        const arr: Message[] = []
        data.forEach((item, i) => {
            // 记录消息分组第一组的时间，作为下次获取聊天记录的时间
            if (i === 0) time.value = item.createTime
            arr.push({
                msgType: MsgType.Notify,
                msg: { content: item.createTime },
                createTime: item.createTime,
                id: item.createTime
            })
            arr.push(...item.items)
            // item.items.forEach((item) => {
            //     arr.push({ ...item, notScroll: initialMsg.value === false })
            // })
        })
        // 追加到聊天消息列表
        list.value.unshift(...arr)
        loading.value = false
        if (!data.length) {
            return showToast('没有聊天记录了')
        }
        nextTick(() => {
            if (initialMsg.value) {
                socket.emit('updateMsgStatus', arr[arr.length - 1].id)
                window.scrollTo(0, document.body.scrollHeight)
                initialMsg.value = false
            }
        })
    })
    // 订单状态
    socket.on('statusChange', async () => {
        const res = await getConsultOrderDetail(route.query.orderId as string)
        consult.value = res.data
    })
    // 接收消息 在onMounted注册
    socket.on('receiveChatMsg', async (event) => {
        list.value.push(event)
        await nextTick()
        socket.emit('updateMsgStatus', event.id)
        window.scrollTo(0, document.body.scrollHeight)
    })
})

const sendText = (text: string) => {
    // 发送信息需要  发送人  收消息人  消息类型  消息内容
    socket.emit('sendChatMsg', {
        from: store.user?.id,
        to: consult.value?.docInfo?.id,
        msgType: MsgType.MsgText,
        msg: { content: text }
    })
}

const sendImage = (img: Image) => {
    socket.emit('sendChatMsg', {
        from: store.user?.id,
        to: consult.value?.docInfo?.id,
        msgType: MsgType.MsgImage,
        msg: { picture: img }
    })
}

const completeEva = (score: number) => {
  const item = list.value.find((item) => item.msgType === MsgType.CardEvaForm)
  if (item) {
    item.msg.evaluateDoc = { score }
    item.msgType = MsgType.CardEva
  }
}
provide('completeEva', completeEva)
</script>

<style lang='scss' scoped>
.room-page {
    padding-top: 90px;
    padding-bottom: 60px;
    min-height: 100vh;
    box-sizing: border-box;
    background-color: var(--cp-bg);

    .van-pull-refresh {
        width: 100%;
        min-height: calc(100vh - 150px);
    }
}
</style>