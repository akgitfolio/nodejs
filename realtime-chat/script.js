const socket = io();

document.getElementById("create_button").addEventListener("click", () => {
  const title = prompt("Enter document title:");
  if (title) {
    socket.emit("create_document", title, "");
  }
});

socket.on("document_created", (docId, title) => {
  const documentList = document.getElementById("document_list");
  const documentItem = document.createElement("div");
  documentItem.innerHTML = `
    <h4><a href="/document/${docId}">${title}</a></h4>
  `;
  documentList.appendChild(documentItem);
});

socket.on("document_loaded", (doc) => {
  const editor = document.getElementById("editor");
  editor.textContent = doc.content;
});

socket.on("document_updated", (content) => {
  const editor = document.getElementById("editor");
  editor.textContent = content;
});

const editor = document.getElementById("editor");
editor.addEventListener("input", () => {
  const content = editor.textContent;
  const docId = window.location.pathname.split("/")[2];
  socket.emit("document_change", docId, content);
});
