<!--  -->
<template>
    <div class="consult-list">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <consult-item v-for="item in list" :key="item.id" :item="item" @on-delete="onDelete"></consult-item>
        </van-list>
    </div>
</template>

<script lang='ts' setup>
import { reactive, toRefs, ref } from 'vue'
import ConsultItem from './ConsultItem.vue'
import type { ConsultType } from '@/enums'
import { getConsultOrderList } from '@/services/consult'
import type { ConsultOrderItem, ConsultOrderListParams } from '@/types/consult'

const props = defineProps<{ type: ConsultType }>()
const params = ref<ConsultOrderListParams>({
    type: props.type,
    current: 1,
    pageSize: 5
})
const loading = ref(false)
const finished = ref(false)
const list = ref<ConsultOrderItem[]>([])
const onLoad = async () => {
    const res = await getConsultOrderList(params.value)
    list.value.push(...res.data.rows)
    loading.value = false
    if (params.value.current < res.data.pageTotal) {
        params.value.current++
    } else {
        finished.value = true
    }

}
const onDelete = (id: string) => {
  list.value = list.value.filter((item) => item.id !== id)
}
</script>

<style lang='scss' scoped>
.consult-list {
    padding: 10px 15px;
}
</style>