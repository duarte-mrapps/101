import React from 'react';
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { isIphoneX } from 'react-native-iphone-screen-helper';
import { moderateScale } from 'react-native-size-matters';
import { useColors } from 'react-native-ui-devkit';

export const elevationShadowStyle = (elevation) => {
    if (Platform.OS == 'android') {
        elevation = (elevation * 3);
    }

    return {
        //backgroundColor: "#f0f0f0",
        elevation,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 * elevation },
        shadowOpacity: 0.3,
        shadowRadius: 0.6 * elevation
    };
}

export const backgroundColor = (color) => {
    return {
        backgroundColor: color
    };
}

export const color333 = "#333";
export const color666 = "#666";
export const color999 = "#999";

const getGlobalStyles = (props) => StyleSheet.create({
    whiteColor: {
        color: "#fff"
    },

    blackColor: {
        color: "#000"
    },

    container: {
        flex: 1
    },

    headerHome: {
        backgroundColor: "#5680A9",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 58,
        paddingLeft: 10,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10
    },

    titleHome: {
        fontSize: 24,
        color: "#fff",
        flex: 1
    },

    noBorderTopRadius: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },

    noBorderBottomRadius: {
        borderBottomStartRadius: 0,
        borderBottomEndRadius: 0,

        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },

    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: props.colors.button,
        paddingHorizontal: Platform.OS == 'ios' ? 15 : 20,
        paddingVertical: Platform.OS == 'ios' ? 15 : 15,
        borderRadius: Platform.OS == 'ios' ? 12 : 25,
        marginHorizontal: Platform.OS == 'ios' ? 15 : 15,
        borderTopColor: props.colors.border,
        marginTop: 1,
        borderBottomColor: props.colors.border
    },

    buttonText: {
        flex: 1,
        fontSize: 17,
        color: props.colors.primary,
        textAlign: 'center'
    },

    selected: {
        borderWidth: 2,
        borderColor: '#5680A9'
    },

    buttonMT: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: props.colors.item,
        paddingHorizontal: Platform.OS == 'ios' ? 15 : 20,
        paddingVertical: Platform.OS == 'ios' ? 6 : 15,
        borderRadius: Platform.OS == 'ios' ? (Platform.Version >= '15.0' ? 12 : 0) : 25,
        marginHorizontal: Platform.OS == 'ios' ? (Platform.Version >= '15.0' ? 15 : 0) : 0,
        marginTop: (Platform.OS == 'ios' ? 35 : 10),
        borderTopColor: props.colors.border,
        borderBottomColor: props.colors.border
    },

    item: {
        // flexDirection: "row",
        // alignItems: "center",
        // backgroundColor: props.colors.item,
        // paddingHorizontal: Platform.OS == 'ios' ? 15 : 20,
        // paddingVertical: Platform.OS == 'ios' ? 6 : 15,
        // borderRadius: Platform.OS == 'ios' ? (Platform.Version >= '15.0' ? 12 : 0) : 25,
        // marginHorizontal: Platform.OS == 'ios' ? (Platform.Version >= '15.0' ? 15 : 0) : 0,
        // borderTopColor: props.colors.border,
        // marginBottom: -0.8,
        // borderBottomColor: props.colors.border

        flexDirection: "row",
        alignItems: "center",
        backgroundColor: props.colors.item,
        paddingHorizontal: Platform.OS == 'ios' ? 15 : 20,
        paddingVertical: Platform.OS == 'ios' ? 4 : 5,
        borderRadius: Platform.OS == 'ios' ? (parseInt(Platform.Version) >= 15 ? 12 : 0) : (parseInt(Platform.constants.Release) >= 10 ? 25 : 0),
        marginHorizontal: Platform.OS == 'ios' ? (parseInt(Platform.Version) >= 15 ? 15 : 0) : 0,
        marginTop: -(StyleSheet.hairlineWidth + StyleSheet.hairlineWidth),
        zIndex: 0
    },

    itemWhite: {
        height: Platform.OS == 'ios' ? 44 : 50,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 10,
        marginBottom: 1,
    },

    itemTextInput: {
        marginTop: (Platform.OS == 'ios' ? 35 : 10),
        backgroundColor: '#fff',
        borderRadius: 5,
        marginHorizontal: 10,
        padding: 10,
        fontSize: 14
    },

    dividerWithIcon: {
        marginLeft: Platform.OS == 'ios' ? (Platform.Version >= '15.0' ? 74 : 59) : 65,
        marginRight: Platform.OS == 'ios' ? (Platform.Version >= '15.0' ? 15 : 0) : 0,
        height: 0.8,
        zIndex: 2
    },

    textInput: {
        flex: 1,
        fontSize: 17,
        height: 30,
        padding: 0
    },

    itemTitleWhite: {
        flex: 1,
        textAlign: "left",
        marginBottom: 10,
        color: "#666",
    },

    itemTitle: {
        flex: 1,
        textAlign: "left",
        margin: 10,
        textTransform: "uppercase",
        color: "#666"
    },

    itemText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 17,
        color: props.colors.text
    },

    itemLeftIcon: {
        width: 29,
        height: 29,
        alignContent: "center",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#999',
        borderRadius: (Platform.OS == 'ios' ? 6 : 12)
    },

    itemRightButton: {
        flexDirection: "row",
        display: Platform.OS === 'ios' ? 'flex' : 'none',
        opacity: 0.50
    },

    itemMT: {
        marginTop: (Platform.OS == 'ios' ? 35 : 20),
    },

    itemMB: {
        paddingBottom: (Platform.OS == 'ios' ? 35 : 10),
        borderRadius: 5
    },

    itemMTWhite: {
        paddingTop: (Platform.OS == 'ios' ? 35 : 10),
        borderRadius: 5,
        backgroundColor: '#fff'
    },

    itemMBWhite: {
        paddingBottom: (Platform.OS == 'ios' ? 35 : 10),
        borderRadius: 5,
        backgroundColor: '#fff'
    },

    promotionItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
        borderRadius: 5,
        marginBottom: 1
    },

    alignItemsCenter: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center"
    },

    avatarMenu: {
        backgroundColor: props.colors.background,
        borderRadius: 100,
        width: 62,
        height: 62
    },

    itemAvatarMenu: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: 35,
        height: 35,
        borderRadius: 100,
        resizeMode: "cover",
        overflow: 'hidden'
    },

    searchHeaderHome: {
        height: Platform.OS === 'ios' ? 35 : 45,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Platform.OS == 'ios' ? props.colors.ios.searcherBackground : props.colors.background,
        paddingLeft: 1,
        paddingRight: 1,
        marginHorizontal: Platform.OS == 'ios' ? 15 : 10,
        marginBottom: 10,
        borderRadius: 10
    },

    categoryButtonHeader: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        marginLeft: 20,
        backgroundColor: props.colors.primary
    },

    categoryTextHeader: {
        width: 50,
        textAlign: "center",
        marginLeft: 20,
        marginTop: 10,
        fontSize: 11,
        color: props.colors.secondary
    },

    buttonHeaderHome: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: props.colors.button,
        paddingHorizontal: Platform.OS == 'ios' ? 15 : 20,
        paddingVertical: Platform.OS == 'ios' ? 6 : 15,
        borderRadius: Platform.OS == 'ios' ? 12 : 25,
        marginHorizontal: Platform.OS == 'ios' ? 15 : 0,
        //borderTopWidth: 0.25,
        borderTopColor: props.colors.border,
        marginTop: 1,
        borderBottomColor: props.colors.border
    },

    textItemButtonHeaderHome: {
        flex: 1,
        marginLeft: 15,
        fontSize: 17,
        color: '#fff',
        textAlign: 'center'
    },

    highlightButton: {
        flex: 1,
        flexDirection: "row"
    },

    highlightIcon: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
        padding: 5,
        width: 50,
        height: 50
    },

    highlightText: {
        flex: 1,
        marginTop: 10,
        marginRight: 10
    },

    highlightRightButton: {
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        display: Platform.OS === 'ios' ? 'flex' : 'none'
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute"
    },

    buttonFooter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center"
    },

    homeButtonFooter: {
        backgroundColor: props.colors.button,
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25,
        zIndex: 99
    },

    leftButtonFooter: {
        height: 60,
        flexDirection: "row",
        justifyContent: "flex-start",
        paddingLeft: 10,
        paddingRight: 50,
        width: Dimensions.get('screen').width / 2,
        alignItems: "center"
    },

    rightButtonFooter: {
        height: 60,
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingRight: 10,
        paddingLeft: 50,
        width: Dimensions.get('screen').width / 2,
        alignItems: "center"
    },

    activeButtonFooter: {
        opacity: 1
    },

    activeItemButtonFooter: {
        opacity: 1,
        borderRadius: 20
    },

    activeColorTextItemButtonFooter: {
        color: '#fff'
    },

    itemButtonFooter: {
        color: '#fff',
        flex: 1,
        textAlign: "center",
        alignContent: "center",
        alignItems: "center",
        paddingTop: 5,
        paddingLeft: 0,
        paddingRight: 0,
        height: 40,
        opacity: 1
    },

    itemButtonTextFooter: {
        fontSize: 10,
        marginHorizontal: 5,
        color: "#888"
    },

    footerBarBottom: {
        flex: 1,
        backgroundColor: props.colors.tabbar.color,
        opacity: 1,
        height: (isIphoneX() ? 52 : 38)
    },

    // PROFILE: BEGIN
    menuButtonSelected: {
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: "#475463",
        flexDirection: 'row',
        marginHorizontal: 10
    },

    menuButton: {
        alignItems: 'center',
        borderWidth: 0,
        backgroundColor: "#f0f0f0",
        borderRadius: 30,
        flexDirection: 'row',
        marginHorizontal: 10
    },

    menuButtonText: {
        paddingVertical: 5,
        paddingHorizontal: 0,
        textAlign: 'center',
        color: "#666",
        fontSize: 17
    },
    // PROFILE: END

    // PROFILE: BEGIN
    profileMenuButtonSelected: {
        alignItems: 'center',
        borderWidth: 0,
        backgroundColor: props.colors.button,
        borderRadius: 30,
        flexDirection: 'row'
    },

    profileMenuButton: {
        alignItems: 'center',
        borderWidth: 0,
        backgroundColor: props.colors.button,
        borderRadius: 30,
        flexDirection: 'row',
        opacity: 0.8
    },

    profileMenuButtonText: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        textAlign: 'center',
        color: '#ccc'
    },
    // PROFILE: END

    // COUPOM ITEM: BEGIN
    coupomItem: {
        backgroundColor: props.colors.card,
        marginHorizontal: 10,
        marginBottom: 10,
        flexDirection: "row",
        borderRadius: 5,
        borderStartWidth: 0
    },

    coupomItemHeader: {
        margin: 1,
        width: 0,
        height: 0,
        borderTopLeftRadius: 5,
        borderTopWidth: 15,
        borderRightWidth: 15,
        borderRightColor: "transparent"
    },

    coupomItemLeftCard: {
        flex: 1,
        marginVertical: 10,
        marginHorizontal: 10
    },

    coupomItemLeftCardDiscount: {
        marginHorizontal: 10,
        marginTop: 10,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center'
    },

    coupomItemLeftCardDiscountBox: {
        flexDirection: "row",
        width: 80,
    },

    coupomItemLeftCardDiscountBoxTitle: {
        fontSize: 24,
        color: props.colors.secondary
    },

    coupomItemLeftCardDiscountBoxPercent: {
        fontSize: 17,
        color: props.colors.text,
        marginTop: 5,
        marginRight: 10,
        fontWeight: "bold"
    },

    coupomItemLeftCardDiscountText: {
        fontSize: 14,
        color: props.colors.secondary,
        marginTop: -5,
        textAlign: "left",
        textTransform: "lowercase"
    },

    coupomItemLeftCardPrice: {
        flex: 1,
        textDecorationLine: 'line-through',
        color: props.colors.secondary,
        fontStyle: 'italic',
        marginLeft: 0
    },

    coupomItemLeftCardFooter: {
        flex: 1,
        marginRight: 10,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "flex-start"
    },

    coupomItemLeftCardFooterNote: {
        fontSize: 12,
        marginHorizontal: 5,
        color: props.colors.secondary
    },

    coupomItemLeftCardFooterName: {
        flex: 1,
        fontSize: 12,
        color: props.colors.secondary
    },

    coupomItemMiddleCardTop: {
        width: 15,
        height: 7.5,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopEndRadius: 1,
        backgroundColor: props.colors.background,
        marginTop: -1,
        borderColor: props.colors.background,
        borderStartWidth: 1,
        borderEndWidth: 1,
        borderBottomWidth: 1
    },

    coupomItemMiddleCardCenter: {
        flex: 1,
        alignItems: "center"
    },

    coupomItemMiddleCardCenterLine: {
        borderLeftColor: props.colors.background,
        borderLeftWidth: 1,
        height: "100%"
    },

    coupomItemMiddleCardBottom: {
        width: 15,
        height: 7.5,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomEndRadius: 1,
        backgroundColor: props.colors.background,
        marginBottom: -1,
        borderColor: props.colors.background,
        borderStartWidth: 1,
        borderEndWidth: 1,
        borderTopWidth: 1
    },

    coupomItemRightCard: {
        width: 60,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10
    },

    coupomItemRightCardKm: {
        backgroundColor: props.colors.text,
        borderRadius: 5,
        padding: 0
    },

    coupomItemRightCardKmText: {
        textAlign: "center",
        color: props.colors.secondary
    },

    coupomItemRightCardMiddleBox: {
        textAlign: "center",
        fontSize: 12,
        marginTop: 0,
        color: props.colors.secondary
    },

    coupomItemRightCardMiddleBoxQtd: {
        fontSize: 20,
        textAlign: "center",
        color: props.colors.text
    },

    coupomItemRightCardMiddleBoxValidText: {
        marginTop: 10,
        fontSize: 12,
        textAlign: "center",
        color: props.colors.secondary
    },

    coupomItemRightCardMiddleBoxValidDate: {
        textAlign: "center",
        color: props.colors.secondary
    },
    // COUPOM ITEM: END

    // CHAT: BEGIN
    chatItem: {
        marginVertical: moderateScale(7, 2),
        flexDirection: 'row'
     },
     chatItemIn: {
         marginLeft: 20
     },
     chatItemOut: {
        alignSelf: 'flex-end',
        marginRight: 20
     },
     balloon: {
        maxWidth: moderateScale(250, 2),
        paddingHorizontal: moderateScale(10, 2),
        paddingTop: moderateScale(5, 2),
        paddingBottom: moderateScale(7, 2),
        borderRadius: 20,
     },
     arrowContainer: {
         position: 'absolute',
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
         zIndex: -1,
         flex: 1
     },
     arrowLeftContainer: {
         justifyContent: 'flex-end',
         alignItems: 'flex-start'
     },
 
     arrowRightContainer: {
         justifyContent: 'flex-end',
         alignItems: 'flex-end',
     },
 
     arrowLeft: {
         left: moderateScale(-6, 0.5),
     },
 
     arrowRight: {
         right:moderateScale(-6, 0.5),
     }
    // CHAT: END

});

function useGlobalStyles(global) {
    const colors = useColors();
    const styles = React.useMemo(() => getGlobalStyles({ colors, global }), [colors]);
    return styles;
}

export default useGlobalStyles;