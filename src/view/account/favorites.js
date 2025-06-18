import { useContext, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Appearance, FlatList, Image, Platform, Text, View } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { DescriptionFontSize, Divider, Item, Separator, TitleFontSize, useColors } from "react-native-ui-devkit"
import analytics from '@react-native-firebase/analytics';
import FastImage from "react-native-fast-image"

import { GlobalContext } from "../../libs/globalContext"
import { NoFavoritesYet } from "../../components/noDataYet"
import helper from "../../libs/helper"
import Session from "../../libs/session"

const Favorites = () => {
  const { store, global } = useContext(GlobalContext);
  const navigation = useNavigation()
  const route = useRoute()?.params;
  const list = route?.list;
  const backScreen = route?.backScreen;

  const [search, setSearch] = useState(null)
  const theme = Appearance.getColorScheme();

  const config = Session.getConfig();
  const ads = Session.getAds(store?._id);

  const [filteredAdsData, setFilteredAdsData] = useState(ads?.filter(ad => ad?.favorite && ad) ?? []);

  useEffect(() => {
    setTimeout(() => {
      const ads = [];

      const data = Session.getAds(store?._id);
      const filtered = data?.filter(ad => ad?.favorite && !ad?.changed?.hidden && ad);

      filtered?.filter((ad) => { return ad?.changed?.price != null; })
        ?.map((ad) => {
          const price = parseFloat(ad?.changed?.price);
          if (price) { ad.price = price; }
        });

      ads.push(...filtered);

      setFilteredAdsData(ads ?? [])
    }, 250);
  }, [global.timestamp])

  const colors = useColors()

  useLayoutEffect(() => {
    if (Platform.OS == 'ios') {
      navigation.setOptions({
        headerSearchBarOptions: {
          placeholder: 'Pesquisar',
          cancelButtonText: 'Cancelar',
          autoCapitalize: 'none',
          obscureBackground: false,
          hideWhenScrolling: false,
          onChangeText: (e) => setSearch(e.nativeEvent.text),
          onFocus: (e) => e.preventDefault(),
          onBlur: (e) => e.preventDefault(),
          onCancelButtonPress: (e) => setSearch(null),
        }
      })
    }
  }, [navigation])

  useEffect(() => {
    if (store) {
      const screen = `${store?.company} - Favorites`;
      analytics().logScreenView({
        screen_name: screen,
        screen_class: screen,
      });
    }
  }, [store])

  const searchedList = useMemo(() => {
    const result = search?.length && filteredAdsData?.filter(item =>
      (item?.brand?.toLowerCase().includes(search.trim().toLowerCase())) ||
      (item?.model?.toLowerCase().includes(search.trim().toLowerCase())) ||
      (item?.color?.toLowerCase().includes(search.trim().toLowerCase())) ||
      (item?.transmission?.toLowerCase().includes(search.trim().toLowerCase())) ||
      (item?.fuel?.toLowerCase().includes(search.trim().toLowerCase())) ||
      (item?.optionals?.some(optional =>
        optional.toLowerCase().includes(search.toLowerCase())
      )) ||
      search == null
    )
    return result
  }, [search, filteredAdsData])

  const renderItem = ({ item, index, separators }) => {
    filteredAdsData[index].separators = separators;
    const imageSize = Platform.OS == 'ios' ? 62 : 72;

    return (
      <>
        <Item
          data={{
            icon: {
              component:
                <>
                  {Platform.OS == 'android' &&
                    <FastImage
                      source={{
                        uri: (theme == 'dark'
                          ? Image.resolveAssetSource(require('../../assets/img/watermark-dark.png')).uri
                          : Image.resolveAssetSource(require('../../assets/img/watermark.png')).uri), priority: FastImage.priority.high
                      }}
                      style={[{ position: 'absolute', width: imageSize, height: imageSize, borderRadius: 10 }]}
                    />
                  }

                  <FastImage source={{ uri: item?.photos?.[0] }} defaultSource={theme == 'dark' ? require('../../assets/img/watermark-dark.png') : require('../../assets/img/watermark.png')} resizeMode="cover" style={[{ width: imageSize, height: imageSize, borderRadius: 10 }]} />
                </>
            },
            component:
              <Item
                data={{
                  component:
                    <>
                      <View style={{ flex: 1, marginLeft: Platform.OS == 'ios' ? 15 : 20, marginVertical: 10 }}>
                        <Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left' }]} numberOfLines={1}>{item?.brand?.toUpperCase()} {item?.model?.toUpperCase()} {item?.version?.toUpperCase()}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={[DescriptionFontSize(), { color: colors.text }]} numberOfLines={1}>{item?.manufactureYear}/{item?.modelYear} {helper.getFirstLetterCapitalized(item?.fuel)} {helper.getFirstLetterCapitalized(item?.transmission)} {new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(item?.mileage)}</Text>
                        </View>
                        <Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', marginTop: 10 }]}>{item?.price ? Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(item?.price) : 'Consulte'}</Text>
                        {config?.unifiedAds &&
                          <View style={{ flex: 1, flexDirection: 'row', alignContent: 'center', marginTop: 10 }}>
                            <Text style={[DescriptionFontSize(), { color: colors.secondary, textTransform: 'uppercase', flex: 1 }]} numberOfLines={1}>{helper.getStoreName(config, item?.store)}</Text>
                            <Text style={[DescriptionFontSize(), { color: colors.primary, textTransform: 'lowercase' }]}>{helper.getStoreDistance(config, item?.store)}</Text>
                          </View>
                        }
                      </View>
                    </>,
                  padding: false,
                }}
                marginTop={false}
                expanded
                style={{ backgroundColor: 'transparent' }}
              />,
            separator: {
              data: [filteredAdsData[index - 1], item],
              index
            },
            onPress: () => {
              const data = { ...item }
              delete data?.separators

              if (list) {
                const vehicle = { ...data }
                navigation.navigate(backScreen,
                  { vehicle },
                  { merge: true })
              } else {
                navigation.navigate('Detail', { ad: data, title: 'Favoritos', backScreen: 'Favorites' })
              }
            }
          }}
          marginTop={false}
          expanded={Platform.OS == 'ios'}
          index={index} count={filteredAdsData.length}
        />
      </>
    )
  }

  return (
    <FlatList
      data={searchedList ? searchedList : filteredAdsData}
      keyExtractor={(item, index) => String(index)}
      renderItem={renderItem}
      ItemSeparatorComponent={(props) => <Separator props={props} start={Platform.OS == 'ios' ? 75 : 110} />}
      {...Platform.OS == 'ios' && { style: { backgroundColor: colors.ios.item } }}
      ListEmptyComponent={
        <>
          <Divider />
          <NoFavoritesYet text={search} />
        </>
      }
      contentInsetAdjustmentBehavior={'automatic'}
      keyboardDismissMode={'on-drag'}
      keyboardShouldPersistTaps={'handled'}
    />
  )
}

export default Favorites