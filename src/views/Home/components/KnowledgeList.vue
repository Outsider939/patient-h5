<!--  -->
<template>
    <div class="knowledge-list">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
            <knowledge-card v-for="item in list" :key="item.id" :item="item" />
        </van-list>
    </div>
</template>

<script lang='ts' setup>
import { reactive, toRefs, ref,onMounted } from 'vue'
import KnowledgeCard from './KnowledgeCard.vue'
import type { KnowledgeType, KnowledgeParams, KnowledgeList } from '@/types/consult'
import { getKnowledgePage } from '@/services/consult'
const props = defineProps<{
    type: KnowledgeType
}>()
const list = ref<KnowledgeList>([])
const loading = ref(false)
const finished = ref(false)
const params = ref<KnowledgeParams>({
    type: props.type,
    current: 1,
    pageSize: 10
})
const onLoad = async () => {
    const res = await getKnowledgePage(params.value)
    list.value.push(...res.data.rows)
    if (params.value.current >= res.data.pageTotal) {
        finished.value = true
    } else {
        params.value.current++
    }
    loading.value = false
}
onMounted( async () => {
    const res = await getKnowledgePage(params.value)
    list.value.push(...res.data.rows)
})
</script>
<style lang='scss' scoped>
.knowledge-list {
    padding: 0 15px;
}
</style>