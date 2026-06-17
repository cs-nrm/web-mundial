import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function isAlreadyProcessed(incidenceId) {
  const { data } = await supabase
    .from('goal_posts')
    .select('id')
    .eq('incidence_id', incidenceId)
    .maybeSingle()
  return !!data
}

export async function saveEvent(event) {
  const { error } = await supabase
    .from('goal_posts')
    .insert(event)
  if (error) throw error
}

export async function markPublished(id, metricoolResponse) {
  const { error } = await supabase
    .from('goal_posts')
    .update({ status: 'publicado', published_at: new Date().toISOString(), metricool_response: metricoolResponse })
    .eq('id', id)
  if (error) throw error
}

export async function markError(id, detail) {
  const { error } = await supabase
    .from('goal_posts')
    .update({ status: 'error', error_detail: detail })
    .eq('id', id)
  if (error) throw error
}

export async function getPendingEvents() {
  const { data, error } = await supabase
    .from('goal_posts')
    .select('*')
    .eq('status', 'pendiente')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
