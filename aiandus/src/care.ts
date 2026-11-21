import { addDays, lunarPeriod, validDay, type Day } from './calendar.ts';

type Stage = { title: string; advice: string };
type Guide = {
  stages: Stage[];
  sources: { title: string; url: string }[];
  containerInterval?: readonly [number, number];
};

const extension = 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/';
const seedlings = { title: 'Ettekasvatuse juhis', url: `${extension}starting-seeds-indoors` };
const tomatoRhs = 'https://www.rhs.org.uk/vegetables/tomatoes/grow-your-own';
const tomatoMetk = 'https://metk.agri.ee/uudised/tomatid-vajavad-tahelepanu-ja-hoolt';
export const CARE_TRADITION = 'https://www.almanac.com/farming-moon';
export const CARE_RESEARCH = 'https://doi.org/10.3390/agronomy10070955';

const seedStage: Stage = {
  title: 'Külv ja tärkamine',
  advice: 'Kasuta külvisubstraati ning hoia see ühtlaselt niiske. Esmalt oota, kuni seemikul on mitu pärislehte.',
};
const seedlingStage: Stage = {
  title: 'Noortaimed',
  advice: 'Kui pärislehed on arenenud, vaata, kas kasvusubstraadis on juba väetist. Vajadusel kasuta noortaimedele sobivat väetist pakendi juhise järgi.',
};

export const CARE: Record<string, Guide> = {
  tomat: {
    stages: [seedStage, seedlingStage,
      { title: 'Pärast istutamist', advice: 'Kasvuhoonepeenras soovitab Maaelu Teadmuskeskus hinnata väetamisvajadust umbes kaks nädalat pärast istutamist. Arvesta peenra ettevalmistuse ja taime kasvuga.' },
      { title: 'Viljade kasv ja saagiaeg', advice: 'Potitomatil alusta kaaliumirikka vedelväetisega, kui esimesed viljad hakkavad suurenema. Orienteeruv vahe on 10–14 päeva. Peenras lähtu mulla viljakusest ja taime seisundist. Hilissuvel hinda lisaväetamise vajadust kasvu ning juba valmivate viljade järgi.' },
    ],
    sources: [seedlings, { title: 'Maaelu Teadmuskeskuse tomatijuhis', url: tomatoMetk }, { title: 'RHS-i tomatijuhis', url: tomatoRhs }],
    containerInterval: [10, 14],
  },
  kurk: {
    stages: [seedStage, seedlingStage,
      { title: 'Pärast istutamist', advice: 'Potikurgi kasvuperioodil sobib üldine vedelväetis umbes iga 10–14 päeva tagant. Viljakas peenras võib lisaväetist tarvis minna üksnes toitainete puuduse korral.' },
      { title: 'Õitsemine ja saagiaeg', advice: 'Õitsemise alguses vaheta potikurgil üldväetis kaaliumirikkama vedelväetise vastu. Arvesta pakendil märgitud sagedust ja hoia kasvusubstraat ühtlaselt niiske.' },
    ],
    sources: [seedlings, { title: 'RHS-i kurgijuhis', url: 'https://www.rhs.org.uk/vegetables/cucumbers/grow-your-own' }],
    containerInterval: [10, 14],
  },
  redis: {
    stages: [
      { title: 'Külv', advice: 'Valmista ette kobe peenar. Vajadusel paranda mulda küpse kompostiga ja lähtu mulla toitainesisaldusest.' },
      { title: 'Tärkamine ja juurika kasv', advice: 'Harvenda tihedad taimed ja hoia muld ühtlaselt niiske. Lühikese kasvutsükli tõttu lähtu lisaväetamisel mulla vajadusest.' },
      { title: 'Saagiaeg', advice: 'Korista redised siis, kui juurikad on sordile iseloomuliku suurusega.' },
    ],
    sources: [{ title: 'Minnesota Ülikooli redisejuhis', url: `${extension}growing-radishes` }],
  },
  porgand: {
    stages: [
      { title: 'Külv', advice: 'Kasvata porgandit kobedas peenras. Vajalik põhiväetis vali mullaanalüüsi järgi. Värske sõnnik soodustab juurikate harunemist.' },
      { title: 'Tärkamine ja juurika kasv', advice: 'Harvenda tihedad taimed ja hoia mullaniiskus ühtlane. Lisaväetamise vajadus sõltub mulla toitainetest.' },
      { title: 'Saagiaeg', advice: 'Korista siis, kui juurikas on kasutamiseks paraja suurusega.' },
    ],
    sources: [{ title: 'Minnesota Ülikooli porgandijuhis', url: `${extension}growing-carrots-and-parsnips` }],
  },
  hernes: {
    stages: [
      { title: 'Külv', advice: 'Valmista peenar väetamiseks ette mullaanalüüsi põhjal. Arvesta, et hernes saab osa lämmastikust juurtel elavate mügarbakterite abil.' },
      { title: 'Kasv ja õitsemine', advice: 'Lähtu lisaväetamisel mulla toitainesisaldusest. Kõrgemad sordid vajavad tuge. Õitsemise ja kaunade arengu ajal jälgi mullaniiskust.' },
      { title: 'Saagiaeg', advice: 'Korja kaunu sordi järgi sobivas küpsuses ja vaata taimi sageli üle.' },
    ],
    sources: [{ title: 'Minnesota Ülikooli hernejuhis', url: `${extension}growing-peas` }],
  },
  salat: {
    stages: [
      { title: 'Külv', advice: 'Valmista ette viljakas peenar ja vali põhiväetis mullaanalüüsi järgi.' },
      { title: 'Lehtede kasv', advice: 'Hoia mulla pind ühtlaselt niiske. Hinda lisaväetamise vajadust mulla viljakuse ja lehtede kasvu põhjal.' },
      { title: 'Saagiaeg', advice: 'Lehtsalatilt saab kasvuperioodi jooksul korduvalt lehti noppida.' },
    ],
    sources: [{ title: 'Minnesota Ülikooli salatijuhis', url: `${extension}growing-lettuce-endive-and-radicchio` }],
  },
};

