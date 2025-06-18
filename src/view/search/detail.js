import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Alert, Appearance, FlatList, Linking, Platform, Pressable, ScrollView, Image, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AndroidOldVersion, Button, Item, List, MediumFontSize, useColors } from "react-native-ui-devkit"
import { useNavigation, useRoute } from "@react-navigation/native"
import AnimatedDotsCarousel from 'react-native-animated-dots-carousel';
import { isTablet } from "react-native-device-info"
import ImageView from "react-native-image-viewing";
import FastImage from "react-native-fast-image"
import analytics from '@react-native-firebase/analytics';
import ViewShot from "react-native-view-shot";
import Share from 'react-native-share';

import { GlobalContext } from "../../libs/globalContext"
import { GETONE, STATISTICS } from "../../libs/api"
import helper from "../../libs/helper"
import BestSelling from "../main/bestSelling"
import Session from "../../libs/session"

const Detail = () => {
  const { global, setGlobal, store } = useContext(GlobalContext);
  const { width, height } = useWindowDimensions()
  const navigation = useNavigation()

  const queryClient = useQueryClient();

  const route = useRoute()
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const theme = Appearance.getColorScheme()
  const config = Session.getConfig();

  const lead = helper.getServices(null, 'message')
  const financing = helper.getServices(store, '65dcb7898eca108d87c91dbc')
  const testdrive = helper.getServices(store, '65dcb5e78eca108d87c91db8')

  const googlePlayUrl = config?.googlePlay?.url ?? '';
  const appStoreUrl = config?.appStore?.url ?? '';

  const adParam = route?.params?.ad;

  const title = route?.params?.title;
  const backScreen = route?.params?.backScreen;

  if (!adParam?.id && backScreen) {
    navigation.navigate(backScreen);
    Alert.alert('Aviso', "Este anúncio não esta mais disponível!");
  }

  const storeName = store?.company ? store?.company : '...';
  const analyticsStore = helper.formatToAnalytics(store?.company);

  const analyticsItem = `${adParam?.plaque ? `(${adParam?.plaque})` : '(0KM)'} ${adParam?.brand} ${adParam?.model} ${adParam?.type == 1 && `${adParam?.version} `}${adParam?.manufactureYear}/${adParam?.modelYear}`;

  const financingExists = store?.services?.find((item) => item?.service == '65dcb7898eca108d87c91dbc' && item?.lead);
  const testdriveExists = store?.services?.find((item) => item?.service == '65dcb5e78eca108d87c91db8' && item?.lead);

  /** @type { React.MutableRefObject<ScrollView> } */
  const scrollViewRef = useRef(null)
  /** @type { React.MutableRefObject<FlatList> } */
  const imagesRef = useRef(null)
  /** @type { React.MutableRefObject<ViewShot> } */
  const viewShotRef = useRef(null)

  const [visible, setIsVisible] = useState(false);
  const [bestSellingIsLoading, setBestSellingIsLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const vehicle = `${adParam?.brand?.toUpperCase()} ${adParam?.model?.toUpperCase()} ${adParam?.version?.toUpperCase()} ${adParam?.manufactureYear}/${adParam?.modelYear}`;
  const price = new Intl.NumberFormat('pt-br', { currency: 'BRL', style: 'currency' }).format(adParam?.price);

  const shareAd = `${adParam?.brand} ${adParam?.model} ${adParam?.type == 1 && `${adParam?.version} `}${adParam?.manufactureYear}/${adParam?.modelYear}, ${new Intl.NumberFormat('pt-br', { currency: 'BRL', style: 'currency' }).format(adParam?.price)}`;
  const shareMessage = `Olá,\n\nOlha o veículo que encontrei no aplicativo ${storeName}.\n\n${shareAd}\n\nBaixe o aplicativo:\n\nGoogle Play:\n${googlePlayUrl}\n\nApp Store:\n${appStoreUrl}`


  const [data, setData] = useState({
    vehicle,
    price
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${adParam?.brand} ${adParam?.model}`,
      headerBackTitle: 'Voltar',
      headerBackButtonMenuEnabled: false,

      headerRight: ({ tintColor }) => (
        <>
          {adParam?.video && <Button icon right data={{ delay: false, icon: { name: 'play', type: 'font-awesome5', size: 18, color: tintColor }, onPress: () => { navigation.navigate('DetailVideo', { ad: adParam }) } }} />}
          <Button icon right data={{ delay: false, icon: { name: adParam?.favorite ? 'heart' : 'heart-outline', type: 'material-community', size: 24, color: adParam?.favorite ? colors.notification : tintColor }, onPress: () => { saveToFavorite() } }} />
          {(googlePlayUrl && appStoreUrl) && <Button icon right data={{ icon: { name: Platform.OS == 'ios' ? 'share-apple' : 'share', type: Platform.OS == 'ios' ? 'evilicons' : 'font-awesome', size: Platform.OS == 'ios' ? 33 : 19, color: tintColor }, onPress: () => { onViewShot() } }} />}
        </>
      ),
      ...title && { headerBackTitle: title }
    })

    setTimeout(() => {
      setBestSellingIsLoading(true);
    }, 500);
  }, [navigation, title, adParam])

  useEffect(() => {
    if (adParam?.id) {
      const ad = GETONE(adParam?.id);
      navigation.setParams({ ad });
    }
  }, [global.timestamp])

  useEffect(() => {
    if (store && adParam) {
      if (analyticsItem) {
        analytics().logEvent('view_item', {
          [analyticsStore]: analyticsItem?.toUpperCase()
        });
      }
    }
  }, [])

  const saveToFavorite = async () => {
    if (store?._id) {
      const ads = Session.getAds(store?._id);
      const index = ads?.findIndex(item => item?.id == adParam?.id && item);

      if (index != -1) {
        const favorite = !ads[index].favorite;
        ads[index].favorite = favorite;

        navigation.setParams({ ad: ads[index] });
        Session.setAds(ads, store?._id);

        queryClient.invalidateQueries().then(() => {
          setGlobal((prevState) => ({ ...prevState, timestamp: Date.now() }));
        });

        updateStatistic({ type: 'favorite', add: favorite });

        if (favorite) {
          const analyticsItem = `${adParam?.plaque ? `(${adParam?.plaque})` : '(0KM)'} ${adParam?.brand} ${adParam?.model} ${adParam?.type == 1 && `${adParam?.version} `}${adParam?.manufactureYear}/${adParam?.modelYear}`;
          if (analyticsItem) {
            analytics().logEvent('add_to_favorites', {
              [analyticsStore]: analyticsItem?.toUpperCase()
            });
          }
        }
      }
    }
  };

  const handleOpenImageViewing = (index) => {
    setIsVisible(true)
  }

  const updateViewStatistic = async () => {
    await STATISTICS(store, adParam?.id, 'view', true)
  }

  useEffect(() => {
    global.isConnected && updateViewStatistic()
  }, [global.isConnected])

  const { mutate: updateStatistic } = useMutation({
    mutationFn: async (data) => {
      const response = await STATISTICS(store, adParam?.id, data?.type, data?.add)
      return response
    },
    onError: () => { }
  })

  const galleryItems = useMemo(() => adParam?.photos?.map(item => ({ uri: item })), [adParam?.photos])

  const onShare = async (image) => {
    try {
      await Share.open({
        url: image,
        message: shareMessage,
        title: `${storeName} na Google Play e App Store`,
      });

      if (analyticsItem) {
        analytics().logEvent('click_on_share', {
          [analyticsStore]: analyticsItem?.toUpperCase()
        });
      }
    } catch (err) { }
  };

  const onViewShot = useCallback(() => {
    viewShotRef.current.capture()
      .then(uri => {
        onShare(uri)
      })
  }, []);

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: insets.bottom ? insets.bottom : 10, }}>

        <View>
          <FlatList
            ref={imagesRef}
            data={adParam?.photos}
            keyExtractor={(item, index) => String(index)}
            showsHorizontalScrollIndicator={false}
            horizontal
            pagingEnabled
            onScroll={({ nativeEvent }) => {
              const index = Math.round(nativeEvent.contentOffset.x / (isTablet() ? (Platform.OS == 'ios' ? width * 0.58 : width * 0.56) : width))
              if (index >= 0 && index < adParam?.photos?.length) { setActiveImageIndex(index) }
            }}
            renderItem={({ item, index }) => {
              return (
                <Pressable onPress={handleOpenImageViewing}>
                  {Platform.OS == 'android' &&
                    <FastImage
                      source={{
                        uri: (theme == 'dark'
                          ? Image.resolveAssetSource(require('../../assets/img/watermark-dark.png')).uri
                          : Image.resolveAssetSource(require('../../assets/img/watermark.png')).uri), priority: FastImage.priority.high
                      }}
                      style={{ position: 'absolute', width: (((isTablet() || Platform.isPad) && width >= 768) ? (Platform.OS == 'ios' ? width * 0.58 : width * 0.56) : width), height: 280 }}
                    />
                  }

                  <FastImage
                    source={{ uri: item }}
                    defaultSource={theme == 'dark' ? require('../../assets/img/watermark-dark.png') : require('../../assets/img/watermark.png')}
                    style={{ width: (((isTablet() || Platform.isPad) && width >= 768) ? (Platform.OS == 'ios' ? width * 0.58 : width * 0.56) : width), height: 280 }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                </Pressable>
              )
            }}
          />

          <View style={{ position: 'absolute', bottom: Platform.OS == 'ios' ? -21 : -14, left: 0, right: 0 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <AnimatedDotsCarousel
                length={adParam?.photos?.length}
                currentIndex={activeImageIndex}
                maxIndicators={2}
                interpolateOpacityAndColor={true}
                activeIndicatorConfig={{
                  color: colors.text,
                  margin: 2,
                  opacity: 1,
                  size: 8,
                }}
                inactiveIndicatorConfig={{
                  color: colors.secondary,
                  margin: 3,
                  opacity: 0.5,
                  size: 8,
                }}
                decreasingDots={[
                  {
                    config: { color: colors.tertiary, margin: 3, opacity: 0.5, size: 6 },
                    quantity: 1,
                  },
                  {
                    config: { color: colors.tertiary, margin: 3, opacity: 0.5, size: 4 },
                    quantity: 1,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <List
          data={[
            {
              title: `${adParam?.brand?.toUpperCase()} ${adParam?.type == 1 ? adParam?.model?.toUpperCase() : ''}`,
              description: adParam?.type == 1 ? adParam?.version?.toUpperCase() : adParam?.model?.toUpperCase(),
              subdescription: adParam?.type == 1 ? adParam?.version?.toUpperCase() : adParam?.model?.toUpperCase(),
              chevron: false,
            },
            {
              title: new Intl.NumberFormat('pt-br', { currency: 'BRL', style: 'currency' }).format(adParam?.price)
            }
          ]}
        />

        {financingExists &&
          <List data={[
            {
              icon: { name: 'attach-money', type: 'material', color: colors.primary, size: 27, backgroundColor: 'transparent' },
              title: "Financiamento",
              description: 'Clique aqui para simular seu financiamento.',
              subdescription: 'Clique aqui para simular seu financiamento.',
              onPress: () => {
                navigation.navigate({
                  name: financing?.route,
                  params: { vehicle: adParam, selected: false, service: financing },
                  merge: true
                });

                if (analyticsItem) {
                  analytics().logEvent('click_on_financing', {
                    [analyticsStore]: analyticsItem?.toUpperCase()
                  });
                }
              }
            },
            store?.ad?.displayNumberOfFinancingProposals && adParam?.statistics?.financing >= 1 && {
              icon: { name: 'file-signature', type: 'font-awesome5', size: 19, color: colors.primary, backgroundColor: 'transparent' },
              title: `${adParam?.statistics?.financing} ${adParam?.statistics?.financing > 1 ? 'propostas' : 'proposta'} em análise`
            }
          ]} />
        }

        <List data={[
          store?.ad?.displayNumberOfInterestedCustomers && adParam?.statistics?.favorites >= 1 && {
            icon: { name: 'heart', type: 'material-community', size: 24, color: colors.primary, backgroundColor: 'transparent' },
            title: `${adParam?.statistics?.favorites} ${adParam?.statistics?.favorites > 1 ? 'clientes interessados' : 'cliente interessado'}`
          }
        ]} />

        <List
          data={[
            { title: 'Ano / Modelo', description: `${adParam?.manufactureYear} / ${adParam?.modelYear}` },
            adParam?.color && { title: 'Cor', description: helper.getFirstLetterCapitalized(adParam?.color) },
            adParam?.type == 1 && adParam?.transmission && { title: 'Câmbio', description: helper.getFirstLetterCapitalized(adParam?.transmission) },
            adParam?.type == 1 && adParam?.fuel && { title: 'Combustível', description: helper.getFirstLetterCapitalized(adParam?.fuel) },
            adParam?.mileage != null && { title: 'Quilometragem', description: new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(adParam?.mileage) },
            adParam?.plaque && { title: 'Placa', description: `Final ${adParam?.plaque?.toString()?.substr(adParam?.plaque?.length - 1, 1)}` }
          ]}
        />

        <Item data={adParam?.armored && {
          icon: { name: 'shield-check', type: 'material-community', color: colors.text, size: 23, backgroundColor: 'transparent' },
          title: "Blindado",
          description: 'Para quem busca um pouco mais de segurança no dia a dia.',
          subdescription: 'Para quem busca um pouco mais de segurança no dia a dia.'
        }} />

        <List
          data={[
            adParam?.description && {
              component: <View style={{ flex: 1, paddingVertical: 15 }}>
                <Text style={[MediumFontSize(), { color: colors.text }]}>{adParam?.description}</Text>
              </View>
            },
            adParam?.optionals?.length > 0 && {
              component:
                <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 10 }}>
                  {adParam?.optionals.map((item, index) => (
                    <View key={index} style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: theme == 'dark' ? '#333' : '#e9e9e9', borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: colors.text }}>{item}</Text>
                    </View>
                  ))}
                </View>,
              padding: false
            }
          ]}
        />

        {testdriveExists && store?.ad?.showTestDriveOption &&
          <Item data={{
            icon: { name: 'calendar-clock', type: 'material-community', color: colors.primary, size: 24, backgroundColor: 'transparent' },
            title: "Test-Drive",
            description: 'Venha fazer um test-drive sem compromisso!',
            subdescription: 'Venha fazer um test-drive sem compromisso!',
            onPress: () => {
              navigation.navigate({
                name: testdrive?.route,
                params: { vehicle: adParam, selected: false, service: testdrive },
                merge: true
              });

              if (analyticsItem) {
                analytics().logEvent('click_on_testdrive', {
                  [analyticsStore]: analyticsItem?.toUpperCase()
                });
              }
            }
          }} />
        }

        {(store?.ad?.showRelatedOffers && bestSellingIsLoading) && <BestSelling type={'relationship'} id={adParam?.id} brand={adParam?.brand} model={adParam?.model} backScreen={backScreen} />}

        {store?.ad?.warning &&
          <Item data={{
            icon: { name: 'info', type: 'feather', size: 22, color: '#FF9900', backgroundColor: 'transparent' },
            title: 'Aviso',
            ...(Platform.OS == 'android' && AndroidOldVersion()) && {
              description: store?.ad?.warning
            }
          }} footer={store?.ad?.warning} footerOnAndroid />
        }
      </ScrollView>

      <View
        style={{
          paddingTop: 10,
          paddingBottom: insets.bottom ? insets.bottom : 10,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors[Platform.OS]?.line,
          backgroundColor: colors.background,
        }}>
        <Button blue data={{
          title: 'Enviar mensagem',
          onPress: async () => {
            if (store?.ad?.lead?.type == 'message') {
              const link = helper.replaceMessage(store?.ad?.lead?.[Platform.OS], store?.ad?.lead?.replace, data);
              if (link) {
                Linking.canOpenURL(link)
                  .then((result) => {
                    result && Linking.openURL(link);
                    (!result && link?.includes('sms:')) && Alert.alert('Aviso', 'Você precisa instalar o aplicativo SMS para usar este canal de comunição!');
                    (!result && link?.includes('whatsapp:')) && Alert.alert('Aviso', 'Você precisa instalar o aplicativo Whatsapp para usar este canal de comunição!');
                    (!result && link?.includes('tg:')) && Alert.alert('Aviso', 'Você precisa instalar o aplicativo Telegram para usar este canal de comunição!');

                    result && updateStatistic({ type: 'message', add: true });

                    if (result && analyticsItem) {
                      analytics().logEvent('click_on_send_message', {
                        [analyticsStore]: analyticsItem?.toUpperCase()
                      });
                    }
                  })
              }
            } else {
              navigation.navigate({
                name: lead?.route,
                params: { vehicle: adParam, selected: false, service: lead },
                merge: true
              })
            }
          }
        }} marginTop={false}
        />
      </View>

      <ImageView
        images={galleryItems}
        keyExtractor={(imageSrc, index) => String(index)}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        imageIndex={activeImageIndex}
      />

      <ViewShot ref={viewShotRef}
        options={{ format: 'jpg', quality: 1 }}
        style={{ position: 'absolute', top: height * 2, backgroundColor: colors.background }}>
        <View>
          <FlatList
            data={adParam?.photos}
            keyExtractor={(item, index) => String(index)}
            showsHorizontalScrollIndicator={false}
            horizontal
            pagingEnabled
            renderItem={({ item, index }) => {
              return (
                <View>
                  {Platform.OS == 'android' &&
                    <FastImage
                      source={{
                        uri: (theme == 'dark'
                          ? Image.resolveAssetSource(require('../../assets/img/watermark-dark.png')).uri
                          : Image.resolveAssetSource(require('../../assets/img/watermark.png')).uri), priority: 'high'
                      }}
                      style={{ position: 'absolute', width: (((isTablet() || Platform.isPad) && width >= 768) ? (Platform.OS == 'ios' ? width * 0.58 : width * 0.56) : width), height: 280 }}
                    />
                  }

                  <FastImage
                    source={{ uri: item }}
                    defaultSource={theme == 'dark' ? require('../../assets/img/watermark-dark.png') : require('../../assets/img/watermark.png')}
                    style={{ width: (((isTablet() || Platform.isPad) && width >= 768) ? (Platform.OS == 'ios' ? width * 0.58 : width * 0.56) : width), height: 280 }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                </View>
              )
            }}
          />
        </View>

        <List
          data={[
            {
              title: `${adParam?.brand?.toUpperCase()} ${adParam?.type == 1 ? adParam?.model?.toUpperCase() : ''}`,
              description: adParam?.type == 1 ? adParam?.version?.toUpperCase() : adParam?.model?.toUpperCase(),
              subdescription: adParam?.type == 1 ? adParam?.version?.toUpperCase() : adParam?.model?.toUpperCase(),
              chevron: false,
            },
            {
              title: new Intl.NumberFormat('pt-br', { currency: 'BRL', style: 'currency' }).format(adParam?.price)
            }
          ]}
        />

        <List
          data={[
            { title: 'Ano / Modelo', description: `${adParam?.manufactureYear} / ${adParam?.modelYear}` },
            adParam?.color && { title: 'Cor', description: helper.getFirstLetterCapitalized(adParam?.color) },
            adParam?.type == 1 && adParam?.transmission && { title: 'Câmbio', description: helper.getFirstLetterCapitalized(adParam?.transmission) },
            adParam?.type == 1 && adParam?.fuel && { title: 'Combustível', description: helper.getFirstLetterCapitalized(adParam?.fuel) },
            adParam?.mileage != null && { title: 'Quilometragem', description: new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(adParam?.mileage) },
            adParam?.plaque && { title: 'Placa', description: `Final ${adParam?.plaque?.toString()?.substr(adParam?.plaque?.length - 1, 1)}` }
          ]}
        />

        <Item data={adParam?.armored && {
          icon: { name: 'shield-check', type: 'material-community', color: colors.text, size: 23, backgroundColor: 'transparent' },
          title: "Blindado",
          description: 'Para quem busca um pouco mais de segurança no dia a dia.',
          subdescription: 'Para quem busca um pouco mais de segurança no dia a dia.'
        }} />

        <List
          data={[
            adParam?.description && {
              component: <View style={{ flex: 1, paddingVertical: 15 }}>
                <Text style={[MediumFontSize(), { color: colors.text }]}>{adParam?.description}</Text>
              </View>
            },
            adParam?.optionals?.length > 0 && {
              component:
                <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 10 }}>
                  {adParam?.optionals.map((item, index) => (
                    <View key={index} style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: theme == 'dark' ? '#333' : '#e9e9e9', borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: colors.text }}>{item}</Text>
                    </View>
                  ))}
                </View>,
              padding: false
            }
          ]}
        />

        {store?.ad?.warning &&
          <Item data={{
            icon: { name: 'info', type: 'feather', size: 22, color: '#FF9900', backgroundColor: 'transparent' },
            title: 'Aviso',
            ...(Platform.OS == 'android' && AndroidOldVersion()) && {
              description: store?.ad?.warning
            }
          }} footer={store?.ad?.warning} footerOnAndroid />
        }
        <View style={{ height: 10 }} />
      </ViewShot>
    </>
  )
}

export default Detail