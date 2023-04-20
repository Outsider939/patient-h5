import { ref,onMounted } from 'vue'
import { showImagePreview } from 'vant'
import { cancelOrder, followOrUnfollow, getPrescriptionPic, deleteOrder } from '@/services/consult'
import type { ConsultOrderItem, FollowType } from '@/types/consult'
import { ImagePreview, showToast } from 'vant'
import { OrderType } from '@/enums'
import { getMedicalOrderDetail } from '@/services/order'
import type { OrderDetail } from '@/types/order'

// 封装逻辑，规范 useXxx，表示使用某功能
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  // {a, b} 类型，传值得时候 {a, b, c} 也可以，这是类型兼容：多的可以给少的
  const follow = async (item: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true
    try {
      await followOrUnfollow(item.id, type)
      item.likeFlag = item.likeFlag === 1 ? 0 : 1
    } finally {
      loading.value = false
    }
  }
  return { loading, follow }
}

// 封装查看处方逻辑
export const useShowPrescription = () => {
  const showPrescription = async (id?: string) => {
    if (id) {
      const res = await getPrescriptionPic(id)
      showImagePreview([res.data.url])
    }
  }
  return { showPrescription }
}

// 封装取消订单逻辑
export const useCancelOrder = () => {
  const loading = ref(false)
  const cancelConsultOrder = (item: ConsultOrderItem) => {
    loading.value = true
    cancelOrder(item.id)
      .then(() => {
        item.status = OrderType.ConsultCancel
        item.statusValue = '已取消'
        showToast('取消成功')
      })
      .catch(() => {
        showToast('取消失败')
      })
      .finally(() => {
        loading.value = false
      })
  }
  return { loading, cancelConsultOrder }
}

// 封装删除订单
export const useDeleteOrder = (cb: () => void) => {
  const loading = ref(false)
  const deleteConsultOrder = async (item: ConsultOrderItem) => {
    loading.value = true
    try {
      await deleteOrder(item.id)
      // 成功，通知父组件删除这条信息，提示，详情就是跳转列表页面
      showToast('删除成功')
      cb && cb()
    } catch (e) {
      showToast('删除失败')
    } finally {
      loading.value = false
    }
  }
  return { loading, deleteConsultOrder }
}

//获取订单详情数据
export const useOrderDetail = (id: string) => {
  const loading = ref(false)
  const order = ref<OrderDetail>()
  onMounted(async () => {
    loading.value = true
    try {
      const res = await getMedicalOrderDetail(id)
      order.value = res.data
    } finally {
      loading.value = false
    }
  })
  return { order, loading }
}