// src/components/TaskCard.js

function etiquettePriorite(p) {
  if (p === "high") return "Haute";
  if (p === "low") return "Basse";
  return "Moyenne";
}

function etiquetteStatut(s) {
  if (s === "a-faire") return "À faire";
  if (s === "en-cours") return "En cours";
  return "Terminé";
}

export function creerCarteTache({ tache, store, onEdit, annoncer }) {
  const article = document.createElement("article");
  article.className = "carte-tache";
  article.dataset.idTache = tache.id;

  const h = document.createElement("h3");
  h.className = "carte-tache__titre";
  h.textContent = tache.titre;

  const meta = document.createElement("p");
  meta.className = "carte-tache__meta";
  meta.textContent = `Priorité : ${etiquettePriorite(tache.priorite)} · Statut : ${etiquetteStatut(tache.statut)}`;

  // Alternative accessible au drag & drop : select pour changer de colonne
  const labelSelect = document.createElement("label");
  labelSelect.className = "visuellement-cache";
  labelSelect.htmlFor = `select-statut-${tache.id}`;
  labelSelect.textContent = "Déplacer la tâche vers une colonne";

  const select = document.createElement("select");
  select.id = `select-statut-${tache.id}`;
  select.name = "statut";
  select.value = tache.statut;

  select.add(new Option("À faire", "a-faire"));
  select.add(new Option("En cours", "en-cours"));
  select.add(new Option("Terminé", "termine"));

  select.addEventListener("change", (e) => {
    const nouveauStatut = e.target.value;
    try {
      store.deplacerTache(tache.id, nouveauStatut);
      annoncer?.(`Tâche déplacée vers "${etiquetteStatut(nouveauStatut)}".`);
    } catch (err) {
      annoncer?.(err?.message ?? "Impossible de déplacer la tâche.");
      // Revenir à la valeur précédente si souci
      select.value = tache.statut;
    }
  });

  const actions = document.createElement("div");
  actions.className = "carte-tache__actions";

  const btnModifier = document.createElement("button");
  btnModifier.type = "button";
  btnModifier.textContent = "Modifier";
  btnModifier.addEventListener("click", () => onEdit?.(tache));

  const btnSupprimer = document.createElement("button");
  btnSupprimer.type = "button";
  btnSupprimer.textContent = "Supprimer";
  btnSupprimer.addEventListener("click", () => {
    const ok = window.confirm("Supprimer cette tâche ?");
    if (!ok) return;

    try {
      store.supprimerTache(tache.id);
      annoncer?.("Tâche supprimée.");
    } catch (err) {
      annoncer?.(err?.message ?? "Impossible de supprimer la tâche.");
    }
  });

  actions.append(labelSelect, select, btnModifier, btnSupprimer);
  article.append(h, meta, actions);
  return article;
}
