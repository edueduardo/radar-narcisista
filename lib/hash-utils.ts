import crypto from 'crypto'

/**
 * Gera hash SHA-256 de um conteúdo
 */
export function generateSHA256Hash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}

/**
 * Gera hash SHA-256 de um episódio (campos principais)
 */
export function generateEpisodeHash(episode: {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
}): string {
  const contentToHash = [
    episode.id,
    episode.user_id,
    episode.title,
    episode.content,
    episode.created_at
  ].join('|')
  
  return generateSHA256Hash(contentToHash)
}

/**
 * Verifica se um episódio foi alterado comparando hashes
 */
export function verifyEpisodeIntegrity(
  originalHash: string,
  currentEpisode: {
    id: string
    user_id: string
    title: string
    content: string
    created_at: string
  }
): boolean {
  const currentHash = generateEpisodeHash(currentEpisode)
  return currentHash === originalHash
}

/**
 * Gera string para hash no rodapé do PDF
 */
export function formatHashForPDF(hash: string): string {
  return `Hash SHA-256: ${hash.substring(0, 16)}... (verifique em: /verificar/${hash.substring(0, 8)})`
}
