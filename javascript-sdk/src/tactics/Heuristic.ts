import stringSimilarity from "string-similarity";
import { normalizeString } from "../lib/prompts";
import { TacticName } from "../interface";
import Tactic, { TacticExecution } from "./Tactic";

function generateInjectionKeywords() {
  // Define lists of verbs, adjectives, prepositions, and objects
  const verbs = [
    "Ignore",
    "Disregard",
    "Skip",
    "Forget",
    "Neglect",
    "Overlook",
    "Omit",
    "Bypass",
    "Pay no attention to",
    "Do not follow",
    "Do not obey",
  ];

  const adjectives = [
    "",
    "prior",
    "previous",
    "preceding",
    "above",
    "foregoing",
    "earlier",
    "initial",
  ];

  const prepositions = [
    "",
    "and start over",
    "and start anew",
    "and begin afresh",
    "and start from scratch",
  ];

  const objects = [
    "content",
    "text",
    "instructions",
    "instruction",
    "directives",
    "directive",
    "commands",
    "command",
    "context",
    "conversation",
    "input",
    "inputs",
    "data",
    "message",
    "messages",
    "communication",
    "response",
    "responses",
    "request",
    "requests",
  ];

  // Generate all possible combinations of sentences
  const injectionKeywords = [];
  for (const verb of verbs) {
    for (const adjective of adjectives) {
      for (const object of objects) {
          for (const preposition of prepositions) {
          injectionKeywords.push(
              `${verb} ${adjective} ${object} ${preposition}`.trim()
          );
          }
      }
    }
  }

  return injectionKeywords;
}

// Generate and print the injection keywords
const injectionKeywords = generateInjectionKeywords();

export default class Heuristic implements Tactic {
  name = TacticName.Heuristic;
  defaultThreshold: number;

  constructor(threshold: number) {
    this.defaultThreshold = threshold;
  }

  execute(input: string): Promise<TacticExecution> {
    let highestScore = 0;
    const normalizedInput = normalizeString(input);

    for (const keyword of injectionKeywords) {
      const normalizedKeyword = normalizeString(keyword);
      const keywordParts = normalizedKeyword.split(" ");
      const keywordLength = keywordParts.length;

      // Generate substrings of similar length in the input string
      const inputParts = normalizedInput.split(" ");
      const inputSubstrings = [];
      for (let i = 0; i <= inputParts.length - keywordLength; i++) {
        inputSubstrings.push(inputParts.slice(i, i + keywordLength).join(" "));
      }

      // Calculate the similarity score between the keyword and each substring
      for (const substring of inputSubstrings) {
        const similarityScore = stringSimilarity.compareTwoStrings(
          normalizedKeyword,
          substring
        );

        // Calculate the score based on the number of consecutive words matched
        const matchedWordsCount = keywordParts.filter(
          (part, index) => substring.split(" ")[index] === part
        ).length;
        const maxMatchedWords = 5;
        const baseScore =
          matchedWordsCount > 0
          ? 0.5 + 0.5 * Math.min(matchedWordsCount / maxMatchedWords, 1)
          : 0;

        // Adjust the score using the similarity score
        const adjustedScore =
          baseScore - similarityScore * (1 / (maxMatchedWords * 2));

        // Update the highest score if the current adjusted score is higher
        if (adjustedScore > highestScore) {
          highestScore = adjustedScore;
        }
      }
    }
    
    return Promise.resolve({ score: highestScore });
  }
}
