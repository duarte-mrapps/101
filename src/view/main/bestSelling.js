import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Platform, ScrollView, Appearance, Image } from 'react-native';
import { BorderRadius, Button, DescriptionFontSize, Divider, Icon, Item, MediumFontSize, TitleFontSize, useColors } from 'react-native-ui-devkit';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import analytics from '@react-native-firebase/analytics';

import { isTablet } from 'react-native-device-info';
import { GlobalContext } from '../../libs/globalContext';
import GET, { STATISTICS } from '../../libs/api';
import Session from '../../libs/session';
import helper from '../../libs/helper';

const BestSelling = ({ type, id, brand, model, list, backScreen }) => {
	const { global, setGlobal, store } = useContext(GlobalContext);
	const navigation = useNavigation();
	const colors = useColors();
	const theme = Appearance.getColorScheme();
	const config = Session.getConfig();
	const [favoritesCount, setFavoritesCount] = useState(0);

	const ads = Session.getAds(store?._id);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!global.loadedAds && data) {
			setGlobal((prevState) => ({ ...prevState, loadedAds: true }));
		}
	}, [global, data])

	const { mutateAsync: updateStatistic } = useMutation({
		mutationFn: async (data) => {
			const response = await STATISTICS(data?.store, data?.id, data?.type, data?.add)
			return response
		},
		onError: () => { }
	})

	let query = null;
	if (type == 'featured') { query = { featured: true }; }
	if (type == '0km') { query = { condition: 'Novos' }; }
	if (type == 'pre-owned') { query = { condition: 'Seminovos' }; }
	if (type == 'armored') { query = { armored: true }; }
	if (type == 'relationship') { query = { relationship: true, id, model, brand }; }

	const order = { changeDate: true };
	const { data, isFetching, isError } = useQuery({
		queryKey: [`BestSelling-${type}-${id}-${brand}-${model}`, global.isConnected, store?._id, queryClient],
		queryFn: async () => {
			let data = null;

			if ((!config?._id && !global.isConnected && !store?._id && !type && !queryClient)) { return null; }

			if (type != 'favorites') {
				const response = await GET(0, 6, null, query, order, setGlobal, queryClient)
				data = response?.data ?? null;
			} else if (type == 'favorites') {
				data = ads?.filter(ad => (ad?.favorite && !ad?.changed?.hidden) && ad);
				setFavoritesCount(data?.length);

				data = data?.slice(0, 6);
				data?.map((ad) => {
					const price = parseFloat(ad?.changed?.price);
					if (price) { ad.price = price; }
				});
			}

			return data;
		},
		...type != 'favorites' && { initialData: [...Array(3)] }
	})

	const getHeader = () => {
		let header;
		if (type == 'favorites') { header = 'Favoritos' }
		else if (type == 'featured') { header = store?.featuredTitle }
		else if (type == '0km') { header = '0km' }
		else if (type == 'pre-owned') { header = 'Seminovos' }
		else if (type == 'armored') { header = 'Blindados' }
		else if (type == 'relationship') { header = 'Ofertas relacionadas' }
		return header;
	}

	const saveToFavorite = (ad) => {
		if (ad?.store) {
			const ads = Session.getAds(store?._id);

			const getStore = helper.getStore(config, ad?.store);
			const index = ads?.findIndex(item => (item?.id == ad?.id && item?.store == getStore?._id) && item);

			if (ads?.[index] && index != -1) {
				const favorite = !ads?.[index]?.favorite;

				ads[index].favorite = favorite;
				Session.setAds(ads, store?._id);

				queryClient.invalidateQueries().then(() => {
					setGlobal((prevState) => ({ ...prevState, timestamp: Date.now() }));
				});

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

	return data?.length >= 1 && (
		<>
			<Item
				header={getHeader()}
				headerOnAndroid
				data={{
					component:
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={{ flexDirection: 'row' }}
							contentContainerStyle={{ paddingHorizontal: 15 }}>

							{data?.map((item, index) => {
								return (
									<Item
										key={index}
										data={{
											component:
												<>
													<View style={{ marginTop: 10, marginHorizontal: 10 }}>
														{Platform.OS == 'android' &&
															<FastImage
																source={{
																	uri: (theme == 'dark'
																		? Image.resolveAssetSource(require('../../assets/img/watermark-dark.png')).uri
																		: Image.resolveAssetSource(require('../../assets/img/watermark.png')).uri), priority: FastImage.priority.high
																}}
																style={[BorderRadius(), { position: 'absolute', width: 200, height: 140, borderRadius: Platform.OS == 'ios' ? 10 : 25 }]} resizeMode={FastImage.resizeMode.cover}
															/>
														}

														<FastImage testID={`best-selling-${index}`} source={{ uri: item?.photos?.[0] }} defaultSource={theme == 'dark' ? require('../../assets/img/watermark-dark.png') : require('../../assets/img/watermark.png')} style={[BorderRadius(), { width: 200, height: 140, borderRadius: Platform.OS == 'ios' ? 10 : 25 }]} resizeMode={FastImage.resizeMode.cover}>
															{!list && item?.id &&
																<LinearGradient colors={['#00000060', '#00000000']} style={{ position: 'absolute', flexDirection: 'row', left: 0, right: 0, top: 0, justifyContent: 'space-between' }} >
																	<View style={{ flexDirection: 'row', margin: 10 }}>
																		{item?.changed?.featured && <Icon name={'star'} type={'material-community'} size={25} color={'#fff'} style={{ marginRight: 8 }} />}
																		{item?.video && <Icon name={'video-camera'} type={'font-awesome'} size={22} color={'#fff'} style={{ marginRight: 8 }} />}
																	</View>
																	<Button icon data={{ icon: { name: item?.favorite ? 'heart' : 'heart-outline', type: 'material-community', size: 24, color: '#fff' }, onPress: () => { saveToFavorite(item); } }} />
																</LinearGradient>
															}

															<LinearGradient colors={['#00000000', '#00000060']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', padding: 15 }} >
																<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
																	<Text style={{ color: "#fff" }}>{item?.manufactureYear ? `${item?.manufactureYear}/${item?.modelYear}` : ''}</Text>
																	<Text style={{ color: "#fff" }}>{item?.mileage != null ? Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilometer' }).format(item?.mileage) : ''}</Text>
																</View>
															</LinearGradient>
														</FastImage>
													</View>
													<View style={{ margin: 10, width: 200, gap: 5 }}>
														{item?.type == 1
															? <View>
																<Text style={[TitleFontSize(), { color: colors.text, textTransform: 'uppercase', fontWeight: 'bold' }]} numberOfLines={1}>{item?.brand ? item?.brand?.toUpperCase() : 'AGUARDE'} {item?.model ? item?.model?.toUpperCase() : ''}</Text>
																<Text style={[MediumFontSize(), { color: colors.text, textTransform: 'uppercase', fontWeight: '500' }]} numberOfLines={1}>{item?.version ? item?.version?.toUpperCase() : 'CARREGANDO...'}</Text>
															</View>
															: <View>
																<Text style={[TitleFontSize(), { color: colors.text, textTransform: 'uppercase', fontWeight: 'bold' }]} numberOfLines={1}>{item?.brand ? item?.brand?.toUpperCase() : 'AGUARDE'}</Text>
																<Text style={[MediumFontSize(), { color: colors.text, textTransform: 'uppercase', fontWeight: '500' }]} numberOfLines={1}>{item?.model ? item?.model?.toUpperCase() : 'CARREGANDO...'}</Text>
															</View>
														}
														<Text style={[TitleFontSize(), { fontWeight: 'bold', color: colors.text, marginTop: 5 }]}>{item?.price ? Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(item?.price) : 'Consulte'}</Text>
													</View>
												</>,
											padding: false,
											chevron: false,
											...!isFetching && item?.id && {
												onPress: () => {
													if (type == 'favorites') {
														if (list) {
															const vehicle = { ...item }
															delete vehicle.separators
															navigation.navigate(backScreen,
																{ vehicle },
																{ merge: true })
														} else {
															navigation.push('Detail', { ad: item, backScreen });
														}
													} else {
														navigation.push('Detail', { ad: item, backScreen });
													}
												}
											}
										}}
										marginTop={false}
										separators={false}
										style={[BorderRadius(), { marginLeft: 0, marginRight: data?.length > (index + 1) ? 15 : 0, borderRadius: Platform.OS == 'ios' ? 20 : 35 }]}
									/>
								)
							})}

							{type != 'relationship' && type != 'favorites' &&
								<Item
									key={99}
									data={{
										component:
											<>
												<View style={{ marginTop: 10, marginHorizontal: 10 }}>
													<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: 200, height: Platform.OS == 'ios' ? 229 : 242 }}>
														<Icon name={'arrow-forward-circle-sharp'} type='ionicons' size={40} color={colors.primary} />
														<Text style={[{ color: colors.primary, marginTop: 10 }, TitleFontSize()]}>Ver mais...</Text>
													</View>
												</View>
											</>,
										padding: false,
										chevron: false,
										onPress: () => { navigation.navigate('SearchHome', { type }) }
									}}
									marginTop={false}
									separators={false}
									style={[BorderRadius(), { marginLeft: 15, marginRight: 0, borderRadius: Platform.OS == 'ios' ? 20 : 35 }]}
								/>
							}

							{(type == 'favorites' && favoritesCount > 6) &&
								<Item
									key={99}
									data={{
										component:
											<>
												<View style={{ marginTop: 10, marginHorizontal: 10 }}>
													<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: 200, height: Platform.OS == 'ios' ? 229 : 242 }}>
														<Icon name={'arrow-forward-circle-sharp'} type='ionicons' size={40} color={colors.primary} />
														<Text style={[{ color: colors.primary, marginTop: 10 }, TitleFontSize()]}>Ver mais...</Text>
													</View>
												</View>
											</>,
										padding: false,
										chevron: false,
										onPress: () => { navigation.navigate('Favorites', { list, backScreen }) }
									}}
									marginTop={false}
									separators={false}
									style={[BorderRadius(), { marginLeft: 15, marginRight: 0, borderRadius: Platform.OS == 'ios' ? 20 : 35 }]}
								/>
							}
						</ScrollView>,
					padding: false
				}} marginTop={(((isTablet() || Platform.isPad) && type == 'favorites' && !list) || (!isTablet() && !Platform.isPad && type == 'favorites')) ? false : true} style={{ backgroundColor: 'transparent' }} separators={false} expanded
			/>
		</>
	)
}

export default BestSelling;