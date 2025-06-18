import { useContext, useEffect, useMemo } from 'react';
import { Appearance, FlatList, Image, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DescriptionFontSize, Divider, Item, Separator, TitleFontSize, useColors } from 'react-native-ui-devkit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import analytics from '@react-native-firebase/analytics';
import FastImage from 'react-native-fast-image';

import { GlobalContext } from '../../libs/globalContext';
import { NoAdYet } from '../../components/noDataYet';
import GET from '../../libs/api';
import Session from '../../libs/session';
import helper from '../../libs/helper';

let searchTimeout;

const MainSearch = ({ search }) => {
  const { global, setGlobal, store, setStore } = useContext(GlobalContext);
  const navigation = useNavigation()
  const queryClient = useQueryClient();
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const theme = Appearance.getColorScheme();

  const config = Session.getConfig();

  useEffect(() => {
    if (search) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        analytics().logSearch({ search_term: search })
      }, 4000);
    }
  }, [search])

  const { data: queryData, isLoading, isFetching } = useQuery({
    queryKey: ['SearchFilters', store, search],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await GET(pageParam, 10, search, null, null, setGlobal, queryClient)
      return response;
    },
  })

  const searchData = useMemo(() => {
    let result = queryData?.data;

    if (search) {
      search?.split(' ')?.map((term) => {
        result = result?.filter((item) =>
          (item?.brand?.toLowerCase().includes(term?.trim().toLowerCase())) ||
          (item?.model?.toLowerCase().includes(term?.trim().toLowerCase())) ||
          (item?.color?.toLowerCase().includes(term?.trim().toLowerCase())) ||
          (item?.transmission?.toLowerCase().includes(term?.trim().toLowerCase())) ||
          (item?.fuel?.toLowerCase().includes(term?.trim().toLowerCase())) ||
          (item?.optionals?.some(optional => optional.toLowerCase().includes(term?.trim().toLowerCase())))
        )
      })
    }
    return result
  }, [search, store])

  const ListData = searchData ? [...searchData] : queryData?.data ? [...queryData?.data?.slice(0, 10)] : []

  const renderItem = ({ item, index, separators }) => {
    ListData[index].separators = separators;

    return (
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
                    style={[{ position: 'absolute', width: 62, height: 62, borderRadius: 10 }]}
                  />
                }

                <FastImage source={{ uri: item.photos[0] }} defaultSource={theme == 'dark' ? require('../../assets/img/watermark-dark.png') : require('../../assets/img/watermark.png')} resizeMode="cover" style={[{ width: 62, height: 62, borderRadius: 10 }]} />
              </>
          },
          component:
            <Item
              data={{
                component:
                  <>
                    <View style={{ flex: 1, marginLeft: Platform.OS == 'ios' ? 15 : 20, marginVertical: 10 }}>
                      <Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left' }]} numberOfLines={1}>{item.brand} {item.model} {item.version}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[DescriptionFontSize(), { color: colors.text }]} numberOfLines={1}>{item.manufactureYear}/{item.modelYear} {item.fuel} {item.transmission} {new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(item.mileage)}</Text>
                      </View>
                      <Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', marginTop: 10 }]}>{item?.price ? Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(item.price) : 'Consulte'}</Text>

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
              separators={false}
              expanded
              style={{ backgroundColor: 'transparent' }}
            />,
          separator: {
            data: [ListData[index - 1], item],
            index
          },
          onPress: () => {
            navigation.navigate('Detail', { ad: item, title: 'Estoque' })
          }
        }}
        marginTop={false}
        expanded
        index={index} count={ListData.length > 10 ? 10 : ListData.length}
      />
    )
  }

  return (
    <FlatList
      data={ListData?.slice(0, 10)}
      contentInsetAdjustmentBehavior='automatic'
      keyExtractor={(item, index) => String(index)}
      ItemSeparatorComponent={(props) => { return <Separator props={props} start={Platform.OS == 'ios' ? 76 : 110} /> }}
      keyboardDismissMode='on-drag'
      renderItem={renderItem}
      style={{ backgroundColor: (Platform.OS == 'ios') ? colors.ios.item : colors.android.item }}
      ListEmptyComponent={
        <>
          <Divider />
          <NoAdYet loading={isFetching} text={search} />
        </>
      }
    />
  )
}

export default MainSearch