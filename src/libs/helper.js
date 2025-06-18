import CryptoJS from "crypto-js";
import moment from "moment";

import { Constants } from './session';

const convertSingleCode = (colorCode) => {
  let hexCode = colorCode.toString(16);
  return (hexCode.length == 1) ? ('0' + hexCode) : hexCode;
}

class Helper {
  ToSign = (data) => {
    return CryptoJS.SHA512(`com.mrapps.appdaloja:sign-${data}`).toString();
  }

  Encrypt = async (data) => {
    return CryptoJS.TripleDES.encrypt(JSON.stringify(data), Constants.SECRET_KEY).toString();
  }

  EncryptEncode = async (data) => {
    let encryptedData = CryptoJS.TripleDES.encrypt(JSON.stringify(data), Constants.SECRET_KEY).toString();
    return encodeURIComponent(encryptedData);
  }

  Decrypt = async (encryptedResponse) => {
    let decryptedData = CryptoJS.TripleDES.decrypt(encryptedResponse.data, Constants.SECRET_KEY).toString(CryptoJS.enc.Utf8);
    let data = null;

    try { data = JSON.parse(decryptedData); }
    catch (err) { }

    return data;
  }

  rgbToHex = (rgb) => {
    if (!rgb) {
      return '#000';
    } else {
      rgb = rgb.toLowerCase();
      rgb = rgb.replace('rgb(', '').replace(')', '');
      rgb = rgb.split(',');
      rgb = '#' + convertSingleCode(parseInt(rgb[0])) + convertSingleCode(parseInt(rgb[1])) + convertSingleCode(parseInt(rgb[2]));
      return rgb;
    }
  }

  formatToAnalytics = (text) => {
    const replaceAcentsC = ['ç'];
    const replaceAcentsA = ['â', 'á', 'à', 'ä', 'ã'];
    const replaceAcentsE = ['ê', 'é', 'è', 'ë'];
    const replaceAcentsI = ['î', 'í', 'ì', 'ï'];
    const replaceAcentsO = ['ô', 'ó', 'ò', 'ö', 'õ'];
    const replaceAcentsU = ['û', 'ú', 'ù', 'ü'];
    let replacedText = text?.toLowerCase();

    replaceAcentsC.map((char) => { replacedText = replacedText?.replace(new RegExp(char, 'g'), 'c'); })
    replaceAcentsA.map((char) => { replacedText = replacedText?.replace(new RegExp(char, 'g'), 'a'); })
    replaceAcentsE.map((char) => { replacedText = replacedText?.replace(new RegExp(char, 'g'), 'e'); })
    replaceAcentsI.map((char) => { replacedText = replacedText?.replace(new RegExp(char, 'g'), 'i'); })
    replaceAcentsO.map((char) => { replacedText = replacedText?.replace(new RegExp(char, 'g'), 'o'); })
    replaceAcentsU.map((char) => { replacedText = replacedText?.replace(new RegExp(char, 'g'), 'u'); })

    replacedText = replacedText?.replace(/([^a-z0-9]+)/gi, ' ');
    replacedText = replacedText?.replace(/\ /g, '_')

    return replacedText;
  }

