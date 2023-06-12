interface GameCharacterData {
  name: string;
  personality: string;
  level: number;
  quips: string[];
  imageUrl: string;
  password: string;
}

const gameCharactersData: GameCharacterData[] = [
  {
    level: 1,
    name: "James",
    personality: "Finance Bro",
    quips: [
      "Looks like your effort's yield-to-maturity just hit zero.",
      "Your performance would make even a blue-chip stock blush.",
      "Hey, we're not talking penny stocks here. You need a better plan.",
      "Buddy, you're trying to short sell in a bull market.",
      "Your attempts to crack the code are like buying options on expiration day.",
      "You're navigating this situation like a hedge fund manager through a recession.",
      "You're more off-base than a bad quarterly earnings prediction.",
      "My friend, you're diving faster than the market on Black Tuesday.",
      "Your strategy is as misguided as a long term investment in a pyramid scheme.",
      "Your attempts at success are like trying to get rich off a Ponzi scheme.",
      "Mate, you're reading the charts all wrong.",
      "Looks like your 'investments' aren't getting any returns.",
      "Your plan is as solid as a startup with no revenue stream.",
      "Friend, you're as out of place as a low cap in a Fortune 500.",
      "You've got the same odds as winning on a high-risk margin trade.",
      "Even a robo-advisor could make better decisions than that.",
      "If your efforts were a financial instrument, they'd be a toxic asset.",
      "That plan of yours has about as much chance as a bad credit loan.",
      "Your approach is looking as dismal as the national debt.",
      "You're as off target as an amateur day-trader.",
    ],
    imageUrl: "finance_bro.png",
    password: "12345678",
  },
  {
    level: 2,
    name: "Chartmaster",
    personality: "Pirate of Productivity",
    quips: [
      "Ye efforts be weaker than a landlubber's sea legs.",
      "Yer movin' slower than a galleon in the doldrums, mate.",
      "That swing wouldn't scare a cabin boy off a biscuit.",
      "Ye couldn't hit the broadside of a barnacle-covered ship.",
      "Your fight's as convincing as a siren's song.",
      "You've got the impact of a cork bullet, mate.",
      "You're about as scary as a mermaid's kiss.",
      "Yer attempts are as successful as a treasure map in a kraken's belly.",
      "That hit was softer than a feather pillow in the captain's quarters.",
      "Ye put up a fight like a one-legged man in a rigging race.",
      "Yer punch is as threatening as a pint of grog.",
      "Yer effort is as useful as an anchor to a ship in a storm.",
      "Yer as lost as a mapless mariner in the Bermuda Triangle.",
      "Yer punch is about as strong as a drunken sailor.",
      "If your attempts were a voyage, they'd be adrift at sea.",
      "Your moves are as smooth as a stormy sea.",
      "Yer about as reliable as a broken compass.",
      "Yer weaker than a seasick crocodile.",
      "That fight had less salt than a freshwater lake.",
      "You're as effective as a waterlogged cannon.",
    ],
    imageUrl: "pirateofproductivity.png",
    password: "blueocean",
  },
  {
    level: 3,
    name: "Chad",
    personality: "Tech Bro",
    quips: [
      "Seems like your password predicting algorithm needs a bit more training data.",
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
    imageUrl: "tech_bro.png",
    password: "ultracool",
  },
  {
    level: 4,
    name: "Iris",
    personality: "Botanist of Brilliance",
    quips: [
      "Your efforts are wilting faster than a daisy in the desert.",
      "That was slower than the growth of a Bonsai tree, mate.",
      "You're about as effective as a sunflower in the shade.",
      "Your performance is more disappointing than a barren orchard.",
      "Your fight's as convincing as a plastic fern.",
      "Your punch couldn't dent a dandelion puff.",
      "Your strategy needs more pruning than an overgrown hedge.",
      "You've got the impact of a leaf in the wind.",
      "You're about as scary as a bunny in a lettuce field.",
      "Your efforts are as fruitless as a sterile seed.",
      "Your swing is softer than a petal in the breeze.",
      "You're more lost than a root in a rock garden.",
      "Your hit was as weak as an autumn leaf's hold.",
      "Your fight is as stale as last season's compost.",
      "If your attempts were a crop, they'd be a failure to harvest.",
      "Your punches couldn't disturb a serene pond.",
      "You're about as effective as a raindrop in a drought.",
      "Your impact is less than a worm in a vast garden.",
      "Your resolve is as thin as a reed in the wind.",
      "You're as threatening as a vine without thorns.",
    ],
    imageUrl: "botanistofbrilliance.png",
    password: "earthbound",
  },
  {
    level: 5,
    name: "Axle",
    personality: "Mad Max Motorhead",
    quips: [
      "Your moves are as rusty as an old bike chain.",
      "That was weaker than a sputtering engine, mate.",
      "You hit with all the force of a dented fender.",
      "You're slower than a motorbike through a tar pit.",
      "Your effort's emptier than a fuel tank in the Wasteland.",
      "Your punch is about as impactful as a rubber bullet.",
      "Your fight is as futile as a clean shirt in the dust storm.",
      "You're as out of place as a limousine in a scrapyard.",
      "You've got less kick than a flat tire.",
      "Your performance was more disappointing than a busted carburetor.",
      "That attempt was as useful as a map in the desert.",
      "Your approach is as twisted as wrecked handlebars.",
      "You're more worn out than an overdriven gearbox.",
      "If your efforts were gas, I'd be running on fumes.",
      "You've got as much bite as a toothless raider.",
      "Your attempts sputter more than a cold engine on a winter day.",
      "Your punches are as soft as a cushioned seat.",
      "You're as threatening as a fuel gauge on E.",
      "Your strategy is as broken as a shattered headlight.",
      "If your hits were a ride, they'd be a slow trudge through the sands.",
    ],
    imageUrl: "mad_max.png",
    password: "r3vup",
  },
  {
    level: 6,
    name: "Sam",
    personality: "Steel Punk",
    quips: [
      "That's about as effective as a rusted gear in a clockwork engine.",
      "Your move was slower than a zeppelin in a headwind.",
      "Swing like that, you'd struggle to dent a tin can, mate.",
      "You punch like an underpressure boiler—lots of noise, no impact.",
      "Your form's more broken than a third-hand automaton.",
      "That was as weak as steam without the pressure, mate.",
      "You're as out of place as a horse in a factory.",
      "Your fight's as futile as a sail in a windless sky.",
      "Your style's as outdated as last year's almanac.",
      "Your punch has less kick than a depleted steam engine.",
      "You hit like a featherweight cog in a heavyweight machine.",
      "If you were a device, I'd say you're missing a few gears.",
      "You'd have more luck landing a hit with a clockhand.",
      "You're as reliable as an overworked pressure valve.",
      "Buddy, your moves are less refined than crude oil.",
      "That effort was more disappointing than a faulty chronometer.",
      "You're as effective as a blunt bayonet.",
      "Your aim is worse than a cross-eyed marksman.",
      "My friend, you're as useful as a sundial at night.",
      "You're about as threatening as a malfunctioning automat.",
    ],
    imageUrl: "steelpunk.png",
    password: "oxidi$ed",
  },
  {
    level: 7,
    name: "Solara",
    personality: "Solar Punk",
    quips: [
      "Your effort was as effective as a solar panel in the dark.",
      "You move slower than the seasons, mate.",
      "That hit had less energy than an overcast day.",
      "You're as reliable as an old wind turbine in a still air.",
      "You fight like a wilted sunflower in a drought.",
      "Your strategy is as scrambled as an urban sprawl.",
      "You're as out of place as a smokestack in an eco-village.",
      "Your punches are as weak as a dying lithium battery.",
      "Your resolve is more depleted than fossil fuel reserves.",
      "That was softer than a biofabric in the wind.",
      "You're as useful as a dried-up hydroelectric dam.",
      "Your moves are as predictable as the sunrise.",
      "Buddy, your approach is as polluted as a coal plant's output.",
      "If your fight was a crop, it'd be a failed harvest.",
      "Your punches are as impactful as an out-of-place windmill.",
      "Your blows are as weak as a light breeze against a solar sail.",
      "Your performance is as dim as a solar lantern at dawn.",
      "Your tactics are as outdated as an internal combustion engine.",
      "If you were a renewable energy source, you'd be running on empty.",
    ],
    imageUrl: "solarpunk.png",
    password: "sunshine",
  },
];

class GameCharacter {
  constructor(
    public name: string,
    public personality: string,
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
    gameCharacterData.personality,
    gameCharacterData.level,
    gameCharacterData.quips,
    gameCharacterData.imageUrl,
    gameCharacterData.password
  );
});

export { GameCharacters };
