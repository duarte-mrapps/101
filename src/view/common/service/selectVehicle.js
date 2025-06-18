import { useNavigation, useRoute } from "@react-navigation/native"
import { useContext, useEffect, useLayoutEffect, useState } from "react"
import { Text } from "react-native"
import { ScrollView } from "react-native"
import { View, Platform } from "react-native"
import { AndroidOldVersion, Button, Divider, Icon, IosOldVersion, Item, List, TitleFontSize, useColors } from "react-native-ui-devkit"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import SegmentedControl from "@react-native-community/segmented-control"
import { GlobalContext } from "../../../libs/globalContext"

const SelectVehicle = () => {
  const { global, store, setStore } = useContext(GlobalContext);
  const navigation = useNavigation()
  const route = useRoute()
  const backScreen = route.params?.backScreen
  const vehicleParams = route.params?.vehicleParams

  const colors = useColors()
  const insets = useSafeAreaInsets()

  const [vehicleType, setVehicleType] = useState(vehicleParams?.type ?? 0)
  const [data, setData] = useState({
    brand: vehicleParams?.brand ?? { _id: null, label: null },
    model: vehicleParams?.model ?? { _id: null, label: null },
    year: vehicleParams?.year ?? { _id: null, label: null },
  })

  useLayoutEffect(() => {

    navigation.setOptions({
      title: '',
      headerRight: () =>
        <Button link data={{
          title: 'Concluir', disabled: !data?.year?._id,
          onPress: () => {
            navigation?.popTo(backScreen, { vehicle: { type: (vehicleType + 1), brand: data?.brand?.label, model: data?.model?.label, year: data?.year?.label }, vehicleParams: { ...data, type: vehicleType } })
          }
        }} />
    })
  }, [navigation, data, backScreen])

  useEffect(() => {
    const data = route.params?.data
    if (data) {
      setVehicleType(data.type)
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
        <Icon name={vehicleType == 0 ? 'car' : (vehicleType == 1 ? 'motorcycle' : 'truck')} type={'font-awesome5'} size={50} color={Platform.OS == 'ios' ? colors.primary : colors.text} style={{ marginBottom: -10, marginVertical: 10 }} />
        <Divider />

        <Text style={[TitleFontSize(1.5), { fontWeight: '600', color: colors.text }]}>Veículo</Text>
        <Text style={[TitleFontSize(), { fontWeight: '400', color: colors.text, textAlign: 'center', marginTop: 5 }]}>Selecione abaixo as informalções do seu veículo.</Text>
      </View>

      <Item
        data={{
          component:
            <SegmentedControl
              values={['Carro', 'Moto']}
              icons={[
                <Icon name='car' type={'font-awesome5'} color={colors.secondary} size={23} style={{ marginTop: 3 }} />,
                <Icon name='motorcycle' type={'font-awesome5'} color={colors.secondary} size={23} style={{ marginTop: 2 }} />
              ]}
              selectedIndex={vehicleType}
              style={{ marginHorizontal: 15 }}
              onChange={(e) => {
                setVehicleType(e?.nativeEvent?.selectedSegmentIndex)
                setData(prevState => ({ ...prevState, brand: { _id: null, label: null }, model: { _id: null, label: null }, year: { _id: null, label: null } }))
              }}
            />,
          padding: false
        }}
        style={{ backgroundColor: 'transparent' }}
        separators={false}
      />
      <List
        data={[
          {
            title: 'Marca',
            description: data?.brand?.label ?? 'Selecionar',
            onPress: () => {
              navigation.navigate('Fipe', {
                field: 'brand',
                backScreen: "SelectVehicle",
                fieldValue: {},
                vehicleType: (vehicleType + 1)
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
                  backScreen: "SelectVehicle",
                  fieldValue: { brand: data?.brand },
                  vehicleType: (vehicleType + 1)
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
                  backScreen: "SelectVehicle",
                  fieldValue: { brand: data?.brand, model: data?.model },
                  vehicleType: (vehicleType + 1)
                })
            }
          }
        ]}
      />

      <Item data={{
        icon: { name: 'info', type: 'feather', size: 22, color: '#FF9900', backgroundColor: 'transparent' },
        title: 'Aviso',
        ...(Platform.OS == 'android' && AndroidOldVersion()) && {
          description: 'Selecione corretamente as informações do seu veículo para não ter nenhum problema em sua solicitação.'
        }
      }} footer={'Selecione corretamente as informações do seu veículo para não ter nenhum problema em sua solicitação.'} footerOnAndroid />

    </ScrollView>
  )
}

export default SelectVehicle