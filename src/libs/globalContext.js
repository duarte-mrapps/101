import React, { useState, createContext } from 'react';
import { useSharedValue } from 'react-native-reanimated';

const defaultGlobal = {
    // todo: local data
    width: null,
    firstTime: true,
    suggestStoreSelection: false,
    showConfig: true,
    alwaysActive: false,
    qrCode: null,

    action: null,

    rated: {
        isRated: false,
        count: 5
    },

    permissions: {
        notifications: false,
        location: false,
        suggestion: false
    },
    loc: [0, 0],

    // todo: default data
    isConnected: true,
    loaded: false,
    loadedAds: false,
    uniqueId: 'null',
    timestamp: null,
    token: null,
    selectedTabAndroidTablet: 'MainTab'
}

const defaultProfile = {
    _id: null,
    keys: {
        private: null,
        public: null
    }
}

const defaultStore = {
    _id: null
}

const defaultUnderlayId = null;

export const GlobalContext = createContext({
    global: defaultGlobal,
    setGlobal: () => { },
    profile: defaultProfile,
    setProfile: () => { },
    store: defaultStore,
    setStore: () => { },
    underlayId: defaultUnderlayId
});

export const GlobalContextProvider = ({ children }) => {
    const [global, setGlobal] = useState(defaultGlobal);
    const [profile, setProfile] = useState(defaultProfile);
    const [store, setStore] = useState(defaultStore);
    const underlayId = useSharedValue(null);

    const setGlobalContext = (global) => { setGlobal(global); }
    const setProfileContext = (profile) => { setProfile(profile); }
    const setStoreContext = (store) => { setStore(store); }

    return (
        <GlobalContext.Provider
            value={{
                global,
                setGlobal: setGlobalContext,
                profile,
                setProfile: setProfileContext,
                store,
                setStore: setStoreContext,
                underlayId
            }}>
            {children}
        </GlobalContext.Provider>
    );
};