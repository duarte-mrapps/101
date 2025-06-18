import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { ContextMenuButton } from "react-native-ios-context-menu";
import { Icon, IosOldVersion, useColors } from "react-native-ui-devkit";

import { GlobalContext } from "../../../libs/globalContext";

export const MainSearchContextFilter = ({ context, setContext }) => {
  const { global } = useContext(GlobalContext);
  const colors = useColors();

  const getBadgeCount = (context) => {
    let count = 0;
    count = context.orderBy.order != 0 ? 1 : 0;
    count = context.displayByLocation ? (count + 1) : count;
    return count;
  }

  return (
    <ContextMenuButton
      isMenuPrimaryAction={true}
      useActionSheetFallback={IosOldVersion()}
      style={{ marginLeft: 15 }}
      menuConfig={{
        menuTitle: '',
        menuItems: [
          {
            actionKey: 'display.location',
            actionTitle: 'Exibir distância',
            actionSubtitle: 'A partir da minha localização',
            menuState: context?.displayByLocation ? 'on' : 'off',
            ...global.search.service.type == 1 && { menuAttributes: ['hidden'] },
          },
          {
            menuTitle: '',
            menuOptions: ['displayInline'],
            menuItems: [
              {
                menuTitle: 'Ordenar por',
                menuSubtitle: context?.orderBy?.subtitle,
                icon: { type: 'IMAGE_SYSTEM', imageValue: { systemName: context.orderBy.order == 1 ? 'arrow.up' : 'arrow.down', scale: 'small', weight: 'light' } },
                menuItems: [
                  {
                    actionKey: 'orderBy.0',
                    actionTitle: 'Relevância',
                    menuState: context?.orderBy.order == 0 ? 'on' : 'off',
                  },
                  {
                    actionKey: 'orderBy.1',
                    actionTitle: 'Distância',
                    menuState: context?.orderBy.order == 1 ? 'on' : 'off',
                  },
                  {
                    actionKey: 'orderBy.2',
                    actionTitle: 'Classificação',
                    menuState: context?.orderBy.order == 2 ? 'on' : 'off',
                  }
                ],
              }],
          },
          {
            actionKey: 'reset.filter',
            actionTitle: 'Redefinir',
            menuAttributes: context.updatedAt != null && (context.orderBy.order != 0 || context.displayByLocation) ? ['destructive'] : ['hidden'],
          }]
      }}
      onPressMenuItem={({ nativeEvent }) => {
        const actionKey = nativeEvent.actionKey
        const actionTitle = nativeEvent.actionTitle
        const updatedAt = new Date().getTime()

        if (actionKey === 'reset.filter') { setContext({ display: { distance: 0, subtitle: 'do endereço informado' }, orderBy: { type: 0, subtitle: 'Relevância', order: 0 }, updatedAt: null }) }
        if (actionKey.includes('display.location')) {
          setContext(prev => { return { ...prev, displayByLocation: !context.displayByLocation, updatedAt } })
        }
        if (actionKey.includes('orderBy')) {
          const order = actionKey.split('.')[1]
          setContext(prev => { return { ...prev, orderBy: { ...prev.orderBy, order: Number(order), subtitle: actionTitle }, updatedAt } })
        }
      }}>
      <Icon name="ellipsis.circle" type="sfsymbol" color={colors.primary} size={22} badge={{ value: getBadgeCount(context), color: colors.notification }} style={[{ padding: 12 }]} />
    </ContextMenuButton >
  )
}

