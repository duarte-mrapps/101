import React, { useLayoutEffect, useMemo, useState } from "react"
import { FlatList, Platform } from "react-native"
import { Button, Divider, Item, Separator, useColors } from "react-native-ui-devkit"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { NoServicesYet } from "../../../components/noDataYet"

const ServicesServices = () => {
    const colors = useColors()
    const navigation = useNavigation()
    const route = useRoute()
    const insets = useSafeAreaInsets()

    const multipleSelection = route.params?.multipleSelection;
    const options = route.params?.options;

    const backScreen = route.params?.backScreen
    const serviceParams = route.params?.serviceParams
    const title = route.params?.title

    const [search, setSearch] = useState('')
    const [data, setData] = useState(serviceParams)

    const searchedList = useMemo(() => {
        let result = options && JSON.parse(JSON.stringify(options));
        result = result?.filter?.(item => (item?.title?.toLowerCase().includes(search) || item?.description?.toLowerCase()?.includes(search)));
        return result
    }, [options, search])

    useLayoutEffect(() => {
        navigation.setOptions({
            title: title,
            ...Platform.OS == 'ios' && { headerLeft: () => <Button link data={{ title: 'Cancelar', onPress: () => { navigation.goBack() } }} /> },
            headerRight: () =>
                <Button
                    link
                    right
                    data={{
                        title: 'Concluir',
                        disabled: !data?.length,
                        onPress: () => {
                            navigation.navigate(backScreen, { serviceParams: data })
                        }
                    }}
                />,
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

    }, [navigation, title, data])


    const renderItem = ({ item, index, separators }) => {
        searchedList[index].separators = separators;

        return (
            <Item
                data={{
                    title: item?.title,
                    description: item?.description,
                    subdescription: item?.description,

                    ...!multipleSelection && {
                        radio: Array.isArray(data) ? data.includes(item?.title) : data == item?.title
                    },

                    ...multipleSelection && {
                        checkbox: Array.isArray(data) ? data.includes(item?.title) : data == item?.title
                    },

                    separator: {
                        data: [searchedList[index - 1], item],
                        index
                    },

                    onPress: () => {

                        if (multipleSelection) {
                            setData(prevState => prevState?.includes(item?.title) ? prevState?.filter(i => i !== item?.title) : [...prevState, item?.title]);
                        } else if (!multipleSelection) {
                            setData([item?.title]);
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
            keyExtractor={(item, index) => item?.title?.toString()}
            ItemSeparatorComponent={(props) => { return <Separator props={props} start={multipleSelection ? (Platform.OS == 'ios' ? 15 : 60) : (Platform.OS == 'ios' ? 42 : 60)} /> }}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ paddingBottom: insets?.bottom ?? 15 }}
            renderItem={renderItem}
            ListEmptyComponent={<><Divider /><NoServicesYet loading={false} text={search} /></>}
        />
    )
}

export default ServicesServices