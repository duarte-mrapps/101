import React, { useContext } from 'react';
import { Platform, View, Text, PixelRatio, Linking, Appearance } from 'react-native';
import { List, IosOldVersion, useColors, DescriptionFontSize, Icon } from 'react-native-ui-devkit';
import { isTablet } from 'react-native-device-info';
import FastImage from 'react-native-fast-image';

import { GlobalContext } from '../../libs/globalContext';
import useGlobalStyles from '../../assets/styles';
import Session from '../../libs/session';

const Header = ({ profileView, type, onNavigate, selectedTab, setSelectedTab, walletAction, connectedDevicesAction, selectPhoto, selectBackgroundPhoto, updating, business, view, ...props }) => {
    const { store } = useContext(GlobalContext);
    const colors = useColors();
    const styles = useGlobalStyles();
    const theme = Appearance.getColorScheme();

    const config = Session.getConfig();
    const stores = config?.stores?.filter((store) => (store?.hidden != true && store?.virtual == false && store?.services?.length > 0));

    const header = [
        {
            icon: Platform.OS == 'ios' && {
                component:
                    ((theme == 'light' ? store?.icon?.light : store?.icon?.dark) || (theme == 'light' ? config?.icon?.light : config?.icon?.dark))
                        ? <View style={{ marginVertical: !IosOldVersion() ? 5 : 10, width: 60, height: 64, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
                            <FastImage
                                source={{ uri: (theme == 'light' ? store?.icon?.light : store?.icon?.dark) ?? (theme == 'light' ? config?.icon?.light : config?.icon?.dark), priority: FastImage.priority.high }}
                                style={[styles.itemAvatarMenu, { width: 60, height: 60 }]} imageStyle={[styles.itemAvatarMenu, { width: 60, height: 60 }]}>
                            </FastImage>
                        </View>
                        : <Icon name={'person-circle'} type={'ionicons'} color={colors.tertiary} size={74} style={{ marginVertical: !IosOldVersion() ? 0 : 5, width: 67, marginLeft: -2 }}></Icon>

            },
            component:
                <View style={{ flex: 1 }}>
                    <View style={{
                        flexDirection: "row",
                    }}>
                        <View style={[styles.itemText, { justifyContent: 'center' }, Platform.OS == 'android' && { marginLeft: 0, marginRight: 15 }]}>
                            <Text style={{ color: colors.text, fontSize: ((Platform.OS == 'ios' ? 22 : (24 * PixelRatio.getFontScale()))) }} numberOfLines={1}>{store?.company ? store?.company : '...'}</Text>
                            <Text style={[DescriptionFontSize(), { color: Platform.OS == 'ios' ? colors.text : colors.secondary }]} numberOfLines={2}>
                                {config?.slogan ? config?.slogan : (store?.place?.address ? store?.place?.address : '...')}
                            </Text>
                        </View>

                        {Platform.OS == 'android' &&
                            <>
                                {((theme == 'light' ? store?.icon?.light : store?.icon?.dark) || (theme == 'light' ? config?.icon?.light : config?.icon?.dark)) ?
                                    <View style={[styles.avatarMenu, { marginVertical: 16 }]}>
                                        <FastImage
                                            source={{ uri: (theme == 'light' ? store?.icon?.light : store?.icon?.dark) ?? (theme == 'light' ? config?.icon?.light : config?.icon?.dark), priority: FastImage.priority.high }}
                                            style={[styles.itemAvatarMenu, { width: 60, height: 60 }]} imageStyle={[styles.itemAvatarMenu, { width: 60, height: 60 }]}>
                                        </FastImage>
                                    </View>
                                    : <View style={{ alignSelf: 'center', marginVertical: 10 }}>
                                        <Icon name={'person-circle'} type={'ionicons'} color={colors.secondary} size={72.5} style={{ right: -5 }}></Icon>
                                    </View>
                                }
                            </>
                        }
                    </View>
                </View>,
            ...stores?.length > 1 && {
                onPress: () => {
                    onNavigate('Stores', { backScreen: 'AccountTab' });
                }
            }
        },
        ((store?.phone?.ios || store?.phone?.android) && ((config?.unifiedAds && stores?.length > 1) || config?.unifiedAds != true)) && {
            title: `Ligar ${store?.phone?.formatted}`,
            color: {
                title: colors.primary
            },
            ...Platform.OS == 'ios' && { separator: { start: Platform.isPad ? 90 : 105 } },
            chevron: false,
            delay: false,
            onPress: () => {
                Linking.openURL(Platform.OS == 'ios' ? store?.phone?.ios : store?.phone?.android)
            }
        },
        (config?.unifiedAds && stores?.length == 1) && {
            title: `Lojas`,
            color: {
                title: colors.primary
            },
            ...Platform.OS == 'ios' && { separator: { start: Platform.isPad ? 90 : 105 } },
            selected: selectedTab == 'stores',
            onPress: () => {
                setSelectedTab('stores');
                onNavigate('AboutUsStores', { backScreen: 'AccountTab' });
            }
        }
    ]

    return (Platform.OS == 'android' || config?.bypassAppStore != true) && (
        <List data={header} tabletIpadMenuType={isTablet()} forceNative={isTablet()} {...!IosOldVersion() && { marginTop: false }} />
    );
}

export default Header;