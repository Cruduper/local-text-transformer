(() => {
  const helpText = `
    Copy Fragrantica.com note lists from the note pyramid on shown on individual fragrance pages.

    Expected Input format:

    Top Notes
    Pink Pepper
    Pink Pepper
    Mandarin
    Mandarin
    Middle Notes
    Lavender
    Lavender
    Cinnamon
    Cinnamon
    Sage
    Sage
    Base Notes
    Chestnut
    Chestnut
    Vanilla
    Vanilla
    Leather


    Output format:

    ~~~ Top Notes ~~~
    Elemi resin, Pink pepper
    ~~~ Heart Notes ~~~
    Cinnamon, Lavender, Clary sage
    ~~~ Base Notes ~~~
    Bourbon vanilla, Leather, Marron glacé, Cedar
  `.trim();
  
  function normalizeLine(line) {
    return line.trim().replace(/\s+/g, " ");
  }

  function transform(text) {
    const headingMap = new Map([
      ["top notes", "TopNotes"],
      ["middle notes", "MiddleNotes"],
      ["base notes", "BaseNotes"]
    ]);

    const groups = {};
    const seen = {};

    for (const outputName of headingMap.values()) {
      groups[outputName] = [];
      seen[outputName] = new Set();
    }

    let currentGroup = null;

    for (const rawLine of text.split(/\r?\n/)) {
      const line = normalizeLine(rawLine);
      if (!line) continue;

      const headingKey = line.toLowerCase();
      if (headingMap.has(headingKey)) {
        currentGroup = headingMap.get(headingKey);
        continue;
      }

      if (!currentGroup) continue;

      const duplicateKey = line.toLocaleLowerCase();
      if (!seen[currentGroup].has(duplicateKey)) {
        seen[currentGroup].add(duplicateKey);
        groups[currentGroup].push(line);
      }
    }

    const rows = Object.entries(groups).map(
      ([name, items]) => `\t${name}: { ${items.join(", ")} }`
    );

    return `{\n${rows.join(",\n")}\n}`;
  }

  window.TextTransformer.registerBuiltIn({
    id: "fragrantica-frag-notes",
    name: "Fragrantica Notes ⟶ Obsidian",
    transform
  });
})();
