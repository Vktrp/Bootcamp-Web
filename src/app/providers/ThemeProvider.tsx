import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/auth/slice';
import { me } from '../../features/auth/api';

export default function AuthProvider({ children }: { children: ReactNode }) {
const dispatch = useDispatch();
useEffect(() => {
(async () => {
try { const user = await me(); dispatch(setUser(user)); } catch {}
})();
}, [dispatch]);
return <>{children}</>;
}