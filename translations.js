/**
 * Calendar Component Translations
 * This file contains translations for the calendar UI in multiple languages
 * 
 * @version 1.0.3
 * @license MIT
 */

(function(global) {

// Define translations object
const CALENDULA_TRANSLATIONS = {
  // English
  'en': {
    monthNames: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    monthAbbreviations: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    weekdayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    timeLabels: {
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
      tens: 'Tens',
      units: 'Minutes'
    }
  },
  
  // German
  'de': {
    monthNames: [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ],
    monthAbbreviations: [
      'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
      'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
    ],
    weekdayNames: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    timeLabels: {
      hours: 'Stunden',
      minutes: 'Minuten',
      seconds: 'Sekunden',
      tens: 'Zehner',
      units: 'Minuten'
    }
  },
  
  // Ukrainian
  'uk': {
    monthNames: [
      'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ],
    monthAbbreviations: [
      'Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер',
      'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'
    ],
    weekdayNames: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    timeLabels: {
      hours: 'Години',
      minutes: 'Хвилини',
      seconds: 'Секунди',
      tens: 'Десятки',
      units: 'Хвилини'
    }
  },
  
  // Russian
  'ru': {
    monthNames: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    monthAbbreviations: [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ],
    weekdayNames: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    timeLabels: {
      hours: 'Часы',
      minutes: 'Минуты',
      seconds: 'Секунды',
      tens: 'Десятки',
      units: 'Минуты'
    }
  },
  
  // French
  'fr': {
    monthNames: [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ],
    monthAbbreviations: [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ],
    weekdayNames: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    timeLabels: {
      hours: 'Heures',
      minutes: 'Minutes',
      seconds: 'Secondes',
      tens: 'Dizaines',
      units: 'Minutes'
    }
  },
  
  // Spanish
  'es': {
    monthNames: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthAbbreviations: [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ],
    weekdayNames: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    timeLabels: {
      hours: 'Horas',
      minutes: 'Minutos',
      seconds: 'Segundos',
      tens: 'Decenas',
      units: 'Minutos'
    }
  },
  
  // Serbian
  'sr': {
    monthNames: [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
      'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ],
    monthAbbreviations: [
      'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
      'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'
    ],
    weekdayNames: ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'],
    timeLabels: {
      hours: 'Sati',
      minutes: 'Minuti',
      seconds: 'Sekunde',
      tens: 'Desetice',
      units: 'Minute'
    }
  },
  
  // Turkish
  'tr': {
    monthNames: [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ],
    monthAbbreviations: [
      'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
      'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
    ],
    weekdayNames: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    timeLabels: {
      hours: 'Saat',
      minutes: 'Dakika',
      seconds: 'Saniye',
      tens: 'Onlar',
      units: 'Dakika'
    }
  },
  
  // Arabic
  'ar': {
    monthNames: [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ],
    monthAbbreviations: [
      'ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون',
      'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'
    ],
    weekdayNames: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
    timeLabels: {
      hours: 'ساعات',
      minutes: 'دقائق',
      seconds: 'ثواني',
      tens: 'عشرات',
      units: 'دقائق'
    }
  },
  
  // Chinese
  'zh': {
    monthNames: [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ],
    monthAbbreviations: [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ],
    weekdayNames: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    timeLabels: {
      hours: '小时',
      minutes: '分钟',
      seconds: '秒',
      tens: '十位',
      units: '分钟'
    }
  },
  
  // Hindi
  'hi': {
    monthNames: [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ],
    monthAbbreviations: [
      'जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून',
      'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'
    ],
    weekdayNames: ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],
    timeLabels: {
      hours: 'घंटे',
      minutes: 'मिनट',
      seconds: 'सेकंड',
      tens: 'दहाई',
      units: 'मिनट'
    }
  },
  
  // Japanese
  'ja': {
    monthNames: [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ],
    monthAbbreviations: [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ],
    weekdayNames: ['月', '火', '水', '木', '金', '土', '日'],
    timeLabels: {
      hours: '時間',
      minutes: '分',
      seconds: '秒',
      tens: '十の位',
      units: '分'
    }
  },
  
  // Korean
  'ko': {
    monthNames: [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ],
    monthAbbreviations: [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ],
    weekdayNames: ['월', '화', '수', '목', '금', '토', '일'],
    timeLabels: {
      hours: '시간',
      minutes: '분',
      seconds: '초',
      tens: '십의 자리',
      units: '분'
    }
  },
  
  // Portuguese
  'pt': {
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthAbbreviations: [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ],
    weekdayNames: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    timeLabels: {
      hours: 'Horas',
      minutes: 'Minutos',
      seconds: 'Segundos',
      tens: 'Dezenas',
      units: 'Minutos'
    }
  },
  
  // Italian
  'it': {
    monthNames: [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ],
    monthAbbreviations: [
      'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
      'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
    ],
    weekdayNames: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    timeLabels: {
      hours: 'Ore',
      minutes: 'Minuti',
      seconds: 'Secondi',
      tens: 'Decine',
      units: 'Minuti'
    }
  },
  
  // Dutch
  'nl': {
    monthNames: [
      'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
      'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
    ],
    monthAbbreviations: [
      'Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun',
      'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
    ],
    weekdayNames: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
    timeLabels: {
      hours: 'Uren',
      minutes: 'Minuten',
      seconds: 'Seconden',
      tens: 'Tientallen',
      units: 'Minuten'
    }
  },
  
  // Polish
  'pl': {
    monthNames: [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ],
    monthAbbreviations: [
      'Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
      'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'
    ],
    weekdayNames: ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'],
    timeLabels: {
      hours: 'Godziny',
      minutes: 'Minuty',
      seconds: 'Sekundy',
      tens: 'Dziesiątki',
      units: 'Minuty'
    }
  },
  
  // Swedish
  'sv': {
    monthNames: [
      'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
      'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
    ],
    monthAbbreviations: [
      'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
      'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
    ],
    weekdayNames: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
    timeLabels: {
      hours: 'Timmar',
      minutes: 'Minuter',
      seconds: 'Sekunder',
      tens: 'Tiotal',
      units: 'Minuter'
    }
  }
};

// Make translations available globally
global.CALENDULA_TRANSLATIONS = CALENDULA_TRANSLATIONS;

// Export the translations for CommonJS/Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CALENDULA_TRANSLATIONS;
}

})(typeof window !== 'undefined' ? window : global);