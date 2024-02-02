const readline = require("readline");
const chalk = require("chalk");

// Story data structure (replace with your own!)
const story = {
  title: "The Mystery of the Hidden Temple",
  start: {
    description:
      "You find yourself standing at the entrance of a forgotten temple, shrouded in mist.",
    options: [
      { text: "Enter the temple", next: "templeEntrance" },
      { text: "Explore the surroundings", next: "surroundings" },
    ],
  },
  templeEntrance: {
    description:
      "The temple's interior is dark and dusty, ancient murals adorning the walls.",
    options: [
      { text: "Examine the murals", next: "murals" },
      { text: "Head deeper into the temple", next: "templeDepths" },
    ],
  },
  // ... (add more story elements)
};

// Initialize readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Start the game
function startGame() {
  console.clear();
  console.log(chalk.magenta.bold(story.title));
  console.log(story.start.description);
  presentOptions(story.start.options);
}

// Display available options
function presentOptions(options) {
  options.forEach((option, index) => {
    console.log(`${index + 1}. ${option.text}`);
  });
  askForInput();
}

// Ask for user input
function askForInput() {
  rl.question("\nWhat do you do? ", (choice) => {
    const option = story[story.currentLocation].options[choice - 1];
    if (option) {
      story.currentLocation = option.next;
      processStory(option.next);
    } else {
      console.log(chalk.red("Invalid choice. Please try again."));
      askForInput();
    }
  });
}

// Process the current story element
function processStory(location) {
  const currentStory = story[location];
  console.log(currentStory.description);
  // (Conditional logic and inventory management based on user choices can be added here)
  if (currentStory.options) {
    presentOptions(currentStory.options);
  } else {
    console.log(chalk.green("The End."));
    rl.close();
  }
}

// Start the game
startGame();
