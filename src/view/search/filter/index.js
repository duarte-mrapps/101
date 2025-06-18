import React, { useContext, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Button, Icon, IosOldVersion, Item, List, useColors } from "react-native-ui-devkit"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ScrollView } from "react-native"
import SegmentedControl from "@react-native-community/segmented-control"

import { FilterContext } from "../../../libs/filterContext"
import { GlobalContext } from "../../../libs/globalContext"
import Session from "../../../libs/session"

const AdsFilter = () => {
  const { clearFilter, filter, filterTemp, updateFilter, updateFilterTemp } = useContext(FilterContext)
  const { store } = useContext(GlobalContext)
  const navigation = useNavigation()
  const route = useRoute()
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const config = Session.getConfig();

  const [originalData, setOriginalData] = useState([])
  const [data, setData] = useState([])

  const [conditionArray, setConditionArray] = useState([])
  const [brandArray, setBrandArray] = useState([])
  const [modelArray, setModelArray] = useState([])
  const [optionalsArray, setOptionalsArray] = useState([])
  const [fuelArray, setFuelArray] = useState([])
  const [yearArrayFrom, setYearArrayFrom] = useState([])
  const [yearArrayTo, setYearArrayTo] = useState([])
  const [transmissionArray, setTransmissionArray] = useState([])
  const [colorArray, setColorArray] = useState([])
  const [priceArrayFrom, setPriceArrayFrom] = useState([])
  const [priceArrayTo, setPriceArrayTo] = useState([])
  const [kmArray, setKmArray] = useState([])
  const [loading, setLoading] = useState(false)

  const storesArray = useMemo(() => { return config?.stores?.map(item => item?.company) }, [config])

  useLayoutEffect(() => {
    navigation.setOptions({
      ...Platform.OS == 'ios' && {
        headerTitle: () => (
          <SegmentedControl
            values={['Todos', 'Carro', 'Moto']}
            style={{ width: 160 }}
            selectedIndex={filterTemp?.type ? filterTemp?.type : 0}
            onChange={(e) => {
              const index = e?.nativeEvent?.selectedSegmentIndex
              updateFilterTemp({ ...filterTemp, type: index == 0 ? null : index })
            }}
          />
        ),
        headerLeft: () => <Button link data={{ title: 'Cancelar', onPress: () => { updateFilterTemp(filter); navigation.goBack(); } }} />
      },
      headerRight: () => <Button link data={{
        title: 'Filtar', loading, onPress: () => {
          setLoading(true);
          updateFilter(filterTemp)
          navigation.navigate({ name: 'Search', merge: true });
        }
      }} />
    })
  }, [navigation, filterTemp, colors, loading])

  useEffect(() => {
    setTimeout(() => {
      getCachedAPIData();
      getCahcedData();
    }, 250);
  }, [])

  useEffect(() => {
    if (data) { populateFieldsArray() }
  }, [data, filterTemp])



  useEffect(() => {
    if (route.params?.value && route.params?.field) {
      const field = route.params?.field
      const value = route.params?.value
      let data = { ...filterTemp }

      if (field === 'store') {
        const storeId = config?.stores?.find(item => item?.company === value)?._id;
        const storeCompany = config?.stores?.find(item => item?.company === value)?.company;
        data = { ...data, store: { _id: storeId, name: storeCompany } }
        updateFilterTemp(data);
      } else if (field === 'brand') {
        data = { ...data, brand: value, model: undefined }
        updateFilterTemp(data);
      } else if (field === 'color') {
        data = { ...data, color: data?.color?.includes(value) ? data?.color?.filter(c => c !== value) : value }
        updateFilterTemp(data);
      } else if (field === 'fuel') {
        data = { ...data, fuel: data?.fuel?.includes(value) ? data?.fuel?.filter(c => c !== value) : value }
        updateFilterTemp(data);
      } else if (field === 'optionals') {
        data = { ...data, optionals: data?.optionals?.includes(value) ? data?.optionals?.filter(c => c !== value) : value }
        updateFilterTemp(data);
      } else if (field === 'transmission') {
        data = { ...data, transmission: data?.transmission?.includes(value) ? data?.transmission?.filter(c => c !== value) : value }
        updateFilterTemp(data);
      } else if (field?.includes('price')) {
        const priceField = field.split('.')[1]
        const priceValue = value.split(',')[0].replace(/\D+/g, '')
        if (priceField == 'from' && priceValue > data?.price?.to) {
          data = { ...data, price: { ...data.price, [priceField]: priceValue, to: null } }
          updateFilterTemp(data)
        } else {
          data = { ...data, price: { ...data.price, [priceField]: priceValue } }
          updateFilterTemp(data)
        }
      } else if (field?.includes('year')) {
        const yearField = field.split('.')[1]
        if(yearField == 'from' && value > data?.year?.to) {
          data = { ...data, year: { ...data.year, [yearField]: value, to: null } }
        } else {
          data = { ...data, year: { ...data.year, [yearField]: value} }
        }

        updateFilterTemp(data)
      } else if (field == 'mileage') {
        data = { ...data, mileage: value.replace(/\D+/g, '') }
        updateFilterTemp(data)
      } else {
        data = { ...data, [field]: value }
        updateFilterTemp(data);
      }
    }
  }, [route.params?.value, route.params?.field]);

  const groupAndCount = (items) => {
    const transformedData = items.map((item) => ({ description: item }));

    const grouped = transformedData.reduce((acc, item) => {
      const key = item.description;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([key, count]) => ({
      description: key,
      count,
    })).sort((a, b) => a.description.localeCompare(b.description));
  }

  const getCachedAPIData = async () => {
    const data = Session.getAds(config?.unifiedAds ? 'all' : store?._id)
    if (data) setData(data)
  }

  const getCahcedData = async () => {
    const data = Session.getAds(config?.unifiedAds ? 'all' : store?._id)
    if (data) setOriginalData(data)
  }


  const generateCurrencyArray = (type) => {
    const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    const prices = data?.map(item => item.price);

    const startValue = Math.min(...prices);
    const endValue = Math.max(...prices);

    const roundedArray = [];

    const roundToFloor = (number) => Math.floor(number / 5000) * 5000;
    const roundToCeil = (number) => Math.ceil(number / 5000) * 5000;
    const roundToNearestMultipleOf5k = (number) => Math.round(number / 5000) * 5000;

    const roundedStartValue = (type === 'to' && filterTemp?.price?.from) ? roundToFloor(filterTemp?.price?.from) : startValue;
    const roundedEndValue = roundToCeil(endValue);

    for (let i = roundedStartValue; i <= roundedEndValue; i += 5000) {
      const roundedValue = roundToNearestMultipleOf5k(i);
      roundedArray.push({ description: brlFormatter.format(roundedValue), count: '' });
    }

    return roundedArray;
  }

  const generateDescendingYearArray = (type) => {
    const yearsFromData = groupAndCount(originalData?.map(item => item?.manufactureYear))
    const yearsToData = groupAndCount(originalData?.map(item => item?.modelYear))

    if (type == 'from') {
      return yearsFromData;
    } else {
      if (filterTemp?.year?.from) {
        return yearsToData.filter(year => year?.description >= filterTemp?.year?.from);
      } else {
        return yearsToData;
      }
    }
  }

  const generateKmArray = () => {
    const kmFormatter = new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' })
    const mileages = data?.map(item => item.mileage);
    const startValue = Math.min(...mileages);
    const endValue = Math.max(...mileages);

    const roundedArray = [];

    const roundToFloor = (number) => Math.floor(number / 5000) * 5000;
    const roundToCeil = (number) => Math.ceil(number / 5000) * 5000;
    const roundToNearestMultipleOf5k = (number) => Math.round(number / 5000) * 5000;

    const roundedStartValue = roundToFloor(startValue);
    const roundedEndValue = roundToCeil(endValue);

    for (let i = roundedStartValue; i <= roundedEndValue; i += 5000) {
      const roundedValue = roundToNearestMultipleOf5k(i);
      roundedArray.push({ description: kmFormatter.format(roundedValue), count: '' });
    }
    return roundedArray;
  }

  const populateFieldsArray = () => {
    setBrandArray(groupAndCount(data?.filter(item => !filterTemp?.type || filterTemp?.type === 1 ? item.type === 1 : item.type === 2).map(item => item.brand)));
    setModelArray(groupAndCount(data?.filter((item) => item.brand == filterTemp?.brand)?.filter(item => !filterTemp?.type || filterTemp?.type == 1 ? item.type == 1 : item.type == 2).map(item => item.model)));
    setTransmissionArray(groupAndCount(originalData?.map((item) => item.transmission)));
    setOptionalsArray(
      groupAndCount(
        originalData?.flatMap((item) => item.optionals || []).filter((optional) => optional !== undefined)
      )
    );
    setColorArray(groupAndCount((originalData?.flatMap((item) => item.color))).sort());
    setFuelArray(groupAndCount(originalData?.flatMap((item) => item.fuel)));
    setYearArrayFrom(generateDescendingYearArray('from'));
    setYearArrayTo(generateDescendingYearArray('to'));
    setPriceArrayFrom(generateCurrencyArray('from'));
    setPriceArrayTo(generateCurrencyArray('to'));
    setKmArray(generateKmArray(100000, 5000));
    setConditionArray([{ description: 'Novos / Seminovos', count: originalData?.filter(item => item.isZeroKm === true || item.isZeroKm === false).length }, { description: 'Novos', count: originalData?.filter(item => item.isZeroKm === true).length }, { description: 'Seminovos', count: originalData?.filter(item => item.isZeroKm === false).length }]);
  }

  const filterBasedOnConditions = (data, filterTemp) => {
    const filteredData = data.filter(item => {
      let matches = true;

      if (filterTemp?.type) {
        matches = matches && item.type === filterTemp?.type;
      }

      // if (filterTemp?.brand) {
      //   matches = matches && item.brand === filterTemp?.brand;
      // }

      if (filterTemp?.model) {
        matches = matches && item.model === filterTemp?.model;
      }

      if (Array.isArray(filterTemp?.transmission) && filterTemp?.transmission?.length > 0) {
        matches = matches && filterTemp?.transmission?.some(trans => item?.transmission?.includes(trans));
      }

      if (filterTemp?.optionals && filterTemp?.optionals?.length > 0) {
        matches = matches && filterTemp?.optionals?.every(optional => item?.optionals?.includes(optional));
      }

      if (Array.isArray(filterTemp?.color) && filterTemp?.color?.length > 0) {
        matches = matches && filterTemp?.color.some(color => item?.color?.includes(color));
      } else if (filterTemp?.color) {
        matches = matches && item?.color === filterTemp?.color;
      }

      if (Array.isArray(filterTemp?.fuel) && filterTemp?.fuel.length > 0) {
        matches = matches && filterTemp?.fuel?.some(fuel => item?.fuel?.includes(fuel));
      } else if (filterTemp?.fuel) {
        matches = matches && item.fuel === filterTemp?.fuel;
      }

      if (filterTemp?.year?.from) {
        matches = matches && item.manufactureYear >= filterTemp?.year?.from;
      }

      if (filterTemp?.year?.to) {
        matches = matches && item.modelYear <= filterTemp?.year?.to;
      }

      // if (filterTemp?.price?.from) {
      //   matches = matches && item.price >= filterTemp?.price?.from;
      // }

      // if (filterTemp?.price?.to) {
      //   matches = matches && item.price <= filterTemp?.price?.to;
      // }

      if (filterTemp?.mileage) {
        matches = matches && item.mileage <= filterTemp?.mileage;
      }


      if (filterTemp?.condition) {
        if (Array.isArray(filterTemp?.condition)) {
          if (filterTemp?.condition.includes('Novos / Seminovos')) {
            matches = matches && (item.isZeroKm === true || item.isZeroKm === false);
          }
          if (filterTemp?.condition.includes('Novos')) {
            matches = matches && item.isZeroKm === true;
          }
          if (filterTemp?.condition.includes('Seminovos')) {
            matches = matches && item.isZeroKm === false;
          }
        } else {
          if (filterTemp?.condition === 'Novos') {
            matches = matches && item.isZeroKm === true;
          }
          if (filterTemp?.condition === 'Seminovos') {
            matches = matches && item.isZeroKm === false;
          }
        }
      }

      if (filterTemp?.armored !== undefined) {
        matches = matches && item.armored === filterTemp?.armored;
      }

      return matches;
    });

    setData(filteredData);
  }

  useEffect(() => {
    filterBasedOnConditions(originalData, filterTemp)
  }, [originalData, filterTemp]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={true}
      contentContainerStyle={{ paddingBottom: insets.bottom ? insets.bottom : 15 }}>

      {Platform.OS == 'android' &&
        <Item data={{
          component:
            <SegmentedControl
              values={['Todos', 'Carro', 'Moto']}
              style={{ marginHorizontal: 15, width: 180 }}
              icons={[
                <Icon name='list' type={'font-awesome5'} color={filterTemp?.type == 1 ? colors.primary : colors.secondary} size={21} style={{ marginTop: 5 }} />,
                <Icon name='car-side' type={'font-awesome5'} color={filterTemp?.type == 1 ? colors.primary : colors.secondary} size={21} style={{ marginTop: 5 }} />,
                <Icon name='motorbike' type={'material-community'} color={filterTemp?.type == 2 ? colors.primary : colors.secondary} size={30} style={{ marginBottom: 0 }} />,
              ]}
              selectedIndex={filterTemp?.type ? filterTemp?.type : 0}
              onChange={(e) => {
                const index = e?.nativeEvent?.selectedSegmentIndex
                updateFilterTemp({ ...filterTemp, type: index == 0 ? null : index })
              }}
            />,
          padding: IosOldVersion() || !Platform.OS == 'android'
        }} style={{ backgroundColor: 'transparent' }} marginTop={true} separators={false} />
      }

      {config?.unifiedAds && ((config?.unifiedAdsStore == store?._id) || (config?.unifiedAdsStore == null)) &&
        <Item
          data={{
            title: 'Loja',
            description: filterTemp?.store?.name ?? 'Selecionar...',
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: storesArray,
                  backScreenName: 'AdsFilter',
                  title: 'Loja',
                  selectedItem: filterTemp?.store?.name,
                  field: 'store'
                }
              })
            }
          }}
        />}

      <List
        data={[
          {
            title: 'Condição',
            description: filterTemp?.condition ?? 'Novos / Seminovos',
            disabled: !filterTemp?.condition && data?.length == 0,
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: conditionArray,
                  backScreenName: 'AdsFilter',
                  title: 'Condição',
                  selectedItem: filterTemp?.condition,
                  field: 'condition'
                }
              })
            }
          },
          { title: 'Blindados', checkbox: filterTemp?.armored ?? false, delay: false, chevron: false, onPress: () => { updateFilterTemp({ ...filterTemp, armored: !filterTemp?.armored }) } },
        ]}
        marginTop={!IosOldVersion()}
      />

      <List
        data={[
          {
            title: 'Marca',
            description: filterTemp?.brand ?? `(${brandArray?.length ?? 0})`,
            disabled: !filterTemp?.brand && brandArray?.length == 0,
            cleaner: {
              visible: filterTemp?.brand?.length,
              onPress: () => { clearFilter('brand'); }
            },
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: brandArray,
                  backScreenName: 'AdsFilter',
                  title: 'Marca',
                  selectedItem: filterTemp?.brand,
                  field: 'brand'
                }
              })
            }
          },
          {
            title: 'Modelo',
            description: filterTemp?.model ?? (modelArray?.length ? `(${modelArray?.length})` : ''),
            disabled: !filterTemp?.brand && !filterTemp?.model && !modelArray?.length,
            cleaner: {
              visible: filterTemp?.model?.length,
              onPress: () => { clearFilter('model'); }
            },
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: modelArray,
                  backScreenName: 'AdsFilter',
                  title: 'Modelo',
                  selectedItem: filterTemp?.model,
                  field: 'model'
                }
              })
            }
          }
        ]}
      />

      <List
        data={[
          {
            title: 'De', description: filterTemp?.year?.from ?? (yearArrayFrom?.length ? `(${yearArrayFrom?.length})` : '(0)'),
            disabled: !filterTemp?.year?.from && yearArrayFrom?.length == 0,
            cleaner: {
              visible: filterTemp?.year?.from?.length,
              onPress: () => { clearFilter('year.from'); clearFilter('year.to') }
            },
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: yearArrayFrom,
                  backScreenName: 'AdsFilter',
                  title: 'Ano',
                  selectedItem: filterTemp?.year?.from,
                  field: 'year.from'
                }
              })
            }
          },
          {
            title: 'Até', description: filterTemp?.year?.to ?? (yearArrayTo?.length ? `(${yearArrayTo?.length})` : '(0)'),
            disabled: !filterTemp?.year?.from || (!filterTemp?.year?.to && yearArrayTo?.length == 0),
            cleaner: {
              visible: filterTemp?.year?.to?.length,
              onPress: () => { clearFilter('year.to'); }
            },
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: yearArrayTo,
                  backScreenName: 'AdsFilter',
                  title: 'Ano',
                  selectedItem: filterTemp?.year?.to,
                  field: 'year.to'
                }
              })
            }
          }
        ]}
        header={'Ano'}
        headerOnAndroid
      />

      <List
        data={[
          {
            title: 'De',
            description: filterTemp?.price?.from > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(filterTemp?.price?.from) : `(${priceArrayFrom?.length})`,
            disabled: !filterTemp?.price?.from > 0 && priceArrayFrom?.length == 0,
            cleaner: {
              visible: filterTemp?.price?.from?.length,
              onPress: () => { clearFilter('price.from'); }
            },
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: priceArrayFrom,
                  backScreenName: 'AdsFilter',
                  title: 'Preço',
                  selectedItem: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(filterTemp?.price?.from),
                  field: 'price.from'
                }
              })
            }
          },
          {
            title: 'Até',
            description: filterTemp?.price?.to > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(filterTemp?.price?.to) : `(${priceArrayTo?.length})`,
            disabled: !filterTemp?.price?.to > 0 && priceArrayTo?.length == 0,
            cleaner: {
              visible: filterTemp?.price?.to?.length,
              onPress: () => { clearFilter('price.to'); }
            },
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: priceArrayTo,
                  backScreenName: 'AdsFilter',
                  title: 'Preço',
                  selectedItem: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(filterTemp?.price?.to),
                  field: 'price.to'
                }
              })
            }
          }
        ]}
        header={'Preço'}
        headerOnAndroid
      />

      <Item data={{
        title: 'Quilometragem',
        description: filterTemp?.mileage > 0 ? `até ${new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(filterTemp?.mileage)}` : `(${kmArray?.length})`,
        disabled: !filterTemp?.mileage > 0 && kmArray?.length == 0,
        cleaner: {
          visible: filterTemp?.mileage?.length,
          onPress: () => { clearFilter('mileage'); }
        },
        onPress: () => {
          navigation.navigate({
            name: 'AdsFilterItem',
            params: {
              arrayItems: kmArray,
              backScreenName: 'AdsFilter',
              title: 'Quilometragem',
              selectedItem: new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(filterTemp?.mileage),
              field: 'mileage'
            }
          })
        }
      }}
      />

      <List
        data={[
          filterTemp?.type != 2 && {
            title: 'Câmbio',
            description: filterTemp?.transmission?.length ? filterTemp?.transmission?.join(', ') : `(${transmissionArray?.length})`,
            subdescription: filterTemp?.transmission?.length ? filterTemp?.transmission?.join(', ') : `(${transmissionArray?.length})`,
            disabled: !filterTemp?.transmission?.length && transmissionArray?.length == 0,
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: transmissionArray,
                  backScreenName: 'AdsFilter',
                  title: 'Câmbio',
                  selectedItem: filterTemp?.transmission ?? [],
                  field: 'transmission'
                }
              })
            },
            chevron: !filterTemp?.transmission?.length,
            cleaner: {
              visible: filterTemp?.transmission?.length,
              onPress: () => { clearFilter('transmission'); }
            }
          },
          filterTemp?.type != 2 && {
            title: 'Combustível',
            description: filterTemp?.fuel?.length ? filterTemp?.fuel?.join(', ') : `(${fuelArray?.length})`,
            subdescription: filterTemp?.fuel?.length ? filterTemp?.fuel?.join(', ') : `(${fuelArray?.length})`,
            disabled: !filterTemp?.fuel?.length && fuelArray?.length == 0,
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: fuelArray,
                  backScreenName: 'AdsFilter',
                  title: 'Combustível',
                  selectedItem: filterTemp?.fuel ?? [],
                  field: 'fuel'
                }
              })
            },
            chevron: !filterTemp?.fuel?.length,
            cleaner: {
              visible: filterTemp?.fuel?.length,
              onPress: () => { clearFilter('fuel'); }
            }
          },
          {
            title: 'Cores',
            description: filterTemp?.color?.length ? filterTemp?.color?.join(', ') : `(${colorArray?.length})`,
            subdescription: !filterTemp?.color?.length && filterTemp?.color?.length ? filterTemp?.color?.join(', ') : `(${colorArray?.length})`,
            disabled: !filterTemp?.color?.length && !colorArray?.length,
            onPress: () => {
              navigation.navigate({
                name: 'AdsFilterItem',
                params: {
                  arrayItems: colorArray,
                  backScreenName: 'AdsFilter',
                  title: 'Cor',
                  selectedItem: filterTemp?.color ?? [],
                  field: 'color'
                }
              })
            },
            chevron: !filterTemp?.color?.length,
            cleaner: {
              visible: filterTemp?.color?.length,
              onPress: () => { clearFilter('color'); }
            }
          }
        ]}
      />

      <Item
        data={{
          title: 'Opcionais',
          description: filterTemp?.optionals?.length ? filterTemp?.optionals?.join(', ') : `(${optionalsArray?.length})`,
          subdescription: filterTemp?.optionals?.length ? filterTemp?.optionals?.join(', ') : `(${optionalsArray?.length})`,
          disabled: !filterTemp?.optionals?.length && optionalsArray?.length == 0,
          onPress: () => {
            navigation.navigate({
              name: 'AdsFilterItem',
              params: {
                arrayItems: optionalsArray,
                backScreenName: 'AdsFilter',
                title: 'Opcional',
                selectedItem: filterTemp?.optionals ?? [],
                field: 'optionals'
              }
            })
          },
          chevron: !filterTemp?.optionals?.length,
          cleaner: {
            visible: filterTemp?.optionals?.length,
            onPress: () => { clearFilter('optionals'); }
          }
        }}
      />

      <Button destructive data={{ title: 'Limpar', onPress: async () => { clearFilter(); navigation.navigate({ name: 'Search', params: { filter }, merge: true }); } }} />
    </ScrollView>
  )
}

export default AdsFilter