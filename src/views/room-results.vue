<template>
  <div class="container">
    <div class="row justify-content-center">
      <div v-if="resultsAreReady" class="col-10">
        <movie-card :movie="movie" :read-only="true"/>
        <br>
        <div class="container">
          <div class="row justify-content-around">
            <div class="col-7">
              <div class="row justify-content-around">
                <button type="button" class="btn btn-outline-dark" :disabled="prevBtnDisabled" v-on:click="onClickPrev()">{{prevBtnLabel}}</button>
                {{currentResultIndex + 1}}
                <button type="button" class="btn btn-outline-dark" :disabled="nextBtnDisabled" v-on:click="onClickNext()">{{nextBtnLabel}}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="alert alert-dark" role="alert">
        {{noResultsMsg}}
      </div>
    </div>
  </div>
</template>

<script>
import { G_ROOM_RESULTS, G_ROOM_RESULTS_ARE_LOADED } from '../store/constants'
import movieCard from '../components/movie-card'

export default {
  name: 'room-results',
  components: {
    movieCard
  },
  data () {
    return {
      noResultsMsg: 'Results are not yet available',
      currentResultIndex: 0,
      prevBtnLabel: 'Prev',
      nextBtnLabel: 'Next'
    }
  },
  computed: {
    resultsAreReady () {
      return this.$store.getters[G_ROOM_RESULTS_ARE_LOADED]
    },
    results () {
      return this.$store.getters[G_ROOM_RESULTS]
    },
    movie () {
      return this.results ? this.results[this.currentResultIndex] : undefined
    },
    prevBtnDisabled () {
      return this.results ? this.currentResultIndex === 0 : false
    },
    nextBtnDisabled () {
      return this.results ? this.currentResultIndex === this.results.length - 1 : false
    }
  },
  methods: {
    onClickPrev () {
      this.currentResultIndex -= 1
    },
    onClickNext () {
      this.currentResultIndex += 1
    }
  }
}
</script>

<style scoped>
  .alert {
    background-color: gray;
    color: white;
  }
</style>