  getIconBySocialnetwork = (socialnetwork) => {
    let icon = { name: 'link', type: 'feather', size: 17, color: '#fff', backgroundColor: '#ffcc33' };

    if (socialnetwork.toLowerCase() == 'instagram') {
      icon = { name: 'instagram', type: 'feather', size: 17, color: '#fff', backgroundColor: '#E3208D' };
    } else if (socialnetwork.toLowerCase() == 'twitter') {
      icon = { name: 'twitter', type: 'font-awesome', size: 17, color: '#fff', backgroundColor: '#1DA0F2' };
    } else if (socialnetwork.toLowerCase() == 'facebook') {
      icon = { name: 'facebook', type: 'font-awesome', size: 17, color: '#fff', backgroundColor: '#4664A5' };
    } else if (socialnetwork.toLowerCase() == 'skype') {
      icon = { name: 'skype', type: 'font-awesome', size: 19, color: '#fff', backgroundColor: '#01A5E5' };
    } else if (socialnetwork.toLowerCase() == 'snapchat') {
      icon = { name: 'snapchat-ghost', type: 'font-awesome', size: 19, color: '#fff', backgroundColor: '#F7F404' };
    } else if (socialnetwork.toLowerCase() == 'pinterest') {
      icon = { name: 'pinterest', type: 'font-awesome', size: 19, color: '#fff', backgroundColor: '#C60000' };
    } else if (socialnetwork.toLowerCase() == 'linkedin') {
      icon = { name: 'linkedin', type: 'font-awesome', size: 17, color: '#fff', backgroundColor: '#00669A' };
    } else if (socialnetwork.toLowerCase() == 'tiktok') {
      icon = { name: 'tiktok', type: 'font-awesome5pro', size: 16, color: '#fff', backgroundColor: '#000' };
    } else if (socialnetwork.toLowerCase() == 'myspace') {
      icon = { name: 'social-myspace', type: 'foundation', size: 16, color: '#fff', backgroundColor: '#0238C2' };
    } else if (socialnetwork.toLowerCase() == 'youtube') {
      icon = { name: 'youtube', type: 'entypo', size: 18, color: '#fff', backgroundColor: '#FE0001' };
    } else if (socialnetwork.toLowerCase() == 'tumblr') {
      icon = { name: 'tumblr', type: 'font-awesome', size: 16, color: '#fff', backgroundColor: '#2F4054' };
    } else if (socialnetwork.toLowerCase() == 'foursquare') {
      icon = { name: 'foursquare', type: 'font-awesome', size: 16, color: '#fff', backgroundColor: '#ED4472' };
    } else if (socialnetwork.toLowerCase() == 'flickr') {
      icon = { name: 'flickr', type: 'fontisto', size: 16, color: '#fff', backgroundColor: '#0054CA' };
    } else if (socialnetwork.toLowerCase() == 'twitch') {
      icon = { name: 'twitch', type: 'font-awesome', size: 16, color: '#fff', backgroundColor: '#8A43F2' };
    } else if (socialnetwork.toLowerCase() == 'qq') {
      icon = { name: 'qq', type: 'font-awesome', size: 15, color: '#fff', backgroundColor: '#000' };
    } else if (socialnetwork.toLowerCase() == 'blogger') {
      icon = { name: 'blogger', type: 'zocial', size: 15, color: '#fff', backgroundColor: '#E97601' };
    } else if (socialnetwork.toLowerCase() == 'vimeo') {
      icon = { name: 'vimeo', type: 'zocial', size: 15, color: '#fff', backgroundColor: '#00ADF0' };
    } else if (socialnetwork.toLowerCase() == 'behance') {
      icon = { name: 'behance', type: 'font-awesome', size: 14, color: '#fff', backgroundColor: '#0257FF' };
    }

    return icon;
  }

  getFirstLetterCapitalized = (text) => {
    text = text?.toLowerCase();
    text = text?.replace(/./, char => char.toUpperCase());
    return text;
  }

  convertHoursToDates = (date, hours) => {
    const dateObjects = hours.map(hour => {
      if (hour) {
        const [hourPart, minutePart] = hour.split(':');
        const dt = new Date(date);
        dt.setHours(parseInt(hourPart, 10));
        dt.setMinutes(parseInt(minutePart, 10));
        return dt;
      }
      return null;
    });

    const minDate = dateObjects[0] ? new Date(dateObjects[0].getTime() + 30 * 60000) : null; // Adiciona 30 minutos
    const maxDate = dateObjects[1] ? new Date(dateObjects[1].getTime() - 30 * 60000) : null; // Subtrai 30 minutos

    return { min: minDate, max: maxDate };
  }

