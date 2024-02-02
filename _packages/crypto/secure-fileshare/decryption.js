const crypto = require("crypto");

const algorithm = "aes-256-gcm";
const keyDerivationIterations = 100000;
const digest = "sha256";

// Decrypt file with AES-GCM algorithm
async function decryptFile(filePath, key, iv) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const input = crypto.createReadStream(filePath);
  const output = crypto.createWriteStream(filePath.slice(0, -4));
  input.pipe(decipher).pipe(output);
  await new Promise((resolve, reject) => {
    output.on("finish", resolve);
    output.on("error", reject);
  });
}

// Main function for file decryption
async function main(password, filePath) {
  const key = crypto.pbkdf2Sync(
    password,
    digest,
    keyDerivationIterations,
    32,
    "sha256"
  );

  await decryptFile(filePath, key, filePath.slice(-12));

  console.log("File decrypted successfully!");
}

// Example usage
main("your_password", "path/to/file.txt.enc");
