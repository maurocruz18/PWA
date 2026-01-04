# Personal Trainer Frontend

Frontend desenvolvido em React com Tailwind CSS para a plataforma de Personal Trainers.

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`
2. Configure a URL do backend em `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Executar

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## Build para Produção

```bash
npm run build
```

## Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
├── contexts/        # Contextos (Theme, Auth)
├── pages/           # Páginas da aplicação
├── services/        # Serviços de API
├── utils/           # Funções utilitárias
└── App.js           # Componente principal
```

## Funcionalidades Implementadas

- ✅ Tema Escuro/Claro
- ✅ Autenticação (Username/Password + QR Code)
- ✅ Dashboard para Clientes e Personal Trainers
- ✅ Gestão de Planos de Treino
- ✅ Sistema de Mensagens em Chat
- ✅ Notificações Toast
- ✅ Calendário de Treinos
- ✅ Gráficos de Progresso
- ✅ Upload de Imagens
- ✅ Filtros e Pesquisa
- ✅ Painel Administrativo