export const BudgetProfessionalFilter = ({ context, setContext, status, resetFilter }) => {
  const navigation = useNavigation()
  const { profile } = useContext(GlobalContext);
  const colors = useColors();

  const getBadgeCount = (context) => {
    let count = 0;
    count = status == 0 && context?.displayMy ? 1 : 0;
    count = context?.filter?.subCategoryId ? (count + 1) : count;
    count = (context?.filter?.budgetAmount != null && context?.filter?.budgetAmount >= 0) ? (count + 1) : count;
    count = context?.orderBy?.order != 0 ? (count + 1) : count;
    return count;
  }

  return (
    <ContextMenuButton
      isMenuPrimaryAction={true}
      useActionSheetFallback={IosOldVersion()}
      menuConfig={{
        menuTitle: 'Filtros',
        menuItems: [
          {
            actionTitle: 'Exibir somente',
            actionSubtitle: 'Os que enviei propostas',
            actionKey: 'display.my',
            menuState: context?.displayMy ? 'on' : 'off'
          },
          {
            menuTitle: '',
            menuOptions: ['displayInline'],
            menuItems: [
              {
                menuTitle: 'Área de atuação',
                menuSubtitle: (() => {
                  const item = profile.business?.subCategories?.find((item) => item.subCategory._id == context?.filter?.subCategoryId);
                  const name = item ? `${item.subCategory?.subCategoryRoot ? item.subCategory?.subCategoryRoot?.name + ' (' + item.subCategory?.name + ')' : item.subCategory.name}` : 'Todos';
                  return name;
                })(),
                icon: { type: 'IMAGE_RECT', imageValue: { systemName: '' } },

                menuItems: [

                  {
                    actionKey: 'filter.subCategory-all',
                    actionTitle: 'Todos',
                    menuState: context?.filter?.subCategoryId == null ? 'on' : 'off'
                  },

                  ...profile.business?.subCategories?.map((item) => {
                    const name = `${item.subCategory?.subCategoryRoot ? item.subCategory?.subCategoryRoot?.name + ' (' + item.subCategory?.name + ')' : item.subCategory.name}`;

                    return {
                      actionKey: 'filter.subCategory-' + item.subCategory._id,
                      actionTitle: name,
                      menuState: context?.filter?.subCategoryId == item.subCategory._id ? 'on' : 'off'
                    }
                  })
                ]
              }]
          },
          {
            menuTitle: '',
            menuOptions: ['displayInline'],
            menuItems: [{
              menuTitle: 'Qtd. propostas',
              menuSubtitle: context?.filter?.budgetAmount
                ? context?.filter?.budgetAmount == null
                  ? 'Todos'
                  : context?.filter?.budgetAmount == 0
                    ? 'Nenhuma'
                    : context?.filter?.budgetAmount : 'Todos',
              icon: {
                type: 'IMAGE_SYSTEM',
                imageValue: {
                  systemName: 'rectangle.and.pencil.and.ellipsis',
                  weight: 'light'
                }
              },
              menuItems: [{
                actionKey: 'budget.amount-null',
                actionTitle: 'Todos',
                menuState: context?.filter?.budgetAmount == null ? 'on' : 'off'
              }, {
                actionKey: 'budget.amount-0',
                actionTitle: 'Nenhuma',
                menuState: context?.filter?.budgetAmount == 0 ? 'on' : 'off'
              }, {
                actionKey: 'budget.amount-1',
                actionTitle: '1',
                menuState: context?.filter?.budgetAmount == 1 ? 'on' : 'off'
              }, {
                actionKey: 'budget.amount-2',
                actionTitle: '2',
                menuState: context?.filter?.budgetAmount == 2 ? 'on' : 'off'
              }, {
                actionKey: 'budget.amount-3',
                actionTitle: '3',
                menuState: context?.filter?.budgetAmount == 3 ? 'on' : 'off'
              }]
            }],
          },
          {
            menuTitle: 'Ordenar por',
            menuOptions: ['displayInline'],
            menuItems: [{
              actionKey: 'orderBy-0',
              actionTitle: 'Data de abertura',
              menuState: context?.orderBy?.order == 0 ? 'on' : 'off'
            },
            {
              actionKey: 'orderBy-1',
              actionTitle: 'Distancia',
              menuState: context?.orderBy?.order == 1 ? 'on' : 'off'
            }],
          },
          {
            actionKey: 'reset.filter',
            actionTitle: 'Redefinir',
            menuAttributes: context.updatedAt ? ['destructive'] : ['hidden'],
          }]
      }}
      onPressMenuItem={({ nativeEvent }) => {
        const actionKey = nativeEvent.actionKey
        const actionTitle = nativeEvent.actionTitle
        const updatedAt = new Date().getTime()

        if (actionKey.includes('display.my')) {
          setContext(prev => {
            return { ...prev, displayMy: !prev.displayMy, filter: { ...prev.filter, }, updatedAt }
          })
        }

        if (actionKey.includes('filter.subCategory')) {
          const subCategoryId = actionKey.split('-')[1] == 'all' ? null : actionKey.split('-')[1];
          setContext(prev => {
            return { ...prev, filter: { ...prev.filter, subCategoryId, subCategorySubtitle: actionTitle }, updatedAt }
          })
        }

        if (actionKey.includes('expiration.ascending') || actionKey.includes('expiration.descending')) {
          const order = actionKey.split('.')[1] == 'ascending' ? 0 : 1
          setContext(prev => {
            return { ...prev, filter: { ...prev.filter, expirationOrder: order, expirationSubtitle: actionTitle }, updatedAt }
          })
        }

        if (actionKey.includes('budget.amount')) {
          const budgetAmount = actionKey.split('-')[1] == null ? null : actionKey.split('-')[1]
          setContext(prev => {
            return { ...prev, filter: { ...prev.filter, budgetAmount }, updatedAt }
          })
        }

        if (actionKey.includes('orderBy')) {
          const order = Number(actionKey.split('-')[1])
          setContext(prev => {
            return { ...prev, orderBy: { ...prev.orderBy, order, subtitle: actionTitle }, updatedAt }
          })
        }

        if (actionKey.includes('ascending') || actionKey.includes('descending')) {
          const order = actionKey.split('.')[1]
          setContext(prev => {
            return { ...prev, orderBy: { ...prev.orderBy, order }, updatedAt }
          })
        }

        if (actionKey.includes('reset.filter')) {
          resetFilter();
        }

        if (actionKey.includes('my.budgets')) {
          navigation.push('Budgets', { personal: true, children: true })
        }
      }}>
      <Icon name="ellipsis.circle" type="sfsymbol" color={colors.primary} size={22} badge={{ value: getBadgeCount(context), color: colors.notification }} style={[{ padding: 14, marginLeft: 8 }]} />
    </ContextMenuButton>
  )
}

