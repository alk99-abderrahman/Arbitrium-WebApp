<template>
<v-container>

  <VueTerminal :intro="intro"
                console-sign="user@zombie:~$"
                allow-arbitrary
                height="500px"
                @command="onCliCommand">
    </VueTerminal>
    <v-overlay :value="overlay">
      <v-card>
            <v-btn tile color="red" @click="closeWin">
              <v-icon left>info</v-icon> Device is no longer connected
            </v-btn>
      </v-card>
        
    </v-overlay>

</v-container>
</template>

<script>
import VueTerminal from 'vue-terminal-ui'

export default {
    name: "Shell",
    components: {
        VueTerminal
    },
    props: ['uuid', 'threadid'],
    methods: {
        closeWin(){
            window.close();
        },
        async runShell(cmd){
          let taskInfo = {uuid: this.$route.params.uuid, cmd, ThreadID:this.$route.params.threadid};
          let ShellResp = await this.$store.dispatch('addTask', taskInfo);
          return ShellResp;
        },
        async getDevices(){
          let devicesJSON = await this.$store.dispatch('getDevices');
          return devicesJSON;
        },
        async onCliCommand(data, resolve, reject){
            if (data.text !== undefined){
                this.getDevices()
                .then(()=>{
                    if(this.$store.state.core.devicesID.indexOf(this.$route.params.uuid)===-1){
                        this.overlay = true;
                    }
                })
                let finalCMD = data.text;
                if (this.$route.params.PSbool === 'ps'){
                    finalCMD = 'powershell -C "' + finalCMD.replace(/"/g, '\\"') + '"';
                }
                let respShell = await this.runShell(finalCMD);
                resolve(respShell);
            }else{
                reject('ErrorReject');
            }
        },
        
    },
    data: ()=>({
        overlay: false
    }),
    created() {
        let itemStr = localStorage.getItem('authtoken');
        const itemStrJ = JSON.parse(itemStr);
        this.$store.state.auth.authtoken = itemStrJ.value;
    },
    watch: {
        overlay: function(val){
            if (val==true){
                window.addEventListener("keypress", e => {
                    e.preventDefault();
                });
            }
        }
    },
}
</script>

<style>
.cmd_out {
    white-space: pre-line
}
</style>