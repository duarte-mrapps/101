import React, { useContext, useEffect } from 'react';
import { View, Text, Platform, StatusBar, Appearance } from 'react-native';
import { Divider, Icon, IosOldVersion, Item, MediumFontSize, TitleFontSize } from 'react-native-ui-devkit';
import { useTheme } from '@react-navigation/native';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import NavigationBar from 'react-native-navbar-color';

import { GlobalContext } from '../../libs/globalContext';
import { Session } from '../../libs/session';
import { ActivityIndicator } from 'react-native';
import helper from '../../libs/helper';

const LoadingConfig = (props) => {
    const { global, setGlobal } = useContext(GlobalContext);
    const { colors } = useTheme();
    const theme = Appearance.getColorScheme();

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
        setTimeout(() => {
            checkConfig();
        }, 2000);
    }, [])

    const checkConfig = async () => {
        const config = Session.getConfig();

        if (config?._id) {
            if (config?.suggestStoreSelection) {
                global.suggestStoreSelection = true;
            } else {
                global.firstTime = false;
            }

            Session.setGlobal(global);
            setGlobal({ ...global });
        } else {
            setTimeout(() => {
                checkConfig();
            }, 1000);
        }
    }

    return (
        <View
            style={{ flex: 1 }}>

            <Item data={{
                component:
                    <>
                        <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: IosOldVersion() ? 0 : 15, paddingHorizontal: 40 }}>
                            <Icon name={Platform.OS == 'ios' ? 'cloud-download' : 'cloud-download-alt'} type={Platform.OS == 'ios' ? 'ionicons' : 'font-awesome5'} size={Platform.OS == 'ios' ? 55 : 45} color={Platform.OS == 'ios' ? colors.primary : colors.text} style={{ marginBottom: -10, marginVertical: Platform.OS == 'ios' ? 5 : 15 }} />

                            <Divider />

                            <Text style={[TitleFontSize(1.5), { fontWeight: '600', color: colors.text }]}>Aguarde</Text>
                            <Text style={[MediumFontSize(), { fontWeight: '400', color: colors.text, textAlign: 'center', marginTop: 5 }]}>O aplicativo esta sendo configurado em seu dispositivo.</Text>
                        </View>

                        <Divider />
                        <ActivityIndicator />
                    </>
            }} flex={true} style={{ flex: 1, backgroundColor: 'transparent' }} marginTop={false} />

        </View>
    );
}

export default LoadingConfig;