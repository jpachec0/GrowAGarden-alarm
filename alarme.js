const botao = document.getElementById('ativar');
const audio = document.getElementById('alarme');
const statusElem = document.getElementById('status');
const checklist = document.querySelectorAll('input[type=checkbox]');

let alarmeLigado = false;
let encontrado = false;
let intervaloSom = null;
let intervaloBusca = null;

botao.addEventListener('click', () => {
  alarmeLigado = !alarmeLigado;

  checklist.forEach(cb => cb.disabled = alarmeLigado);
  botao.textContent = alarmeLigado ? "Desativar Alarme" : "Ativar Alarme";
  statusElem.textContent = alarmeLigado ? "Monitorando..." : "Alarme desativado";
  statusElem.className = "status";

  clearInterval(intervaloSom);
  clearInterval(intervaloBusca);
  encontrado = false;

  if (alarmeLigado) {
    verificar(); 
    intervaloBusca = setInterval(verificar, 15000); 

    intervaloSom = setInterval(() => {
      if (encontrado) {
        audio.currentTime = 0;
        audio.play().catch(e => console.warn("Erro ao tocar som:", e));
      }
    }, 1000);
  }
});

async function verificar() {
  const selecionados = Array.from(checklist)
    .filter(cb => cb.checked)
    .map(cb => cb.value.toLowerCase());

  if (selecionados.length === 0) {
    statusElem.textContent = "Nenhum item selecionado.";
    statusElem.className = "status alerta";
    encontrado = false;
    return;
  }

  try {
    const res = await fetch("https://api.joshlei.com/v2/growagarden/stock");
    const data = await res.json();
    const gear = data.gear_stock || [];
    const seed = data.seed_stock || [];

    const gearsEncontrados = gear.filter(item =>
      selecionados.includes(item.display_name.toLowerCase())
    );

    const seedsEncontrados = seed.filter(item =>
      selecionados.includes(item.display_name.toLowerCase())
    );

    const todosEncontrados = [...gearsEncontrados, ...seedsEncontrados];
    encontrado = todosEncontrados.length > 0;

    if (encontrado) {
      const nomesEncontrados = todosEncontrados.map(e => e.display_name);
      statusElem.textContent = `Encontrados: ${nomesEncontrados.join(", ")}`;
      statusElem.className = "status encontrado";
    } else {
      statusElem.textContent = `Nenhum item encontrado.`;
      statusElem.className = "status nao-encontrado";
    }

  } catch (err) {
    console.error("Erro ao buscar API:", err);
    statusElem.textContent = "Erro ao conectar à API.";
    statusElem.className = "status alerta";
    encontrado = false;
  }
}