  getColorByDay = (day, colors) => {
    const getDay = new Date().getDay();
    let color = colors?.text;

    if (getDay == day) { color = colors?.primary }
    return color;
  }

  getTodayHours = (openingHours, date = new Date()) => {
    const dayMap = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ];
  
    const currentDay = dayMap[moment(date).day()];
    const hours = openingHours?.[currentDay] ? [
      openingHours[currentDay]?.from, 
      openingHours[currentDay]?.to
    ] : [null, null];
  
    return this.convertHoursToDates(date, hours);
  }

  getAboutUsTodayHours = (openingHours, date = null) => {
    const getDay = new Date().getDay();
    let hours = 'Hoje, ';

    if (getDay == 0) { hours += (openingHours?.sunday?.from && openingHours?.sunday?.from) ? `das ${openingHours?.sunday?.from} às ${openingHours?.sunday?.to}` : 'fechado' }
    else if (getDay == 1) { hours += (openingHours?.monday?.from && openingHours?.monday?.from) ? `das ${openingHours?.monday?.from} às ${openingHours?.monday?.to}` : 'fechado' }
    else if (getDay == 2) { hours += (openingHours?.tuesday?.from && openingHours?.tuesday?.from) ? `das ${openingHours?.tuesday?.from} às ${openingHours?.tuesday?.to}` : 'fechado' }
    else if (getDay == 3) { hours += (openingHours?.wednesday?.from && openingHours?.wednesday?.from) ? `das ${openingHours?.wednesday?.from} às ${openingHours?.wednesday?.to}` : 'fechado' }
    else if (getDay == 4) { hours += (openingHours?.thursday?.from && openingHours?.thursday?.from) ? `das ${openingHours?.thursday?.from} às ${openingHours?.thursday?.to}` : 'fechado' }
    else if (getDay == 5) { hours += (openingHours?.friday?.from && openingHours?.friday?.from) ? `das ${openingHours?.friday?.from} às ${openingHours?.friday?.to}` : 'fechado' }
    else if (getDay == 6) { hours += (openingHours?.saturday?.from && openingHours?.saturday?.from) ? `das ${openingHours?.saturday?.from} às ${openingHours?.saturday?.to}` : 'fechado' }

    return hours;
  }

  cpfMask = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  replaceMessage = (message, replace, data) => {
    let msg = message;

    replace?.map((item) => {
      const key = Object.keys(item)?.[0];
      const keyValue = Object.values(item)?.[0];
      const value = data[keyValue] ?? '';

      const regex = new RegExp('{' + key + '}', 'gi');
      msg = msg?.replace(regex, value);
    })

    return msg;
  }

  getStore = (config, store) => {
    const configStore = config?.stores?.find((s) => s._id == store);
    return configStore ?? { _id: null };
  }

  getStoreName = (config, store) => {
    let company = '';
    let searchStore = config?.stores?.find((item) => item?._id == store);

    return searchStore?.company ?? company;
  }

  getStoreDistance = (config, store) => {
    const distance = config?.stores?.find((s) => s._id == store)?.distance;
    return distance ? `${distance}km` : '';
  }

  getServices = (store, serviceId = null, colors) => {
    const exits = store?.services?.find((item) => (item?.service == (serviceId ? serviceId : store?.mainService)));
    const consignmentType = store?.services?.find((item) => item?.service == '65dcb7c58eca108d87c91dbd')?.options?.[0]?.title ?? '';

    const services = [
      {
        _id: 'message',
        title: 'Mensagem',
        description: 'Envie-nos uma mensagem que retornaremos o mais breve possível.',
        icon: { name: 'email', type: 'material', color: '#fff', size: 23, backgroundColor: colors?.primary },
        button: 'Enviar',
        params: {
          name: true,
          email: true,
          phone: true,
          message: true,
          ad: true
        },
        logEvent: 'click_on_send_message',
        route: 'Service'
      },
      {
        _id: '65dcb7898eca108d87c91dbc',
        image: require('../assets/img/financing.png'),
        title: 'Financiamento',
        description: 'Se você esta buscando um financiamento para o seu novo veículo, conte com a gente.',
        icon: { name: 'attach-money', type: 'material', color: '#fff', size: 23, backgroundColor: colors?.primary },
        button: 'Simular',
        service: exits,
        params: {
          name: true,
          birthdate: true,
          taxid: true,
          ad: true,
          message: exits?.lead?.type == 'api',
          email: exits?.lead?.type == 'email' || exits?.lead?.type == 'api',
          phone: exits?.lead?.type == 'email' || exits?.lead?.type == 'api'
        },
        logEvent: 'click_on_simulate_for_financing',
        route: 'Service'
      },
      {
        _id: '65da42048eca108d87c91da6',
        image: require('../assets/img/videoCall.png'),
        title: 'Agendar videochamada',
        description: 'Caso você queira ver algum veículo que tenha se interessado, basta agendar uma videochamada.',
        icon: { name: 'video-camera', type: 'font-awesome', color: '#fff', size: 17, backgroundColor: colors?.primary },
        button: 'Agendar',
        service: exits,
        params: {
          name: true,
          datetime: true,
          ad: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email'
        },
        logEvent: 'click_on_schedule_for_video_call',
        route: 'Service'
      },
      {
        _id: '65dcb7548eca108d87c91dbb',
        image: require('../assets/img/valuation.png'),
        title: `Avaliação`,
        description: 'Uma das melhores avaliações do mercado, venha conferir.',
        icon: { name: 'sell', type: 'material', color: '#fff', size: 19, backgroundColor: colors?.primary },
        button: 'Avaliar',
        service: exits,
        params: {
          name: true,
          vehicle: true,
          mileage: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email'
        },
        logEvent: 'click_on_valuate_for_valuation',
        route: 'Service'
      },
      {
        _id: '65dcb7238eca108d87c91dba',
        image: require('../assets/img/insurance.png'),
        title: 'Seguros',
        description: 'Contamos com uma área exclusiva para atender nossos clientes na escolha e negociação de seguros.',
        icon: { name: 'car-crash', type: 'font-awesome5', color: '#fff', size: 16, backgroundColor: colors?.primary },
        button: 'Cotar',
        service: exits,
        params: {
          name: true,
          taxid: true,
          ad: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email'
        },
        logEvent: 'click_on_quote_for_insurance',
        route: 'Service'
      },
      {
        _id: '65dcb6528eca108d87c91db9',
        image: require('../assets/img/forwardingAgent.png'),
        title: 'Despachante',
        description: 'Não se preocupe com a burocracia, cuidamos de tudo para você.',
        icon: { name: 'newspaper', type: 'ionicons', color: '#fff', size: 18, backgroundColor: colors?.primary },
        button: 'Cotar',
        service: exits,
        params: {
          name: true,
          taxid: true,
          ad: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email'
        },
        logEvent: 'click_on_quote_for_forwardingAgent',
        route: 'Service'
      },
      {
        _id: '65dcb5e78eca108d87c91db8',
        image: require('../assets/img/testdrive.png'),
        title: 'Test-Drive',
        description: 'Venha fazer um test drive sem compromisso no veículo que você deseja comprar!',
        icon: { name: 'calendar-clock', type: 'material-community', color: '#fff', size: 21, backgroundColor: colors?.primary },
        button: 'Agendar',
        params: {
          name: true,
          driveslicense: true,
          ad: true,
          datetime: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email'
        },
        service: exits,
        logEvent: 'click_on_schedule_for_testdrive',
        route: 'Service'
      },
      {
        _id: '65dcb7fe8eca108d87c91dbe',
        image: require('../assets/img/fipeTable.png'),
        title: 'Tabela FIPE',
        description: 'Fundação Instituto de Pesquisas Econômicas.',
        icon: { name: 'graph', type: 'octicons', color: '#fff', size: 16, backgroundColor: colors?.primary },
        button: 'Consultar',
        service: exits,
        params: {
          vehicle: true,
        },
        logEvent: null,
        route: 'FipeTable'
      },
      {
        _id: '65dceeac8eca108d87c91dc6',
        image: require('../assets/img/scheduleServices.png'),
        title: 'Serviços',
        description: 'Oferecemos serviços confiáveis para manter seu veículo sempre em ótimo estado.',
        icon: { name: 'cogs', type: 'font-awesome', color: '#fff', size: 17, backgroundColor: colors?.primary },
        button: 'Agendar',
        service: exits,
        params: {
          name: true,
          taxid: true,
          vehicle: true,
          mileage: true,
          services: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email'
        },
        logEvent: 'click_on_schedule_for_services',
        route: 'Service'
      },
      {
        _id: '65dcef098eca108d87c91dc7',
        image: require('../assets/img/scheduleReview.png'),
        title: 'Revisões',
        description: 'Agende sua revisão conosco para garantir a segurança do seu veículo.',
        icon: { name: 'tachometer', type: 'font-awesome', color: '#fff', size: 18, backgroundColor: colors?.primary },
        button: 'Agendar',
        service: exits,
        params: {
          name: true,
          taxid: true,
          vehicle: true,
          mileage: true,
          services: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email'
        },
        logEvent: 'click_on_schedule_for_review',
        route: 'Service'
      },
      {
        _id: '65dcb7c58eca108d87c91dbd',
        image: require('../assets/img/consignment.png'),
        title: `Consignação (${consignmentType})`,
        description: 'Garantimos o melhor negócio e cuidamos de todo o processo burocrático.',
        icon: { name: 'handshake', type: 'font-awesome5', color: '#fff', size: 15, backgroundColor: colors?.primary },
        button: 'Avaliar',
        service: exits,
        params: {
          name: true,
          vehicle: true,
          mileage: true,
          value: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email'
        },
        logEvent: 'click_on_assess_for_consignment',
        route: 'Service'
      },
      {
        _id: '65dcef468eca108d87c91dc8',
        image: require('../assets/img/consortium.png'),
        title: 'Consorcio',
        description: 'Solicite sua cotação de consórcio conosco e realize o sonho do seu veículo novo.',
        icon: { name: 'key-chain-variant', type: 'material-community', color: '#fff', size: 21, backgroundColor: colors?.primary },
        button: 'Solicitar',
        service: exits,
        params: {
          name: true,
          birthdate: true,
          taxid: true,
          value: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email'
        },
        logEvent: 'click_on_request_for_consortium',
        route: 'Service'
      },
      {
        _id: '65dcb8548eca108d87c91dbf',
        image: require('../assets/img/directSales.png'),
        title: 'Vendas Diretas',
        description: 'Diversas opções para atender as suas necessidades.',
        icon: { name: 'percent', type: 'feather', color: '#fff', size: 18, backgroundColor: colors?.primary },
        button: 'Solicitar',
        service: exits,
        params: {
          name: true,
          taxid: true,
          segment: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email'
        },
        logEvent: 'click_on_request_for_directsales',
        route: 'Service'
      },
      {
        _id: '6628fd535bda2ae51f6fc5ff',
        image: require('../assets/img/partsAccessories.png'),
        title: 'Peças e Acessórios',
        description: 'Encontre o que precisa para seu veículo com praticidade e qualidade.',
        icon: { name: 'gears', type: 'font-awesome', color: '#fff', size: 17, backgroundColor: colors?.primary },
        button: 'Cotar',
        service: exits,
        params: {
          name: true,
          taxid: true,
          vehicle: true,
          email: exits?.lead?.type == 'email',
          phone: exits?.lead?.type == 'email',
          message: true,
          segment: true,
        },
        logEvent: 'click_on_request_for_parts_accessories',
        route: 'Service'
      }
    ];

    const serivce = services.find((item) => item?._id == (serviceId ? serviceId : store?.mainService));
    return serivce;
  }
}

export default new Helper();