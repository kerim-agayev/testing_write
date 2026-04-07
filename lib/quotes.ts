export const INSPIRATIONAL_QUOTES = [
  {
    text: { az: 'Hər şah əsər tək bir sətirdən başlayır.', en: 'Every masterpiece begins with a single line.', ru: 'Каждый шедевр начинается с одной строки.' },
    author: 'ScriptFlow',
  },
  {
    text: { az: 'Söz — insanın ən güclü silahıdır.', en: 'The word is humanity\'s most powerful weapon.', ru: 'Слово — самое мощное оружие человека.' },
    author: 'Hüseyn Cavid',
  },
  {
    text: { az: 'Ürəyini kağıza tök, kağız hər şeyi daşıyar.', en: 'Pour your heart onto paper; paper carries everything.', ru: 'Излей душу на бумагу — бумага всё выдержит.' },
    author: 'Mikayıl Müşfiq',
  },
  {
    text: { az: 'Yazmaq — özünü tapmaq deməkdir.', en: 'To write is to find oneself.', ru: 'Писать — значит найти себя.' },
    author: 'Nazım Hikmet',
  },
  {
    text: { az: 'Hər film bir xəyal idi — sonra biri onu yazdı.', en: 'Every film was once a dream — then someone wrote it.', ru: 'Каждый фильм был мечтой — потом кто-то написал его.' },
    author: 'Federico Fellini',
  },
  {
    text: { az: 'Gözəl bir həyat yaşamaq istəyirsənsə, onu əvvəlcə yaz.', en: 'If you want to live a beautiful life, first write it.', ru: 'Если хочешь прожить прекрасную жизнь — сначала напиши её.' },
    author: 'Rainer Maria Rilke',
  },
  {
    text: { az: 'Ssenari yazarı dialoq yazmır — o həyat yazır.', en: 'A screenwriter does not write dialogue — they write life.', ru: 'Сценарист пишет не диалог — он пишет жизнь.' },
    author: 'Ingmar Bergman',
  },
  {
    text: { az: 'Ən uzun yolculuq ilk cümlədir.', en: 'The longest journey is the first sentence.', ru: 'Самый долгий путь — первое предложение.' },
    author: 'Əliağa Vahid',
  },
  {
    text: { az: 'Kağız səbrsizdir — o, yazılmağı gözləyir.', en: 'Paper is impatient — it waits to be written.', ru: 'Бумага нетерпелива — она ждёт, чтобы её написали.' },
    author: 'Cemal Süreya',
  },
  {
    text: { az: 'Personajın ürəyi senaristin ürəyidir.', en: "The character's heart is the screenwriter's heart.", ru: 'Сердце персонажа — это сердце сценариста.' },
    author: 'ScriptFlow',
  },
] as const;

export type Quote = typeof INSPIRATIONAL_QUOTES[number];

export function getRandomQuote(): Quote {
  return INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
}
