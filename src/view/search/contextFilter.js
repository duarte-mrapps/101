import { useContext } from "react";
import { ContextMenuButton } from "react-native-ios-context-menu";
import { GlobalContext } from "../../libs/globalContext";

const ContextMenuOrderList = ({ children, contextFilter, setContextFilter }) => {
  const { store } = useContext(GlobalContext);

  const updateFilter = (item, updatedAt) => {
    const updatedFilter = {};

    Object.keys(contextFilter).forEach(key => {
      updatedFilter[key] = key === item && true;
      updatedFilter.updatedAt = updatedAt;
    });

    setContextFilter(updatedFilter);
  }

  return (
    <ContextMenuButton
      isMenuPrimaryAction={true}
      menuConfig={{
        menuTitle: 'Ordenar por',
        menuPreferredElementSize: 45,
        menuItems: [{
          menuTitle: '',
          menuOptions: ['displayInline'],
          menuItems: [
            store?.featuredTitle && {
              actionKey: 'orderBy.featured',
              actionTitle: store?.featuredTitle ?? '',
              menuState: contextFilter.featured ? 'on' : 'off'
            },
            {
              actionKey: 'orderBy.lowestPrice',
              actionTitle: 'Menor preço',
              menuState: contextFilter.lowestPrice ? 'on' : 'off'
            },
            {
              actionKey: 'orderBy.biggestPrice',
              actionTitle: 'Maior preço',
              menuState: contextFilter.biggestPrice ? 'on' : 'off'
            },
            {
              actionKey: 'orderBy.lowestKm',
              actionTitle: 'Menor km',
              menuState: contextFilter.lowestKm ? 'on' : 'off'
            },
            {
              menuTitle: '',
              menuOptions: ['displayInline'],
              menuItems: [{
                actionKey: 'reset',
                actionTitle: 'Limpar',
                menuAttributes: !contextFilter?.featured ? ['destructive'] : ['hidden'],
              }]
            }],

        }]
      }}

      onPressMenuItem={({ nativeEvent }) => {
        const actionKey = nativeEvent.actionKey
        const updatedAt = new Date().getTime()

        if (actionKey.includes('orderBy')) {
          const selected = actionKey.split('.')[1]
          updateFilter(selected, updatedAt)
        }

        if (actionKey.includes('reset')) {
          setContextFilter({ updatedAt: null, featured: true, lowestPrice: false, biggestPrice: false, lowestKm: false })
        }
      }}>
      {children}
    </ContextMenuButton>
  )
}

export default ContextMenuOrderList