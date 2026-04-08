export type KronotopCategory = 'klasik' | 'tematik' | 'mikro' | 'muasir';

export interface KronotopData {
  id: string;
  category: KronotopCategory;
  order: number;
  color: string;
  colorLight: string;
  icon: string;
  svgPath: string;
  name: { az: string; en: string; ru: string };
  shortDesc: { az: string; en: string; ru: string };
  whatItIs: { az: string; en: string; ru: string };
  whatItIsNot: { az: string; en: string; ru: string };
  howToUse: { az: string; en: string; ru: string };
  importance: { az: string; en: string; ru: string };
  scenaristTip: { az: string; en: string; ru: string };
  filmExamples: string[];
}

export const KRONOTOP_CATEGORIES: Record<KronotopCategory, { az: string; en: string; ru: string }> = {
  klasik: { az: 'Klassik Bahtin Xronotopları', en: 'Classic Bakhtinian Chronotopes', ru: 'Классические Бахтинские Хронотопы' },
  tematik: { az: 'Tematik və Sosial Xronotoplar', en: 'Thematic & Social Chronotopes', ru: 'Тематические и Социальные Хронотопы' },
  mikro: { az: 'Mikro Xronotoplar', en: 'Micro Chronotopes', ru: 'Микро Хронотопы' },
  muasir: { az: 'Müasir və Kinema Xronotopları', en: 'Modern & Cinema Chronotopes', ru: 'Современные и Кинема Хронотопы' },
};

