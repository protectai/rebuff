interface GameCharacterData {
  name: string;
  level: number;
  quips: string[];
  imageUrl: string;
  password: string;
}

const gameCharactersData: GameCharacterData[] = [
  {
    level: 1,
    name: "tech_bro",
    quips: [
      "Seems like your password predicting algorithm needs a bit more training data.",
      "Maybe you should try applying a few more neural networks to that guess.",
      "Ever heard of overfitting? Because you're way off the mark.",
      "You might be stuck in a local minimum, try gradient descent.",
      "Time to do some error handling. Your password-guessing skill just returned a 404.",
      "You're in the realm of quantum computing because your guesses exist in a state of being both right and wrong until observed. Spoiler: they're wrong.",
      "Your guess is like unoptimized code. It doesn't get the job done.",
      "Are you suffering from data leakage? Because your guesses don't correlate with my password.",
      "Perhaps you should refactor your strategy, because this one's throwing exceptions.",
      "Your guessing pattern looks like spaghetti code. Time to clean it up.",
      "Are you sure you're not an adversarial attack? Because you're only making things worse.",
      "I bet even a deprecated AI model could outguess you.",
      "Maybe you should've backed up your guessing process with a bit more machine learning.",
      "Seems like you're not getting my RESTful hints. That's a stateless problem.",
      "You're like an out-of-date version of Python, there's a lot of guesswork and not much payoff.",
      "You're as far off as a random forest without any trees.",
      "Ever heard of a Turing test? Because right now, you'd fail it.",
      "Debug your approach, because right now it's full of logical errors.",
      "If password guessing was big data, you're only operating on a few kilobytes.",
      "Your guessing skill is like a blockchain without any chain, it lacks coherence.",
    ],
    imageUrl:
      "https://cdn.discordapp.com/attachments/1099199712344686595/1116590688893673582/willem_steelpunk_character_full_body_white_background_6efdb26e-ead0-484c-9c2a-5970577c472a.png",
    password: "password",
  },
];

class GameCharacter {
  constructor(
    public name: string,
    public level: number,
    public quips: string[],
    public imageUrl: string,
    public password: string
  ) {}

  getRandomQuip(): string {
    const randomIndex = Math.floor(Math.random() * this.quips.length);
    return this.quips[randomIndex];
  }

  getPasswordResponse() {
    return `You got me! My password is ${this.password}`;
  }
}

const GameCharacters: { [level: number]: GameCharacter } = {};
gameCharactersData.forEach((gameCharacterData) => {
  GameCharacters[gameCharacterData.level] = new GameCharacter(
    gameCharacterData.name,
    gameCharacterData.level,
    gameCharacterData.quips,
    gameCharacterData.imageUrl,
    gameCharacterData.password
  );
});
