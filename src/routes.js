import React, { Fragment, useContext, useEffect } from 'react';
import { Appearance, DeviceEventEmitter, Platform, View, StatusBar, Dimensions, Linking, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import NavigationBar from 'react-native-navbar-color';
import DeviceInfo, { isTablet } from 'react-native-device-info';
import analytics from '@react-native-firebase/analytics';

import { GlobalContext } from './libs/globalContext';

import { Icon, IosOldVersion, useColors } from 'react-native-ui-devkit';
import { Session } from './libs/session';

import LoadingConfig from './view/main/loadingConfig';
import InitialQuestions from './view/main/initialQuestions';
import Main from './view/main';
import Search from './view/search';
import Account from './view/account';
import AboutUs from './view/common/aboutUs';
import AboutUsStores from './view/common/aboutUsStores';
import AboutUsView from './view/common/aboutUsView';
import Detail from './view/search/detail';
import DetailVideo from './view/search/detailVideo';
import AdsFilter from './view/search/filter';
import AdsFilterItem from './view/search/filter/item';
import AccountSettings from './view/account/settings';
import Favorites from './view/account/favorites';
import FastImage from 'react-native-fast-image';

import Service from './view/common/service';
import ServiceServices from './view/common/service/services';
import SelectVehicle from './view/common/service/selectVehicle';
import FipeTable from './view/common/service/fipe';
import Fipe from './view/common/service/fipe/selectItem';

import Stores from './view/common/stores';
import helper from './libs/helper';
import QrCode from './view/common/qrcode';
import { OneSignal, NotificationWillDisplayEvent } from 'react-native-onesignal';


import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { DialogProvider } from './components/DialogAndroid';

// todo: Begin Main
const MainStack = (props) => {
    const { store } = useContext(GlobalContext);

    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,
                headerLargeTitle: isTablet() || !IosOldVersion(),
                headerStyle: {
                    backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                },
                headerLargeStyle: {
                    backgroundColor: colors.background
                }
            }}>
            <Stack.Screen name="Main" component={Main} options={{ title: store?.company ? store?.company : '...' }} initialParams={{ forceQuit: false }} />
            {Platform.OS == 'ios' && <Stack.Screen name="SearchHome" component={Search} options={{ title: 'Estoque', headerShown: true, headerLargeTitle: false, headerBackTitle: 'Voltar' }} initialParams={{ ...props?.route?.params, nofilters: true }} />}
        </Stack.Navigator>
    );
}

const SearchHomeStack = (props) => {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,
                headerLargeTitle: isTablet() || !IosOldVersion(),
                headerStyle: {
                    backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                },
                headerLargeStyle: {
                    backgroundColor: colors.background
                }
            }}>
            <Stack.Screen name="SearchHomeMain" component={Search} options={{ title: 'Estoque', headerShown: true, headerLargeTitle: false, headerBackTitle: 'Voltar' }} initialParams={{ ...props?.route?.params, nofilters: true }} />
        </Stack.Navigator>
    );
}
// todo: End Main

// todo: Search
function SearchStack(props) {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,
                headerLargeTitle: isTablet() || !IosOldVersion(),
                headerStyle: {
                    backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                },
                headerLargeStyle: {
                    backgroundColor: colors.background
                }
            }}>
            <Stack.Screen name="Search" component={Search} options={{ title: 'Estoque' }} initialParams={props?.route?.params} />
            {Platform.OS == 'ios' && !DeviceInfo.isTablet() && <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ title: 'Configurações', headerLargeTitle: false }} />}
            {Platform.OS == 'ios' && !DeviceInfo.isTablet() && <Stack.Screen name="Favorites" component={Favorites} options={{ title: 'Favoritos', headerLargeTitle: false }} />}
        </Stack.Navigator>
    );
}

