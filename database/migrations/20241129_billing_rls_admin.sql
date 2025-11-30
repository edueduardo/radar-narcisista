-- ============================================================================
-- MIGRATION: Adicionar políticas RLS para admins em billing_plans
-- Data: 29/11/2025
-- Objetivo: Permitir que admins façam INSERT/UPDATE/DELETE
-- ============================================================================

-- ============================================================================
-- POLÍTICAS PARA billing_plans
-- ============================================================================

-- Política de SELECT para TODOS os planos (admins precisam ver todos)
CREATE POLICY "billing_plans_select_all_for_admins" ON billing_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
    OR
    auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Política de INSERT para admins
CREATE POLICY "billing_plans_insert_admin" ON billing_plans
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
    OR
    auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Política de UPDATE para admins
CREATE POLICY "billing_plans_update_admin" ON billing_plans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
    OR
    auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Política de DELETE para admins
CREATE POLICY "billing_plans_delete_admin" ON billing_plans
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
    OR
    auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- ============================================================================
-- POLÍTICAS PARA billing_plan_promotions
-- ============================================================================

-- Política de SELECT para TODAS as promoções (admins precisam ver todas)
CREATE POLICY "billing_promotions_select_all_for_admins" ON billing_plan_promotions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
    OR
    auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Política de INSERT para admins
CREATE POLICY "billing_promotions_insert_admin" ON billing_plan_promotions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
    OR
    auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Política de UPDATE para admins
CREATE POLICY "billing_promotions_update_admin" ON billing_plan_promotions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
    OR
    auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Política de DELETE para admins
CREATE POLICY "billing_promotions_delete_admin" ON billing_plan_promotions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
    OR
    auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
