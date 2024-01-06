const crypto = require("crypto");
const qrcode = require("qrcode-terminal");

// Function to generate a random AES-256 key
function generateKey() {
  return crypto.randomBytes(32);
}

// Function to encrypt a file
function encryptFile(file, key) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    key,
    crypto.randomBytes(16)
  );
  const input = fs.createReadStream(file);
  const output = fs.createWriteStream(`${file}.enc`);
  input.pipe(cipher).pipe(output);
  return new Promise((resolve, reject) => {
    output.on("finish", resolve);
    output.on("error", reject);
  });
}

// Function to generate a QR code for the key
function generateQR(key) {
  qrcode.generate(key.toString("hex"), { small: true });
}

// Function to decrypt a file
function decryptFile(file, key) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    crypto.randomBytes(16)
  );
  const input = fs.createReadStream(file);
  const output = fs.createWriteStream(`${file.replace(".enc", "")}`);
  input.pipe(decipher).pipe(output);
  return new Promise((resolve, reject) => {
    output.on("finish", resolve);
    output.on("error", reject);
  });
}

// Example usage
const fileToShare = "secret_document.txt";
const key = generateKey();

encryptFile(fileToShare, key)
  .then(() => {
    generateQR(key);
    console.log("File encrypted and QR code generated.");
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// Simulate file decryption by another user
const encryptedFile = `${fileToShare}.enc`;
decryptFile(encryptedFile, key)
  .then(() => {
    console.log("File decrypted successfully.");
  })
  .catch((error) => {
    console.error("Error:", error);
  });
