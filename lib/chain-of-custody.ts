/**
 * Sistema de Cadeia de Custódia
 * Garante integridade e rastreabilidade de dados para potencial uso probatório
 * 
 * IMPORTANTE: Este sistema NÃO substitui assessoria jurídica profissional.
 * Serve como camada adicional de integridade para os registros do usuário.
 */

import { createHash } from 'crypto'

// Tipos
export interface CustodyMetadata {
  hash: string
  timestamp: string
  version: string
  userId: string
  entryType: string
  previousHash?: string
}

export interface CustodyEntry {
  id: string
  content: string
  metadata: CustodyMetadata
  signature?: string
}

export interface CustodyVerification {
  isValid: boolean
  computedHash: string
  storedHash: string
  timestamp: string
  details?: string
}

// Versão do algoritmo de hash (para futuras migrações)
const HASH_VERSION = '1.0'

/**
 * Gera hash SHA-256 de um conteúdo
 */
export function generateHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

/**
 * Gera hash de uma entrada com metadados
 */
export function generateEntryHash(
  content: string,
  userId: string,
  entryType: string,
  timestamp: string,
  previousHash?: string
): string {
  const dataToHash = JSON.stringify({
    content,
    userId,
    entryType,
    timestamp,
    previousHash: previousHash || null,
    version: HASH_VERSION
  })
  
  return generateHash(dataToHash)
}

/**
 * Cria metadados de custódia para uma entrada
 */
export function createCustodyMetadata(
  content: string,
  userId: string,
  entryType: string,
  previousHash?: string
): CustodyMetadata {
  const timestamp = new Date().toISOString()
  const hash = generateEntryHash(content, userId, entryType, timestamp, previousHash)
  
  return {
    hash,
    timestamp,
    version: HASH_VERSION,
    userId,
    entryType,
    previousHash
  }
}

/**
 * Verifica integridade de uma entrada
 */
export function verifyCustodyEntry(
  content: string,
  metadata: CustodyMetadata
): CustodyVerification {
  const computedHash = generateEntryHash(
    content,
    metadata.userId,
    metadata.entryType,
    metadata.timestamp,
    metadata.previousHash
  )
  
  const isValid = computedHash === metadata.hash
  
  return {
    isValid,
    computedHash,
    storedHash: metadata.hash,
    timestamp: metadata.timestamp,
    details: isValid 
      ? 'Integridade verificada com sucesso'
      : 'ALERTA: Hash não corresponde. Possível alteração detectada.'
  }
}

/**
 * Gera relatório de cadeia de custódia para exportação
 */
export function generateCustodyReport(entries: CustodyEntry[]): string {
  const report = {
    generatedAt: new Date().toISOString(),
    totalEntries: entries.length,
    hashVersion: HASH_VERSION,
    entries: entries.map((entry, index) => ({
      sequence: index + 1,
      id: entry.id,
      hash: entry.metadata.hash,
      timestamp: entry.metadata.timestamp,
      entryType: entry.metadata.entryType,
      previousHash: entry.metadata.previousHash || 'GENESIS',
      chainValid: index === 0 
        ? true 
        : entry.metadata.previousHash === entries[index - 1].metadata.hash
    })),
    chainIntegrity: verifyChainIntegrity(entries)
  }
  
  return JSON.stringify(report, null, 2)
}

/**
 * Verifica integridade de toda a cadeia
 */
export function verifyChainIntegrity(entries: CustodyEntry[]): {
  isValid: boolean
  brokenAt?: number
  details: string
} {
  if (entries.length === 0) {
    return { isValid: true, details: 'Cadeia vazia' }
  }
  
  for (let i = 1; i < entries.length; i++) {
    const current = entries[i]
    const previous = entries[i - 1]
    
    if (current.metadata.previousHash !== previous.metadata.hash) {
      return {
        isValid: false,
        brokenAt: i,
        details: `Cadeia quebrada na posição ${i}. Hash anterior não corresponde.`
      }
    }
  }
  
  return {
    isValid: true,
    details: `Cadeia íntegra com ${entries.length} entradas verificadas.`
  }
}

/**
 * Formata hash para exibição (truncado)
 */
export function formatHashForDisplay(hash: string): string {
  if (!hash || hash.length < 16) return hash
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
}

/**
 * Gera assinatura digital simplificada (para uso interno)
 * Em produção, usar certificado digital real
 */
export function generateSignature(
  hash: string,
  userId: string,
  timestamp: string
): string {
  const signatureData = `${hash}:${userId}:${timestamp}:${process.env.CUSTODY_SECRET || 'radar-narcisista'}`
  return generateHash(signatureData)
}

/**
 * Verifica assinatura
 */
export function verifySignature(
  hash: string,
  userId: string,
  timestamp: string,
  signature: string
): boolean {
  const expectedSignature = generateSignature(hash, userId, timestamp)
  return expectedSignature === signature
}

// Tipos de entrada que requerem cadeia de custódia
export const CUSTODY_ENTRY_TYPES = [
  'journal_entry',      // Entradas do diário
  'clarity_test',       // Resultados do teste de clareza
  'chat_message',       // Mensagens importantes do chat
  'safety_plan',        // Plano de segurança
  'risk_alert',         // Alertas de risco
  'evidence_attachment' // Anexos de evidência
] as const

export type CustodyEntryType = typeof CUSTODY_ENTRY_TYPES[number]

/**
 * Verifica se um tipo de entrada requer custódia
 */
export function requiresCustody(entryType: string): boolean {
  return CUSTODY_ENTRY_TYPES.includes(entryType as CustodyEntryType)
}
