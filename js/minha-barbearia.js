// Funcionalidades para Minha Barbearia

// Variáveis globais
let calendarCurrentMonth = new Date();
let totalCortesMes = 0;
let faturamentoMes = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Concede todas as permissões ao iniciar (para desenvolvimento)
    concederTodasPermissoes();
    
    // Verifica permissões
    if (!verificarPermissaoMinhaBarbearia()) {
        mostrarNotificacao('Você não tem permissões para acessar esta área. Faça o cadastro da barbearia primeiro.', 'error');
        window.location.href = 'cadastro.html';
        return;
    }
    
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
    
    // Inicializa as seções
    inicializarNavegacaoSecoes();
    
    // Inicializa o calendário mensal
    inicializarCalendarioMensal();
    
    // Carrega a agenda para hoje
    carregarAgendaHoje();
    
    // Evento para adicionar serviço
    const btnAdicionarServico = document.getElementById('btnAdicionarNovoServico');
    if (btnAdicionarServico) {
        btnAdicionarServico.addEventListener('click', adicionarNovoServico);
    }
    
    // Carrega os serviços
    carregarServicos();
    
    // Carrega as configurações
    carregarConfiguracoes();
    
    // Evento para salvar configurações
    const btnSalvarConfig = document.getElementById('btnSalvarConfig');
    if (btnSalvarConfig) {
        btnSalvarConfig.addEventListener('click', salvarConfiguracoes);
    }
    
    // Carrega as configurações de expediente
    carregarConfiguracoesExpediente();
    
    // Evento para salvar configurações de expediente
    const btnSalvarExpediente = document.getElementById('btnSalvarExpediente');
    if (btnSalvarExpediente) {
        btnSalvarExpediente.addEventListener('click', salvarConfiguracoesExpediente);
    }
    
    // Carrega os serviços para o formulário de agendamento manual
    carregarServicosAgendamentoManual();
    
    // Evento para agendamento manual
    const btnAgendarManual = document.getElementById('btnAgendarManual');
    if (btnAgendarManual) {
        btnAgendarManual.addEventListener('click', adicionarAgendamentoManual);
    }
    
    // Evento para apagar agendamentos futuros
    const btnApagarFuturos = document.getElementById('btnApagarFuturos');
    if (btnApagarFuturos) {
        btnApagarFuturos.addEventListener('click', apagarAgendamentosFuturos);
    }
    
    // Calcula estatísticas do mês
    calcularEstatisticasMes();
});

// Inicialização das seções
function inicializarNavegacaoSecoes() {
    const btnMenus = document.querySelectorAll('.btn-menu-section');
    
    btnMenus.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove classe active de todos os botões
            btnMenus.forEach(b => b.classList.remove('active'));
            
            // Adiciona classe active no botão clicado
            btn.classList.add('active');
            
            // Obtém a seção a ser mostrada
            const secaoId = btn.dataset.section;
            
            // Esconde todas as seções
            const secoes = document.querySelectorAll('.barbearia-section');
            secoes.forEach(secao => secao.classList.remove('active'));
            
            // Mostra a seção correspondente
            document.getElementById('secao' + secaoId.charAt(0).toUpperCase() + secaoId.slice(1)).classList.add('active');
        });
    });
}

// Inicialização do calendário mensal
function inicializarCalendarioMensal() {
    atualizarCalendarioMensal();
    
    // Event listeners para navegação entre meses
    document.getElementById('prevMonth').addEventListener('click', () => {
        calendarCurrentMonth.setMonth(calendarCurrentMonth.getMonth() - 1);
        atualizarCalendarioMensal();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        calendarCurrentMonth.setMonth(calendarCurrentMonth.getMonth() + 1);
        atualizarCalendarioMensal();
    });
}

