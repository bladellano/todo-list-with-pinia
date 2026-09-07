import { apiFetch } from '../utils/api'

export function useExport() {
  const generateTimestamp = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${day}-${month}-${year}_${hours}h${minutes}min${seconds}s`
  }

  const downloadFile = (content, filename, type = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const removeEmojis = (text) => {
    // Remove emojis usando regex
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]/gu, '')
  }

  const exportSelectedAsTxt = (selectedTodos, allTodos) => {
    if (selectedTodos.length === 0) {
      alert('Nenhuma tarefa selecionada')
      return
    }

    const selected = allTodos.filter(t => selectedTodos.includes(t.id))
    
    let content = 'CHECKLIST TO-DO/PLANNING/RESUME/TROUBLESHOOTING\n\n'
    
    selected.forEach((todo) => {
      const title = removeEmojis(todo.title)
      
      if (todo.done) {
        let line = `- ${title}`
        if (todo.completedAt) {
          const date = new Date(todo.completedAt).toLocaleString('pt-BR')
          line += ` - Concluido ✔️ ${date}`
        } else {
          line += ' - Concluido ✔️'
        }
        content += `${line}\n\n`
      } else {
        content += `- [WIP] ${title}\n\n`
      }
    })
    
    content += `\n--- Exportado em ${new Date().toLocaleString('pt-BR')} ---`
    
    const filename = `tarefas-${generateTimestamp()}.txt`
    downloadFile(content, filename)
  }

  const exportData = async () => {
    try {
      const response = await apiFetch('/export')
      
      if (!response.ok) throw new Error('Erro ao exportar dados')
      
      const blob = await response.blob()
      const filename = `todo-backup-${generateTimestamp()}.json`
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar dados. Verifique se o servidor está rodando.')
    }
  }

  const importData = async (onSuccess) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      if (!confirm('⚠️ ATENÇÃO: Importar dados irá SUBSTITUIR TODOS os dados atuais. Deseja continuar?')) {
        return
      }
      
      try {
        const text = await file.text()
        let importedData
        try {
          importedData = JSON.parse(text)
        } catch {
          alert('❌ Arquivo JSON inválido. Verifique se selecionou o backup correto.')
          return
        }

        const response = await apiFetch('/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importedData)
        })

        let result
        try {
          result = await response.json()
        } catch {
          alert('❌ Erro ao comunicar com o servidor. Verifique se o backend está rodando.')
          return
        }

        if (result.success) {
          alert(`✅ Dados importados com sucesso!\n\n📊 Estatísticas:\n- ${result.stats.users} usuário(s)\n- ${result.stats.todos} tarefa(s)\n- ${result.stats.tags} tag(s)`)
          onSuccess()
        } else {
          alert(`❌ Erro: ${result.message}`)
        }
      } catch (error) {
        console.error('Erro ao importar:', error)
        alert('❌ Erro ao importar. Verifique se o backend está online e você está logado.')
      }
    }
    
    input.click()
  }

  return {
    exportSelectedAsTxt,
    exportData,
    importData
  }
}
