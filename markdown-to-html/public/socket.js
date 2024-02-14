const socket = io("/");

socket.on("documentContent", (content) => {
  editor.setValue(content, -1);
});

socket.on("htmlContent", (content) => {
  document.getElementById("preview").innerHTML = content;
  hljs.highlightAll();
});

function editDocument(content) {
  socket.emit("editDocument", content);
}

const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/markdown");
editor.setOptions({
  fontSize: "16px",
});

editor.on("change", () => {
  const content = editor.getValue();
  editDocument(content);
});
