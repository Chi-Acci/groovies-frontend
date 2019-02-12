import Vue from 'vue'
import Vuex from 'vuex'
import {
  G_USERNAME, G_TOKEN,
  M_USERNAME, M_TOKEN, M_TOKEN_CLEAR,
  A_CREATE_USER,
  G_ROOM_IS_LOADED, G_ROOM_STATUS,
  G_ROOM_USERS, G_ROOM_MOVIES,
  G_NEXT_MOVIE,
  G_ROOM_RESULTS_READY, G_ROOM_RESULTS,
  G_ROOM_UNRATED_MOVIES,
  M_ROOM, M_ROOM_CLEAR, M_ROOM_RESULTS, M_ROOM_RESULTS_CLEAR,
  A_CREATE_ROOM, A_JOIN_ROOM, A_GET_ROOM, A_GET_ROOM_RESULTS,
  M_WS_CONNECTED, M_WS_CLOSED, M_WS_ONMESSAGE,
  A_WS_CONNECT, A_WS_CLOSE,
  A_RATE_MOVIE,
  A_SESSION_RESET
} from './constants'
import { httpBackend, wsBackend } from '../backend'

Vue.use(Vuex)

const USERS_URL = 'users'
const ROOMS_URL = 'rooms'
const RATINGS_URL = 'ratings'

export default new Vuex.Store({
  state: {
    username: localStorage.getItem('username') || undefined,
    token: localStorage.getItem('token') || undefined,
    room: undefined,
    results: undefined,
    // web socket
    ws: undefined,
    wsConnected: false,
    wsUsers: []
  },
  getters: {
    [G_USERNAME]: state => state.username,
    [G_TOKEN]: state => state.token,
    [G_ROOM_IS_LOADED]: state => state.room !== undefined,
    [G_ROOM_STATUS]: state => state.room ? state.room.status : '',
    [G_ROOM_USERS]: state => state.room ? state.room.users : [],
    [G_ROOM_MOVIES]: state => state.room ? state.room.movies : [],
    [G_ROOM_UNRATED_MOVIES]: state => {
      return state.room
        ? state.room.unrated_movies ? state.room.unrated_movies : []
        : []
    },
    [G_NEXT_MOVIE]: (state, getters) => {
      return getters[G_ROOM_UNRATED_MOVIES][0]
    },
    [G_ROOM_RESULTS_READY]: (state, getters) => {
      return state.room
        ? !getters[G_ROOM_USERS].find(user => user.rated_count < getters[G_ROOM_MOVIES].length)
        : false
    },
    [G_ROOM_RESULTS]: state => state.results ? state.results.results : undefined
  },
  mutations: {
    [M_USERNAME]: (state, username) => {
      state.username = username
      localStorage.setItem('username', username)
    },
    [M_TOKEN]: (state, token) => {
      state.token = token
      localStorage.setItem('token', token)
    },
    [M_TOKEN_CLEAR]: (state) => {
      state.token = undefined
      localStorage.removeItem('token')
    },
    [M_ROOM]: (state, room) => {
      state.room = room
    },
    [M_ROOM_CLEAR]: (state) => {
      state.room = undefined
    },
    [M_ROOM_RESULTS]: (state, results) => {
      state.results = results
    },
    [M_ROOM_RESULTS_CLEAR]: (state) => {
      state.results = undefined
    },
    [M_WS_CONNECTED]: (state, ws) => {
      state.ws = ws
      state.wsConnected = true
    },
    [M_WS_CLOSED]: (state) => {
      console.log(M_WS_CLOSED)
      state.wsConnected = false
    },
    [M_WS_ONMESSAGE]: (state, msg) => {
      console.log(M_WS_ONMESSAGE, msg)
      state.wsUsers = msg.users
    }
  },
  actions: {
    [A_CREATE_USER]: ({ commit, getters }, name) => new Promise((resolve, reject) => {
      httpBackend.post(USERS_URL, { name: name })
        .then(response => {
          commit(M_TOKEN, response.data.token)
          commit(M_USERNAME, response.data.name)
          resolve()
        })
        .catch(err => {
          commit(M_TOKEN_CLEAR)
          reject(err)
        })
    }),
    [A_CREATE_ROOM]: ({ commit }, room) => new Promise((resolve, reject) => {
      httpBackend.post(ROOMS_URL, room)
        .then(response => {
          commit(M_ROOM, response.data)
          resolve()
        })
        .catch(err => {
          commit(M_ROOM_CLEAR)
          reject(err)
        })
    }),
    [A_JOIN_ROOM]: ({ commit }, roomSlug) => new Promise((resolve, reject) => {
      httpBackend.patch(`${ROOMS_URL}/${roomSlug}/join`)
        .then(response => {
          commit(M_ROOM, response.data)
          resolve()
        })
        .catch(err => {
          commit(M_ROOM_CLEAR)
          reject(err)
        })
    }),
    [A_GET_ROOM]: ({ commit }, roomSlug) => new Promise((resolve, reject) => {
      httpBackend.get(`${ROOMS_URL}/${roomSlug}`)
        .then(response => {
          commit(M_ROOM, response.data)
          resolve()
        })
        .catch(err => {
          commit(M_ROOM_CLEAR)
          reject(err)
        })
    }),
    [A_GET_ROOM_RESULTS]: ({ commit }, roomSlug) => new Promise((resolve, reject) => {
      httpBackend.get(`${ROOMS_URL}/${roomSlug}/results`)
        .then(response => {
          commit(M_ROOM_RESULTS, response.data)
          resolve()
        })
        .catch(err => {
          commit(M_ROOM_RESULTS_CLEAR)
          reject(err)
        })
    }),
    [A_WS_CONNECT]: ({ getters, commit }, roomSlug) => new Promise((resolve) => {
      const ws = wsBackend(`rooms/${roomSlug}/?JWT=${getters[G_TOKEN]}`)
      commit(M_WS_CONNECTED, ws)
      ws.onmessage = (msg) => { commit(M_WS_ONMESSAGE, msg.data) }
      ws.onclose = () => { commit(M_WS_CLOSED) }
      resolve()
    }),
    [A_RATE_MOVIE]: ({ commit, getters }, ratingData) => new Promise((resolve, reject) => {
      httpBackend.post(RATINGS_URL, ratingData)
        .then(() => {
          getters[G_ROOM_UNRATED_MOVIES].shift()
          resolve()
        })
        .catch(err => { reject(err) })
    }),
    [A_SESSION_RESET]: ({ commit }) => new Promise((resolve) => {
      commit(M_TOKEN_CLEAR)
      commit(M_ROOM_CLEAR)
      commit(M_ROOM_RESULTS_CLEAR)
      resolve()
    })
  }
})
