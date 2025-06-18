import React, { useContext, useState, useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform, Linking, ScrollView } from 'react-native';
import { Item, List } from 'react-native-ui-devkit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDistance } from 'geolib';
import DeviceInfo from 'react-native-device-info';
import Geolocation from 'react-native-geolocation-service';
import RNSettings from 'react-native-settings';

import { GlobalContext } from '../../libs/globalContext';
import { Session } from '../../libs/session';
import { OneSignal } from 'react-native-onesignal';

const AccountSettings = (props) => {
    const { global, setGlobal } = useContext(GlobalContext);

    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false);
    const [loadingPermission, setLoadingPermission] = useState(null);

    const config = Session.getConfig();
    const stores = config?.stores?.filter((store) => (store?.hidden != true && store?.virtual == false && store?.services?.length > 0));

    useEffect(() => {
        Session.setGlobal({ ...global });
    }, [global]);

    const showLocationAlert = () => {
        Alert.alert(
            'Como ativar a localização?',
            'A localização do dispositivo está desativada.\n\nVocê precisa habilitar a localização antes de autorizar.\r\rSiga os passos abaixo:\n\n1ª Configurações\r2ª Privacidade e Segurança\r3º Serviços de Localização\n4º Ativar a localização.\n\nDepois que ativar, basta voltar aqui!'
        );
    }

    return (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
            contentContainerStyle={{ paddingBottom: insets.bottom ? insets.bottom : 15 }}>

            <Item
                data={{
                    title: Platform.OS == 'ios' ? 'Permitir' : 'Notificações',
                    description: Platform.OS == 'android' && 'As notificações são essenciais para uma melhor experiência de uso do aplicativo.',
                    loading: loadingPermission == 'notification',
                    disabled: loadingPermission == 'location' || loading,
                    switch: {
                        value: global.permissions.notifications,
                        onValueChange: async (value) => {
                            const deviceId = Session.getUniqueId();
                            setLoadingPermission('notification');

                            setTimeout(async () => {
                                if (value) {
                                    const permission = await OneSignal.Notifications.requestPermission(true);
                                    OneSignal.User.setLanguage('pt');

                                    if (permission == true || permission?.[0] == true) {
                                        OneSignal.User.addTags({ deviceId: deviceId, notifications: 'true' });
                                        global.permissions.notifications = true;
                                        setGlobal({ ...global });
                                        setLoadingPermission(null);
                                    } else {
                                        OneSignal.User.addTags({ deviceId: deviceId, notifications: 'true' });
                                        global.permissions.notifications = false;
                                        setGlobal({ ...global });
                                        setLoadingPermission(null);
                                    }
                                } else {
                                    OneSignal.User.addTags({ deviceId: deviceId, notifications: 'false' });
                                    global.permissions.notifications = false;
                                    setGlobal({ ...global });
                                    setLoadingPermission(null);
                                }
                            }, 500);
                        }
                    }
                }}
                header={'Notificações'}
                footer={'As notificações são essenciais para uma melhor experiência de uso do aplicativo.'}
            />

            <List
                data={[{
                    title: Platform.OS == 'ios' ? 'Permitir' : 'Localização',
                    description: Platform.OS == 'android' && 'Para ter acesso a distância da(s) loja(s), será necessário o acesso a sua localização.',
                    loading: loadingPermission == 'location',
                    disabled: loadingPermission == 'notification' || loading,
                    switch: {
                        value: global.permissions.location,
                        onValueChange: (value) => {
                            setLoadingPermission('location');

                            setTimeout(async () => {
                                if (value) {
                                    DeviceInfo.isLocationEnabled()
                                        .then(async (enabled) => {
                                            if (enabled) {
                                                if (Platform.OS == 'ios') {
                                                    const granted = await Geolocation.requestAuthorization('whenInUse');
                                                    if (granted === 'granted') {
                                                        Geolocation.getCurrentPosition(
                                                            (success) => {
                                                                const loc = [success.coords.latitude, success.coords.longitude];
                                                                global.permissions.location = true;
                                                                global.loc = loc;

                                                                config?.stores?.map((store) => {
                                                                    if (store?.place?.loc) {
                                                                        let distance = getDistance(
                                                                            { latitude: store?.place?.loc[0], longitude: store?.place?.loc[1] },
                                                                            { latitude: global.loc[0], longitude: global.loc[1] }
                                                                        );

                                                                        distance = (distance / 1000);
                                                                        distance = Math.round(distance);

                                                                        store.distance = distance;
                                                                    }
                                                                });

                                                                Session.setConfig(config);
                                                                setGlobal({ ...global });
                                                                setLoadingPermission(null);
                                                            },
                                                            (err) => {
                                                                global.permissions.location = false;
                                                                global.loc = [0, 0];

                                                                config?.stores?.map((store) => {
                                                                    store.distance = null;
                                                                });

                                                                Session.setConfig(config);
                                                                setGlobal({ ...global });
                                                                setLoadingPermission(null);

                                                            },
                                                            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
                                                    } else {
                                                        Alert.alert(
                                                            'Localização',
                                                            'Você precisa permitir que o aplicativo acesse sua localização.',
                                                            [
                                                                {
                                                                    text: 'Cancelar', style: 'cancel', onPress: async () => {
                                                                        global.permissions.location = false;
                                                                        global.loc = [0, 0];

                                                                        config?.stores?.map((store) => {
                                                                            store.distance = null;
                                                                        });

                                                                        Session.setConfig(config);
                                                                        setGlobal({ ...global });
                                                                        setLoadingPermission(null);
                                                                    }
                                                                },
                                                                {
                                                                    text: 'Configurar', style: 'destructive', onPress: async () => {
                                                                        Linking.openSettings();

                                                                        global.permissions.location = false;
                                                                        global.loc = [0, 0];

                                                                        config?.stores?.map((store) => {
                                                                            store.distance = null;
                                                                        });

                                                                        Session.setConfig(config);
                                                                        setGlobal({ ...global });
                                                                        setLoadingPermission(null);
                                                                    }
                                                                }
                                                            ]);

                                                    }
                                                } else if (Platform.OS == 'android') {
                                                    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                                                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                                                        Geolocation.getCurrentPosition(
                                                            (success) => {
                                                                const loc = [success?.coords?.latitude, success?.coords?.longitude];
                                                                global.permissions.location = true;
                                                                global.loc = loc;

                                                                config?.stores?.map((store) => {
                                                                    if (store?.place?.loc) {
                                                                        let distance = getDistance(
                                                                            { latitude: store?.place?.loc[0], longitude: store?.place?.loc[1] },
                                                                            { latitude: global.loc[0], longitude: global.loc[1] }
                                                                        );

                                                                        distance = (distance / 1000);
                                                                        distance = Math.round(distance);

                                                                        store.distance = distance;
                                                                    }
                                                                });

                                                                Session.setConfig(config);
                                                                setGlobal({ ...global });
                                                                setLoadingPermission(null);
                                                            },
                                                            (err) => {
                                                                global.permissions.location = false;
                                                                global.loc = [0, 0];

                                                                config?.stores?.map((store) => {
                                                                    store.distance = null;
                                                                });

                                                                Session.setConfig(config);
                                                                setGlobal({ ...global });
                                                                setLoadingPermission(null);
                                                            },
                                                            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
                                                    } else {
                                                        RNSettings.openSetting(RNSettings.ACTION_LOCATION_SOURCE_SETTINGS)
                                                            .then((result) => {
                                                                global.permissions.location = false;
                                                                global.loc = [0, 0];

                                                                config?.stores?.map((store) => {
                                                                    store.distance = null;
                                                                });

                                                                Session.setConfig(config);
                                                                setGlobal({ ...global });
                                                                setLoadingPermission(null);
                                                            });
                                                    }
                                                }
                                            } else {
                                                if (Platform.OS == 'ios') {
                                                    RNSettings.getSetting(RNSettings.LOCATION_SETTING)
                                                        .then(async (result) => {
                                                            if (result == RNSettings.ENABLED) {
                                                                let status = await Geolocation.requestAuthorization('whenInUse');
                                                                if (status === 'granted') {
                                                                    Geolocation.getCurrentPosition(
                                                                        (success) => {
                                                                            const loc = [success.coords.latitude, success.coords.longitude];
                                                                            global.permissions.location = true;
                                                                            global.loc = loc;

                                                                            config?.stores?.map((store) => {
                                                                                if (store?.place?.loc) {
                                                                                    let distance = getDistance(
                                                                                        { latitude: store?.place?.loc[0], longitude: store?.place?.loc[1] },
                                                                                        { latitude: global.loc[0], longitude: global.loc[1] }
                                                                                    );

                                                                                    distance = (distance / 1000);
                                                                                    distance = Math.round(distance);

                                                                                    store.distance = distance;
                                                                                }
                                                                            });

                                                                            Session.setConfig(config);
                                                                            setGlobal({ ...global });
                                                                            setLoadingPermission(null);
                                                                        },
                                                                        (err) => {
                                                                            global.permissions.location = false;
                                                                            global.loc = [0, 0];

                                                                            config?.stores?.map((store) => {
                                                                                store.distance = null;
                                                                            });

                                                                            Session.setConfig(config);
                                                                            setGlobal({ ...global });
                                                                            setLoadingPermission(null);

                                                                        },
                                                                        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
                                                                } else {
                                                                    global.permissions.location = false;
                                                                    global.loc = [0, 0];

                                                                    config?.stores?.map((store) => {
                                                                        store.distance = null;
                                                                    });

                                                                    Session.setConfig(config);
                                                                    setGlobal({ ...global });
                                                                    setLoadingPermission(null);
                                                                }
                                                            } else {
                                                                showLocationAlert();

                                                                global.permissions.location = false;
                                                                global.loc = [0, 0];
                                                                setGlobal({ ...global });
                                                                setLoadingPermission(null);
                                                            }
                                                        });
                                                } else if (Platform.OS == 'android') {
                                                    RNSettings.openSetting(RNSettings.ACTION_LOCATION_SOURCE_SETTINGS)
                                                        .then((result) => {
                                                            global.permissions.location = false;
                                                            global.loc = [0, 0];

                                                            config?.stores?.map((store) => {
                                                                store.distance = null;
                                                            });

                                                            Session.setConfig(config);
                                                            setGlobal({ ...global });
                                                            setLoadingPermission(null);
                                                        });
                                                }
                                            }
                                        });
                                } else {
                                    global.permissions.location = false;
                                    global.loc = [0, 0];

                                    config?.stores?.map((store) => {
                                        store.distance = null;
                                    });

                                    Session.setConfig(config);
                                    setGlobal({ ...global });
                                    setLoadingPermission(null);
                                }
                            }, 500);
                        }
                    }
                },
                stores?.length > 1 && {
                    title: 'Sugerir loja mais próxima',
                    description: Platform.OS == 'android' && 'Sempre quando você abrir o aplicativo iremos sugerir a loja mais próxima.',
                    disabled: !global.permissions.location,
                    switch: {
                        value: global.permissions.suggestion,
                        onValueChange: async (value) => {
                            global.permissions.suggestion = value;
                            setGlobal({ ...global });
                        }
                    }
                }
                ]}
                header={'Localização'}
                footer={'Para ter acesso a distância da(s) loja(s), será necessário o acesso a sua localização.'}
            />

            <Item data={{
                title: 'Acessar',
                description: Platform.OS == 'android' && 'Acesse a qualquer momento as configurações do aplicativo em seu dispositivo.',
                chevron: false,
                onPress: () => { Linking.openSettings(); }
            }} header={'Configurações no dispositivo'} footer={'Acesse a qualquer momento as configurações do aplicativo em seu dispositivo.'} headerToTitle />
        </ScrollView>
    );
}

export default AccountSettings;