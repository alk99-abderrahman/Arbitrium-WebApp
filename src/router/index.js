import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Shell from '../views/Shell.vue'
import store from '../store'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'ArbitriumSploit - Home'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: {
      title: 'ArbitriumSploit - About'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'ArbitriumSploit - Login'
    }
  },
  {
    path: '/shell/:uuid/:threadid/:PSbool',
    name: 'Shell',
    component: Shell,
    meta: {
      title: 'ArbitriumSploit - Shell'
    },
    props: true
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})



function getWithExpiry(key) {
	const itemStr = localStorage.getItem(key)
	if (!itemStr) {
		return null
	}
	const item = JSON.parse(itemStr)
	const now = new Date()
	if (now.getTime() > item.expiry) {
		localStorage.removeItem(key)
		return null
	}
	return item.value
}


router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = getWithExpiry('authtoken');
  if (loggedIn){
    store.commit("m_signIn", {authToken: loggedIn, userName: ''});
  }
  if (to.path==='/login' && loggedIn){
    return next('/');
  }else if (authRequired && !loggedIn) {
    return next('/login');
  }
  next();
})


const DEFAULT_TITLE = 'ArbitriumSploit';
router.afterEach((to) => {
    Vue.nextTick(() => {
        document.title = to.meta.title || DEFAULT_TITLE;
    });
});

export default router
