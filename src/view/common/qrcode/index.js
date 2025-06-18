import { useEffect, useLayoutEffect, useState } from "react"
import { ActivityIndicator, Alert, Appearance, Platform, StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { Button, useColors } from "react-native-ui-devkit"
import { useHeaderHeight } from '@react-navigation/elements'
import { useNavigation } from "@react-navigation/native"
import { isTablet } from "react-native-device-info"
import { Camera, CameraType } from 'react-native-camera-kit';
import hapticFeedback from "react-native-haptic-feedback"
import ExtraDimensions from 'react-native-extra-dimensions-android';
import NavigationBar from 'react-native-navbar-color';

import { GETONE } from "../../../libs/api"

const QrCode = () => {
  const navigation = useNavigation()
  const headerHeight = useHeaderHeight()
  const { width } = useWindowDimensions()
  const colors = useColors()

  const [torch, setTorch] = useState('off');
  const [qrCode, setQrCode] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerLeft: () => <Button link blue={Platform.OS == 'android'} data={{ title: "Cancelar", onPress: () => navigation.goBack() }} /> })
  }, [navigation])

  useEffect(() => {
    if (qrCode) {
      hapticFeedback.trigger('impactMedium');
      getAdWithQrCode(qrCode)
    }
  }, [qrCode])


  const getAdWithQrCode = async (qrCode) => {
    if (qrCode?.split(':')[0] == 'mobiapp') {
      const ad = await GETONE(null, qrCode.replace('mobiapp:', ''))
      if (ad) {
        navigation.goBack()
        setTimeout(() => {
          navigation.navigate('Detail', { ad: ad, title: 'Estoque', backScreen: 'MainTab' })
        }, 150)
      } else {
        Alert.alert('Veículo indisponivel', null, [
          {
            text: 'OK',
            onPress: () => {
              setQrCode(null)
            }
          }
        ])
      }
    } else {
      Alert.alert('QRCode inválido', null, [{
        text: 'OK',
        onPress: () => {
          setQrCode(null)
        }
      }])
    }
  }



  useEffect(() => {
    if (Platform.OS == 'android') {
      const soft = ExtraDimensions.getIsSoftMenuBar();
      const color = soft ? colors.background : '#000000'

      StatusBar.setBackgroundColor('#000000', true);
      StatusBar.setBarStyle('light-content', true);

      NavigationBar.setColor('#000000');

      return () => {
        StatusBar.setBackgroundColor(Appearance.getColorScheme() === 'dark' ? '#000' : colors.background, true);
        StatusBar.setBarStyle(Appearance.getColorScheme() === 'dark' ? 'light-content' : 'dark-content', true);

        NavigationBar.setColor(color);
      }
    }
  }, [colors])

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Camera
        scanBarcode={!qrCode}
        onReadCode={async (event) => { setQrCode(event?.nativeEvent?.codeStringValue); }}
        style={StyleSheet.absoluteFill}
        cameraType={CameraType.Back}
        torchMode={torch}
      />
      <View style={{ flex: 1, width: '100%', backgroundColor: '#000000cc', alignItems: 'center', justifyContent: 'center', paddingTop: headerHeight }}>
        <Text style={{ marginTop: 0, marginHorizontal: 30, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
          Escaneie o QR Code
        </Text>
        <Text style={{ marginVertical: 10, marginHorizontal: 25, textAlign: 'center', color: '#fff', fontSize: 17 }}>
          Posicione sua camera em cima do {'\n'} QR Code
        </Text>
      </View>
      <View style={{ borderWidth: isTablet() ? 260 : 48, width: width, height: width, justifyContent: 'center', borderLeftColor: '#000000cd', borderTopColor: '#000000cc', borderRightColor: '#000000cd', borderBottomColor: '#000000cc' }}>
        <View style={{ width: (width / 4), height: (width / 4), borderLeftWidth: 8, borderTopWidth: 8, borderColor: '#fff', borderTopStartRadius: 25, borderTopLeftRadius: 25, position: 'absolute', top: -8, left: -8 }} />
        <View style={{ width: (width / 4), height: (width / 4), borderTopWidth: 8, borderRightWidth: 8, borderColor: '#fff', borderTopEndRadius: 25, borderTopRightRadius: 25, position: 'absolute', top: -8, right: -8 }} />
        <View style={{ width: (width / 4), height: (width / 4), borderRightWidth: 8, borderBottomWidth: 8, borderColor: '#fff', borderBottomEndRadius: 25, borderBottomRightRadius: 25, position: 'absolute', bottom: -8, right: -8 }} />
        <View style={{ width: (width / 4), height: (width / 4), borderLeftWidth: 8, borderBottomWidth: 8, borderColor: '#fff', borderBottomStartRadius: 25, borderBottomLeftRadius: 25, position: 'absolute', bottom: -8, left: -8 }} />

        {qrCode && <ActivityIndicator size={'small'} color={'#fff'} />}
      </View>
      <View style={{ flex: 1, width: '100%', backgroundColor: '#000000cc', justifyContent: 'center', alignItems: 'center', paddingBottom: isTablet() ? 260 : 32 }}>
        <Button
          icon
          data={{
            icon: { name: (torch == 'off') ? 'flash-off-sharp' : 'flash-sharp', type: 'ionicons', size: 26, color: '#fff' },
            onPress: () => { setTorch(torch == 'off' ? 'on' : 'off') }
          }}
          style={{ backgroundColor: '#ffffff15', borderRadius: 50, padding: 10 }} />
      </View>
    </View>
  )
}

export default QrCode