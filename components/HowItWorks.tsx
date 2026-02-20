import { ClipboardList, Users, Sparkles } from "lucide-react";

export function HowItWorks() {
    const steps = [
        {
            icon: ClipboardList,
            title: "Register",
            description: "Complete your profile; the more information you provide, the easier it will be to find your match. Upload a photo and tell us what you're looking for.",
            color: "text-coral",
            bgColor: "bg-coral/10",
        },
        {
            icon: Users,
            title: "Attend",
            description: "Join us and find your tailor-made love. The limit is 100 potential candidates to make a match",
            color: "text-teal",
            bgColor: "bg-teal/10",
        },
        {
            icon: Sparkles,
            title: "Match",
            description: "When the algorithm finds it, you'll receive an email with your date and event details to join us for an exciting night of love.",
            color: "text-purple-500",
            bgColor: "bg-purple-100",
        },
    ];

    return (
        <section className="py-16 px-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10 text-text">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center text-center p-6 bg-white rounded-card border border-border/40 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`p-4 rounded-full mb-4 ${step.bgColor}`}>
                            <step.icon className={`w-8 h-8 ${step.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-text">{step.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{step.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
