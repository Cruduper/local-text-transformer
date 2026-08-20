(() => {
  const helpText = `
Copy Parfumo.com note lists from the note pyramid on shown for individual fragrances.

The first 'Top Notes' heading can appear once or twice depending on if you copy just the text 'Top Notes' or if you also copy the photo next to it, which is accounted for and creates the two possible input examples, shown below.

Expected Input format examples:

Top Notes
Elemi resinElemi resin Pink pepperPink pepper
Heart Notes Heart Notes
CinnamonCinnamon LavenderLavender Clary sageClary sage
Base Notes Base Notes
Bourbon vanillaBourbon vanilla LeatherLeather Marron glacéMarron glacé CedarCedar

---Or---

Top Notes Top Notes
Elemi resinElemi resin Pink pepperPink pepper
Heart Notes Heart Notes
CinnamonCinnamon LavenderLavender Clary sageClary sage
Base Notes Base Notes
Bourbon vanillaBourbon vanilla LeatherLeather Marron glacéMarron glacé CedarCedar


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
    { input: "Heart Notes", output: "Heart Notes" },
    { input: "Middle Notes", output: "Heart Notes" },
    { input: "Base Notes", output: "Base Notes" }
  ];

  const OUTPUT_SECTIONS = ["Top Notes", "Heart Notes", "Base Notes"];

  function normalizeWhitespace(text) {
    return text.trim().replace(/\s+/g, " ");
  }

  function removeImmediateDuplicate(text) {
    const value = normalizeWhitespace(text);

    if (!value) {
      return "";
    }

    // Handles examples like "AlmondAlmond".
    if (value.length % 2 === 0) {
      const half = value.length / 2;
      const firstHalf = value.slice(0, half);
      const secondHalf = value.slice(half);

      if (firstHalf.toLocaleLowerCase() === secondHalf.toLocaleLowerCase()) {
        return firstHalf;
      }
    }

    // Handles examples like "Top Notes Top Notes".
    const words = value.split(" ");

    if (words.length % 2 === 0) {
      const half = words.length / 2;
      const firstHalf = words.slice(0, half).join(" ");
      const secondHalf = words.slice(half).join(" ");

      if (firstHalf.toLocaleLowerCase() === secondHalf.toLocaleLowerCase()) {
        return firstHalf;
      }
    }

    return value;
  }

  function parseHeading(line) {
    const cleanedLine = removeImmediateDuplicate(line).toLocaleLowerCase();

    return NOTE_HEADINGS.find(({ input }) =>
      input.toLocaleLowerCase() === cleanedLine
    );
  }

  function splitPackedNotes(line) {
    let working = normalizeWhitespace(line);

    if (!working) {
      return [];
    }

    const notes = [];

    while (working.length > 0) {
      let foundDuplicate = false;

      for (let length = 1; length <= Math.floor(working.length / 2); length += 1) {
        const candidate = working.slice(0, length);
        const duplicate = working.slice(length, length * 2);

        if (
          candidate.trim() &&
          candidate.toLocaleLowerCase() === duplicate.toLocaleLowerCase()
        ) {
          notes.push(normalizeWhitespace(candidate));
          working = normalizeWhitespace(working.slice(length * 2));
          foundDuplicate = true;
          break;
        }
      }

      if (!foundDuplicate) {
        notes.push(removeImmediateDuplicate(working));
        break;
      }
    }

    return notes.filter(Boolean);
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

      const notes = splitPackedNotes(line);

      for (const note of notes) {
        const duplicateKey = note.toLocaleLowerCase();

        if (!seen[currentGroup].has(duplicateKey)) {
          seen[currentGroup].add(duplicateKey);
          groups[currentGroup].push(note);
        }
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
    id: "parfumo-notes-to-mercari",
    name: "Parfumo Notes ⟶ Mercari",
    helpText,
    transform
  });
})();
