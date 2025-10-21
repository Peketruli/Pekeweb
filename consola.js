import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://jdvwlfogkzrzovepzjqa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkdndsZm9na3pyem92ZXB6anFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzY1MjEsImV4cCI6MjA3MzYxMjUyMX0.IwVFrvuluY0tfgE82XnqYSsRjFPsDYnlfyirHjKu1TI'
const supabase = createClient(supabaseUrl, supabaseKey)

async function cargarAcciones() {
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('username, last_action, last_action_ip, last_action_at')
    .order('last_action_at', { ascending: false })

  const tbody = document.getElementById('logsBody')
  if (error) {
    tbody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`
    return
  }

  tbody.innerHTML = usuarios.map(u => `
    <tr>
      <td>${u.username || 'Desconocido'}</td>
      <td>${u.last_action || '-'}</td>
      <td>${u.last_action_ip || '-'}</td>
      <td>${u.last_action_at ? new Date(u.last_action_at).toLocaleString() : '-'}</td>
    </tr>
  `).join('')
}

// Cargar cada 10 segundos
cargarAcciones()
setInterval(cargarAcciones, 10000)
