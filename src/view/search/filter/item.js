import React, { useLayoutEffect, useMemo, useState } from "react"
import { FlatList, Platform } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Button, Divider, Item, useColors } from "react-native-ui-devkit"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import NoDataYet from "../../../components/noDataYet"

const AdsFilterItem = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()
  const colors = useColors()

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


  const showFinishButton = useMemo(() => {
    return field != 'brand' && field != 'model' && !field?.includes('price') && !field?.includes('year') && field != 'mileage' && field != 'store' && field != 'condition'
  }, [field])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      ...Platform.OS == 'ios' && { headerLeft: () => <Button link data={{ title: 'Cancelar', onPress: () => { navigation.goBack() } }} /> },
      ...showFinishButton && {
        headerRight: () =>
          <Button
            link
            data={{
              title: 'Concluir',
              disabled: !data?.length,
              onPress: () => {
                navigation.popTo(backScreenName, { field, value: data }, { merge: true })
              }
            }}
          />
      },

      ...Platform.OS == 'ios' && {
        headerSearchBarOptions: {
          placeholder: 'Pesquisar',
          cancelButtonText: 'Cancelar',
          autoCapitalize: 'none',
          headerIconColor: colors.background,
          hideWhenScrolling: false,
          onChangeText: (event) => setSearch(event.nativeEvent.text),
          onClose: () => { navigation.goBack(); }
        }
      }
    })

  }, [navigation, title, field, data])

  const renderItem = ({ item, index }) => {
    return (
      <Item
        data={{
          title: item?.description,
          description: item?.count != null ? `(${item?.count})` : '',
          ...field == 'store' && {
            subdescription: item?.count != null ? `(${item?.count}) veículo(s)` : ''
          },
          disabled: item?.count == 0,
          radio: Array.isArray(data) ? data.includes(item?.description) : data == item?.description,
          onPress: () => {
            if (field != 'condition' && field != 'brand' && field != 'model' && !field?.includes('price') && !field?.includes('year') && field != 'mileage' && field != 'store') {
              setData(prevState => prevState?.includes(item?.description) ? prevState?.filter(i => i !== item?.description) : [...prevState, item?.description])
            } else {
              navigation.popTo(backScreenName, { field, value: item?.description }, { merge: true })
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