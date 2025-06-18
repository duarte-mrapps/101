import React from "react";
import { ActivityIndicator, View, Text, Platform } from "react-native";
import { Divider, Icon, MediumFontSize, useColors } from 'react-native-ui-devkit';

export default NoDataYet = (props) => {
    const colors = useColors();

    return (
        <View style={{ paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>

            {props?.loading && <Divider />}
            {props?.loading && <ActivityIndicator style={{ marginBottom: 10 }} />}
            {props?.loading && <Text style={{ fontSize: Platform.OS == 'ios' ? 17 : 16, fontWeight: Platform.OS == 'ios' ? 'normal' : '400', color: colors.text, textAlign: 'center' }}>{'Por favor espere, carregando...'}</Text>}

            {!props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={{ fontSize: Platform.OS == 'ios' ? 22 : 16, fontWeight: Platform.OS == 'ios' ? 'bold' : '400', color: colors.text, textAlign: 'center' }}>Nenhum resultado</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', fontWeight: 'bold' }}>Nenhum resultado para "{props.text}"</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>Verifique a ortografia ou tente uma nova pesquisa.</Text>}

            {Platform.OS == 'android' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 16, fontWeight: '400', color: colors.text, textAlign: 'center' }}>Nenhum resultado encontrado</Text>}
        </View>
    );
}

export const NoAdYet = (props) => {
    const colors = useColors();

    return (
        <View style={{ paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>

            {props?.loading && <ActivityIndicator style={{ marginBottom: 10 }} />}
            {props?.loading && <Text style={[MediumFontSize(), { fontWeight: Platform.OS == 'ios' ? 'normal' : '400', color: colors.secondary, textAlign: 'center' }]}>{'Por favor espere, carregando...'}</Text>}

            {!props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={{ fontSize: Platform.OS == 'ios' ? 22 : 16, fontWeight: Platform.OS == 'ios' ? 'bold' : '400', color: colors.text, textAlign: 'center' }}>Nenhum veículo</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>Os veículos disponiveis aparecerão aqui.</Text>}

            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', fontWeight: 'bold' }}>Nenhum resultado para "{props.text}"</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>Verifique a ortografia ou tente uma nova pesquisa.</Text>}

            {Platform.OS == 'android' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 16, fontWeight: '400', color: colors.text, textAlign: 'center' }}>Nenhum resultado encontrado</Text>}
        </View>
    );
}

export const NoStoreYet = (props) => {
    const colors = useColors();

    return (
        <View style={{ paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>

            {props?.loading && <ActivityIndicator style={{ marginBottom: 10 }} />}
            {props?.loading && <Text style={[MediumFontSize(), { fontWeight: Platform.OS == 'ios' ? 'normal' : '400', color: colors.secondary, textAlign: 'center' }]}>{'Por favor espere, carregando...'}</Text>}

            {!props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={{ fontSize: Platform.OS == 'ios' ? 22 : 16, fontWeight: Platform.OS == 'ios' ? 'bold' : '400', color: colors.text, textAlign: 'center' }}>Nenhuma loja</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>As lojas disponiveis aparecerão aqui.</Text>}

            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', fontWeight: 'bold' }}>Nenhum resultado para "{props.text}"</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>Verifique a ortografia ou tente uma nova pesquisa.</Text>}

            {Platform.OS == 'android' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 16, fontWeight: '400', color: colors.text, textAlign: 'center' }}>Nenhum resultado encontrado</Text>}
        </View>
    );
}

export const NoFavoritesYet = (props) => {
    const colors = useColors();

    return (
        <View style={{ paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>

            {props?.loading && <ActivityIndicator style={{ marginBottom: 10 }} />}
            {props?.loading && <Text style={[MediumFontSize(), { fontWeight: Platform.OS == 'ios' ? 'normal' : '400', color: colors.secondary, textAlign: 'center' }]}>{'Por favor espere, carregando...'}</Text>}

            {!props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={{ fontSize: Platform.OS == 'ios' ? 22 : 16, fontWeight: Platform.OS == 'ios' ? 'bold' : '400', color: colors.text, textAlign: 'center' }}>Nenhum favorito</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>Os favoritos que você adicionar aparecerão aqui.</Text>}

            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', fontWeight: 'bold' }}>Nenhum resultado para "{props.text}"</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>Verifique a ortografia ou tente uma nova pesquisa.</Text>}

            {Platform.OS == 'android' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 16, fontWeight: '400', color: colors.text, textAlign: 'center' }}>Nenhum resultado encontrado</Text>}
        </View>
    );
}

export const NoServicesYet = (props) => {
    const colors = useColors();

    return (
        <View style={{ paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>

            {props?.loading && <ActivityIndicator style={{ marginBottom: 10 }} />}
            {props?.loading && <Text style={[MediumFontSize(), { fontWeight: Platform.OS == 'ios' ? 'normal' : '400', color: colors.secondary, textAlign: 'center' }]}>{'Por favor espere, carregando...'}</Text>}

            {!props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={{ fontSize: Platform.OS == 'ios' ? 22 : 16, fontWeight: Platform.OS == 'ios' ? 'bold' : '400', color: colors.text, textAlign: 'center' }}>Nenhum serviço</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>Os serviços disponíveis aparecerão aqui.</Text>}

            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', fontWeight: 'bold' }}>Nenhum resultado para "{props.text}"</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>Verifique a ortografia ou tente uma nova pesquisa.</Text>}

            {Platform.OS == 'android' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 16, fontWeight: '400', color: colors.text, textAlign: 'center' }}>Nenhum resultado encontrado</Text>}
        </View>
    );
}

export const NoNotificationYet = (props) => {
    const colors = useColors();

    return (
        <View style={{ paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>

            {props?.loading && <ActivityIndicator style={{ marginBottom: 10 }} />}
            {props?.loading && <Text style={[MediumFontSize(), { fontWeight: Platform.OS == 'ios' ? 'normal' : '400', color: colors.secondary, textAlign: 'center' }]}>{'Por favor espere, carregando...'}</Text>}

            {!props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={{ fontSize: Platform.OS == 'ios' ? 22 : 16, fontWeight: Platform.OS == 'ios' ? 'bold' : '400', color: colors.text, textAlign: 'center' }}>Nenhuma notificação</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text == null || props?.text?.trim() == '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>As notificações que você receber aparecerão aqui.</Text>}

            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', fontWeight: 'bold' }}>Nenhum resultado para "{props.text}"</Text>}
            {Platform.OS == 'ios' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={[MediumFontSize(), { color: colors.secondary, textAlign: 'center', marginTop: 5 }]}>Verifique a ortografia ou tente uma nova pesquisa.</Text>}

            {Platform.OS == 'android' && !props?.loading && (props?.text != null && props?.text?.trim() != '') && <Text style={{ fontSize: 16, fontWeight: '400', color: colors.text, textAlign: 'center' }}>Nenhum resultado encontrado</Text>}
        </View>
    );
}