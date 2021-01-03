<template>

    <v-card>
      <NavDrawer :drawerBool="this.$store.state.drawerShow"
      v-on:to-signOut="signOut"
      v-on:to-switchCore="switchCore"
      />
      <v-container grid-list-lg>
        <v-row dense class="card-body" fluid align="start">
          <v-col
            v-for="(item, i) in mainSettings"
            :key="i"
            cols="12"
          >
            <v-card
              dark
              class="justify-center"
            >
              <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                  <v-card-title
                    class="headline"
                    v-text="item.SettingTitle"
                  ></v-card-title>
                
                <v-card-subtitle v-html="item.description"></v-card-subtitle>

                  <v-card-text  class="text-center">
                    <v-row flex>
                      <v-col>
                      <v-text-field
                      type="number"
                      placeholder="1"
                      v-model="item.min"
                      :min="item.absMin"
                      :oninput="`if(this.value > ${item.max}) this.value = ${item.max};`"
                      :onkeyup="`if(this.value > ${item.max}) this.value = ${item.max};`"
                      >
                      </v-text-field>
                      </v-col>
                      <v-col>
                      <v-text-field
                      type="number"
                      placeholder="100"
                      v-model="item.max"
                      :max="item.absMax"
                      :oninput="`if(this.value < ${item.min}) this.value = ${item.min};`"
                      :onkeyup="`if(this.value < ${item.min}) this.value = ${item.min};`"
                      >
                      </v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-btn
                    color="primary"
                    text
                    @click="saveSettings(item)"
                  >
                    Save & Apply
                  </v-btn>
                  </v-card-actions>
                </div>
              </div>
            </v-card>
          </v-col>

        </v-row>
      </v-container>

    <v-snackbar
      v-model="snackbar"
    >
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="pink"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    </v-card>
</template>

<script>
import NavDrawer from '@/components/NavDrawer.vue';

export default {
  name: 'SettingsCore',
  components:{
    NavDrawer,

  },
  methods: {
        switchCore(val){
          this.$emit('to-switchCore', val);
        },
        signOut() {
          this.$emit('to-signOut');
        },
        saveSettings(val){
          this.snackbar = true;
          this.$store.state.core.settingsDefault[val.setID] = val.min +"-"+ val.max;
          setTimeout(() => this.snackbar = false, 2000);
        }

  },

  data: () => ({
    mainSettings: [{
      setID: "portRange",
      SettingTitle: "Port scan range", 
      description: "This feature allows you to identify services that are running on a Local device",
      min: 1,
      max: 100,
      absMin: 1,
      absMax: 65535
    },
    {
      setID: "lanRange",
      SettingTitle: "LAN scan range",
      description: "Ex: check hosts from 192.168.1.1 to 192.168.1.100",
      min: 0,
      max: 24,
      absMin: 0,
      absMax: 255
    }
    ],
    snackbar: false,
    snackbarText: 'Settings has been updated'
  }),

}
</script>

<style scoped>
.scroll-y {
   overflow-y: auto
}

.card-body {
  overflow-y: scroll;
  max-height: 83vh;
}
</style>