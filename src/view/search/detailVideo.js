import React, { useLayoutEffect, useState } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import { View } from "react-native"
import Video from 'react-native-video'


const DetailVideo = () => {
  const [videoPaused, setVideoPaused] = useState(false)
  const navigation = useNavigation()
  const route = useRoute()

  const carParam = route?.params?.car

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${carParam?.brand} ${carParam?.model}`,
      headerBackTitle: `Voltar`,
      headerBackButtonMenuEnabled: false,
    })
  }, [navigation, carParam])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
      <Video
        resizeMode="contain"
        controls={true}
        posterResizeMode={'cover'}
        paused={videoPaused}
        ignoreSilentSwitch="ignore"
        source={{ uri: carParam?.video }}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  )
}

export default DetailVideo