const semanaContainer = document.getElementById('semana');
const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const horarios = [];

for (let h = 7; h <= 20; h++) {
  horarios.push(`${h.toString().padStart(2, '0')}:00`);
}


function obterSemanaAtual() {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));

  const dias = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    dias.push(d);
  }
  return dias;
}

const diaAtual = obterSemanaAtual();
diaAtual.forEach((data, index) => {
  const coluna = document.createElement('div');
  coluna.className = 'flex flex-col gap-2';

  const titulo = document.createElement('h3');
  titulo.className = 'text-center font-semibold mb-2';
  titulo.innerText = `${diasSemana[index]} (${data.toLocaleDateString('pt-BR')})`;
  coluna.appendChild(titulo);

  horarios.forEach(hora => {
    const slot = document.createElement('div');
    slot.className = 'bg-green-500 text-white p-2 rounded cursor-pointer hover:bg-green-600 transition';
    slot.innerText = hora + ' - Disponível';
    slot.onclick = () => abrirModal(hora, slot);
    coluna.appendChild(slot);
  });

  semanaContainer.appendChild(coluna);
});

let slotSelecionado = null;
let horarioSelecionado = '';

function abrirModal(hora, slot) {
  
  if (slot.innerText.includes('Ocupado')) {
    mostrarCard(slot);
    return;
  }

  slotSelecionado = slot;
  horarioSelecionado = hora;
  document.getElementById('modal').classList.remove('hidden');
}

function fecharModal() {
  document.getElementById('modal').classList.add('hidden');
}


// BOTAO PROBLEMÁTICO

function calcularFim(hora) {
  const [h, m] = hora.split(':').map(Number);
  const fim = new Date();
  fim.setHours(h + 1, m, 0);
  return fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

async function salvarColeta() {
  const cliente = document.getElementById('cliente').value;
  const transportadora = document.getElementById('transportadora').value;
  const obs = document.getElementById('obs').value;

  const coluna = slotSelecionado.closest('.flex.flex-col.gap-2');
  const titulo = coluna ? coluna.querySelector('h3') : null;
  if (!titulo) return;

  const colunaDia = titulo.innerText.split(' ')[0];
  const dataDia = titulo.innerText.match(/\((.*?)\)/)[1];

  // 
  const coleta = {
    id: Date.now(),
    cliente,
    transportadora,
    obs,
    dia: colunaDia,
    data: dataDia,
    inicio: horarioSelecionado,
    fim: calcularFim(horarioSelecionado)   // 
  };

  // parte back
  try {
    const response = await fetch('http://127.0.0.1:8000/coletas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coleta)
    });

    if (response.ok) {
      // 
      slotSelecionado.className = 'bg-red-500 text-white p-2 rounded';
      slotSelecionado.innerText = `${coleta.inicio} - Ocupado (${cliente})`;

      const todosSlots = Array.from(coluna.querySelectorAll('div:not(:first-child)'));
      const indexAtual = todosSlots.indexOf(slotSelecionado);
      const proximoSlot = todosSlots[indexAtual + 1];
      if (proximoSlot) {
        proximoSlot.className = 'bg-red-400 text-white p-2 rounded';
        proximoSlot.innerText = `${coleta.fim} - Ocupado (${cliente})`;
      }

      fecharModal();
    }
  } catch (error) {
    console.error('Erro ao salvar coleta:', error);
  }
}


async function carregarColetas() {
  try {
    const response = await fetch('http://127.0.0.1:8000/coletas');
    const dados = await response.json();

    dados.forEach(item => {
      const colunas = document.querySelectorAll('#semana > div');
      colunas.forEach(coluna => {
        const titulo = coluna.querySelector('h3').innerText;
        if (titulo.includes(item.data)) {
          const slots = coluna.querySelectorAll('div:not(:first-child)');
          slots.forEach(slot => {
            if (slot.innerText.startsWith(item.horario)) {
              slot.className = 'bg-red-500 text-white p-2 rounded';
              slot.innerText = `${item.horario} - Ocupado (${item.cliente})`;
              slot.dataset.cliente = item.cliente;
              slot.dataset.transportadora = item.transportadora;
              slot.dataset.obs = item.obs;
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('Erro ao carregar coletas:', error);
  }
}


function mostrarCard(slot) {
  const card = document.createElement('div');
  card.className = `
    fixed bg-white text-gray-800 p-4 rounded-lg shadow-xl border border-gray-200
    transition-opacity duration-300 ease-out opacity-0
  `;
  card.style.left = `${event.clientX + 10}px`;
  card.style.top = `${event.clientY + 10}px`;
  card.innerHTML = `
    <p class="font-semibold text-blue-700 mb-1">${slot.dataset.cliente || 'Sem cliente'}</p>
    <p class="text-sm"><strong>Transportadora:</strong> ${slot.dataset.transportadora || '-'}</p>
    <p class="text-sm"><strong>Observações:</strong> ${slot.dataset.obs || '-'}</p>
  `;
  document.body.appendChild(card);

  // animação de fade-in
  requestAnimationFrame(() => {
    card.classList.remove('opacity-0');
    card.classList.add('opacity-100');
  });

  // desaparece suavemente após 3s
  setTimeout(() => {
    card.classList.remove('opacity-100');
    card.classList.add('opacity-0');
    setTimeout(() => card.remove(), 300);
  }, 3000);
}

window.onload = carregarColetas;