// Atualiza o calendário mensal
function atualizarCalendarioMensal() {
    // Atualiza o título do mês
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const mesAno = `${meses[calendarCurrentMonth.getMonth()]} ${calendarCurrentMonth.getFullYear()}`;
    document.getElementById('currentMonth').textContent = mesAno;
    
    // Limpa os dias do calendário
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // Obtém o primeiro dia do mês atual
    const firstDay = new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth(), 1);
    // Obtém o último dia do mês atual
    const lastDay = new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth() + 1, 0);
    
    // Dia da semana do primeiro dia (0-6)
    const firstDayOfWeek = firstDay.getDay();
    
    // Adiciona os dias do mês anterior para completar a primeira semana
    const prevMonth = new Date(calendarCurrentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthLastDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.className = 'dia outro-mes dia-passado';
        dayElement.textContent = prevMonthLastDay - i;
        calendarDays.appendChild(dayElement);
    }
    
    // Adiciona os dias do mês atual
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Normaliza a data para comparação
    const agendamentos = JSON.parse(localStorage.getItem('barbAgendamentos') || '[]');
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'dia';
        dayElement.textContent = i;
        
        // Cria um objeto de data para o dia atual do loop
        const diaAtual = new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth(), i);
        diaAtual.setHours(0, 0, 0, 0); // Normaliza para comparação
        
        // Verificar se é dia passado
        if (diaAtual < hoje) {
            dayElement.classList.add('dia-passado');
        }
        
        // Verificar se é hoje
        if (hoje.getDate() === i && hoje.getMonth() === calendarCurrentMonth.getMonth() && hoje.getFullYear() === calendarCurrentMonth.getFullYear()) {
            dayElement.classList.add('hoje');
        }
        
        // Verificar se há agendamentos neste dia
        const diaFormatado = diaAtual.toISOString().split('T')[0];
        
        const temAgendamento = agendamentos.some(agendamento => {
            // Converter a data do agendamento para um formato comparável
            const partes = agendamento.data.split('/');
            if (partes.length !== 3) return false;
            
            const dia = parseInt(partes[0]);
            const mes = partes[1].toLowerCase();
            const ano = parseInt(partes[2]);
            
            const meses = {
                'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
                'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
            };
            
            const dataAgendamento = new Date(ano, meses[mes], dia);
            const dataAgendamentoFormatada = dataAgendamento.toISOString().split('T')[0];
            
            return dataAgendamentoFormatada === diaFormatado;
        });
        
        if (temAgendamento) {
            dayElement.classList.add('com-agendamento');
        }
        
        // Adiciona evento de clique para selecionar o dia (apenas para dias não passados)
        if (!dayElement.classList.contains('dia-passado')) {
            dayElement.addEventListener('click', () => {
                // Remove seleção anterior
                document.querySelectorAll('.calendario-dias .dia.selecionado').forEach(el => {
                    el.classList.remove('selecionado');
                });
                
                // Adiciona classe selecionado
                dayElement.classList.add('selecionado');
                
                // Carrega agendamentos para este dia
                carregarAgendamentosPorData(diaAtual);
                
                // Atualiza o cabeçalho da agenda
                const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
                const dataFormatada = diaAtual.toLocaleDateString('pt-BR', options);
                
                const agendaData = document.getElementById('agendaData');
                if (agendaData) {
                    // Verifica se é hoje para exibir "Hoje" no título
                    if (diaAtual.toDateString() === hoje.toDateString()) {
                        agendaData.textContent = 'Hoje - ' + dataFormatada;
                    } else {
                        agendaData.textContent = dataFormatada;
                    }
                    
                    // Salva a data para referência
                    agendaData.dataset.data = diaAtual.toISOString();
                }
            });
        }
        
        calendarDays.appendChild(dayElement);
    }
    
    // Adiciona os dias do próximo mês para completar a última semana
    const totalDaysAdded = firstDayOfWeek + lastDay.getDate();
    const remainingDays = 7 - (totalDaysAdded % 7);
    
    if (remainingDays < 7) {
        for (let i = 1; i <= remainingDays; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'dia outro-mes';
            dayElement.textContent = i;
            calendarDays.appendChild(dayElement);
        }
    }
}

// Cálculo de estatísticas do mês atual
function calcularEstatisticasMes() {
    const agendamentos = JSON.parse(localStorage.getItem('barbAgendamentos') || '[]');
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    // Filtrar agendamentos do mês atual que foram confirmados
    const agendamentosConfirmados = agendamentos.filter(agendamento => {
        // Converter a data do agendamento para um objeto Date
        const partes = agendamento.data.split('/');
        if (partes.length !== 3) return false;
        
        const dia = parseInt(partes[0]);
        const mesStr = partes[1].toLowerCase();
        const ano = parseInt(partes[2]);
        
        const meses = {
            'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
            'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
        };
        
        const mesAgendamento = meses[mesStr];
        
        // Verificar se o agendamento é do mês atual e foi confirmado
        return mesAgendamento === mesAtual && 
               ano === anoAtual && 
               agendamento.statusConfirmacao === 'confirmado';
    });
    
    // Calcular total de cortes e faturamento
    totalCortesMes = agendamentosConfirmados.length;
    faturamentoMes = agendamentosConfirmados.reduce((total, agendamento) => {
        return total + (parseFloat(agendamento.valor) || 0);
    }, 0);
    
    // Atualizar os elementos na interface
    document.getElementById('totalCortesMes').textContent = totalCortesMes;
    document.getElementById('faturamentoMes').textContent = `R$ ${faturamentoMes.toFixed(2)}`;
}

