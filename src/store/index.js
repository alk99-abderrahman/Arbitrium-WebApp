import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth.js'
import core from './modules/core.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentTitle: 'Home',
    drawerShow: false,
    AppRendered: false
  },
  actions: {
    switchDrawer({commit}) {
      commit('m_switchDrawer');
    }
  },
  mutations:{
    m_switchDrawer:(state) => (state.drawerShow = !state.drawerShow)
  },
  modules: {
    auth,
    core
  }
})
