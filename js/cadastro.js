// Funcionalidades para cadastro da barbearia

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
    
    // Event listener para o botão de adicionar serviço
    const btnAddServico = document.getElementById('btnAddServico');
    if (btnAddServico) {
        btnAddServico.addEventListener('click', adicionarServicoForm);
    }
    
    // Event listener para o botão de salvar cadastro
    const btnSalvarCadastro = document.getElementById('btnSalvarCadastro');
    if (btnSalvarCadastro) {
        btnSalvarCadastro.addEventListener('click', salvarCadastroBarbearia);
    }
    
    // Event listener para o botão de voltar
    const btnVoltar = document.getElementById('btnVoltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Carrega os dados da barbearia, se existirem
    carregarDadosBarbearia();
});

// Função para adicionar um novo formulário de serviço
function adicionarServicoForm() {
    const servicosContainer = document.getElementById('servicosContainerCadastro');
    if (!servicosContainer) return;
    
    const novoServico = document.createElement('div');
    novoServico.className = 'servico-cadastro';
    
    novoServico.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Nome do Serviço *</label>
                <input type="text" class="servico-nome" placeholder="Ex: Corte de Cabelo" required>
            </div>
            
            <div class="form-group">
                <label>Duração (minutos) *</label>
                <input type="number" class="servico-tempo" value="30" min="5" required>
            </div>
            
            <div class="form-group">
                <label>Valor (R$) *</label>
                <input type="number" class="servico-valor" placeholder="0.00" min="0" step="0.01" required>
            </div>
        </div>
        <button type="button" class="btn-remover" onclick="removerServicoForm(this)">
            <i class="fas fa-trash"></i> Remover
        </button>
    `;
    
    servicosContainer.appendChild(novoServico);
}

// Função para remover um formulário de serviço
function removerServicoForm(button) {
    const servicoForm = button.parentElement;
    if (servicoForm) {
        servicoForm.remove();
    }
}

// Função para salvar o cadastro da barbearia
function salvarCadastroBarbearia() {
    // Validar campos obrigatórios
    const nomeBarbearia = document.getElementById('nomeBarbearia').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFim = document.getElementById('horaFim').value;
    
    if (!nomeBarbearia || !telefone || !endereco || !horaInicio || !horaFim) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Verificar se pelo menos um dia de funcionamento está selecionado
    const diasFuncionamento = Array.from(document.querySelectorAll('input[name="diasFuncionamento"]:checked')).map(input => input.value);
    if (diasFuncionamento.length === 0) {
        alert('Por favor, selecione pelo menos um dia de funcionamento.');
        return;
    }
    
    // Obter os serviços cadastrados
    const servicos = obterServicos();
    if (servicos.length === 0) {
        alert('Por favor, cadastre pelo menos um serviço.');
        return;
    }
    
    // Criar objeto com dados da barbearia
    const barbearia = {
        nomeBarbearia,
        telefone,
        email: document.getElementById('email').value.trim(),
        endereco,
        horaInicio,
        horaFim,
        diasFuncionamento,
        intervaloAgendamento: document.getElementById('intervaloAgendamento').value,
        antecedenciaMinima: document.getElementById('antecedenciaMinima').value
    };
    
    // Salvar no localStorage
    localStorage.setItem('barbUsuario', JSON.stringify(barbearia));
    localStorage.setItem('barbServicos', JSON.stringify(servicos));
    
    // Conceder permissão para acessar a área da barbearia
    concederPermissaoMinhaBarbearia();
    
    alert('Cadastro realizado com sucesso!');
    
    // Redirecionar para a página da barbearia
    window.location.href = 'minha-barbearia.html';
}

// Função para obter os serviços cadastrados
function obterServicos() {
    const servicosForms = document.querySelectorAll('.servico-cadastro');
    const servicos = [];
    
    servicosForms.forEach(form => {
        const nome = form.querySelector('.servico-nome').value.trim();
        const tempo = parseInt(form.querySelector('.servico-tempo').value);
        const valor = parseFloat(form.querySelector('.servico-valor').value);
        
        if (nome && !isNaN(tempo) && !isNaN(valor)) {
            servicos.push({
                nome,
                tempo,
                valor
            });
        }
    });
    
    return servicos;
}

// Função para carregar os dados da barbearia, se existirem
function carregarDadosBarbearia() {
    const barbearia = JSON.parse(localStorage.getItem('barbUsuario') || '{}');
    const servicos = JSON.parse(localStorage.getItem('barbServicos') || '[]');
    
    // Preencher campos com dados existentes
    if (barbearia.nomeBarbearia) {
        document.getElementById('nomeBarbearia').value = barbearia.nomeBarbearia;
        document.getElementById('telefone').value = barbearia.telefone || '';
        document.getElementById('email').value = barbearia.email || '';
        document.getElementById('endereco').value = barbearia.endereco || '';
        document.getElementById('horaInicio').value = barbearia.horaInicio || '08:00';
        document.getElementById('horaFim').value = barbearia.horaFim || '18:00';
        
        // Marcar dias de funcionamento
        if (barbearia.diasFuncionamento && barbearia.diasFuncionamento.length > 0) {
            const checkboxes = document.querySelectorAll('input[name="diasFuncionamento"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = barbearia.diasFuncionamento.includes(checkbox.value);
            });
        }
        
        // Selecionar intervalo e antecedência
        if (barbearia.intervaloAgendamento) {
            document.getElementById('intervaloAgendamento').value = barbearia.intervaloAgendamento;
        }
        
        if (barbearia.antecedenciaMinima) {
            document.getElementById('antecedenciaMinima').value = barbearia.antecedenciaMinima;
        }
    }
    
    // Preencher serviços existentes
    if (servicos.length > 0) {
        const servicosContainer = document.getElementById('servicosContainerCadastro');
        if (servicosContainer) {
            // Limpar o container (manter apenas o primeiro serviço, que é o padrão)
            servicosContainer.innerHTML = '';
            
            // Adicionar cada serviço
            servicos.forEach(servico => {
                const servicoForm = document.createElement('div');
                servicoForm.className = 'servico-cadastro';
                
                servicoForm.innerHTML = `
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome do Serviço *</label>
                            <input type="text" class="servico-nome" placeholder="Ex: Corte de Cabelo" value="${servico.nome}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Duração (minutos) *</label>
                            <input type="number" class="servico-tempo" value="${servico.tempo}" min="5" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Valor (R$) *</label>
                            <input type="number" class="servico-valor" placeholder="0.00" value="${servico.valor}" min="0" step="0.01" required>
                        </div>
                    </div>
                    <button type="button" class="btn-remover" onclick="removerServicoForm(this)">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                `;
                
                servicosContainer.appendChild(servicoForm);
            });
        }
    }
} 