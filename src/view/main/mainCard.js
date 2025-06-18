import React, { useContext } from 'react';
import { View, Text, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AndroidOldVersion, DescriptionFontSize, List, TitleFontSize, useColors } from 'react-native-ui-devkit';
import FastImage from 'react-native-fast-image';

import { GlobalContext } from '../../libs/globalContext';
import helper from '../../libs/helper';

const MainCard = () => {
    const { store } = useContext(GlobalContext);
    const navigation = useNavigation();
    const colors = useColors();

    const getImage = () => {
        const image = store?.services?.find((item) => item?.service == store?.mainService)?.image ?? null;
        return image;
    }

    const service = helper.getServices(store, null, colors);

    return (store?.mainService && service) ? (
        <>
            {AndroidOldVersion() && <View style={{ height: 1 }} />}
            <List data={[
                {
                    component:
                        <View>
                            <FastImage
                                {...!getImage() && { source: service?.image }}
                                {...getImage() && { source: { uri: getImage() } }}
                                style={{ width: '100%', height: 120 }}
                            />

                            <View style={{ flex: 1, margin: 10 }}>
                                <Text style={[TitleFontSize(), { color: colors.text }]}>{service?.title}</Text>
                                <Text style={[DescriptionFontSize(), { color: colors.secondary }]}>{service?.description}</Text>
                            </View>
                        </View>,
                    padding: false
                },
                {
                    icon: service?.icon,
                    title: service?.button,
                    color: {
                        title: colors.primary
                    },
                    onPress: () => {
                        navigation.navigate(service?.route, { service })
                    }
                }
            ]}
                marginTop={store?.banners?.length > 0}
                expanded={Platform.OS == 'android'} />
        </>
    ) : <></>
}

export default MainCard;