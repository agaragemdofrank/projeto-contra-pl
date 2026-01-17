// ======= LINKS =======
const LINKS = {
  enquete: "https://www.camara.leg.br/enquetes/2537555",
  integra: "https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=2968014&filename=Avulso+PL+3507%2F2025",
  pinato: "https://www.camara.leg.br/deputados/66828"
};

// ======= HERO IMAGES =======
// As imagens devem existir como:
//   assets/images/bg1.(png|jpg|webp)
//   ... bg6 ...
// Importante: dependendo de onde o site foi publicado (raiz do dominio ou subpasta),
// caminhos ABSOLUTOS (/assets/...) ou RELATIVOS (assets/...) podem ser necessarios.
// Por isso, tentamos os dois.
const HERO_BASES = [
  "assets/images/bg1", "/assets/images/bg1",
  "assets/images/bg2", "/assets/images/bg2",
  "assets/images/bg3", "/assets/images/bg3",
  "assets/images/bg4", "/assets/images/bg4",
  "assets/images/bg5", "/assets/images/bg5",
  "assets/images/bg6", "/assets/images/bg6"
];
const HERO_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"];

async function resolveHeroUrls(){
  const resolved = [];

  // HERO_BASES alterna relativo/absoluto, entao vamos coletar 6 imagens finais
  // (uma para cada bg1..bg6) ignorando duplicatas.
  for(const base of HERO_BASES){
    const url = await firstExistingUrl(base, HERO_EXTS);
    if(url && !resolved.includes(url)) resolved.push(url);
    if(resolved.length >= 6) break;
  }

  // Se nada resolver, ainda assim retorna uma lista padrao (relativa)
  return resolved.length ? resolved : [
    "assets/images/bg1.png",
    "assets/images/bg2.png",
    "assets/images/bg3.png",
    "assets/images/bg4.png",
    "assets/images/bg5.png",
    "assets/images/bg6.png"
  ];
}

function firstExistingUrl(base, exts){
  return new Promise((resolve) => {
    let idx = 0;
    const tryNext = () => {
      if(idx >= exts.length) return resolve(null);
      const candidate = base + exts[idx++];
      const img = new Image();
      img.onload = () => resolve(candidate);
      img.onerror = tryNext;
      // cache-bust para evitar cache do navegador/host
      img.src = candidate + "?v=" + Date.now();
    };
    tryNext();
  });
}

const MODALS = {
  pinato: {
    title: "Fausto Pinato (perfil oficial)",
    body: `
      <p><strong>Fonte:</strong> perfil oficial na Câmara.</p>
      <p>Confira o perfil oficial e as proposições relacionadas diretamente na fonte.</p>
    `,
    actions: [
      { label: "Abrir perfil na Câmara", href: LINKS.pinato },
      { label: "Abrir texto do PL", href: LINKS.integra }
    ]
  },
  contran: {
    title: "Contran",
    body: `
      <p>O Contran é o órgão normativo do Sistema Nacional de Trânsito, responsável por regulamentações e diretrizes.</p>
    `,
    actions: []
  },
  ctb: {
    title: "CTB (Código de Trânsito Brasileiro)",
    body: `
      <p>O CTB é a lei base do trânsito no Brasil. O PL 3507/2025 propõe alterações no CTB relacionadas à vistoria.</p>
    `,
    actions: [
      { label: "Abrir texto do PL", href: LINKS.integra }
    ]
  },
  fontes: {
    title: "Fontes oficiais (Câmara)",
    body: `
      <ul>
        <li><a href="${LINKS.enquete}" target="_blank" rel="noopener">Enquete do PL 3507/2025</a></li>
        <li><a href="${LINKS.integra}" target="_blank" rel="noopener">Íntegra / Avulso do PL</a></li>
        <li><a href="${LINKS.pinato}" target="_blank" rel="noopener">Perfil do deputado (autor)</a></li>
      </ul>
    `,
    actions: []
  }
};

const $ = (q) => document.querySelector(q);

// ======= SETUP LINKS =======
$("#btnEnquete").href = LINKS.enquete;
$("#btnEnquete2").href = LINKS.enquete;
$("#btnEnquete3").href = LINKS.enquete;
$("#linkIntegra").href = LINKS.integra;

// ======= HERO ROTATOR =======
const heroBg = document.getElementById("heroBg");
let heroIdx = 0;

function setHeroBg(src){
  heroBg.style.opacity = "0";
  setTimeout(() => {
    heroBg.style.backgroundImage = `url('${src}')`;
    heroBg.style.opacity = "1";
  }, 220);
}

(async () => {
  const HERO_IMAGES = await resolveHeroUrls();
  setHeroBg(HERO_IMAGES[0]);
  setInterval(() => {
    heroIdx = (heroIdx + 1) % HERO_IMAGES.length;
    setHeroBg(HERO_IMAGES[heroIdx]);
  }, 5200);
})();

// ======= ACCORDIONS =======
document.querySelectorAll("[data-acc]").forEach(btn => {
  btn.addEventListener("click", () => btn.classList.toggle("open"));
});

// ======= MODAL =======
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalActions = document.getElementById("modalActions");

function openModal(key){
  const m = MODALS[key];
  if(!m) return;
  modalTitle.textContent = m.title;
  modalBody.innerHTML = m.body;

  modalActions.innerHTML = "";
  (m.actions || []).forEach(a => {
    const el = document.createElement("a");
    el.className = "btn primary";
    el.href = a.href;
    el.target = "_blank";
    el.rel = "noopener";
    el.textContent = a.label;
    modalActions.appendChild(el);
  });

  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
}

function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
}

$("#modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if(e.target === modal) closeModal(); });

document.querySelectorAll("[data-modal]").forEach(a => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(a.dataset.modal);
  });
});

$("#btnInfo").addEventListener("click", () => openModal("fontes"));

// ======= SHARE =======
$("#btnShare").addEventListener("click", async () => {
  const shareData = {
    title: document.title,
    text: "Vote na enquete oficial e acompanhe o PL 3507/2025.",
    url: window.location.href
  };
  try{
    if(navigator.share) await navigator.share(shareData);
    else alert("Copie o link do navegador e compartilhe.");
  }catch{}
});