// Carrega os serviços para o select do agendamento manual
function carregarServicosAgendamentoManual() {
    const servicos = JSON.parse(localStorage.getItem('barbServicos') || '[]');
    const selectServico = document.getElementById('agendaManualServico');
    
    if (selectServico) {
        // Limpar opções anteriores
        selectServico.innerHTML = '';
        
        // Adicionar opção padrão
        const optionDefault = document.createElement('option');
        optionDefault.value = '';
        optionDefault.textContent = 'Selecione um serviço';
        selectServico.appendChild(optionDefault);
        
        // Adicionar serviços como opções
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = JSON.stringify({
                nome: servico.nome,
                tempo: servico.tempo,
                valor: servico.valor
            });
            option.textContent = `${servico.nome} - ${servico.tempo}min - R$ ${servico.valor}`;
            selectServico.appendChild(option);
        });
        
        // Evento para atualizar o tempo quando o serviço for selecionado
        selectServico.addEventListener('change', () => {
            if (selectServico.value) {
                const servicoSelecionado = JSON.parse(selectServico.value);
                document.getElementById('agendaManualTempo').value = servicoSelecionado.tempo || 30;
            }
        });
    }
}

// Adição de um agendamento manual
function adicionarAgendamentoManual() {
    // Capturar valores do formulário
    const data = document.getElementById('agendaManualData').value;
    const hora = document.getElementById('agendaManualHora').value;
    const servicoValue = document.getElementById('agendaManualServico').value;
    const tempo = document.getElementById('agendaManualTempo').value;
    const cliente = document.getElementById('agendaManualCliente').value;
    const telefone = document.getElementById('agendaManualTelefone').value;
    const observacoes = document.getElementById('agendaManualObs').value;
    const isMensal = document.getElementById('agendaMensal').checked;
    
    // Validar dados
    if (!data || !hora || !servicoValue || !cliente || !telefone) {
        mostrarNotificacao('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Obter informações do serviço
    const servicoObj = JSON.parse(servicoValue);
    
    // Verificar se deve criar agendamentos mensais
    if (isMensal) {
        criarAgendamentosMensais(data, hora, servicoObj, tempo, cliente, telefone, observacoes);
    } else {
        // Criar apenas um agendamento
        criarAgendamento(data, hora, servicoObj, tempo, cliente, telefone, observacoes);
    }
    
    // Limpar formulário
    document.getElementById('agendaManualData').value = '';
    document.getElementById('agendaManualHora').value = '';
    document.getElementById('agendaManualServico').value = '';
    document.getElementById('agendaManualTempo').value = '30';
    document.getElementById('agendaManualCliente').value = '';
    document.getElementById('agendaManualTelefone').value = '';
    document.getElementById('agendaManualObs').value = '';
    document.getElementById('agendaMensal').checked = false;
    
    // Recarregar a agenda
    const dataObj = new Date(data + 'T00:00:00');
    if (document.getElementById('agendaData').dataset.data && 
        dataObj.toDateString() === new Date(document.getElementById('agendaData').dataset.data).toDateString()) {
        carregarAgendamentosPorData(dataObj);
    }
    
    // Atualizar o calendário
    atualizarCalendarioMensal();
}

// Função para criar múltiplos agendamentos mensais
function criarAgendamentosMensais(data, hora, servicoObj, tempo, cliente, telefone, observacoes) {
    const dataInicial = new Date(data + 'T00:00:00');
    const diaDoMes = dataInicial.getDate();
    const anoAtual = dataInicial.getFullYear();
    
    // Verificando quantos meses restam até o final do ano
    const mesesRestantes = 12 - dataInicial.getMonth();
    
    // Criar agendamentos para os meses restantes do ano
    let agendamentosAdicionados = 0;
    let conflitosEncontrados = 0;
    
    // Criar agendamentos para cada mês
    for (let i = 0; i < mesesRestantes; i++) {
        // Cria uma nova data para o mês atual
        const novaData = new Date(anoAtual, dataInicial.getMonth() + i, diaDoMes);
        
        // Verifica se a data é válida (alguns meses têm menos de 31 dias)
        if (novaData.getDate() !== diaDoMes) {
            continue; // Pula este mês se o dia não existir (ex: 31 de fevereiro)
        }
        
        // Tenta criar o agendamento para este mês
        const resultado = criarAgendamento(
            novaData.toISOString().split('T')[0], 
            hora, 
            servicoObj, 
            tempo, 
            cliente, 
            telefone, 
            observacoes,
            true // modo silencioso - sem alertas individuais
        );
        
        if (resultado.sucesso) {
            agendamentosAdicionados++;
        } else {
            conflitosEncontrados++;
        }
    }
    
    // Exibe uma mensagem com o resumo das operações
    mostrarNotificacao(`Agendamentos mensais: ${agendamentosAdicionados} adicionados com sucesso.\n${conflitosEncontrados > 0 ? `${conflitosEncontrados} não foram criados devido a conflitos de horário.` : ''}`);
}

// Função para criar um único agendamento
function criarAgendamento(data, hora, servicoObj, tempo, cliente, telefone, observacoes, silencioso = false) {
    // Converter data para o formato usado no sistema (dia/mês por extenso/ano)
    const dataObj = new Date(data + 'T00:00:00');
    const dia = dataObj.getDate();
    
    const meses = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();
    const dataFormatada = `${dia}/${mes}/${ano}`;
    
    // Criar objeto de agendamento
    const agendamento = {
        data: dataFormatada,
        hora: hora,
        servico: servicoObj.nome,
        tempo: tempo,
        valor: servicoObj.valor,
        cliente: cliente,
        telefone: telefone,
        observacoes: observacoes,
        statusConfirmacao: 'pendente',
        dataCriacao: new Date().toISOString(),
        status: 'agendado',
        manual: true
    };
    
    // Verificar conflito de horários
    const agendamentos = JSON.parse(localStorage.getItem('barbAgendamentos') || '[]');
    
    const conflito = agendamentos.some(ag => {
        // Verificar se é no mesmo dia
        if (ag.data !== dataFormatada) return false;
        
        // Converter hora do agendamento para minutos
        const [horaAg, minAg] = ag.hora.split(':').map(Number);
        const inicioAg = horaAg * 60 + minAg;
        const fimAg = inicioAg + parseInt(ag.tempo || 30);
        
        // Converter hora do novo agendamento para minutos
        const [horaNovo, minNovo] = hora.split(':').map(Number);
        const inicioNovo = horaNovo * 60 + minNovo;
        const fimNovo = inicioNovo + parseInt(tempo);
        
        // Verificar sobreposição de horários
        return (inicioNovo < fimAg && fimNovo > inicioAg);
    });
    
    if (conflito) {
        if (!silencioso) {
            mostrarNotificacao(`Já existe um agendamento em ${dataFormatada} às ${hora}. Por favor, escolha outro horário.`, 'warning');
        }
        return { sucesso: false, motivo: 'conflito' };
    }
    
    // Adicionar agendamento à lista
    agendamentos.push(agendamento);
    
    // Salvar no localStorage
    localStorage.setItem('barbAgendamentos', JSON.stringify(agendamentos));
    
    // Mostrar alerta apenas se não estiver em modo silencioso
    if (!silencioso) {
        mostrarNotificacao('Agendamento adicionado com sucesso!');
    }
    
    return { sucesso: true };
}

// Função para apagar agendamentos futuros (a partir do próximo mês)
function apagarAgendamentosFuturos() {
    // Cria um modal customizado para entrada do telefone
    const modalHTML = `
        <div class="modal-overlay" id="modalVerificacao">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Verificação Necessária</h3>
                    <button class="modal-fechar" id="fecharModal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Digite o número de telefone do cliente para verificação:</p>
                    <input type="tel" id="inputTelefoneVerificacao" placeholder="(00) 00000-0000" class="modal-input">
                </div>
                <div class="modal-footer">
                    <button class="btn-cancelar" id="btnCancelarVerificacao">Cancelar</button>
                    <button class="btn-confirmar" id="btnConfirmarVerificacao">Verificar</button>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona o modal ao corpo do documento
    const modalTemp = document.createElement('div');
    modalTemp.innerHTML = modalHTML;
    document.body.appendChild(modalTemp.firstElementChild);
    
    // Referências aos elementos do modal
    const modal = document.getElementById('modalVerificacao');
    const inputTelefone = document.getElementById('inputTelefoneVerificacao');
    const btnConfirmar = document.getElementById('btnConfirmarVerificacao');
    const btnCancelar = document.getElementById('btnCancelarVerificacao');
    const btnFechar = document.getElementById('fecharModal');
    
    // Função para fechar o modal
    const fecharModal = () => {
        modal.classList.add('fadeOut');
        setTimeout(() => modal.remove(), 300);
    };
    
    // Event listeners
    btnFechar.addEventListener('click', fecharModal);
    btnCancelar.addEventListener('click', () => {
        fecharModal();
        mostrarNotificacao('Verificação cancelada. Nenhum agendamento foi removido.', 'warning');
    });
    
    // Lógica de verificação quando confirmar
    btnConfirmar.addEventListener('click', () => {
        const telefoneVerificacao = inputTelefone.value.trim();
        
        if (!telefoneVerificacao) {
            mostrarNotificacao('Por favor, digite um número de telefone válido.', 'error');
            return;
        }
        
        fecharModal();
        
        // Buscar todos os agendamentos
        const agendamentos = JSON.parse(localStorage.getItem('barbAgendamentos') || '[]');
        
        // Encontrar agendamentos com este número de telefone
        const agendamentosDoCliente = agendamentos.filter(agendamento => 
            agendamento.telefone === telefoneVerificacao
        );
        
        if (agendamentosDoCliente.length === 0) {
            mostrarNotificacao('Não foram encontrados agendamentos com este número de telefone.', 'warning');
            return;
        }
        
        // Criar modal de confirmação
        const confirmarHTML = `
            <div class="modal-overlay" id="modalConfirmacao">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Confirmação</h3>
                        <button class="modal-fechar" id="fecharModalConfirmacao">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Encontramos ${agendamentosDoCliente.length} agendamento(s) com este número.</p>
                        <p>Tem certeza que deseja apagar todos os agendamentos futuros a partir do próximo mês?</p>
                        <p class="texto-alerta">Esta ação não pode ser desfeita!</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancelar" id="btnCancelarConfirmacao">Cancelar</button>
                        <button class="btn-confirmar btn-apagar" id="btnConfirmarExclusao">Sim, apagar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Adiciona o modal de confirmação
        const confirmTemp = document.createElement('div');
        confirmTemp.innerHTML = confirmarHTML;
        document.body.appendChild(confirmTemp.firstElementChild);
        
        // Referências aos elementos do modal de confirmação
        const modalConfirm = document.getElementById('modalConfirmacao');
        const btnFecharConfirm = document.getElementById('fecharModalConfirmacao');
        const btnCancelarConfirm = document.getElementById('btnCancelarConfirmacao');
        const btnExcluir = document.getElementById('btnConfirmarExclusao');
        
        // Função para fechar o modal de confirmação
        const fecharConfirmacao = () => {
            modalConfirm.classList.add('fadeOut');
            setTimeout(() => modalConfirm.remove(), 300);
        };
        
        // Event listeners do modal de confirmação
        btnFecharConfirm.addEventListener('click', fecharConfirmacao);
        btnCancelarConfirm.addEventListener('click', fecharConfirmacao);
        
        // Lógica de exclusão quando confirmar
        btnExcluir.addEventListener('click', () => {
            fecharConfirmacao();
            
            // Calcular o primeiro dia do próximo mês
            const dataAtual = new Date();
            const proximoMes = new Date(dataAtual);
            proximoMes.setMonth(dataAtual.getMonth() + 1);
            proximoMes.setDate(1); // Primeiro dia do próximo mês
            proximoMes.setHours(0, 0, 0, 0); // Início do dia
            
            // Filtrar agendamentos a manter (anteriores ao próximo mês ou que não são do cliente)
            const agendamentosParaManter = agendamentos.filter(agendamento => {
                // Se não for do cliente, manter
                if (agendamento.telefone !== telefoneVerificacao) return true;
                
                // Converter a data do agendamento para um objeto Date
                const partes = agendamento.data.split('/');
                if (partes.length !== 3) return true; // manter se formato inválido
                
                const dia = parseInt(partes[0]);
                const mesStr = partes[1].toLowerCase();
                const ano = parseInt(partes[2]);
                
                const meses = {
                    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
                    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
                };
                
                const mesIndex = meses[mesStr];
                if (mesIndex === undefined) return true; // manter se mês inválido
                
                // Criar data do agendamento
                const dataAgendamento = new Date(ano, mesIndex, dia);
                dataAgendamento.setHours(0, 0, 0, 0); // Início do dia
                
                // Manter se for anterior ao próximo mês
                return dataAgendamento < proximoMes;
            });
            
            // Calcular quantos foram removidos
            const quantidadeRemovida = agendamentos.length - agendamentosParaManter.length;
            
            // Salvar a lista atualizada
            localStorage.setItem('barbAgendamentos', JSON.stringify(agendamentosParaManter));
            
            // Recarregar a agenda e calendário
            if (document.getElementById('agendaData').dataset.data) {
                const dataExibida = new Date(document.getElementById('agendaData').dataset.data);
                carregarAgendamentosPorData(dataExibida);
            }
            
            // Atualizar o calendário
            atualizarCalendarioMensal();
            
            // Informar o usuário
            mostrarNotificacao(`${quantidadeRemovida} agendamento(s) futuros do cliente foram removidos com sucesso.\nTodos os agendamentos do mês atual foram preservados.`, 'success');
        });
    });
    
    // Foco no input do telefone
    setTimeout(() => inputTelefone.focus(), 100);
}

