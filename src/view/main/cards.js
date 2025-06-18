import React, { useContext, useEffect, useState } from 'react';
import { View, Platform, ImageBackground, Linking, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { isTablet } from 'react-native-device-info';
import { Item } from 'react-native-ui-devkit';
import FastImage from 'react-native-fast-image';
import Carousel from 'react-native-snap-carousel';

import { GlobalContext } from '../../libs/globalContext';
import { LaunchArguments } from 'react-native-launch-arguments';
import Session from '../../libs/session';

const Cards = () => {
    const { global, store } = useContext(GlobalContext);
    const navigation = useNavigation();
    const config = Session.getConfig();
    const ads = Session.getAds(store?._id);
    const width = Dimensions.get('window').width;

    const isTesting = LaunchArguments.value()?.isTesting || false

    const percentTablet = (((isTablet() || Platform.isPad) && width >= 768) && (config?.bypassAppStore != true)) ? (Platform.OS == 'ios' ? 0.58 : 0.56) : 1;
    const [sliderWidth, setSliderWidth] = useState(width * percentTablet);
    const [itemWidth, setItemWidth] = useState(sliderWidth * (Platform.OS == 'ios' ? 0.85 : 1));

    useEffect(() => {
        Dimensions.addEventListener('change', ({ window: { width, height } }) => {
            setSliderWidth(width * percentTablet);
        });
    }, []);

    useEffect(() => {
        setItemWidth(sliderWidth * (Platform.OS == 'ios' ? 0.85 : 1));
    }, [sliderWidth]);

    const open = (item) => {
        const type = item?.type;
        const values = item?.values;

        if (type == 'link' && values) {
            const link = values[0]?.value;
            Linking.openURL(link);
        } else if (type == 'ad' && values && ads?.length) {
            if (values?.length == 1) {
                const ad = ads?.find((ad) => ad?.id == values[0]?.value);
                ad && navigation.push('Detail', { ad });
            } else if (values?.length > 1) {
                const adsArray = [];

                values?.map((item) => {
                    const ad = ads?.find((ad) => ad?.id == item?.value);
                    ad && adsArray?.push(ad?.id);
                })

                adsArray?.length && navigation.navigate('SearchHome', { type: 'ads', ads: adsArray, title: item?.title })
            }
        }
    }

    const renderItem = ({ item, index }) => {
        return (
            <Item data={{
                component:
                    <ImageBackground source={{ uri: item.image }} blurRadius={10} style={{ flex: 1, alignItems: 'center', aspectRatio: 480 / 280, justifyContent: 'center', width: "100%" }}>
                        <FastImage
                            source={{ uri: item.image, priority: FastImage.priority.high }}
                            style={{ width: '100%', aspectRatio: 480 / 280 }}
                            resizeMode={FastImage.resizeMode.contain}
                            testID={`Banner-${index}`}
                        />
                    </ImageBackground>,
                padding: false,
                chevron: false,
                onPress: () => { open(item); }
            }} marginTop={false} separators={false} expanded style={{ borderRadius: Platform.OS == 'ios' ? 15 : 0 }} />
        );
    }

    return sliderWidth && (
        <View style={{ paddingTop: Platform.OS == 'ios' ? 15 : 0 }}>
            <Carousel
                data={store?.banners}
                renderItem={renderItem}
                keyExtractor={(item, index) => String(index)}
                autoplay={isTesting ? false : true}
                autoplayDelay={6000}
                autoplayInterval={6000}
                layout='default'
                sliderWidth={sliderWidth}
                itemWidth={itemWidth}
                testID="MainCarrousel"
            />
        </View>
    )
}

export default Cards;