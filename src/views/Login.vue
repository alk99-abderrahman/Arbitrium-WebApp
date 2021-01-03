<template>
    <v-container full-height fluid>
        <v-row align="center" justify="center">
            <v-card width="400px" class="mt-5 mx-a" :loading="showLoading">
                <v-toolbar color="purple darken-2" dark flat>
                    <v-toolbar-title>
                        <strong>Sign In</strong>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-card-text>
                    <v-form>
                        <v-text-field v-model="loginInfo.userName" label="Username" type="text" 
                        prepend-icon="mdi-account-circle"/>
                        <v-text-field v-model="loginInfo.passWord" label="Password" :type="showPass ? 'text' : 'password'" 
                        prepend-icon="mdi-lock"
                        :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showPass = ! showPass"
                        v-on:keyup.enter="signInVue"
                        />
                    </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-switch :label="`Dark Theme`" v-model="goDark" color="purple darken-2"></v-switch>
                    <v-spacer></v-spacer>

                    <v-btn
                    :disabled="showLoading"
                    class="white--text"
                    color="purple darken-2"
                    v-on:click="signInVue"
                    >
                    LOGIN
                    </v-btn>

                </v-card-actions>
            </v-card>
        </v-row>

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


    </v-container>
</template>

<script>

export default {
    name: "Login",
    components: {
        
    },
    data(){
        return {
            showPass: false,
            loginInfo: {
                userName: "",
                passWord: ""
            },
            goDark: true,
            showLoading: false,
            snackbar: false,
            snackbarText: "Login failed"
        }
    },
    methods: {
        setWithExpiry(value, ttl){
            const now = new Date()
            const item = {
                value: value,
                expiry: now.getTime() + ttl*1000
            }
            return JSON.stringify(item)
        },
        async signInVue(){
            this.showLoading = true;
            let loginAttempt = await this.$store.dispatch("signIn", this.loginInfo);
            if (loginAttempt.error) {
                this.showLoading = false;
                this.snackbar = true;
                if (loginAttempt.error.response.status===401){
                    this.snackbarText = "Username or/and password is not corrected";
                }else{
                    this.snackbarText = "Internal error";
                }
            }else{
                localStorage.setItem('authtoken',
                    this.setWithExpiry(loginAttempt.authToken, 3600)
                );
                this.$router.push('/');
            }
        }
    },
    watch:{
        goDark(){
            this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        }
    }
}
</script>

<style>

</style>