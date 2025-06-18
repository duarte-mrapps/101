import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Appearance, View, Platform, FlatList, Text, Image, ActivityIndicator, Pressable } from 'react-native';
import { Button, Item, useColors, TitleFontSize, DescriptionFontSize, Separator, Divider, Icon, MediumFontSize, AndroidOldVersion } from 'react-native-ui-devkit';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderOptions } from '@react-navigation/elements';
import { useDebounce } from 'use-debounce';
import { isTablet } from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import analytics from '@react-native-firebase/analytics';
import FastImage from 'react-native-fast-image';

import { GlobalContext } from '../../libs/globalContext';
import { FilterContext } from '../../libs/filterContext';
import { useDialog } from '../../components/DialogAndroid';
import { NoAdYet } from '../../components/noDataYet';
import GET, { STATISTICS } from '../../libs/api';
import ContextMenuOrderList from './contextFilter';
import helper from '../../libs/helper';
import BestSelling from '../main/bestSelling';
import Session from '../../libs/session';
import { LaunchArguments } from 'react-native-launch-arguments';

let searchTimeout;

const Search = () => {
	const { global, setGlobal, store } = useContext(GlobalContext);
	const navigation = useNavigation()
	const route = useRoute()
	const colors = useColors();
	const queryClient = useQueryClient();
	const theme = Appearance.getColorScheme();
	const { showDialog, reload } = useDialog()
	const [focus, setFocus] = useState(false);

	const insets = useSafeAreaInsets()

	const list = route.params?.list;
	const type = route.params?.type;
	const title = route.params?.title;
	const adsParam = route.params?.ads;
	const searcher = route?.params?.searcher;
	const nofilters = route.params?.nofilters;
	const backScreen = route.params?.backScreen ?? 'SearchTab';

	const isTesting = LaunchArguments.value()?.isTesting || false

	/** @type { React.MutableRefObject<import('@react-navigation/elements').HeaderSearchBarRef> } */
	const searchBarRef = useRef()

	const config = Session.getConfig();
	const ads = Session.getAds(store?._id);
	let favoritesExits = ads?.find((ad) => ad?.favorite && ad) != null;

	const filterContext = useContext(FilterContext)
	let filter = type
		? {
			...type == 'featured' && { featured: true },
			...type == '0km' && { condition: 'Novos' },
			...type == 'pre-owned' && { condition: 'Seminovos' },
			...type == 'armored' && { armored: true },
			...type == 'ads' && { ads: adsParam }
		}
		: filterContext.filter;

	const [contextFilter, setContextFilter] = useState({ updatedAt: null, featured: true, lowestPrice: false, biggestPrice: false, lowestKm: false })
	const [contextFilterTemp, setContextFilterTemp] = useState({ updatedAt: null, featured: true, lowestPrice: false, biggestPrice: false, lowestKm: false })

	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(false);
	const [debounceValue] = useDebounce(search, 1000);

	const { data: queryData, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
		queryKey: [list ? 'FiltersList' : 'Filters', config, searcher, global.isConnected, store, debounceValue, contextFilter, filter],
		queryFn: async ({ pageParam = 0 }) => {
			const response = await GET(pageParam, 10, debounceValue, filter, contextFilter, setGlobal, queryClient)
			return response;
		},

		getNextPageParam: (lastPage) => {
			const { currentPage, totalPages } = lastPage;
			if ((currentPage + 1) < totalPages) {
				return currentPage + 1;
			}
			return undefined;
		},

		enabled: searcher ? (!!debounceValue) : true
	})

	const { mutateAsync: updateStatistic } = useMutation({
		mutationFn: async (data) => {
			const response = await STATISTICS(data?.store, data?.id, data?.type, data?.add)
			return response
		},
		onError: () => { }
	})

	const data = queryData?.pages?.flatMap(page => page?.data)

	const getTitle = () => {
		let header;
		if (type == 'featured') { header = store?.featuredTitle ?? '' }
		else if (type == '0km') { header = '0km' }
		else if (type == 'pre-owned') { header = 'Seminovos' }
		else if (type == 'armored') { header = 'Blindados' }
		else if (type == 'relationship') { header = 'Ofertas relacionadas' }
		else if (type == 'ads') { header = title ?? '' }
		return header;
	}

	/** @type { HeaderOptions }  */
	const options = {
		...type && !searcher && { title: getTitle() },
		...searcher && { title: '' },
		headerRight: ({ tintColor }) => !focus && (
			<>
				{!nofilters &&
					<Button icon right data={{ delay: false, icon: { name: 'sliders', type: 'font-awesome', size: 20, color: tintColor }, onPress: () => { navigation.push('AdsFilter') } }} />
				}

				{Platform.OS == 'ios' &&
					<ContextMenuOrderList contextFilter={contextFilter} setContextFilter={setContextFilter} contextFilterTemp={contextFilterTemp} setContextFilterTemp={setContextFilterTemp}>
						<Button icon right data={{ delay: false, icon: { name: Platform.OS == 'ios' ? 'ellipsis-horizontal-circle' : 'ellipsis-vertical', type: 'ionicons', size: Platform.OS == 'ios' ? 26 : 20, color: tintColor }, onPress: () => { } }} />
					</ContextMenuOrderList>
				}

				{Platform.OS == 'android' && !nofilters &&
					<Button
						icon
						right
						data={{
							delay: false,
							icon: { name: Platform.OS == 'ios' ? 'ellipsis-horizontal-circle' : 'ellipsis-vertical', type: 'ionicons', size: Platform.OS == 'ios' ? 26 : 20, color: tintColor },
							onPress: () => {
								showDialog({
									title: 'Ordenar',
									data: actions,
									contextTemp: contextFilterTemp,
									okButton: true,
									exec: (ok, contextTemp) => {
										ok && setContextFilter({ ...contextTemp })
										!ok && setContextFilterTemp({ ...contextFilter })
									},
									colors: colors
								})
							}
						}} />
				}

				{(Platform.OS == 'android' && !searcher) &&
					<Button icon data={{
						icon: { name: 'search', type: 'ionicons', color: tintColor, size: 22 },
						onPress: async () => {
							navigation.push('SearchHome', { searcher: true, list, backScreen })
						}
					}} noMargin />}
			</>
		),

		...(Platform.OS == 'ios' || searcher) &&
		{
			headerSearchBarOptions: {
				ref: searchBarRef,
				placeholder: 'Pesquisar',
				cancelButtonText: 'Cancelar',
				autoCapitalize: 'none',
				textColor: colors.text,
				headerIconColor: colors.background,
				hintTextColor: colors.secondary,
				hideWhenScrolling: false,
				obscureBackground: false,
				onChangeText: (e) => {
					setSearch(e?.nativeEvent?.text);
					setLoading(!(e?.nativeEvent?.text == '') || (dataList?.length == 0) || !(search == ''))
				},
				onFocus: (e) => { e.preventDefault(); setFocus(true); },
				onBlur: (e) => { e.preventDefault() },
				onClose: (e) => { navigation?.goBack(null); },
				onCancelButtonPress: (e) => { e.preventDefault(); setFocus(false); },
			}
		}
	}

	useLayoutEffect(() => {
		navigation.setOptions(options);
	}, [navigation, global, store, colors, list, type, dataList, search, searcher, data, contextFilterTemp, contextFilter, actions, nofilters, focus])

	useEffect(() => {
		setLoading(false)
		const queryKey = list ? 'FiltersList' : 'Filters';
		queryClient.removeQueries({ queryKey, exact: true })
	}, [debounceValue])

	useEffect(() => {
		if (search) {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(() => {
				analytics().logSearch({ search_term: search })
			}, 4000);
		}
	}, [search])

	useEffect(() => {
		if (searcher && !focus) {
			setSearchFocus();
		}
	}, [searcher, focus])

	const setSearchFocus = () => {
		if (searcher && !focus) {
			setTimeout(() => {
				searchBarRef?.current?.focus();
				setSearchFocus();
			}, 100);
		}
	}

	const saveToFavorite = (ad) => {
		if (ad?.store) {
			const ads = Session.getAds(store?._id);

			const getStore = helper.getStore(config, ad?.store);
			const index = ads?.findIndex(item => (item?.id == ad?.id && item?.store == ad?.store) && item);

			if (index != -1) {
				const favorite = !ads[index].favorite;

				ads[index].favorite = favorite;
				Session.setAds(ads, store?._id);

				queryClient.invalidateQueries().then(() => { });

				updateStatistic({ store: getStore, id: ad?.id, type: 'favorite', add: favorite });

				if (favorite) {
					const analyticsItem = `${ad?.plaque ? `(${ad?.plaque})` : '(0KM)'} ${ad?.brand} ${ad?.model} ${ad?.type == 1 && `${ad?.version} `}${ad?.manufactureYear}/${ad?.modelYear}`;
					if (analyticsItem) {
						analytics().logEvent('add_to_favorites', {
							item_id: ad?.id?.toString(),
							item_name: analyticsItem?.toUpperCase(),
							store_id: getStore?._id,
							store_name: getStore?.company
						});
					}
				}
			}
		}
	};

	const dataList = useMemo(() => {
		let list = searcher ? (debounceValue ? data : []) : data;
		return list;
	}, [data, filter, contextFilter, debounceValue, searcher])

	useEffect(() => {
		Platform.OS == 'android' && reload(actions, contextFilterTemp)
	}, [contextFilterTemp])

	const actions = [
		{
			header: 'Ordenar por',

			data: [
				store?.featuredTitle && {
					title: store?.featuredTitle ?? '',
					radio: contextFilterTemp?.featured,
					onPress: () => { setContextFilterTemp(prev => ({ featured: true, biggestPrice: false, lowestKm: false, lowestPrice: false })) }
				},
				{
					title: 'Menor Preço',
					radio: contextFilterTemp?.lowestPrice,
					onPress: () => { setContextFilterTemp(prev => ({ featured: false, biggestPrice: false, lowestKm: false, lowestPrice: true })) }
				},
				{
					title: 'Maior Preço',
					radio: contextFilterTemp?.biggestPrice,
					onPress: () => { setContextFilterTemp(prev => ({ featured: false, biggestPrice: true, lowestKm: false, lowestPrice: false })) }
				},
				{
					title: 'Menor Km',
					radio: contextFilterTemp?.lowestKm,
					onPress: () => { setContextFilterTemp(prev => ({ featured: false, biggestPrice: false, lowestKm: true, lowestPrice: false })) }
				}]
		}
	]

	const renderItem = ({ item, index, separators }) => {
		if (dataList[index]) { dataList[index].separators = separators; }
		const imageSize = Platform.OS == 'ios' ? 62 : 72;

		return (
			<View>
				{(item?.id && !list) &&
					<>
						<Item
							data={{
								component:
									<View style={{ margin: 0 }} testID={`SearchItem-${index}`} accessibilityLabel={`SearchItem-${index}`}>
										<View>
											{Platform.OS == 'android' &&
												<FastImage
													source={{
														uri: (theme == 'dark'
															? Image.resolveAssetSource(require('../../assets/img/watermark-dark.png')).uri
															: Image.resolveAssetSource(require('../../assets/img/watermark.png')).uri), priority: FastImage.priority.high
													}}
													style={[{ position: 'absolute', width: '100%', height: 160 }]}
												/>
											}
											<FastImage source={{ uri: item?.photos?.[0] }} defaultSource={theme == 'dark' ? require('../../assets/img/watermark-dark.png') : require('../../assets/img/watermark.png')} resizeMode="cover" style={[{ width: '100%', height: 160, borderRadius: Platform.OS == 'ios' ? 10 : 0 }]}>
												{!list &&
													<LinearGradient colors={['#00000060', '#00000000']} style={{ position: 'absolute', flexDirection: 'row', left: 0, right: 0, top: 0, justifyContent: 'space-between' }}>
														<View style={{ flexDirection: 'row', margin: 10 }}>
															{item?.changed?.featured && <Icon name={'star'} type={'material-community'} size={25} color={'#fff'} style={{ marginRight: 8 }} />}
															{item?.video && <Icon name={'video-camera'} type={'font-awesome'} size={22} color={'#fff'} style={{ marginRight: 8 }} />}
														</View>
														<Button icon data={{ icon: { name: item?.favorite ? 'heart' : 'heart-outline', type: 'material-community', size: 24, color: '#fff' }, onPress: () => { saveToFavorite(item); } }} />
													</LinearGradient>
												}

												{item?.armored &&
													<View style={{ position: 'absolute', flexDirection: 'row', top: 125, right: 0, backgroundColor: colors.text, padding: 10, borderTopStartRadius: 15 }}>
														<Text style={[DescriptionFontSize(), { color: colors.background }]}>BLINDADO</Text>
														<Icon name={'shield-check'} type={'material-community'} size={15} color={colors.background} style={{ marginLeft: 5 }} />
													</View>
												}
											</FastImage>

										</View>
										<View style={{ margin: 10 }}>
											{item?.type == 1 &&
												<>
													<Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', textTransform: 'uppercase', fontWeight: 'bold' }]} numberOfLines={1}>{item?.brand} {item?.model}</Text>
													<Text style={[MediumFontSize(), { color: colors.text, textAlign: 'left', textTransform: 'uppercase', fontWeight: '500' }]} numberOfLines={1}>{item?.version}</Text>
												</>
											}
											{item?.type == 2 &&
												<>
													<Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', textTransform: 'uppercase', fontWeight: 'bold' }]} numberOfLines={1}>{item?.brand}</Text>
													<Text style={[MediumFontSize(), { color: colors.text, textAlign: 'left', textTransform: 'uppercase', fontWeight: '500' }]} numberOfLines={1}>{item?.model}</Text>
												</>
											}

											<View style={{ flex: 1, flexDirection: 'column', marginTop: 10 }}>
												<Text style={[DescriptionFontSize(), { color: colors.text, textTransform: 'uppercase' }]}>{item?.manufactureYear}/{item?.modelYear} </Text>
												<Text style={[DescriptionFontSize(), { color: colors.text, textTransform: 'lowercase' }]}>{new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(item?.mileage)}</Text>
											</View>
											<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', marginTop: 10 }}>
												<Text style={[TitleFontSize(1.5), { fontWeight: '500', color: colors.text }]}>{item?.price ? Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(item?.price) : 'Consulte'}</Text>
											</View>
											{config?.unifiedAds &&
												<View style={{ flex: 1, flexDirection: 'row', alignContent: 'center', marginTop: 10 }}>
													<Text style={[DescriptionFontSize(), { color: colors.secondary, textTransform: 'uppercase', flex: 1 }]} numberOfLines={1}>{helper.getStoreName(config, item?.store)}</Text>
													<Text style={[DescriptionFontSize(), { color: colors.primary, textTransform: 'lowercase' }]}>{helper.getStoreDistance(config, item?.store)}</Text>
												</View>
											}
										</View>
									</View>,
								padding: false,
								chevron: false,
								onPress: () => {
									const data = { ...item }
									delete data?.separators
									navigation.navigate('Detail', { ad: data, title: 'Estoque', backScreen })
								}
							}}
							marginTop={false}
							expanded={Platform.OS == 'android'}
						/>
						<View style={{ height: 15 }} />
					</>
				}
				{(item?.id && list) &&
					<Item
						data={{
							icon: {
								component:
									<>
										{Platform.OS == 'android' &&
											<FastImage
												source={{
													uri: (theme == 'dark'
														? Image.resolveAssetSource(require('../../assets/img/watermark-dark.png')).uri
														: Image.resolveAssetSource(require('../../assets/img/watermark.png')).uri), priority: FastImage.priority.high
												}}
												style={[{ position: 'absolute', width: imageSize, height: imageSize, borderRadius: 10 }]}
											/>
										}

										<FastImage source={{ uri: item?.photos?.[0] }} defaultSource={theme == 'dark' ? require('../../assets/img/watermark-dark.png') : require('../../assets/img/watermark.png')} resizeMode="cover" style={[{ width: imageSize, height: imageSize, borderRadius: 10 }]} />
									</>
							},
							component:
								<Item
									data={{
										component:
											<>
												<View style={{ flex: 1, marginLeft: Platform.OS == 'ios' ? 15 : 20, marginVertical: 10 }}>
													<Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left' }]} numberOfLines={1}>{item?.brand?.toUpperCase()} {item?.model?.toUpperCase()} {item?.version?.toUpperCase()}</Text>
													<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
														<Text style={[DescriptionFontSize(), { color: colors.text }]} numberOfLines={1}>{item?.manufactureYear}/{item?.modelYear} {item?.type == 1 && `${helper.getFirstLetterCapitalized(item?.fuel)} `}{item?.type == 1 && `${helper.getFirstLetterCapitalized(item?.transmission)} `}{new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(item?.mileage)}</Text>
													</View>
													<Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', marginTop: 10 }]}>{item?.price ? Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(item?.price) : 'Consulte'}</Text>
													{config?.unifiedAds &&
														<View style={{ flex: 1, flexDirection: 'row', alignContent: 'center', marginTop: 10 }}>
															<Text style={[DescriptionFontSize(), { color: colors.secondary, textTransform: 'uppercase', flex: 1 }]} numberOfLines={1}>{helper.getStoreName(config, item?.store)}</Text>
															<Text style={[DescriptionFontSize(), { color: colors.primary, textTransform: 'lowercase' }]}>{helper.getStoreDistance(config, item?.store)}</Text>
														</View>
													}
												</View>
											</>,
										padding: false,
									}}
									marginTop={false}
									expanded
									style={{ backgroundColor: 'transparent' }}
								/>,
							separator: {
								data: [dataList[index - 1], item],
								index
							},
							onPress: () => {
								const vehicle = { ...item }
								delete vehicle.separators

								navigation.popTo(backScreen, { vehicle });
							}
						}}
						marginTop={false}
						expanded
						index={index} count={dataList.length}
					/>
				}
			</View>
		)
	}
	const renderItemTest = ({ item, index, separators }) => {
		if (dataList[index]) { dataList[index].separators = separators; }
		const imageSize = Platform.OS == 'ios' ? 62 : 72;

		return (
			<Pressable testID={`StockItem-${index}`}>
				<View>
					{(item?.id && !list) &&
						<>
							<Item
								data={{
									component:
										<View style={{ margin: 0 }} testID={`SearchItem-${index}`} accessibilityLabel={`SearchItem-${index}`}>
											<View>
												{Platform.OS == 'android' &&
													<FastImage
														source={{
															uri: (theme == 'dark'
																? Image.resolveAssetSource(require('../../assets/img/watermark-dark.png')).uri
																: Image.resolveAssetSource(require('../../assets/img/watermark.png')).uri), priority: FastImage.priority.high
														}}
														style={[{ position: 'absolute', width: '100%', height: 160 }]}
													/>
												}
												<FastImage source={{ uri: item?.photos?.[0] }} defaultSource={theme == 'dark' ? require('../../assets/img/watermark-dark.png') : require('../../assets/img/watermark.png')} resizeMode="cover" style={[{ width: '100%', height: 160, borderRadius: Platform.OS == 'ios' ? 10 : 0 }]}>
													{!list &&
														<LinearGradient colors={['#00000060', '#00000000']} style={{ position: 'absolute', flexDirection: 'row', left: 0, right: 0, top: 0, justifyContent: 'space-between' }}>
															<View style={{ flexDirection: 'row', margin: 10 }}>
																{item?.changed?.featured && <Icon name={'star'} type={'material-community'} size={25} color={'#fff'} style={{ marginRight: 8 }} />}
																{item?.video && <Icon name={'video-camera'} type={'font-awesome'} size={22} color={'#fff'} style={{ marginRight: 8 }} />}
															</View>
															<Button icon data={{ icon: { name: item?.favorite ? 'heart' : 'heart-outline', type: 'material-community', size: 24, color: '#fff' }, onPress: () => { saveToFavorite(item); } }} />
														</LinearGradient>
													}

													{item?.armored &&
														<View style={{ position: 'absolute', flexDirection: 'row', top: 125, right: 0, backgroundColor: colors.text, padding: 10, borderTopStartRadius: 15 }}>
															<Text style={[DescriptionFontSize(), { color: colors.background }]}>BLINDADO</Text>
															<Icon name={'shield-check'} type={'material-community'} size={15} color={colors.background} style={{ marginLeft: 5 }} />
														</View>
													}
												</FastImage>

											</View>
											<View style={{ margin: 10 }}>
												{item?.type == 1 &&
													<>
														<Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', textTransform: 'uppercase', fontWeight: 'bold' }]} numberOfLines={1}>{item?.brand} {item?.model}</Text>
														<Text style={[MediumFontSize(), { color: colors.text, textAlign: 'left', textTransform: 'uppercase', fontWeight: '500' }]} numberOfLines={1}>{item?.version}</Text>
													</>
												}
												{item?.type == 2 &&
													<>
														<Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', textTransform: 'uppercase', fontWeight: 'bold' }]} numberOfLines={1}>{item?.brand}</Text>
														<Text style={[MediumFontSize(), { color: colors.text, textAlign: 'left', textTransform: 'uppercase', fontWeight: '500' }]} numberOfLines={1}>{item?.model}</Text>
													</>
												}

												<View style={{ flex: 1, flexDirection: 'column', marginTop: 10 }}>
													<Text style={[DescriptionFontSize(), { color: colors.text, textTransform: 'uppercase' }]}>{item?.manufactureYear}/{item?.modelYear} </Text>
													<Text style={[DescriptionFontSize(), { color: colors.text, textTransform: 'lowercase' }]}>{new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(item?.mileage)}</Text>
												</View>
												<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', marginTop: 10 }}>
													<Text style={[TitleFontSize(1.5), { fontWeight: '500', color: colors.text }]}>{item?.price ? Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(item?.price) : 'Consulte'}</Text>
												</View>
												{config?.unifiedAds &&
													<View style={{ flex: 1, flexDirection: 'row', alignContent: 'center', marginTop: 10 }}>
														<Text style={[DescriptionFontSize(), { color: colors.secondary, textTransform: 'uppercase', flex: 1 }]} numberOfLines={1}>{helper.getStoreName(config, item?.store)}</Text>
														<Text style={[DescriptionFontSize(), { color: colors.primary, textTransform: 'lowercase' }]}>{helper.getStoreDistance(config, item?.store)}</Text>
													</View>
												}
											</View>
										</View>,
									padding: false,
									chevron: false,
									onPress: () => {
										const data = { ...item }
										delete data?.separators
										navigation.navigate('Detail', { ad: data, title: 'Estoque', backScreen })
									}
								}}
								marginTop={false}
								expanded={Platform.OS == 'android'}
							/>
							<View style={{ height: 15 }} />
						</>
					}
					{(item?.id && list) &&
						<Item
							data={{
								icon: {
									component:
										<>
											{Platform.OS == 'android' &&
												<FastImage
													source={{
														uri: (theme == 'dark'
															? Image.resolveAssetSource(require('../../assets/img/watermark-dark.png')).uri
															: Image.resolveAssetSource(require('../../assets/img/watermark.png')).uri), priority: FastImage.priority.high
													}}
													style={[{ position: 'absolute', width: imageSize, height: imageSize, borderRadius: 10 }]}
												/>
											}

											<FastImage source={{ uri: item?.photos?.[0] }} defaultSource={theme == 'dark' ? require('../../assets/img/watermark-dark.png') : require('../../assets/img/watermark.png')} resizeMode="cover" style={[{ width: imageSize, height: imageSize, borderRadius: 10 }]} />
										</>
								},
								component:
									<Item
										data={{
											component:
												<>
													<View style={{ flex: 1, marginLeft: Platform.OS == 'ios' ? 15 : 20, marginVertical: 10 }}>
														<Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left' }]} numberOfLines={1}>{item?.brand?.toUpperCase()} {item?.model?.toUpperCase()} {item?.version?.toUpperCase()}</Text>
														<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
															<Text style={[DescriptionFontSize(), { color: colors.text }]} numberOfLines={1}>{item?.manufactureYear}/{item?.modelYear} {item?.type == 1 && `${helper.getFirstLetterCapitalized(item?.fuel)} `}{item?.type == 1 && `${helper.getFirstLetterCapitalized(item?.transmission)} `}{new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(item?.mileage)}</Text>
														</View>
														<Text style={[TitleFontSize(), { color: colors.text, textAlign: 'left', marginTop: 10 }]}>{item?.price ? Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(item?.price) : 'Consulte'}</Text>
														{config?.unifiedAds &&
															<View style={{ flex: 1, flexDirection: 'row', alignContent: 'center', marginTop: 10 }}>
																<Text style={[DescriptionFontSize(), { color: colors.secondary, textTransform: 'uppercase', flex: 1 }]} numberOfLines={1}>{helper.getStoreName(config, item?.store)}</Text>
																<Text style={[DescriptionFontSize(), { color: colors.primary, textTransform: 'lowercase' }]}>{helper.getStoreDistance(config, item?.store)}</Text>
															</View>
														}
													</View>
												</>,
											padding: false,
										}}
										marginTop={false}
										expanded
										style={{ backgroundColor: 'transparent' }}
									/>,
								separator: {
									data: [dataList[index - 1], item],
									index
								},
								onPress: () => {
									const vehicle = { ...item }
									delete vehicle.separators

									navigation.popTo(backScreen, { vehicle });
								}
							}}
							marginTop={false}
							expanded
							index={index} count={dataList.length}
						/>
					}
				</View>
			</Pressable>
		)
	}

	return (
		<>
			<FlatList
				data={loading ? [] : dataList}
				keyExtractor={(item, index) => String(index)}
				renderItem={isTesting ? renderItemTest : renderItem}
				ItemSeparatorComponent={(props) => { return list ? <Separator props={props} start={Platform.OS == 'ios' ? 75 : 110} /> : <></> }}
				ListEmptyComponent={
					<View>
						{AndroidOldVersion() && <View style={{ height: 20 }} />}
						<Divider />
						<NoAdYet loading={isFetching || loading} text={search} />
					</View>
				}
				contentInsetAdjustmentBehavior={'automatic'}
				keyboardDismissMode={'on-drag'}
				keyboardShouldPersistTaps={'handled'}
				removeClippedSubviews={true}
				initialNumToRender={20}
				maxToRenderPerBatch={40}
				updateCellsBatchingPeriod={10}
				onEndReachedThreshold={0.1}
				testID='SearchScreen'
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				}}
				{...list && {
					style: { backgroundColor: Platform.OS == 'ios' ? colors.ios.item : colors.android.item }
				}}
				{...!search && {
					ListHeaderComponent: () => {
						return (
							<>
								{isTablet() && !list && <View style={{ height: 20 }} />}
								{
									dataList?.length > 0 && favoritesExits &&
									<View style={[(!isTablet() && !Platform.isPad) && { paddingTop: 15 }, { backgroundColor: colors.background }]}>
										<BestSelling type={'favorites'} list={list} backScreen={backScreen} />
										<Divider />
									</View>
								}
							</>
						)
					}
				}}
			/>
			{isFetchingNextPage && !loading &&
				<ActivityIndicator style={{ position: 'absolute', left: 0, top: insets.top, right: 0, bottom: 0 }} />
			}
		</>
	)
}
export default Search;