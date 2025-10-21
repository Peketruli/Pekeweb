import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Conecta con tu proyecto Supabase
const supabaseUrl = 'https://jdvwlfogkzrzovepzjqa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkdndsZm9na3pyem92ZXB6anFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzY1MjEsImV4cCI6MjA3MzYxMjUyMX0.IwVFrvuluY0tfgE82XnqYSsRjFPsDYnlfyirHjKu1TI'
const supabase = createClient(supabaseUrl, supabaseKey)

// Cargar logs y mostrar en tabla
async function cargarLogs() {
  const { data: logs, error } = await supabase
    .from('logs')
    .select('id, action, ip, created_at, user:users(username)')
    .order('created_at', { ascending: false })
    .limit(100) // últimas 100 acciones

  const tbody = document.getElementById('logsBody')
  if (error) {
    tbody.innerHTML = `<tr><td colspan="5">Error al cargar logs: ${error.message}</td></tr>`
    return
  }

  if (!logs || logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No hay registros</td></tr>`
    return
  }

  tbody.innerHTML = logs.map(log => `
    <tr>
      <td>${log.id}</td>
      <td>${log.user?.username || 'Desconocido'}</td>
      <td>${log.action}</td>
      <td>${log.ip}</td>
      <td>${new Date(log.created_at).toLocaleString()}</td>
    </tr>
  `).join('')
}

// Cargar logs al iniciar y cada 10 segundos
cargarLogs()
setInterval(cargarLogs, 10000)