// Confirmação de atendimento
function confirmarAtendimento(id, status) {
    const agendamentos = JSON.parse(localStorage.getItem('barbAgendamentos') || '[]');
    
    // Encontrar e atualizar o status do agendamento
    const agendamentoIndex = agendamentos.findIndex(ag => ag.dataCriacao === id);
    
    if (agendamentoIndex >= 0) {
        agendamentos[agendamentoIndex].statusConfirmacao = status;
        
        // Atualizar localStorage
        localStorage.setItem('barbAgendamentos', JSON.stringify(agendamentos));
        
        // Recarregar agendamentos
        const dataAtual = new Date(document.getElementById('agendaData').dataset.data);
        carregarAgendamentosPorData(dataAtual);
        
        // Recalcular estatísticas
        calcularEstatisticasMes();
    }
}

// Carrega os agendamentos para uma data específica
function carregarAgendamentosPorData(data) {
    // Formata a data para comparação (ano-mes-dia)
    const dataFormatada = data.toISOString().split('T')[0];
    
    // Busca todos os agendamentos
    const agendamentos = JSON.parse(localStorage.getItem('barbAgendamentos') || '[]');
    
    // Filtra os agendamentos da data selecionada
    const agendamentosDoDia = agendamentos.filter(agendamento => {
        // Converte a data do agendamento para um formato comparável
        const partes = agendamento.data.split('/');
        if (partes.length !== 3) return false;
        
        const dia = parseInt(partes[0]);
        const mes = partes[1].toLowerCase();
        const ano = parseInt(partes[2]);
        
        const meses = {
            'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
            'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
        };
        
        const dataAgendamento = new Date(ano, meses[mes], dia);
        const dataAgendamentoFormatada = dataAgendamento.toISOString().split('T')[0];
        
        return dataAgendamentoFormatada === dataFormatada;
    });
    
    // Ordena os agendamentos por hora
    agendamentosDoDia.sort((a, b) => a.hora.localeCompare(b.hora));
    
    // Pega as referências dos elementos
    const listaAgendamentos = document.getElementById('listaAgendamentos');
    const semAgendamentos = document.getElementById('semAgendamentos');
    
    // Verifica se há agendamentos
    if (agendamentosDoDia.length === 0) {
        if (listaAgendamentos) listaAgendamentos.innerHTML = '';
        if (semAgendamentos) semAgendamentos.style.display = 'block';
        return;
    }
    
    // Exibe os agendamentos
    if (semAgendamentos) semAgendamentos.style.display = 'none';
    
    if (listaAgendamentos) {
        listaAgendamentos.innerHTML = '';
        
        // Hora atual para destacar o agendamento atual
        const horaAtual = new Date();
        
        // Adiciona cada agendamento à lista
        agendamentosDoDia.forEach(agendamento => {
            // Verifica se é o agendamento atual
            const horaAgendamento = agendamento.hora.split(':');
            const dataHoraAgendamento = new Date(data);
            dataHoraAgendamento.setHours(parseInt(horaAgendamento[0]), parseInt(horaAgendamento[1]), 0, 0);
            
            const duracao = agendamento.tempo || 30; // Tempo padrão: 30 minutos
            const fimAgendamento = new Date(dataHoraAgendamento);
            fimAgendamento.setMinutes(fimAgendamento.getMinutes() + parseInt(duracao));
            
            const isAgendamentoAtual = horaAtual >= dataHoraAgendamento && horaAtual <= fimAgendamento;
            
            // Cria o elemento de agendamento
            const li = document.createElement('li');
            li.className = 'agenda-item';
            if (isAgendamentoAtual) {
                li.classList.add('atual');
            }
            
            // Determina a classe de status para o agendamento
            let statusClass = '';
            if (agendamento.statusConfirmacao === 'confirmado') {
                statusClass = 'status-confirmado';
            } else if (agendamento.statusConfirmacao === 'faltou') {
                statusClass = 'status-faltou';
            } else {
                statusClass = 'status-pendente';
            }
            
            // Formata o conteúdo do agendamento
            li.innerHTML = `
                <div class="agenda-horario">${agendamento.hora}</div>
                <div class="agenda-cliente">
                    <div class="agenda-cliente-nome">${agendamento.cliente}</div>
                    <div class="agenda-cliente-telefone">${agendamento.telefone}</div>
                </div>
                <div class="agenda-servico">${agendamento.servico || ''} (${agendamento.tempo || 30}min)</div>
                <div class="agenda-valor">R$ ${agendamento.valor || '0.00'}</div>
                <div class="agenda-status-container">
                    <div class="agenda-status ${statusClass}">
                        ${agendamento.statusConfirmacao === 'confirmado' ? 'Confirmado' : 
                          agendamento.statusConfirmacao === 'faltou' ? 'Faltou' : 'Pendente'}
                    </div>
                    <div class="agenda-acoes">
                        <button class="btn-confirmacao btn-confirmado" onclick="confirmarAtendimento('${agendamento.dataCriacao}', 'confirmado')">✓</button>
                        <button class="btn-confirmacao btn-faltou" onclick="confirmarAtendimento('${agendamento.dataCriacao}', 'faltou')">✗</button>
                    </div>
                </div>
            `;
            
            listaAgendamentos.appendChild(li);
        });
    }
}

