import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Button, Divider, Item, Separator, useColors } from "react-native-ui-devkit"
import { useNavigation, useRoute } from "@react-navigation/native"
import { FlatList, Platform } from "react-native"
import { useDebounce } from "use-debounce"
import { useQuery } from "@tanstack/react-query"

import { GlobalContext } from "../../../../libs/globalContext"
import NoDataYet from "../../../../components/noDataYet"
import API_FIPE from "../../../../libs/api/fipe"

const Fipe = () => {
  const { store } = useContext(GlobalContext);
  const navigation = useNavigation()
  const route = useRoute()

  const vehicleType = route.params?.vehicleType
  const field = route.params?.field
  const fieldValue = route.params?.fieldValue
  const backScreen = route.params?.backScreen
  const searcher = route?.params?.searcher;

  const colors = useColors()

  const [search, setSearch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debounceValue] = useDebounce(search, 1000);

  /** @type { React.MutableRefObject<import('@react-navigation/elements').HeaderSearchBarRef> } */
  const searchBarRef = useRef()

  useEffect(() => {
    if (searcher) {
      setTimeout(() => {
        searchBarRef.current?.focus()
      }, 500)
    }
  }, [searcher])


  /** @type { HeaderOptions }  */
  const options = {
    title: searcher ? '' : (field == 'brand' ? 'Marca' : field == 'model' ? 'Modelo' : 'Ano'),
    headerRight: ({ tintColor }) => (
      <>
        {(Platform.OS == 'android' && !searcher) &&
          <Button icon data={{
            icon: { name: 'search', type: 'ionicons', color: tintColor, size: 22 },
            onPress: async () => {
              navigation.popTo('Fipe', { ...route?.params, searcher: true })
            }
          }} noMargin />}
      </>
    ),
    ...(Platform.OS == 'ios' || searcher) && {
      headerSearchBarOptions: {
        ref: searchBarRef,
        placeholder: 'Pesquisar',
        cancelButtonText: 'Cancelar',
        autoCapitalize: 'none',
        textColor: colors.text,
        headerIconColor: colors.background,
        hintTextColor: colors.secondary,
        ...(searcher && { autoFocus: true }),
        hideWhenScrolling: false,
        obscureBackground: false,
        onChangeText: (e) => { setSearch(e.nativeEvent.text); setLoading(true) },
        onFocus: (e) => e.preventDefault(),
        onBlur: (e) => e.preventDefault(),
        onCancelButtonPress: (e) => setSearch(null),
        onClose: (e) => { navigation?.goBack(null); }
      }
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions(options)
  }, [field, searcher])

  const { data: queryData, isFetching, isFetched } = useQuery({
    queryKey: ['Fipe', vehicleType, field, fieldValue],
    queryFn: async () => {
      const response = await API_FIPE.get(store, vehicleType, fieldValue?.brand?._id, fieldValue?.model?._id, null)
      return response.data
    },
  })
  

  const dataList = useMemo(() => {
    let list = searcher ? (debounceValue ? queryData : []) : queryData;

    if (debounceValue) {
      debounceValue?.split(' ')?.map?.((text) => {
        list = list?.filter((item) => item?.label?.toLowerCase().includes(text.trim().toLowerCase()))
      })
    }

    setLoading(false)
    return list;
  }, [queryData, debounceValue, searcher])

  return (
    <FlatList
      data={dataList}
      keyExtractor={(item, index) => String(index)}
      ItemSeparatorComponent={(props) => { return <Separator props={props} start={Platform.OS == 'ios' ? 15 : 20} /> }}
      ListEmptyComponent={
        <>
          <Divider />
          <NoDataYet loading={isFetching || loading} text={debounceValue} />
        </>
      }
      windowSize={21}
      contentInsetAdjustmentBehavior={'automatic'}
      keyboardDismissMode={'on-drag'}
      keyboardShouldPersistTaps={'handled'}
      removeClippedSubviews={true}
      initialNumToRender={20}
      maxToRenderPerBatch={20}
      updateCellsBatchingPeriod={10}
      renderItem={({ item, index, separators }) => {
        if (dataList[index]) { dataList[index].separators = separators; }

        return (
          <Item
            data={{
              title: item.label,
              delay: false,
              separator: {
                data: [dataList[index - 1], item],
                index
              },
              onPress: () => {
                navigation.popTo(backScreen, { value: { label: item.label, _id: item._id }, field }, { merge: true });
              }
            }}
            index={index}
            count={dataList.length}
          />
        )
      }}
    />
  )
}

export default Fipe