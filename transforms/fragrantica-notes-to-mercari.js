(() => {
  const helpText = `
    Copy Fragrantica.com note lists from the note pyramid on shown on individual fragrance pages.

    Expected Input format:

    Top Notes 
    Elemi resin 
    Elemi resin 
    Pink Pepper 
    Pink Pepper 
    Middle Notes 
    Cinnamon 
    Cinnamon 
    Lavender 
    Lavender 
    Clary Sage 
    Clary Sage 
    Base Notes 
    Bourbon Vanilla 
    Bourbon Vanilla 
    Leather 
    Leather 
    Marron glacé
    Marron glacé
    Cedar 
    Cedar


    Output format:

    ~~~ Top Notes ~~~
    Elemi resin, Pink pepper
    ~~~ Heart Notes ~~~
    Cinnamon, Lavender, Clary sage
    ~~~ Base Notes ~~~
    Bourbon vanilla, Leather, Marron glacé, Cedar
  `.trim();

  const NOTE_HEADINGS = [
    { input: "Top Notes", output: "Top Notes" },
    { input: "Middle Notes", output: "Heart Notes" },
    { input: "Heart Notes", output: "Heart Notes" },
    { input: "Base Notes", output: "Base Notes" }
  ];

  const OUTPUT_SECTIONS = ["Top Notes", "Heart Notes", "Base Notes"];

  function normalizeWhitespace(text) {
    return text.trim().replace(/\s+/g, " ");
  }

  function parseHeading(line) {
    const cleanedLine = normalizeWhitespace(line).toLocaleLowerCase();

    return NOTE_HEADINGS.find(({ input }) =>
      input.toLocaleLowerCase() === cleanedLine
    );
  }

  function parseNotes(text) {
    const groups = {};
    const seen = {};

    for (const section of OUTPUT_SECTIONS) {
      groups[section] = [];
      seen[section] = new Set();
    }

    let currentGroup = null;

    for (const rawLine of text.split(/\r?\n/)) {
      const line = normalizeWhitespace(rawLine);

      if (!line) {
        continue;
      }

      const heading = parseHeading(line);

      if (heading) {
        currentGroup = heading.output;
        continue;
      }

      if (!currentGroup) {
        continue;
      }

      const duplicateKey = line.toLocaleLowerCase();

      if (!seen[currentGroup].has(duplicateKey)) {
        seen[currentGroup].add(duplicateKey);
        groups[currentGroup].push(line);
      }
    }

    return groups;
  }

  function renderMercari(groups) {
    return OUTPUT_SECTIONS
      .map((section) => `~~~ ${section} ~~~\n${groups[section].join(", ")}`)
      .join("\n");
  }

  function transform(text) {
    return renderMercari(parseNotes(text));
  }

  window.TextTransformer.registerBuiltIn({
    id: "fragrantica-notes-to-mercari",
    name: "Fragrantica Notes ⟶ Mercari",
    transform
  });
})();