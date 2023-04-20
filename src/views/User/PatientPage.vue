<!--  -->
<template>
    <div class="patient-page">
        <cp-nav-bar :title="isChange ? '选择患者' : '家庭档案'"></cp-nav-bar>
        <div class="patient-change" v-if="isChange">
            <h3>请选择患者信息</h3>
            <p>以便医生给出更准确的治疗，信息仅医生可见</p>
        </div>
        <div class="patient-list">
            <div class="patient-item" v-for="item in list" :key="item.id" @click="selectedPatient(item)"
                :class="{ selected: patientId === item.id }">
                <div class="info">
                    <span class="name">{{ item.name }}</span>
                    <span class="id">{{ item.idCard.replace(/^(.{6}).+(.{4})$/, '\$1********\$2') }}</span>
                    <span>{{ item.genderValue }}</span>
                    <span>{{ item.age }}岁</span>
                </div>
                <div class="icon" @click="showPopup(item)"><cp-icon name="user-edit" /></div>
                <div class="tag" v-if="item.defaultFlag === 1">默认</div>
            </div>
            <div class="patient-add" v-if="list.length < 6" @click="showPopup()">
                <cp-icon name="user-add" />
                <p>添加患者</p>
            </div>
            <div class="patient-tip">最多可添加 6 人</div>
            <div class="patient-next" v-if="isChange">
                <van-button type="primary" @click="next" round block>下一步</van-button>
            </div>
        </div>
        <!-- 右侧弹出 -->
        <van-popup v-model:show="show" position="right">
            <cp-nav-bar :back="() => (show = false)" :leftClick="onSubmit" :title="patient.id ? '编辑患者' : '添加患者'"
                right-text="保存"></cp-nav-bar>
            <van-form autocomplete="off" ref="form">
                <van-field v-model="patient.name" :rules="nameRules" label="真实姓名" placeholder="请输入真实姓名" />
                <van-field v-model="patient.idCard" :rules="idCardRules" label="身份证号" placeholder="请输入身份证号" />
                <van-field label="性别" class="pb4">
                    <!-- 单选按钮组件 -->
                    <template #input>
                        <cp-radio-btn v-model="patient.gender" :options="options"></cp-radio-btn>
                    </template>
                </van-field>
                <van-field label="默认就诊人">
                    <template #input>
                        <van-checkbox v-model="defaultFlag" :icon-size="18" round />
                    </template>
                </van-field>
            </van-form>
            <van-action-bar v-if="patient.id">
                <van-action-bar-button @click="remove">删除</van-action-bar-button>
            </van-action-bar>
        </van-popup>
    </div>
</template>

<script lang='ts' setup>
import { ref, onMounted, computed } from 'vue'
import { getPatientList, addPatient, editPatient, delPatient } from '@/services/user'
import type { Patient, PatientList } from '@/types/user'
import { nameRules, idCardRules } from '@/utils/rulers'
import type { FormInstance } from 'vant'
import { showConfirmDialog, showSuccessToast,showToast  } from 'vant'
import { useRoute,useRouter } from 'vue-router'
import { useConsultStore } from '@/stores/modules/consult'
// 是否是选择患者
const route = useRoute()
const store = useConsultStore()
const router = useRouter()
const isChange = computed(() => route.query.isChange === '1')
const patientId = ref<string>()
const selectedPatient = (item: Patient) => {
    if (isChange.value) {
        patientId.value = item.id
    }
}
const next = async () => {
  if (!patientId.value) return showToast('请选就诊择患者')
  store.setPatient(patientId.value)
  router.push('/consult/pay')
}
const options = [
    { label: '男', value: 1 },
    { label: '女', value: 0 }
]
const gender = ref(1)
// 1. 页面初始化加载数据
const list = ref<PatientList>([])
const loadList = async () => {
    const res = await getPatientList()
    list.value = res.data
    if (isChange.value && list.value.length) {
        const defPatient = list.value.find((item) => item.defaultFlag === 1)
        if (defPatient) patientId.value = defPatient.id
        else patientId.value = list.value[0].id
    }
}

