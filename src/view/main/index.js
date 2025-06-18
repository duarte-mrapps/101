import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { ScrollView, TouchableOpacity, Platform, PermissionsAndroid, Alert, Linking } from 'react-native'
import { AndroidOldVersion, Divider, useColors, Button, Icon } from 'react-native-ui-devkit'
import { HeaderOptions, HeaderTitle } from '@react-navigation/elements'
import { isTablet } from 'react-native-device-info'
import { getDistance } from 'geolib'
import Geolocation from 'react-native-geolocation-service'

import { GlobalContext } from '../../libs/globalContext'
import DefaultServices from './defaultServices'
import BestSelling from './bestSelling'
import Cards from './cards'
import MainSearch from './search'
import MainCard from './mainCard'
import Session from '../../libs/session'
import { PERMISSIONS, RESULTS, request, openSettings, check } from 'react-native-permissions'

import { LaunchArguments } from 'react-native-launch-arguments'

const Main = (props) => {
  const { global, setGlobal, store, setStore } = useContext(GlobalContext);

  const { navigation } = props;
  const colors = useColors();

  const [search, setSearch] = useState(null);
  const [focus, setFocus] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);


  const isTesting = LaunchArguments.value()?.isTesting || false

  const config = Session.getConfig();
  const configStores = config?.stores?.filter((store) => (store?.hidden != true && store?.virtual == false && store?.services?.length > 0))

  const suggestion = () => {
    const config = Session.getConfig()
    const stores = config?.stores?.sort((a, b) => a.distance - b.distance)
    const store = Session.getStore()
    const nearestStore = stores?.[0]

    if (nearestStore?._id && configStores?.length > 1) {
      if (store?._id != nearestStore?._id) {
        Alert.alert(
          'Sugestão',
          `${nearestStore?.company} é a loja mais próxima de você.`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: async () => { } },
            {
              text: 'Trocar', style: 'destructive', onPress: async () => {
                Session.setStore(nearestStore);
                setStore(nearestStore);
              }
            }
          ]);
      }
    }
  }

  useEffect(() => {
    if (!isTesting && global.showConfig && config?.bypassAppStore != true) {
      setTimeout(async () => {
        Alert.alert(
          'Configurações',
          'Você deseja configurar as notificações e localização?',
          [
            {
              text: 'Não', style: 'cancel', onPress: async () => {
                global.showConfig = false;

                Session.setGlobal(global);
                setGlobal({ ...global });
              }
            },
            {
              text: 'Configurar', style: 'destructive', onPress: async () => {
                navigation.navigate('InitialQuestionsStack');

                setTimeout(() => {
                  global.showConfig = false;

                  Session.setGlobal(global);
                  setGlobal({ ...global });
                }, 1000);
              }
            }
          ]);
      }, 4000);
    }
  }, []);

  useEffect(() => {
    if (configStores?.length == 1 && (store?._id != configStores?.[0]?._id)) {
      Session.setStore(configStores?.[0]);
      setStore(configStores?.[0]);
    }
  }, [global.timestamp]);

  useEffect(() => {
    if (!global.firstTime && global.permissions.location && global.permissions.suggestion) {
      setTimeout(async () => {
        if (Platform.OS == 'ios') {
          const granted = await Geolocation.requestAuthorization('whenInUse');
          if (granted === 'granted') {
            Geolocation.getCurrentPosition(
              (success) => {
                const loc = [success.coords.latitude, success.coords.longitude];
                global.loc = loc;

                const config = Session.getConfig();
                config?.stores?.map((store) => {
                  if (store?.place?.loc) {
                    let distance = getDistance(
                      { latitude: store?.place?.loc[0], longitude: store?.place?.loc[1] },
                      { latitude: global.loc[0], longitude: global.loc[1] }
                    );

                    distance = (distance / 1000);
                    distance = Math.round(distance);

                    store.distance = distance;
                  }
                });

                Session.setConfig(config);
                setGlobal({ ...global });

                suggestion();
              },
              (err) => { },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
          }
        } else if (Platform.OS == 'android') {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
              (success) => {
                const loc = [success.coords.latitude, success.coords.longitude];
                global.loc = loc;

                const config = Session.getConfig();
                config?.stores?.map((store) => {
                  if (store?.place?.loc) {
                    let distance = getDistance(
                      { latitude: store?.place?.loc[0], longitude: store?.place?.loc[1] },
                      { latitude: global.loc[0], longitude: global.loc[1] }
                    );

                    distance = (distance / 1000);
                    distance = Math.round(distance);

                    store.distance = distance;
                  }
                });

                Session.setConfig(config);
                setGlobal({ ...global });

                suggestion();
              },
              (err) => { },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
          }
        }
      }, 4000);
    }
  }, [global.firstTime, global.permissions.location, global.permissions.suggestion])

  /** @type { HeaderOptions }  */
  const options = {
    ...(Platform.OS == 'ios' && !Platform.isPad && !isTablet() && configStores?.length > 1) && {
      headerTitle: () => <TouchableOpacity style={{ justifyContent: 'center' }} onPress={() => { navigation.navigate('Stores', { backScreen: 'MainTab' }); }}><HeaderTitle>{store?.company ? store?.company : '...'} <Icon name={'chevron-down'} type={'feather'} size={15} color={colors.text} style={{ top: 2 }} /></HeaderTitle></TouchableOpacity>,
    },
    headerRight: ({ tintColor }) => (
      <>
        {showQrCode && <Button
          icon data={{
            icon: { name: 'qrcode', type: 'font-awesome', color: tintColor, size: 22 },
            onPress: async () => { await requestCameraPermission() }
          }}
          noMargin
        />}

        {Platform.OS == 'android' && configStores?.length > 1 &&
          <Button
            icon
            data={{
              icon: { name: 'swap', type: 'antdesign', color: tintColor, size: 24 },
              onPress: async () => {
                navigation.navigate('Stores', { backScreen: 'MainTab' });
              }
            }}
            noMargin
          />
        }
        {Platform.OS == 'android' &&
          <Button icon data={{
            icon: { name: 'search', type: 'ionicons', color: tintColor, size: 22 },
            onPress: async () => {
              navigation.navigate('SearchHome', { searcher: true })
            }
          }} noMargin />
        }
      </>
    ),
    headerLargeTitle: (Platform.isPad && isTablet() || configStores?.length <= 1),
    ...Platform.OS == 'ios' && {
      headerSearchBarOptions: {
        placeholder: 'Pesquisar',
        cancelButtonText: 'Cancelar',
        autoCapitalize: 'none',
        obscureBackground: false,
        hideWhenScrolling: false,
        onChangeText: (e) => setSearch(e.nativeEvent.text),
        onFocus: (e) => { e.preventDefault(); setFocus(true) },
        onBlur: (e) => { e.preventDefault() },
        onCancelButtonPress: (e) => { e.preventDefault(); setFocus(false) }
      }
    }
  }

  useLayoutEffect(() => {
    if (config?.status == 'active') {
      navigation.setOptions(options);
    } else {
      navigation.setOptions({ headerRight: null });
    }
  }, [navigation, colors, global, store, config, showQrCode])

  const requestCameraPermission = async () => {
    const platformEnum = Platform.select({ android: PERMISSIONS.ANDROID.CAMERA, ios: PERMISSIONS.IOS.CAMERA })
    const currentStatus = await check(platformEnum)

    if (currentStatus == RESULTS.GRANTED) {
      navigation.navigate('QrCode')
    } else {
      const result = await request(platformEnum)

      if (result == RESULTS.GRANTED) {
        navigation.navigate('QrCode')
      } else {
        showSettingsAlert()
      }
    }
  }

  const showSettingsAlert = () => {
    const alertText = Platform.select({
      android: 'Precisamos acessar a câmera do seu aparelho. Clique em configurações, entre em permissões e ative a opção câmera.',
      ios: 'Precisamos acessar a câmera do seu iPhone. Clique em ajustes e ative a opção câmera.'
    })
    const settingsText = Platform.select({
      android: 'Configurações',
      ios: 'Ajustes'
    })

    Alert.alert('Acesso a Câmera', alertText,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: settingsText, onPress: () => openSettings() },
      ]
    )
  }

  useEffect(() => {
    if (config?.qrCodeReader) checkLocation()
  }, [config, store])

  const checkLocation = async () => {
    try {
      const platformEnum = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      })

      const currentStatus = await check(platformEnum)

      if (currentStatus === 'granted') {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords

            const stores = config?.stores?.sort((a, b) => a.distance - b.distance)

            const isNearby = stores?.some((store) => {
              const storeLatitude = store?.place?.loc?.[0]
              const storeLongitude = store?.place?.loc?.[1]

              const distance = getDistance(
                { latitude, longitude },
                { latitude: storeLatitude, longitude: storeLongitude }
              )

              return distance <= 100
            })

            setShowQrCode(isNearby)
          },
          (error) => {
            console.error('Error getting location:', error)
          }
        )
      } else {
        console.warn('Location permission not granted')
      }
    } catch (error) {
      console.error('Error in checkLocation:', error)
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={[AndroidOldVersion() && { paddingVertical: 10 }]}
        contentInsetAdjustmentBehavior={"automatic"}
        keyboardShouldPersistTaps="handled"
        style={{ display: focus ? 'none' : 'flex' }}
        testID='MainScreen'
        accessibilityLabel='MainScreen'
      >
        <Cards />
        <MainCard />
        {store?._id && <BestSelling type={'featured'} backScreen={'MainTab'} />}
        <DefaultServices />
        {store?._id && store?.ad?.showZeroKm && <BestSelling type={'0km'} backScreen={'MainTab'} />}
        {store?._id && store?.ad?.showUsed && <BestSelling type={'pre-owned'} backScreen={'MainTab'} />}
        {store?._id && store?.ad?.showArmored && <BestSelling type={'armored'} backScreen={'MainTab'} />}

        <Divider />
      </ScrollView>

      {focus && <MainSearch search={search} />}
    </>
  )
}

export default Main;