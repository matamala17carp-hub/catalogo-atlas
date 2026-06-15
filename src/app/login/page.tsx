import LoginForm from '@/components/ui/LoginForm'

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <LoginForm />
    </div>
  )
}