export const BudgetFilter = ({ context, setContext, status, resetFilter }) => {
  const navigation = useNavigation()
  const { profile } = useContext(GlobalContext);
  const colors = useColors();

  const getBadgeCount = (context) => {
    let count = 0;
    count = context?.filter?.status != 1 ? 1 : 0;
    return count;
  }

  return (
    <ContextMenuButton
      isMenuPrimaryAction={true}
      useActionSheetFallback={IosOldVersion()}
      menuConfig={{
        menuTitle: 'Filtros',
        menuItems: [
          {
            actionKey: 'filter.status-1',
            actionTitle: 'Abertos /\r\nEm Andamento',
            menuState: context?.filter?.status == 1 ? 'on' : 'off',
            icon: { type: 'IMAGE_SYSTEM', imageValue: { systemName: 'clock' } }
          }, {
            actionKey: 'filter.status-3',
            actionTitle: 'Fnalizados',
            menuState: context?.filter?.status == 3 ? 'on' : 'off',
            icon: { type: 'IMAGE_SYSTEM', imageValue: { systemName: 'checkmark' } }
          }, {
            actionKey: 'filter.status-4',
            actionTitle: 'Cancelados',
            menuState: context?.filter?.status == 4 ? 'on' : 'off',
            icon: { type: 'IMAGE_SYSTEM', imageValue: { systemName: 'circle.slash' } }
          },
          {
            menuTitle: '',
            menuOptions: ['displayInline'],
            menuItems: [
              {
                actionKey: 'reset.filter',
                actionTitle: 'Redefinir',
                menuAttributes: context.updatedAt ? ['destructive'] : ['hidden'],
              }
            ]
          }]
      }}
      onPressMenuItem={({ nativeEvent }) => {
        const actionKey = nativeEvent.actionKey
        const actionTitle = nativeEvent.actionTitle
        const updatedAt = new Date().getTime()

        if (actionKey.includes('filter.status')) {
          const status = Number(actionKey.split('-')[1])
          setContext(prev => {
            return { ...prev, filter: { ...prev.filter, status }, updatedAt: status != 1 ? updatedAt : null }
          })
        }

        if (actionKey.includes('reset.filter')) {
          resetFilter();
        }
      }}>
      <Icon name="line.3.horizontal.decrease.circle" type="sfsymbol" color={colors.primary} size={22} badge={{ value: getBadgeCount(context), color: colors.notification }} style={[{ padding: 14, marginLeft: 8 }]} />
    </ContextMenuButton>
  )
}

