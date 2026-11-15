const alphabetGroups = ['ABCDEF', 'GHIJK', 'LMNOP', 'QRSTU', 'VWXYZ'];
const stationParams = new URLSearchParams(location.search);
const stationIndex = alphabetGroups.findIndex(group => group[0] === stationParams.get('station'));
const station = stationIndex < 0 ? 0 : stationIndex;
const stationLetters = alphabetGroups[station];
const stationRange = group => group[0]+'–'+group.at(-1);
const stationQuery = index => index ? 'station='+alphabetGroups[index][0] : '';
const runnerUrl = index => 'letter-run.html'+(index?'?'+stationQuery(index):'');
const workshopUrl = index => 'robot-workshop.html?theme=train'+(index?'&'+stationQuery(index):'');
const laterLetters = [
 {"letter": "G", "word": "goat", "he": "עז", "icon": "🐐", "sound": "/g/", "upper": "M54 38C38 16 11 30 11 58C11 84 34 104 54 82V63H36", "lower": "M49 56C38 43 13 48 13 69C13 94 38 96 49 79 M49 49V101C49 117 25 122 15 110"},
 {"letter": "H", "word": "hat", "he": "כובע", "icon": "🧢", "sound": "/h/", "upper": "M12 26V91 M53 26V91 M12 57H53", "lower": "M13 26V91 M13 64C24 43 50 44 50 64V91"},
 {"letter": "I", "word": "insect", "he": "חרק", "icon": "🐞", "sound": "/ɪ/", "upper": "M15 26H50 M32 26V91 M15 91H50", "lower": "M31 51V91 M31 34h1"},
 {"letter": "J", "word": "jam", "he": "ריבה", "icon": "🍓", "sound": "/dʒ/", "upper": "M20 26H54 M44 26V74C44 96 13 98 11 77", "lower": "M40 51V101C40 115 30 120 17 113 M40 34h1"},
 {"letter": "K", "word": "kite", "he": "עפיפון", "icon": "🪁", "sound": "/k/", "upper": "M13 26V91 M54 26L13 62 M28 50L54 91", "lower": "M14 26V91 M49 49L14 76 M28 66L51 91"},
 {"letter": "L", "word": "lemon", "he": "לימון", "icon": "🍋", "sound": "/l/", "upper": "M13 26V91H54", "lower": "M32 26V91"},
 {"letter": "M", "word": "moon", "he": "ירח", "icon": "🌙", "sound": "/m/", "upper": "M9 91V26L32 58L55 26V91", "lower": "M8 50V91 M8 63C18 44 32 46 32 63V91 M32 63C42 44 56 46 56 63V91"},
 {"letter": "N", "word": "nose", "he": "אף", "icon": "👃", "sound": "/n/", "upper": "M11 91V26L54 91V26", "lower": "M13 49V91 M13 63C25 43 50 45 50 64V91"},
 {"letter": "O", "word": "octopus", "he": "תמנון", "icon": "🐙", "sound": "/ɑ/", "upper": "M32 26C3 26 3 91 32 91C61 91 61 26 32 26Z", "lower": "M31 49C6 49 6 91 31 91C56 91 56 49 31 49Z"},
 {"letter": "P", "word": "pig", "he": "חזיר", "icon": "🐷", "sound": "/p/", "upper": "M13 91V26H33C60 26 60 59 33 59H13", "lower": "M13 50V115 M13 60C25 41 52 48 52 70C52 94 25 98 13 80"},
 {"letter": "Q", "word": "queen", "he": "מלכה", "icon": "👑", "sound": "/kw/", "upper": "M31 26C2 26 2 91 31 91C60 91 60 26 31 26Z M40 74L57 95", "lower": "M49 60C37 42 12 47 12 70C12 94 38 98 49 79 M49 50V115"},
 {"letter": "R", "word": "rabbit", "he": "ארנב", "icon": "🐰", "sound": "/r/", "upper": "M13 91V26H31C59 26 59 57 31 57H13 M29 57L55 91", "lower": "M14 49V91 M14 65C22 47 36 46 46 53"},
 {"letter": "S", "word": "sun", "he": "שמש", "icon": "☀️", "sound": "/s/", "upper": "M53 35C40 18 14 26 14 43C14 61 53 53 53 74C53 94 25 98 11 82", "lower": "M48 55C35 43 15 48 15 60C15 74 49 67 49 81C49 93 27 96 13 86"},
 {"letter": "T", "word": "turtle", "he": "צב", "icon": "🐢", "sound": "/t/", "upper": "M9 26H55 M32 26V91", "lower": "M28 35V77C28 90 38 95 48 86 M14 50H46"},
 {"letter": "U", "word": "umbrella", "he": "מטרייה", "icon": "☂️", "sound": "/ʌ/", "upper": "M11 26V67C11 99 54 99 54 67V26", "lower": "M13 50V75C13 97 40 96 49 77 M49 50V91"},
 {"letter": "V", "word": "van", "he": "מסחרית", "icon": "🚐", "sound": "/v/", "upper": "M9 26L32 91L55 26", "lower": "M12 50L32 91L52 50"},
 {"letter": "W", "word": "watch", "he": "שעון יד", "icon": "⌚", "sound": "/w/", "upper": "M6 26L17 91L32 51L47 91L58 26", "lower": "M6 50L16 91L32 60L48 91L58 50"},
 {"letter": "X", "word": "x-ray", "he": "צילום רנטגן", "icon": "🩻", "sound": "/ɛks/", "upper": "M10 26L54 91 M54 26L10 91", "lower": "M13 50L51 91 M51 50L13 91"},
 {"letter": "Y", "word": "yellow", "he": "צהוב", "icon": "🟡", "sound": "/j/", "upper": "M9 26L32 60L55 26 M32 60V91", "lower": "M13 50L31 90 M52 50L24 115"},
 {"letter": "Z", "word": "zebra", "he": "זברה", "icon": "🦓", "sound": "/z/", "upper": "M11 26H53L11 91H54", "lower": "M13 50H50L13 91H51"}
];
