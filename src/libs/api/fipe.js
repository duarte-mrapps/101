import axios from "axios";
import Helper from '../helper'

const API_FIPE = {
  get: async (store, type, brand, model, modelYear) => {
    const query = { type, brand, model, modelYear }
    const data = await Helper.Encrypt(query)
    const encryptedData = await axios.get(`${store?.api?.endpoint}/app/fipe`, { params: { data } })
    const response = await Helper.Decrypt(encryptedData)
    return response
  }
}

export default API_FIPE;