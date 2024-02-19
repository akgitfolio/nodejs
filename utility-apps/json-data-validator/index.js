const express = require("express");
const Web3 = require("web3");
const solc = require("solc");
const Ajv = require("ajv");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());

const web3 = new Web3("http://localhost:8545");

const schema = {
  type: "object",
  properties: {
    from: { type: "string", pattern: "^0x[a-fA-F0-9]{40}$" },
    to: { type: "string", pattern: "^0x[a-fA-F0-9]{40}$" },
    value: { type: "number", minimum: 0 },
  },
  required: ["from", "to", "value"],
};

const ajv = new Ajv();
const validate = ajv.compile(schema);

async function deployContract(contractCode) {
  try {
    const input = {
      language: "Solidity",
      sources: {
        "MyContract.sol": {
          content: contractCode,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode"],
          },
        },
      },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contract = output.contracts["MyContract.sol"]["MyContract"];
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    const contractInstance = new web3.eth.Contract(abi);

    const accounts = await web3.eth.getAccounts();
    const deployment = contractInstance.deploy({ data: bytecode });
    const deployedContract = await deployment.send({
      from: accounts[0],
      gas: 1000000,
    });

    return deployedContract;
  } catch (error) {
    console.error("Error deploying contract:", error);
    throw error;
  }
}

async function executeContract(contractAddress, data) {
  try {
    const valid = validate(data);
    if (!valid) {
      throw new Error("Invalid input data: " + ajv.errorsText(validate.errors));
    }

    const contract = new web3.eth.Contract([], contractAddress);

    const result = await contract.methods
      .myFunction(data.from, data.to, data.value)
      .send({ from: data.from });

    return result;
  } catch (error) {
    console.error("Error executing contract:", error);
    throw error;
  }
}

app.post("/deploy", async (req, res) => {
  const contractCode = req.body.contractCode;

  try {
    const deployedContract = await deployContract(contractCode);
    res.json({ address: deployedContract.options.address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/execute", async (req, res) => {
  const contractAddress = req.body.contractAddress;
  const data = req.body.data;

  try {
    const result = await executeContract(contractAddress, data);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
