<template>
  <div class="login-page">
    <div class="login-page__backdrop" aria-hidden="true">
      <div class="login-page__orb login-page__orb--1" />
      <div class="login-page__orb login-page__orb--2" />
      <div class="login-page__orb login-page__orb--3" />
    </div>

    <main class="login-card">
      <header class="login-card__header">
        <div class="login-card__mark" aria-hidden="true">
          <svg class="login-card__mark-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 class="login-card__title text-pretty">TaskMaster</h1>
        <p class="login-card__subtitle">Entre para gerenciar suas tarefas</p>
      </header>

      <form @submit.prevent="handleLogin" class="login-form" novalidate>
        <div class="login-field">
          <label for="username" class="login-label">Usuário</label>
          <input
            id="username"
            v-model="username"
            name="username"
            type="text"
            autocomplete="username"
            spellcheck="false"
            required
            :disabled="loading"
            class="login-input"
            placeholder="Digite seu usuário…"
          />
        </div>

        <div class="login-field">
          <label for="password" class="login-label">Senha</label>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            :disabled="loading"
            class="login-input"
            placeholder="Digite sua senha…"
          />
        </div>

        <div
          v-if="error"
          role="alert"
          aria-live="polite"
          class="login-alert"
        >
          <svg class="login-alert__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="login-button"
        >
          <svg
            v-if="loading"
            class="login-button__spinner"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{{ loading ? 'Entrando…' : 'Entrar' }}</span>
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  const success = await authStore.login(username.value, password.value)

  if (success) {
    router.push('/')
  } else {
    error.value = authStore.lastError || 'Usuário ou senha incorretos'
  }

  loading.value = false
}
</script>

<style scoped>
.login-page {
  --login-bg: #f0f4ff;
  --login-surface: rgb(255 255 255 / 0.82);
  --login-surface-border: rgb(255 255 255 / 0.65);
  --login-foreground: #0f172a;
  --login-muted: #64748b;
  --login-primary: #2563eb;
  --login-primary-hover: #1d4ed8;
  --login-primary-foreground: #ffffff;
  --login-input-bg: rgb(255 255 255 / 0.9);
  --login-input-border: #e2e8f0;
  --login-ring: #2563eb;
  --login-destructive: #dc2626;
  --login-destructive-bg: #fef2f2;
  --login-destructive-border: #fecaca;
  --login-shadow: 0 24px 48px -12px rgb(15 23 42 / 0.18);
  --login-radius: 1rem;

  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;
  background: var(--login-bg);
  color: var(--login-foreground);
}

:global(.dark) .login-page {
  --login-bg: #0b1120;
  --login-surface: rgb(15 23 42 / 0.72);
  --login-surface-border: rgb(148 163 184 / 0.14);
  --login-foreground: #f8fafc;
  --login-muted: #94a3b8;
  --login-primary: #3b82f6;
  --login-primary-hover: #2563eb;
  --login-input-bg: rgb(15 23 42 / 0.65);
  --login-input-border: rgb(148 163 184 / 0.22);
  --login-ring: #60a5fa;
  --login-destructive: #f87171;
  --login-destructive-bg: rgb(127 29 29 / 0.22);
  --login-destructive-border: rgb(248 113 113 / 0.28);
  --login-shadow: 0 24px 48px -12px rgb(0 0 0 / 0.45);
}

.login-page__backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.login-page__orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(64px);
  opacity: 0.55;
}

.login-page__orb--1 {
  width: 22rem;
  height: 22rem;
  top: -4rem;
  left: -5rem;
  background: #93c5fd;
}

.login-page__orb--2 {
  width: 18rem;
  height: 18rem;
  bottom: -3rem;
  right: -4rem;
  background: #c4b5fd;
}

.login-page__orb--3 {
  width: 14rem;
  height: 14rem;
  top: 40%;
  left: 55%;
  background: #7dd3fc;
}

:global(.dark) .login-page__orb--1 {
  background: #1e3a8a;
  opacity: 0.35;
}

:global(.dark) .login-page__orb--2 {
  background: #4c1d95;
  opacity: 0.35;
}

:global(.dark) .login-page__orb--3 {
  background: #0e7490;
  opacity: 0.28;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 24rem;
  padding: 2rem;
  border-radius: var(--login-radius);
  border: 1px solid var(--login-surface-border);
  background: var(--login-surface);
  box-shadow: var(--login-shadow);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.login-card__header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.login-card__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  border-radius: 0.875rem;
  background: linear-gradient(135deg, var(--login-primary), #7c3aed);
  color: var(--login-primary-foreground);
  box-shadow: 0 8px 20px -6px rgb(37 99 235 / 0.55);
}

.login-card__mark-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.login-card__title {
  font-size: 1.625rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--login-foreground);
}

.login-card__subtitle {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--login-muted);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.login-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--login-foreground);
}

.login-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--login-foreground);
  background: var(--login-input-bg);
  border: 1px solid var(--login-input-border);
  border-radius: 0.625rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.login-input::placeholder {
  color: var(--login-muted);
}

.login-input:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--login-primary) 35%, var(--login-input-border));
}

.login-input:focus-visible {
  outline: none;
  border-color: var(--login-ring);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--login-ring) 28%, transparent);
}

.login-input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.login-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--login-destructive);
  background: var(--login-destructive-bg);
  border: 1px solid var(--login-destructive-border);
  border-radius: 0.625rem;
}

.login-alert__icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  margin-top: 0.0625rem;
}

.login-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.6875rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--login-primary-foreground);
  background: var(--login-primary);
  border: none;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 14px -4px rgb(37 99 235 / 0.55);
}

.login-button:hover:not(:disabled) {
  background: var(--login-primary-hover);
}

.login-button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--login-ring) 35%, transparent),
    0 4px 14px -4px rgb(37 99 235 / 0.55);
}

.login-button:active:not(:disabled) {
  transform: translateY(1px);
}

.login-button:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.login-button__spinner {
  width: 1.125rem;
  height: 1.125rem;
  animation: login-spin 0.8s linear infinite;
}

@keyframes login-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-button__spinner {
    animation: none;
  }

  .login-button,
  .login-input {
    transition: none;
  }
}
</style>
