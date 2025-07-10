import { requireAnonymous } from '../../utils/auth';
import LoginForm from '../../components/login-form';

export default async function LoginPage() {
  await requireAnonymous();
  return <LoginForm />;
}
