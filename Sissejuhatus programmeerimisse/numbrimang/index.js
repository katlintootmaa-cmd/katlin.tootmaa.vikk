import { readFile, writeFile } from "node:fs/promises";

const tulemusteFail = new URL("./edetabel.json", import.meta.url);
let edetabel = [];

try {
  const andmed = JSON.parse(await readFile(tulemusteFail, "utf8"));
  const vanaVorming = Array.isArray(andmed);
  const tulemused = vanaVorming ? andmed : andmed?.versioon === 2 ? andmed.tulemused : null;
  if (!Array.isArray(tulemused) || !tulemused.every((rida) =>
    typeof rida?.nimi === "string" && Number.isInteger(rida.skoor)
  )) {
    throw new Error("Vigane edetabeli vorming.");
  }
  // Teisenda vanad pakkumiste arvud või miinuspunktid 10 punkti skaalale.
  edetabel = tulemused.map((rida) => ({
    nimi: rida.nimi,
    skoor: vanaVorming ? 10 + (rida.skoor > 0 ? 1 - rida.skoor : rida.skoor) : rida.skoor,
  }));
} catch (viga) {
  if (viga.code !== "ENOENT") {
    console.error("Edetabeli lugemine ebaõnnestus. Faili ei kirjutata üle.");
    process.exit(1);
  }
}

console.log("🎮 TERE TULEMAST ARVAMISMÄNGU!");
let nimi = "";
while (!nimi) {
  const sisend = prompt("Mis on mängija nimi?");
  if (sisend === null) process.exit(0);
  nimi = sisend.trim();
  if (!nimi) console.log("Palun sisesta oma nimi.");
}

console.log(`Tere, ${nimi}! 😎`);
console.log("Iga voor algab 10 punktiga. Vale pakkumine võtab 1 punkti maha.");
let koguskoor = 0;

mang: while (true) {
  const salajaneNumber = Math.floor(Math.random() * 10) + 1;
  let skoor = 10;
  console.log("\nArva ära number 1 kuni 10! (Väljumiseks q.)");

  while (true) {
    const sisend = prompt("Sisesta number:");
    if (sisend === null || sisend.trim().toLowerCase() === "q") break mang;

    const pakkumine = Number(sisend);
    if (sisend.trim() === "" || !Number.isInteger(pakkumine) || pakkumine < 1 || pakkumine > 10) {
      console.log("Sisesta täisarv 1 kuni 10.");
      continue;
    }

    if (pakkumine !== salajaneNumber) {
      skoor--;
      console.log("❌ Vale vastus!");
      console.log(pakkumine < salajaneNumber
        ? "⬆️ Salajane number on SUUREM!"
        : "⬇️ Salajane number on VÄIKSEM!");
      continue;
    }

    koguskoor += skoor;
    console.log(`🎉 ÕIGE! Said ${skoor} punkti!`);
    console.log(`🏆 Sinu koguskoor: ${koguskoor}`);

    const varasem = edetabel.find((rida) => rida.nimi.toLowerCase() === nimi.toLowerCase());
    if (varasem) varasem.skoor = Math.max(varasem.skoor, koguskoor);
    else edetabel.push({ nimi, skoor: koguskoor });

    try {
      await writeFile(tulemusteFail, JSON.stringify({ versioon: 2, tulemused: edetabel }, null, 2) + "\n", "utf8");
    } catch {
      console.error("Tulemuse salvestamine ebaõnnestus. Seekordne tulemus ei pruugi säilida.");
    }
    break;
  }

  while (true) {
    const vastus = prompt("Kas tahad uuesti mängida? (jah/ei):")?.trim().toLowerCase();
    if (vastus === undefined || vastus === "ei" || vastus === "q") break mang;
    if (vastus === "jah") continue mang;
    console.log("Palun vasta jah või ei.");
  }
}

console.log(`👋 Aitäh mängimast, ${nimi}!`);
console.log(`Lõplik skoor: ${koguskoor} punkti!`);
edetabel.sort((a, b) => b.skoor - a.skoor || a.nimi.localeCompare(b.nimi, "et"));
console.log("\n🏆 EDETABEL — iga mängija parim koguskoor");
if (edetabel.length === 0) console.log("Tulemusi veel pole.");
else console.table(edetabel.map((rida, indeks) => ({
  Koht: indeks + 1,
  Mängija: rida.nimi,
  Skoor: rida.skoor,
})));
