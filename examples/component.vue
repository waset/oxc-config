<script setup lang="ts">
// 取消下一行注释，查看 no-import-compiler-macros 错误。
// import { defineProps } from 'vue'

const props = defineProps<{ title?: string }>()
const emit = defineEmits<{ select: [name: string] }>()
const items = ['校验代码', '统一格式']
</script>

<template>
  <section class="example-card">
    <h2>{{ props.title ?? '团队工具箱' }}</h2>
    <button v-for="item in items" :key="item" type="button" @click="emit('select', item)">
      {{ item }}
    </button>
  </section>
</template>

<style scoped>
.example-card {
  display: grid;
  gap: 12px;
}
</style>
