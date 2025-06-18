import { useContext, useEffect, useLayoutEffect, useState } from "react"
import { View, Platform, ScrollView, Text, ActivityIndicator } from "react-native"
import { AndroidOldVersion, Button, Divider, Icon, IosOldVersion, Item, List, MediumFontSize, TitleFontSize, useColors } from "react-native-ui-devkit"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useQuery } from "@tanstack/react-query"
import SegmentedControl from "@react-native-community/segmented-control"
import analytics from '@react-native-firebase/analytics';

import { GlobalContext } from "../../../../libs/globalContext"
import API_FIPE from "../../../../libs/api/fipe"

const FipeTable = () => {
  const { store } = useContext(GlobalContext);
  const navigation = useNavigation()
  const route = useRoute()
  const service = route.params?.service
  const colors = useColors()
  const insets = useSafeAreaInsets()

  const dataOptions = service?.service?.options?.map((item) => item?.title) ?? ['Carro'];
  const options = [];
  const icons = [];

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [vehicleType, setVehicleType] = useState(1)
  const [data, setData] = useState({
    brand: { _id: null, label: null },
    model: { _id: null, label: null },
    year: { _id: null, label: null },
  })

  if (dataOptions?.find((item) => item?.toLowerCase() == 'carro')) {
    options.push('Carro');
    icons.push(<Icon name='car' type={'font-awesome5'} color={colors.secondary} size={23} style={{ marginTop: 3 }} />)
  }

  if (dataOptions?.find((item) => item?.toLowerCase() == 'moto')) {
    options.push('Moto');
    icons.push(<Icon name='motorcycle' type={'font-awesome5'} color={colors.secondary} size={23} style={{ marginTop: 2 }} />)
  }

  if (dataOptions?.find((item) => item?.toLowerCase() == 'caminhão')) {
    options.push('Caminhão');
    icons.push(<Icon name='truck' type={'font-awesome5'} color={colors.secondary} size={20} style={{ marginTop: 4 }} />)
  }

  useEffect(() => {
    if (options[0]?.toLowerCase() == 'carro') { setVehicleType(1); }
    else if (options[0]?.toLowerCase() == 'moto') { setVehicleType(2); }
    else if (options[0]?.toLowerCase() == 'caminhão') { setVehicleType(3); }
  }, [])

  const { data: queryData, isLoading } = useQuery({
    queryKey: ['VehicleInfo', data?.year?._id, vehicleType],
    queryFn: async () => {
      if (data?.year?._id !== null) {
        const type = vehicleType;
        const response = await API_FIPE.get(store, type, data.brand._id, data.model._id, data.year._id)
        if (response.status == 200) {
          setData(prevState => ({ ...prevState, price: response?.data?.price }))
        }
        return response.data
      } else {
        return null
      }
    },
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      ...Platform.OS == 'ios' && {
        headerLeft: () =>
          <Button link left data={{ title: 'Cancelar', onPress: () => { navigation.goBack(); } }} />
      }
    })
  }, [navigation, data])

  useEffect(() => {
    if (store) {
      const screen = `${store?.company} - FIPE Table`;
      analytics().logScreenView({
        screen_name: screen,
        screen_class: screen,
      });
    }
  }, [store])

  useEffect(() => {
    const data = route.params?.data
    if (data) {
      setData(data)
    }
  }, [route.params?.data])

  useEffect(() => {
    if (route.params?.field && route.params?.value) {
      const field = route.params?.field
      const value = route.params?.value
      if (field == 'brand') {
        setData(prevState => ({ ...prevState, brand: { _id: value?._id, label: value?.label }, model: { _id: null, label: null }, year: { _id: null, label: null } }))
      } else if (field == 'model') {
        setData(prevState => ({ ...prevState, model: { _id: value?._id, label: value?.label }, year: { _id: null, label: null } }))
      } else {
        setData(prevState => ({ ...prevState, [field]: { _id: value?._id, label: value?.label } }))
      }
    }
  }, [route.params?.field, route.params?.value])


  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={true}
      contentContainerStyle={{ paddingBottom: insets.bottom ? insets.bottom : 15 }}>

      {IosOldVersion() && <Divider />}

      <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: IosOldVersion() ? 0 : 15, paddingHorizontal: 40 }}>
        <Icon name={'graph'} type={'octicons'} size={45} color={Platform.OS == 'ios' ? colors.primary : colors.text} style={{ marginBottom: -10, marginVertical: 15 }} />
        <Divider />

        <Text style={[TitleFontSize(1.5), { fontWeight: '600', color: colors.text }]}>Table FIPE</Text>
        <Text style={[MediumFontSize(), { fontWeight: '400', color: colors.text, textAlign: 'center', marginTop: 5 }]}>Fundação Instituto de Pesquisas Econômicas</Text>
      </View>

      {options?.length > 1 &&
        <Item
          data={{
            component:
              <SegmentedControl
                values={options}
                icons={icons}
                selectedIndex={selectedIndex}
                style={{ marginHorizontal: 15 }}
                onChange={(e) => {
                  if (e?.nativeEvent?.value?.toLowerCase() == 'carro') { setVehicleType(1); }
                  if (e?.nativeEvent?.value?.toLowerCase() == 'moto') { setVehicleType(2); }
                  if (e?.nativeEvent?.value?.toLowerCase() == 'caminhão') { setVehicleType(3); }

                  setSelectedIndex(e?.nativeEvent?.selectedSegmentIndex)

                  setData(prevState => ({ ...prevState, brand: { _id: null, label: null }, model: { _id: null, label: null }, year: { _id: null, label: null } }))
                }
                }
              />,
            padding: false
          }}
          style={{ backgroundColor: 'transparent' }}
          separators={false}
        />
      }

      <List
        data={[
          {
            title: 'Marca',
            description: data?.brand?.label ?? 'Selecionar',
            onPress: () => {
              navigation.navigate('Fipe',
                {
                  field: 'brand',
                  backScreen: "FipeTableStack",
                  fieldValue: {},
                  vehicleType: vehicleType
                })
            }
          },
          {
            title: 'Modelo',
            description: data?.model?.label ?? 'Selecionar',
            disabled: !data?.brand?._id,
            onPress: () => {
              navigation.navigate('Fipe',
                {
                  field: 'model',
                  backScreen: "FipeTableStack",
                  fieldValue: { brand: data?.brand },
                  vehicleType: vehicleType
                })
            }
          },
          {
            title: 'Ano',
            description: data?.year?.label ?? 'Selecionar',
            disabled: !data?.model?._id,
            onPress: () => {
              navigation.navigate('Fipe',
                {
                  field: 'year',
                  backScreen: "FipeTableStack",
                  fieldValue: { brand: data?.brand, model: data?.model },
                  vehicleType: vehicleType
                })
            }
          }
        ]}
      />

      {queryData && !isLoading &&
        <List
          data={[
            { title: `Mês de referência`, description: queryData?.monthRef ?? '...' },
            { title: `Código FIPE:`, description: queryData?.fipeCode ?? '...' },
            { title: `Preço Médio`, description: queryData?.price ?? '...' },
          ]}
          header={'Tabela Fipe'} headerOnAndroid
          footer={'O preço médio aqui informado, é somente uma referência atualizada à table fipe.'} footerOnAndroid
        />
      }
      {isLoading &&
        <>
          <Divider />
          <ActivityIndicator />
        </>
      }

      {service?.service?.warning &&
        <Item data={{
          icon: { name: 'info', type: 'feather', size: 22, color: '#FF9900', backgroundColor: 'transparent' },
          title: 'Aviso',
          ...(Platform.OS == 'android' && AndroidOldVersion()) && {
            description: service?.service?.warning
          }
        }} footer={service?.service?.warning} footerOnAndroid />
      }

    </ScrollView>
  )
}

export default FipeTable