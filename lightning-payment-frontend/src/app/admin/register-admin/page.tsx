import RegisterForm from '@/components/RegisterForm';

export default function RegisterAdminPage() {
    return (
        <div className='flex justify-center items-center h-full bg-zinc-950'>
            <RegisterForm role='ADMIN' />
        </div>
    );
}
