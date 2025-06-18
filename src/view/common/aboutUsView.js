import React, { useContext, useEffect, useLayoutEffect } from 'react';
import { Text } from 'react-native';
import { Divider, useColors, TitleFontSize } from 'react-native-ui-devkit';
import analytics from '@react-native-firebase/analytics';

import { GlobalContext } from '../../libs/globalContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native';

const AboutUs = () => {
  const { global, store } = useContext(GlobalContext);
  const navigation = useNavigation()
  const colors = useColors();

  const route = useRoute();
  const title = route.params?.title;
  const description = route.params?.description;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title
    });
  }, [navigation, global, colors])

  useEffect(() => {
    if (store && title) {
      const screen = `${store?.company} - Sobre-nós - ${title}`;
      analytics().logScreenView({
        screen_name: screen,
        screen_class: screen,
      });
    }
  }, [store, title])

  return (
    <ScrollView
      scrollEventThrottle={0.1}
      contentOffset={{ x: 0, y: -1 }}
      contentInsetAdjustmentBehavior={'automatic'}
      keyboardShouldPersistTaps='handled'
      style={{ flex: 1 }}>
      <Divider />

      <Text style={[TitleFontSize(), { color: colors.text, marginHorizontal: 15 }]}>{description}</Text>

      <Divider />
    </ScrollView>
  );
}

export default AboutUs;