// Mermaid initialization for MkDocs Material
// Runs after every page navigation (including instant loading)
document$.subscribe(function () {
  mermaid.initialize({
    startOnLoad: false,
    theme: document.body.getAttribute("data-md-color-scheme") === "slate"
      ? "dark"
      : "default",
    securityLevel: "loose",
    fontFamily: "Inter, Roboto, sans-serif",
  });
  mermaid.run({ querySelector: ".mermaid" });
});