// Carrega os serviços cadastrados
function carregarServicos() {
    const listaServicos = document.getElementById('listaServicosGerenciar');
    if (!listaServicos) return;
    
    // Limpa a lista
    listaServicos.innerHTML = '';
    
    // Busca os serviços
    const servicos = JSON.parse(localStorage.getItem('barbServicos') || '[]');
    
    if (servicos.length === 0) {
        listaServicos.innerHTML = '<p>Nenhum serviço cadastrado.</p>';
        return;
    }
    
    // Adiciona cada serviço à lista
    servicos.forEach((servico, index) => {
        const itemServico = document.createElement('div');
        itemServico.className = 'servico-admin-item';
        
        itemServico.innerHTML = `
            <div class="servico-admin-nome">${servico.nome}</div>
            <div class="servico-admin-tempo">${servico.tempo} min</div>
            <div class="servico-admin-valor">R$ ${servico.valor.toFixed(2)}</div>
            <div class="servico-admin-acoes">
                <button class="btn-editar" onclick="editarServico(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-remover" onclick="removerServico(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        listaServicos.appendChild(itemServico);
    });
}

// Adicionar novo serviço
function adicionarNovoServico() {
    // Captura os valores dos campos
    const nome = document.getElementById('novoServicoNome').value.trim();
    const tempo = parseInt(document.getElementById('novoServicoTempo').value);
    const valor = parseFloat(document.getElementById('novoServicoValor').value);
    
    // Validação básica
    if (!nome || isNaN(tempo) || isNaN(valor)) {
        mostrarNotificacao('Por favor, preencha todos os campos corretamente.', 'error');
        return;
    }
    
    // Cria o objeto do serviço
    const novoServico = {
        nome,
        tempo,
        valor
    };
    
    // Recupera os serviços existentes
    let servicos = JSON.parse(localStorage.getItem('barbServicos') || '[]');
    
    // Adiciona o novo serviço
    servicos.push(novoServico);
    
    // Salva no localStorage
    localStorage.setItem('barbServicos', JSON.stringify(servicos));
    
    // Limpa os campos
    document.getElementById('novoServicoNome').value = '';
    document.getElementById('novoServicoTempo').value = '30';
    document.getElementById('novoServicoValor').value = '';
    
    // Recarrega a lista de serviços
    carregarServicos();
    
    mostrarNotificacao('Serviço adicionado com sucesso!');
}

// Editar serviço
function editarServico(index) {
    // Recupera os serviços
    const servicos = JSON.parse(localStorage.getItem('barbServicos') || '[]');
    
    if (index >= 0 && index < servicos.length) {
        const servico = servicos[index];
        
        // Preenche os campos com os dados do serviço
        document.getElementById('novoServicoNome').value = servico.nome;
        document.getElementById('novoServicoTempo').value = servico.tempo;
        document.getElementById('novoServicoValor').value = servico.valor;
        
        // Altera o texto do botão
        const btnAdicionar = document.getElementById('btnAdicionarNovoServico');
        btnAdicionar.textContent = 'Atualizar Serviço';
        btnAdicionar.dataset.editIndex = index;
        
        // Remove o event listener antigo
        btnAdicionar.removeEventListener('click', adicionarNovoServico);
        
        // Adiciona um novo event listener para a atualização
        btnAdicionar.addEventListener('click', function atualizarServico() {
            // Captura os valores dos campos
            const nome = document.getElementById('novoServicoNome').value.trim();
            const tempo = parseInt(document.getElementById('novoServicoTempo').value);
            const valor = parseFloat(document.getElementById('novoServicoValor').value);
            
            // Validação básica
            if (!nome || isNaN(tempo) || isNaN(valor)) {
                mostrarNotificacao('Por favor, preencha todos os campos corretamente.', 'error');
                return;
            }
            
            // Atualiza o serviço
            servicos[index] = {
                nome,
                tempo,
                valor
            };
            
            // Salva no localStorage
            localStorage.setItem('barbServicos', JSON.stringify(servicos));
            
            // Limpa os campos
            document.getElementById('novoServicoNome').value = '';
            document.getElementById('novoServicoTempo').value = '30';
            document.getElementById('novoServicoValor').value = '';
            
            // Restaura o texto do botão
            btnAdicionar.textContent = 'Adicionar Serviço';
            delete btnAdicionar.dataset.editIndex;
            
            // Remove este event listener
            btnAdicionar.removeEventListener('click', atualizarServico);
            
            // Restaura o event listener original
            btnAdicionar.addEventListener('click', adicionarNovoServico);
            
            // Recarrega a lista de serviços
            carregarServicos();
            
            mostrarNotificacao('Serviço atualizado com sucesso!');
        });
    }
}

// Remover serviço
function removerServico(index) {
    // Confirmação
    if (!confirm('Você realmente deseja remover este serviço?')) {
        return;
    }
    
    // Recupera os serviços
    let servicos = JSON.parse(localStorage.getItem('barbServicos') || '[]');
    
    if (index >= 0 && index < servicos.length) {
        // Remove o serviço
        servicos.splice(index, 1);
        
        // Salva no localStorage
        localStorage.setItem('barbServicos', JSON.stringify(servicos));
        
        // Recarrega a lista de serviços
        carregarServicos();
        
        mostrarNotificacao('Serviço removido com sucesso!');
    }
}

// Carrega as configurações da barbearia
function carregarConfiguracoes() {
    // Recupera as configurações
    const config = JSON.parse(localStorage.getItem('barbUsuario') || '{}');
    
    // Preenche os campos
    if (config.nomeBarbearia) document.getElementById('configNomeBarbearia').value = config.nomeBarbearia;
    if (config.nomeResponsavel) document.getElementById('configNomeResponsavel').value = config.nomeResponsavel;
    if (config.telefone) document.getElementById('configTelefone').value = config.telefone;
    if (config.endereco) document.getElementById('configEndereco').value = config.endereco;
    if (config.descricao) document.getElementById('configDescricao').value = config.descricao;
}

// Salva as configurações da barbearia
function salvarConfiguracoes() {
    // Captura os valores dos campos
    const nomeBarbearia = document.getElementById('configNomeBarbearia').value.trim();
    const nomeResponsavel = document.getElementById('configNomeResponsavel').value.trim();
    const telefone = document.getElementById('configTelefone').value.trim();
    const endereco = document.getElementById('configEndereco').value.trim();
    const descricao = document.getElementById('configDescricao').value.trim();
    
    // Validação básica
    if (!nomeBarbearia || !telefone) {
        mostrarNotificacao('Por favor, preencha pelo menos o nome da barbearia e o telefone.', 'error');
        return;
    }
    
    // Cria o objeto de configurações
    const config = {
        nomeBarbearia,
        nomeResponsavel,
        telefone,
        endereco,
        descricao
    };
    
    // Salva no localStorage
    localStorage.setItem('barbUsuario', JSON.stringify(config));
    
    mostrarNotificacao('Configurações salvas com sucesso!');
}

// Carrega as configurações de expediente
function carregarConfiguracoesExpediente() {
    // Recupera as configurações de expediente ou usa valores padrão
    const expediente = JSON.parse(localStorage.getItem('barbExpediente') || '{}');
    
    // Configuração dos dias da semana
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    diasSemana.forEach(dia => {
        const checkbox = document.getElementById(dia);
        if (checkbox) {
            if (expediente.diasFuncionamento) {
                checkbox.checked = expediente.diasFuncionamento.includes(dia);
            } else {
                // Padrão: segunda a sábado funcionando, domingo fechado
                checkbox.checked = dia !== 'domingo';
            }
        }
    });
    
    // Configuração dos horários
    if (expediente.horaInicio) document.getElementById('horaInicio').value = expediente.horaInicio;
    if (expediente.horaFim) document.getElementById('horaFim').value = expediente.horaFim;
    if (expediente.intervaloAgendamento) document.getElementById('intervaloAgendamento').value = expediente.intervaloAgendamento;
    if (expediente.inicioAlmoco) document.getElementById('inicioAlmoco').value = expediente.inicioAlmoco;
    if (expediente.fimAlmoco) document.getElementById('fimAlmoco').value = expediente.fimAlmoco;
}

// Salva as configurações de expediente
function salvarConfiguracoesExpediente() {
    // Captura os dias de funcionamento
    const diasFuncionamento = [];
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    
    diasSemana.forEach(dia => {
        const checkbox = document.getElementById(dia);
        if (checkbox && checkbox.checked) {
            diasFuncionamento.push(dia);
        }
    });
    
    // Captura os horários
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFim = document.getElementById('horaFim').value;
    const intervaloAgendamento = document.getElementById('intervaloAgendamento').value;
    const inicioAlmoco = document.getElementById('inicioAlmoco').value;
    const fimAlmoco = document.getElementById('fimAlmoco').value;
    
    // Validação básica
    if (!horaInicio || !horaFim || !intervaloAgendamento) {
        mostrarNotificacao('Por favor, preencha pelo menos os horários de início, fim e o intervalo entre agendamentos.', 'error');
        return;
    }
    
    // Cria o objeto de expediente
    const expediente = {
        diasFuncionamento,
        horaInicio,
        horaFim,
        intervaloAgendamento,
        inicioAlmoco,
        fimAlmoco
    };
    
    // Salva no localStorage
    localStorage.setItem('barbExpediente', JSON.stringify(expediente));
    
    mostrarNotificacao('Configurações de expediente salvas com sucesso!');
    
    // Atualiza a listagem de horários disponíveis
    atualizarCalendarioMensal();
}

// Navegação na agenda
function navegarAgenda(direção) {
    // ... código existente ...
}

// Carrega a agenda para o dia atual
function carregarAgendaHoje() {
    // ... código existente ...
}

// Função global para confirmação de atendimento
window.confirmarAtendimento = confirmarAtendimento;

// Função para mostrar notificações dinâmicas em vez de alerts
function mostrarNotificacao(mensagem, tipo = 'info', titulo = null, tempo = 5000) {
    const container = document.getElementById('notificacaoContainer');
    
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    
    // Definir título baseado no tipo se não for fornecido
    if (!titulo) {
        switch (tipo) {
            case 'success':
                titulo = 'Sucesso!';
                break;
            case 'error':
                titulo = 'Erro!';
                break;
            case 'warning':
                titulo = 'Atenção!';
                break;
            default:
                titulo = 'Informação';
                break;
        }
    }
    
    // Montar HTML da notificação
    notificacao.innerHTML = `
        <div class="notificacao-titulo">${titulo}</div>
        <div class="notificacao-mensagem">${mensagem}</div>
        <button class="notificacao-fechar" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Adicionar ao container
    container.appendChild(notificacao);
    
    // Configurar remoção automática após o tempo especificado
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.classList.add('fadeOut');
            
            // Remover o elemento após a animação
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.remove();
                }
            }, 300);
        }
    }, tempo);
    
    return notificacao;
} 