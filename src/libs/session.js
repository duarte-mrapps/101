import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import DeviceInfo from 'react-native-device-info';
import uuid from 'react-native-uuid';

const storage = new MMKV();

export const Constants = {
    ACCOUNT_ID: '67a6540177aaee85f49f3b44',
    ONESIGNAL_APP_ID: '13f08ca5-cda1-4114-a7e6-dadbfcf37eb3',

    SECRET_KEY: '8d05000647b79e5984339beff29549669b2c18af4fe2a8a9ed51e9559afc952c6227ecc1da91b4eb4017e6ac89579e8e35e32609c99b25a5dd904d359663ef9c',
    uniqueId: 'com.mrapps.cardealer:uniqueId',
    global: 'com.mrapps.cardealer:global',
    profile: 'com.mrapps.cardealer:profile',
    tempProfile: 'com.mrapps.cardealer:tempProfile',
    store: 'com.mrapps.cardealer:store',
    ads: 'com.mrapps.cardealer:ads',
    adsUpdatedAt: 'com.mrapps.cardealer:adsUpdatedAt',
    config: 'com.mrapps.cardealer:config'
}

export const Session = {
    // UNIQUE ID
    setUniqueId: async () => {
        const exists = Session.getUniqueId();
        if (exists == null || exists == '') {
            Platform.OS == 'ios' && await DeviceInfo.syncUniqueId().then((uniqueId) => { });

            let uniqueId = await DeviceInfo.getUniqueId();
            if (uniqueId == null) {
                uniqueId = uuid.v4();
            }

            storage.set(Constants.uniqueId, JSON.stringify(uniqueId))
        }
    },

    getUniqueId: () => {
        const _id = storage.getString(Constants.uniqueId);
        return (_id ? JSON.parse(_id) : '');
    },

    // GLOBAL
    setGlobal: (global) => {
        storage.set(Constants.global, JSON.stringify(global))
    },

    getGlobal: () => {
        const global = storage.getString(Constants.global);
        return (global ? JSON.parse(global) : null);
    },

    // STORE
    setStore: (store) => {
        store = JSON.stringify(store);
        storage.set(Constants.store, store ?? null);
    },

    getStore: () => {
        let store = storage.getString(Constants.store);

        try {
            if (store) { store = JSON.parse(store ?? null); }
            return (store ?? null);
        } catch (err) {
            return null;
        }
    },

    // ADS
    setAds: (ads, _id) => {
        ads = JSON.stringify(ads);
        storage.set(`${Constants.ads}-${_id}`, ads);
    },

    getAds: (_id) => {
        _id = _id ?? Session.getStore()?._id;
        let ads = storage.getString(`${Constants.ads}-${_id}`);

        try {
            return (ads ? JSON.parse(ads) : null);
        } catch (err) {
            return null;
        }
    },

    //ADS UPDATED AT
    setAdsUpdatedAt: (adsUpdatedAt, _id) => {
        adsUpdatedAt = JSON.stringify(adsUpdatedAt);
        storage.set(`${Constants.adsUpdatedAt}-${_id}`, adsUpdatedAt ?? null);
    },

    getAdsUpdatedAt: (_id) => {
        let adsUpdatedAt = storage.getString(`${Constants.adsUpdatedAt}-${_id}`);

        try {
            if (adsUpdatedAt) {
                adsUpdatedAt = JSON.parse(adsUpdatedAt);
                adsUpdatedAt = new Date(adsUpdatedAt);
            }
            return (adsUpdatedAt ?? null);
        } catch (err) {
            return null;
        }
    },

    // CONFIG
    setConfig: (config) => {
        config = JSON.stringify(config);
        storage.set(Constants.config, config ?? null);
    },

    getConfig: () => {
        let config = storage.getString(Constants.config);
        try {
            if (config) { config = JSON.parse(config); }
            return (config ?? null);
        } catch {
            return null;
        }
    }
}

export default Session;