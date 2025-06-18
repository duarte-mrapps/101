import CryptoJS from 'crypto-js';
import Session, { Constants } from "../session";
import helper from '../helper';

const { default: axios } = require("axios");

const timestamp = new Date().getTime();
const configUrl = `https://mrapps.s3.amazonaws.com/accounts/${Constants.ACCOUNT_ID}/config.json?timestamp=${timestamp}`;
const adsUrl = `https://mrapps.s3.amazonaws.com/accounts/${Constants.ACCOUNT_ID}/ads.json?timestamp=${timestamp}`;

export const getConfig = async (setGlobal, setStore) => {
  const config = Session.getConfig();
  let store = Session.getStore();

  let refresh = true;
  const query = { account: Constants.ACCOUNT_ID };

  let data = CryptoJS.TripleDES.encrypt(JSON.stringify(query), Constants.SECRET_KEY).toString();
  data = encodeURIComponent(data);

  if (store?.api?.endpoint) {
    const request = {
      method: 'get',
      url: `${store?.api?.endpoint}/app/config/updatedAt?data=${data}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const encryptedResponse = await axios.request(request);
    if (encryptedResponse?.data) {
      let decryptedData = CryptoJS.TripleDES.decrypt(encryptedResponse.data, Constants.SECRET_KEY).toString(CryptoJS.enc.Utf8);
      if (decryptedData) {
        const parseData = JSON.parse(decryptedData);
        if (parseData?.status == 200) {
          refresh = config?.updatedAt != parseData?.updatedAt;
        }
      }
    }
  }

  try {
    if (refresh) {
      const response = await axios.get(configUrl)
      if (response.status == 200) {
        const config = response.data;

        if (config?.status != 'active') {
          config?.stores?.map((store) => {
            Session.setAds([], store?._id)
            store.banners = [];
          })
        }

        let defaultStore = config?.stores?.find((item) => item?._id == config?.defaultStore);
        if (defaultStore == null) { defaultStore = config?.stores?.[0]; }

        if (store == null && defaultStore) {
          setStore(defaultStore);
          Session.setStore(defaultStore);
        } else {
          let searchStore = config?.stores?.find((item) => item?.document == store?.document);

          if (searchStore) {
            setStore(searchStore);
            Session.setStore(searchStore);
          } else if (config?.stores?.[0]) {
            setStore(config?.stores?.[0]);
            Session.setStore(config?.stores?.[0]);
          } else {
            setStore(null);
            Session.setStore(null);
          }
        }

        Session.setConfig(config);
        setGlobal((prevState) => ({ ...prevState, timestamp: Date.now() }));
      } else {
        setTimeout(() => {
          getConfig(setGlobal, setStore);
        }, 4000);
      }
    }
  } catch {
    setTimeout(() => {
      getConfig(setGlobal, setStore);
    }, 4000);
  }
}

export const getMirrorAds = async (storeId = null) => {
  try {
    const response = await axios.get(adsUrl)
    if (response?.status == 200) {
      const ads = response?.data?.filter(ad => { return (ad?.store == storeId || storeId == null) });
      return ads;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

const GET = async (page = 0, itemsPerPage = 10, search = null, filter = null, order = null, setGlobal = null, queryClient = null) => {
  const config = Session.getConfig();
  const store = Session.getStore();
  let ads = Session.getAds(store?._id);
  const updatedAt = Session.getAdsUpdatedAt(store?._id);

  let refresh = false;

  const paginate = (data) => {
    let list = [...data];
    list = list?.filter((ad) => { return !ad?.changed?.hidden; });

    if (filter?.relationship) {
      list = list?.filter(item => (item?.model?.toUpperCase() == filter?.model?.toUpperCase() && item?.id != filter?.id && !item?.changed?.hidden) && item);
      if (list?.length == 0) {
        list = [...data];
        list = list?.filter(item => (item?.brand?.toUpperCase() == filter?.brand?.toUpperCase() && item?.id != filter?.id && !item?.changed?.hidden) && item);
      }
    } else {
      list = list?.filter((item) => {
        return (
          (!filter?.store?._id || item?.store == filter?.store?._id)
          && (!filter?.type || (item?.type == filter?.type))
          && (!filter?.condition ||
            (filter?.condition == 'Novos / Seminovos' && (!item?.isZeroKm || item?.isZeroKm)) ||
            (filter?.condition == 'Novos' && item?.isZeroKm) ||
            (filter?.condition == 'Seminovos' && !item?.isZeroKm))
          && (!filter?.brand || item?.brand == filter?.brand)
          && (!filter?.model || item?.model == filter?.model)
          && (!filter?.year?.from || item?.manufactureYear >= filter?.year?.from)
          && (!filter?.year?.to || item?.modelYear <= filter?.year?.to)
          && (!filter?.price?.from || item?.price >= filter?.price?.from)
          && (!filter?.price?.to || item?.price <= filter?.price?.to)
          && (!filter?.mileage || item?.mileage <= filter?.mileage)
          && (!filter?.transmission?.length || filter?.transmission.includes(item?.transmission))
          && (!filter?.fuel?.length || filter?.fuel?.includes(item?.fuel))
          && (!filter?.optionals?.length ||
            (Array.isArray(item?.optionals) &&
              filter?.optionals?.every(opt => item?.optionals.includes(opt))))
          && (!filter?.color?.length || filter?.color?.includes(item?.color))
          && (!filter?.armored || (filter?.armored && item?.armored))
          && (!filter?.featured || (filter?.featured && item?.changed?.featured))
          && (!filter?.ads?.length || (filter?.ads?.length && filter?.ads?.find((id) => id == item?.id))));
      });
    }

    if (search) {
      search?.split(' ')?.map((term) => {
        list = list?.filter((item) =>
          (item?.brand?.toLowerCase().includes(term?.trim().toLowerCase())) ||
          (item?.model?.toLowerCase().includes(term?.trim().toLowerCase())) ||
          (item?.color?.toLowerCase().includes(term?.trim().toLowerCase())) ||
          (item?.transmission?.toLowerCase().includes(term?.trim().toLowerCase())) ||
          (item?.fuel?.toLowerCase().includes(term?.trim().toLowerCase())) ||
          (item?.optionals?.some(optional => optional.toLowerCase().includes(term?.trim().toLowerCase())))
        )
      })
    }

    if (order?.featured) {
      list?.sort((a, b) => {
        const aHasDestaque = !!a?.changed?.featured;
        const bHasDestaque = !!b?.changed?.featured;
        return bHasDestaque - aHasDestaque;
      });
    } else if (order?.lowestPrice) {
      list?.sort((a, b) => { return a.price - b.price; });
    } else if (order?.biggestPrice) {
      list?.sort((a, b) => { return b.price - a.price; });
    } else if (order?.lowestKm) {
      list?.sort((a, b) => { return a.mileage - b.mileage; });
    }

    const skip = page * itemsPerPage;
    const take = (page + 1) * itemsPerPage;

    const dataPaginate = list?.slice(skip, take);
    const currentPage = page;
    const total = dataPaginate?.length ? data?.length : 0;
    const totalPages = Math.ceil(total / itemsPerPage) || 0;

    return { data: dataPaginate, currentPage, total, totalPages }
  }

  if (config?.status == 'active') {
    try {
      if (store?.api?.endpoint) {
        const query = { store: store?._id };

        let data = CryptoJS.TripleDES.encrypt(JSON.stringify(query), Constants.SECRET_KEY).toString();
        data = encodeURIComponent(data);

        const request = {
          method: 'get',
          url: `${store?.api?.endpoint}/app/ads/updatedAt?data=${data}`,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const encryptedResponse = await axios.request(request);
        if (encryptedResponse?.data) {
          let decryptedData = CryptoJS.TripleDES.decrypt(encryptedResponse.data, Constants.SECRET_KEY).toString(CryptoJS.enc.Utf8);
          if (decryptedData) {
            const parseData = JSON.parse(decryptedData);
            if (parseData?.status == 200) {
              refresh = new Date(parseData?.updatedAt) > new Date(updatedAt);
              refresh && Session.setAdsUpdatedAt(parseData?.updatedAt, store?._id);
            }
          }
        }
      }

      if (refresh) {
        const query = { account: config?._id, store: store?._id };
        let data = CryptoJS.TripleDES.encrypt(JSON.stringify(query), Constants.SECRET_KEY).toString();
        data = encodeURIComponent(data);

        const request = {
          method: 'get',
          url: `${store?.api?.endpoint}/${store?.api?.ads}?data=${data}`,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const response = await axios.request(request)
        if (response?.data?.status == 200) {
          const favoriteExists = ads?.filter((item) => item?.favorite == true);
          const data = response?.data?.ads ?? [];

          data?.map((ad) => {
            const exists = favoriteExists?.findIndex((item) => (item?.id == ad?.id && item?.store == ad?.store));
            if (exists != null && exists != -1) { ad.favorite = true; }

            const price = parseFloat(ad?.changed?.price);
            if (price) { ad.price = price; }
          })

          Session.setAds(data, store?._id);

          const paginatedData = paginate(data)
          const statisticIds = paginatedData.data?.map(ad => ad?.id)

          if (statisticIds?.length >= 1) STATISTICS(store, null, 'print', null, statisticIds)
          return paginatedData
        } else {
          const paginatedData = paginate(ads)
          const statisticIds = paginatedData.data?.map(ad => ad?.id)
          if (statisticIds?.length >= 1) STATISTICS(store, null, 'print', null, statisticIds)
          return paginatedData
        }
      } else {
        const paginatedData = paginate(ads)
        const statisticIds = paginatedData.data?.map(ad => ad?.id)
        if (statisticIds?.length >= 1) STATISTICS(store, null, 'print', null, statisticIds)
        return paginatedData
      }
    } catch {
      if (!ads) {
        let mirrorAds = [];
        ads = [];

        let defaultStore;
        const joinStores = [];

        const stores = config?.stores?.filter(item => (item?.hidden != true && item?.virtual == false && item?.services?.length > 0));
        defaultStore = stores?.find((item) => item?._id == config?.defaultStore);
        defaultStore && joinStores.push(defaultStore);

        let othersStores = config?.stores?.filter((store) => (store?.hidden != true && store?.virtual == false && store?.services?.length > 0 && store?._id != config?.defaultStore));
        othersStores?.sort((a, b) => a?.description?.localeCompare(b?.description));
        othersStores && joinStores.push(...othersStores);

        if (config?.unifiedAds) {
          let defaultStore = joinStores?.find((item) => item?._id == config?.unifiedAdsStore);

          if ((defaultStore?._id == store?._id) || !config?.unifiedAdsStore) { mirrorAds = await getMirrorAds(null); }
          else { mirrorAds = await getMirrorAds(store?._id); }
        }
        else { mirrorAds = await getMirrorAds(store?._id); }

        mirrorAds && ads.push(...mirrorAds);
        Session.setAds(ads, store?._id);
      }

      const paginatedData = paginate(ads)
      const statisticIds = paginatedData.data?.map(ad => ad?.id)
      if (statisticIds?.length >= 1) STATISTICS(store, null, 'print', null, statisticIds)
      return paginatedData
    }
  } else {
    return []
  }
}

// export const GETONE = (store, id = null) => {
//   const config = Session.getConfig();
//   const getStore = Session.getStore();
//   const ads = Session.getAds(getStore?._id);

//   const storeId = store ?? getStore?._id;
  
//   if (config?.status == 'active') {
//     try {
//       let list = [...ads];
//       const ad = list?.find((ad) => { return ad?.id == id && ad?.store == storeId && !ad?.changed?.hidden; });
//       const price = parseFloat(ad?.changed?.price);
//       if (price) { ad.price = price; }

//       return ad ?? null;
//     } catch {
//       return null
//     }
//   } else {
//     return []
//   }
// }

export const GETONE = (store, id = null) => {
  const config = Session.getConfig()
  const getStore = Session.getStore()
  const ads = Session.getAds(getStore?._id)

  const storeId = store ?? getStore?._id

  if (config?.status == 'active') {
    try {
      let list = [...ads]

      let ad
      if (storeId == config?.unifiedAdsStore) {
        ad = list?.find((ad) => {
          return ad?.id == id && !ad?.changed?.hidden
        })
      } else {
        ad = list?.find((ad) => {
          return ad?.id == id && ad?.store == storeId && !ad?.changed?.hidden
        })
      }

      const price = parseFloat(ad?.changed?.price)
      if (price) {
        ad.price = price
      }

      return ad ?? null
    } catch {
      return null
    }
  } else {
    return []
  }
}

export const STORES = async (page = 0, itemsPerPage = 10, search = null) => {
  const config = Session.getConfig();

  const paginate = (data) => {
    let list = [...data];

    if (search) {
      list = list?.filter(
        (store) => (
          store?.company?.toLowerCase().includes(search.trim().toLowerCase())
          || store?.place?.address?.toLowerCase().includes(search.trim().toLowerCase())
        ))

    }

    list?.sort((a, b) => { return a?.company - b?.company; });
    list?.sort((a, b) => { return a?.distance - b?.distance; });

    const skip = page * itemsPerPage;
    const take = (page + 1) * itemsPerPage;

    const dataPaginate = list?.slice(skip, take);
    const currentPage = page;
    const total = data?.length || 0;
    const totalPages = Math.ceil(total / itemsPerPage) || 0;

    return { data: dataPaginate, currentPage, total, totalPages }
  }

  return paginate(config?.stores);
}

export const STATISTICS = async (store, id, type, add, ids) => {
  try {
    const query = { storeId: store?._id, id, type, add, ids }
    const data = await helper.Encrypt(query)
    const encryptedData = await axios.patch(`${store?.api?.endpoint}/${store?.api?.statistics}`, { data });
    const response = await helper.Decrypt(encryptedData)
    return response;
  } catch {
    return null;
  }
}

export const LEAD = async (type, store, data) => {
  const query = { type, storeId: store?._id, data }
  const encryptQuery = await helper.Encrypt(query)
  const encryptedData = await axios.post(`${store?.api?.endpoint}/${store?.api?.leads}`, { data: encryptQuery });
  const response = await helper.Decrypt(encryptedData)
  return response
}

export default GET;