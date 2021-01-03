<template>
    <v-navigation-drawer
      v-model="drawerShow"
      absolute
      dark
      temporary
      class="easeTransition"
      :class="{'fadeX1Opacity': !drawerShow}"
    >


      <v-list>
        <v-list-item
          v-for="item in itemsX"
          :key="item.title"
          link
          @click="swicthCore(item.uri)"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block @click="signOut">Logout</v-btn>
        </div>
      </template>


    </v-navigation-drawer>
</template>

<script>
export default {
    name: "NavDrawer",
    props: ['drawerBool'],
    data() {
        return {
            drawerShow: false,
            itemsX: [
            { title: 'Home', icon: 'dashboard', uri: 'Home'},
            { title: 'Settings', icon: 'settings' , uri: 'Settings'},
            { title: 'About', icon: 'info' , uri: 'About'},
            ],
        }
    },
    watch: {
        drawerBool(newValue) {
            this.drawerShow = newValue;
        }
    },
    methods:{
        async signOut() {
          let loginAttempt = await this.$store.dispatch("signOut");
          if (loginAttempt.error) {
            alert("Failed to logout, please refresh the page");
          }else{
              localStorage.removeItem('authtoken');
              this.$router.push('/login');
          }
        },
        swicthCore(val){
          this.$emit('to-switchCore', val)
        },
    }
}
</script>

<style scoped>
.easeTransition {
    -webkit-transition: all 0.3s ease-in-out;
    -moz-transition: all 0.3s ease-in-out;
    -ms-transition: all 0.3s ease-in-out;
    -o-transition: all 0.3s ease-in-out;
    transition: all 0.3s ease-in-out;
}
.fadeX1Opacity {
  opacity: 0;
}
</style>