const SettingsStack = (props) => {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,

                ...Platform.OS == 'android' && {
                    headerStyle: {
                        backgroundColor: colors.android.headerBackground
                    }
                },

                headerLargeStyle: {
                    backgroundColor: colors.background
                },
            }}>

            <Stack.Screen name="Account" component={Account} options={{ title: 'Loja', headerLargeTitle: !IosOldVersion() }} />
            {Platform.OS == 'ios' && <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ title: 'Configurações', headerLargeTitle: false }} />}
            {Platform.OS == 'ios' && <Stack.Screen name="Favorites" component={Favorites} options={{ title: 'Favoritos', headerLargeTitle: false }} />}
            {Platform.OS == 'ios' && <Stack.Screen name="AboutUs" component={AboutUs} options={{ title: 'Sobre nós' }} initialParams={props?.route?.params} />}
            {Platform.OS == 'ios' && <Stack.Screen name="AboutUsStores" component={AboutUsStores} options={{ title: 'Lojas' }} initialParams={props?.route?.params} />}
            {Platform.OS == 'ios' && <Stack.Screen name="AboutUsView" component={AboutUsView} options={{ title: '' }} initialParams={props?.route?.params} />}
        </Stack.Navigator>
    );
}

const AccountAboutUsStack = (props) => {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,
                headerLargeTitle: false,
                headerStyle: {
                    backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                },
                headerLargeStyle: {
                    backgroundColor: colors.background
                }
            }}>
            <Stack.Screen name="AccountAboutUsStack" component={AboutUs} options={{ title: 'Sobre nós' }} initialParams={props?.route?.params} />
            <Stack.Screen name="AboutUsView" component={AboutUsView} options={{ title: '' }} initialParams={props?.route?.params} />
        </Stack.Navigator>
    );
}

const AccountAboutUsStoresStack = (props) => {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,
                headerLargeTitle: false,
                headerStyle: {
                    backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                },
                headerLargeStyle: {
                    backgroundColor: colors.background
                }
            }}>
            <Stack.Screen name="AccountAboutUsStoresStack" component={AboutUsStores} options={{ title: 'Lojas' }} initialParams={props?.route?.params} />
        </Stack.Navigator>
    );
}

function AccountSettingsStack(props) {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,
                headerLargeTitle: !isTablet() && !IosOldVersion(),
                headerStyle: {
                    backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                },
                headerLargeStyle: {
                    backgroundColor: colors.background
                }
            }}>
            <Stack.Screen name="AccountSettingsStack" component={AccountSettings} options={{ title: 'Configurações' }} />
        </Stack.Navigator>
    );
}

const ServiceStack = (props) => {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,
                headerLargeTitle: !isTablet() && !IosOldVersion(),
                headerStyle: {
                    backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                },
                headerLargeStyle: {
                    backgroundColor: colors.background
                },
            }}>
            <Stack.Screen name="ServiceStack" component={Service} options={{ title: '', headerLargeTitle: false }} initialParams={props?.route?.params} />
            <Stack.Screen name="ServiceServices" component={ServiceServices} options={{ title: '', headerLargeTitle: false }} initialParams={props?.route?.params} />
            <Stack.Screen name="Search" component={Search} options={{ title: 'Estoque', headerBackTitle: 'Voltar', headerLargeTitle: false }} initialParams={{ list: true }} />
            <Stack.Screen name="SelectVehicle" component={SelectVehicle} options={{ headerBackTitle: 'Voltar', headerLargeTitle: false }} />
            <Stack.Screen name="Fipe" component={Fipe} options={{ headerBackTitle: 'Voltar', headerLargeTitle: false }} />
        </Stack.Navigator>
    );
}

function FavoritesStack(props) {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,
                headerLargeTitle: !isTablet() && !IosOldVersion(),
                headerStyle: {
                    backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                },
                headerLargeStyle: {
                    backgroundColor: colors.background
                }
            }}>
            <Stack.Screen name="FavoritesStack" component={Favorites} options={{ title: 'Favoritos' }} />
        </Stack.Navigator>
    );
}
// // todo: End Account

const FipeTableStack = (props) => {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,
                headerLargeTitle: !isTablet() && !IosOldVersion(),
                headerStyle: {
                    backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                },
                headerLargeStyle: {
                    backgroundColor: colors.background
                },
            }}>
            <Stack.Screen name="FipeTableStack" component={FipeTable} options={{ title: '', headerLargeTitle: false }} initialParams={props?.route?.params} />
            <Stack.Screen name="Fipe" component={Fipe} options={{ headerBackTitle: 'Voltar', headerLargeTitle: false }} />
        </Stack.Navigator>
    );
}

