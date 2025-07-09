const botao = document.getElementById('ativar');
const audio = document.getElementById('alarme');
const status = document.getElementById('status');
const checklist = document.querySelectorAll('input[type=checkbox]');

let alarmeLigado = false;

botao.addEventListener('click', () => {
  alarmeLigado = !alarmeLigado;
    // Ativa ou desativa os checkboxes
  checklist.forEach(cb => cb.disabled = alarmeLigado);
  botao.textContent = alarmeLigado ? "Desativar Alarme" : "Ativar Alarme";
  status.textContent = alarmeLigado ? "Monitorando..." : "Alarme desativado";
  status.className = "status";
  if (alarmeLigado) verificar();
});



async function verificar() {
  if (!alarmeLigado) return;

  const selecionados = Array.from(checklist)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (selecionados.length === 0) {
    status.textContent = "Nenhum item selecionado.";
    status.className = "status alerta";
    setTimeout(verificar, 1000);
    return;
  }

  try {
    const res = await fetch("https://corsproxy.io/?https://growagarden.gg/api/stock");
    const data = await res.json();
    const gear = data.gearStock || [];

    const encontrados = gear.filter(item =>
      selecionados.some(sel => sel.toLowerCase() === item.name.toLowerCase())
    );

    if (encontrados.length > 0) {
      audio.currentTime = 0;
      audio.play().catch(e => console.warn("Erro ao tocar som:", e));
      status.textContent = `Encontrado: ${encontrados.map(e => e.name).join(", ")}`;
      status.className = "status encontrado";
    } else {
      status.textContent = `Nenhum item encontrado: ${selecionados.join(", ")}`;
      status.className = "status nao-encontrado";
    }
  } catch (err) {
    console.error("Erro ao buscar API:", err);
    status.textContent = "Erro ao conectar à API.";
    status.className = "status alerta";
  }

  setTimeout(verificar, 1000); // verifica a cada 1 segundo
}
