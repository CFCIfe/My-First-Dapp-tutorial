import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);
const accAlice = await stdlib.newTestAccount(startingBalance);
const accBob = await stdlib.newTestAccount(startingBalance);

const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async (who) => fmt(await stdlib.balanceOf(who));
const beforeAlice = await getBalance(accAlice);
const beforeBob = await getBalance(accBob);

console.log("Hello, Alice and Bob!");
console.log("Launching...");
console.log(`Alice has balance of ${beforeAlice}`);
console.log(`Bob has balance of ${beforeBob}`);

const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

console.log("Starting backends...");

const HAND = ["Rock", "Paper", "Scissors"];
const OUTCOME = ["Bob wins", "Draw", "Alice wins"];
const Player = (who) => ({
  ...stdlib.hasRandom,
  getHand: () => {
    const hand = Math.floor(Math.random() * 3);
    console.log(`${who} played ${HAND[hand]}`);
    return hand;
  },
  seeOutcome: (outcome) => {
    console.log(`${who} saw outcome ${OUTCOME[outcome]}`);
  },
});

await Promise.all([
  ctcAlice.p.Alice({
    // ...stdlib.hasRandom,
    ...Player("Alice"),
    wager: stdlib.parseCurrency(5),
    // implement Alice's interact object here
  }),
  ctcBob.p.Bob({
    // ...stdlib.hasRandom,
    ...Player("Bob"),
    acceptWager: (amt) => {
      console.log(`Bob accepts the wager of ${fmt(amt)}.`);
    },
    // implement Bob's interact object here
  }),
]);

const afterAlice = await getBalance(accAlice);
const afterBob = await getBalance(accBob);
console.log(`Alice went from ${beforeAlice} to ${afterAlice}`);
console.log(`Bob went from ${beforeBob} to ${afterBob}`);
console.log("Goodbye, Alice and Bob!");