const LoadingConfigStack = (props) => {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="LoadingConfigStack" component={LoadingConfig} options={{ title: '', headerLargeTitle: false }} initialParams={props?.route?.params} />
        </Stack.Navigator>
    );
}

const InitialQuestionsStack = (props) => {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                title: null,
                headerBackVisible: false,
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: colors.background
                }
            }}>
            <Stack.Screen name="InitialQuestions" component={InitialQuestions} options={{ title: '', headerLargeTitle: false }} initialParams={props?.route?.params} />
        </Stack.Navigator>
    );
}

const StoresStack = (props) => {
    useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShadowVisible: Platform.OS == 'ios',
                headerLargeTitleShadowVisible: false,
                headerStyle: { backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground },
                headerLargeStyle: { backgroundColor: colors.background }
            }}>
            <Stack.Screen name="StoresStack" component={Stores} options={{ title: "Lojas" }} initialParams={props?.route?.params} />
        </Stack.Navigator>
    );
}

const Tabs = (props) => {
    const { navigation } = props;
    const { global, store } = useContext(GlobalContext);
    const colors = useColors();
    const { width } = Dimensions.get('screen');

    const theme = Appearance.getColorScheme();

    const config = Session.getConfig();
    const Tab = createBottomTabNavigator();

    useEffect(() => {
        const navigateListener = DeviceEventEmitter.addListener('navigate', navigateHandleEvent);

        return () => {
            navigateListener.remove();
        }
    }, []);

    useEffect(() => {
        const navigateListener = DeviceEventEmitter.addListener('navigationGoBack', (e) => {
            navigation.goBack()
        });

        return () => {
            navigateListener.remove();
        }
    }, []);

    useEffect(() => {
        if (Platform.OS == 'android') {
            StatusBar.setBackgroundColor(theme == 'dark' ? '#000' : colors.background, true);
            StatusBar.setBarStyle(theme == 'dark' ? 'light-content' : 'dark-content', true);

            let soft = ExtraDimensions.getIsSoftMenuBar();
            let color = soft ? colors.background : helper.rgbToHex('rgb(0, 0, 0)');
            NavigationBar.setColor(color);
        }
    }, [colors, theme]);

    const canGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            canGoBack();
        }
    }

    const navigateHandleEvent = (e) => {
        if (Platform.OS == 'android' && isTablet()) { navigation?.canGoBack() && navigation?.goBack(); }

        if (isTablet() &&
            (e.screen == 'MainTab'
                || e.screen == 'SearchTab'
                || e.screen == 'Favorites'
                || e.screen == 'AboutUs'
                || e.screen == 'AboutUsStores'
                || e.screen == 'AccountSettings')
        ) {
            canGoBack();
            navigation.setParams({ screen: e.screen, params: e.params });
        } else {
            navigation.navigate(e.screen, e.params);
        }
    }

    const openPush = (data, title) => {
        const ads = Session.getAds(store?._id)

        if (!data?.length || !ads?.length) return

        const selectedAds = data
            .map((item) => ads.find((ad) => ad?.id == item?.value))
            .filter(Boolean)

        if (selectedAds.length === 1) {
            navigation.navigate('Detail', { ad: selectedAds[0] })
        } else if (selectedAds.length > 1) {
            const adIds = selectedAds.map((ad) => ad.id)
            navigation.navigate('SearchHome', { type: 'ads', ads: adIds, title })
        }
    }

    /**
     * 
     * @param {NotificationWillDisplayEvent} notificationWillDisplayEvent 
     */
    const showForegroundNotification = async (notificationWillDisplayEvent) => {
        const { notification } = notificationWillDisplayEvent
        const ads = JSON.stringify(notification?.additionalData?.ads)
        const title = notification?.additionalData?.adsTitle

        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        });

        await notifee.displayNotification({
            title: notification?.title,
            body: notification?.body,
            data: { ads, externalLink: notification?.launchURL ?? '', adsTitle: title },
            android: {
                channelId,
                importance: AndroidImportance.HIGH
            },
        });
    }



    const displayedNotifications = new Set()
    const onClickListener = (event) => {
        const data = JSON.parse(event?.notification?.additionalData?.ads)
        const title = event?.notification?.additionalData?.adsTitle
        openPush(data, title)
    }

    const onForegroundDisplay = async (event) => {
        const notificationId = event.notification.notificationId

        if (displayedNotifications.has(notificationId)) {
            return
        }

        displayedNotifications.add(notificationId)
        await showForegroundNotification(event)
    }

    useEffect(() => {
        OneSignal.Notifications.addEventListener('click', onClickListener)
        OneSignal.Notifications.addEventListener('foregroundWillDisplay', onForegroundDisplay)

        return () => {
            OneSignal.Notifications.removeEventListener('click', onClickListener)
            OneSignal.Notifications.removeEventListener('foregroundWillDisplay', onForegroundDisplay)
        }
    }, [])

    useEffect(() => {
        return notifee.onForegroundEvent(({ type, detail }) => {
            switch (type) {
                case EventType.DISMISSED:
                    break;
                case EventType.PRESS:
                    const ads = JSON.parse(JSON.parse(detail.notification?.data?.ads))
                    const title = detail.notification?.data?.adsTitle
                    const externalLink = detail.notification?.data?.externalLink

                    if (ads && Array.isArray(ads) && ads?.length >= 1) {
                        openPush(ads, title)
                    } else if (externalLink) {
                        Linking.openURL(externalLink)
                    }

                    break;
            }
        });
    }, []);

    return (((!DeviceInfo.isTablet() && !Platform.isPad) || width < 768) || (Platform.OS == 'ios' && config?.bypassAppStore)) ? (
        <Tab.Navigator
            initialRouteName={global.initialRouteName}

            {...config?.status != 'active' && { tabBar: () => null }}

            backBehavior="initialRoute"
            screenListeners={({ navigation, route }) => ({
                state: (e) => { },
                tabPress: (e) => {
                    const routeName = route?.name;
                    let screen = '';

                    if (routeName == 'MainTab') {
                        screen = `${store?.company} - Início`;
                    } else if (routeName == 'SearchTab') {
                        screen = `${store?.company} - Estoque`;
                    } else if (routeName == 'AccountTab') {
                        screen = `${store?.company} - Loja`;
                    } else if (routeName == 'Favorites') {
                        screen = `${store?.company} - Favoritos`;
                    } else if (routeName == 'AboutUs') {
                        screen = `${store?.company} - Sobre nós`;
                    } else if (routeName == 'AboutUsStores') {
                        screen = `${store?.company} - Lojas`;
                    }

                    if (screen) {
                        analytics().logScreenView({
                            screen_name: screen,
                            screen_class: screen,
                        });
                    }
                }
            })}

            barStyle={{ backgroundColor: colors.background, shadowColor: 'transparent' }}
            screenOptions={
                Platform.OS == 'ios' ? {
                    headerShown: false,
                    headerShadowVisible: true,
                    tabBarStyle: { borderTopColor: colors.ios.line }
                } : {
                    tabBarShowLabel: config?.app?.tab?.tabBarShowLabel ?? false,
                    headerShown: false,
                    tabBarHideOnKeyboard: false,
                    tabBarStyle: { backgroundColor: colors.background, elevation: 0, borderTopWidth: 0 }
                }
            } >
            <Tab.Screen name="MainTab" component={MainStack} options={{ tabBarTestID: 'MainTab', tabBarAccessibilityLabel: "MainTab", lazy: true, tabBarIcon: ({ focused, color, size }) => { return (<Icon name={focused ? 'home' : 'home-outline'} type="material-community" size={Platform.OS == 'ios' ? (!IosOldVersion() ? 29 : 29) : 27} color={color}></Icon>) }, title: 'Início' }} />
            <Tab.Screen name="SearchTab" component={SearchStack} options={{ tabBarTestID: 'SearchTab', tabBarAccessibilityLabel: "SearchTab", lazy: true, tabBarIcon: ({ focused, color, size }) => { return <Icon name={'search'} type={'ionicons'} color={color} size={Platform.OS == 'ios' ? 23 : 23}></Icon> }, title: 'Estoque' }} initialParams={props?.route?.params} />
            <Tab.Screen name="AccountTab" component={SettingsStack}
                options={{
                    tabBarTestID: 'AccountTab',
                    tabBarAccessibilityLabel: "AccountTab",
                    lazy: true,
                    title: (config?.app?.tab?.store != '' && config?.app?.tab?.store != null) ? config?.app?.tab?.store : 'Loja',
                    tabBarIcon: ({ focused, color, size }) => {
                        return ((theme == 'light' ? store?.icon?.light : store?.icon?.dark) || (theme == 'light' ? config?.icon?.light : config?.icon?.dark))
                            ? <View style={[{ width: 24, height: 24, borderRadius: 13, overflow: 'hidden' }]}>
                                <FastImage
                                    source={{ uri: (theme == 'light' ? store?.icon?.light : store?.icon?.dark) ?? (theme == 'light' ? config?.icon?.light : config?.icon?.dark), priority: FastImage.priority.high }}
                                    style={[{ width: 24, height: 24 }]} imageStyle={[{ width: 24, height: 24 }]}>
                                </FastImage>
                            </View>
                            : <Icon name={'person-circle'} type={'ionicons'} color={color} size={Platform.OS == 'ios' ? 26 : 26}></Icon>
                    }
                }} />
        </Tab.Navigator >
    ) : (
        <Tab.Navigator initialRouteName={global.initialRouteName} backBehavior="initialRoute" tabBar={(props) => <Fragment />} >
            <Tab.Screen name="MainTab" component={MainStack} options={{ headerShown: false, lazy: true }} />
            <Tab.Screen name="SearchTab" component={SearchStack} options={{ headerShown: false, lazy: true }} />
            <Tab.Screen name="Favorites" component={FavoritesStack} options={{ title: 'Favoritos', headerShown: false, lazy: true }} />
            <Tab.Screen name="AboutUs" component={AccountAboutUsStack} options={{ title: 'Sobre nós', headerShown: false, lazy: true }} />
            <Tab.Screen name="AboutUsStores" component={AccountAboutUsStoresStack} options={{ title: 'Lojas', headerShown: false, lazy: true }} />
            <Tab.Screen name="AccountSettings" component={AccountSettingsStack} options={{ headerShown: false, lazy: true }} />
        </Tab.Navigator>
    );
}

