import React, { useEffect, useContext, useCallback, Fragment } from 'react';
import { AppState, View, Alert, Linking } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { useNetInfo } from '@react-native-community/netinfo';
import { focusManager } from '@tanstack/react-query'
import { io } from 'socket.io-client';
import Rate, { AndroidMarket } from 'react-native-rate';
import SplashScreen from 'react-native-splash-screen';

import { GlobalContext } from './libs/globalContext';
import { getConfig } from './libs/api';
import { Constants, Session } from './libs/session';
import Routes from './routes';
import RoutesIpad from './routesIpad';
import DeviceInfo from 'react-native-device-info';

const RoutesInit = () => {
    const { global, setGlobal, store, setStore } = useContext(GlobalContext);
    const netInfo = useNetInfo();

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        const isConnected = netInfo.isConnected;
        (isConnected != null) && setGlobal(prevState => ({ ...prevState, isConnected }));

        (async () => {
            if (isConnected) {
                await getConfig(setGlobal, setStore);
                focusManager.setFocused(true);
            }
        })()
    }, [netInfo.isConnected]);

    useEffect(() => {
        if (!global?.firstTime || global?.suggestStoreSelection) {
            setTimeout(() => {
                SplashScreen?.hide();
            }, 100);
        }
    }, [global.firstTime, global.suggestStoreSelection])

    const initialize = useCallback(async () => {
        OneSignal.initialize(Constants.ONESIGNAL_APP_ID);

        let config = Session.getConfig();
        let store = Session.getStore();
        let g = Session.getGlobal();

        if (g) {
            global.width = g.width;

            if (g?.action != null) { global.action = g.action; }
            if (g?.showConfig != null) { global.showConfig = g.showConfig; }
            if (g?.firstTime != null) {
                global.firstTime = g.firstTime;
                if (global.firstTime) {
                    global.action = 'FirstTime';
                }
            }
            if (g?.permissions) { global.permissions = g.permissions; }
            if (g?.rated) { global.rated = g.rated; }
        } else {
            global.action = 'FirstTime';
        }

        if (!global.rated.isRated) {
            global.rated.count--;
        }

        let googlePackageName = null;
        let appleAppID = null;

        try { appleAppID = config?.appStore?.appleID; }
        catch { }

        try { googlePackageName = config?.googlePlay?.packageName; }
        catch { }

        if ((appleAppID && googlePackageName)
            && (!global.rated.isRated && global.rated.count <= 0)) {
            const options = {
                AppleAppID: appleAppID,
                GooglePackageName: googlePackageName,
                preferredAndroidMarket: AndroidMarket.Google,
                preferInApp: true,
                inAppDelay: 5.0,
                openAppStoreIfInAppFails: false
            };

            Rate.rate(options, (success) => {
                if (success) { global.rated.isRated = true; }
                else { global.rated.count = 10; }

                Session.setGlobal(global);
            })
        }

        global.loaded = true;

        if (!global?.firstTime) {
            setTimeout(() => {
                SplashScreen?.hide();
            }, 100);
        }

        Session.setGlobal(global);
        setStore({ ...store });
        setGlobal({ ...global });

        setTimeout(() => {
            after();
        }, 4000);
    });

    const after = () => {
        let config = Session.getConfig();
        if (config?._id) {
            checkVersion(config);

            let store = Session.getStore();
            if (store?.api?.socket) {
                const Socket = io(store?.api?.socket,
                    {
                        transports: ['websocket'],
                        jsonp: false,
                        reconnection: true,
                        reconnectionDelay: 500,
                        reconnectionAttempts: Infinity
                    });

                Socket?.disconnect();
                Socket?.connect();

                const reloadConfigFile = `reload_config_file ${config?._id}`
                Socket?.removeAllListeners(reloadConfigFile);
                Socket?.on(reloadConfigFile, (update) => {
                    if (update) {
                        getConfig(setGlobal, setStore);

                        // queryClient.invalidateQueries().then(() => {
                        //     setGlobal((prevState) => ({ ...prevState, timestamp: Date.now() }));
                        // })
                    }
                });

                return () => {
                    Socket?.disconnect();
                }
            }
        } else {
            setTimeout(() => {
                after();
            }, 4000);
        }
    }

    const checkVersion = async (config) => {
        let version = DeviceInfo.getVersion();
        const googlePlayUrl = config?.googlePlay;
        const appStoreUrl = config?.appStore;

        version = version?.replace(/\./g, '');
        version = parseInt(version);

        let link = '';
        let isUpToDate = false;

        if (Platform.OS == 'android') {
            let googlePlayVersion = googlePlayUrl?.version;
            googlePlayVersion = googlePlayVersion?.replace(/\./g, '');
            googlePlayVersion = parseInt(googlePlayVersion);

            link = googlePlayUrl?.url ?? '';
            isUpToDate = version < googlePlayVersion;
        }
        else if (Platform.OS == 'ios') {
            let appStoreVersion = appStoreUrl?.version;
            appStoreVersion = appStoreVersion?.replace(/\./g, '');
            appStoreVersion = parseInt(appStoreVersion);

            link = appStoreUrl?.url ?? '';
            isUpToDate = version < appStoreVersion;
        }

        if (isUpToDate) {
            Alert.alert('Aviso', `A uma nova versão do aplicativo ${config?.name} para atualização.`,
                [
                    {
                        text: 'Atualizar', onPress: () => {
                            Linking.canOpenURL(link).then(async (supported) => {
                                supported && Linking.openURL(link);
                            }, () => { });
                        }
                    },
                ]);
        }
    }


    useEffect(() => {
        const appState = AppState.addEventListener('change', _handleAppStateChange);

        return () => {
            appState.remove();
        };
    }, []);

    const _handleAppStateChange = async (nextAppState) => {
        if (nextAppState == 'active') {
            getConfig(setGlobal, setStore);
        }

        focusManager.setFocused(nextAppState == 'active');
    }

    return global.loaded ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
            <RoutesIpad />
            <Routes />
        </View>
    ) : (<Fragment />);
}
export default RoutesInit;