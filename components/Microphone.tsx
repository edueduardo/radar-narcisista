'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface MicrophoneProps {
  onTranscription: (text: string) => void
  onError: (error: string) => void
  disabled?: boolean
}

export default function Microphone({ onTranscription, onError, disabled = false }: MicrophoneProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const supabase = createClient()

  const startRecording = async () => {
    try {
      // Reset chunks
      chunksRef.current = []

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create MediaRecorder com timeslice maior
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder

      // Handle data available - só dispara quando tiver dados significativos
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          console.log('Audio chunk received:', event.data.size, 'bytes')
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...')
        setIsRecording(false)
        setIsProcessing(true)
        
        try {
          // Create audio blob
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
          console.log('Audio blob created:', audioBlob.size, 'bytes')
          
          // Create form data for API
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.webm')
          
          // Get auth token from Supabase session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !session?.access_token) {
            throw new Error('Usuário não autenticado')
          }

          const token = session.access_token

          // Send to transcription API
          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Erro na transcrição')
          }

          const result = await response.json()
          
          // Check for crisis detection
          if (result.crisis_detected) {
            onError(result.message)
            // Show emergency modal or redirect
            return
          }

          onTranscription(result.transcription)
          
        } catch (error) {
          console.error('Erro na transcrição:', error)
          onError(error instanceof Error ? error.message : 'Erro ao processar áudio')
        } finally {
          setIsProcessing(false)
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop())
        }
      }

      // Start recording com timeslice de 10 segundos (só dispara ondataavailable a cada 10s)
      mediaRecorder.start(10000) // 10 segundos
      setIsRecording(true)
      console.log('Recording started...')

      // Auto-stop after 2 minutes
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          console.log('Auto-stop after 2 minutes')
          mediaRecorder.stop()
        }
      }, 120000)

    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      onError('Não foi possível acessar o microfone. Verifique as permissões.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const handleClick = () => {
    if (disabled || isProcessing) return
    
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="relative">
      <button
        type="button" // Evita que o botão dispare submit do formulário
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`p-2 rounded-full transition-colors ${
          isRecording 
            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
      >
        {isProcessing ? (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : isRecording ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="6" width="12" height="12" strokeWidth="2" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap">
          Gravando... (máx 2 min)
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap">
          Processando áudio...
        </div>
      )}

      {/* Instructions */}
      {!isRecording && !isProcessing && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm whitespace-nowrap">
          Clique para gravar
        </div>
      )}
    </div>
  )
}
