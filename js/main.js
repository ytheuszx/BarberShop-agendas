// Variáveis globais
let clienteAtual = {
    nome: '',
    telefone: ''
};
let agendamentoAtual = {
    data: '',
    hora: '',
    servico: '',
    tempo: 0,
    valor: 0
};

// Modelos de dados (formato esperado para os objetos salvos)
const modeloAgendamento = {
    data: "YYYY-MM-DD",
    hora: "HH:MM",
    servico: "Nome do Serviço",
    tempo: 30,
    valor: 50.00,
    cliente: "Nome do Cliente",
    telefone: "Número do Cliente",
    status: "agendado/concluido",
    dataCriacao: "ISO Date",
    observacoes: ""
};

const modeloServico = {
    nome: "Nome do Serviço",
    tempo: 30,
    valor: 50.00
};

const modeloUsuario = {
    nome: "Nome do Profissional",
    sobrenome: "Sobrenome do Profissional",
    nomeEmpresa: "Nome da Barbearia",
    whatsapp: "Número de contato",
    permissoes: ["barbMinhaBarbearia", "barbAgenda", "barbServicos"]
};

const modeloCliente = {
    nome: "Nome do Cliente",
    telefone: "Número do Cliente"
};

// Inicialização do documento
document.addEventListener('DOMContentLoaded', () => {
    // Atualiza a data atual
    atualizarDataAtual();
    
    // Event listeners para o menu
    document.getElementById('barbInicio').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    document.getElementById('barbCadastro').addEventListener('click', () => {
        window.location.href = 'cadastro.html';
    });
    
    document.getElementById('barbMinhaBarbearia').addEventListener('click', () => {
        window.location.href = 'minha-barbearia.html';
    });
    
    document.getElementById('barbMeusAgendamentos').addEventListener('click', () => {
        window.location.href = 'meus-agendamentos.html';
    });
    
    // Inicializa o chat se estiver na página inicial
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');
    
    if (chatMessages && userInput && sendMessage) {
        iniciarChat();
    }
    
    // Inicializar o calendário se estiver na página inicial
    const calendarDays = document.getElementById('calendarDays');
    if (calendarDays) {
        gerarCalendario();
        adicionarEventosCalendario();
    }
    
    // Event listeners para etapas de agendamento
    inicializarEventosAgendamento();
});

// Funções de navegação do menu
function openNav() {
    document.getElementById("barbSidebar").style.width = "250px";
}

function closeNav() {
    document.getElementById("barbSidebar").style.width = "0";
}

// Função para atualizar a data atual exibida
function atualizarDataAtual() {
    const dataAtualElement = document.getElementById('barbDataAtual');
    if (dataAtualElement) {
        const hoje = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dataAtualElement.textContent = hoje.toLocaleDateString('pt-BR', options);
    }
}

// Funções para validação de documento
function validarDocumento(documento) {
    // Implementação simplificada apenas para demonstração
    return documento.length > 8;
}

// Funções para o chat
function iniciarChat() {
    // Mensagem inicial do bot
    setTimeout(() => {
        adicionarMensagemBot("Olá, vamos agendar o seu corte de cabelo? Por favor me passe seu nome e sobrenome.");
    }, 500);
    
    // Event listener para envio de mensagem
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            enviarMensagem();
        }
    });
    
    sendMessage.addEventListener('click', enviarMensagem);
}

function enviarMensagem() {
    const userInput = document.getElementById('userInput');
    const mensagem = userInput.value.trim();
    
    if (mensagem) {
        adicionarMensagemUsuario(mensagem);
        userInput.value = '';
        
        // Processa a mensagem
        processarMensagemUsuario(mensagem);
    }
}

