"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface ClarityScoreIndicatorProps {
  score: number // 0-100
  explanation?: string
  showDetails?: boolean
}

export function ClarityScoreIndicator({ 
  score, 
  explanation, 
  showDetails = false 
}: ClarityScoreIndicatorProps) {
  // Determinar cor e nível baseado no score
  const getScoreLevel = (score: number) => {
    if (score >= 71) return { 
      level: "Bem detalhada", 
      color: "bg-green-500", 
      textColor: "text-green-700",
      bgColor: "bg-green-50"
    }
    if (score >= 31) return { 
      level: "Ok, dá para trabalhar", 
      color: "bg-yellow-500", 
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50"
    }
    return { 
      level: "Muito vaga", 
      color: "bg-red-500", 
      textColor: "text-red-700",
      bgColor: "bg-red-50"
    }
  }

  const scoreLevel = getScoreLevel(score)

  return (
    <TooltipProvider>
      <div className="space-y-1.5 bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-gray-100">
        {/* Header com score e nível */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Clareza:</span>
            <Badge 
              variant="secondary" 
              className={`${scoreLevel.bgColor} ${scoreLevel.textColor} border-none text-xs px-2 py-0`}
            >
              {scoreLevel.level}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold">{score}/100</span>
            {showDetails && explanation && (
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{explanation}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        <div 
          className="relative"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Indicador de clareza da mensagem"
        >
          <Progress 
            value={score} 
            className="h-1.5"
            indicatorClassName={scoreLevel.color}
          />
        </div>

        {/* Detalhes (se showDetails) */}
        {showDetails && (
          <div className="text-xs text-gray-600 space-y-1">
            <p>• 71-100: "Bem detalhada" — descrição rica em detalhes, contexto e exemplos.</p>
            <p>• 31-70: "Ok, dá para trabalhar" — já dá para entender o que aconteceu, mas ainda pode ganhar mais clareza.</p>
            <p>• 0-30: "Muito vaga" — poucas informações, faltam detalhes sobre o que aconteceu.</p>
          </div>
        )}

        <p className="text-[10px] text-gray-400 leading-relaxed">
          Quanto mais detalhes, melhor a IA consegue te ajudar.
        </p>
      </div>
    </TooltipProvider>
  )
}