export const ExtractFilter = ({ context, setContext, resetFilter }) => {
  const colors = useColors();

  const getBadgeCount = (context) => {
    let count = 0;
    if (context?.filter?.type !== 4) count++
    if (context?.period?.type !== 1) count++
    if (context?.order?.type !== 1) count++
    return count;
  }

  return (
    <ContextMenuButton
      isMenuPrimaryAction={true}
      useActionSheetFallback={IosOldVersion()}
      menuConfig={{
        menuTitle: '',
        menuItems: [
          {
            menuTitle: 'Filtros',
            menuOptions: ['displayInline'],
            menuItems: [
              {
                actionKey: 'filter.4',
                actionTitle: 'Tudo',
                menuState: context.filter.type == 4 ? 'on' : 'off',
              },
              {
                actionKey: 'filter.3',
                actionTitle: 'Transferência',
                menuState: context.filter.type == 3 ? 'on' : 'off',
              },
              {
                actionKey: 'filter.2',
                actionTitle: 'Comissões',
                menuState: context.filter.type == 2 ? 'on' : 'off',

              },
              {
                actionKey: 'filter.1',
                actionTitle: 'Assinaturas',
                menuState: context.filter.type == 1 ? 'on' : 'off',
              },
            ]
          },
          {
            menuTitle: 'Período',
            menuSubtitle: context.period.subtitle,
            icon: {
              type: 'IMAGE_SYSTEM',
              imageValue: {
                systemName: 'calendar',
              },
            },
            menuItems: [{
              actionKey: 'period.1',
              actionTitle: '30 dias',
              menuState: context.period.type == 1 ? 'on' : 'off',
            }, {
              actionKey: 'period.2',
              actionTitle: '60 dias',
              menuState: context.period.type == 2 ? 'on' : 'off'
            }, {
              actionKey: 'period.3',
              actionTitle: '90 dias',
              menuState: context.period.type == 3 ? 'on' : 'off',
            }
            ]
          },
          {
            menuTitle: 'Ordenar por',
            menuOptions: ['displayInline'],
            menuItems: [{
              actionKey: 'order.1',
              actionTitle: 'Mais recentes primeiro',
              menuState: context.order.type == 1 ? 'on' : 'off',
            }, {
              actionKey: 'order.2',
              actionTitle: 'Mais antigos primeiro',
              menuState: context.order.type == 2 ? 'on' : 'off',
            }],
          },

          {
            actionKey: 'reset.filter',
            actionTitle: 'Redefinir',
            menuAttributes: context.updatedAt ? ['destructive'] : ['hidden'],
          }]
      }}
      onPressMenuItem={({ nativeEvent }) => {
        const actionKey = nativeEvent.actionKey
        const updatedAt = new Date()

        if (actionKey.includes('filter')) {
          const type = actionKey.split('.')[1]
          setContext(prev => ({ ...prev, filter: { type: Number(type) }, updatedAt }))
        }
        if (actionKey.includes('period')) {
          const subtitle = nativeEvent.actionTitle
          const type = actionKey.split('.')[1]
          setContext(prev => ({ ...prev, period: { type: Number(type), subtitle }, updatedAt }))
        }
        if (actionKey.includes('order')) {
          const type = actionKey.split('.')[1]
          setContext(prev => ({ ...prev, order: { type: Number(type) }, updatedAt }))
        }
        if (actionKey.includes('reset')) {
          resetFilter()
        }
      }}
    >
      <Icon name="ellipsis.circle" type="sfsymbol" color={colors.primary} size={22} badge={{ value: getBadgeCount(context), color: colors.notification }} style={[{ padding: 14, marginLeft: 8 }]} />
    </ContextMenuButton>
  )
}