function adicionarMensagemBot(texto) {
    const chatMessages = document.getElementById('chatMessages');
    const mensagemElement = document.createElement('div');
    mensagemElement.className = 'message bot';
    mensagemElement.textContent = texto;
    chatMessages.appendChild(mensagemElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function adicionarMensagemUsuario(texto) {
    const chatMessages = document.getElementById('chatMessages');
    const mensagemElement = document.createElement('div');
    mensagemElement.className = 'message user';
    mensagemElement.textContent = texto;
    chatMessages.appendChild(mensagemElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processarMensagemUsuario(mensagem) {
    // Se o nome ainda não foi fornecido
    if (!clienteAtual.nome) {
        clienteAtual.nome = mensagem;
        setTimeout(() => {
            adicionarMensagemBot(`Perfeito ${clienteAtual.nome}, agora me passe seu número de contato.`);
        }, 500);
    }
    // Se o telefone ainda não foi fornecido
    else if (!clienteAtual.telefone) {
        clienteAtual.telefone = mensagem;
        
        // Salvar cliente no localStorage
        localStorage.setItem('barbClienteAtual', JSON.stringify(clienteAtual));
        
        setTimeout(() => {
            adicionarMensagemBot(`Obrigado! Agora você pode acessar nosso sistema de agendamento abaixo.`);
            exibirFormularioAgendamento();
        }, 500);
    }
}

function exibirFormularioAgendamento() {
    const agendamentoContainer = document.getElementById('agendamentoContainer');
    if (agendamentoContainer) {
        agendamentoContainer.style.display = 'block';
    }
}

// Funções para gerenciar permissões
function concederPermissaoMinhaBarbearia() {
    localStorage.setItem('barbPermissaoAdmin', 'true');
}

function concederTodasPermissoes() {
    // Salva todas as permissões necessárias
    localStorage.setItem('barbPermissaoAdmin', 'true');
    
    // Cria um usuário administrador com todas as permissões
    const adminUser = {
        nome: "Administrador",
        sobrenome: "Sistema",
        nomeEmpresa: "Minha Barbearia",
        whatsapp: "11999999999",
        permissoes: ["barbMinhaBarbearia", "barbAgenda", "barbServicos", "barbConfiguracoes", "barbAdmin"]
    };
    
    // Salva o usuário no localStorage
    localStorage.setItem('barbUsuario', JSON.stringify(adminUser));
    
    // Adiciona alguns serviços de exemplo se não existirem
    let servicos = JSON.parse(localStorage.getItem('barbServicos') || '[]');
    if (servicos.length === 0) {
        servicos = [
            { nome: 'Corte de Cabelo', tempo: 30, valor: 35.00 },
            { nome: 'Barba', tempo: 20, valor: 25.00 },
            { nome: 'Corte + Barba', tempo: 45, valor: 55.00 },
            { nome: 'Sobrancelha', tempo: 15, valor: 15.00 }
        ];
        localStorage.setItem('barbServicos', JSON.stringify(servicos));
    }
    
    return true;
}

function verificarPermissaoMinhaBarbearia() {
    return localStorage.getItem('barbPermissaoAdmin') === 'true';
}

// Funções para o calendário
function gerarCalendario() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Normaliza para comparação
    
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    // Atualiza o cabeçalho do calendário
    const currentMonthElement = document.getElementById('currentMonth');
    if (currentMonthElement) {
        const options = { month: 'long', year: 'numeric' };
        currentMonthElement.textContent = hoje.toLocaleDateString('pt-BR', options);
    }
    
    // Limpa o conteúdo atual do calendário
    const calendarDays = document.getElementById('calendarDays');
    if (calendarDays) {
        calendarDays.innerHTML = '';
        
        // Determina o primeiro dia do mês
        const primeiroDia = new Date(anoAtual, mesAtual, 1);
        const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
        
        // Determina quantos dias em branco precisam ser adicionados no início
        const diasVaziosInicio = primeiroDia.getDay();
        
        // Adiciona dias do mês anterior
        for (let i = diasVaziosInicio - 1; i >= 0; i--) {
            const diaAnterior = new Date(anoAtual, mesAtual, -i);
            const dia = document.createElement('div');
            dia.className = 'calendar-day inativo dia-passado';
            dia.textContent = diaAnterior.getDate();
            calendarDays.appendChild(dia);
        }
        
        // Adiciona os dias do mês atual
        for (let i = 1; i <= ultimoDia.getDate(); i++) {
            const dataAtual = new Date(anoAtual, mesAtual, i);
            dataAtual.setHours(0, 0, 0, 0); // Normaliza para comparação
            
            const dia = document.createElement('div');
            dia.textContent = i;
            
            // Define classes para o dia
            let classes = 'calendar-day';
            
            // Verifica se é o dia de hoje
            if (dataAtual.getDate() === hoje.getDate() && 
                dataAtual.getMonth() === hoje.getMonth() && 
                dataAtual.getFullYear() === hoje.getFullYear()) {
                classes += ' hoje';
            }
            
            // Verifica se é o dia selecionado
            if (agendamentoAtual.data && 
                dataAtual.getDate() === agendamentoAtual.data.split('/')[0] && 
                dataAtual.getMonth() === agendamentoAtual.data.split('/')[1] - 1 && 
                dataAtual.getFullYear() === agendamentoAtual.data.split('/')[2]) {
                classes += ' selecionado';
            }
            
            // Verifica se a data já passou
            if (dataAtual < hoje) {
                classes += ' dia-passado';
                dia.className = classes;
                calendarDays.appendChild(dia);
                continue; // Pula para a próxima iteração, não adicionando o evento de clique
            }
            
            dia.className = classes;
            
            // Adiciona evento de clique para selecionar o dia
            dia.addEventListener('click', () => {
                // Remove a seleção anterior
                document.querySelectorAll('.calendar-day.selecionado').forEach(el => {
                    el.classList.remove('selecionado');
                });
                
                // Adiciona classe selecionado
                dia.classList.add('selecionado');
                
                // Atualiza a data selecionada
                agendamentoAtual.data = dataAtual.toLocaleDateString('pt-BR');
                
                // Mostra os horários disponíveis para este dia
                mostrarHorariosDisponiveis();
            });
            
            calendarDays.appendChild(dia);
        }
        
        // Adiciona dias do próximo mês para completar a grade
        const diasVaziosFim = 42 - (diasVaziosInicio + ultimoDia.getDate());
        for (let i = 1; i <= diasVaziosFim; i++) {
            const dia = document.createElement('div');
            dia.className = 'calendar-day inativo';
            dia.textContent = i;
            calendarDays.appendChild(dia);
        }
    }
}

function adicionarEventosCalendario() {
    // Navegação entre meses
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    
    if (prevMonth && nextMonth) {
        prevMonth.addEventListener('click', () => {
            // Implementar navegação para mês anterior
        });
        
        nextMonth.addEventListener('click', () => {
            // Implementar navegação para próximo mês
        });
    }
    
    // Seleção de dia
    const calendarDays = document.getElementById('calendarDays');
    if (calendarDays) {
        calendarDays.addEventListener('click', (e) => {
            const diaElement = e.target.closest('.calendar-day');
            if (diaElement && !diaElement.classList.contains('inativo')) {
                // Remove seleção anterior
                const diasSelecionados = document.querySelectorAll('.calendar-day.selecionado');
                diasSelecionados.forEach(dia => dia.classList.remove('selecionado'));
                
                // Adiciona seleção ao dia clicado
                diaElement.classList.add('selecionado');
                
                // Habilita o botão de avançar
                const btnAvancar = document.getElementById('avancarHorarios');
                if (btnAvancar) {
                    btnAvancar.disabled = false;
                }
                
                // Salva a data selecionada
                const diaNumero = diaElement.textContent;
                const mesAno = document.getElementById('currentMonth').textContent.split(' de ');
                const mes = mesAno[0];
                const ano = mesAno[1];
                
                agendamentoAtual.data = `${diaNumero}/${mes}/${ano}`;
            }
        });
    }
}

function inicializarEventosAgendamento() {
    // Botões de navegação entre etapas
    const avancarHorarios = document.getElementById('avancarHorarios');
    const voltarCalendario = document.getElementById('voltarCalendario');
    const avancarServicos = document.getElementById('avancarServicos');
    const voltarHorarios = document.getElementById('voltarHorarios');
    const avancarConfirmacao = document.getElementById('avancarConfirmacao');
    const voltarServicos = document.getElementById('voltarServicos');
    const confirmarAgendamento = document.getElementById('confirmarAgendamento');
    
    // Etapa 1 -> Etapa 2
    if (avancarHorarios) {
        avancarHorarios.addEventListener('click', () => {
            document.getElementById('etapaCalendario').style.display = 'none';
            document.getElementById('etapaHorarios').style.display = 'block';
            
            // Atualiza a data selecionada
            document.getElementById('dataSelecionada').querySelector('span').textContent = agendamentoAtual.data;
            
            // Carrega os horários disponíveis
            carregarHorariosDisponiveis();
        });
    }
    
    // Etapa 2 -> Etapa 1
    if (voltarCalendario) {
        voltarCalendario.addEventListener('click', () => {
            document.getElementById('etapaHorarios').style.display = 'none';
            document.getElementById('etapaCalendario').style.display = 'block';
        });
    }
    
    // Etapa 2 -> Etapa 3
    if (avancarServicos) {
        avancarServicos.addEventListener('click', () => {
            document.getElementById('etapaHorarios').style.display = 'none';
            document.getElementById('etapaServicos').style.display = 'block';
            
            // Atualiza o horário selecionado
            document.getElementById('horarioSelecionado').querySelector('span').textContent = agendamentoAtual.hora;
            
            // Carrega os serviços disponíveis
            carregarServicosDisponiveis();
        });
    }
    
    // Etapa 3 -> Etapa 2
    if (voltarHorarios) {
        voltarHorarios.addEventListener('click', () => {
            document.getElementById('etapaServicos').style.display = 'none';
            document.getElementById('etapaHorarios').style.display = 'block';
        });
    }
    
    // Etapa 3 -> Etapa 4
    if (avancarConfirmacao) {
        avancarConfirmacao.addEventListener('click', () => {
            document.getElementById('etapaServicos').style.display = 'none';
            document.getElementById('etapaConfirmacao').style.display = 'block';
            
            // Atualiza o resumo
            atualizarResumoAgendamento();
        });
    }
    
    // Etapa 4 -> Etapa 3
    if (voltarServicos) {
        voltarServicos.addEventListener('click', () => {
            document.getElementById('etapaConfirmacao').style.display = 'none';
            document.getElementById('etapaServicos').style.display = 'block';
        });
    }
    
    // Confirmar Agendamento
    if (confirmarAgendamento) {
        confirmarAgendamento.addEventListener('click', finalizarAgendamento);
    }
}

function carregarHorariosDisponiveis() {
    const horariosContainer = document.getElementById('horariosContainer');
    if (horariosContainer) {
        // Limpa os horários anteriores
        horariosContainer.innerHTML = '';
        
        // Horários de exemplo (em uma aplicação real, seriam carregados do backend)
        const horarios = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                          '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
        
        horarios.forEach(horario => {
            const horarioItem = document.createElement('div');
            horarioItem.className = 'horario-item';
            horarioItem.textContent = horario;
            
            // Event listener para seleção de horário
            horarioItem.addEventListener('click', () => {
                // Remove seleção anterior
                const horariosSelecionados = document.querySelectorAll('.horario-item.selecionado');
                horariosSelecionados.forEach(item => item.classList.remove('selecionado'));
                
                // Adiciona seleção ao horário clicado
                horarioItem.classList.add('selecionado');
                
                // Habilita o botão de avançar
                document.getElementById('avancarServicos').disabled = false;
                
                // Salva o horário selecionado
                agendamentoAtual.hora = horario;
            });
            
            horariosContainer.appendChild(horarioItem);
        });
        
        // Botão de avançar desabilitado até selecionar um horário
        document.getElementById('avancarServicos').disabled = true;
    }
}

function carregarServicosDisponiveis() {
    const servicosContainer = document.getElementById('servicosContainer');
    if (servicosContainer) {
        // Limpa os serviços anteriores
        servicosContainer.innerHTML = '';
        
        // Carrega serviços do localStorage (ou usa exemplos se não houver)
        let servicos = JSON.parse(localStorage.getItem('barbServicos') || '[]');
        
        // Se não houver serviços cadastrados, usar exemplos
        if (servicos.length === 0) {
            servicos = [
                { nome: 'Corte de Cabelo', tempo: 30, valor: 35.00 },
                { nome: 'Barba', tempo: 20, valor: 25.00 },
                { nome: 'Corte + Barba', tempo: 45, valor: 55.00 },
                { nome: 'Sobrancelha', tempo: 15, valor: 15.00 }
            ];
        }
        
        servicos.forEach(servico => {
            const servicoItem = document.createElement('div');
            servicoItem.className = 'servico-item';
            servicoItem.innerHTML = `
                <div class="servico-detalhes">
                    <div class="servico-nome">${servico.nome}</div>
                    <div class="servico-tempo">${servico.tempo} minutos</div>
                </div>
                <div class="servico-preco">R$ ${servico.valor.toFixed(2)}</div>
            `;
            
            // Event listener para seleção de serviço
            servicoItem.addEventListener('click', () => {
                // Remove seleção anterior
                const servicosSelecionados = document.querySelectorAll('.servico-item.selecionado');
                servicosSelecionados.forEach(item => item.classList.remove('selecionado'));
                
                // Adiciona seleção ao serviço clicado
                servicoItem.classList.add('selecionado');
                
                // Habilita o botão de avançar
                document.getElementById('avancarConfirmacao').disabled = false;
                
                // Salva o serviço selecionado
                agendamentoAtual.servico = servico.nome;
                agendamentoAtual.tempo = servico.tempo;
                agendamentoAtual.valor = servico.valor;
            });
            
            servicosContainer.appendChild(servicoItem);
        });
        
        // Botão de avançar desabilitado até selecionar um serviço
        document.getElementById('avancarConfirmacao').disabled = true;
    }
}

function atualizarResumoAgendamento() {
    const resumoAgendamento = document.getElementById('resumoAgendamento');
    if (resumoAgendamento) {
        resumoAgendamento.innerHTML = `
            <div class="resumo-item">
                <div class="resumo-label">Nome:</div>
                <div class="resumo-valor">${clienteAtual.nome}</div>
            </div>
            <div class="resumo-item">
                <div class="resumo-label">Contato:</div>
                <div class="resumo-valor">${clienteAtual.telefone}</div>
            </div>
            <div class="resumo-item">
                <div class="resumo-label">Data:</div>
                <div class="resumo-valor">${agendamentoAtual.data}</div>
            </div>
            <div class="resumo-item">
                <div class="resumo-label">Horário:</div>
                <div class="resumo-valor">${agendamentoAtual.hora}</div>
            </div>
            <div class="resumo-item">
                <div class="resumo-label">Tipo de serviço:</div>
                <div class="resumo-valor">${agendamentoAtual.servico}</div>
            </div>
            <div class="resumo-item">
                <div class="resumo-label">Tempo:</div>
                <div class="resumo-valor">${agendamentoAtual.tempo} minutos</div>
            </div>
            <div class="resumo-item">
                <div class="resumo-label">Valor:</div>
                <div class="resumo-valor">R$ ${agendamentoAtual.valor.toFixed(2)}</div>
            </div>
        `;
    }
}

function finalizarAgendamento() {
    // Verificar se as informações do cliente estão completas
    if (!clienteAtual.nome || !clienteAtual.telefone) {
        alert('Por favor, informe seu nome e telefone para finalizar o agendamento.');
        return;
    }
    
    // Cria o objeto de agendamento completo
    const agendamento = {
        id: Date.now().toString(), // ID único baseado no timestamp
        cliente: clienteAtual.nome,
        telefone: clienteAtual.telefone,
        data: agendamentoAtual.data,
        hora: agendamentoAtual.hora,
        servico: agendamentoAtual.servico,
        tempo: agendamentoAtual.tempo,
        valor: agendamentoAtual.valor,
        status: 'agendado',
        dataCriacao: new Date().toISOString(),
        observacoes: "" // Campo para observações sobre o agendamento
    };
    
    console.log('Dados do agendamento:', agendamento);
    
    // Salva o agendamento no localStorage
    let agendamentos = JSON.parse(localStorage.getItem('barbAgendamentos') || '[]');
    agendamentos.push(agendamento);
    localStorage.setItem('barbAgendamentos', JSON.stringify(agendamentos));
    
    // Adiciona mensagem de confirmação no chat
    setTimeout(() => {
        adicionarMensagemBot(`Agendamento confirmado para ${agendamentoAtual.data} às ${agendamentoAtual.hora}!`);
    }, 500);
    
    setTimeout(() => {
        adicionarMensagemBot(`Você será atendido por um de nossos profissionais. O valor do serviço será de R$ ${agendamentoAtual.valor.toFixed(2)}.`);
    }, 1500);
    
    setTimeout(() => {
        adicionarMensagemBot(`Para consultar ou cancelar seu agendamento, use a opção "Meus Agendamentos" no menu lateral.`);
    }, 2500);
    
    // Exibe a etapa de sucesso
    document.getElementById('etapaConfirmacao').style.display = 'none';
    document.getElementById('etapaSucesso').style.display = 'block';
    
    // Formata a data para exibição
    const partes = agendamentoAtual.data.split('/');
    if (partes.length === 3) {
        const dia = partes[0];
        const mes = partes[1];
        const ano = partes[2];
        
        const dataObj = new Date(ano, mes - 1, dia);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        // Atualiza os detalhes de confirmação
        const detalhesConfirmacao = document.getElementById('detalhesConfirmacao');
        if (detalhesConfirmacao) {
            detalhesConfirmacao.innerHTML = `
                <p><strong>Nome:</strong> ${clienteAtual.nome}</p>
                <p><strong>Contato:</strong> ${clienteAtual.telefone}</p>
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Horário:</strong> ${agendamentoAtual.hora}</p>
                <p><strong>Tipo de serviço:</strong> ${agendamentoAtual.servico}</p>
                <p><strong>Tempo:</strong> ${agendamentoAtual.tempo} minutos</p>
                <p><strong>Valor:</strong> R$ ${agendamentoAtual.valor.toFixed(2)}</p>
                <p class="info-meus-agendamentos">Para consultar ou cancelar seu agendamento, use a opção "Meus Agendamentos" no menu lateral.</p>
            `;
        }
    }
}

function novoAgendamento() {
    // Reinicia o processo de agendamento
    window.location.reload();
}

function irParaMeusAgendamentos() {
    // Redireciona para a página de meus agendamentos
    window.location.href = 'meus-agendamentos.html';
} 