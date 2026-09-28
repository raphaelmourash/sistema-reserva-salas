// Corrigida a importação para @supabase/supabase-js (sem duplicar o nome)
import { createClient } from '@supabase/supabase-js';

// URL e Chave do seu painel Supabase
const supabaseUrl = 'https://xxtuztxqzffepudpztip.supabase.co';
const supabasePublishableKey = 'sb_publishable_omRGdprYYIbIs0SfKurYcQ_6V_2g6TR'; // cole a sua Publishable Key do painel

export const supabase = createClient(supabaseUrl, supabasePublishableKey);