/**
 * 📜 CARTA-SELO DE REALIDADE
 * 
 * Sistema para criar documentos selados com hash criptográfico.
 * 
 * "Eu não estava louca, isso aconteceu."
 * 
 * NÃO É:
 * - Laudo psicológico
 * - Prova jurídica garantida
 * - Diagnóstico de qualquer tipo
 * 
 * É:
 * - Registro organizado e selado
 * - Ajuda a lembrar com clareza
 * - Ajuda a contar sua história
 * - Mantém integridade do que foi escrito naquela data
 */

// Tipos

export type LetterSection = {
  id: string;
  title: string;
  content: string;
  order: number;
};

export type SealedLetterDraft = {
  id: string;
  userId: string;
  title: string;
  sections: LetterSection[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'sealed';
};

export type SealedLetter = {
  id: string;
  letterId: string;
  userId: string;
  title: string;
  contentHash: string;        // SHA-256 do conteúdo
  sealedAt: string;           // ISO timestamp
  sessionId: string;          // ID único da sessão de selagem
  metadata: {
    sectionsCount: number;
    totalCharacters: number;
    diaryEntriesUsed: number;
  };
};

export type LetterVerificationResult = {
  status: 'match' | 'no_match' | 'not_found';
  originalSealedAt?: string;
  message: string;
};

// Seções padrão da Carta-Selo

export const DEFAULT_LETTER_SECTIONS: Omit<LetterSection, 'id' | 'content'>[] = [
  {
    title: 'O que vem acontecendo',
    order: 1,
  },
  {
    title: 'Como isso me faz sentir',
    order: 2,
  },
  {
    title: 'Exemplos concretos',
    order: 3,
  },
  {
    title: 'Padrões que percebi',
    order: 4,
  },
  {
    title: 'Por que decidi registrar isso agora',
    order: 5,
  },
];

// Funções de Hash (usando Web Crypto API)

async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSessionId(): string {
  return `seal_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

// Funções de gerenciamento de rascunhos

const DRAFTS_KEY = 'sealed_letter_drafts';
const SEALED_KEY = 'sealed_letters';

export function getDrafts(userId: string): SealedLetterDraft[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(DRAFTS_KEY);
  const all = data ? JSON.parse(data) : [];
  return all.filter((d: SealedLetterDraft) => d.userId === userId);
}

export function createDraft(userId: string, title: string = 'Minha Carta-Selo de Realidade'): SealedLetterDraft {
  const draft: SealedLetterDraft = {
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    title,
    sections: DEFAULT_LETTER_SECTIONS.map(s => ({
      ...s,
      id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      content: '',
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };

  const drafts = getAllDrafts();
  drafts.unshift(draft);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));

  return draft;
}

function getAllDrafts(): SealedLetterDraft[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(DRAFTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function updateDraft(draftId: string, updates: Partial<Pick<SealedLetterDraft, 'title' | 'sections'>>): SealedLetterDraft | null {
  const drafts = getAllDrafts();
  const index = drafts.findIndex(d => d.id === draftId);
  
  if (index === -1) return null;

  drafts[index] = {
    ...drafts[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return drafts[index];
}

export function deleteDraft(draftId: string): boolean {
  const drafts = getAllDrafts();
  const filtered = drafts.filter(d => d.id !== draftId);
  
  if (filtered.length === drafts.length) return false;
  
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
  return true;
}

// Funções de selagem

export async function sealLetter(draft: SealedLetterDraft): Promise<SealedLetter> {
  // Gerar conteúdo completo para hash
  const fullContent = generateFullContent(draft);
  const contentHash = await generateHash(fullContent);
  const sessionId = generateSessionId();

  const sealed: SealedLetter = {
    id: `sealed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    letterId: draft.id,
    userId: draft.userId,
    title: draft.title,
    contentHash,
    sealedAt: new Date().toISOString(),
    sessionId,
    metadata: {
      sectionsCount: draft.sections.length,
      totalCharacters: fullContent.length,
      diaryEntriesUsed: 0, // Pode ser preenchido se integrar com diário
    },
  };

  // Salvar selo
  const sealedLetters = getSealedLetters();
  sealedLetters.unshift(sealed);
  localStorage.setItem(SEALED_KEY, JSON.stringify(sealedLetters));

  // Marcar rascunho como selado
  const drafts = getAllDrafts();
  const draftIndex = drafts.findIndex(d => d.id === draft.id);
  if (draftIndex !== -1) {
    drafts[draftIndex].status = 'sealed';
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  }

  return sealed;
}

