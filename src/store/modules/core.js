import axios from 'axios'
//import qs from 'qs'


const state = {
    devicesID: [],
    devicesIP: [],
    devicesPlatform: [],
    devicesThreadID: [],
    activeTasks: [],
    shellReturns: [],
    errorMsg: '',
    boolDownload: false,
    allProxies: [],
    allClearTasks: [],
    proxyState: [],
    allNetworks: [],
    AllportScans: [],
    AllGenMods: [],
    settingsDefault: {
        portRange: "1-100",
        lanRange: "1-24"
    }
};

const getters = {
    
};

const actions = {
    async getDevices({commit, rootState}){
        try{
            let tokenAuth = rootState.auth.authtoken;
            let response = await axios.get(`http://{API_FQDN}/livedevices?token=${tokenAuth}`);
            let parsedRes = response.data;
            commit("m_devicesList", parsedRes);
            return parsedRes;
        }catch(error){
            commit("m_ErrorMsg", error);
            return {error};
        }
    },
    /* eslint-disable */
    async pingTask({commit, rootState} ,taskInfo){
        let tokenAuth = rootState.auth.authtoken;
        let {uuid,  taskID, ThreadID} = taskInfo;
        let url = `http://{API_FQDN}/pingtask?hashid=${uuid}&token=${tokenAuth}&taskid=${ThreadID}x${taskID}`;
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        let response = await (async()=>{
            let Resp = {data:'0'};
            while(Resp.data=='0'){
                Resp = await axios.get(url);
                await delay(5000);
            }
            return Resp;
        })()

        return response.data;
    },
    /* eslint-enable */
    async addTask({commit, rootState}, taskParams){
        try{
            let tokenAuth = rootState.auth.authtoken;
            let {uuid, cmd, ThreadID} = taskParams;
            cmd = btoa(cmd);
            let taskID = await axios.get(`http://{API_FQDN}/addtask?hashid=${uuid}&cmd=${cmd}&token=${tokenAuth}`);
            let taskInfo = {uuid,  taskID: taskID.data, ThreadID};
            let shellResp = await this.dispatch('pingTask', taskInfo);
            commit("m_shellResp", uuid, cmd, shellResp);
            return shellResp;
        }catch(error){
            commit("m_ErrorMsg", error);
            return {error};
        }
    },
    async pushDownload({commit, rootState}, downParams){
        try{
            let {uuid, url, output} = downParams;
            let url_b64 = btoa(url);
            let tokenAuth = rootState.auth.authtoken;
            let boolDownload = await axios.get(`http://{API_FQDN}/pushdownload?hashid=${uuid}&token=${tokenAuth}&url=${url_b64}&output=${output}`);
            commit("m_pushDownload", boolDownload.data);
            return boolDownload.data;
        }catch(error){
            commit("m_ErrorMsg", error);
            return {error};
        }
    },
    async runProxy({commit, rootState}, deviceInfo) {
        try{
            let {uuid, ThreadID} = deviceInfo;
            let tokenAuth = rootState.auth.authtoken;
            let proxySet = await axios.get(`http://{API_FQDN}/runproxy?hashid=${uuid}&token=${tokenAuth}&threadid=${ThreadID}`);
            commit("m_proxySettings", {uuid, settings: proxySet.data});
            return proxySet.data;
        }catch(error){
            commit("m_ErrorMsg", error);
            return {error};
        }
    },
    async runmodule({commit, state, rootState}, deviceInfo) {
        let tokenAuth = rootState.auth.authtoken;
        try{
            if (deviceInfo.moduleID=='1'){
                let {uuid, ThreadID, moduleID} = deviceInfo;
                let argv = btoa(" " +state.settingsDefault.lanRange)
                        .replace(/=/g,"equal")
                        .replace(/\//g,"slash")
                        .replace(/\+/g,"plus");
                let lanSchema = await axios.get(`http://{API_FQDN}/runmodule?hashid=${uuid}&token=${tokenAuth}&threadid=${ThreadID}&module=${moduleID}&args=${argv}`);
                commit('m_discoverLAN', {uuid, schema: lanSchema.data});
                return lanSchema.data;
            }else if(deviceInfo.moduleID=='2'){
                let {uuid, ThreadID, moduleID, LanIP} = deviceInfo;
                let argv = btoa(LanIP + " " +state.settingsDefault.portRange)
                        .replace(/=/g,"equal")
                        .replace(/\//g,"slash")
                        .replace(/\+/g,"plus");
                let portResp = await axios.get(`http://{API_FQDN}/runmodule?hashid=${uuid}&token=${tokenAuth}&threadid=${ThreadID}&module=${moduleID}&args=${argv}`);
                commit('m_openPorts', {uuid, LanIP, ports: portResp.data});
                return portResp.data;
            }else{
                let {uuid, ThreadID, moduleID} = deviceInfo;
                let genericModule = await axios.get(`http://{API_FQDN}/runmodule?hashid=${uuid}&token=${tokenAuth}&threadid=${ThreadID}&module=${moduleID}`);
                commit('m_genericModule', {uuid, data: genericModule.data});
                return genericModule.data;
            }
        }catch(error){
            commit('m_ErrorMsg', error);
            return {error};
        }
    },
    async runClear({commit, rootState}, deviceInfo) {
        try{
            let {uuid} = deviceInfo;
            let tokenAuth = rootState.auth.authtoken;
            let clearResp = await axios.get(`http://{API_FQDN}/cleartasks?hashid=${uuid}&token=${tokenAuth}`);
            commit("m_Cleared", {uuid, clearState: clearResp.data});
            return clearResp.data;
        }catch(error){
            commit("m_ErrorMsg", error);
            return {error};
        }
    },
    async killProxy({commit, rootState}, deviceInfo) {
        try{
            let {uuid} = deviceInfo;
            let tokenAuth = rootState.auth.authtoken;
            let clearResp = await axios.get(`http://{API_FQDN}/killproxy?hashid=${uuid}&token=${tokenAuth}`);
            commit("m_clearProxy", {uuid, clearState: clearResp.data});
            return clearResp.data;
        }catch(error){
            commit("m_ErrorMsg", error);
            return {error};
        }
    },

};

const mutations = {
    m_ErrorMsg: (state, error) => (state.errorMsg = error.response.data),
    m_shellResp (state, uuid, cmd, shellResp) {
        state.shellReturns.push([uuid, cmd, shellResp])
    },
    m_pushDownload: (state, boolDownload) => (state.boolDownload = boolDownload),
    m_Cleared: (state, clearStateObj) => (state.allClearTasks[clearStateObj.uuid] = clearStateObj.clearState),
    m_clearProxy:  (state, clearStateObj) => (state.proxyState[clearStateObj.uuid] = clearStateObj.clearState),
    m_proxySettings: (state, proxySetObj) => (state.allProxies[proxySetObj.uuid] = proxySetObj.settings),
    m_discoverLAN: (state, discoverLanObj) => (state.allNetworks[discoverLanObj.uuid] = discoverLanObj.schema),
    M_genericModule: (state, genericModObj) => (state.AllGenMods[genericModObj.uuid] = genericModObj.data),
    m_openPorts(state, portScanObj){
        let portSctruct = [];
        portSctruct[portScanObj.LanIP] = portScanObj.ports;
        state.AllportScans[portScanObj.uuid] = portSctruct;
    },
    m_devicesList(state, responseData){
        state.devicesID = [];
        state.devicesIP = []; 
        state.devicesPlatform = [];
        state.devicesThreadID = [];
        state.activeTasks = [];
        for(var i=0; i<responseData.length; i++){
            state.devicesID.push(responseData[i][0]);
            state.devicesIP.push(responseData[i][1]);
            state.devicesPlatform.push(responseData[i][2]);
            state.devicesThreadID.push(responseData[i][3]);
            state.activeTasks.push([]);
            if (responseData[i].length>3){
                var j;
                for(j=0;j<responseData[i][4].length;j++){
                    if(responseData[i][4][j].indexOf('pending')!==-1){
                        state.activeTasks[i].push(responseData[i][4][j]);
                    }
                }
            }

        }
    }
};

export default {
    state,
    getters,
    actions,
    mutations
}