const initPatient: Patient = {
    name: '',
    idCard: '',
    gender: 1,
    defaultFlag: 0
}
const patient = ref<Patient>({ ...initPatient })
const defaultFlag = computed({
    get() {
        return patient.value.defaultFlag === 1 ? true : false
    },
    set(value) {
        patient.value.defaultFlag = value ? 1 : 0
    }
})
const form = ref<FormInstance>()
const onSubmit = async () => {
    await form.value?.validate()
    // 校验通过
    // 身份证倒数第二位，单数是男，双数是女
    const gender = +patient.value.idCard.slice(-2, -1) % 2
    if (gender !== patient.value.gender) {
        await showConfirmDialog({
            title: '温馨提示',
            message: '填写的性别和身份证号中的不一致\n您确认提交吗？'
        })
    }
    // 添加 & 修改
    patient.value.id ? await editPatient(patient.value) : await addPatient(patient.value)
    show.value = false
    loadList()
    showSuccessToast(patient.value.id ? '编辑成功' : '添加成功')
}
onMounted(() => {
    loadList()
})
// 2. 打开侧滑栏
const show = ref(false)
const showPopup = (item?: Patient) => {
    if (item) {
        const { id, gender, name, idCard, defaultFlag } = item
        patient.value = { id, gender, name, idCard, defaultFlag }
    } else {
        patient.value = { ...initPatient }

    }
    show.value = true
}
const remove = async () => {
    if (patient.value.id) {
        await showConfirmDialog({
            title: '温馨提示',
            message: `您确认要删除 ${patient.value.name} 患者信息吗 ？`
        })
        await delPatient(patient.value.id)
        show.value = false
        loadList()
        showSuccessToast('删除成功')
    }
}
</script>
<style lang='scss' scoped>
.patient-page {
    padding: 46px 0 80px;

    :deep() {
        .van-popup {
            width: 100%;
            height: 100%;
            padding-top: 46px;
            box-sizing: border-box;
        }
    }
}

.patient-list {
    padding: 15px;
}

.patient-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: var(--cp-bg);
    border-radius: 8px;
    margin-bottom: 15px;
    position: relative;
    border: 1px solid var(--cp-bg);
    transition: all 0.3s;
    overflow: hidden;

    .info {
        display: flex;
        flex-wrap: wrap;
        flex: 1;

        span {
            color: var(--cp-tip);
            margin-right: 20px;
            line-height: 30px;

            &.name {
                font-size: 16px;
                color: var(--cp-text1);
                width: 80px;
                margin-right: 0;
            }

            &.id {
                color: var(--cp-text2);
                width: 180px;
            }
        }
    }

    .icon {
        color: var(--cp-tag);
        width: 20px;
        text-align: center;
    }

    .tag {
        position: absolute;
        right: 60px;
        top: 21px;
        width: 30px;
        height: 16px;
        font-size: 10px;
        color: #fff;
        background-color: var(--cp-primary);
        border-radius: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &.selected {
        border-color: var(--cp-primary);
        background-color: var(--cp-plain);

        .icon {
            color: var(--cp-primary);
        }
    }
}

.patient-add {
    background-color: var(--cp-bg);
    color: var(--cp-primary);
    text-align: center;
    padding: 15px 0;
    border-radius: 8px;

    .cp-icon {
        font-size: 24px;
    }
}

.patient-tip {
    color: var(--cp-tag);
    padding: 12px 0;
}

.pb4 {
    padding-bottom: 4px;
}

.van-action-bar {
    padding: 0 10px;
    margin-bottom: 10px;

    .van-button {
        color: var(--cp-price);
        background-color: var(--cp-bg);
    }
}

.patient-change {
    padding: 15px;

    >h3 {
        font-weight: normal;
        margin-bottom: 5px;
    }

    >p {
        color: var(--cp-text3);
    }
}

.patient-next {
    padding: 15px;
    background-color: #fff;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 80px;
    box-sizing: border-box;
}
</style>