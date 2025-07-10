import { requireAnonymous } from '../../utils/auth';
import SignupForm from '../../components/signup-form';

export default async function SignupPage() {
  await requireAnonymous();
  return <SignupForm />;
}
