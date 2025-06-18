import { useContext, useEffect, useLayoutEffect, useState } from "react"
import { View, Platform, ScrollView, StyleSheet, Linking, Text, Alert, Keyboard } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AndroidOldVersion, BorderRadius, Button, DescriptionFontSize, Divider, Icon, IosOldVersion, Item, List, MediumFontSize, TitleFontSize, useColors } from "react-native-ui-devkit"
import { TextInput } from "react-native-gesture-handler"
import { cpf } from 'cpf-cnpj-validator'
import { TextInputMask } from 'react-native-masked-text';
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { isCNH } from 'validator-brasil';
import analytics from '@react-native-firebase/analytics';
import DatePicker from "react-native-date-picker"
import validator from 'validator';
import FastImage from "react-native-fast-image"

import moment from "moment"
import 'moment/locale/pt-br'

import { GlobalContext } from "../../../libs/globalContext"
import { useMutation } from "@tanstack/react-query"
import { LEAD, STATISTICS } from "../../../libs/api"
import helper from "../../../libs/helper"
import Session from "../../../libs/session"

const Service = () => {
  const { global } = useContext(GlobalContext);
  const navigation = useNavigation()
  const route = useRoute()
  const service = route.params?.service;
  const params = service?.params;
  const ad = route.params?.vehicle ?? { type: 1 };

  const vehicleParams = route.params?.vehicleParams ?? { type: 0 };
  const serviceParams = route.params?.serviceParams;
  const selected = route.params?.selected ?? true;

  const config = Session.getConfig();
  const configStore = Session.getStore();
  const [store, setStore] = useState(helper.getStore(config, ad?.store ?? configStore?._id));

  const colors = useColors()
  const insets = useSafeAreaInsets()

  const imageSize = Platform.OS == 'ios' ? 62 : 72;

  const [isBirthdateOpen, setIsBirthdateOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [serviceId, setServiceId] = useState(service?._id)
  const [submit, setSubmit] = useState(false)

  const [data, setData] = useState({
    id: ad?.id ?? null,
    name: '',
    email: '',
    phone: '',
    taxid: '',
    driveslicense: '',
    birthdate: null,
    datetime: null,

    vehicle: null,
    services: null,
    segment: null,

    value: null,

    plaque: null,
    brand: null,
    model: null,
    version: null,
    year: null,

    mileage: null,
    price: null,

    optin: false,

    vehicleParams: null,
    serviceParams: null,
    date: {
      day: null,
      hour: null,
      birthdate: null
    },
    isValid: {
      email: false,
      phone: false,
      taxid: false,
      driveslicense: false
    },
    refs: {
      name: null,
      email: null,
      phone: null,
      taxid: null,
      driveslicense: null,
      mileage: null
    }
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      ...Platform.OS == 'ios' && {
        headerLeft: () => <Button link data={{ title: 'Cancelar', onPress: () => { navigation.goBack() } }} />
      }
    })
  }, [navigation])

  useEffect(() => {
    if (store) {
      const screen = `${store?.company} - ${service?.title}`;
      analytics().logScreenView({
        screen_name: screen,
        screen_class: screen,
      });
    }
  }, [store?._id])

  useEffect(() => {
    const service = helper.getServices(store, serviceId);
    navigation.setParams({ service })
  }, [serviceId, global.timestamp])

  useEffect(() => {
    const store = helper.getStore(config, ad?.store ?? configStore?._id);
    const service = helper.getServices(store, serviceId);
    navigation.setParams({ service })
    setStore(store);
  }, [serviceId, ad?.store])

  useEffect(() => {
    if (ad?.id) {
      const vehicle = `${ad?.brand} ${ad?.model} ${ad?.type == 1 ? `${ad?.version} ` : ' '}${ad?.manufactureYear}/${ad?.modelYear}`
      const mileage = `${ad?.mileage}km`;
      const price = new Intl.NumberFormat('pt-br', { currency: 'BRL', style: 'currency' }).format(ad?.price);

      setData((prevState) => ({ ...prevState, vehicle, plaque: ad?.plaque, brand: ad?.brand, model: ad?.model, version: ad?.version, year: `${ad?.manufactureYear}/${ad?.modelYear}`, mileage, price }));
    } else if (ad?.year) {
      const vehicle = `${ad?.brand} ${ad?.model} ${ad?.year}`
      setData((prevState) => ({ ...prevState, vehicle, brand: ad?.brand, model: ad?.model, year: ad?.year, vehicleParams }));
    }

    if (serviceParams?.length > 0) {
      // todo: Direct Sales
      if (service?._id == '65dcb8548eca108d87c91dbf') {
        setData((prevState) => ({ ...prevState, serviceParams, segment: serviceParams[0] }));
      }

      // todo: Parts and Accessories
      if (service?._id == '6628fd535bda2ae51f6fc5ff') {
        setData((prevState) => ({ ...prevState, serviceParams, segment: serviceParams[0] }));
      }

      // todo: Services / Reviews
      if (service?._id == '65dceeac8eca108d87c91dc6' || service?._id == '65dcef098eca108d87c91dc7') {
        setData((prevState) => ({ ...prevState, serviceParams, services: serviceParams?.sort()?.join(', ') }));
      }
    }
  }, [route?.params])

  useEffect(() => {
    const isValidName = ((params?.name && data?.name?.length >= 2) || !params?.name);
    const isValidBirthdate = ((params?.birthdate && data?.date?.birthdate) || !params?.birthdate);
    const isValidDateTime = ((params?.datetime && data?.date?.day && data?.date?.hour) || !params?.datetime);
    const isValidTaxid = ((params?.taxid && data?.isValid?.taxid) || !params?.taxid);
    const isValidEmail = ((params?.email && data?.isValid?.email) || !params?.email);
    const isValidPhone = ((params?.phone && data?.isValid?.phone) || !params?.phone);
    const isValidMileage = ((params?.mileage && data?.mileage > 0) || !params?.mileage);
    const isValidMessage = ((params?.message && data?.message?.length >= 2) || !params?.message);
    const isValidDriveslicense = ((params?.driveslicense && data?.isValid?.driveslicense) || !params?.driveslicense);
    const isValidValue = ((params?.value && data?.value != null && data?.value.replace(/\D+/g, '') > 0) || !params?.value);

    const isValidVehicle = ((params?.vehicle && data?.vehicle) || !params?.vehicle);
    const isValidAd = ((params?.ad && data?.vehicle) || !params?.ad);

    const isValidServices = ((params?.services && data?.services) || !params?.services);
    const isValidSegment = ((params?.segment && data?.segment) || !params?.segment);

    setSubmit((isValidName && isValidBirthdate && isValidTaxid && isValidEmail && isValidPhone && isValidDateTime && isValidServices && isValidSegment && isValidVehicle && isValidAd && isValidValue && isValidMileage && isValidMessage && isValidDriveslicense));
  }, [data])

  useEffect(() => {
    if (data?.date?.day && data?.date?.hour) {
      setData((prevState) => ({
        ...prevState,
        datetime: helper.getFirstLetterCapitalized(moment(data?.date?.hour).format('ddd, lll'))
      }));
    }

    if (data?.date?.birthdate) {
      setData((prevState) => ({
        ...prevState,
        birthdate: helper.getFirstLetterCapitalized(moment(data?.date?.birthdate).format('DD/MM/yyyy'))
      }));
    }
  }, [service, data?.date])

  const { mutateAsync: updateStatistic } = useMutation({
    mutationFn: async (data) => {
      const response = await STATISTICS(store, ad?.id, data?.type, data?.add)
      return response
    },
    onError: () => { }
  })

  const roundToNextFiveMinutes = (date = new Date()) => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 5) * 5;
    date.setMinutes(roundedMinutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  const { mutateAsync: sendLeadMessage, isPending: isLeadSubmitting } = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const leadData = { ...data }

      leadData.birthdate = leadData.date?.birthdate;
      leadData.datetime = leadData.date?.hour;

      delete leadData?.vehicleParams
      delete leadData?.isValid
      delete leadData?.date
      delete leadData?.refs

      const response = await LEAD(service?._id, store, leadData);
      if (response.status == 200) {
        return response
      } else {
        throw new Error()
      }
    },
    onSuccess: () => {
      setLoading(false);
      navigation?.goBack();

      if (service?._id == 'message') {
        updateStatistic({ type: 'message', add: true });

        Alert.alert('Aviso', 'Mensagem enviada com sucesso, entraremos em contato o mais breve possível.');
      } else {
        // todo: only financing
        if (service?._id == '65dcb7898eca108d87c91dbc') {
          updateStatistic({ type: 'financing', add: true });
        }

        Alert.alert('Aviso', 'Solicitação enviada com sucesso, entraremos em contato o mais breve possível.');
      }
    },
    onError: (error) => {
      setLoading(false);
      if (service?._id == 'message') {
        Alert.alert('Aviso', 'Problemas ao enviar mensagem, tente novamente.');
      } else {
        Alert.alert('Aviso', 'Problemas ao enviar sua solicitação, tente novamente.');
      }
    }
  })

  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={{ paddingBottom: insets.bottom ? insets.bottom : 15 }}>

        {IosOldVersion() && <Divider />}

        <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: IosOldVersion() ? 0 : 15, paddingHorizontal: 40 }}>
          <Icon name={service?.icon?.name} type={service?.icon?.type} size={45} color={Platform.OS == 'ios' ? colors.primary : colors.text} style={{ marginBottom: -10, marginVertical: 15 }} />
          <Divider />

          <Text style={[TitleFontSize(1.5), { fontWeight: '600', color: colors.text, textAlign: 'center' }]}>{service?.title}</Text>
          <Text style={[MediumFontSize(), { fontWeight: '400', color: colors.text, textAlign: 'center', marginTop: 5 }]}>{service?.description}</Text>
        </View>

        <List data={[
          params?.name && {
            component:
              <TextInput
                ref={(ref) => data.refs.name = ref}
                underlineColorAndroid="transparent"
                autoCapitalize={'words'}
                textContentType={'name'}
                returnKeyType={(params?.taxid || params?.driveslicense || params?.birthdate || data.refs.email?.focus) ? "next" : 'done'}
                autoCorrect={false}
                multiline={false}
                onChangeText={text => { setData(prev => ({ ...prev, name: text })) }}
                onSubmitEditing={() => {

                  if (params?.taxid) {
                    data?.refs?.taxid?.focus?.();
                  } else if (params?.driveslicense) {
                    data?.refs?.driveslicense?.focus?.();
                  } else if (params?.birthdate) {
                    setIsBirthdateOpen(true);
                  } else if (data.refs.email?.focus) {
                    data.refs.email?.focus();
                  }

                }}
                placeholder={'Nome Completo'}
                value={data?.name}
                placeholderTextColor={colors.secondary}
                maxLength={40}
                style={[{ flex: 1, color: colors.text }, TitleFontSize()]}
              />,
          },
          params?.birthdate && {
            title: 'Data de Nascimento',
            description: data?.birthdate?.toString(),
            delay: false,
            onPress: () => {
              data.refs.name?.blur?.();
              data.refs.email?.blur?.();
              data.refs.phone?._inputElement?.blur?.();
              data.refs.taxid?.blur?.();
              data.refs.driveslicense?.blur?.();
              data.refs.mileage?._inputElement?.blur?.();

              setTimeout(() => {
                setIsBirthdateOpen(true);
              }, 10);
            }
          },
          params?.taxid && {
            component:
              <TextInput
                ref={(ref) => data.refs.taxid = ref}
                underlineColorAndroid="transparent"
                keyboardType="number-pad"
                textContentType={'oneTimeCode'}
                autoCorrect={false}
                multiline={false}
                onChangeText={text => {
                  setData(prev => ({ ...prev, taxid: helper.cpfMask(text), isValid: { ...prev?.isValid, taxid: cpf.isValid(text) } }));
                  if (text?.trim()?.length == 14) {
                    if (data.refs.email?.focus) {
                      data.refs.email?.focus();
                    } else {
                      data.refs.taxid?.blur?.();
                    }
                  }
                }}
                placeholder={'CPF'}
                value={data?.taxid}
                placeholderTextColor={colors.secondary}
                maxLength={14}
                style={[{ flex: 1, color: colors.text }, TitleFontSize()]}
              />,
            alert: {
              visible: data?.taxid?.length == 14 && !data?.isValid?.taxid
            }
          },
          params?.driveslicense && {
            component:
              <TextInput
                ref={(ref) => data.refs.driveslicense = ref}
                underlineColorAndroid="transparent"
                keyboardType="number-pad"
                textContentType={'oneTimeCode'}
                autoCorrect={false}
                multiline={false}
                onChangeText={text => {
                  setData(prev => ({ ...prev, driveslicense: text, isValid: { ...prev?.isValid, driveslicense: isCNH(text) } }));
                  if (text?.trim()?.length == 11) {
                    if (data.refs.email?.focus) {
                      data.refs.email?.focus();
                    } else {
                      data.refs.driveslicense?.blur?.();
                    }
                  }
                }}
                placeholder={'CNH'}
                value={data?.driveslicense}
                placeholderTextColor={colors.secondary}
                maxLength={11}
                style={[{ flex: 1, color: colors.text }, TitleFontSize()]}
              />,
            alert: {
              visible: data?.driveslicense?.length == 11 && !data?.isValid?.driveslicense
            }
          }
        ]} />

        <List data={[
          params?.email && {
            component:
              <TextInput
                ref={(ref) => data.refs.email = ref}
                underlineColorAndroid="transparent"
                autoCapitalize={'words'}
                textContentType={'emailAddress'}
                keyboardType="email-address"
                autoCorrect={false}
                multiline={false}
                returnKeyType="next"
                onChangeText={text => { setData(prev => ({ ...prev, email: text?.trim()?.toLowerCase(), isValid: { ...prev?.isValid, email: validator.isEmail(text?.trim()) } })) }}
                onSubmitEditing={() => {
                  data.refs.phone?._inputElement?.focus?.();
                }}
                placeholder={'E-mail'}
                value={data?.email}
                placeholderTextColor={colors.secondary}
                maxLength={80}
                style={[{ flex: 1, color: colors.text }, TitleFontSize()]}
              />
          },
          params?.phone && {
            component:
              <TextInputMask
                ref={(ref) => data.refs.phone = ref}
                underlineColorAndroid="transparent"
                type={'custom'}
                keyboardType={'number-pad'}
                autoCompleteType={'off'}
                textContentType={'none'}
                autoCorrect={false}
                autoCapitalize={'none'}
                returnKeyType={'next'}
                maxLength={15}
                options={{
                  mask: data?.phone?.length <= 14 ? '(99) 9999-99999' : '(99) 99999-9999'
                }}
                value={data?.phone}
                onChangeText={(text) => {
                  setData(prev => ({ ...prev, phone: text, isValid: { ...prev?.isValid, phone: validator.isMobilePhone(text?.replace(/\D+/g, ''), 'pt-BR') } }));
                  if (text?.trim()?.length == 15) {
                    if (data.refs.message?.focus) {
                      data.refs.message?.focus();
                    } else {
                      data.refs.phone?._inputElement?.blur?.();
                    }
                  }
                }}
                placeholder={'Telefone'}
                placeholderTextColor={colors.secondary}
                style={[{ flex: 1, color: colors.text }, TitleFontSize()]}
              />
          }]} />

        <List
          data={[
            (params?.message && params?.ad) && {
              component:
                <TextInput
                  ref={(ref) => data.refs.message = ref}
                  underlineColorAndroid="transparent"
                  autoCapitalize={'sentences'}
                  textContentType={'none'}
                  autoCorrect={false}
                  multiline={true}
                  blurOnSubmit
                  returnKeyType={"done"}
                  onChangeText={text => { setData(prev => ({ ...prev, message: text })) }}
                  placeholder={'Mensagem'}
                  value={data?.message}
                  placeholderTextColor={colors.secondary}
                  maxLength={160}
                  style={[{ flex: 1, color: colors.text, height: Platform.OS == 'ios' ? 95 : 105, paddingTop: 10, paddingBottom: 10, paddingHorizontal: 10, textAlignVertical: 'top' }, TitleFontSize()]}
                />,
              padding: false
            },
            (params?.ad || params?.vehicle) && {
              icon: ad?.id ? {
                component:
                  <FastImage
                    source={{ uri: ad?.photos[0] }}
                    style={[BorderRadius(), { width: imageSize, height: imageSize }]}
                  />
              } : {
                component:
                  <View style={{ width: imageSize, height: imageSize, justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name={ad?.type == 1 ? 'car' : (ad?.type == 2 ? 'motorcycle' : 'truck')} type={'font-awesome5'} size={35} color={colors.text} />
                  </View>
              },
              component:
                <>
                  <View style={{ flex: 1, marginLeft: Platform.OS == 'ios' ? 15 : 20, marginVertical: 10 }}>
                    <>
                      {ad?.id &&
                        <>
                          <Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', textTransform: 'uppercase' }]} numberOfLines={1}>{ad?.brand ? `${ad?.brand} ${ad?.model} ${ad?.version}` : 'Selecionar'}</Text>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[DescriptionFontSize(), { color: colors.text }]} numberOfLines={1}>{ad?.manufactureYear}/{ad?.modelYear} {ad?.type == 1 && `${ad?.fuel} `}{ad?.type == 1 && `${ad?.transmission} `}{new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(ad?.mileage)}</Text>
                          </View>
                          <Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', marginTop: 10 }]}>{ad?.price ? Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(ad?.price) : 'Obrigatório'}</Text>
                        </>
                      }
                      {!ad?.id &&
                        <>
                          <Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', textTransform: 'uppercase' }]} numberOfLines={1}>{ad?.brand ? `${ad?.brand}` : 'Selecionar'}</Text>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[DescriptionFontSize(), { color: colors.text }]} numberOfLines={1}>{ad?.model ? `${ad?.model}` : 'Veículo'}</Text>
                          </View>
                          <Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', marginTop: 10 }]}>{ad?.year ? ad?.year : 'Obrigatório'}</Text>
                        </>
                      }
                    </>
                  </View>
                </>,
              separator: {
                start: Platform.OS == 'ios' ? 105 : 110
              },
              ...selected && {
                onPress: () => {
                  data.refs.name?.blur?.();
                  data.refs.email?.blur?.();
                  data.refs.phone?._inputElement?.blur?.();
                  data.refs.taxid?.blur?.();
                  data.refs.driveslicense?.blur?.();
                  data.refs.mileage?._inputElement?.blur?.();

                  setTimeout(() => {
                    navigation.navigate(params?.ad ? 'Search' : 'SelectVehicle', { backScreen: 'ServiceStack', vehicleParams: data?.vehicleParams })
                  }, 10);
                }
              }
            },
            params?.mileage && {
              component:
                <TextInputMask
                  ref={(ref) => data.refs.mileage = ref}
                  underlineColorAndroid="transparent"
                  type={'custom'}
                  keyboardType={'number-pad'}
                  autoCompleteType={'off'}
                  textContentType={'none'}
                  autoCorrect={false}
                  autoCapitalize={'none'}
                  returnKeyType={'next'}
                  maxLength={6}
                  options={{
                    mask: '999999'
                  }}
                  value={data?.mileage}
                  onChangeText={(text) => { setData(prev => ({ ...prev, mileage: text })) }}
                  placeholder={'Km'}
                  placeholderTextColor={colors.secondary}
                  style={[{ flex: 1, color: colors.text }, TitleFontSize()]}
                />
            },
            params?.services && {
              title: 'Serviço(s)',
              description: data?.services ?? 'Obrigatório',
              subdescription: data?.services ?? 'Obrigatório',
              onPress: () => {
                data.refs.name?.blur?.();
                data.refs.email?.blur?.();
                data.refs.phone?._inputElement?.blur?.();
                data.refs.taxid?.blur?.();
                data.refs.driveslicense?.blur?.();
                data.refs.mileage?._inputElement?.blur?.();

                setTimeout(() => {
                  navigation.navigate('ServiceServices', {
                    title: 'Serviço(s)',
                    options: service?.service?.options,
                    multipleSelection: service?.service?.multipleSelection,
                    backScreen: 'ServiceStack',
                    serviceParams: data?.serviceParams ?? []
                  })
                }, 10);
              }
            },
            params?.segment && {
              title: 'Segmento',
              description: data?.segment ?? 'Obrigatório',
              subdescription: data?.segment ?? 'Obrigatório',
              onPress: () => {
                data.refs.name?.blur?.();
                data.refs.email?.blur?.();
                data.refs.phone?._inputElement?.blur?.();
                data.refs.taxid?.blur?.();
                data.refs.driveslicense?.blur?.();
                data.refs.mileage?._inputElement?.blur?.();

                setTimeout(() => {
                  navigation.navigate('ServiceServices',
                    {
                      title: 'Segmento',
                      options: service?.service?.options,
                      multipleSelection: service?.service?.multipleSelection,
                      backScreen: 'ServiceStack',
                      serviceParams: data?.serviceParams ?? []
                    })
                }, 10);
              }
            }
          ]}
        />

        <Item data={
          (params?.message && params?.vehicle) && {
            component:
              <TextInput
                ref={(ref) => data.refs.message = ref}
                underlineColorAndroid="transparent"
                autoCapitalize={'sentences'}
                textContentType={'none'}
                autoCorrect={false}
                multiline={true}
                returnKeyType={"done"}
                onChangeText={text => { setData(prev => ({ ...prev, message: text })) }}
                placeholder={'Mensagem'}
                value={data?.message}
                placeholderTextColor={colors.secondary}
                maxLength={160}
                style={[{ flex: 1, color: colors.text, height: Platform.OS == 'ios' ? 95 : 105, paddingTop: 10, paddingBottom: 10, paddingHorizontal: 10, textAlignVertical: 'top' }, TitleFontSize()]}
              />,
            padding: false
          }}
        />

        <Item data={
          params?.value && {
            component:
              <TextInputMask
                ref={(ref) => data.refs.value = ref}
                underlineColorAndroid="transparent"
                type={'money'}
                options={{
                  precision: 2,
                  separator: ',',
                  delimiter: '.',
                  unit: 'R$ ',
                  suffixUnit: ''
                }}
                keyboardType={'number-pad'}
                autoCompleteType={'off'}
                textContentType={'none'}
                autoCorrect={false}
                autoCapitalize={'none'}
                returnKeyType={'next'}
                maxLength={14}
                value={data?.value}
                onChangeText={(text) => { setData(prev => ({ ...prev, value: text })) }}
                placeholder={'Valor desejado'}
                placeholderTextColor={colors.secondary}
                style={[{ flex: 1, color: colors.text }, TitleFontSize()]}
              />
          }} />


        {params?.datetime &&
          <List
            data={[
              {
                title: (Platform.OS == 'ios' && data?.date.day) ? helper.getFirstLetterCapitalized(moment(data?.date?.day).format('ddd, lll')) : (Platform.OS == 'ios' ? 'Selecionar' : 'Data e Horário'),
                description: Platform.OS == 'android' && (data?.date.day ? helper.getFirstLetterCapitalized(moment(data?.date?.day).format('ddd, lll')) : 'Selecionar'),
                cleaner: {
                  visible: data?.date?.day,
                  onPress: () => {
                    setData(prev => ({ ...prev, date: { ...prev?.date, day: null, hour: null } }))
                  }
                },
                onPress: () => {
                  data.refs.name?.blur?.();
                  data.refs.email?.blur?.();
                  data.refs.phone?._inputElement?.blur?.();
                  data.refs.taxid?.blur?.();
                  data.refs.driveslicense?.blur?.();
                  data.refs.mileage?._inputElement?.blur?.();

                  setTimeout(() => {
                    setIsDateOpen(true)
                  }, 10);
                }
              }
            ]}
            header={'Data e horário'}
            footer={'Favor informar a data e horário de sua preferência para realizarmos o agendamento.'} footerOnAndroid
          />
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

        {service?._id == 'message' &&
          <Item data={{
            icon: { name: 'info', type: 'feather', size: 22, color: '#FF9900', backgroundColor: 'transparent' },
            title: 'Aviso',
            ...(Platform.OS == 'android' && AndroidOldVersion()) && {
              description: store?.ad?.warning
            }
          }} footer={store?.ad?.warning} footerOnAndroid />
        }
      </ScrollView>

      <View
        style={{
          paddingTop: 10,
          paddingBottom: insets.bottom ? insets.bottom : 10,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors[Platform.OS]?.line,
          backgroundColor: colors.background,
        }}>


        {service?._id == 'message' &&
          <Button blue data={{
            title: service?.button,
            disabled: !submit,
            loading,
            onPress: async () => {
              Alert.alert(
                'Aviso',
                'Você deseja realmente enviar esta mensagem?',
                [
                  {
                    text: 'Não', style: 'cancel', onPress: async () => { }
                  },
                  {
                    text: 'Sim', style: 'destructive', onPress: async () => {
                      sendLeadMessage();

                      const plaque = ad?.id ? (ad?.plaque ? `(${ad?.plaque}) ` : '(0KM) ') : '';
                      const analyticsItem = `${plaque}${data?.vehicle}`;

                      analytics().logEvent(service?.logEvent, {
                        item_id: ad?.id?.toString() ?? null,
                        item_name: analyticsItem?.toUpperCase(),
                        store_id: store?._id,
                        store_name: store?.company
                      });
                    }
                  }
                ]);
            }
          }}
            marginTop={false}
          />
        }

        {service?.service?.lead &&
          <Button blue data={{
            title: service?.button,
            disabled: !submit,
            loading: isLeadSubmitting,
            onPress: async () => {
              Alert.alert(
                'Aviso',
                'Você deseja realmente enviar esta solicitação?',
                [
                  {
                    text: 'Não', style: 'cancel', onPress: async () => { }
                  },
                  {
                    text: 'Sim', style: 'destructive', onPress: async () => {
                      if (service?.service?.lead?.type == 'message') {
                        const link = helper.replaceMessage(service?.service?.lead?.[Platform.OS], service?.service?.lead?.replace, data);
                        if (link) {
                          Linking.canOpenURL(link)
                            .then((result) => {
                              result && Linking.openURL(link);
                              (!result && link?.includes('sms:')) && Alert.alert('Aviso', 'Você precisa instalar o aplicativo SMS para usar este canal de comunição!');
                              (!result && link?.includes('whatsapp:')) && Alert.alert('Aviso', 'Você precisa instalar o aplicativo Whatsapp para usar este canal de comunição!');
                              (!result && link?.includes('tg:')) && Alert.alert('Aviso', 'Você precisa instalar o aplicativo Telegram para usar este canal de comunição!');

                              // todo: only financing
                              if (result && service?._id == '65dcb7898eca108d87c91dbc') {
                                updateStatistic({ type: 'financing', add: true });
                              }
                            })
                        }
                      } else {
                        sendLeadMessage()
                      }

                      const analyticsServices = data?.serviceParams?.sort((a, b) => { return a - b; });

                      if (analyticsServices?.length > 0) {
                        analyticsServices?.map((item) => {
                          service?.logEvent &&
                            analytics().logEvent(service?.logEvent, {
                              item_id: null,
                              item_name: item?.toUpperCase(),
                              store_id: store?._id,
                              store_name: store?.company
                            });
                        })
                      } else {
                        const plaque = ad?.id ? (ad?.plaque ? `(${ad?.plaque}) ` : '(0KM) ') : '';
                        const analyticsItem = `${plaque}${data?.vehicle}`;

                        analytics().logEvent(service?.logEvent, {
                          item_id: ad?.id?.toString() ?? null,
                          item_name: analyticsItem?.toUpperCase(),
                          store_id: store?._id,
                          store_name: store?.company
                        });
                      }

                      navigation?.goBack();
                    }
                  }
                ]);
            }
          }}
            marginTop={false}
          />
        }
      </View>

      <DatePicker
        modal
        open={isBirthdateOpen}
        date={data?.date?.birthdate ? new Date(data?.date?.birthdate) : new Date()}
        locale="pt-br"
        onConfirm={(date) => {
          setData(prev => ({ ...prev, date: { ...prev?.date, birthdate: date } }));
          setIsBirthdateOpen(false);
        }}
        onCancel={() => {
          setIsBirthdateOpen(false);
        }}
        title={'Data de Nascimento'}
        mode="date"
      />

      <DatePicker
        modal
        open={isDateOpen}
        date={data?.date?.hour ? new Date(data?.date?.hour) : data?.date?.day ? new Date(data?.date?.day) : new Date()}
        locale="pt-br"
        is24hourSource="locale"
        minimumDate={roundToNextFiveMinutes()}
        minuteInterval={5}
        onConfirm={(date) => {
          date = roundToNextFiveMinutes(date);
          const range = helper.getTodayHours(store?.openingHours?.default, date)

          if ((!range?.min && !range?.max) || (date < range?.min || date > range?.max)) {
            Alert.alert('Data Indisponível', "Por favor, selecione outra data.")
            setData(prev => ({ ...prev, date: { ...prev?.date, day: null, hour: null } }))
          } else {
            setData(prev => ({ ...prev, date: { ...prev?.date, day: date, hour: date } }))
          }
          setIsDateOpen(false)
        }}
        onCancel={() => {
          setIsDateOpen(false)
        }}
        title={'Data e Horário'}
        mode="datetime"
      />
    </>
  )
}

export default Service