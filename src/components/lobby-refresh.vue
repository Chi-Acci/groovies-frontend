<template>
  <button class="btn btn-dark" type='button' :disabled='disabled' v-on:click='onClick()'>
    {{label}}
  </button>
</template>

<script>
import { A_GET_ROOM } from '../store/constants'

export default {
  name: 'lobby-refresh',
  props: {
    roomSlug: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      label: 'Refresh'
    }
  },
  computed: {
    disabled () {
      return false
    }
  },
  methods: {
    onClick () {
      this.$store.dispatch(A_GET_ROOM, this.roomSlug)
    }
  }
}
</script>

<style scoped>

</style>
