let charactersData = [];

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Errore nel caricamento di ${path}`);
  return await response.json();
}

function createTagList(tags = []) {
  const wrapper = document.createElement("div");
  wrapper.className = "tag-list";

  tags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    wrapper.appendChild(span);
  });

  return wrapper;
}

function openCharacterDialog(characterId) {
  const dialog = document.getElementById("character-dialog");
  const content = document.getElementById("character-dialog-content");
  const character = charactersData.find((item) => String(item.id) === String(characterId));
  if (!character || !dialog || !content) return;

content.innerHTML = `
  ${character.image ? `<img class="character-dialog-image" src="${character.image}" alt="Ritratto di ${character.name}" />` : ""}
  <h3>${character.name}</h3>
  <p><strong>Classe:</strong> ${character.class}</p>
  <p><strong>Livello:</strong> ${character.level}</p>
  <p><strong>Giocatore:</strong> ${character.player}</p>
  <p><strong>Ascendenza:</strong> ${character.ancestry}</p>
  <p>${character.summary}</p>
`;

  content.appendChild(createTagList(character.traits));
  dialog.showModal();
}

function renderCharacters(characters) {
  const container = document.getElementById("characters-list");
  if (!container) return;

  container.innerHTML = "";
  charactersData = characters;

  const grid = document.createElement("div");
  grid.className = "entries-grid";
  container.appendChild(grid);

  characters.forEach((character, index) => {
    const card = document.createElement("article");
    card.className = "entry-card entry-card-clickable";
    card.dataset.characterId = character.id ?? index + 1;
    card.tabIndex = 0;

card.innerHTML = `
  ${character.image ? `<img class="character-card-image" src="${character.image}" alt="Ritratto di ${character.name}" loading="lazy" />` : ""}
  <h3>${character.name}</h3>
  <p><strong>${character.class}</strong> · Livello ${character.level}</p>
  <p class="entry-link-text">Apri scheda personaggio</p>
`;

    card.addEventListener("click", () => openCharacterDialog(card.dataset.characterId));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCharacterDialog(card.dataset.characterId);
      }
    });

    grid.appendChild(card);
  });
}

function renderLore(entries) {
  const container = document.getElementById("lore-list");
  if (!container) return;

  container.innerHTML = "";
  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "entry-card";
    card.innerHTML = `
      <h3>${entry.title}</h3>
      <p><strong>Sessione:</strong> ${entry.session || "-"}</p>
      <p><strong>Data:</strong> ${entry.date || "-"}</p>
      <p>${entry.text}</p>
    `;
    card.appendChild(createTagList(entry.tags));
    container.appendChild(card);
  });
}

function renderLocations(locations) {
  const container = document.getElementById("locations-list");
  if (!container) return;

  container.innerHTML = "";
  locations.forEach((location) => {
    const card = document.createElement("article");
    card.className = "entry-card";
    card.innerHTML = `
      <h3>${location.name}</h3>
      <p><strong>Tipo:</strong> ${location.type}</p>
      <p><strong>Stato:</strong> ${location.status}</p>
      <p><strong>Regione:</strong> ${location.region}</p>
      <p>${location.summary}</p>
      <p><strong>PNG collegati:</strong> ${(location.related_npcs || []).join(", ") || "-"}</p>
    `;
    card.appendChild(createTagList(location.tags));
    container.appendChild(card);
  });
}

function renderNpcs(npcs) {
  const container = document.getElementById("npcs-list");
  if (!container) return;

  container.innerHTML = "";
  npcs.forEach((npc) => {
    const card = document.createElement("article");
    card.className = "entry-card";
    card.innerHTML = `
      <h3>${npc.name}</h3>
      <p><strong>Ruolo:</strong> ${npc.role}</p>
      <p><strong>Stato:</strong> ${npc.status}</p>
      <p><strong>Luogo:</strong> ${npc.location}</p>
      <p>${npc.summary}</p>
    `;
    card.appendChild(createTagList(npc.tags));
    container.appendChild(card);
  });
}

function renderUsefulInfo(items) {
  const container = document.getElementById("useful-info-list");
  if (!container) return;

  container.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "entry-card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p><strong>Tipo:</strong> ${item.type}</p>
      <p>${item.summary}</p>
    `;
    card.appendChild(createTagList(item.tags));
    container.appendChild(card);
  });
}

function setupDialog() {
  const dialog = document.getElementById("character-dialog");
  const closeButton = document.getElementById("close-character-dialog");
  if (!dialog || !closeButton) return;

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });
}

async function init() {
  try {
    const page = location.pathname.split("/").pop();

    const dataMap = {
      characters: await loadJson("./data/characters.json"),
      lore: await loadJson("./data/lore.json"),
      locations: await loadJson("./data/locations.json"),
      npcs: await loadJson("./data/npcs.json"),
      usefulInfo: await loadJson("./data/useful-info.json")
    };

    if (page === "characters.html") {
      renderCharacters(dataMap.characters);
      setupDialog();
      return;
    }

    if (page === "index.html" || page === "") {
      const charactersLink = document.querySelector('a[href="./characters.html"]');
      if (charactersLink) {
        charactersLink.classList.add("section-card-link");
      }
      return;
    }

    renderCharacters(dataMap.characters);
    renderLore(dataMap.lore);
    renderLocations(dataMap.locations);
    renderNpcs(dataMap.npcs);
    renderUsefulInfo(dataMap.usefulInfo);
    setupDialog();
  } catch (error) {
    console.error(error);
  }
}

init();