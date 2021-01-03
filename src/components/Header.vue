<template>
  <div class="header">
        <v-system-bar color="red darken-2" dark>
          <v-spacer></v-spacer>
          <v-icon @click="minimizeBindEmit(true)">mdi-window-minimize</v-icon>
          <v-icon @click="minimizeBindEmit(false)">mdi-window-maximize</v-icon>
          <v-icon @click="signOut">mdi-logout</v-icon>
        </v-system-bar>

        <v-app-bar dark color="red">
          <v-app-bar-nav-icon @click="switchDrawer"></v-app-bar-nav-icon>
          <v-toolbar-title>{{ this.$store.state.currentTitle }}</v-toolbar-title>
          <v-spacer></v-spacer>

        </v-app-bar>
  </div>
</template>

<script>
export default {
    name: "Header",
    data() {
      return {
        minimizeBind: false,
      }
    },
    methods: {
        minimizeBindEmit(val) {
          this.$emit('to-minimizeBind', val);
        },
        async signOut() {
          let loginAttempt = await this.$store.dispatch("signOut");
          if (loginAttempt.error) {
            alert("Failed to logout, please refresh the page");
          }else{
              localStorage.removeItem('authtoken');
              this.$router.push('/login');
          }
        },
        switchDrawer() {
          this.$store.dispatch("switchDrawer");
        }
    },
    created() {
      this.$store.state.AppRendered = true;
    },
}
</script>

<style>

</style>