const Render = (props) => {
    useColorScheme();

    const { global, setGlobal, store } = useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const colors = useColors();
    const width = Dimensions.get('window').width;

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                orientation: ((isTablet() || Platform.isPad) && width >= 768) ? 'all' : 'portrait',
                gestureEnabled: true
            }}
            initialRouteName='Init'>
            <Stack.Screen name="Init" component={global.firstTime ? (global.suggestStoreSelection ? StoresStack : LoadingConfigStack) : Tabs} options={{ title: store?.company ? store?.company : '...' }} />

            <Stack.Group
                screenOptions={{
                    headerShown: true,
                    presentation: Platform.OS == 'ios' ? 'modal' : 'card',
                    headerTransparent: false,
                    headerLargeTitle: !isTablet() && !IosOldVersion(),
                    headerShadowVisible: !isTablet() && Platform.OS == 'ios',
                    headerLargeTitleShadowVisible: false,
                    headerStyle: {
                        backgroundColor: (!isTablet() ? Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground : colors.background)
                    },
                    headerLargeStyle: {
                        backgroundColor: colors.background
                    }
                }}>

                <Stack.Screen name="FilterOptions" component={Search} options={{ title: 'Filtros', headerLargeTitle: false }} />

                <Stack.Screen name="Service" component={ServiceStack} options={{ title: '', headerLargeTitle: false, headerShown: false, presentation: Platform.OS == 'ios' ? 'modal' : 'card', gestureEnabled: false }} initialParams={props?.route?.params} />
                <Stack.Screen name="FipeTable" component={FipeTableStack} options={{ title: '', headerLargeTitle: false, headerShown: false, presentation: Platform.OS == 'ios' ? 'modal' : 'card', gestureEnabled: false }} initialParams={props?.route?.params} />

                {Platform.OS == 'android' && <Stack.Screen name="SearchHome" component={SearchHomeStack} options={{ title: 'Estoque', headerShown: false, headerLargeTitle: false, headerBackTitle: 'Voltar' }} initialParams={{ ...props?.route?.params, nofilters: true }} />}
            </Stack.Group>

            <Stack.Screen name="Stores" component={StoresStack} options={{ headerShown: false, title: 'Lojas', presentation: Platform.OS == 'ios' ? 'modal' : 'card', headerLargeTitle: false, gestureEnabled: false }} />
            <Stack.Screen name="StoresSearch" component={StoresStack} options={{ headerShown: false, title: 'Lojas', presentation: Platform.OS == 'ios' ? 'modal' : 'card', headerLargeTitle: false, gestureEnabled: false }} />

            <Stack.Screen name="AdsFilter" component={AdsFilter}
                options={{
                    headerShown: true,
                    title: 'Filtros',
                    presentation: Platform.OS == 'ios' ? 'modal' : 'card',
                    headerLargeTitle: false,
                    headerShadowVisible: Platform.OS == 'ios',
                    headerLargeTitleShadowVisible: false,
                    headerStyle: {
                        backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                    },
                    headerLargeStyle: {
                        backgroundColor: colors.background
                    }
                }}
            />
            <Stack.Screen name="AdsFilterItem" component={AdsFilterItem}
                options={{
                    headerShown: true,
                    presentation: Platform.OS == 'ios' ? 'modal' : 'card',
                    headerLargeTitle: false,
                    headerShadowVisible: Platform.OS == 'ios',
                    headerLargeTitleShadowVisible: false,
                    headerStyle: {
                        backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                    },
                    headerLargeStyle: {
                        backgroundColor: colors.background
                    }
                }} />

            <Stack.Screen name="Detail" component={Detail}
                options={{
                    title: '',
                    headerLargeTitle: false,
                    headerShadowVisible: Platform.OS == 'ios',
                    headerLargeTitleShadowVisible: false,
                    headerStyle: {
                        backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                    },
                    headerLargeStyle: {
                        backgroundColor: colors.background
                    },
                    headerShown: true
                }} />

            <Stack.Screen name="DetailVideo" component={DetailVideo}
                options={{
                    title: '',
                    headerStyle: {
                        backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                    },
                    headerLargeTitle: false, gestureEnabled: true, headerShown: true
                }} />

            <Stack.Screen name="InitialQuestionsStack" component={InitialQuestionsStack}
                options={{
                    title: '',
                    headerStyle: {
                        backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                    },
                    headerLargeTitle: false, gestureEnabled: false, headerShown: false, presentation: Platform.OS == 'ios' ? 'modal' : 'card'
                }} />

            <Stack.Screen name="QrCode"
                component={QrCode}
                options={{
                    ...Platform.OS == 'ios' && { statusBarStyle: 'light' },
                    title: null,
                    headerTintColor: '#fff',
                    presentation: "containedModal",
                    animation: 'fade_from_bottom',
                    headerShown: true,
                    gestureEnabled: true,
                    headerTransparent: true,
                    headerStyle: { backgroundColor: 'transparent' },
                    headerLargeStyle: { backgroundColor: 'transparent' }
                }}
            />

            {Platform.OS == 'android' && <Stack.Screen name="AccountSettings" component={AccountSettingsStack} />}
            {Platform.OS == 'android' && (!Platform.isPad && !isTablet()) && <Stack.Screen name="Favorites" component={FavoritesStack} />}
            {Platform.OS == 'android' && (!Platform.isPad && !isTablet()) && <Stack.Screen name="AboutUs" component={AccountAboutUsStack} />}
            {Platform.OS == 'android' && (!Platform.isPad && !isTablet()) && <Stack.Screen name="AboutUsStores" component={AccountAboutUsStoresStack} />}
            {Platform.OS == 'android' && <Stack.Screen name="AboutUsSearch" component={AccountAboutUsStack} />}
            {Platform.OS == 'android' && <Stack.Screen name="AboutUsStoresSearch" component={AccountAboutUsStoresStack} />}
        </Stack.Navigator>
    )
}

export default function Routes(props) {
    useColorScheme();

    return (
        <View style={{ flex: 1, zIndex: -1 }}>
            <NavigationContainer>
                <ActionSheetProvider>
                    <DialogProvider>
                        <Render {...props} />
                    </DialogProvider>
                </ActionSheetProvider>
            </NavigationContainer>
        </View>
    );
}