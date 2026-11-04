import { createInterface } from "node:readline/promises";

const scoresFile = Bun.file(new URL("./edetabel.json", import.meta.url));
let scores = [];
if (await scoresFile.exists()) {
  const data = await scoresFile.json();
  scores = data.tulemused;
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

try {
  console.log("🎮 TERE TULEMAST ARVAMISMÄNGU!");
  let name = "";
  while (!name) {
    name = (await rl.question("Mis on sinu nimi? ")).trim();
  }

  let score = 0;
  let playAgain = true;
  console.log(`Tere, ${name}! 😎`);

  while (playAgain) {
    const secretNumber = Math.floor(Math.random() * 10) + 1;
    let roundPoints = 10;
    console.log("\nArva ära number 1 kuni 10!");
    console.log("Alustad 10 punktiga. Vale vastus võtab 1 punkti maha. Väljumiseks q.");

    while (true) {
      const input = (await rl.question("Sisesta number: ")).trim();
      if (input.toLowerCase() === "q") {
        playAgain = false;
        break;
      }

      const guess = Number(input);
      if (input === "" || !Number.isInteger(guess) || guess < 1 || guess > 10) {
        console.log("Palun sisesta täisarv 1 kuni 10.");
        continue;
      }

      if (guess === secretNumber) {
        score += roundPoints;
        console.log(`🎉 ÕIGE! Said ${roundPoints} punkti!`);
        console.log(`🏆 Sinu koguskoor: ${score}`);

        const player = scores.find((row) => row.nimi.toLowerCase() === name.toLowerCase());
        if (player) {
          player.skoor = Math.max(player.skoor, score);
        } else {
          scores.push({ nimi: name, skoor: score });
        }
        await Bun.write(scoresFile, JSON.stringify({ versioon: 2, tulemused: scores }, null, 2));
        break;
      }

      roundPoints--;
      console.log("❌ Vale vastus!");
      if (guess < secretNumber) {
        console.log("⬆️ Salajane number on SUUREM!");
      } else {
        console.log("⬇️ Salajane number on VÄIKSEM!");
      }
    }

    if (playAgain) {
      let answer = "";
      while (answer !== "jah" && answer !== "ei" && answer !== "q") {
        answer = (await rl.question("Kas tahad uuesti mängida? (jah/ei): ")).trim().toLowerCase();
      }
      playAgain = answer === "jah";
    }
  }

  console.log(`👋 Aitäh mängimast, ${name}!`);
  console.log(`Lõplik skoor: ${score} punkti!`);
  console.log("\n🏆 EDETABEL — iga mängija parim koguskoor");
  scores.sort((a, b) => b.skoor - a.skoor);
  console.table(scores.map((player, index) => ({
    Koht: index + 1,
    Mängija: player.nimi,
    Skoor: player.skoor,
  })));
} finally {
  rl.close();
}
