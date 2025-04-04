// Funcionalidades para Meus Agendamentos

document.addEventListener('DOMContentLoaded', () => {
    // Atualiza a data atual
    atualizarDataAtual();
    
    // Event listeners para o menu
    document.getElementById('barbInicio').addEventListener('click', () => {
        window.location.href = 'index.html';
        closeNav();
    });
    
    document.getElementById('barbCadastro').addEventListener('click', () => {
        window.location.href = 'cadastro.html';
        closeNav();
    });
    
    document.getElementById('barbMinhaBarbearia').addEventListener('click', () => {
        window.location.href = 'minha-barbearia.html';
        closeNav();
    });
    
    document.getElementById('barbMeusAgendamentos').addEventListener('click', () => {
        window.location.href = 'meus-agendamentos.html';
        closeNav();
    });
    
    // Botão para consultar agendamentos
    const btnConsultar = document.getElementById('btnConsultarAgendamentos');
    if (btnConsultar) {
        btnConsultar.addEventListener('click', consultarAgendamentos);
    }
    
    // Verificar se há um telefone salvo no localStorage para pré-popular o campo
    const telefoneConsulta = document.getElementById('consultaTelefone');
    if (telefoneConsulta) {
        const clienteInfo = JSON.parse(localStorage.getItem('barbClienteAtual') || '{}');
        if (clienteInfo.telefone) {
            telefoneConsulta.value = clienteInfo.telefone;
            // Opcionalmente, consultar automaticamente
            consultarAgendamentos();
        }
    }
});

// Função para consultar agendamentos pelo telefone
function consultarAgendamentos() {
    const telefone = document.getElementById('consultaTelefone').value.trim();
    if (!telefone) {
        alert('Por favor, digite seu número de telefone para consultar seus agendamentos.');
        return;
    }
    
    // Salva o telefone no localStorage para consultas futuras
    const clienteInfo = {
        telefone: telefone
    };
    localStorage.setItem('barbClienteConsulta', JSON.stringify(clienteInfo));
    
    // Busca todos os agendamentos
    const agendamentos = JSON.parse(localStorage.getItem('barbAgendamentos') || '[]');
    
    // Filtra os agendamentos pelo telefone informado
    const agendamentosCliente = agendamentos.filter(a => a.telefone === telefone);
    
    // Ordena por data e hora
    agendamentosCliente.sort((a, b) => {
        if (a.data === b.data) {
            return a.hora.localeCompare(b.hora);
        }
        return a.data.localeCompare(b.data);
    });

    // Exibe a seção de agendamentos do cliente
    const clienteAgendamentos = document.getElementById('clienteAgendamentos');
    const listaAgendamentos = document.getElementById('listaAgendamentosCliente');
    const semAgendamentos = document.getElementById('semAgendamentosCliente');
    
    if (clienteAgendamentos) {
        clienteAgendamentos.style.display = 'block';
    }
    
    // Verifica se há agendamentos
    if (agendamentosCliente.length === 0) {
        if (listaAgendamentos) listaAgendamentos.style.display = 'none';
        if (semAgendamentos) semAgendamentos.style.display = 'block';
        return;
    }
    
    // Exibe os agendamentos encontrados
    if (listaAgendamentos) listaAgendamentos.style.display = 'block';
    if (semAgendamentos) semAgendamentos.style.display = 'none';
    
    // Limpa a lista atual
    if (listaAgendamentos) {
        listaAgendamentos.innerHTML = '';
        
        // Adiciona cada agendamento à lista
        agendamentosCliente.forEach((agendamento, index) => {
            const dataObj = new Date(agendamento.data);
            const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', options);
        
            // Verifica se o agendamento já passou e está concluído
            const agora = new Date();
            const dataAgendamento = new Date(agendamento.data + 'T' + agendamento.hora);
            const jaPassou = dataAgendamento < agora;
            
            // Cria o elemento de agendamento
            const itemAgendamento = document.createElement('li');
            itemAgendamento.className = 'agendamento-cliente-item';
        
            // Monta o HTML do item
            itemAgendamento.innerHTML = `
                <div class="agendamento-cliente-cabecalho">
                    <div class="agendamento-cliente-data">${dataFormatada} às ${agendamento.hora}</div>
                    <div class="agendamento-cliente-status ${agendamento.status === 'concluido' ? 'concluido' : ''}">${agendamento.status || 'agendado'}</div>
                </div>
                <div class="agendamento-cliente-detalhes">
                    <p><strong>Nome:</strong> ${agendamento.cliente}</p>
                    <p><strong>Contato:</strong> ${agendamento.telefone}</p>
                    <p><strong>Tipo de serviço:</strong> ${agendamento.servico}</p>
                    <p><strong>Valor:</strong> R$ ${agendamento.valor.toFixed(2)}</p>
                </div>
                <div class="agendamento-cliente-acoes">
                    <button class="btn-excluir-cliente" onclick="excluirAgendamentoCliente(${index}, '${agendamento.cliente}', '${agendamento.data}', '${agendamento.hora}')" ${agendamento.status === 'concluido' || jaPassou ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Cancelar Agendamento
                    </button>
                </div>
            `;
            
            listaAgendamentos.appendChild(itemAgendamento);
        });
    }
}

// Função para excluir um agendamento
function excluirAgendamentoCliente(index, nomeCliente, data, hora) {
    // Confirmar com o cliente
    if (!confirm(`Você realmente deseja cancelar o agendamento para ${data} às ${hora}?`)) {
        return; // Se o cliente cancelar, não faz nada
    }
    
    // Recupera o telefone do cliente
    const clienteInfo = JSON.parse(localStorage.getItem('barbClienteConsulta') || '{}');
    const telefone = clienteInfo.telefone;
    
    // Buscar todos os agendamentos
    const agendamentos = JSON.parse(localStorage.getItem('barbAgendamentos') || '[]');
    
    // Encontrar o índice correto no array completo
    let indiceReal = -1;
    let contadorFiltrado = 0;
    
    for (let i = 0; i < agendamentos.length; i++) {
        if (agendamentos[i].telefone === telefone) {
            if (contadorFiltrado === index) {
                indiceReal = i;
                break;
            }
            contadorFiltrado++;
        }
    }
    
    // Remover o agendamento se encontrado
    if (indiceReal >= 0) {
        agendamentos.splice(indiceReal, 1);
        localStorage.setItem('barbAgendamentos', JSON.stringify(agendamentos));
        
        // Recarregar a lista de agendamentos
        consultarAgendamentos();
        
        alert('Agendamento cancelado com sucesso!');
    } else {
        alert('Ocorreu um erro ao cancelar o agendamento. Por favor, tente novamente.');
    }
} 