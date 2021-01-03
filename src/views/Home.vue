<template>

  <div class="home">
    
      <template v-if="AppRenderedData">
        
        <template v-if="showCore['Home']">
          <HomeCore v-on:to-switchCore="switchCore" />
        </template>
        <template v-else-if="showCore['Settings']">
          <SettingsCore v-on:to-switchCore="switchCore" />
        </template>
        <template v-else-if="showCore['About']">
          <AboutCore v-on:to-switchCore="switchCore" />
        </template>
      </template>

      <template v-else>
      <v-card
        :style="minimizeBind ? 'max-width: 400px; max-height:600px;' :
        'max-width: 100%;max-height:100%;' "
        class="mx-auto"
        :class="minimizeBind ? 'mt-0 mb-0' : 'mt-0 mb-0' "
        >
        
      <Header v-on:to-minimizeBind="minimizeBindRecv"/>
        
        <template v-if="showCore['Home']">
          <HomeCore v-on:to-switchCore="switchCore" />
        </template>
        <template v-else-if="showCore['Settings']">
          <SettingsCore v-on:to-switchCore="switchCore" />
        </template>
        <template v-else-if="showCore['About']">
          <AboutCore v-on:to-switchCore="switchCore" />
        </template>
      </v-card>
      </template>

  </div>

</template>

<script>
import HomeCore from '@/viewsCore/HomeCore.vue';
import SettingsCore from '@/viewsCore/SettingsCore.vue';
import AboutCore from '@/viewsCore/AboutCore.vue';
import Header from '@/components/Header.vue'

export default {
  name: 'Home',
  components:{
    HomeCore,
    SettingsCore,
    AboutCore,
    Header
  },
  methods: {
    minimizeBindRecv(val) {
      this.minimizeBind = val;
    },
    switchCore(val){
      let falsePage = Array.from(Object.keys(this.showCore));
      for(var j=0; j<falsePage.length; j++){
        this.showCore[falsePage[j]] = false
      }
      this.showCore[val] = true;
      this.$store.state.currentTitle = val;
    }
  },
  data: () => ({
    minimizeBind: true,
    isLoggedIn: true,
    AppRenderedData: false,
    showCore: {'Home': true, 'Settings': false, 'About': false}
  }),
  created() {
    this.AppRenderedData = this.$store.state.AppRendered;
  }
}
</script>
