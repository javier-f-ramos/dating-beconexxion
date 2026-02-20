export type Gender = "male" | "female";

export type RegistrationStatus = "approved" | "pending" | "rejected";

export interface Registration {
    id: string;
    created_at: string;
    full_name: string;
    email: string;
    phone: string;
    age: number;
    gender: Gender;
    city: string;
    occupation?: string;
    interests: string[];
    personality_traits: string[];
    looking_for: string;
    additional_notes?: string;
    photo_url: string;
    status: RegistrationStatus;
}

export interface Match {
    woman_id: string;
    man_id: string;
    score: number;
    shared_interests: string[];
    shared_traits: string[];
    age_gap: number;
}
