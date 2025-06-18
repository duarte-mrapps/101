import React, { useContext } from 'react';
import { View, Text, FlatList, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, DescriptionFontSize, Item, PaddingHorizontal, TitleFontSize, useColors } from 'react-native-ui-devkit';
import { isTablet } from 'react-native-device-info';
import FastImage from 'react-native-fast-image';

import { GlobalContext } from '../../libs/globalContext';
import helper from '../../libs/helper';

const DefaultServices = () => {
    const { store } = useContext(GlobalContext);
    const navigation = useNavigation();
    const colors = useColors();

    const { width } = Dimensions.get('screen')
    const smartPurchasing = [];

    const getImage = (_id) => {
        const image = store?.services?.find((item) => item?.service == _id)?.image ?? null;
        return image;
    }

    store?.defaultServices?.map((_id) => {
        const service = helper.getServices(store, _id, colors);
        service?._id && smartPurchasing.push(service);
    });

    return smartPurchasing?.length >= 2 ? (
        <Item data={{
            component:
                <FlatList
                    data={smartPurchasing}
                    keyExtractor={(item, index) => String(index)}
                    horizontal
                    contentContainerStyle={[PaddingHorizontal(), { gap: Platform.OS == 'ios' ? 15 : 20 }]}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => {
                        return (
                            <View style={{ width: width / ((isTablet() || Platform.isPad) ? 2.2 : 1.3), padding: 10, marginVertical: 5, borderColor: Platform.OS == 'android' ? colors.android.line : colors.ios.line, backgroundColor: colors.card, borderRadius: 25 }}>
                                <FastImage
                                    {...!getImage(item?._id) && { source: item?.image }}
                                    {...getImage(item?._id) && { source: { uri: getImage(item?._id) } }}
                                    style={{ width: '100%', height: 120, borderRadius: Platform.OS == 'ios' ? 15 : 20 }}
                                />
                                <View style={{ flex: 1, marginTop: 10 }}>
                                    <Text style={[TitleFontSize(), { color: colors.text }]}>{item.title}</Text>
                                    <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                        <Text style={[DescriptionFontSize(), { color: colors.secondary }]}>{item.description}</Text>
                                    </View>
                                </View>
                                <Button link data={{ title: item.button, onPress: () => { navigation.navigate(item?.route, { service: item }) } }} marginTop={false} style={{ alignItems: 'center' }} />
                            </View>
                        )
                    }}
                />,
            padding: false
        }}
            headerOnAndroid
            style={{ marginLeft: 0, marginRight: 0, backgroundColor: 'transparent' }} separators={false}
        />
    ) : <></>
}

export default DefaultServices;