function generateFullContent(draft: SealedLetterDraft): string {
  const header = `CARTA-SELO DE REALIDADE\nTítulo: ${draft.title}\nData de criação: ${draft.createdAt}\n\n`;
  
  const body = draft.sections
    .sort((a, b) => a.order - b.order)
    .map(s => `## ${s.title}\n\n${s.content}`)
    .join('\n\n---\n\n');

  const footer = `\n\n---\nEste documento foi gerado pelo Radar Narcisista BR.\nNÃO é laudo psicológico, diagnóstico ou prova jurídica garantida.\nÉ um registro organizado para ajudar a lembrar e contar sua história com clareza.`;

  return header + body + footer;
}

// Funções de verificação

export function getSealedLetters(): SealedLetter[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SEALED_KEY);
  return data ? JSON.parse(data) : [];
}

export function getUserSealedLetters(userId: string): SealedLetter[] {
  return getSealedLetters().filter(s => s.userId === userId);
}

export async function verifyLetter(content: string, expectedHash?: string): Promise<LetterVerificationResult> {
  const calculatedHash = await generateHash(content);
  
  if (expectedHash) {
    // Verificação direta com hash fornecido
    if (calculatedHash === expectedHash) {
      return {
        status: 'match',
        message: '✅ O documento é autêntico e não foi alterado desde a selagem.',
      };
    } else {
      return {
        status: 'no_match',
        message: '❌ O documento foi alterado ou não corresponde ao hash original.',
      };
    }
  }

  // Buscar nos selos salvos
  const sealedLetters = getSealedLetters();
  const found = sealedLetters.find(s => s.contentHash === calculatedHash);

  if (found) {
    return {
      status: 'match',
      originalSealedAt: found.sealedAt,
      message: `✅ Documento verificado! Selado em ${new Date(found.sealedAt).toLocaleDateString('pt-BR')} às ${new Date(found.sealedAt).toLocaleTimeString('pt-BR')}.`,
    };
  }

  return {
    status: 'not_found',
    message: '⚠️ Este documento não foi encontrado em nossos registros de selagem.',
  };
}

// Gerar PDF (estrutura para download)

export function generateLetterPDF(draft: SealedLetterDraft, sealed?: SealedLetter): string {
  const content = generateFullContent(draft);
  
  let sealInfo = '';
  if (sealed) {
    sealInfo = `
═══════════════════════════════════════════════════════════════
SELO DE INTEGRIDADE
═══════════════════════════════════════════════════════════════
Data de Selagem: ${new Date(sealed.sealedAt).toLocaleDateString('pt-BR')} às ${new Date(sealed.sealedAt).toLocaleTimeString('pt-BR')}
ID da Sessão: ${sealed.sessionId}
Hash SHA-256: ${sealed.contentHash}

Para verificar a integridade deste documento:
1. Acesse radarnarcisista.com.br/verificar-carta
2. Faça upload deste arquivo
3. O sistema confirmará se o conteúdo não foi alterado
═══════════════════════════════════════════════════════════════
`;
  }

  return content + sealInfo;
}

// Estatísticas para admin

export function getSealedLettersStats() {
  const sealed = getSealedLetters();
  
  const last7Days = sealed.filter(s => {
    const date = new Date(s.sealedAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  });

  const last30Days = sealed.filter(s => {
    const date = new Date(s.sealedAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < 30 * 24 * 60 * 60 * 1000;
  });

  return {
    total: sealed.length,
    last7Days: last7Days.length,
    last30Days: last30Days.length,
    avgCharacters: sealed.length > 0
      ? Math.round(sealed.reduce((sum, s) => sum + s.metadata.totalCharacters, 0) / sealed.length)
      : 0,
  };
}

console.log('📜 Sealed Letters initialized');
