/**
 * SISTEMA DE INTERNACIONALIZAÇÃO
 * Suporte para PT-BR, EN, ES
 */

export type Locale = 'pt-BR' | 'en' | 'es'

export const locales: Locale[] = ['pt-BR', 'en', 'es']
export const defaultLocale: Locale = 'pt-BR'

export const localeNames: Record<Locale, string> = {
  'pt-BR': '🇧🇷 Português',
  'en': '🇺🇸 English',
  'es': '🇪🇸 Español'
}

// Traduções principais
export const translations: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    // Navegação
    'nav.home': 'Início',
    'nav.blog': 'Blog',
    'nav.stats': 'Estatísticas',
    'nav.contact': 'Contato',
    'nav.login': 'Entrar',
    'nav.signup': 'Começar Grátis',
    'nav.logout': 'Sair',
    
    // Header
    'header.tagline': 'Encontre sua clareza',
    'header.safe': '100% Seguro e Confidencial',
    
    // Landing Hero
    'hero.title1': 'Você não está',
    'hero.title2': 'imaginando coisas.',
    'hero.subtitle': 'Se você está aqui, provavelmente já se perguntou:',
    'hero.question1': '"Será que eu estou exagerando?"',
    'hero.question2': '"Por que me sinto tão confusa(o) depois de conversar com essa pessoa?"',
    'hero.question3': '"Será que a culpa é minha?"',
    'hero.question4': '"Por que ninguém mais parece ver o que eu vejo?"',
    'hero.validation1': 'Você não está louca(o).',
    'hero.validation2': 'E você não está sozinha(o).',
    'hero.help': 'O Radar Narcisista te ajuda a',
    'hero.clarity': 'enxergar com clareza',
    'hero.whats_happening': 'o que está acontecendo.',
    'hero.cta_test': 'Fazer o Teste Gratuito',
    'hero.cta_learn': 'Saiba Mais',
    
    // Seções
    'section.no_gender': 'Abuso Narcisista Não Tem Gênero',
    'section.no_gender_desc': 'Abusadores podem ser de qualquer gênero. Vítimas também. O que importa é o comportamento, não quem você é. Aqui, todos são acolhidos sem julgamento.',
    'section.men_victims': 'Homens Vítimas',
    'section.men_subtitle': 'Você não está sozinho',
    'section.men_text': 'A sociedade diz que "homem não sofre abuso". Mentira. Muitos homens sofrem manipulação, gaslighting e abuso emocional de parceiras narcisistas — e têm vergonha de falar.',
    'section.men_point1': 'Seu sofrimento é real e válido',
    'section.men_point2': 'Pedir ajuda é força, não fraqueza',
    'section.men_point3': 'Aqui você pode se expressar sem julgamento',
    'section.women_victims': 'Mulheres Vítimas',
    'section.women_subtitle': 'Você merece clareza',
    'section.women_text': 'Você não está exagerando. Você não está louca. O que você sente é real. Confie na sua percepção.',
    'section.women_point1': 'Sua intuição está certa',
    'section.women_point2': 'Você não é culpada',
    'section.women_point3': 'Existe um caminho para a liberdade',
    'section.safe_space': 'Este é um espaço seguro para TODOS',
    'section.heard_phrases': 'Você já ouviu alguma dessas frases?',
    'section.select_all': 'Marque todas que você já ouviu',
    'section.analysis': 'Análise Gratuita',
    'section.get_analysis': 'Obter Análise',
    'section.checklist_subtitle': 'Marque as que você reconhece na sua relação',
    'section.invalidacao': 'Invalidação',
    'section.gaslighting': 'Gaslighting',
    'section.minimizacao': 'Minimização',
    'section.isolamento': 'Isolamento',
    'section.dependencia': 'Dependência',
    'section.culpabilizacao': 'Culpabilização',
    'section.manipulacao': 'Manipulação',
    'section.inversao': 'Inversão',
    'section.checklist_warning1': 'Se você marcou 2 ou mais, pode estar vivendo uma relação com padrões de abuso emocional.',
    'section.checklist_warning2': 'Isso não é sua culpa. E você não está sozinha(o).',
    
    // Seção O que é Abuso
    'section.what_is_abuse': 'O que é Abuso Narcisista?',
    'section.what_is_abuse_desc': 'Entenda as táticas usadas para confundir e controlar',
    'section.love_bombing': 'Love Bombing',
    'section.love_bombing_desc': 'Excesso de amor, presentes e atenção no início para criar dependência emocional rápida.',
    'section.gaslighting_desc': 'Fazer você duvidar da sua própria memória, percepção e sanidade mental.',
    'section.triangulation': 'Triangulação',
    'section.triangulation_desc': 'Usar terceiros (ex, amigos, família) para criar ciúmes, insegurança e competição.',
    'section.abuse_cycle': 'Ciclo de Abuso',
    'section.abuse_cycle_desc': 'Tensão → Explosão → Lua de mel → Repetição. Um padrão que se repete infinitamente.',
    'section.learn_more_blog': 'Aprenda mais no nosso Blog',
    
    // Seção Para Quem é o Radar
    'section.who_is_radar': 'Para Quem é o Radar?',
    'section.who_is_radar_desc': 'Abuso narcisista não acontece só em relacionamentos amorosos. Afeta pessoas de todas as idades, gêneros e contextos.',
    'section.women': 'Mulheres',
    'section.women_desc': 'Em relacionamentos com parceiros que controlam, humilham e manipulam',
    'section.men': 'Homens',
    'section.men_desc': 'Vítimas que sofrem em silêncio por vergonha ou preconceito',
    'section.adult_children': 'Filhos Adultos',
    'section.adult_children_desc': 'Cresceram com pais narcisistas e carregam traumas',
    'section.professionals': 'Profissionais',
    'section.professionals_desc': 'Sofrem assédio moral de chefes ou colegas narcisistas',
    'section.elderly': 'Idosos',
    'section.elderly_desc': 'Manipulados financeira e emocionalmente por familiares',
    'section.toxic_friendships': 'Amizades Tóxicas',
    'section.toxic_friendships_desc': 'Amigos que drenam sua energia e te fazem se sentir inferior',
    'section.siblings': 'Irmãos',
    'section.siblings_desc': 'Relações fraternas marcadas por competição e manipulação',
    'section.religious_leaders': 'Líderes Religiosos',
    'section.religious_leaders_desc': 'Abuso espiritual por líderes narcisistas',
    'section.students': 'Estudantes',
    'section.students_desc': 'Professores ou colegas que praticam bullying narcisista',
    'section.who_stats': 'Dados importantes: Segundo a OMS, 1 em cada 3 mulheres e 1 em cada 4 homens já sofreram algum tipo de abuso emocional.',
    'section.understand_more': 'Entenda mais sobre abuso narcisista',
    
    // Geral
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.start': 'Começar',
    
    // Emergência
    'emergency.title': 'Em perigo?',
    'emergency.exit': 'Sair Rápido (ESC)',
    'emergency.call': 'Ligar 190',
  },
  
  'en': {
    // Navigation
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.stats': 'Statistics',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.signup': 'Start Free',
    'nav.logout': 'Logout',
    
    // Header
    'header.tagline': 'Find your clarity',
    'header.safe': '100% Safe and Confidential',
    
    // Landing Hero
    'hero.title1': "You're not",
    'hero.title2': 'imagining things.',
    'hero.subtitle': "If you're here, you've probably asked yourself:",
    'hero.question1': '"Am I overreacting?"',
    'hero.question2': '"Why do I feel so confused after talking to this person?"',
    'hero.question3': '"Is it my fault?"',
    'hero.question4': '"Why does no one else seem to see what I see?"',
    'hero.validation1': "You're not crazy.",
    'hero.validation2': "And you're not alone.",
    'hero.help': 'Narcissist Radar helps you',
    'hero.clarity': 'see clearly',
    'hero.whats_happening': "what's happening.",
    'hero.cta_test': 'Take the Free Test',
    'hero.cta_learn': 'Learn More',
    
    // Sections
    'section.no_gender': 'Narcissistic Abuse Has No Gender',
    'section.no_gender_desc': 'Abusers can be any gender. So can victims. What matters is the behavior, not who you are. Here, everyone is welcomed without judgment.',
    'section.men_victims': 'Male Victims',
    'section.men_subtitle': 'You are not alone',
    'section.men_text': 'Society says "men don\'t suffer abuse". That\'s a lie. Many men suffer manipulation, gaslighting, and emotional abuse from narcissistic partners — and are ashamed to speak up.',
    'section.men_point1': 'Your suffering is real and valid',
    'section.men_point2': 'Asking for help is strength, not weakness',
    'section.men_point3': 'Here you can express yourself without judgment',
    'section.women_victims': 'Female Victims',
    'section.women_subtitle': 'You deserve clarity',
    'section.women_text': 'You are not overreacting. You are not crazy. What you feel is real. Trust your perception.',
    'section.women_point1': 'Your intuition is right',
    'section.women_point2': 'You are not to blame',
    'section.women_point3': 'There is a path to freedom',
    'section.safe_space': 'This is a safe space for EVERYONE',
    'section.heard_phrases': 'Have you heard any of these phrases?',
    'section.select_all': 'Check all you\'ve heard',
    'section.analysis': 'Free Analysis',
    'section.get_analysis': 'Get Analysis',
    'section.checklist_subtitle': 'Check the ones you recognize in your relationship',
    'section.invalidacao': 'Invalidation',
    'section.gaslighting': 'Gaslighting',
    'section.minimizacao': 'Minimization',
    'section.isolamento': 'Isolation',
    'section.dependencia': 'Dependence',
    'section.culpabilizacao': 'Blame-shifting',
    'section.manipulacao': 'Manipulation',
    'section.inversao': 'Inversion',
    'section.checklist_warning1': 'If you checked 2 or more, you may be in a relationship with emotional abuse patterns.',
    'section.checklist_warning2': 'This is not your fault. And you are not alone.',
    
    // What is Abuse Section
    'section.what_is_abuse': 'What is Narcissistic Abuse?',
    'section.what_is_abuse_desc': 'Understand the tactics used to confuse and control',
    'section.love_bombing': 'Love Bombing',
    'section.love_bombing_desc': 'Excessive love, gifts, and attention at the beginning to create quick emotional dependency.',
    'section.gaslighting_desc': 'Making you doubt your own memory, perception, and mental sanity.',
    'section.triangulation': 'Triangulation',
    'section.triangulation_desc': 'Using third parties (ex, friends, family) to create jealousy, insecurity, and competition.',
    'section.abuse_cycle': 'Abuse Cycle',
    'section.abuse_cycle_desc': 'Tension → Explosion → Honeymoon → Repetition. A pattern that repeats infinitely.',
    'section.learn_more_blog': 'Learn more on our Blog',
    
    // Who is Radar For Section
    'section.who_is_radar': 'Who is Radar For?',
    'section.who_is_radar_desc': 'Narcissistic abuse doesn\'t just happen in romantic relationships. It affects people of all ages, genders, and contexts.',
    'section.women': 'Women',
    'section.women_desc': 'In relationships with partners who control, humiliate, and manipulate',
    'section.men': 'Men',
    'section.men_desc': 'Victims who suffer in silence due to shame or prejudice',
    'section.adult_children': 'Adult Children',
    'section.adult_children_desc': 'Grew up with narcissistic parents and carry trauma',
    'section.professionals': 'Professionals',
    'section.professionals_desc': 'Suffer moral harassment from narcissistic bosses or colleagues',
    'section.elderly': 'Elderly',
    'section.elderly_desc': 'Financially and emotionally manipulated by family members',
    'section.toxic_friendships': 'Toxic Friendships',
    'section.toxic_friendships_desc': 'Friends who drain your energy and make you feel inferior',
    'section.siblings': 'Siblings',
    'section.siblings_desc': 'Sibling relationships marked by competition and manipulation',
    'section.religious_leaders': 'Religious Leaders',
    'section.religious_leaders_desc': 'Spiritual abuse by narcissistic leaders',
    'section.students': 'Students',
    'section.students_desc': 'Teachers or classmates who practice narcissistic bullying',
    'section.who_stats': 'Important data: According to WHO, 1 in 3 women and 1 in 4 men have suffered some form of emotional abuse.',
    'section.understand_more': 'Understand more about narcissistic abuse',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.start': 'Start',
    
    // Emergency
    'emergency.title': 'In danger?',
    'emergency.exit': 'Quick Exit (ESC)',
    'emergency.call': 'Call 911',
  },
  
  'es': {
    // Navegación
    'nav.home': 'Inicio',
    'nav.blog': 'Blog',
    'nav.stats': 'Estadísticas',
    'nav.contact': 'Contacto',
    'nav.login': 'Entrar',
    'nav.signup': 'Empezar Gratis',
    'nav.logout': 'Salir',
    
    // Header
    'header.tagline': 'Encuentra tu claridad',
    'header.safe': '100% Seguro y Confidencial',
    
    // Landing Hero
    'hero.title1': 'No estás',
    'hero.title2': 'imaginando cosas.',
    'hero.subtitle': 'Si estás aquí, probablemente te has preguntado:',
    'hero.question1': '"¿Estoy exagerando?"',
    'hero.question2': '"¿Por qué me siento tan confundida(o) después de hablar con esta persona?"',
    'hero.question3': '"¿Es mi culpa?"',
    'hero.question4': '"¿Por qué nadie más parece ver lo que yo veo?"',
    'hero.validation1': 'No estás loca(o).',
    'hero.validation2': 'Y no estás sola(o).',
    'hero.help': 'Radar Narcisista te ayuda a',
    'hero.clarity': 'ver con claridad',
    'hero.whats_happening': 'lo que está pasando.',
    'hero.cta_test': 'Hacer el Test Gratis',
    'hero.cta_learn': 'Saber Más',
    
    // Secciones
    'section.no_gender': 'El Abuso Narcisista No Tiene Género',
    'section.no_gender_desc': 'Los abusadores pueden ser de cualquier género. Las víctimas también. Lo que importa es el comportamiento, no quién eres. Aquí, todos son bienvenidos sin juicio.',
    'section.men_victims': 'Hombres Víctimas',
    'section.men_subtitle': 'No estás solo',
    'section.men_text': 'La sociedad dice "los hombres no sufren abuso". Eso es una mentira. Muchos hombres sufren manipulación, gaslighting y abuso emocional de parejas narcisistas — y tienen vergüenza de hablar.',
    'section.men_point1': 'Tu sufrimiento es real y válido',
    'section.men_point2': 'Pedir ayuda es fuerza, no debilidad',
    'section.men_point3': 'Aquí puedes expresarte sin juicio',
    'section.women_victims': 'Mujeres Víctimas',
    'section.women_subtitle': 'Mereces claridad',
    'section.women_text': 'No estás exagerando. No estás loca. Lo que sientes es real. Confía en tu percepción.',
    'section.women_point1': 'Tu intuición es correcta',
    'section.women_point2': 'No tienes la culpa',
    'section.women_point3': 'Existe un camino hacia la libertad',
    'section.safe_space': 'Este es un espacio seguro para TODOS',
    'section.heard_phrases': '¿Has escuchado alguna de estas frases?',
    'section.select_all': 'Marca todas las que has escuchado',
    'section.analysis': 'Análisis Gratuito',
    'section.get_analysis': 'Obtener Análisis',
    'section.checklist_subtitle': 'Marca las que reconoces en tu relación',
    'section.invalidacao': 'Invalidación',
    'section.gaslighting': 'Gaslighting',
    'section.minimizacao': 'Minimización',
    'section.isolamento': 'Aislamiento',
    'section.dependencia': 'Dependencia',
    'section.culpabilizacao': 'Culpabilización',
    'section.manipulacao': 'Manipulación',
    'section.inversao': 'Inversión',
    'section.checklist_warning1': 'Si marcaste 2 o más, puedes estar en una relación con patrones de abuso emocional.',
    'section.checklist_warning2': 'Esto no es tu culpa. Y no estás sola(o).',
    
    // Sección Qué es el Abuso
    'section.what_is_abuse': '¿Qué es el Abuso Narcisista?',
    'section.what_is_abuse_desc': 'Entiende las tácticas usadas para confundir y controlar',
    'section.love_bombing': 'Love Bombing',
    'section.love_bombing_desc': 'Exceso de amor, regalos y atención al inicio para crear dependencia emocional rápida.',
    'section.gaslighting_desc': 'Hacerte dudar de tu propia memoria, percepción y salud mental.',
    'section.triangulation': 'Triangulación',
    'section.triangulation_desc': 'Usar terceros (ex, amigos, familia) para crear celos, inseguridad y competencia.',
    'section.abuse_cycle': 'Ciclo de Abuso',
    'section.abuse_cycle_desc': 'Tensión → Explosión → Luna de miel → Repetición. Un patrón que se repite infinitamente.',
    'section.learn_more_blog': 'Aprende más en nuestro Blog',
    
    // Sección Para Quién es el Radar
    'section.who_is_radar': '¿Para Quién es el Radar?',
    'section.who_is_radar_desc': 'El abuso narcisista no solo sucede en relaciones románticas. Afecta a personas de todas las edades, géneros y contextos.',
    'section.women': 'Mujeres',
    'section.women_desc': 'En relaciones con parejas que controlan, humillan y manipulan',
    'section.men': 'Hombres',
    'section.men_desc': 'Víctimas que sufren en silencio por vergüenza o prejuicio',
    'section.adult_children': 'Hijos Adultos',
    'section.adult_children_desc': 'Crecieron con padres narcisistas y cargan traumas',
    'section.professionals': 'Profesionales',
    'section.professionals_desc': 'Sufren acoso moral de jefes o colegas narcisistas',
    'section.elderly': 'Adultos Mayores',
    'section.elderly_desc': 'Manipulados financiera y emocionalmente por familiares',
    'section.toxic_friendships': 'Amistades Tóxicas',
    'section.toxic_friendships_desc': 'Amigos que drenan tu energía y te hacen sentir inferior',
    'section.siblings': 'Hermanos',
    'section.siblings_desc': 'Relaciones fraternas marcadas por competencia y manipulación',
    'section.religious_leaders': 'Líderes Religiosos',
    'section.religious_leaders_desc': 'Abuso espiritual por líderes narcisistas',
    'section.students': 'Estudiantes',
    'section.students_desc': 'Profesores o compañeros que practican bullying narcisista',
    'section.who_stats': 'Datos importantes: Según la OMS, 1 de cada 3 mujeres y 1 de cada 4 hombres han sufrido algún tipo de abuso emocional.',
    'section.understand_more': 'Entiende más sobre el abuso narcisista',
    
    // Común
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.back': 'Volver',
    'common.next': 'Siguiente',
    'common.start': 'Empezar',
    
    // Emergencia
    'emergency.title': '¿En peligro?',
    'emergency.exit': 'Salir Rápido (ESC)',
    'emergency.call': 'Llamar 112',
  }
}

// Hook para usar traduções
export function useTranslation(locale: Locale = 'pt-BR') {
  const t = (key: string): string => {
    return translations[locale][key] || translations['pt-BR'][key] || key
  }
  
  return { t, locale }
}

// Função para obter tradução
export function getTranslation(key: string, locale: Locale = 'pt-BR'): string {
  return translations[locale][key] || translations['pt-BR'][key] || key
}

// Detectar idioma do navegador
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale
  
  const browserLang = navigator.language
  
  if (browserLang.startsWith('pt')) return 'pt-BR'
  if (browserLang.startsWith('es')) return 'es'
  if (browserLang.startsWith('en')) return 'en'
  
  return defaultLocale
}
