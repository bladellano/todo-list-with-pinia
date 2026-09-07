# Deploy no Easypanel — persistência do data.json

## Problema comum

Após cada deploy, o `data.json` aparece vazio e é preciso importar backup de novo.

**Causa:** o caminho do volume Docker e a variável `DATA_FILE_PATH` apontam para pastas **diferentes**. O app grava em um lugar; o volume persiste outro.

## Sua configuração atual (incorreta)

| Configuração | Valor |
|---|---|
| Variável `DATA_FILE_PATH` | `/data/data.json` |
| Volume montado em | `/app/backend/data` |

O app escreve em `/data/data.json`, que fica **dentro do container** e é apagado a cada deploy. O volume `todo-data` em `/app/backend/data` nunca é usado.

## Como corrigir

Escolha **uma** das opções abaixo. O diretório do volume deve ser **o mesmo** que o diretório pai do arquivo em `DATA_FILE_PATH`.

### Opção A — Ajustar o volume (recomendado)

Mantém `DATA_FILE_PATH=/data/data.json` como no `.env.example`.

1. Easypanel → **todo-server** → **Armazenamento**
2. Edite a montagem do volume `todo-data`
3. Altere o destino de `/app/backend/data` para **`/data`**
4. Faça deploy
5. Importe o backup **uma última vez**
6. Nos logs do container, confirme: `📁 Dados persistidos em: /data/data.json`

### Opção B — Ajustar a variável de ambiente

Mantém o volume em `/app/backend/data`.

1. Easypanel → **todo-server** → **Ambiente**
2. Remova `DATA_FILE_PATH` **ou** defina:
   ```
   DATA_FILE_PATH=/app/backend/data/data.json
   ```
3. Faça deploy
4. Importe o backup **uma última vez**
5. Nos logs: `📁 Dados persistidos em: /app/backend/data/data.json`

## Verificação

Após corrigir:

1. Importe o backup
2. Crie uma tarefa de teste
3. Faça um novo deploy
4. A tarefa de teste deve continuar lá

Se após o deploy aparecer o aviso `data.json não encontrado — criando arquivo vazio`, o volume ainda não está alinhado com `DATA_FILE_PATH`.

## Recuperar dados antigos

Se você usou a Opção B antes e tinha dados no volume em `/app/backend/data/data.json`, eles podem ainda existir no volume `todo-data`. Nesse caso, use a Opção B e faça deploy — pode não precisar importar backup.

Se usou `DATA_FILE_PATH=/data/data.json` sem volume em `/data`, os dados de produção só existem nos backups exportados manualmente.
