import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Text, View, Linking, Platform, LayoutAnimation, FlatList, Appearance, Alert } from 'react-native';
import { Divider, useColors, DescriptionFontSize, List, Icon, Button, MediumFontSize } from 'react-native-ui-devkit';
import { HeaderOptions } from '@react-navigation/elements';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import analytics from '@react-native-firebase/analytics';
import FastImage from 'react-native-fast-image';
import { useDebounce } from 'use-debounce';

import { GlobalContext } from '../../libs/globalContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDialog } from '../../components/DialogAndroid';
import { STORES } from '../../libs/api';
import helper from '../../libs/helper';
import { NoStoreYet } from '../../components/noDataYet';
import Session from '../../libs/session';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const AboutUsStores = () => {
  const { global, store } = useContext(GlobalContext);
  const theme = Appearance.getColorScheme();
  const navigation = useNavigation()
  const queryClient = useQueryClient();
  const colors = useColors();
  const route = useRoute()
  const searcher = route?.params?.searcher;
  let config = Session.getConfig();

  const [seeMore, setSeeMore] = useState(false);
  const [search, setSearch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debounceValue] = useDebounce(search, 1000);

  const { showDialog, hideDialog } = useDialog();
  const [apps, setApps] = useState({ whatsapp: false, telegram: false, sms: false, waze: false, googleMaps: false, maps: false })
  const [collapsibleHours, setCollapsibleHours] = useState(null);

  const { showActionSheetWithOptions } = useActionSheet();


  /** @type { React.MutableRefObject<import('@react-navigation/elements').HeaderSearchBarRef> } */
  const searchBarRef = useRef()

  useEffect(() => {
    if (searcher) setTimeout(() => { searchBarRef.current?.focus() }, 500)
  }, [searcher])

  /** @type { HeaderOptions }  */
  const options = {
    ...searcher && { title: '' },
    headerRight: ({ tintColor }) => (
      <>
        {(Platform.OS == 'android' && !searcher) &&
          <Button icon data={{
            icon: { name: 'search', type: 'ionicons', color: tintColor, size: 22 },
            onPress: async () => {
              navigation.navigate('AboutUsStoresSearch', { searcher: true })
            }
          }} noMargin />}
      </>
    ),
    ...(Platform.OS == 'ios' || searcher) && {
      headerSearchBarOptions: {
        ref: searchBarRef,
        placeholder: 'Pesquisar',
        cancelButtonText: 'Cancelar',
        autoCapitalize: 'none',
        textColor: colors.text,
        headerIconColor: colors.background,
        hintTextColor: colors.secondary,
        ...(searcher && { autoFocus: true }),
        hideWhenScrolling: false,
        obscureBackground: false,
        onChangeText: (e) => { setSearch(e.nativeEvent.text); setLoading(true) },
        onFocus: (e) => e.preventDefault(),
        onBlur: (e) => e.preventDefault(),
        onCancelButtonPress: (e) => setSearch(null),
        onClose: (e) => { navigation?.goBack(null); }
      }
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions(options);
  }, [navigation, global, colors, searcher])

  useEffect(() => {
    config = Session.getConfig();
  }, [global.timestamp])

  useEffect(() => {
    Linking.canOpenURL('waze://').then(supported => { setApps(prev => ({ ...prev, waze: supported })) })
    Linking.canOpenURL('maps://').then(supported => { setApps(prev => ({ ...prev, maps: supported })) })

    if (Platform.OS == 'ios') { Linking.canOpenURL('comgooglemaps://').then(supported => { setApps(prev => ({ ...prev, googleMaps: supported })) }) }
    if (Platform.OS == 'android') { Linking.canOpenURL('geo:0,0').then(supported => { setApps(prev => ({ ...prev, googleMaps: supported })) }) }
  }, [])

  useEffect(() => {
    if (store) {
      const screen = `${store?.company} - Sobre-nós`;
      analytics().logScreenView({
        screen_name: screen,
        screen_class: screen,
      });
    }
  }, [store])

  useEffect(() => {
    setLoading(false)
    const queryKey = 'StoreFilters';
    queryClient.removeQueries({ queryKey, exact: true })
  }, [debounceValue])

  const { data: queryData, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['StoreFilters', config, global.isConnected, store, debounceValue],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await STORES(pageParam, 10, debounceValue)
      return response;
    },

    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      if ((currentPage + 1) < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    }
  })

  const data = queryData?.pages?.flatMap(page => page?.data)
  const dataList = useMemo(() => {
    let list = searcher ? (debounceValue ? data : []) : data;
    return list;
  }, [data, debounceValue, searcher])

  const mapActions = (address) => [{
    data: [
      apps.maps && {
        title: 'Maps', chevron: false, delay: false,
        onPress: () => {
          const q = encodeURIComponent(address);
          Linking.openURL(`maps://?q=${q}`)
        }
      },
      apps.googleMaps && {
        title: 'Google Maps', chevron: false, delay: false,
        onPress: () => {
          const q = encodeURIComponent(address);
          if (Platform.OS == 'ios') {
            Linking.openURL(`comgooglemaps://?q=${q}`)
          } else {
            Linking.openURL(`geo:0,0?q=${q}`)
          }
        }
      },
      apps.waze && {
        title: 'Waze', chevron: false, delay: false,
        onPress: () => {
          const q = encodeURIComponent(address);
          Linking.openURL(`waze://ul?q=${q}`)
        }
      }
    ]
  }]

  const handleActionSheetMaps = (address) => {
    address = encodeURIComponent(address)

    let options = []
    apps.maps && options.push('Maps')
    apps.googleMaps && options.push('Google Maps')
    apps.waze && options.push('Waze')
    options.push('Cancelar')

    const openCorrectMessageApp = (index) => {
      if (options[index] == 'Maps') {
        Linking.openURL(`maps://?q=${address}`)
      } else if (options[index] == 'Google Maps') {
        if (Platform.OS == 'ios') {
          Linking.openURL(`comgooglemaps://?q=${address}`)
        } else {
          Linking.openURL(`geo:0,0?q=${address}`)
        }
      } else if (options[index] == 'Waze') {
        Linking.openURL(`https://waze.com/ul?q=${address}`)
      } else {
        return
      }
    }

    showActionSheetWithOptions({
      options,
      title: options.length >= 2 && 'Abrir em qual mapa?',
      cancelButtonIndex: options.length - 1,
      message: options.length == 1 && 'Não foi possível abrir o mapa, instale o Google Maps ou Waze e tente novamente.'
    },
      (buttonIndex) => {
        openCorrectMessageApp(buttonIndex)
      }
    )
  }

  const renderItem = ({ item, index }) => {
    const sms = (item?.sms?.ios || item?.sms?.android) && {
      icon: { name: Platform.OS == 'ios' ? 'chat' : 'message', type: 'material-community', size: Platform.OS == 'ios' ? 22 : 19, color: '#fff', backgroundColor: '#10BB17' },
      color: {
        title: colors.primary
      },
      chevron: false,
      onPress: () => {
        const phone = Platform.OS == 'ios' ? item?.sms?.ios : item?.sms?.android;
        Linking.canOpenURL(phone)
          .then((result) => {
            result && Linking.openURL(phone);
            !result && Alert.alert('Aviso', 'Você precisa instalar o aplicativo SMS para usar este canal de comunição!');
          })

        if (item?.sms?.formatted) {
          analytics().logEvent('click_on_sms', {
            store_id: item?._id,
            store_name: item?.company,
            sms: item?.sms?.formatted
          });
        }
      }
    };

    const whatsapp = (item?.whatsapp?.ios || item?.whatsapp?.android) && {
      icon: { name: 'whatsapp', type: 'font-awesome', size: 22, color: '#fff', backgroundColor: '#10BB17' },
      title: 'Whatsapp',
      color: {
        title: colors.primary
      },
      chevron: false,
      onPress: () => {
        const phone = Platform.OS == 'ios' ? item?.whatsapp?.ios : item?.whatsapp?.android;
        Linking.canOpenURL(phone)
          .then((result) => {
            result && Linking.openURL(phone);
            !result && Alert.alert('Aviso', 'Você precisa instalar o aplicativo Whatsapp para usar este canal de comunição!');
          })

        if (item?.whatsapp?.formatted) {
          analytics().logEvent('click_on_whatsapp', {
            store_id: item?._id,
            store_name: item?.company,
            whatsapp: item?.whatsapp?.formatted
          });
        }
      }
    };


    const telegram = (item?.telegram?.ios || item?.telegram?.android) && {
      icon: { name: 'telegram', type: 'font-awesome', size: 20, color: '#fff', backgroundColor: '#229ED9' },
      title: 'Telegram',
      color: {
        title: colors.primary
      },
      chevron: false,
      onPress: () => {
        const phone = Platform.OS == 'ios' ? item?.telegram?.ios : item?.telegram?.android;
        Linking.canOpenURL(phone)
          .then((result) => {
            result && Linking.openURL(phone);
            !result && Alert.alert('Aviso', 'Você precisa instalar o aplicativo Telegram para usar este canal de comunição!');
          })

        if (item?.telegram?.formatted) {
          analytics().logEvent('click_on_telegram', {
            store_id: item?._id,
            store_name: item?.company,
            telegram: item?.telegram?.formatted
          });
        }
      }
    };


    return (
      <List
        key={index}
        data={[
          item?.frontage && {
            component:
              <View style={{ width: 'auto', aspectRatio: 480 / 280, alignItems: 'center', justifyContent: 'center' }}>
                <FastImage
                  source={{ uri: item?.frontage }}
                  style={{ width: '100%', height: '100%', alignSelf: 'center', borderRadius: 0 }}>
                </FastImage>
              </View >,
            padding: false
          },
          {
            component:
              <List data={[
                {
                  icon: { name: 'location-sharp', type: 'ionicons', size: 17, color: '#fff', backgroundColor: '#39CA61' },
                  title: item?.company ? item?.company : 'Endereço',
                  ...item?.distance && {
                    badge: {
                      value: `${item?.distance ?? 1}km`
                    }
                  },
                  description: item?.place?.address ? item?.place?.address : '...',
                  subdescription: item?.place?.address ? item?.place?.address : '...',
                  delay: false,
                  onPress: () => {
                    if (Platform.OS == 'ios') {
                      handleActionSheetMaps(item?.place?.address);
                    } else {
                      showDialog({
                        title: 'Abrir em qual mapa?',
                        data: mapActions(item?.place?.address),
                        cancelButton: true,
                        colors: colors
                      })
                    }
                  }
                },
                (item?.phone?.ios || item?.phone?.android) && {
                  icon: { name: 'phone', type: 'font-awesome', size: 20, color: '#fff', backgroundColor: '#10BB17' },
                  title: `Ligar ${item?.phone?.formatted}`,
                  color: {
                    title: colors.primary
                  },
                  ...Platform.OS == 'ios' && { separator: { start: Platform.isPad ? 90 : 105 } },
                  chevron: false,
                  delay: false,
                  separator: {
                    start: 60
                  },
                  onPress: () => {
                    Linking.openURL(Platform.OS == 'ios' ? item?.phone?.ios : item?.phone?.android)
                  }
                },
                sms,
                whatsapp,
                telegram
              ]} marginTop={false} expanded={true} />,
            padding: false
          },
          (item?.socialNetworks?.instagram
            || item?.socialNetworks?.facebook
            || item?.socialNetworks?.youtube
            || item?.socialNetworks?.twitter
            || item?.socialNetworks?.linkedin
            || item?.socialNetworks?.tiktok) && {
            component:
              <List data={[
                item?.socialNetworks?.instagram && { icon: helper.getIconBySocialnetwork('instagram'), title: 'Instagram', description: Platform.OS == 'android' && item?.socialNetworks?.instagram, color: { title: colors.primary }, onPress: () => { Linking.openURL(`${item?.socialNetworks?.instagram}`); } },
                item?.socialNetworks?.facebook && { icon: helper.getIconBySocialnetwork('facebook'), title: 'facebook', description: Platform.OS == 'android' && item?.socialNetworks?.facebook, color: { title: colors.primary }, onPress: () => { Linking.openURL(`${item?.socialNetworks?.facebook}`); } },
                item?.socialNetworks?.youtube && { icon: helper.getIconBySocialnetwork('youtube'), title: 'YouTube', description: Platform.OS == 'android' && item?.socialNetworks?.youtube, color: { title: colors.primary }, onPress: () => { Linking.openURL(`${item?.socialNetworks?.youtube}`); } },
                item?.socialNetworks?.twitter && { icon: helper.getIconBySocialnetwork('twitter'), title: 'twitter', description: Platform.OS == 'android' && item?.socialNetworks?.twitter, color: { title: colors.primary }, onPress: () => { Linking.openURL(`${item?.socialNetworks?.twitter}`); } },
                item?.socialNetworks?.linkedin && { icon: helper.getIconBySocialnetwork('linkedin'), title: 'LinkedIn', description: Platform.OS == 'android' && item?.socialNetworks?.linkedin, color: { title: colors.primary }, onPress: () => { Linking.openURL(`${item?.socialNetworks?.linkedin}`); } },
                item?.socialNetworks?.tiktok && { icon: helper.getIconBySocialnetwork('tiktok'), title: 'TikTok', description: Platform.OS == 'android' && item?.socialNetworks?.tiktok, color: { title: colors.primary }, onPress: () => { Linking.openURL(`${item?.socialNetworks?.tiktok}`); } }
              ]} marginTop={false} expanded={true} />,
            padding: false
          },
          {
            component:
              <List data={[
                item?.email && { title: item?.email, description: (Platform.OS == 'android' && 'Caso você tenha alguma dúvida, sugestão ou reclamação envie-nos um e-mail.'), color: { title: colors.primary }, delay: false, chevron: false, onPress: () => { Linking.openURL(`mailto:${item?.email}`); } },
                item?.website && { title: item?.website, description: (Platform.OS == 'android' && 'Se desejar ver mais informações, acesse nosso site.'), color: { title: colors.primary }, delay: false, chevron: false, onPress: () => { Linking.openURL(config.website); } },
                { title: 'Horários', description: helper.getAboutUsTodayHours(item?.openingHours?.default), subdescription: helper.getAboutUsTodayHours(item?.openingHours?.default), collapsible: collapsibleHours == index, onPress: () => { setCollapsibleHours(index != collapsibleHours ? index : null); LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); } },

                collapsibleHours == index && {
                  component:
                    <>
                      <List data={[
                        { title: 'Domingo', description: (item?.openingHours?.default?.sunday?.from && item?.openingHours?.default?.sunday?.from) ? `${item?.openingHours?.default?.sunday?.from} às ${item?.openingHours?.default?.sunday?.to}` : 'Fechado', color: { title: helper.getColorByDay(0, colors) } },
                        { title: 'Segunda-feira', description: (item?.openingHours?.default?.monday?.from && item?.openingHours?.default?.monday?.from) ? `${item?.openingHours?.default?.monday?.from} às ${item?.openingHours?.default?.monday?.to}` : 'Fechado', color: { title: helper.getColorByDay(1, colors) } },
                        { title: 'Terça-feira', description: (item?.openingHours?.default?.tuesday?.from && item?.openingHours?.default?.tuesday?.from) ? `${item?.openingHours?.default?.tuesday?.from} às ${item?.openingHours?.default?.tuesday?.to}` : 'Fechado', color: { title: helper.getColorByDay(2, colors) } },
                        { title: 'Quarta-feira', description: (item?.openingHours?.default?.wednesday?.from && item?.openingHours?.default?.wednesday?.from) ? `${item?.openingHours?.default?.wednesday?.from} às ${item?.openingHours?.default?.wednesday?.to}` : 'Fechado', color: { title: helper.getColorByDay(3, colors) } },
                        { title: 'Quinta-feira', description: (item?.openingHours?.default?.thursday?.from && item?.openingHours?.default?.thursday?.from) ? `${item?.openingHours?.default?.thursday?.from} às ${item?.openingHours?.default?.thursday?.to}` : 'Fechado', color: { title: helper.getColorByDay(4, colors) } },
                        { title: 'Sexta-feira', description: (item?.openingHours?.default?.friday?.from && item?.openingHours?.default?.friday?.from) ? `${item?.openingHours?.default?.friday?.from} às ${item?.openingHours?.default?.friday?.to}` : 'Fechado', color: { title: helper.getColorByDay(5, colors) } },
                        { title: 'Sábado', description: (item?.openingHours?.default?.saturday?.from && item?.openingHours?.default?.saturday?.from) ? `${item?.openingHours?.default?.saturday?.from} às ${item?.openingHours?.default?.saturday?.to}` : 'Fechado', color: { title: helper.getColorByDay(6, colors) } }
                      ]} expanded marginTop={false} />

                      {item?.openingHours?.others?.map?.((openingHours) => {
                        return (
                          <List data={[
                            { title: openingHours?.title, description: helper.getAboutUsTodayHours(openingHours), subdescription: helper.getAboutUsTodayHours(openingHours) },
                            openingHours?.phone && { title: `Ligar ${openingHours?.phone?.formatted}`, color: { title: colors.primary }, chevron: false, delay: false, onPress: () => { Linking.openURL(Platform.OS == 'ios' ? openingHours?.phone?.ios : openingHours?.phone?.android) } },
                            { title: 'Domingo', description: (openingHours?.sunday?.from && openingHours?.sunday?.from) ? `${openingHours?.sunday?.from} às ${openingHours?.sunday?.to}` : 'Fechado', color: { title: helper.getColorByDay(0, colors) } },
                            { title: 'Segunda-feira', description: (openingHours?.monday?.from && openingHours?.monday?.from) ? `${openingHours?.monday?.from} às ${openingHours?.monday?.to}` : 'Fechado', color: { title: helper.getColorByDay(1, colors) } },
                            { title: 'Terça-feira', description: (openingHours?.tuesday?.from && openingHours?.tuesday?.from) ? `${openingHours?.tuesday?.from} às ${openingHours?.tuesday?.to}` : 'Fechado', color: { title: helper.getColorByDay(2, colors) } },
                            { title: 'Quarta-feira', description: (openingHours?.wednesday?.from && openingHours?.wednesday?.from) ? `${openingHours?.wednesday?.from} às ${openingHours?.wednesday?.to}` : 'Fechado', color: { title: helper.getColorByDay(3, colors) } },
                            { title: 'Quinta-feira', description: (openingHours?.thursday?.from && openingHours?.thursday?.from) ? `${openingHours?.thursday?.from} às ${openingHours?.thursday?.to}` : 'Fechado', color: { title: helper.getColorByDay(4, colors) } },
                            { title: 'Sexta-feira', description: (openingHours?.friday?.from && openingHours?.friday?.from) ? `${openingHours?.friday?.from} às ${openingHours?.friday?.to}` : 'Fechado', color: { title: helper.getColorByDay(5, colors) } },
                            { title: 'Sábado', description: (openingHours?.saturday?.from && openingHours?.saturday?.from) ? `${openingHours?.saturday?.from} às ${openingHours?.saturday?.to}` : 'Fechado', color: { title: helper.getColorByDay(6, colors) } }
                          ]} expanded />
                        )
                      })
                      }
                    </>,
                  padding: false
                }
              ]} marginTop={false} expanded={true} />,
            padding: false
          },
        ]} marginTop={false} expanded={Platform.OS == 'android'} />
    )
  }

  return (
    <FlatList
      data={loading ? [] : dataList}
      keyExtractor={(item, index) => String(index)}
      renderItem={renderItem}
      ItemSeparatorComponent={(props) => { return <View style={{ height: 15 }} /> }}
      ListEmptyComponent={
        <>
          <NoStoreYet text={search} loading={isFetching || loading} />
        </>
      }
      windowSize={21}
      contentInsetAdjustmentBehavior={'automatic'}
      keyboardDismissMode={'on-drag'}
      keyboardShouldPersistTaps={'handled'}
      removeClippedSubviews={true}
      initialNumToRender={20}
      maxToRenderPerBatch={40}
      updateCellsBatchingPeriod={10}
      onEndReachedThreshold={0.1}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      ListHeaderComponent={() => <Divider />}
      ListFooterComponent={() => <Divider />}
    />
  );
}

export default AboutUsStores;