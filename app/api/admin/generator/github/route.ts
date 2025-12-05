// API para integração com GitHub
// /api/admin/generator/github

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Tipos
interface GitHubRepoConfig {
  name: string
  description: string
  private: boolean
  auto_init: boolean
}

interface GitHubFile {
  path: string
  content: string
}

// POST - Criar repositório no GitHub
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      repoName, 
      description, 
      isPrivate = true,
      files = [],
      githubToken,
      organization
    } = body

    // Validações
    if (!repoName) {
      return NextResponse.json({ error: 'Nome do repositório é obrigatório' }, { status: 400 })
    }

    if (!githubToken) {
      return NextResponse.json({ error: 'Token do GitHub é obrigatório' }, { status: 400 })
    }

    // Criar repositório
    const repoConfig: GitHubRepoConfig = {
      name: repoName,
      description: description || `Projeto gerado pelo RADAR-CORE`,
      private: isPrivate,
      auto_init: true // Cria com README inicial
    }

    const createRepoUrl = organization 
      ? `https://api.github.com/orgs/${organization}/repos`
      : 'https://api.github.com/user/repos'

    const repoResponse = await fetch(createRepoUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify(repoConfig)
    })

    if (!repoResponse.ok) {
      const errorData = await repoResponse.json()
      console.error('Erro ao criar repo:', errorData)
      return NextResponse.json({ 
        error: 'Erro ao criar repositório no GitHub',
        details: errorData.message || errorData.errors?.[0]?.message
      }, { status: repoResponse.status })
    }

    const repoData = await repoResponse.json()
    const repoFullName = repoData.full_name // ex: "usuario/repo"

    // Se há arquivos para adicionar, criar commits
    if (files.length > 0) {
      // Aguardar um pouco para o repo ser criado
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Adicionar arquivos um por um (em produção, usar tree API para batch)
      for (const file of files as GitHubFile[]) {
        try {
          const fileResponse = await fetch(
            `https://api.github.com/repos/${repoFullName}/contents/${file.path}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28'
              },
              body: JSON.stringify({
                message: `Add ${file.path}`,
                content: Buffer.from(file.content).toString('base64')
              })
            }
          )

          if (!fileResponse.ok) {
            console.warn(`Erro ao adicionar ${file.path}:`, await fileResponse.text())
          }
        } catch (fileError) {
          console.warn(`Erro ao adicionar ${file.path}:`, fileError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      repo: {
        name: repoData.name,
        fullName: repoData.full_name,
        url: repoData.html_url,
        cloneUrl: repoData.clone_url,
        sshUrl: repoData.ssh_url,
        private: repoData.private
      },
      filesAdded: files.length
    })

  } catch (error) {
    console.error('Erro na integração GitHub:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Verificar conexão com GitHub
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const githubToken = searchParams.get('token')

    if (!githubToken) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 })
    }

    // Verificar token
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if (!userResponse.ok) {
      return NextResponse.json({ 
        connected: false, 
        error: 'Token inválido ou expirado' 
      })
    }

    const userData = await userResponse.json()

    // Buscar organizações
    const orgsResponse = await fetch('https://api.github.com/user/orgs', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    const orgsData = orgsResponse.ok ? await orgsResponse.json() : []

    return NextResponse.json({
      connected: true,
      user: {
        login: userData.login,
        name: userData.name,
        avatar: userData.avatar_url
      },
      organizations: orgsData.map((org: any) => ({
        login: org.login,
        avatar: org.avatar_url
      }))
    })

  } catch (error) {
    console.error('Erro ao verificar GitHub:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
