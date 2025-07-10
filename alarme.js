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
    .map(cb => cb.value);

  if (selecionados.length === 0) {
    statusElem.textContent = "Nenhum item selecionado.";
    statusElem.className = "status alerta";
    encontrado = false;
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/proxy");
    const data = await res.json();
    const gear = data.gearStock || [];
    const seed = data.seedsStock || [];

    const gearsEncontrados = gear.filter(item =>
      selecionados.some(sel => sel.toLowerCase() === item.name.toLowerCase())
    );

    const seedsEncontrados = seed.filter(item =>
      selecionados.some(sel => sel.toLowerCase() === item.name.toLowerCase())
    );

    if (gearsEncontrados.length > 0 || seedsEncontrados.length > 0) {
      const encontrados = [...gearsEncontrados, ...seedsEncontrados].map(e => e.name);
      const naoEncontrados = selecionados.filter(sel =>
        !encontrados.map(n => n.toLowerCase()).includes(sel.toLowerCase())
      );
      statusElem.textContent = `Encontrados: ${encontrados.join(", ")}`;
      statusElem.className = "status encontrado";
      encontrado = true;
    } else {
      statusElem.textContent = `Nenhum item encontrado.`;
      statusElem.className = "status nao-encontrado";
      encontrado = false;
    }

  } catch (err) {
    console.error("Erro ao buscar API:", err);
    statusElem.textContent = "Erro ao conectar à API.";
    statusElem.className = "status alerta";
    encontrado = false;
  }
}
