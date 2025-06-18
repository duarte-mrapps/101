import React, { useContext, useLayoutEffect, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { Button, Divider, Item, List, useColors } from 'react-native-ui-devkit';

import { GlobalContext } from "../../libs/globalContext";

const Filter = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { dark } = useTheme()
  const colors = useColors()
  const { profile, setGlobal, global } = useContext(GlobalContext);
  const { component, context, setContext, data, status } = route.params;

  const [contextLocal, setContextLocal] = useState({ ...context })

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Filtro',
      ...Platform.OS == 'ios' && {
        headerRight: () => <Button link data={{
          title: 'Concluir',
          onPress: () => {
            navigation.goBack();
            setTimeout(() => {
              setContext && setContext(contextLocal);
            }, 500);
          }
        }} />
      },
      ...Platform.OS == 'android' && {
        HeaderShown: false
      }
    });
  }, [navigation, contextLocal])

  const ServiceProfileFilters = [
    global.search.service.type == 2 && {
      header: 'Exibir distância',
      data: [
        { title: 'A partir da minha localização', chevron: false, delay: false, checkbox: contextLocal?.displayByLocation, onPress: () => { setContextLocal(prev => { return { ...prev, displayByLocation: !prev.displayByLocation } }) } }
      ]
    },
    {
      header: 'Ordenar por',
      data: [
        { title: 'Relevância', chevron: false, delay: false, checkbox: contextLocal?.orderBy?.order == 0, onPress: () => { setContextLocal(prev => { return { ...prev, orderBy: { ...prev.orderBy, order: 0, subtitle: 'Relevância' } } }) } },
        { title: 'Distância', chevron: false, delay: false, checkbox: contextLocal?.orderBy?.order == 1, onPress: () => { setContextLocal(prev => { return { ...prev, orderBy: { ...prev.orderBy, order: 1, subtitle: 'Distância' } } }) } },
        { title: 'Classificação', chevron: false, delay: false, checkbox: contextLocal?.orderBy?.order == 2, onPress: () => { setContextLocal(prev => { return { ...prev, orderBy: { ...prev.orderBy, order: 2, subtitle: 'Distância' } } }) } },
      ]
    }
  ]

  const BudgetProfessionalFilter = [
    status == 0 && {
      header: 'Exibir somente',
      data: [{
        component:
          <Item data={{
            title: 'Os que enviei propostas',
            noDivider: true,
            color: { title: colors.text },
            switch: {
              value: contextLocal?.displayMy ?? false,
              onValueChange: () => { setContextLocal(prev => ({ ...prev, displayMy: !prev?.displayMy })) }
            },
            onPress: () => { setContextLocal(prev => ({ ...prev, displayMy: !prev?.displayMy })) },
            style: { backgroundColor: 'transparent' }
          }} marginTop={false} noDivider />,
        padding: false
      }]
    },
    {
      header: 'Área de atuação',
      data: [{
        component:
          <View>
            <Picker
              style={[{ color: colors.text }]}
              selectedValue={contextLocal?.filter?.subCategoryId}
              onValueChange={async (subCategoryId) => {
                setContextLocal(prev => ({ ...prev, filter: { ...prev.filter, subCategoryId } }))
              }}
              dropdownIconColor={colors.text}
              mode="dropdown">
              <Picker.Item style={{ backgroundColor: dark ? '#222222' : '#fff', justifyContent: 'flex-end' }} color={colors.text} key={-1} label={'Todos'} value={null} />
              {profile.business?.subCategories?.map((item, index) => {
                const name = `${item.subCategory?.subCategoryRoot ? item.subCategory?.subCategoryRoot?.name + ' (' + item.subCategory?.name + ')' : item.subCategory.name}`;
                return <Picker.Item style={{ backgroundColor: dark ? '#222222' : '#fff', justifyContent: 'flex-end' }} color={colors.text} key={index} label={name} value={item?.subCategory?._id} />
              })}
            </Picker>
          </View>,
        chevron: false,
        padding: false
      }]
    },
    {
      header: 'Qtd. propostas',
      data: [
        {
          component:
            <View>
              <Picker
                style={[{ color: colors.text }]}
                selectedValue={contextLocal?.filter?.budgetAmount}
                onValueChange={async (budgetAmount) => {
                  setContextLocal(prev => ({ ...prev, filter: { ...prev.filter, budgetAmount } }))
                }}
                dropdownIconColor={colors.text}
                mode="dropdown">
                <Picker.Item style={{ backgroundColor: dark ? '#222222' : '#fff', justifyContent: 'flex-end' }} color={colors.text} key={-1} label={'Todos'} value={null} />
                <Picker.Item style={{ backgroundColor: dark ? '#222222' : '#fff', justifyContent: 'flex-end' }} color={colors.text} key={0} label={'Nenhuma'} value={0} />
                <Picker.Item style={{ backgroundColor: dark ? '#222222' : '#fff', justifyContent: 'flex-end' }} color={colors.text} key={1} label={'1'} value={1} />
                <Picker.Item style={{ backgroundColor: dark ? '#222222' : '#fff', justifyContent: 'flex-end' }} color={colors.text} key={2} label={'2'} value={2} />
                <Picker.Item style={{ backgroundColor: dark ? '#222222' : '#fff', justifyContent: 'flex-end' }} color={colors.text} key={3} label={'3'} value={3} />
              </Picker>
            </View>,
          chevron: false,
          padding: false
        }
      ]
    },
    {
      header: 'Ordenar por',
      data: [
        { title: 'Data de abertura', chevron: false, delay: false, checkbox: contextLocal?.orderBy?.order == 0, onPress: () => { setContextLocal(prev => { return { ...prev, orderBy: { ...prev.orderBy, order: 0, subtitle: 'Relevância' } } }) } },
        { title: 'Distância', chevron: false, delay: false, checkbox: contextLocal?.orderBy?.order == 1, onPress: () => { setContextLocal(prev => { return { ...prev, orderBy: { ...prev.orderBy, order: 1, subtitle: 'Distância' } } }) } },
      ]
    }
  ]

  const BudgetFilter = [
    {
      header: 'Exibir somente',
      data: [
        {
          title: 'Abertos / Em Andamento',
          checkbox: contextLocal?.filter?.status == 1,
          onPress: () => { setContextLocal(prev => ({ ...prev, filter: { ...prev.filter, status: 1 } })) }
        },
        {
          title: 'Finalizados',
          checkbox: contextLocal?.filter?.status == 3,
          onPress: () => { setContextLocal(prev => ({ ...prev, filter: { ...prev.filter, status: 3 } })) }
        },
        {
          title: 'Cancelados',
          checkbox: contextLocal?.filter?.status == 4,
          onPress: () => { setContextLocal(prev => ({ ...prev, filter: { ...prev.filter, status: 4 } })) }
        }
      ]
    }
  ]

  const ExtractFilter = [
    {
      header: 'Filtar',
      data: [
        {
          title: 'Tudo',
          checkbox: contextLocal?.filter?.type == 4,
          onPress: () => { setContextLocal(prev => ({ ...prev, filter: { type: 4 } })) }
        },
        {
          title: 'Transferências',
          checkbox: contextLocal?.filter?.type == 3,
          onPress: () => { setContextLocal(prev => ({ ...prev, filter: { type: 3 } })) }
        },
        {
          title: 'Comissões',
          checkbox: contextLocal?.filter?.type == 2,
          onPress: () => { setContextLocal(prev => ({ ...prev, filter: { type: 2 } })) }
        },
        {
          title: 'Assinaturas',
          checkbox: contextLocal?.filter?.type == 1,
          onPress: () => { setContextLocal(prev => ({ ...prev, filter: { type: 1 } })) }
        }
      ]
    },
    {
      header: 'Período',
      data: [
        {
          title: '30 dias',
          checkbox: contextLocal?.period?.type == 1,
          onPress: () => { setContextLocal(prev => ({ ...prev, period: { type: 1 } })) }
        },
        {
          title: '60 dias',
          checkbox: contextLocal?.period?.type == 2,
          onPress: () => { setContextLocal(prev => ({ ...prev, period: { type: 2 } })) }
        },
        {
          title: '90 dias',
          checkbox: contextLocal?.period?.type == 3,
          onPress: () => { setContextLocal(prev => ({ ...prev, period: { type: 3 } })) }
        }
      ]
    },
    {
      header: 'Ordenar por',
      data: [
        {
          title: 'Mais recentes primeiro',
          checkbox: contextLocal?.order?.type == 1,
          onPress: () => { setContextLocal(prev => ({ ...prev, order: { type: 1 } })) }
        },
        {
          title: 'Mais antigos primeiro',
          checkbox: contextLocal?.order?.type == 2,
          onPress: () => { setContextLocal(prev => ({ ...prev, order: { type: 2 } })) }
        }
      ]
    }
  ]

  const InvitesFilter = [
    {
      header: 'Planos',
      data: [
        {
          title: 'Todos',
          checkbox: contextLocal?.package?.type == 4,
          onPress: () => { setContextLocal(prev => ({ ...prev, package: { type: 4 } })) }
        },
        {
          title: 'Gratuito',
          checkbox: contextLocal?.package?.type == 1,
          onPress: () => { setContextLocal(prev => ({ ...prev, package: { type: 1 } })) }
        },
        {
          title: 'Básico',
          checkbox: contextLocal?.package?.type == 2,
          onPress: () => { setContextLocal(prev => ({ ...prev, package: { type: 2 } })) }
        },
        {
          title: 'Premium',
          checkbox: contextLocal?.package?.type == 3,
          onPress: () => { setContextLocal(prev => ({ ...prev, package: { type: 3 } })) }
        }
      ]
    },
    {
      header: 'Ordenar por',
      data: [
        {
          title: 'Mais recentes',
          checkbox: contextLocal?.order?.type == 1,
          onPress: () => { setContextLocal(prev => ({ ...prev, order: { type: 1 } })) }
        },
        {
          title: 'Mais antigos',
          checkbox: contextLocal?.order?.type == 2,
          onPress: () => { setContextLocal(prev => ({ ...prev, order: { type: 2 } })) }
        },
        {
          title: 'Mais indicações',
          checkbox: contextLocal?.order?.type == 3,
          onPress: () => { setContextLocal(prev => ({ ...prev, order: { type: 3 } })) }
        },
        {
          title: 'Menos indicações',
          checkbox: contextLocal?.order?.type == 4,
          onPress: () => { setContextLocal(prev => ({ ...prev, order: { type: 4 } })) }
        }
      ]
    }
  ]

  return Platform.OS == 'ios' ? (
    <ScrollView style={{ flex: 1 }}>
      {component == 'BudgetProfessionalFilter' &&
        <View>
          {BudgetProfessionalFilter.map((item, index) => (
            <List data={item.data} header={item.header} />
          ))}

          {((status == 0 && contextLocal?.displayMy) || contextLocal?.filter?.subCategoryId || (contextLocal?.filter?.budgetAmount != null && contextLocal?.filter?.budgetAmount >= 0) || contextLocal?.orderBy?.order != 0) &&
            <Button destructive expanded data={{
              title: 'Redefinir',
              onPress: () => {
                navigation.goBack();
                setTimeout(() => {
                  setContext && setContext({
                    displayMy: false,
                    filter: { subCategoryId: null, subCategorySubtitle: null, expirationOrder: null, expirationSubtitle: null, budgetAmount: null, status: 1 },
                    orderBy: { subtitle: 'Data de abertura', order: 0 }
                  });
                }, 500);
              }
            }} />
          }
        </View>
      }
      {component == 'BudgetFilter' &&
        <View>
          {BudgetFilter.map((item, index) => (
            <List data={item.data} header={item.header} />
          ))}

          {contextLocal?.filter?.status != 1 &&
            <Button destructive expanded data={{
              title: 'Redefinir',
              onPress: () => {
                navigation.goBack();
                setTimeout(() => {
                  setContext && setContext({
                    displayMy: false,
                    filter: { subCategoryId: null, subCategorySubtitle: null, expirationOrder: null, expirationSubtitle: null, budgetAmount: null, status: 1 },
                    orderBy: { subtitle: 'Data de abertura', order: 0 }
                  });
                }, 500);
              }
            }} />
          }
        </View>
      }
      {component == 'ServiceProfileFilters' &&
        <View>
          {ServiceProfileFilters.map((item, index) => (
            <List data={item.data} header={item.header} />
          ))}

          {contextLocal.orderBy?.order != 0 &&
            <Button destructive expanded data={{
              title: 'Redefinir',
              onPress: () => {
                navigation.goBack();
                setTimeout(() => {
                  setContext && setContext({ orderBy: { order: 0, subtitle: 'Relevância' } });
                }, 500);
              }
            }} />
          }
        </View>
      }
      {component == 'ExtractFilter' &&
        <View>
          {ExtractFilter.map((item, index) => (
            <List data={item.data} header={item.header} />
          ))}

          {(contextLocal?.filter?.type != 4 || contextLocal?.period?.type != 1 || contextLocal?.order?.type != 1) &&
            <Button destructive expanded data={{
              title: 'Redefinir',
              onPress: () => {
                navigation.goBack();
                setTimeout(() => {
                  setContext && setContext({
                    filter: { type: 4 },
                    period: { type: 1 },
                    order: { type: 1 },
                    updatedAt: null
                  });
                }, 500);
              }
            }} />
          }
        </View>
      }

      {component == 'InvitesFilter' &&
        <View>
          {InvitesFilter.map((item, index) => (
            <List data={item.data} header={item.header} />
          ))}

          {(contextLocal?.package?.type != 4 || contextLocal?.order?.type != 1) &&
            <Button destructive expanded data={{
              title: 'Redefinir',
              onPress: () => {
                navigation.goBack();
                setTimeout(() => {
                  setContext && setContext({
                    package: { type: 4 },
                    order: { type: 1 },
                    updatedAt: null
                  });
                }, 500);
              }
            }} />
          }
        </View>
      }
      <Divider />
    </ScrollView>
  ) : (
    <View
      style={{ flex: 1, backgroundColor: dark ? '#00000099' : '#00000050', padding: 10, overflow: 'hidden', justifyContent: 'flex-end' }}
    >
      <View style={{ backgroundColor: dark ? '#000' : '#fff', width: '100%', maxHeight: '90%', overflow: 'hidden', borderRadius: 25 }}>

        <ScrollView>
          {component == 'ServiceProfileFilters' &&
            <>
              {ServiceProfileFilters.map((item, index) => (
                <List forceHeader data={item.data} header={item.header} />
              ))}
            </>
          }

          {data?.map((item, index) => (
            <List forceHeader data={item.data} header={item.header} />
          ))}

        </ScrollView>
        <Button
          transparent
          data={{
            title: 'Concluir',
            color: colors.text,
            padding: false,
            onPress: () => {
              navigation.goBack();

              setTimeout(() => {
                setContext && setContext(contextLocal)
              }, 500);
            },
          }}
          marginTop={false}
        />
      </View>
    </View>
  )
}

export default Filter