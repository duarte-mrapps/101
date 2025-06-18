import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { FlatList, Platform, useWindowDimensions } from "react-native"
import { Button, Divider, Item, useColors } from "react-native-ui-devkit"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import NoDataYet from "../../../components/noDataYet"


const AdsFilterItem = () => {
  const colors = useColors()
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  const arrayItems = route.params?.arrayItems
  const backScreenName = route.params?.backScreenName
  const selectedItem = route.params?.selectedItem
  const title = route.params?.title
  const field = route.params?.field

  const [search, setSearch] = useState('')
  const [data, setData] = useState(selectedItem)

  const searchedList = useMemo(() => {
    if (!search) return arrayItems;
    return arrayItems?.filter(item => item?.description?.toLowerCase()?.includes(search));
  }, [arrayItems, search]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      ...Platform.OS == 'ios' && { headerLeft: () => <Button link data={{ title: 'Cancelar', onPress: () => { navigation.goBack() } }} /> },
      ...field != 'brand' && field != 'model' && !field?.includes('price') && !field?.includes('year') && field != 'mileage' && {
        headerRight: () =>
          <Button
            link
            right
            data={{
              title: 'Concluir',
              disabled: !data?.length,
              onPress: () => {
                navigation.navigate({
                  name: backScreenName,
                  params: { field, value: data },
                  merge: true
                })
              }
            }}
          />
      },
      headerSearchBarOptions: {
        placeholder: 'Pesquisar',
        cancelButtonText: 'Cancelar',
        autoCapitalize: 'none',
        headerIconColor: colors.background,
        hideWhenScrolling: false,
        onChangeText: (event) => setSearch(event.nativeEvent.text),
        onClose: () => { navigation.goBack(); }
      }
    })

  }, [navigation, title, field, data])

  const renderItem = ({ item, index }) => {
    return (
      <Item
        data={{
          title: item?.description,
          description: item?.count && `(${item?.count})`,
          radio: Array.isArray(data) ? data.includes(item?.description) : data == item?.description,
          onPress: () => {
            if (field != 'condition' && field != 'brand' && field != 'model' && !field?.includes('price') && !field?.includes('year') && field != 'mileage' && field != 'store') {
              setData(prevState => prevState?.includes(item?.description) ? prevState?.filter(i => i !== item?.description) : [...prevState, item?.description])
            } else {
              navigation.navigate({
                name: backScreenName,
                params: { field, value: item?.description },
                merge: true
              })
            }
          },
        }}
        index={index}
        count={searchedList?.length}
      />
    )
  }

  return (
    <FlatList
      data={searchedList}
      keyExtractor={(_, index) => String(index)}
      keyboardDismissMode="on-drag"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: insets?.bottom ?? 15 }}
      renderItem={renderItem}
      ListEmptyComponent={<><Divider /><NoDataYet loading={false} text={search} /></>}
    />
  )
}

export default AdsFilterItem