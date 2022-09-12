import { IBaseItem } from 'communication';

export interface ITimezone extends IBaseItem {
  name: string;
  offset: number;
}
export const TIMEZONES = [
  {
    id: 1,
    value: "Dateline Standard Time",
    abbr: "DST",
    offset: -12,
    isdst: false,
    text: "International Date Line West",
    utc: [
      'Pacific/Wallis',
      "Etc/GMT+12"
    ]
  },
  {
    id: 2,
    value: "UTC-11",
    abbr: "U",
    offset: -11,
    isdst: false,
    text: "Coordinated Universal Time-11",
    utc: [
      "Pacific/Midway",
      "Etc/GMT+11",
      "Pacific/Niue",
      "Pacific/Pago_Pago"
    ]
  },
  {
    id: 3,
    value: "Hawaiian Standard Time",
    abbr: "HST",
    offset: -10,
    isdst: false,
    text: "Hawaii",
    utc: [
      "Pacific/Honolulu",
      "Etc/GMT+10",
      "Pacific/Johnston",
      "Pacific/Rarotonga",
      "Pacific/Tahiti",
    ]
  },
  {
    id: 4,
    value: "Alaskan Standard Time",
    abbr: "AKDT",
    offset: -9,
    isdst: true,
    text: "Alaska",
    utc: [
      "America/Anchorage",
      "America/Juneau",
      "America/Nome",
      "America/Sitka",
      "America/Yakutat"
    ]
  },
  {
    id: 5,
    value: "Pacific Standard Time (Mexico)",
    abbr: "PDT",
    offset: -7,
    isdst: true,
    text: "Baja California",
    utc: [
      "America/Santa_Isabel"
    ]
  },
  {
    id: 6,
    value: "Pacific Daylight Time",
    abbr: "PDT",
    offset: -7,
    isdst: true,
    text: "Pacific Time (US & Canada)",
    utc: [
      "America/Dawson",
      "America/Los_Angeles",
      "America/Tijuana",
      "America/Vancouver",
      "America/Whitehorse"
    ]
  },
  {
    id: 7,
    value: "Pacific Standard Time",
    abbr: "PST",
    offset: -8,
    isdst: false,
    text: "Pacific Time (US & Canada)",
    utc: [
      "America/Dawson",
      "America/Los_Angeles",
      "America/Tijuana",
      "America/Vancouver",
      "America/Whitehorse",
      "PST8PDT"
    ]
  },
  {
    id: 8,
    value: "US Mountain Standard Time",
    abbr: "UMST",
    offset: -7,
    isdst: false,
    text: "Arizona",
    utc: [
      "America/Creston",
      "America/Dawson_Creek",
      "America/Hermosillo",
      "America/Phoenix",
      "Etc/GMT+7"
    ]
  }, {
    id: 9,
    value: "Mountain Standard Time (Mexico)",
    abbr: "MDT",
    offset: -7,
    isdst: true,
    text: "Chihuahua, La Paz, Mazatlan",
    utc: [
      "America/Chihuahua",
      "America/Mazatlan"
    ]
  },
  /*  {
      id: 10,
      value: "Mountain Standard Time",
      abbr: "MDT",
      offset: -6,
      isdst: true,
      text: "Mountain Time (US & Canada)",
      utc: [
        "America/Boise",
        "America/Cambridge_Bay",
        "America/Denver",
        "America/Edmonton",
        "America/Inuvik",
        "America/Ojinaga",
        "America/Yellowknife",
        "MST7MDT"
      ]
    },*/
  {
    id: 13,
    value: "Central Standard Time (Mexico)",
    abbr: "CDT",
    offset: -6,
    isdst: true,
    text: "Guadalajara, Mexico City, Monterrey",
    utc: [
      "America/Bahia_Banderas",
      "America/Cancun",
      "America/Merida",
      "America/Mexico_City",
      "America/Monterrey"
    ]
  },
  {
    id: 11,
    value: "Central America Standard Time",
    abbr: "CAST",
    offset: -6,
    isdst: false,
    text: "Central America",
    utc: [
      "America/Belize",
      "America/Costa_Rica",
      "America/El_Salvador",
      "America/Guatemala",
      "America/Managua",
      "America/Tegucigalpa",
      "Etc/GMT+6",
      "Pacific/Galapagos"
    ]
  },
  {
    id: 12,
    value: "Central Standard Time",
    abbr: "CDT",
    offset: -6,
    isdst: true,
    text: "Central Time (US & Canada)",
    utc: [
      "America/Chicago",
      "America/Indiana/Knox",
      "America/Indiana/Tell_City",
      "America/Matamoros",
      "America/Menominee",
      "America/North_Dakota/Beulah",
      "America/North_Dakota/Center",
      "America/North_Dakota/New_Salem",
      "America/Rainy_River",
      "America/Rankin_Inlet",
      "America/Resolute",
      "America/Winnipeg",
      "CST6CDT"
    ]
  },

  {
    id: 14,
    value: "Canada Central Standard Time",
    abbr: "CCST",
    offset: -6,
    isdst: false,
    text: "Saskatchewan",
    utc: [
      "America/Regina",
      "America/Swift_Current"
    ]
  },
  {
    id: 15,
    value: "SA Pacific Standard Time",
    abbr: "SPST",
    offset: -5,
    isdst: false,
    text: "Bogota, Lima, Quito",
    utc: [
      "America/Bogota",
      "America/Cayman",
      "America/Coral_Harbour",
      "America/Eirunepe",
      "America/Guayaquil",
      "America/Jamaica",
      "America/Lima",
      "America/Panama",
      "America/Rio_Branco",
      "Etc/GMT+5"
    ]
  },
  {
    id: 16,
    value: "Eastern Standard Time",
    abbr: "EDT",
    offset: -5,
    isdst: true,
    text: "Eastern Time (US & Canada)",
    utc: [
      "America/New_York",
      "America/Detroit",
      "America/Havana",
      "America/Indiana/Petersburg",
      "America/Indiana/Vincennes",
      "America/Indiana/Winamac",
      "America/Iqaluit",
      "America/Kentucky/Monticello",
      "America/Louisville",
      "America/Montreal",
      "America/Nassau",
      "America/Nipigon",
      "America/Pangnirtung",
      "America/Port-au-Prince",
      "America/Thunder_Bay",
      "America/Toronto",
      "EST5EDT"
    ]
  },
  {
    id: 108,
    value: "US Eastern Standard Time",
    abbr: "UEDT",
    offset: -5,
    isdst: true,
    text: "Indiana (East)",
    utc: [
      "America/Indiana/Marengo",
      "America/Indiana/Vevay",
      "America/Indianapolis"
    ]
  },
  {
    id: 18,
    value: "Venezuela Standard Time",
    abbr: "VST",
    offset: -4,
    isdst: false,
    text: "Caracas",
    utc: [
      "America/Caracas"
    ]
  },


  {
    id: 19,
    value: "Paraguay Standard Time",
    abbr: "PYT",
    offset: -4,
    isdst: false,
    text: "Asuncion",
    utc: [
      "America/Asuncion"
    ]
  },
  {
    id: 20,
    value: "Atlantic Standard Time",
    abbr: "ADT",
    offset: -4,
    isdst: true,
    text: "Atlantic Time (Canada)",
    utc: [
      "America/Glace_Bay",
      "America/Goose_Bay",
      "America/Halifax",
      "America/Moncton",
      "America/Thule",
      "Atlantic/Bermuda"
    ]
  },
  {
    id: 21,
    value: "Central Brazilian Standard Time",
    abbr: "CBST",
    offset: -4,
    isdst: false,
    text: "Cuiaba",
    utc: [
      "America/Campo_Grande",
      "America/Cuiaba"
    ]
  },
  {
    id: 22,
    value: "SA Western Standard Time",
    abbr: "SWST",
    offset: -4,
    isdst: false,
    text: "Georgetown, La Paz, Manaus, San Juan",
    utc: [
      "America/Anguilla",
      "America/Antigua",
      "America/Aruba",
      "America/Barbados",
      "America/Blanc-Sablon",
      "America/Boa_Vista",
      "America/Curacao",
      "America/Dominica",
      "America/Grand_Turk",
      "America/Grenada",
      "America/Guadeloupe",
      "America/Guyana",
      "America/Kralendijk",
      "America/La_Paz",
      "America/Lower_Princes",
      "America/Manaus",
      "America/Marigot",
      "America/Martinique",
      "America/Montserrat",
      "America/Port_of_Spain",
      "America/Porto_Velho",
      "America/Puerto_Rico",
      "America/Santo_Domingo",
      "America/St_Barthelemy",
      "America/St_Kitts",
      "America/St_Lucia",
      "America/St_Thomas",
      "America/St_Vincent",
      "America/Tortola",
      "Etc/GMT+4"
    ]
  },
  {
    id: 23,
    value: "Pacific SA Standard Time",
    abbr: "PSST",
    offset: -4,
    isdst: false,
    text: "Santiago",
    utc: [
      "America/Santiago",
      "Antarctica/Palmer"
    ]
  },
  {
    id: 24,
    value: "Newfoundland Standard Time",
    abbr: "NDT",
    offset: -3.5,
    isdst: true,
    text: "Newfoundland",
    utc: [
      "America/St_Johns"
    ]
  },
  {
    id: 25,
    value: "E. South America Standard Time",
    abbr: "ESAST",
    offset: -3,
    isdst: false,
    text: "Brasilia",
    utc: [
      "America/Sao_Paulo"
    ]
  },
  {
    id: 26,
    value: "Argentina Standard Time",
    abbr: "AST",
    offset: -3,
    isdst: false,
    text: "Citi of Buenos Aires",
    utc: [
      "America/Argentina/La_Rioja",
      "America/Argentina/Rio_Gallegos",
      "America/Argentina/Salta",
      "America/Argentina/San_Juan",
      "America/Argentina/San_Luis",
      "America/Argentina/Tucuman",
      "America/Argentina/Ushuaia",
      "America/Buenos_Aires",
      "America/Catamarca",
      "America/Cordoba",
      "America/Jujuy",
      "America/Mendoza"
    ]
  },
  {
    id: 17,
    value: "SA Eastern Standard Time",
    abbr: "SEST",
    offset: -3,
    isdst: false,
    text: "Cayenne, Fortaleza",
    utc: [
      "America/Araguaina",
      "America/Belem",
      "America/Cayenne",
      "America/Fortaleza",
      "America/Maceio",
      "America/Paramaribo",
      "America/Recife",
      "America/Santarem",
      "Antarctica/Rothera",
      "Atlantic/Stanley",
      "Etc/GMT+3"
    ]
  },
  {
    id: 28,
    value: "Greenland Standard Time",
    abbr: "GDT",
    offset: -3,
    isdst: true,
    text: "Greenland",
    utc: [
      "America/Godthab"
    ]
  },
  {
    id: 29,
    value: "Montevideo Standard Time",
    abbr: "MST",
    offset: -3,
    isdst: false,
    text: "Montevideo",
    utc: [
      "America/Montevideo"
    ]
  },
  {
    id: 30,
    value: "Bahia Standard Time",
    abbr: "BST",
    offset: -3,
    isdst: false,
    text: "Salvador",
    utc: [
      "America/Bahia"
    ]
  },
  {
    id: 31,
    value: "UTC-02",
    abbr: "U",
    offset: -2,
    isdst: false,
    text: "Coordinated Universal Time-02",
    utc: [
      "America/Noronha",
      "Atlantic/South_Georgia",
      "Etc/GMT+2"
    ]
  },
  {
    id: 32,
    value: "Mid-Atlantic Standard Time",
    abbr: "MDT",
    offset: -2,
    isdst: true,
    text: "Mid-Atlantic - Old",
    utc: []
  },
  {
    id: 33,
    value: "Azores Standard Time",
    abbr: "ADT",
    offset: -1,
    isdst: true,
    text: "Azores",
    utc: [
      "America/Scoresbysund",
      "Atlantic/Azores"
    ]
  },
  {
    id: 34,
    value: "Cape Verde Standard Time",
    abbr: "CVST",
    offset: -1,
    isdst: false,
    text: "Cape Verde Is.",
    utc: [
      "Atlantic/Cape_Verde",
      "Etc/GMT+1"
    ]
  },
  {
    id: 35,
    value: "Morocco Standard Time",
    abbr: "MDT",
    offset: 1,
    isdst: true,
    text: "Casablanca",
    utc: [
      "Africa/Casablanca",
      "Africa/El_Aaiun"
    ]
  },
  {
    id: 36,
    value: "UTC",
    abbr: "UTC",
    offset: 0,
    isdst: false,
    text: "Coordinated Universal Time",
    utc: [
      "America/Danmarkshavn",
      "Etc/GMT"
    ]
  },
  {
    id: 37,
    value: "GMT Standard Time",
    abbr: "GMT",
    offset: 0,
    isdst: false,
    text: "Edinburgh, London",
    utc: [
      "Europe/Isle_of_Man",
      "Europe/Guernsey",
      "Europe/Jersey",
      "Europe/London"
    ]
  },
  {
    id: 38,
    value: "British Summer Time",
    abbr: "BST",
    offset: 1,
    isdst: true,
    text: "Edinburgh, London",
    utc: [
      "Europe/London",
      "Europe/Isle_of_Man",
      "Europe/Guernsey",
      "Europe/Jersey",
    ]
  },
  {
    id: 39,
    value: "GMT Standard Time",
    abbr: "GDT",
    offset: 1,
    isdst: true,
    text: "Dublin, Lisbon",
    utc: [
      "Atlantic/Canary",
      "Atlantic/Faeroe",
      "Atlantic/Madeira",
      "Europe/Dublin",
      "Europe/Lisbon"
    ]
  },
  {
    id: 40,
    value: "Greenwich Standard Time",
    abbr: "GST",
    offset: 0,
    isdst: false,
    text: "Monrovia, Reykjavik",
    utc: [
      "Africa/Abidjan",
      "Africa/Accra",
      "Africa/Bamako",
      "Africa/Banjul",
      "Africa/Bissau",
      "Africa/Conakry",
      "Africa/Dakar",
      "Africa/Freetown",
      "Africa/Lome",
      "Africa/Monrovia",
      "Africa/Nouakchott",
      "Africa/Ouagadougou",
      "Africa/Sao_Tome",
      "Atlantic/Reykjavik",
      "Atlantic/St_Helena"
    ]
  },
  {
    id: 41,
    value: "W. Europe Standard Time",
    abbr: "WEDT",
    offset: 1,
    isdst: true,
    text: "Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
    utc: [
      "Europe/Amsterdam",
      "Arctic/Longyearbyen",
      "Europe/Andorra",
      "Europe/Berlin",
      "Europe/Busingen",
      "Europe/Gibraltar",
      "Europe/Luxembourg",
      "Europe/Malta",
      "Europe/Monaco",
      "Europe/Oslo",
      "Europe/Rome",
      "Europe/San_Marino",
      "Europe/Stockholm",
      "Europe/Vaduz",
      "Europe/Vatican",
      "Europe/Vienna",
      "Europe/Zurich"
    ]
  },
  {
    id: 42,
    value: "Central Europe Standard Time",
    abbr: "CEDT",
    offset: 1,
    isdst: true,
    text: "Belgrade, Bratislava, Budapest, Ljubljana, Prague",
    utc: [
      "Europe/Belgrade",
      "Europe/Bratislava",
      "Europe/Budapest",
      "Europe/Ljubljana",
      "Europe/Podgorica",
      "Europe/Prague",
      "Europe/Tirane"
    ]
  },
  {
    id: 43,
    value: "Romance Standard Time",
    abbr: "RDT",
    offset: 1,
    isdst: true,
    text: "Brussels, Copenhagen, Madrid, Paris",
    utc: [
      "Europe/Paris",
      "Africa/Ceuta",
      "Europe/Brussels",
      "Europe/Copenhagen",
      "Europe/Madrid",
    ]
  },
  {
    id: 44,
    value: "Central European Standard Time",
    abbr: "CEDT",
    offset: 1,
    isdst: true,
    text: "Sarajevo, Skopje, Warsaw, Zagreb",
    utc: [
      "Europe/Sarajevo",
      "Europe/Skopje",
      "Europe/Warsaw",
      "Europe/Zagreb"
    ]
  },
  {
    id: 45,
    value: "W. Central Africa Standard Time",
    abbr: "WCAST",
    offset: 1,
    isdst: false,
    text: "West Central Africa",
    utc: [
      "Africa/Algiers",
      "Africa/Bangui",
      "Africa/Brazzaville",
      "Africa/Douala",
      "Africa/Kinshasa",
      "Africa/Lagos",
      "Africa/Libreville",
      "Africa/Luanda",
      "Africa/Malabo",
      "Africa/Ndjamena",
      "Africa/Niamey",
      "Africa/Porto-Novo",
      "Africa/Tunis",
      "Etc/GMT-1"
    ]
  },
  {
    id: 46,
    value: "Namibia Standard Time",
    abbr: "NST",
    offset: 2,
    isdst: false,
    text: "Windhoek",
    utc: [
      "Africa/Windhoek"
    ]
  },
  {
    id: 47,
    value: "GTB Standard Time",
    abbr: "GDT",
    offset: 3,
    isdst: true,
    text: "Athens, Bucharest",
    utc: [
      "Europe/Athens",
      "Europe/Bucharest",
    ]
  },
  {
    offset: 2,
    value: "Eastern European Time",
    text: 'Chisinau',
    id: 120,
    utc: [
      "Europe/Chisinau"
    ],
  },
  {
    id: 48,
    value: "Middle East Standard Time",
    abbr: "MEDT",
    offset: 2,
    isdst: true,
    text: "Beirut",
    utc: [
      "Asia/Beirut"
    ]
  },
  {
    id: 49,
    value: "Egypt Standard Time",
    abbr: "EST",
    offset: 2,
    isdst: false,
    text: "Cairo",
    utc: [
      "Africa/Cairo"
    ]
  },
  {
    id: 50,
    value: "Syria Standard Time",
    abbr: "SDT",
    offset: 2,
    isdst: true,
    text: "Damascus",
    utc: [
      "Asia/Damascus"
    ]
  },
  {
    id: 51,
    value: "E. Europe Standard Time",
    abbr: "EEDT",
    offset: 2,
    isdst: true,
    text: "E. Europe",
    utc: [
      "Asia/Nicosia",
      "Europe/Athens",
      "Europe/Bucharest",
      "Europe/Chisinau",
      "Europe/Helsinki",
      "Europe/Kiev",
      "Europe/Mariehamn",
      "Europe/Nicosia",
      "Europe/Riga",
      "Europe/Sofia",
      "Europe/Tallinn",
      "Europe/Uzhgorod",
      "Europe/Vilnius",
      "Europe/Zaporozhye"

    ]
  },
  {
    id: 52,
    value: "South Africa Standard Time",
    abbr: "SAST",
    offset: 2,
    isdst: false,
    text: "Harare, Pretoria",
    utc: [
      "Africa/Blantyre",
      "Africa/Bujumbura",
      "Africa/Gaborone",
      "Africa/Harare",
      "Africa/Johannesburg",
      "Africa/Kigali",
      "Africa/Lubumbashi",
      "Africa/Lusaka",
      "Africa/Maputo",
      "Africa/Maseru",
      "Africa/Mbabane",
      "Etc/GMT-2"
    ]
  },
  {
    id: 53,
    value: "FLE Standard Time",
    abbr: "FDT",
    offset: 3,
    isdst: true,
    text: "Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
    utc: [
      "Europe/Helsinki",
      "Europe/Kiev",
      "Europe/Mariehamn",
      "Europe/Riga",
      "Europe/Sofia",
      "Europe/Tallinn",
      "Europe/Uzhgorod",
      "Europe/Vilnius",
      "Europe/Zaporozhye"
    ]
  },
  {
    id: 54,
    value: "Turkey Standard Time",
    abbr: "TDT",
    offset: 3,
    isdst: false,
    text: "Istanbul",
    utc: [
      "Europe/Istanbul"
    ]
  },
  {
    id: 55,
    value: "Israel Standard Time",
    abbr: "JDT",
    offset: 2,
    isdst: true,
    text: "Jerusalem",
    utc: [
      "Asia/Jerusalem"
    ]
  },
  {
    id: 56,
    value: "Libya Standard Time",
    abbr: "LST",
    offset: 2,
    isdst: false,
    text: "Tripoli",
    utc: [
      "Africa/Tripoli"
    ]
  },
  {
    id: 57,
    value: "Jordan Standard Time",
    abbr: "JST",
    offset: 2,
    isdst: false,
    text: "Amman",
    utc: [
      "Asia/Amman"
    ]
  },
  {
    id: 58,
    value: "Arabic Standard Time",
    abbr: "AST",
    offset: 3,
    isdst: false,
    text: "Baghdad",
    utc: [
      "Asia/Baghdad"
    ]

  },
  {
    id: 59,
    value: "Kaliningrad Standard Time",
    abbr: "KST",
    offset: 2,
    isdst: false,
    text: "Kaliningrad",
    utc: [
      "Europe/Kaliningrad"
    ]
  },
  {
    id: 60,
    value: "Arab Standard Time",
    abbr: "AST",
    offset: 3,
    isdst: false,
    text: "Kuwait, Riyadh",
    utc: [
      "Asia/Riyadh",
      "Asia/Aden",
      "Asia/Bahrain",
      "Asia/Kuwait",
      "Asia/Qatar",
    ]
  },
  {
    id: 61,
    value: "E. Africa Standard Time",
    abbr: "EAST",
    offset: 3,
    isdst: false,
    text: "Nairobi",
    utc: [
      "Africa/Addis_Ababa",
      "Africa/Asmera",
      "Africa/Dar_es_Salaam",
      "Africa/Djibouti",
      "Africa/Juba",
      "Africa/Kampala",
      "Africa/Khartoum",
      "Africa/Mogadishu",
      "Africa/Nairobi",
      "Antarctica/Syowa",
      "Etc/GMT-3",
      "Indian/Antananarivo",
      "Indian/Comoro",
      "Indian/Mayotte"
    ]
  },
  {
    id: 62,
    value: "Moscow Standard Time",
    abbr: "MSK",
    offset: 3,
    isdst: false,
    text: "Moscow, St. Petersburg, Volgograd, Minsk",
    utc: [
      "Europe/Kirov",
      "Europe/Moscow",
      "Europe/Simferopol",
      "Europe/Volgograd",
      "Europe/Minsk"
    ]
  },
  {
    id: 63,
    value: "Samara Time",
    abbr: "SAMT",
    offset: 4,
    isdst: false,
    text: "Samara, Ulyanovsk, Saratov",
    utc: [
      "Europe/Astrakhan",
      "Europe/Samara",
      "Europe/Ulyanovsk"
    ]
  },
  {
    id: 64,
    value: "Iran Standard Time",
    abbr: "IDT",
    offset: 3.5,
    isdst: true,
    text: "Tehran",
    utc: [
      "Asia/Tehran"
    ]
  },
  {
    id: 65,
    value: "Arabian Standard Time",
    abbr: "AST",
    offset: 4,
    isdst: false,
    text: "Abu Dhabi, Muscat",
    utc: [
      "Asia/Dubai",
      "Asia/Muscat",
      "Etc/GMT-4"
    ]
  },
  {
    id: 66,
    value: "Azerbaijan Standard Time",
    abbr: "ADT",
    offset: 4,
    isdst: true,
    text: "Baku",
    utc: [
      "Asia/Baku"
    ]
  },
  {
    id: 67,
    value: "Mauritius Standard Time",
    abbr: "MST",
    offset: 4,
    isdst: false,
    text: "Port Louis",
    utc: [
      "Indian/Mahe",
      "Indian/Mauritius",
      "Indian/Reunion"
    ]
  },
  {
    id: 68,
    value: "Georgian Standard Time",
    abbr: "GET",
    offset: 4,
    isdst: false,
    text: "Tbilisi",
    utc: [
      "Asia/Tbilisi"
    ]
  },
  {
    id: 69,
    value: "Caucasus Standard Time",
    abbr: "CST",
    offset: 4,
    isdst: false,
    text: "Yerevan",
    utc: [
      "Asia/Yerevan"
    ]
  },
  {
    id: 70,
    value: "Afghanistan Standard Time",
    abbr: "AST",
    offset: 4.5,
    isdst: false,
    text: "Kabul",
    utc: [
      "Asia/Kabul"
    ]
  },
  {
    id: 71,
    value: "West Asia Standard Time",
    abbr: "WAST",
    offset: 5,
    isdst: false,
    text: "Ashgabat, Tashkent",
    utc: [
      "Antarctica/Mawson",
      "Asia/Aqtau",
      "Asia/Aqtobe",
      "Asia/Ashgabat",
      "Asia/Dushanbe",
      "Asia/Oral",
      "Asia/Samarkand",
      "Asia/Tashkent",
      "Etc/GMT-5",
      "Indian/Kerguelen",
      "Indian/Maldives"
    ]
  },
  {
    id: 72,
    value: "Yekaterinburg Time",
    abbr: "YEKT",
    offset: 5,
    isdst: false,
    text: "Yekaterinburg",
    utc: [
      "Asia/Yekaterinburg"
    ]
  },
  {
    id: 73,
    value: "Pakistan Standard Time",
    abbr: "PKT",
    offset: 5,
    isdst: false,
    text: "Islamabad, Karachi",
    utc: [
      "Asia/Karachi"
    ]
  },
  {
    id: 74,
    value: "India Standard Time",
    abbr: "IST",
    offset: 5.5,
    isdst: false,
    text: "Chennai, Kolkata, Mumbai, New Delhi",
    utc: [
      "Asia/Kolkata"
    ]
  },
  {
    id: 75,
    value: "Sri Lanka Standard Time",
    abbr: "SLST",
    offset: 5.5,
    isdst: false,
    text: "Sri Jayawardenepura",
    utc: [
      "Asia/Colombo"
    ]
  },
  {
    id: 76,
    value: "Nepal Standard Time",
    abbr: "NST",
    offset: 5.75,
    isdst: false,
    text: "Kathmandu",
    utc: [
      "Asia/Kathmandu"
    ]
  },
  {
    id: 77,
    value: "Central Asia Standard Time",
    abbr: "CAST",
    offset: 6,
    isdst: false,
    text: "Astana",
    utc: [
      "Antarctica/Vostok",
      "Asia/Almaty",
      "Asia/Bishkek",
      "Asia/Qyzylorda",
      "Asia/Urumqi",
      "Etc/GMT-6",
      "Indian/Chagos"
    ]
  },
  {
    id: 78,
    value: "Bangladesh Standard Time",
    abbr: "BST",
    offset: 6,
    isdst: false,
    text: "Dhaka",
    utc: [
      "Asia/Dhaka",
      "Asia/Thimphu"
    ]
  },
  {
    id: 79,
    value: "Myanmar Standard Time",
    abbr: "MST",
    offset: 6.5,
    isdst: false,
    text: "Yangon (Rangoon)",
    utc: [
      "Asia/Rangoon",
      "Indian/Cocos"
    ]
  },
  {
    id: 80,
    value: "SE Asia Standard Time",
    abbr: "SAST",
    offset: 7,
    isdst: false,
    text: "Bangkok, Hanoi, Jakarta",
    utc: [
      "Antarctica/Davis",
      "Asia/Bangkok",
      "Asia/Hovd",
      "Asia/Jakarta",
      "Asia/Phnom_Penh",
      "Asia/Pontianak",
      "Asia/Saigon",
      "Asia/Vientiane",
      "Etc/GMT-7",
      "Indian/Christmas"
    ]
  },
  {
    id: 81,
    value: "N. Central Asia Standard Time",
    abbr: "NCAST",
    offset: 7,
    isdst: false,
    text: "Novosibirsk",
    utc: [
      "Asia/Novokuznetsk",
      "Asia/Novosibirsk",
      "Asia/Omsk"
    ]
  },
  {
    id: 82,
    value: "China Standard Time",
    abbr: "CST",
    offset: 8,
    isdst: false,
    text: "Beijing, Chongqing, Hong Kong, Urumqi",
    utc: [
      "Asia/Hong_Kong",
      "Asia/Macau",
      "Asia/Shanghai"
    ]
  },
  {
    id: 83,
    value: "North Asia Standard Time",
    abbr: "NAST",
    offset: 7,
    isdst: false,
    text: "Krasnoyarsk",
    utc: [
      "Asia/Krasnoyarsk"
    ]
  },
  {
    id: 84,
    value: "Singapore Standard Time",
    abbr: "MPST",
    offset: 8,
    isdst: false,
    text: "Kuala Lumpur, Singapore",
    utc: [
      "Asia/Brunei",
      "Asia/Kuala_Lumpur",
      "Asia/Kuching",
      "Asia/Makassar",
      "Asia/Manila",
      "Asia/Singapore",
      "Etc/GMT-8"
    ]
  },
  {
    id: 85,
    value: "W. Australia Standard Time",
    abbr: "WAST",
    offset: 8,
    isdst: false,
    text: "Perth",
    utc: [
      "Antarctica/Casey",
      "Australia/Perth"
    ]
  },
  {
    id: 86,
    value: "Taipei Standard Time",
    abbr: "TST",
    offset: 8,
    isdst: false,
    text: "Taipei",
    utc: [
      "Asia/Taipei"
    ]
  },
  {
    id: 87,
    value: "Ulaanbaatar Standard Time",
    abbr: "UST",
    offset: 8,
    isdst: false,
    text: "Ulaanbaatar",
    utc: [
      "Asia/Choibalsan",
      "Asia/Ulaanbaatar"
    ]
  },
  {
    id: 88,
    value: "North Asia East Standard Time",
    abbr: "NAEST",
    offset: 8,
    isdst: false,
    text: "Irkutsk",
    utc: [
      "Asia/Irkutsk"
    ]
  },
  {
    id: 89,
    value: "Japan Standard Time",
    abbr: "JST",
    offset: 9,
    isdst: false,
    text: "Osaka, Sapporo, Tokyo",
    utc: [
      "Asia/Tokyo",
      "Asia/Dili",
      "Asia/Jayapura",
      "Etc/GMT-9",
      "Pacific/Palau"
    ]
  },
  {
    id: 90,
    value: "Korea Standard Time",
    abbr: "KST",
    offset: 9,
    isdst: false,
    text: "Seoul",
    utc: [
      "Asia/Seoul",
      "Asia/Pyongyang",
    ]
  },
  {
    id: 91,
    value: "Cen. Australia Standard Time",
    abbr: "CAST",
    offset: 9.5,
    isdst: false,
    text: "Adelaide",
    utc: [
      "Australia/Adelaide",
      "Australia/Broken_Hill"
    ]
  },
  {
    id: 92,
    value: "AUS Central Standard Time",
    abbr: "ACST",
    offset: 9.5,
    isdst: false,
    text: "Darwin",
    utc: [
      "Australia/Darwin"
    ]
  },
  {
    id: 93,
    value: "E. Australia Standard Time",
    abbr: "EAST",
    offset: 10,
    isdst: false,
    text: "Brisbane",
    utc: [
      "Australia/Brisbane",
      "Australia/Lindeman"
    ]
  },
  {
    id: 94,
    value: "AUS Eastern Standard Time",
    abbr: "AEST",
    offset: 10,
    isdst: false,
    text: "Canberra, Melbourne, Sydney",
    utc: [
      "Australia/Sydney",
      "Australia/Melbourne",
    ]
  },
  {
    id: 95,
    value: "West Pacific Standard Time",
    abbr: "WPST",
    offset: 10,
    isdst: false,
    text: "Guam, Port Moresby",
    utc: [
      "Antarctica/DumontDUrville",
      "Etc/GMT-10",
      "Pacific/Guam",
      "Pacific/Port_Moresby",
      "Pacific/Saipan",
      "Pacific/Truk"
    ]
  },
  {
    id: 96,
    value: "Tasmania Standard Time",
    abbr: "TST",
    offset: 10,
    isdst: false,
    text: "Hobart",
    utc: [
      "Australia/Currie",
      "Australia/Hobart"
    ]
  },
  {
    id: 97,
    value: "Yakutsk Standard Time",
    abbr: "YST",
    offset: 9,
    isdst: false,
    text: "Yakutsk",
    utc: [
      "Asia/Chita",
      "Asia/Khandyga",
      "Asia/Yakutsk"
    ]
  },
  {
    id: 98,
    value: "Central Pacific Standard Time",
    abbr: "CPST",
    offset: 11,
    isdst: false,
    text: "Solomon Is., New Caledonia",
    utc: [
      "Antarctica/Macquarie",
      "Etc/GMT-11",
      "Pacific/Efate",
      "Pacific/Guadalcanal",
      "Pacific/Kosrae",
      "Pacific/Noumea",
      "Pacific/Ponape"
    ]
  },
  {
    id: 99,
    value: "Vladivostok Standard Time",
    abbr: "VST",
    offset: 10,
    isdst: false,
    text: "Vladivostok",
    utc: [
      "Asia/Sakhalin",
      "Asia/Ust-Nera",
      "Asia/Vladivostok"
    ]
  },
  {
    id: 100,
    value: "New Zealand Standard Time",
    abbr: "NZST",
    offset: 12,
    isdst: false,
    text: "Auckland, Wellington",
    utc: [
      "Pacific/Auckland",
      "Antarctica/McMurdo",
    ]
  },
  {
    id: 101,
    value: "UTC+12",
    abbr: "U",
    offset: 12,
    isdst: false,
    text: "Coordinated Universal Time+12",
    utc: [
      "Etc/GMT-12",
      "Pacific/Funafuti",
      "Pacific/Kwajalein",
      "Pacific/Majuro",
      "Pacific/Nauru",
      "Pacific/Tarawa",
      "Pacific/Wake",
      "Pacific/Wallis"
    ]
  },
  {
    id: 102,
    value: "Fiji Standard Time",
    abbr: "FST",
    offset: 12,
    isdst: false,
    text: "Fiji",
    utc: [
      "Pacific/Fiji"
    ]
  },
  {
    id: 103,

    value: "Magadan Standard Time",
    abbr: "MST",
    offset: 12,
    isdst: false,
    text: "Magadan",
    utc: [
      "Asia/Anadyr",
      "Asia/Kamchatka",
      "Asia/Magadan",
      "Asia/Srednekolymsk"
    ]
  },
  {
    id: 104,
    value: "Kamchatka Standard Time",
    abbr: "KDT",
    offset: 12,
    isdst: true,
    text: "Petropavlovsk-Kamchatsky - Old",
    utc: [
      "Asia/Kamchatka"
    ]
  },
  {
    id: 105,
    value: "Tonga Standard Time",
    abbr: "TST",
    offset: 13,
    isdst: false,
    text: "Nuku'alofa",
    utc: [
      "Pacific/Enderbury",
      "Etc/GMT-13",
      "Pacific/Fakaofo",
      "Pacific/Tongatapu"
    ]
  },
  {
    id: 106,
    value: "Samoa Standard Time",
    abbr: "SST",
    offset: 13,
    isdst: false,
    text: "Samoa",
    utc: [
      "Pacific/Apia"
    ]
  }
];
