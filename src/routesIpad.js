import React, { Fragment, useContext } from 'react';
import { View, Platform, Appearance, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColors } from 'react-native-ui-devkit';
import { isTablet } from 'react-native-device-info';
import { GlobalContext } from './libs/globalContext';

import Account from './view/account';
import Session from './libs/session';
import { DialogProvider } from './components/DialogAndroid';

export default function RoutesIpad() {
    const { global } = useContext(GlobalContext);
    const Stack = createNativeStackNavigator();
    const { width } = Dimensions.get('screen');

    const config = Session.getConfig();
    const theme = Appearance.getColorScheme();
    const colors = useColors();

    return ((config?.bypassAppStore != true) || Platform.OS == 'android') && (
        <Fragment>
            {(isTablet() || Platform.isPad) && width >= 768 && !global.firstTime &&
                <View style={[{ width: Platform.OS == 'ios' ? '42%' : '44%', zIndex: 0 }, Platform.OS == 'ios' && { borderRightWidth: 0.8, borderRightColor: theme === 'dark' ? '#222' : '#ccc' }]}>
                    <NavigationContainer>
                        <DialogProvider>
                            <Stack.Navigator
                                screenOptions={{
                                    headerTransparent: Platform.OS == 'ios',
                                    headerShadowVisible: Platform.OS == 'ios',
                                    headerLargeTitleShadowVisible: false,
                                    headerLargeTitle: true,
                                    headerStyle: {
                                        backgroundColor: Platform.OS == 'ios' ? colors.ios.headerBackground : colors.android.headerBackground
                                    },
                                    headerLargeStyle: {
                                        backgroundColor: colors.background
                                    }
                                }}>
                                <Stack.Screen name="Account" component={Account} options={{
                                    title: 'Loja',
                                }} />
                            </Stack.Navigator>
                        </DialogProvider>
                    </NavigationContainer>
                </View>
            }
        </Fragment>
    );
}