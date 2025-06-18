import React, { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Share, DeviceEventEmitter, Platform, ScrollView, View, Linking, Dimensions, Alert } from 'react-native';
import { List, Item, Button, useColors, Divider } from 'react-native-ui-devkit';
import { isTablet } from 'react-native-device-info';
import analytics from '@react-native-firebase/analytics';

import { GlobalContext } from '../../libs/globalContext';
import Header from './header';
import helper from '../../libs/helper';
import Session from '../../libs/session';

const Account = (props) => {
  const { global, setGlobal, store } = useContext(GlobalContext);
  const { navigation } = props;
  const [selectedTab, setSelectedTab] = useState('MainTab');
  const { width } = Dimensions.get('screen');
  const [dividerAndroidTabletWidth, setDividerAndroidTabletWidth] = useState(((width * '0.44') - 40) * 1.7);
  const [share, setShare] = useState(false);
  const colors = useColors();
  const config = Session.getConfig();
  const analyticsStore = helper.formatToAnalytics(store?.company);

  const videoCall = helper.getServices(store, '65da42048eca108d87c91da6')
  const financing = helper.getServices(store, '65dcb7898eca108d87c91dbc')
  const valuation = helper.getServices(store, '65dcb7548eca108d87c91dbb')
  const fipeTable = helper.getServices(store, '65dcb7fe8eca108d87c91dbe')
  const scheduleServices = helper.getServices(store, '65dceeac8eca108d87c91dc6')
  const scheduleReview = helper.getServices(store, '65dcef098eca108d87c91dc7')
  const insurance = helper.getServices(store, '65dcb7238eca108d87c91dba')
  const forwardingAgent = helper.getServices(store, '65dcb6528eca108d87c91db9')
  const testdrive = helper.getServices(store, '65dcb5e78eca108d87c91db8')
  const consignment = helper.getServices(store, '65dcb7c58eca108d87c91dbd')
  const consortium = helper.getServices(store, '65dcef468eca108d87c91dc8')
  const directSales = helper.getServices(store, '65dcb8548eca108d87c91dbf')
  const partsAccessories = helper.getServices(store, '6628fd535bda2ae51f6fc5ff')

  useLayoutEffect(() => {
    if (config?.status == 'active') {
      navigation.setOptions({
        headerRight: ({ tintColor }) => (!config?.bypassAppStore || Platform.OS == 'android') && (
          <>
            {share && <Button icon right data={{ icon: { name: Platform.OS == 'ios' ? 'share-apple' : 'share', type: Platform.OS == 'ios' ? 'evilicons' : 'font-awesome', size: Platform.OS == 'ios' ? 33 : 19, color: tintColor }, onPress: () => { onShare(); } }} />}
            <Button icon right data={{ icon: { name: Platform.OS == 'ios' ? 'cog-outline' : 'cog', type: Platform.OS == 'ios' ? 'ionicons' : 'font-awesome5', size: Platform.OS == 'ios' ? 28 : 19, color: tintColor }, onPress: () => { onNavigate('AccountSettings') } }} />
          </>
        )
      });
    } else {
      navigation.setOptions({
        headerRight: null
      });
    }
  }, [navigation, config, store, colors, global, share])

  useEffect(() => {
    Dimensions.addEventListener('change', ({ window: { width, height } }) => {
      setDividerAndroidTabletWidth(((width * '0.44') - 40) * 1.7);
    });
  }, []);

  useEffect(() => {
    setShare(config?.googlePlay?.url != null && config?.appStore?.url != null);

    if (global.action == 'NavigateToSettingsSecurityConnectedDevices') {
      global.action = null;
      setGlobal({ ...global });

      onNavigate('SettingsSecurityAuthorizedDevices');
    }

    if (global.action == 'NavigateToSettingsWallet') {
      global.action = null;
      setGlobal({ ...global });

      onNavigate('SettingsWallet');
    }

    if (global.action == 'NavigateToSettingsSecurity') {
      global.action = null;
      setGlobal({ ...global });

      onNavigate('SettingsSecurity');
    }
  }, [global.action]);

  const DividerAndroidTablet = useCallback(() => {
    const colors = useColors();
    return Platform.OS == 'android' && width >= 768 &&
      <View style={{ flex: 1, height: 30, alignSelf: 'center', justifyContent: 'center', marginLeft: 10, transform: [{ scale: 0.6 }] }}>
        <View style={{ width: dividerAndroidTabletWidth, borderTopWidth: 1, borderTopColor: colors.tertiary, borderStyle: 'dashed' }} />
      </View>
  }, [dividerAndroidTabletWidth])

  const sms = (store?.sms?.ios || store?.sms?.android) && {
    icon: { name: Platform.OS == 'ios' ? 'chat' : 'message', type: 'material-community', size: Platform.OS == 'ios' ? 22 : 19, color: '#fff', backgroundColor: '#10BB17' },
    title: 'SMS',
    ...Platform.OS == 'android' && {
      description: `Para facilitar, entre em contato pelo nosso canal de atendimento por SMS.`
    },
    color: {
      title: colors.primary
    },
    chevron: false,
    onPress: () => {
      const phone = Platform.OS == 'ios' ? store?.sms?.ios : store?.sms?.android;
      Linking.canOpenURL(phone)
        .then((result) => {
          result && Linking.openURL(phone);
          !result && Alert.alert('Aviso', 'Você precisa instalar o aplicativo SMS para usar este canal de comunição!');
        })

      if (store?.sms?.formatted) {
        analytics().logEvent('click_on_sms', {
          store_id: store?._id,
          store_name: store?.company,
          sms: store?.sms?.formatted
        });
      }
    }
  };

  const whatsapp = (store?.whatsapp?.ios || store?.whatsapp?.android) && {
    icon: { name: 'whatsapp', type: 'font-awesome', size: 22, color: '#fff', backgroundColor: '#10BB17' },
    title: 'Whatsapp',
    ...Platform.OS == 'android' && {
      description: `Para facilitar, entre em contato pelo nosso canal de atendimento no Whatsapp.`
    },
    color: {
      title: colors.primary
    },
    chevron: false,
    onPress: () => {
      const phone = Platform.OS == 'ios' ? store?.whatsapp?.ios : store?.whatsapp?.android;
      Linking.canOpenURL(phone)
        .then((result) => {
          result && Linking.openURL(phone);
          !result && Alert.alert('Aviso', 'Você precisa instalar o aplicativo Whatsapp para usar este canal de comunição!');
        })

      if (store?.whatsapp?.formatted) {
        analytics().logEvent('click_on_whatsapp', {
          store_id: store?._id,
          store_name: store?.company,
          whatsapp: store?.whatsapp?.formatted
        });
      }
    }
  };

  const telegram = (store?.telegram?.ios || store?.telegram?.android) && {
    icon: { name: 'telegram', type: 'font-awesome', size: 20, color: '#fff', backgroundColor: '#229ED9' },
    title: 'Telegram',
    ...Platform.OS == 'android' && {
      description: `Para facilitar, entre em contato pelo nosso canal de atendimento no Telegram.`
    },
    color: {
      title: colors.primary
    },
    chevron: false,
    onPress: () => {
      const phone = Platform.OS == 'ios' ? store?.telegram?.ios : store?.telegram?.android;
      Linking.canOpenURL(phone)
        .then((result) => {
          result && Linking.openURL(phone);
          !result && Alert.alert('Aviso', 'Você precisa instalar o aplicativo Telegram para usar este canal de comunição!');
        })

      if (store?.telegram?.formatted) {
        analytics().logEvent('click_on_telegram', {
          store_id: store?._id,
          store_name: store?.company,
          telegram: store?.telegram?.formatted
        });
      }
    }
  };

  const iPadMenu = ((isTablet() || Platform.isPad) && ((config?.bypassAppStore != true) || Platform.OS == 'android')) && [
    { icon: { name: 'home', type: 'material-community', size: 22, color: '#fff', backgroundColor: colors.primary }, title: 'Início', description: Platform.OS == 'android' && 'Anúncios e promoções, destaques e muito mais...', delay: !isTablet(), selected: selectedTab == 'MainTab', onPress: () => { onNavigate('MainTab'); } },
    { icon: { name: 'list', type: 'ionicons', size: 21, color: '#fff', backgroundColor: colors.primary }, title: 'Estoque', description: Platform.OS == 'android' && 'Veja todas as nossas ofertas.', delay: !isTablet(), selected: selectedTab == 'SearchTab', onPress: () => { onNavigate('SearchTab'); } },
  ]

  const aboutFavorites = [
    { icon: { name: 'heart', type: 'material-community', size: 20, color: '#fff', backgroundColor: colors.notification }, title: 'Favoritos', description: (Platform.OS == 'android' && 'Veja aqui os veículos que você favoritou.'), delay: false, selected: selectedTab == 'Favorites', onPress: () => { onNavigate('Favorites') } },
    { icon: { name: 'information', type: 'ionicons', size: 25, color: '#fff', backgroundColor: colors.primary }, title: 'Sobre nós', description: (Platform.OS == 'android' && 'Sobre-nós, endereço e horários de funcionando.'), delay: !isTablet(), selected: selectedTab == 'AboutUs', onPress: () => { onNavigate('AboutUs'); } }
  ]

  const onNavigate = (screen, params) => {
    if ((isTablet() || Platform.isPad) && ((config?.bypassAppStore != true) || Platform.OS == 'android')) {
      DeviceEventEmitter.emit('navigate', { screen, params });

      if (screen == 'MainTab' || screen == 'SearchTab' || screen == 'Favorites' || screen == 'AboutUs' || screen == 'AccountSettings') {
        setSelectedTab(screen);
      }
    } else {
      navigation && navigation.navigate(screen, params);
    }
  }

  const onShare = async () => {
    let googlePlayUrl = config?.googlePlay?.url ?? '';
    let appStoreUrl = config?.appStore?.url ?? '';

    const accountName = config?.name ?? '';

    try {
      await Share.share({
        dialogTitle: `${accountName} na Google Play e App Store`,
        title: `${accountName} na Google Play e App Store`,
        message: `Olá,\n\nConheça o app ${accountName}!\n\nGoogle Play:\n${googlePlayUrl}\n\nApp Store:\n${appStoreUrl}`
      });
    } catch (err) { }
  };

  return (
    <ScrollView
      scrollEventThrottle={0.1}
      contentOffset={{ x: 0, y: -1 }}
      contentInsetAdjustmentBehavior={'automatic'}
      keyboardShouldPersistTaps='handled'
      style={{ flex: 1 }}
      testID='AccountSidebar'
      accessibilityLabel='AccountSidebar'
    >
      <Header {...props} onNavigate={onNavigate} selectedTab={selectedTab} setSelectedTab={setSelectedTab} type={1} />

      <DividerAndroidTablet />
      <Item data={sms} tabletIpadMenuType={isTablet()} forceNative={isTablet()} />
      {sms && <DividerAndroidTablet />}

      <List data={[
        whatsapp,
        telegram
      ]} tabletIpadMenuType={isTablet()} forceNative={isTablet()} />

      {(whatsapp || telegram) && <DividerAndroidTablet />}

      <List data={iPadMenu} tabletIpadMenuType={isTablet()} forceNative={isTablet()} />
      <DividerAndroidTablet />

      <Item data={videoCall?.service?.lead && { icon: { ...videoCall?.icon, backgroundColor: colors.notification }, title: videoCall?.title, description: Platform.OS == 'android' && videoCall?.description, onPress: () => onNavigate(videoCall?.route, { service: videoCall }) }} tabletIpadMenuType={isTablet()} forceNative={isTablet()} />
      {videoCall?.service?.lead && <DividerAndroidTablet />}

      {(financing?.service?.lead || valuation?.service?.lead) &&
        <>
          <List data={[
            financing?.service?.lead && { icon: { ...financing?.icon, backgroundColor: colors.primary }, title: financing?.title, description: Platform.OS == 'android' && financing?.description, onPress: () => onNavigate(financing?.route, { service: financing }) },
            valuation?.service?.lead && { icon: { ...valuation?.icon, backgroundColor: '#FF445B' }, title: valuation?.title, description: Platform.OS == 'android' && valuation?.description, onPress: () => onNavigate(valuation?.route, { service: valuation }) }
          ]} tabletIpadMenuType={isTablet()} forceNative={isTablet()} />
          <DividerAndroidTablet />
        </>
      }

      {fipeTable?.service &&
        <>
          <Item data={fipeTable && { icon: { ...fipeTable?.icon, backgroundColor: '#2EACE1' }, title: fipeTable?.title, description: Platform.OS == 'android' && fipeTable?.description, onPress: () => onNavigate(fipeTable?.route, { service: fipeTable }) }}
            tabletIpadMenuType={isTablet()} forceNative={isTablet()} />
          <DividerAndroidTablet />
        </>
      }

      {(scheduleServices?.service?.lead || scheduleReview?.service?.lead || insurance?.service?.lead || forwardingAgent?.service?.lead || testdrive?.service?.lead || consignment?.service?.lead || consortium?.service?.lead) &&
        <>
          <List data={[
            scheduleServices?.service?.lead && { icon: scheduleServices?.icon, title: scheduleServices?.title, description: Platform.OS == 'android' && scheduleServices?.description, onPress: () => onNavigate(scheduleServices?.route, { service: scheduleServices }) },
            scheduleReview?.service?.lead && { icon: scheduleReview?.icon, title: scheduleReview?.title, description: Platform.OS == 'android' && scheduleReview?.description, onPress: () => onNavigate(scheduleReview?.route, { service: scheduleReview }) },
            insurance?.service?.lead && { icon: { ...insurance?.icon, backgroundColor: '#5A57D2' }, title: insurance?.title, description: Platform.OS == 'android' && insurance?.description, onPress: () => onNavigate(insurance?.route, { service: insurance }) },
            forwardingAgent?.service?.lead && { icon: { ...forwardingAgent?.icon, backgroundColor: '#09BE9E' }, title: forwardingAgent?.title, description: Platform.OS == 'android' && forwardingAgent?.description, onPress: () => onNavigate(forwardingAgent?.route, { service: forwardingAgent }) },
            testdrive?.service?.lead && { icon: { ...testdrive?.icon, backgroundColor: '#F19B38' }, title: testdrive?.title, description: Platform.OS == 'android' && testdrive?.description, onPress: () => onNavigate(testdrive?.route, { service: testdrive }) },
            partsAccessories?.service?.lead && { icon: { ...partsAccessories?.icon, backgroundColor: '#F19B38' }, title: partsAccessories?.title, description: Platform.OS == 'android' && partsAccessories?.description, onPress: () => onNavigate(partsAccessories?.route, { service: partsAccessories }) },
            consignment?.service?.lead && { icon: { ...consignment?.icon, backgroundColor: '#FF445B' }, title: consignment?.title, description: Platform.OS == 'android' && consignment?.description, onPress: () => onNavigate(consignment?.route, { service: consignment }) },
            consortium?.service?.lead && { icon: { ...consortium?.icon, backgroundColor: colors.primary }, title: consortium?.title, description: Platform.OS == 'android' && consortium?.description, onPress: () => onNavigate(consortium?.route, { service: consortium }) }
          ]} tabletIpadMenuType={isTablet()} forceNative={isTablet()} />
          <DividerAndroidTablet />
        </>
      }

      {directSales?.service?.lead &&
        <>
          <Item data={directSales?.service?.lead && { icon: { ...directSales?.icon, backgroundColor: '#1B99A0' }, title: directSales?.title, description: Platform.OS == 'android' && directSales?.description, onPress: () => onNavigate(directSales?.route, { service: directSales }) }}
            tabletIpadMenuType={isTablet()} forceNative={isTablet()} />
          <DividerAndroidTablet />
        </>
      }

      {config?.status == 'active' && <List data={aboutFavorites} tabletIpadMenuType={isTablet()} forceNative={isTablet()} />}

      {Platform.OS == 'ios' && <Divider />}
    </ScrollView>
  )
}

export default Account;