export const KRONOTOPLAR: KronotopData[] = [
  // KLASIK (6)
  {
    id: 'yol-ve-qarsilasma', category: 'klasik', order: 1,
    color: '#E67E22', colorLight: '#FEF3E7', icon: '🛤️',
    svgPath: '/assets/kronotop/yol-ve-qarsilasma.svg',
    name: { az: 'Yol və Qarşılaşma', en: 'Road & Encounter', ru: 'Дорога и Встреча' },
    shortDesc: {
      az: 'Fərqli tale və siniflərin təsadüfi kəsişdiyi, yeni başlanğıcların mümkün olduğu zaman-məkandır.',
      en: 'The space where different fates and social classes intersect by chance, enabling new beginnings.',
      ru: 'Пространство случайного пересечения судеб — там, где возможны новые начала.'
    },
    whatItIs: {
      az: 'Yol xronotopunda personaj səfərdədir — fiziki, emosional və ya metaforik. Gözlənilməyən qarşılaşmalar baş verir; tale burada dəyişir, yeni başlayır və ya sona çatır.',
      en: 'The character is on a journey — physical, emotional, or metaphorical. Unexpected encounters occur; fate changes, begins, or ends here.',
      ru: 'Персонаж в пути — физическом, эмоциональном или метафорическом. Происходят неожиданные встречи; судьба здесь меняется.'
    },
    whatItIsNot: {
      az: 'Sadəcə bir nəqliyyat sahnəsi deyil. Personajın tezliklə geri döndüyü, həqiqi qarşılaşma olmayan hər yol sahnəsi bu xronotop deyil.',
      en: 'Not simply a transportation scene. Any road scene without genuine encounter where the character quickly returns is not this chronotope.',
      ru: 'Не просто транспортная сцена. Любая дорожная сцена без настоящей встречи — не этот хронотоп.'
    },
    howToUse: {
      az: 'Personajı sərgi boyunca yola çıxarın. Hər yeni üz yeni bir konflikt gətirir.',
      en: 'Put your character on a journey throughout the narrative. Each new face brings conflict.',
      ru: 'Отправьте персонажа в путь. Каждое новое лицо несёт конфликт.'
    },
    importance: {
      az: 'Fərqli sosial siniflər, dinlər və talelər yalnız yolda buluşa bilər. Yol, bərabərsizliyi əriyən yeganə xronotoptur.',
      en: 'Different social classes, religions, and fates can only meet on the road. The road is the only chronotope where inequality dissolves.',
      ru: 'Разные классы, религии и судьбы встречаются только на дороге.'
    },
    scenaristTip: {
      az: 'Personajınızı "Yol"a çıxardığınızda, nəzarəti itirdiyi an xronotopun gücü devreye girər.',
      en: 'When your character hits the Road, the moment they lose control is when the chronotope\'s power activates.',
      ru: 'Когда персонаж выходит на дорогу, момент потери контроля активирует силу хронотопа.'
    },
    filmExamples: ['Easy Rider (1969)', 'Bir Zamanlar Anadolu\'da (2011)', 'Thelma & Louise (1991)', 'Into the Wild (2007)']
  },
  {
    id: 'esik-bohran', category: 'klasik', order: 2,
    color: '#8E44AD', colorLight: '#F5EEF8', icon: '🚪',
    svgPath: '/assets/kronotop/esik-bohran.svg',
    name: { az: 'Eşik / Böhran Anı', en: 'Threshold / Crisis Moment', ru: 'Порог / Момент Кризиса' },
    shortDesc: {
      az: 'Pilləkən, dəhliz, qapı — zamanın "anlıq" dayandığı, personajın həyatını dəyişdirəcək qərar verdiyi keçid nöqtəsidir.',
      en: 'Staircase, hallway, doorway — where time freezes and the character makes a life-changing decision.',
      ru: 'Лестница, коридор, дверь — где время "замирает" и персонаж принимает судьбоносное решение.'
    },
    whatItIs: {
      az: 'Zaman "anlıq"dır — yalnız bu BİR kriz var. Pilləkən, hol, dəhliz, meydan kimi "keçid" nöqtələridir.',
      en: 'Time is instantaneous — just this ONE crisis. Staircase, hall, corridor, square — transitional points.',
      ru: 'Время "мгновенно" — один кризис. Лестница, холл, коридор — переходные точки.'
    },
    whatItIsNot: {
      az: 'Sadəcə qapı açma sahnəsi deyil. Personajın böyük dəyişiklik olmadan sadəcə keçib getdiyi hər dəhliz sahnəsi bu xronotop deyil.',
      en: 'Not simply a door-opening scene. Any corridor scene where the character just passes through without significant change is not this chronotope.',
      ru: 'Не просто открытие двери. Любой коридор без значительного изменения — не этот хронотоп.'
    },
    howToUse: {
      az: 'Personajı fiziki bir "keçid nöqtəsi"ndə dayandırın. O anı uzadın.',
      en: 'Stop your character at a physical threshold. Extend that moment.',
      ru: 'Остановите персонажа на физическом пороге. Растяните этот момент.'
    },
    importance: {
      az: 'Ən dramatik anlar bu xronotopda baş verir. Tamaşaçı intuitiv olaraq "bir şey olacaq" hissini yaşayır.',
      en: 'The most dramatic moments happen here. The audience intuitively feels something will happen.',
      ru: 'Самые драматичные моменты — здесь. Зритель инстинктивно чувствует: что-то произойдёт.'
    },
    scenaristTip: {
      az: '"Eşik" xronotopunda personaj nə qədər çox dayanarsa, kriz bir o qədər yoğunlaşır.',
      en: 'The longer the character lingers at the Threshold, the more intense the crisis.',
      ru: 'Чем дольше персонаж на Пороге, тем интенсивнее кризис.'
    },
    filmExamples: ['Psycho — Merdiven sahnəsi', 'The Godfather — Vəftiz', 'Mulholland Drive (2001)', 'Hamlet — "Olmaq ya olmamaq"']
  },
  {
    id: 'kend-qapali-seher', category: 'klasik', order: 3,
    color: '#F39C12', colorLight: '#FEF9E7', icon: '🏘️',
    svgPath: '/assets/kronotop/kend-qapali-seher.svg',
    name: { az: 'Kənd / Qapalı Şəhər', en: 'Provincial Town', ru: 'Провинциальный Город' },
    shortDesc: {
      az: 'Zamanın donduğu, hər günün birbirini təkrarladığı, böyük hadisələrin baş vermediyi dövrəvi və boğucu zaman-məkandır.',
      en: 'Where time freezes, every day repeats, no major events occur — cyclical and suffocating.',
      ru: 'Где время застывает, каждый день повторяется, великих событий не происходит.'
    },
    whatItIs: {
      az: 'Vaxt irəli getmir, sadəcə dövrə vurur. Personaj bu dövrədən çıxa bilmir.',
      en: 'Time doesn\'t move forward, it only circles. The character cannot escape.',
      ru: 'Время не движется вперёд, только кружится. Персонаж не может вырваться.'
    },
    whatItIsNot: {
      az: 'Yalnız "kənddə baş verən" hər sahne deyil. Şəhərdə də bu xronotop qurula bilər.',
      en: 'Not every village scene. This chronotope can be built in a city too.',
      ru: 'Не каждая деревенская сцена. Этот хронотоп можно создать и в городе.'
    },
    howToUse: {
      az: 'Hər sahnədə eyni ritmi, eyni üzləri, eyni dialoqları yenidən göstərin.',
      en: 'Show the same rhythm, same faces, same dialogues in each scene.',
      ru: 'Показывайте один и тот же ритм, те же лица, те же диалоги в каждой сцене.'
    },
    importance: {
      az: 'Personajın "çıxmaq" arzusunu dramatik olaraq qurursunuz — tamaşaçı da sıxılır.',
      en: 'You dramatically build the character\'s desire to escape — the audience suffocates too.',
      ru: 'Желание персонажа "сбежать" передаётся зрителю.'
    },
    scenaristTip: {
      az: 'Personajı bu xronotopa saldığınızda, zamana qarşı məğlub olmağa hazır olmalıdır.',
      en: 'When you place a character here, they must be prepared to lose against time.',
      ru: 'Персонаж должен быть готов проиграть времени.'
    },
    filmExamples: ['American Beauty (1999)', 'Yozgat Blues (2013)', 'Three Colors: Blue (1993)', 'Twin Peaks']
  },
  {
    id: 'salon-qonaq-otagi', category: 'klasik', order: 4,
    color: '#2980B9', colorLight: '#EAF4FB', icon: '🎭',
    svgPath: '/assets/kronotop/salon-qonaq-otagi.svg',
    name: { az: 'Salon / Qonaq Otağı', en: 'Drawing Room / Salon', ru: 'Гостиная / Салон' },
    shortDesc: {
      az: 'Entrika şəbəkələrinin toxunduğu, sosial maskaların taxıldığı, hiyerarxiyanın sərgilendiyi kəsişmə sahəsidir.',
      en: 'Where intrigue networks are woven, social masks worn, hierarchy displayed.',
      ru: 'Где плетутся интриги, надеваются маски, демонстрируется иерархия.'
    },
    whatItIs: {
      az: 'Hər kəs rol oynayır. Dialoqlar şifrəlidir, alt mətnlər güclüdür.',
      en: 'Everyone plays a role. Dialogues are coded, subtext is powerful.',
      ru: 'Все играют роли. Диалоги зашифрованы, подтекст силён.'
    },
    whatItIsNot: {
      az: 'Sadəcə "yığıncaq sahnəsi" deyil. Açıq ünsiyyətin baş verdiyi hər səhnə bu xronotop deyil.',
      en: 'Not simply a gathering scene. Any scene with open communication is not this chronotope.',
      ru: 'Не просто собрание. Активируется, когда исполнение роли обязательно.'
    },
    howToUse: {
      az: 'Dialoqların altına "gerçək niyyəti" gömdürün. Hər personajın gizli məqsədi olsun.',
      en: 'Bury real intention beneath dialogues. Each character should have a hidden agenda.',
      ru: 'Похороните настоящее намерение под диалогами.'
    },
    importance: {
      az: 'Toplumsal dəyərləri, sinif fərqlərini güc münasibətlərini "performans" üzərindən göstərir.',
      en: 'Shows social values, class differences, and power relations through performance.',
      ru: 'Показывает ценности и властные отношения через исполнение.'
    },
    scenaristTip: {
      az: 'Hər personajın "salon maskası" ilə "gerçək üzü" arasındakı məsafəni dramatik gərginlik mənbəyi kimi istifadə edin.',
      en: 'Use the distance between each character\'s salon mask and real face as a source of dramatic tension.',
      ru: 'Используйте расстояние между маской и настоящим лицом как источник напряжения.'
    },
    filmExamples: ['Gosford Park (2001)', 'The Rules of the Game (1939)', 'Parasite (2019)', 'Casablanca (1942)']
  },
  {
    id: 'qala-saray-kosk', category: 'klasik', order: 5,
    color: '#7F8C8D', colorLight: '#F2F3F4', icon: '🏰',
    svgPath: '/assets/kronotop/qala-saray-kosk.svg',
    name: { az: 'Qala / Saray / Köşk', en: 'Castle / Manor / Estate', ru: 'Замок / Усадьба / Особняк' },
    shortDesc: {
      az: 'Keçmişin izlərini daşıyan, əsrlər boyu nüfuz etmiş "doymuş zaman" məkanıdır.',
      en: 'Space saturated with the past, accumulated over centuries.',
      ru: 'Пространство, насыщенное прошлым.'
    },
    whatItIs: {
      az: 'Divarlar yaddaşlı. Hər otaq bir əsr. Personaj binaya girəndə donub qalan bir "zaman diliminə" girir.',
      en: 'The walls have memory. Every room is a century. When a character enters, they enter a frozen time slice.',
      ru: 'Стены помнят. Каждая комната — век. Персонаж входит в замёрзший срез времени.'
    },
    whatItIsNot: {
      az: 'Sadəcə "böyük ev" deyil. Tarixi dərinliyi olmayan hər böyük bina bu xronotop deyil.',
      en: 'Not simply a big house. Any large building without historical depth is not this chronotope.',
      ru: 'Не просто большой дом. Любое здание без исторической глубины — не этот хронотоп.'
    },
    howToUse: {
      az: 'Binanın keçmişini personajın indiki həyatının aynası kimi istifadə edin.',
      en: 'Use the building\'s past as a mirror of the character\'s present.',
      ru: 'Используйте прошлое здания как зеркало настоящего персонажа.'
    },
    importance: {
      az: 'Tarixi yükü olan personajlar bu məkanda "keçmiş" ilə üzləşmək məcburiyyətindədir.',
      en: 'Characters burdened with history must confront the past here.',
      ru: 'Персонажи с историческим грузом вынуждены встретиться с прошлым.'
    },
    scenaristTip: {
      az: 'Binanın "keçmişi" personajı "özünün olmayan" bir kimlik üzərindən tanımlayacaqsa, bu xronotop dramatik tuzağa çevrilir.',
      en: 'If the building\'s past defines the character through an identity not their own, this chronotope becomes a dramatic trap.',
      ru: 'Если прошлое здания определяет персонажа через чужую идентичность — это ловушка.'
    },
    filmExamples: ['Rebecca (1940)', 'The Shining (1980)', 'Downton Abbey', 'Manderley']
  },
  {
    id: 'pastoral-idil', category: 'klasik', order: 6,
    color: '#27AE60', colorLight: '#E9F7EF', icon: '🌾',
    svgPath: '/assets/kronotop/pastoral-idil.svg',
    name: { az: 'Pastoral / İdil', en: 'Pastoral / Idyll', ru: 'Пастораль / Идиллия' },
    shortDesc: {
      az: 'İnsan həyatının təbiətin ritmi ilə tam uyum içinde olduğu güvənli zaman-məkandır.',
      en: 'Where human life is in perfect harmony with nature\'s rhythm.',
      ru: 'Где жизнь в полной гармонии с природным ритмом.'
    },
    whatItIs: {
      az: 'Konflikt yoxdur — yalnız dövri həyat var. Bu sabitlik ya həqiqi rahatlıq, ya da çürümüş idealın maskasıdır.',
      en: 'No conflict — only cyclical life. This stability is either genuine peace or the mask of a decayed ideal.',
      ru: 'Нет конфликта — только циклическая жизнь. Подлинный покой или маска гнилого идеала.'
    },
    whatItIsNot: {
      az: 'Sadəcə "gözəl mənzərə" deyil. Hər sakit kənd sahnəsi bu xronotop deyil.',
      en: 'Not simply beautiful scenery. Not every peaceful rural scene.',
      ru: 'Не просто красивый пейзаж. Нужна связь с ритмом предков.'
    },
    howToUse: {
      az: 'Pastoral xronotopunu personajın modernliyi tərk etmə anı üçün qurun.',
      en: 'Build pastoral chronotope for the character\'s moment of leaving modernity.',
      ru: 'Стройте этот хронотоп для момента ухода от современности.'
    },
    importance: {
      az: '"Xoşbəxtlik gəlməzdən əvvəl" anlayışını vizual olaraq mücəssəmləşdirir.',
      en: 'Embodies visually the concept of happiness before loss.',
      ru: 'Воплощает концепцию счастья до потери.'
    },
    scenaristTip: {
      az: 'Pastoral xronotopunda mükəmməllik çox tez kırılırsa, daha güclü nostalgi yaradır.',
      en: 'If perfection breaks too quickly, that happiness moment creates stronger nostalgia.',
      ru: 'Если идиллия рушится быстро, это создаёт более сильную ностальгию.'
    },
    filmExamples: ['The Tree of Life (2011)', 'Far from Heaven (2002)', 'Brokeback Mountain (2005)', 'Fiddler on the Roof']
  },
  // TEMATIK (8)
  {
    id: 'yuxu-xeyal', category: 'tematik', order: 7,
    color: '#9B59B6', colorLight: '#F5EEF8', icon: '🌙',
    svgPath: '/assets/kronotop/yuxu-xeyal.svg',
    name: { az: 'Yuxu / Xəyal', en: 'Dream / Vision', ru: 'Сон / Мечта' },
    shortDesc: {
      az: 'Zaman və məkanın qaydalarının çevikləşdiyi, personajın bilinçaltını əks etdirən xronotop.',
      en: 'Where rules of time and space flex, reflecting the character\'s subconscious.',
      ru: 'Где правила времени и пространства гибки, отражая подсознание персонажа.'
    },
    whatItIs: {
      az: 'Gerçək həyatla hesablaşan, paralel dünyalar quran xronotop.',
      en: 'A chronotope that reckons with real life and builds parallel worlds.',
      ru: 'Хронотоп, противостоящий реальности.'
    },
    whatItIsNot: {
      az: 'Sadəcə "yuxu sahnəsi" deyil. "Hamısı yuxuymuş" yanlış final deyil.',
      en: 'Not simply a dream scene. Not the false ending of "it was all a dream".',
      ru: 'Не просто сцена сна. Ложный финал "всё было сном" — предательство.'
    },
    howToUse: {
      az: 'Yuxu sahnəsini gerçəkliyin mükəmməl aynası kimi qurun.',
      en: 'Build the dream as a perfect mirror of reality.',
      ru: 'Стройте сон как зеркало реальности.'
    },
    importance: {
      az: 'Seyirciyə görünməyən bilinç qatlarını açır.',
      en: 'Opens consciousness layers invisible to the audience.',
      ru: 'Открывает невидимые слои сознания.'
    },
    scenaristTip: {
      az: 'Yuxu sahnəsini real konfliktin "rəqsi" kimi düşünün.',
      en: 'Think of the dream scene as the dance of the real conflict.',
      ru: 'Думайте о сне как о "танце" реального конфликта.'
    },
    filmExamples: ['Inception (2010)', '8½ (1963)', 'Pan\'s Labyrinth (2006)', 'Eternal Sunshine (2004)']
  },
  {
    id: 'orman-mocuzevi', category: 'tematik', order: 8,
    color: '#1E8449', colorLight: '#E9F7EF', icon: '🌲',
    svgPath: '/assets/kronotop/orman-mocuzevi.svg',
    name: { az: 'Meşə / Möcüzəvi Dünya', en: 'Forest / Magical World', ru: 'Лес / Волшебный Мир' },
    shortDesc: {
      az: 'Zaman qaydalarının yumşadığı, personajın daxili "canavar"ı ilə sınandığı möcüzəvi dünya.',
      en: 'Where time rules soften, the character is tested by supernatural forces or their inner beast.',
      ru: 'Где правила времени смягчаются, персонаж испытывается своим внутренним зверем.'
    },
    whatItIs: {
      az: 'Rasional dünyanın qaydalarının azaldığı, dönüşümün baş verdiyi yer.',
      en: 'Where rational world rules diminish, where transformation occurs.',
      ru: 'Место трансформации. Никто не выходит неизменённым.'
    },
    whatItIsNot: {
      az: 'Sadəcə "gözəl mənzərəli yer" deyil. Orman gücünü qapalı, gizli mühitdən alır.',
      en: 'Not beautiful scenery. The forest derives power from being enclosed, hidden, dangerous.',
      ru: 'Не красивый пейзаж. Лес черпает силу из замкнутости и опасности.'
    },
    howToUse: {
      az: 'Personajı "başqa biri" kimi meşəyə daxil olacaq şəkildə qurun.',
      en: 'Set the character to enter transformed — desires and fears emerge changed.',
      ru: 'Настройте персонажа войти трансформированным.'
    },
    importance: {
      az: 'Cəmiyyətin qaydalarının askıya alındığı yeganə məkandır.',
      en: 'The only space where society\'s rules are suspended.',
      ru: 'Единственное место, где правила общества приостановлены.'
    },
    scenaristTip: {
      az: '"Meşə" xronotopuna saldığınız personaj rasional qərarlar verə bilmir.',
      en: 'A character in the Forest cannot make rational decisions.',
      ru: 'Персонаж в лесу не может принимать рациональные решения.'
    },
    filmExamples: ['Midsommar (2019)', 'Harry Potter — Yasaq Orman', 'A Midsummer Night\'s Dream', 'The Village (2004)']
  },
  {
    id: 'fabrika-istehsal', category: 'tematik', order: 9,
    color: '#C0392B', colorLight: '#FDEDEC', icon: '🏭',
    svgPath: '/assets/kronotop/fabrika-istehsal.svg',
    name: { az: 'Fabrik / İstehsal', en: 'Factory / Production', ru: 'Фабрика / Производство' },
    shortDesc: {
      az: 'Sosial hiyerarxiyanın personajın davranışlarını müəyyən etdiyi iqtisadi zaman-məkandır.',
      en: 'Economic time-space where social hierarchy determines character behavior.',
      ru: 'Экономическое время-пространство, где иерархия определяет поведение.'
    },
    whatItIs: {
      az: 'Personajın "insan" olaraq deyil, "işçi" olaraq var olduğu yerdir.',
      en: 'Where the character exists not as a human but as a worker.',
      ru: 'Место, где персонаж существует как работник, а не как человек.'
    },
    whatItIsNot: {
      az: 'Sadəcə iş yerinə aid hər sahne deyil. Güc münasibəti görünmürsə aktiv deyil.',
      en: 'Not every workplace scene. If power relation is invisible, not active.',
      ru: 'Не каждая рабочая сцена. Без властных отношений — неактивен.'
    },
    howToUse: {
      az: 'Personajın "insan" kimi göstərdiyi cəhdi sistemin necə məhv etdiyini göstərin.',
      en: 'Show how the system destroys the character\'s attempt to exist as a human.',
      ru: 'Покажите, как система уничтожает попытку быть человеком.'
    },
    importance: {
      az: 'Sinif çatışmalarını konkret məkan vasitəsilə göstərir.',
      en: 'Shows class conflict through concrete space rather than abstract ideology.',
      ru: 'Показывает классовые конфликты через конкретное пространство.'
    },
    scenaristTip: {
      az: 'Personajın hərəkət azadlığını məhdudlaşdırdıqca, "insan" kimi mövcudluq cəhdi dramatik aktə çevrilir.',
      en: 'As you restrict freedom, their attempt to exist as human becomes a dramatic act.',
      ru: 'По мере ограничения свободы попытка быть человеком становится драматическим актом.'
    },
    filmExamples: ['Modern Times (1936)', 'Norma Rae (1979)', 'Parasite (2019)', 'Sorry We Missed You (2019)']
  },
  {
    id: 'gemi-vagzal', category: 'tematik', order: 10,
    color: '#1ABC9C', colorLight: '#E8F8F5', icon: '🚢',
    svgPath: '/assets/kronotop/gemi-vagzal.svg',
    name: { az: 'Gəmi / Vağzal / Stansiya', en: 'Ship / Station / Terminal', ru: 'Корабль / Вокзал / Станция' },
    shortDesc: {
      az: 'Yol xronotopunun qapalı vasitə içinə sıxışdırılmış halı — "mikro-cəmiyyət"dir.',
      en: 'Road chronotope compressed into a closed vehicle — a micro-society.',
      ru: 'Хронотоп дороги в замкнутом пространстве — микро-общество.'
    },
    whatItIs: {
      az: 'Başlanğıc ilə son nöqtə arasındakı zaman möhürlüdür — çıxış yoxdur.',
      en: 'Time between start and end is sealed — no exit.',
      ru: 'Время между началом и концом запечатано — выхода нет.'
    },
    whatItIsNot: {
      az: 'Sadəcə nəqliyyat vasitəsinin göründüyü hər sahne deyil.',
      en: 'Not every vehicle scene. Forced togetherness activates this chronotope.',
      ru: 'Не каждая транспортная сцена. Активирует принудительное совместное присутствие.'
    },
    howToUse: {
      az: '"Çıxmaq istəyib çıxa bilməyən" personajları bir araya gətirin.',
      en: 'Bring together characters who want to leave but cannot.',
      ru: 'Сведите персонажей, которые хотят уйти, но не могут.'
    },
    importance: {
      az: 'Klassik gərginlik yaratma mexanizmi: qapalı məkan + rəngarəng insanlar.',
      en: 'Classic tension mechanism: closed space + diverse people.',
      ru: 'Классический механизм: замкнутость + разные люди = взрыв неизбежен.'
    },
    scenaristTip: {
      az: 'Hər personajın "çıxış planı" olsun — lakin heç vaxt işləməsin.',
      en: 'Each character should have an exit plan — but it should never work.',
      ru: 'У каждого должен быть план выхода — который никогда не сработает.'
    },
    filmExamples: ['Murder on the Orient Express', 'Life of Pi (2012)', 'Snowpiercer (2013)', 'Das Boot (1981)']
  },
  {
    id: 'zindan-hebsxana', category: 'tematik', order: 11,
    color: '#2C3E50', colorLight: '#EAF0FB', icon: '⛓️',
    svgPath: '/assets/kronotop/zindan-hebsxana.svg',
    name: { az: 'Zindan / Həbsxana', en: 'Dungeon / Prison', ru: 'Темница / Тюрьма' },
    shortDesc: {
      az: 'Zamanın "yapışqan" axdığı, fərdin iradəsinin əzildiyi məhkumiyet xronotopudur.',
      en: 'Captivity chronotope where time flows sticky, will is crushed.',
      ru: 'Хронотоп заключения — время течёт вязко, воля подавлена.'
    },
    whatItIs: {
      az: 'Çıxış yoxdur. Hər günü əvvəlki kimi axır. Lakin məğlubiyet içindən qəhrəmanlıq doğa bilər.',
      en: 'No exit. Every day flows like before. But heroism can be born from defeat.',
      ru: 'Выхода нет. Каждый день как предыдущий. Но из поражения может родиться героизм.'
    },
    whatItIsNot: {
      az: 'Həbsxana binasındakı hər sahne deyil. Azadlıq arzusu olmadan aktiv deyil.',
      en: 'Not every prison scene. Without desire for freedom, not fully active.',
      ru: 'Не каждая тюремная сцена. Без желания свободы — неактивен.'
    },
    howToUse: {
      az: 'Zamanın "yapışqanlığını" sahne müddəti ilə verin.',
      en: 'Give the stickiness of time through scene duration.',
      ru: 'Передайте вязкость времени через длительность сцены.'
    },
    importance: {
      az: 'Azadlığın dəyərini yalnız itirməklə anlaya bilmə temini fiziki məkanda mücəssəmləşdirir.',
      en: 'Embodies the theme that freedom\'s value is understood only through loss.',
      ru: 'Воплощает тему: ценность свободы познаётся через потерю.'
    },
    scenaristTip: {
      az: 'Personajın daxili azadlığını artırdıqca həbsxanenin fiziki ağırlığı daha güclü kontrast yaradır.',
      en: 'The more internal freedom, the more dramatic contrast the prison creates.',
      ru: 'Чем больше внутренней свободы, тем сильнее контраст.'
    },
    filmExamples: ['The Shawshank Redemption (1994)', 'A Prophet (2009)', '12 Years a Slave (2013)', 'The Count of Monte Cristo']
  },
  {
    id: 'meydan-karnaval', category: 'tematik', order: 12,
    color: '#F1C40F', colorLight: '#FEF9E7', icon: '🎪',
    svgPath: '/assets/kronotop/meydan-karnaval.svg',
    name: { az: 'Xalq Meydanı / Karnaval', en: 'Town Square / Carnival', ru: 'Площадь / Карнавал' },
    shortDesc: {
      az: 'Hiyerarxiyanın askıya alındığı, hamının bərabərləşdiyi "karnaval" məkanıdır.',
      en: 'The carnival space where hierarchy is suspended, everyone equalizes.',
      ru: 'Пространство карнавала — иерархия отменена, все уравниваются.'
    },
    whatItIs: {
      az: 'Cəmiyyətin normal qaydaları müvəqqəti askıya alınır. Bu müvəqqətilik ən güclü silahıdır.',
      en: 'Society\'s rules are temporarily suspended. This temporariness is the most powerful weapon.',
      ru: 'Нормы временно отменяются. Временность — сильнейшее оружие.'
    },
    whatItIsNot: {
      az: 'Sadəcə bayram sahnəsi deyil. Hiyerarxinin askıya alınmadığı hər kütləvi sahne bu deyil.',
      en: 'Not simply a holiday scene. Without hierarchy truly suspended, not this chronotope.',
      ru: 'Не просто праздник. Если иерархия не приостановлена — не этот хронотоп.'
    },
    howToUse: {
      az: 'Normal həyatda heç vaxt eyni məkanda olmayan personajları bir araya gətirin.',
      en: 'Bring together characters who would never meet. When carnival ends, old hierarchy returns.',
      ru: 'Сведите тех, кто никогда не встретился бы. Конец карнавала — удар.'
    },
    importance: {
      az: 'Toplumsal eleştirinin ən güclü anlatım biçimidir.',
      en: 'The most powerful form of social critique.',
      ru: 'Мощнейшая форма социальной критики.'
    },
    scenaristTip: {
      az: 'Karnaval sona çatanda hər şey köhnə yerinə qayıdır — bu qaçılmaz dönüşü vurğulayın.',
      en: 'When carnival ends, everything returns — emphasize this inevitable return.',
      ru: 'Когда карнавал кончается — всё возвращается. Подчеркните это.'
    },
    filmExamples: ['Joker (2019)', 'M*A*S*H (1970)', 'Cabaret (1972)', 'The Battle of Algiers (1966)']
  },
  {
    id: 'boyuk-seher', category: 'tematik', order: 13,
    color: '#34495E', colorLight: '#EBF5FB', icon: '🌆',
    svgPath: '/assets/kronotop/boyuk-seher.svg',
    name: { az: 'Böyük Şəhər / Metropol', en: 'The City / Metropolis', ru: 'Город / Метрополис' },
    shortDesc: {
      az: 'Məkanın sadəcə coğrafiya deyil; eşqin, sivilizasiyanın özü olduğu geniş zaman-məkan birligidir.',
      en: 'Where space is not just geography but love, civilization, and history itself.',
      ru: 'Где пространство — не география, а сама цивилизация.'
    },
    whatItIs: {
      az: 'Şəhər bir dekor deyil, bir personajdır.',
      en: 'The city is not a backdrop, it is a character.',
      ru: 'Город — не декорация, а персонаж.'
    },
    whatItIsNot: {
      az: 'Sadəcə "şəhərdə baş verən" hər sahne deyil.',
      en: 'Not every city scene. If the city\'s identity doesn\'t add meaning, not active.',
      ru: 'Не каждая городская сцена.'
    },
    howToUse: {
      az: 'Şəhərin tarixi qatlarını personajın daxili durumu ilə birləşdirin.',
      en: 'Connect the city\'s historical layers with the character\'s internal state.',
      ru: 'Свяжите исторические пласты города с внутренним состоянием персонажа.'
    },
    importance: {
      az: 'Şəhər personajın sosial kimliğini bərpa etdiyini ya da itirdiyini simvollaşdırır.',
      en: 'The city symbolizes recovery or loss of social identity.',
      ru: 'Город символизирует обретение или потерю социальной идентичности.'
    },
    scenaristTip: {
      az: 'Personajınızın şəhərlə "mübarizə"sini yazın — şəhər onu qəbul edirmi?',
      en: 'Write your character\'s struggle with the city — does the city accept them?',
      ru: 'Напишите борьбу персонажа с городом.'
    },
    filmExamples: ['Midnight in Paris (2011)', 'Lost in Translation (2003)', 'Bir Zamanlar Anadolu\'da (2011)', 'Roma (2018)']
  },
  {
    id: 'qebir-olum', category: 'tematik', order: 14,
    color: '#6C3483', colorLight: '#F5EEF8', icon: '⚰️',
    svgPath: '/assets/kronotop/qebir-olum.svg',
    name: { az: 'Qəbiristanlıq / Ölüm Məkanı', en: 'Cemetery / Death Space', ru: 'Кладбище / Пространство Смерти' },
    shortDesc: {
      az: 'Keçiş, yas, sembolik ölüm-yenidən doğuş — iki aləm arasındakı sınırda duran zaman-məkandır.',
      en: 'Transition, mourning, symbolic death-rebirth — at the border between two realms.',
      ru: 'Переход, траур, символическая смерть-возрождение — на границе двух миров.'
    },
    whatItIs: {
      az: 'Yaşayanların keçmişlə hesablaşdığı, öz sonluğu ilə üzləşdiyi məkandır.',
      en: 'Where the living reckon with the past and face their own end.',
      ru: 'Место, где живые встречаются с прошлым и своим концом.'
    },
    whatItIsNot: {
      az: 'Sadəcə "qorxu sahnəsi" deyil. Sosial ritüel kimi yazılan dəfn bu xronotop deyil.',
      en: 'Not simply a horror scene. A funeral written only as social ritual is not this.',
      ru: 'Не страшная сцена. Похороны как ритуал — не этот хронотоп.'
    },
    howToUse: {
      az: 'Personajı yalnız dəfn üçün deyil, öz həyatı haqqında həqiqəti kəşf etmək üçün göndərin.',
      en: 'Send the character to discover a truth about their own life, not just for a funeral.',
      ru: 'Отправляйте не ради похорон, а ради открытия истины.'
    },
    importance: {
      az: 'Ölümlülüğü dramın merkezine yerləşdirir — hər seçimi daha kəskin kılır.',
      en: 'Places mortality at center of drama — makes every choice sharper.',
      ru: 'Помещает смертность в центр драмы.'
    },
    scenaristTip: {
      az: 'Personajın sahnədən "dəyişmiş" çıxmasını sağlayın.',
      en: 'Ensure the character exits changed.',
      ru: 'Персонаж должен выйти изменённым.'
    },
    filmExamples: ['Hamlet — Yorick', 'Terms of Endearment', 'Steel Magnolias', 'The Third Man (1949)']
  },
  // MIKRO (5)
  {
    id: 'metbex-sufre', category: 'mikro', order: 15,
    color: '#E74C3C', colorLight: '#FDEDEC', icon: '🍽️',
    svgPath: '/assets/kronotop/metbex-sufre.svg',
    name: { az: 'Mətbəx / Süfrə', en: 'Kitchen / Table', ru: 'Кухня / Стол' },
    shortDesc: { az: 'Ailə içi gizli gərginliyin ən yoğun olduğu mikro-məkandır.', en: 'Micro-space where family intimacy and hidden tensions are most intense.', ru: 'Микро-пространство семейной близости и скрытого напряжения.' },
    whatItIs: { az: 'Yemək süfrəsi güclüdür: insanlar fiziki ehtiyac üçün gəlirlər, emosional mübarizə başlayır.', en: 'The dining table is powerful: people gather for physical need, but emotional battle begins.', ru: 'За столом собираются ради еды, но начинается эмоциональная битва.' },
    whatItIsNot: { az: 'Sadəcə yemək yeyilən hər sahne deyil.', en: 'Not every eating scene.', ru: 'Не каждая сцена еды.' },
    howToUse: { az: 'Fiziki hərəkəti emosional subtext\'in daşıyıcısı kimi istifadə edin.', en: 'Use physical actions around the table as carriers of emotional subtext.', ru: 'Используйте физические действия как носители подтекста.' },
    importance: { az: 'Ailənin içindəki güc münasibətlərini görünür kılır.', en: 'Makes visible power relations within the family.', ru: 'Делает видимыми властные отношения внутри семьи.' },
    scenaristTip: { az: 'Personajları fiziki olaraq "bir-birinə bağlı" tutun.', en: 'Keep characters physically bound — this inevitability increases tension.', ru: 'Держите персонажей физически связанными.' },
    filmExamples: ['American Beauty — süfrə', 'The Godfather', 'Kramer vs. Kramer (1979)', 'A Separation (2011)']
  },
  {
    id: 'pencere-balkon', category: 'mikro', order: 16,
    color: '#3498DB', colorLight: '#EBF5FB', icon: '🪟',
    svgPath: '/assets/kronotop/pencere-balkon.svg',
    name: { az: 'Pəncərə / Balkon', en: 'Window / Balcony', ru: 'Окно / Балкон' },
    shortDesc: { az: 'Xarici dünyaya nəzər yetirmə, gözləmə, tənhalıq — xaricdəki həyata qatıla bilməmə halı.', en: 'Observation, waiting, loneliness — inability to participate in outside life.', ru: 'Наблюдение, ожидание, одиночество — невозможность участвовать.' },
    whatItIs: { az: 'Pəncərə içəri ilə xarici arasında körpüdür. Personaj görür amma daxil ola bilmir.', en: 'The window bridges inside and outside. The character sees but cannot participate.', ru: 'Окно — мост. Персонаж видит, но не может участвовать.' },
    whatItIsNot: { az: 'Sadəcə mənzərəni göstərən hər pəncərə sahnəsi deyil.', en: 'Not every window scene showing a view.', ru: 'Не каждая сцена с видом из окна.' },
    howToUse: { az: 'Personajı "görən amma daxil ola bilməyən" mövqeydə tutun.', en: 'Keep the character seeing but unable to enter.', ru: 'Держите персонажа в позиции видящего, но не входящего.' },
    importance: { az: 'İzolasiyasını fiziksel məkandan vizual metaforaya çevirir.', en: 'Transforms isolation into visual metaphor using physical space.', ru: 'Превращает изоляцию в визуальную метафору.' },
    scenaristTip: { az: 'Pəncərənin arxasındakı həyatı canlı tutun.', en: 'Keep the life outside vivid.', ru: 'Держите жизнь за окном яркой.' },
    filmExamples: ['Rear Window (1954)', 'Portrait of a Lady on Fire (2019)', 'Room (2015)', 'The Hours (2002)']
  },
  {
    id: 'skaf-cekmece-sandiq', category: 'mikro', order: 17,
    color: '#795548', colorLight: '#EFEBE9', icon: '📦',
    svgPath: '/assets/kronotop/skaf-cekmece-sandiq.svg',
    name: { az: 'Şkaf / Siyirtmə / Sandıq', en: 'Cabinet / Drawer / Chest', ru: 'Шкаф / Ящик / Сундук' },
    shortDesc: { az: 'Keçmişin saxlandığı "yaddaş məkanları"dır. Açılması donmuş xatirenin bugünə sızmasıdır.', en: 'Memory spaces. Opening one is a frozen memory seeping into the present.', ru: 'Пространства памяти. Открыть — впустить прошлое в настоящее.' },
    whatItIs: { az: 'Fiziki olaraq kiçikdir lakin zaman baxımından nəhəngdir.', en: 'Physically small but temporally enormous.', ru: 'Физически мал, но огромен во времени.' },
    whatItIsNot: { az: 'Sadəcə əşyanın saxlandığı hər dolap sahnəsi deyil.', en: 'Not every storage scene. The object must carry dramatic weight.', ru: 'Не каждая сцена с хранилищем.' },
    howToUse: { az: 'Açılacaq dolabı uzun müddət gözlə tutun. Açılış anı dramatik zirvə olsun.', en: 'Keep the cabinet in suspense. The opening moment should be the peak.', ru: 'Держите шкаф в напряжении. Момент открытия — кульминация.' },
    importance: { az: 'Keçmişin fiziksel olaraq "var" olduğunu göstərən ən güclü alətdir.', en: 'The most powerful tool for showing the past physically exists.', ru: 'Мощнейший инструмент показа физического существования прошлого.' },
    scenaristTip: { az: 'İçindeki əşyanın sahibi artıq orada deyilsə — bu yaddaş xronotopunu daha yoğunlaşdırır.', en: 'If the owner is no longer there — dead, gone — this intensifies the memory chronotope.', ru: 'Если хозяин отсутствует — хронотоп усиливается.' },
    filmExamples: ['Blue Jasmine (2013)', 'Atonement (2007)', 'The Royal Tenenbaums', 'Amelie (2001)']
  },
  {
    id: 'kunc-siginacaq', category: 'mikro', order: 18,
    color: '#616161', colorLight: '#F5F5F5', icon: '🕯️',
    svgPath: '/assets/kronotop/kunc-siginacaq.svg',
    name: { az: 'Künc / Sığınacaq', en: 'Corner / Refuge', ru: 'Угол / Убежище' },
    shortDesc: { az: 'Personajın dünyadan soyutlandığı sığınma nöqtəsidir.', en: 'The withdrawal point where the character isolates from the world.', ru: 'Точка ухода от мира.' },
    whatItIs: { az: 'Küncü fiziki olaraq kiçik, psikoloji olaraq nəhəngdir. Gizlənmə özü bir itirafdir.', en: 'Physically small but psychologically enormous. Hiding itself is a confession.', ru: 'Физически мал, психологически огромен. Укрытие — признание.' },
    whatItIsNot: { az: 'Sadəcə küncde oturan hər personaj sahnəsi deyil.', en: 'Not every scene of a character sitting in a corner.', ru: 'Не каждая сцена в углу.' },
    howToUse: { az: 'Personajı küncə itələyin — amma onu orada tək buraxmayın.', en: 'Push into the corner — but don\'t leave them alone.', ru: 'Загоните в угол — но не оставляйте одного.' },
    importance: { az: 'Güvən və gizlənmə arzusunu fiziksel məkanda görünür kılır.', en: 'Makes visible the most fundamental human need — safety.', ru: 'Делает видимой потребность в безопасности.' },
    scenaristTip: { az: 'Personajın "gizlənmə sebebi" nə qədər açıq olursa, empatiya daha dərin qurulur.', en: 'The clearer the reason for hiding, the deeper the empathy.', ru: 'Чем яснее причина — тем глубже сочувствие.' },
    filmExamples: ['The 400 Blows (1959)', 'A Beautiful Mind (2001)', 'Black Swan (2010)', 'Boyhood (2014)']
  },
  {
    id: 'zirzemi-tavan', category: 'mikro', order: 19,
    color: '#4A235A', colorLight: '#F5EEF8', icon: '🏚️',
    svgPath: '/assets/kronotop/zirzemi-tavan.svg',
    name: { az: 'Zirzəmi / Tavan Arası', en: 'Basement / Attic', ru: 'Подвал / Чердак' },
    shortDesc: { az: 'Bachelard\'a görə "gizli psikoloji həyatın orqanları". Zirzəmi = qorxular; Tavan = xəyal.', en: 'Bachelard\'s "organs of secret psychological life". Basement = fears; Attic = dreams.', ru: 'По Башляру — "органы тайной психологической жизни".' },
    whatItIs: { az: 'Zirzəmi: qaranlıq tərəf, bastırılmış xatirələr. Tavan arası: tənhalıq, düş qurma.', en: 'Basement: dark side, repressed memories. Attic: solitude, dreaming.', ru: 'Подвал: тёмная сторона. Чердак: одиночество, мечтания.' },
    whatItIsNot: { az: 'Sadəcə evin alt/üst mərtəbəsi olan hər sahne deyil.', en: 'Not every basement or attic scene. Without symbolism, not active.', ru: 'Не каждая сцена в подвале. Без символизма — неактивен.' },
    howToUse: { az: 'Personajın psixoloji durumunu fiziki məkanın oxşarlığıyla qurun.', en: 'Build psychological state through the space. Darkness = repressed memory.', ru: 'Стройте психологическое состояние через пространство.' },
    importance: { az: 'Bilinçaltını fiziksel məkan vasitəsilə göstərməyin ən əlçatanlı üsuludur.', en: 'The most accessible way to show the subconscious through physical space.', ru: 'Доступнейший способ показать подсознание.' },
    scenaristTip: { az: 'Personajın bu məkana GİRMƏDİĞİ sahneler də dramatik dəyər daşıyır.', en: 'Scenes where the character does NOT enter also carry dramatic value.', ru: 'Сцены, где персонаж НЕ входит, тоже важны.' },
    filmExamples: ['Get Out (2017)', 'Parasite (2019)', 'Jane Eyre — tavan arası', 'The Conjuring (2013)']
  },
  // MUASIR (9)
  {
    id: 'xestexana-klinika', category: 'muasir', order: 20,
    color: '#138D75', colorLight: '#E8F8F5', icon: '🏥',
    svgPath: '/assets/kronotop/xestexana-klinika.svg',
    name: { az: 'Xəstəxana / Klinika', en: 'Hospital / Clinic', ru: 'Больница / Клиника' },
    shortDesc: { az: 'Zaman askıya alınır, xarici dünyadan kopuqluk var, ölüm-həyat sınırı fiziki olaraq qurulmuşdur.', en: 'Time is suspended, disconnected from outside, life-death boundary is physically constructed.', ru: 'Время приостановлено, граница жизни и смерти выстроена физически.' },
    whatItIs: { az: 'Xəstəxana zamanı dondurur — xaricde həyat davam edir amma burada hər şey dayandı.', en: 'The hospital freezes time — outside life continues but everything here has stopped.', ru: 'Больница замораживает время.' },
    whatItIsNot: { az: 'Sadəcə həkim dialoqlarının baş verdiyi hər tibbi sahne deyil.', en: 'Not every medical scene with doctor dialogues.', ru: 'Не каждая медицинская сцена.' },
    howToUse: { az: 'Personajın pəncərəsindən bayırı izlədiyi anı dramatik kontrast üçün istifadə edin.', en: 'Use watching outside from the hospital window for dramatic contrast.', ru: 'Используйте наблюдение из окна для контраста.' },
    importance: { az: 'Ölümlülüğü somut şəkildə dramın merkezine yerləşdirir.', en: 'Places mortality at center concretely, not abstractly.', ru: 'Помещает смертность в центр конкретно.' },
    scenaristTip: { az: 'Ən güclü an gəlmə ya getmə deyil — gözləmə anıdır.', en: 'The most powerful moment is not arrival or departure — it is waiting.', ru: 'Самый сильный момент — ожидание.' },
    filmExamples: ['One Flew Over the Cuckoo\'s Nest (1975)', 'Wit (2001)', 'The Diving Bell and the Butterfly (2007)', 'Awakenings (1990)']
  },
  {
    id: 'mekteb-universitet', category: 'muasir', order: 21,
    color: '#2E86C1', colorLight: '#EAF4FB', icon: '🏫',
    svgPath: '/assets/kronotop/mekteb-universitet.svg',
    name: { az: 'Məktəb / Universitet', en: 'School / University', ru: 'Школа / Университет' },
    shortDesc: { az: 'Böyümənin, kimlik inşasının ən şiddətli yaşandığı zaman-məkandır.', en: 'Where growth and identity construction are most intensely experienced.', ru: 'Место интенсивнейшего взросления и строительства идентичности.' },
    whatItIs: { az: 'Məktəb eyni anda həm qurmaq, həm yıxmaq üçün var.', en: 'School simultaneously builds and destroys.', ru: 'Школа одновременно строит и разрушает.' },
    whatItIsNot: { az: 'Sadəcə "sinif sahnəsi" deyil.', en: 'Not simply a classroom scene.', ru: 'Не просто учебная сцена.' },
    howToUse: { az: 'Sosial hiyerarxiyanı dəhlizlərə, yemək salonuna gömün.', en: 'Embed social hierarchy in corridors and the cafeteria.', ru: 'Вложите иерархию в коридоры и столовую.' },
    importance: { az: 'Kimlik inşasının ən şiddətli gerçekleşdiyi yerdir.', en: 'The most intense site of identity construction.', ru: 'Самое интенсивное место строительства идентичности.' },
    scenaristTip: { az: 'Gücü müəllim-şagird diyalogunda deyil, şagirdlər arası sessiz hiyerarxi savaşındadır.', en: 'Power is in silent hierarchy battles between students, not teacher-student dialogue.', ru: 'Сила — в молчаливых битвах между учениками.' },
    filmExamples: ['Dead Poets Society (1989)', 'Elephant (2003)', 'Boyhood (2014)', 'Whiplash (2014)']
  },
  {
    id: 'bag-villa', category: 'muasir', order: 22,
    color: '#1D8348', colorLight: '#E9F7EF', icon: '🌿',
    svgPath: '/assets/kronotop/bag-villa.svg',
    name: { az: 'Bağ / Villa', en: 'Garden / Villa', ru: 'Сад / Вилла' },
    shortDesc: { az: 'Korunaklı amma qapalı dünya — aristokratik xronotopun müasir versiyası.', en: 'Sheltered but closed world — the modern aristocratic chronotope.', ru: 'Защищённый, но замкнутый мир.' },
    whatItIs: { az: 'Bağ divarları ayrıcalığı fiziksel olaraq möhürlər. Qorunma eyni zamanda həbsdir.', en: 'Garden walls seal privilege. Protection is also prison.', ru: 'Стены запечатывают привилегию. Защита — заключение.' },
    whatItIsNot: { az: 'Sadəcə gözəl bağ sahnəsi deyil.', en: 'Not simply a beautiful garden scene.', ru: 'Не просто красивый сад.' },
    howToUse: { az: 'Bağın dışındaki dünyayı görünür amma erişilmez kılın.', en: 'Make outside world visible but unreachable.', ru: 'Сделайте внешний мир видимым, но недостижимым.' },
    importance: { az: 'Ayrıcalığın nə qiymətə sahib olduğunu görünür kılar.', en: 'Makes visible the price of privilege.', ru: 'Делает видимой цену привилегии.' },
    scenaristTip: { az: 'Bağın "mükəmməlliyi"ni qırmaq üçün içinə girecek bir element planlaşdırın.', en: 'Plan an element to enter and break the garden\'s perfection.', ru: 'Запланируйте элемент, который нарушит совершенство.' },
    filmExamples: ['The Talented Mr. Ripley (1999)', 'Call Me by Your Name (2017)', 'Gosford Park (2001)', 'Garden of the Finzi-Continis (1970)']
  },
  {
    id: 'yol-kenari-kafe', category: 'muasir', order: 23,
    color: '#D35400', colorLight: '#FBEEE6', icon: '☕',
    svgPath: '/assets/kronotop/yol-kenari-kafe.svg',
    name: { az: 'Yol Kənarı Kafesi / Motel', en: 'Roadside Diner / Motel', ru: 'Придорожное Кафе / Мотель' },
    shortDesc: { az: 'Amerikan müstəqil kinomasının DNT\'si. Müvəqqəti, anonim, lakin həyati qarşılaşmalar.', en: 'DNA of American independent cinema. Temporary, anonymous, but life-defining.', ru: 'ДНК американского независимого кино.' },
    whatItIs: { az: 'Yol xronotopunun spesifik alt növü. Müvəqqətilik həyati kəsişmələri mümkün kılır.', en: 'Everyone here is temporary. But temporariness enables life-defining encounters.', ru: 'Все временны. Но временность делает возможными судьбоносные встречи.' },
    whatItIsNot: { az: 'Sadəcə "restoran sahnəsi" deyil.', en: 'Not simply a restaurant scene.', ru: 'Не просто ресторанная сцена.' },
    howToUse: { az: 'Personajları "keçici" olaraq bir araya gətirin — amma bir şeyi sonsuza dəyişdirin.', en: 'Bring characters together as temporary — but change something forever.', ru: 'Сведите как временных — но измените что-то навсегда.' },
    importance: { az: 'Hər kəsin anonim, hər kəsin bərabər — salon xronotopunun tam tersidir.', en: 'Everyone anonymous, everyone equal — exact opposite of the salon.', ru: 'Все анонимны, все равны — полная противоположность салону.' },
    scenaristTip: { az: 'Neon işığını, köhnə musiqi qurusunu personajın daxili durumunun aynası kimi istifadə edin.', en: 'Use neon light, old jukebox as mirrors of characters\' inner states.', ru: 'Используйте неон, автомат как зеркала внутреннего состояния.' },
    filmExamples: ['Pulp Fiction (1994)', 'No Country for Old Men (2007)', 'Bagdad Cafe (1987)', 'Twin Peaks — Cherry Pie']
  },
  {
    id: 'reqemsal-virtual', category: 'muasir', order: 24,
    color: '#1A5276', colorLight: '#EAF2FF', icon: '💻',
    svgPath: '/assets/kronotop/reqemsal-virtual.svg',
    name: { az: 'Rəqəmsal / Virtual Məkan', en: 'Digital / Virtual Space', ru: 'Цифровое / Виртуальное Пространство' },
    shortDesc: { az: '21. əsrin ən yeni xronotopudur. Fiziki məkanın qaydaları artıq geçersizdir.', en: 'The newest chronotope. Physical space rules no longer apply.', ru: 'Новейший хронотоп. Правила физического пространства не действуют.' },
    whatItIs: { az: 'Fiziki məkan qaydaları askıya alınmışdır — anonim, çoxqatlı, zaman çevikdir.', en: 'Physical space rules suspended — anonymous, multilayered, time is flexible.', ru: 'Правила отменены — анонимность, многослойность, гибкость времени.' },
    whatItIsNot: { az: 'Sadəcə "kompüter sahnəsi" deyil.', en: 'Not simply a computer scene.', ru: 'Не просто компьютерная сцена.' },
    howToUse: { az: 'Virtual kimliylə gerçek kimlik arasındakı uçurumu dramatik motor kimi istifadə edin.', en: 'Use the gap between virtual and real identity as dramatic engine.', ru: 'Используйте разрыв между виртуальной и реальной идентичностью.' },
    importance: { az: 'Müasir alienasiyonun, kimlik sıvışmasının ən müasir ifadə məkanıdır.', en: 'The most contemporary expression space for alienation and identity fluidity.', ru: 'Современнейшее пространство для отчуждения.' },
    scenaristTip: { az: 'Virtual məkanı gerçek həyatın "tərsinə çevrilmiş aynası" kimi qurun.', en: 'Build virtual space as the inverted mirror of real life.', ru: 'Стройте как перевёрнутое зеркало реальности.' },
    filmExamples: ['The Matrix (1999)', 'Her (2013)', 'Ready Player One (2018)', 'Black Mirror']
  },
  {
    id: 'hava-limani-serhad', category: 'muasir', order: 25,
    color: '#717D7E', colorLight: '#F2F3F4', icon: '✈️',
    svgPath: '/assets/kronotop/hava-limani-serhad.svg',
    name: { az: 'Hava Limanı / Sərhəd', en: 'Airport / Border', ru: 'Аэропорт / Граница' },
    shortDesc: { az: 'Müasir eşik xronotopudur. Kimlik sorğulanır, müvəqqətilik maksimaldır.', en: 'The modern threshold. Identity is questioned, maximum temporariness.', ru: 'Современный порог. Идентичность под вопросом.' },
    whatItIs: { az: 'Eşik xronotopunun 21. əsr versiyasıdır. Pasaport kontrolu kimlik sorğusunun ritualıdır.', en: '21st century threshold. Passport control is the ritual of identity questioning.', ru: '21-я версия порога. Паспортный контроль — ритуал.' },
    whatItIsNot: { az: 'Sadəcə uçuş sahnəsi deyil.', en: 'Not simply a flight scene.', ru: 'Не просто сцена в аэропорту.' },
    howToUse: { az: 'Gözləmə anını "kim olduğu" sualına dramatik cavab kimi istifadə edin.', en: 'Use waiting as a dramatic answer to "who are you?"', ru: 'Используйте ожидание как ответ на "кто ты?"' },
    importance: { az: 'Müasir insanın hüviyyət böhranını ən kəskin şəkildə temsil edir.', en: 'Most sharply represents modern identity crisis.', ru: 'Наиболее остро представляет кризис идентичности.' },
    scenaristTip: { az: 'Ən dramatik an qapıda deyil — son addımda ya da geri döndüyü andadır.', en: 'Most dramatic moment is in the last step or turning back.', ru: 'Самый момент — последний шаг или поворот назад.' },
    filmExamples: ['Lost in Translation (2003)', 'The Terminal (2004)', 'Arrival (2016)', 'Casablanca (1942)']
  },
  {
    id: 'banliyo-kenar', category: 'muasir', order: 26,
    color: '#A04000', colorLight: '#FBEEE6', icon: '🏡',
    svgPath: '/assets/kronotop/banliyo-kenar.svg',
    name: { az: 'Qəsəbə / Kənar Məhəllə', en: 'Suburb / Periphery', ru: 'Пригород / Окраина' },
    shortDesc: { az: 'Kənd xronotopunun müasir versiyası. Eyni evlər, eyni həyatlar, eyni boğuculuq.', en: 'Modern provincial chronotope. Same houses, same lives, same suffocation.', ru: 'Современная провинция. Одинаковые дома, то же удушье.' },
    whatItIs: { az: 'Nə tam şəhər, nə tam kənd — bu "arada qalma" dramın özüdür.', en: 'Neither city nor village — this in-betweenness is the drama itself.', ru: 'Ни город, ни деревня — "между" и есть драма.' },
    whatItIsNot: { az: 'Sadəcə şəhər kənarında baş verən hər sahne deyil.', en: 'Not every suburban scene.', ru: 'Не каждая пригородная сцена.' },
    howToUse: { az: 'Həm şəhərə, həm kəndə aidolmamasını kimlik böhranının ifadəsi kimi istifadə edin.', en: 'Use belonging to neither as the physical expression of identity crisis.', ru: 'Используйте непринадлежность как выражение кризиса.' },
    importance: { az: 'Siniflər arasında sıxışmış müasir insanın durumunu mücəssəmləşdirir.', en: 'Embodies the modern person squeezed between classes.', ru: 'Воплощает состояние человека между классами.' },
    scenaristTip: { az: 'Personajın evi digerlərinden necə ayrılır ya da ayrılmır?', en: 'How does the character\'s house differ from others?', ru: 'Как дом персонажа отличается от других?' },
    filmExamples: ['American Beauty (1999)', 'Edward Scissorhands (1990)', 'Revolutionary Road (2008)', 'The Ice Storm (1997)']
  },
  {
    id: 'muharibe-cebhesi', category: 'muasir', order: 27,
    color: '#922B21', colorLight: '#FDEDEC', icon: '⚔️',
    svgPath: '/assets/kronotop/muharibe-cebhesi.svg',
    name: { az: 'Müharibə Cəbhəsi', en: 'War Front / Battlefield', ru: 'Линия Фронта / Поле Боя' },
    shortDesc: { az: 'Zaman sıxışır — hər an son an ola bilər. Ölüm daima hazırda.', en: 'Time compresses — every moment can be the last. Death always present.', ru: 'Время сжимается — каждый момент может быть последним.' },
    whatItIs: { az: 'Cəbhədə zaman adi ölçülə deyil. Hər seçim ölüm-həyat sınırında baş verir.', en: 'At the front, time is not measured normally. Every choice on life-death border.', ru: 'На фронте время не измеряется обычно.' },
    whatItIsNot: { az: 'Sadəcə "döyüş sahnəsi" deyil. Aksionsuz cəbhə sahneleri ən güclü ifadədir.', en: 'Not simply action. Front scenes without action are the most powerful.', ru: 'Не просто боевая сцена. Тихие фронтовые сцены — самое мощное.' },
    howToUse: { az: 'Cəbhədəki sakitliyi döyüşdən daha çox istifadə edin.', en: 'Use the quiet of the front more than battle.', ru: 'Используйте тишину фронта больше, чем бой.' },
    importance: { az: 'Zaman sıkışması içinde seçimlər insanı tam olaraq kim olduğunu ortaya çıxarır.', en: 'Choices in compressed time reveal exactly who a person is.', ru: 'Выборы в сжатом времени раскрывают, кто человек на самом деле.' },
    scenaristTip: { az: 'Cəbhəni "qəhrəmanlıq yeri" deyil, "insanlığın sınandığı yer" kimi qurun.', en: 'Build the front as where humanity is tested, not heroism.', ru: 'Стройте фронт как место испытания человечности.' },
    filmExamples: ['1917 (2019)', 'Saving Private Ryan (1998)', 'All Quiet on the Western Front (2022)', 'Come and See (1985)']
  },
  {
    id: 'deniz-okean', category: 'muasir', order: 28,
    color: '#1B4F72', colorLight: '#D6EAF8', icon: '🌊',
    svgPath: '/assets/kronotop/deniz-okean.svg',
    name: { az: 'Dəniz / Okean', en: 'Sea / Ocean', ru: 'Море / Океан' },
    shortDesc: { az: 'Sonsuzluq, itib-batma, azadlıq ya da dəhşət — sınırların yox olduğu zaman-məkandır.', en: 'Infinity, disappearance, freedom or terror — where boundaries dissolve.', ru: 'Бесконечность, свобода или ужас — границы растворяются.' },
    whatItIs: { az: 'Dəniz ənənəvi qaydaları rədd edir — nə divarlar, nə yollar. Personaj sonsuzluqla üzləşir.', en: 'The sea refuses conventional rules — no walls, no roads. The character faces infinity.', ru: 'Море отказывается от правил. Персонаж лицом к лицу с бесконечностью.' },
    whatItIsNot: { az: 'Sadəcə "dənizdə baş verən" hər sahne deyil.', en: 'Not every sea scene.', ru: 'Не каждая морская сцена.' },
    howToUse: { az: 'Personajı dənizin önünə qoyun — bir seçim verin: irəliyə mi, geriyə mi?', en: 'Put the character before the sea — give a choice: forward or back?', ru: 'Поставьте перед морем — дайте выбор: вперёд или назад?' },
    importance: { az: 'Ən gücsüz — lakin eyni zamanda ən azad — məkandır. Paradoks dramatik gücün mənbəyidir.', en: 'Most powerless yet most free. This paradox is the source of dramatic power.', ru: 'Наибольшая беспомощность и свобода. Парадокс — источник силы.' },
    scenaristTip: { az: 'Dalgaların ritmi, suyun rəngi — hamısı personajın emosional durumunu əks etdirir.', en: 'Rhythm of waves, color of water — all reflect the character\'s emotional state.', ru: 'Ритм волн, цвет воды — всё отражает эмоциональное состояние.' },
    filmExamples: ['The Old Man and the Sea', 'Cast Away (2000)', 'Life of Pi (2012)', 'The Lighthouse (2019)']
  },
];
