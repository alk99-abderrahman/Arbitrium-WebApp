<template>
  <v-app>
    <v-content>
      <template v-if="showHeader">
      <v-card
        :style="minimizeBind ? 'max-width: 400px; max-height:600px;' :
        'max-width: 100%;max-height:100%;' "
        class="mx-auto"
        :class="minimizeBind ? 'mt-0 mb-0' : 'mt-0 mb-0' "
        >
        
      <Header v-on:to-minimizeBind="minimizeBindRecv"/>
        
      <router-view />
      </v-card>
      </template>

      <template v-else>
        <router-view />
      </template>

    </v-content>
  </v-app>
</template>

<script>
import Header from '@/components/Header.vue'

export default {
  name: 'App',
  components:{
    Header
  },
  methods: {
    minimizeBindRecv(val) {
      this.minimizeBind = val;
    }
  },
  data: () => ({
    minimizeBind: true,
    isLoggedIn: true
  }),

  created() {
    document.documentElement.style.overflow = 'hidden';
  },
  computed: {
    showHeader() {
      return this.$route.name !== 'Shell' && this.$store.state.auth.isConnected;
    }
  }
};
</script>
