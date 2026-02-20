import { RegistrationForm } from "@/components/RegistrationForm";
import { Suspense } from "react";

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-background py-10 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
                <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
                    <RegistrationForm />
                </Suspense>
            </div>
        </main>
    );
}