export const TOMATO_TOPPING: Stage = {
  title: 'Tomati ladva eemaldamine',
  advice: 'See juhis on kõrgekasvulisele, toestatud tomatile. Kui taim jõuab toe tippu või sobiv arv viljakobaraid on moodustunud, eemalda peavarre kasvutipp, jättes viimase kobara kohale kaks lehte. RHS-i rusikareegel on kasvuhoones kuni seitse ja avamaal kuni neli kobarat. Lähtu kasvukohast, sordist ja hooaja lõpust. Madalal põõsastomatil jäta peavõrse latv üldjuhul alles.',
};

export const CARE_TASKS = {
  topping: { label: 'Tomati ladva eemaldamine', period: 'waning', advice: 'Rakendame siin pärimuslikku kärpimisreeglit. Vali päev siis, kui kõrgekasvuline tomat on ladva eemaldamiseks valmis.' },
  thinning: { label: 'Harvendamine', period: 'waning', advice: 'Pärimuses seostatakse harvendamist kahaneva kuuga. Harvenda, kui tõusmed kasvavad liiga tihedalt.' },
  weeding: { label: 'Rohimine', period: 'waning', advice: 'Pärimuses seostatakse rohimist kahaneva kuuga. Lähtu umbrohu kasvust ja peenra olukorrast.' },
  transplanting: { label: 'Ümberistutamine', period: 'waxing', advice: 'Pärimuses seostatakse ümberistutamist kasvava kuuga. Õue istutamisel arvesta taime karastamise ja öökülmaohuga.' },
} as const;

export type CareTask = keyof typeof CARE_TASKS;

export function careMoonDays(task: CareTask, start: Day) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(start, index);
    const period = lunarPeriod(day);
    return { day, period, matches: period === CARE_TASKS[task].period };
  });
}

export function nextFeedingRange(cropId: string, lastFed: Day) {
  const interval = CARE[cropId]?.containerInterval;
  if (!interval || !validDay(lastFed)) return undefined;
  return { start: addDays(lastFed, interval[0]), end: addDays(lastFed, interval[1]) };
}
