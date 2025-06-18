import React, { useCallback, useContext, useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MenuProvider } from 'react-native-popup-menu';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { RNUIDevKitProvider } from 'react-native-ui-devkit';

import { GlobalContext, GlobalContextProvider } from './libs/globalContext';
import { DialogProvider } from './components/DialogAndroid';
import RoutesInit from './routesInit';
import Session from './libs/session';
import FilterProvider from './libs/filterContext';

const queryClient = new QueryClient({})

const Render = () => {
    useColorScheme()
    useContext(GlobalContext);

    return (
        <RNUIDevKitProvider>
            <FilterProvider>
                <MenuProvider>
                    <QueryClientProvider client={queryClient}>
                        <AvoidSoftInputView
                            showAnimationDuration={0}
                            hideAnimationDuration={0}
                            showAnimationDelay={0}
                            hideAnimationDelay={0}
                            easing={'linear'}
                        />
                        <RoutesInit />
                    </QueryClientProvider>
                </MenuProvider>
            </FilterProvider>
        </RNUIDevKitProvider>
    )
}

const App = () => {
    useColorScheme()

    useEffect(() => {
        initialize();

        return () => { }
    }, []);

    const initialize = useCallback(async () => {
        Session.setUniqueId();
    });

    return Platform.OS == 'ios'
        ? (<SafeAreaProvider>
            <GlobalContextProvider>
                <Render />
            </GlobalContextProvider>
        </SafeAreaProvider>)
        : (<SafeAreaProvider>
            <GlobalContextProvider>
                <DialogProvider>
                    <Render />
                </DialogProvider>
            </GlobalContextProvider>
        </SafeAreaProvider>)
}

export default App;