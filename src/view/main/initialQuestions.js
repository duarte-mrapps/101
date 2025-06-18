import React, { useContext, useState, useEffect, useLayoutEffect } from 'react';
import { Alert, PermissionsAndroid, View, Text, Platform, Linking, StyleSheet, ScrollView, StatusBar, Appearance } from 'react-native';
import { Button, Divider, Icon, IosOldVersion, Item, List, MediumFontSize, TitleFontSize } from 'react-native-ui-devkit';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OneSignal } from 'react-native-onesignal';
import DeviceInfo from 'react-native-device-info';
import Geolocation from 'react-native-geolocation-service';
import RNSettings from 'react-native-settings';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import NavigationBar from 'react-native-navbar-color';

import { GlobalContext } from '../../libs/globalContext';
import { Session } from '../../libs/session';
import { ActivityIndicator } from 'react-native';
import helper from '../../libs/helper';

const InitialQuestions = (props) => {
    const { navigation } = props;
    const { global, setGlobal } = useContext(GlobalContext);
    const { colors } = useTheme();

    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false);
    const [loadingPermission, setLoadingPermission] = useState(null);

    const theme = Appearance.getColorScheme();

    const config = Session.getConfig();
    const stores = config?.stores?.filter((store) => (store?.hidden != true && store?.virtual == false && store?.services?.length > 0));

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <>
                    {loading && <ActivityIndicator />}
                    {!loading && <Button link data={{
                        title: 'Concluir',
                        loading: (loading || loadingPermission != null),
                        disabled: loadingPermission != null,
                        onPress: () => {
                            global.showConfig = false;

                            Session.setGlobal(global);
                            setGlobal({ ...global });

                            navigation?.goBack();
                        }
                    }} />
                    }
                </>
        })
    }, [navigation, colors, loading, loadingPermission])

    useEffect(() => {
        if (Platform.OS == 'android') {
            StatusBar.setBackgroundColor(colors.background, true);
            StatusBar.setBarStyle(theme == 'dark' ? 'light-content' : 'dark-content', true);

            let soft = ExtraDimensions.getIsSoftMenuBar();
            let color = soft ? colors.background : helper.rgbToHex('rgb(0, 0, 0)');
            NavigationBar.setColor(color);
        }
    }, [colors, theme]);

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

            {IosOldVersion() && <Divider />}

            <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: IosOldVersion() ? 0 : 15, paddingHorizontal: 40 }}>
                <Icon name={Platform.OS == 'ios' ? 'cog-outline' : 'cog'} type={Platform.OS == 'ios' ? 'ionicons' : 'font-awesome5'} size={Platform.OS == 'ios' ? 55 : 45} color={Platform.OS == 'ios' ? colors.primary : colors.text} style={{ marginBottom: -10, marginVertical: Platform.OS == 'ios' ? 5 : 15 }} />

                <Divider />

                <Text style={[TitleFontSize(1.5), { fontWeight: '600', color: colors.text }]}>Configurações</Text>
                <Text style={[MediumFontSize(), { fontWeight: '400', color: colors.text, textAlign: 'center', marginTop: 5 }]}>Configure as notificações e a localização para uma melhor experiência.</Text>
            </View>

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
                data={[
                    {
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
                                                                    setGlobal({ ...global });
                                                                    setLoadingPermission(null);
                                                                },
                                                                (err) => {
                                                                    global.permissions.location = false;
                                                                    global.loc = [0, 0];
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
                                                                            setGlobal({ ...global });
                                                                            setLoadingPermission(null);
                                                                        }
                                                                    },
                                                                    {
                                                                        text: 'Configurar', style: 'destructive', onPress: async () => {
                                                                            Linking.openSettings();

                                                                            global.permissions.location = false;
                                                                            global.loc = [0, 0];
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
                                                                    const loc = [success.coords.latitude, success.coords.longitude];
                                                                    global.permissions.location = true;
                                                                    global.loc = [0, 0];
                                                                    setGlobal({ ...global });
                                                                    setLoadingPermission(null);
                                                                },
                                                                (err) => {
                                                                    global.permissions.location = false;
                                                                    global.loc = [0, 0];
                                                                    setGlobal({ ...global });
                                                                    setLoadingPermission(null);
                                                                },
                                                                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
                                                        } else {
                                                            RNSettings.openSetting(RNSettings.ACTION_LOCATION_SOURCE_SETTINGS)
                                                                .then((result) => {
                                                                    global.permissions.location = false;
                                                                    global.loc = [0, 0];
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
                                                                        global.permissions.location = true;
                                                                        global.loc = [0, 0];
                                                                        setGlobal({ ...global });
                                                                        setLoadingPermission(null);
                                                                    } else {
                                                                        global.permissions.location = false;
                                                                        global.loc = [0, 0];
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
                                                                setGlobal({ ...global });
                                                                setLoadingPermission(null);
                                                            });
                                                    }
                                                }
                                            });
                                    } else {
                                        global.permissions.location = false;
                                        global.loc = [0, 0];
                                        setGlobal({ ...global });
                                        setLoadingPermission(null);
                                    }
                                }, 500);
                            }
                        }
                    },
                    stores?.length > 1 && {
                        title: 'Sugerir loja mais próxima',
                        description: Platform.OS == 'android' && 'Sempre que você abrir o aplicativo iremos sugerir a loja mais próxima.',
                        disabled: (loadingPermission == 'notification' || loadingPermission == 'location') || loading || !global.permissions.location,
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
        </ScrollView>
    );
}

export default InitialQuestions;