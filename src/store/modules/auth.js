import axios from 'axios';
import qs from 'qs';


const state = {
    authtoken: "",
    isConnected: false,
    ErrorMsg: "",
    userName: ""
};

const getters = {
    getAuthtoken: (state) => state.authtoken,
    getIsConnected: (state) => state.isConnected,
    getErrorMsg: (state) => state.ErrorMsg,
    getUserName: (state) => state.userName,
};

const actions = {
    async signIn({commit}, loginInfo){
        try{
            let {userName, passWord} = loginInfo;
            let response = await axios.post("http://{API_FQDN}/login",
            qs.stringify({userName, passWord}));
            commit("m_signIn", response.data);
            return response.data;
        }catch(error){
            commit("m_ErrorMsg", error)
            return {error};
        }
    },
    async signOut({commit, state}){
        try{
            let userName = state.userName;
            let authToken = state.authtoken;
            let response = await axios.post("http://{API_FQDN}/logout",
            qs.stringify({userName, authToken}));
            commit("m_signOut");
            return response.data;
        }catch(error){
            commit("m_ErrorMsg", error)
            return {error};
        }
    }
};

const mutations = {
    m_signIn (state, responseData){
        state.authtoken = responseData.authToken;
        state.isConnected = true;
        state.userName = responseData.userName;
    },
    m_ErrorMsg: (state, error) => (state.ErrorMsg = error.reponse),
    m_signOut (state){
        state.authtoken = "";
        state.isConnected = false;
        state.userName = "";
    }
};

export default {
    state,
    getters,
    actions,
    mutations
}