import React, { useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Appearance, Dimensions, Platform, Text, View } from 'react-native';
import { Divider, useColors, Button, Separator, Item, IosOldVersion, TitleFontSize, MediumFontSize, Icon } from 'react-native-ui-devkit';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HeaderOptions } from '@react-navigation/elements';

import { GlobalContext } from '../../libs/globalContext';
import { FlatList } from 'react-native';
import NoDataYet from '../../components/noDataYet';
import Session from '../../libs/session';
import { FilterContext } from '../../libs/filterContext';
import { useQueryClient } from '@tanstack/react-query';
import { isTablet } from 'react-native-device-info';
import FastImage from 'react-native-fast-image';

const Stores = () => {
  const { global, setGlobal, store, setStore } = useContext(GlobalContext);
  const { clearFilter } = useContext(FilterContext)
  const queryClient = useQueryClient();
  const theme = Appearance.getColorScheme();
  const [search, setSearch] = useState(null);
  const [loading, setLoading] = useState(null);
  const route = useRoute()
  const searcher = route?.params?.searcher;
  const backScreen = route.params?.backScreen

  const { width } = Dimensions.get('screen');

  const config = Session.getConfig();

  useEffect(() => {
    if (global.loc?.[0] != 0 && global.loc?.[1] != 0) {

    }
  }, [global])

  const stores = useMemo(() => {
    const stores = config?.stores?.filter((store) => (store?.hidden != true && store?.services?.length > 0));

    const result = search?.length
      ? stores
        ?.filter(item =>
          (item?.company?.toLowerCase().includes(search?.trim()?.toLowerCase())) ||
          (item?.document?.toLowerCase().includes(search?.trim()?.toLowerCase())) ||
          (item?.place?.address?.toLowerCase().includes(search?.trim()?.toLowerCase())) ||
          search == null
        )
      : (Platform.OS == 'ios' || !searcher)
        ? stores
          ?.filter(item =>
            (item?.company?.toLowerCase().includes(search?.trim()?.toLowerCase())) ||
            (item?.document?.toLowerCase().includes(search?.trim()?.toLowerCase())) ||
            (item?.place?.address?.toLowerCase().includes(search?.trim()?.toLowerCase())) ||
            search == null
          )
        : [];

    result.sort((a, b) => a.distance - b.distance);

    return result
  }, [search])

  const colors = useColors()
  const navigation = useNavigation()

  /** @type { HeaderOptions }  */
  const options = {
    ...searcher && { title: '' },
    ...Platform.OS == 'ios' && !global.firstTime && {
      headerLeft: () => <Button link data={{ title: 'Cancelar', onPress: () => { navigation.goBack() } }} />
    },
    headerRight: ({ tintColor }) => (
      <>
        {(Platform.OS == 'android' && !searcher) &&
          <Button icon data={{
            icon: { name: 'search', type: 'ionicons', color: tintColor, size: 22 },
            onPress: async () => {
              navigation.navigate('StoresSearch', { searcher: true, backScreen })
            }
          }} noMargin />}
      </>
    ),
    ...(Platform.OS == 'ios' || searcher) && {
      headerSearchBarOptions: {
        placeholder: 'Pesquisar',
        cancelButtonText: 'Cancelar',
        autoCapitalize: 'none',
        textColor: colors.text,
        headerIconColor: colors.background,
        headerCloseIconColor: colors.secondary,
        hintTextColor: colors.secondary,
        ...(searcher && { autoFocus: true }),
        hideWhenScrolling: false,
        obscureBackground: false,
        onChangeText: (e) => setSearch(e.nativeEvent.text),
        onFocus: (e) => { e.preventDefault(); },
        onBlur: (e) => { e.preventDefault() },
        onCancelButtonPress: (e) => { e.preventDefault(); },
        onClose: (e) => { navigation?.goBack(); }
      }
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions(options);
  }, [navigation, colors])

  const renderItem = ({ item, index, separators }) => {
    stores[index].separators = separators;

    return (
      <>
        <Item data={{
          title: item.company,
          description: item.place?.address,
          subdescription: item.place?.address,
          ...item.distance && {
            badge: {
              value: `${item.distance} km`,
              color: {
                badge: 'transparent',
                text: colors.primary
              }
            }
          },
          radio: !global.firstTime ? store?._id == item._id : false,
          loading: loading == item._id,
          separator: {
            data: [stores[index - 1], item],
            index
          },
          onPress: () => {
            setLoading(item._id);
            Session.setStore(item);

            setTimeout(() => {
              setStore(item);

              if (global.firstTime) {
                global.firstTime = false;

                Session.setGlobal(global);
                setGlobal((prevState) => ({ ...prevState, firstTime: false, timestamp: Date.now() }));

                if (Platform.OS == 'android' && searcher) {
                  navigation.goBack();
                }
              } else {
                if ((isTablet() || Platform.isPad) && width >= 768) {
                  navigation.goBack();
                } else {
                  backScreen && navigation.navigate(backScreen);
                }

                setGlobal((prevState) => ({ ...prevState, loadedAds: false, timestamp: Date.now() }));

                setTimeout(() => {
                  queryClient.invalidateQueries().then(() => {
                    setGlobal((prevState) => ({ ...prevState, loadedAds: false, timestamp: Date.now() }));

                    clearFilter();
                  })
                }, 500);
              }
            }, 250);
          }
        }}
          index={index} count={stores?.length} />
      </>
    )
  }

  return (
    <FlatList
      data={stores}
      keyExtractor={(item, index) => String(index)}
      renderItem={renderItem}
      ItemSeparatorComponent={(props) => { return <Separator props={props} start={Platform.OS == 'ios' ? 42 : 60} /> }}
      ListEmptyComponent={
        <>
          <Divider />
          <NoDataYet text={search} />
        </>
      }
      ListHeaderComponent={
        <>
          {(global.firstTime && (search == '' || search == null)) &&
            <>
              {IosOldVersion() && <Divider />}

              <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: IosOldVersion() ? 0 : 15, paddingHorizontal: 40 }}>

                {(config?.icon?.light && config?.icon?.dark)
                  ? <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <FastImage
                      source={{ uri: (theme == 'light' ? config?.icon?.light : config?.icon?.dark) ?? (theme == 'light' ? config?.icon?.light : config?.icon?.dark), priority: FastImage.priority.high }}
                      style={[{ width: 60, height: 60, overflow: 'hidden', borderRadius: 30 }]} imageStyle={[{ width: 60, height: 60 }]}>
                    </FastImage>
                  </View>
                  : <Icon name={'person-circle'} type={'ionicons'} color={colors.tertiary} size={74} style={{ marginBottom: Platform.OS == 'ios' ? -14 : -15, width: 67, alignSelf: 'center' }}></Icon>
                }

                <Divider />

                <Text style={[TitleFontSize(1.5), { fontWeight: '600', color: colors.text }]}>{config?.name}</Text>
                <Text style={[MediumFontSize(), { fontWeight: '400', color: colors.text, textAlign: 'center', marginTop: 5 }]}>Antes de começar, você precisa selecionar a loja de sua preferência.</Text>
              </View>
            </>
          }
        </>
      }
      contentInsetAdjustmentBehavior={'automatic'}
      keyboardDismissMode={'on-drag'}
      keyboardShouldPersistTaps={'handled'}
    />
  );
}

export default Stores;