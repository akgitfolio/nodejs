const { Command } = require("commander");
const fs = require("fs");
const readline = require("readline");

const program = new Command();
let currentContent = "";

// Define available commands
program
  .command("open <filename>")
  .description("Open a file")
  .action((filename) => {
    try {
      const content = fs.readFileSync(filename, "utf8");
      currentContent = content;
      console.clear();
      console.log(content);
    } catch (error) {
      console.error(`Error opening file: ${error.message}`);
    }
  });

program
  .command("save <filename>")
  .description("Save the current content")
  .action((filename) => {
    try {
      fs.writeFileSync(filename, currentContent, "utf8");
      console.info(`File saved successfully: ${filename}`);
    } catch (error) {
      console.error(`Error saving file: ${error.message}`);
    }
  });

program
  .command("exit")
  .description("Exit the editor")
  .action(() => {
    process.exit(0);
  });

// Display available commands
program
  .command("help")
  .description("Display available commands")
  .action(() => {
    program.outputHelp();
  });

program.parse(process.argv);

// Listen for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  const [command, ...args] = input.split(" ");
  try {
    program.parse([process.argv[0], process.argv[1], command, ...args], {
      from: "user",
    });
  } catch (error) {
    console.error(`Invalid command: ${command}`);
  }
});