export const InvitesFilter = ({ context, setContext, resetFilter }) => {
  const colors = useColors();

  const getBadgeCount = (context) => {
    let count = 0;
    if (context?.package?.type !== 4) count++
    if (context?.order?.type !== 1) count++
    return count;
  }

  return (
    <ContextMenuButton
      isMenuPrimaryAction={true}
      useActionSheetFallback={IosOldVersion()}
      menuConfig={{
        menuTitle: '',
        menuItems: [
          {
            menuTitle: 'Planos',
            menuOptions: ['displayInline'],
            menuItems: [
              {
                actionKey: 'package.4',
                actionTitle: 'Todos',
                menuState: context.package.type == 4 ? 'on' : 'off',
              },
              {
                actionKey: 'package.1',
                actionTitle: 'Gratuito',
                menuState: context.package.type == 1 ? 'on' : 'off',
              },
              {
                actionKey: 'package.2',
                actionTitle: 'Básico',
                menuState: context.package.type == 2 ? 'on' : 'off',

              },
              {
                actionKey: 'package.3',
                actionTitle: 'Premium',
                menuState: context.package.type == 3 ? 'on' : 'off',
              },
            ]
          },
          {
            menuTitle: 'Ordenar por',
            menuOptions: ['displayInline'],
            menuItems: [{
              actionKey: 'order.1',
              actionTitle: 'Mais recentes primeiro',
              menuState: context.order.type == 1 ? 'on' : 'off',
            },
            {
              actionKey: 'order.2',
              actionTitle: 'Mais antigos primeiro',
              menuState: context.order.type == 2 ? 'on' : 'off',
            },
            {
              actionKey: 'order.3',
              actionTitle: 'Mais indicações',
              menuState: context.order.type == 3 ? 'on' : 'off',
            },
            {
              actionKey: 'order.4',
              actionTitle: 'Menos indicações',
              menuState: context.order.type == 4 ? 'on' : 'off',
            },
            ],
          },
          {
            actionKey: 'reset.filter',
            actionTitle: 'Redefinir',
            menuAttributes: context.updatedAt ? ['destructive'] : ['hidden'],
          }]
      }}
      onPressMenuItem={({ nativeEvent }) => {
        const actionKey = nativeEvent.actionKey
        const updatedAt = new Date()

        if (actionKey.includes('package')) {
          const type = actionKey.split('.')[1]
          setContext(prev => ({ ...prev, package: { type: Number(type) }, updatedAt }))
        }
        if (actionKey.includes('order')) {
          const type = actionKey.split('.')[1]
          setContext(prev => ({ ...prev, order: { type: Number(type) }, updatedAt }))
        }
        if (actionKey.includes('reset')) {
          resetFilter()
        }
      }}
    >
      <Icon name="ellipsis.circle" type="sfsymbol" color={colors.primary} size={22} badge={{ value: getBadgeCount(context), color: colors.notification }} style={[{ padding: 14, marginLeft: 8 }]} />
    </ContextMenuButton>
  )
}