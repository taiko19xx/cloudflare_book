<template>
  <div id="app">
    <FieldView></FieldView>
    <PostView v-for="key in posts" :key="key" :id="key"></PostView>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PostView from './components/PostView.vue'
import FieldView from './components/FieldView.vue'

export default defineComponent({
  name: 'App',
  components: {
    PostView,
    FieldView,
  },
  data: () => {
    return {
      posts: [] as string[]
    }
  }
})
</script>

<style>
.row {
  margin: 0.75em;
}
</style>