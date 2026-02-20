import { z } from "zod";

export const interestsList = [
    "Sports & Fitness",
    "Travel & Adventure",
    "Music & Concerts",
    "Food & Cooking",
    "Movies & Series",
    "Reading & Books",
    "Art & Culture",
    "Technology",
    "Nature & Outdoors",
    "Gaming",
    "Dancing",
    "Photography",
];

export const personalityTraits = [
    "Adventurous",
    "Thoughtful",
    "Humorous",
    "Ambitious",
    "Compassionate",
    "Creative",
    "Reliable",
    "Spontaneous",
    "Outgoing",
    "Calm",
    "Optimistic",
    "Intellectual",
];

export const bodyTypes = [
    "Slim",
    "Average",
    "Athletic",
    "Curvy",
    "XL",
    "XXL",
];

export const hairColors = [
    "Black",
    "Blonde",
    "Brunette",
    "Red",
    "Gray",
    "Bald",
    "Dyed",
    "Other",
];

export const registrationSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Phone number must be at least 8 characters"),
    age: z
        .number()
        .min(18, "You must be at least 18 years old")
        .max(70, "Age limit is 70"),
    city: z.string().min(2, "City is required"),
    occupation: z.string().optional(),
    interests: z
        .array(z.string())
        .min(1, "Select at least 1 interest")
        .max(5, "Select up to 5 interests"),
    personality_traits: z
        .array(z.string())
        .length(3, "Select exactly 3 personality traits"),
    looking_for: z
        .string()
        .min(10, "Please tell us what you represent looking for (min 10 chars)")
        .max(200, "Limit is 200 characters"),
    additional_notes: z.string().max(300, "Limit is 300 characters").optional(),
    height: z.string().min(2, "Height is required"),
    body_type: z.string().min(2, "Body type is required"),
    hair_color: z.string().min(2, "Hair color is required"),
    consent_accurate: z.boolean().refine((val) => val === true, {
        message: "You must confirm information is accurate",
    }),
    consent_terms: z.boolean().refine((val) => val === true, {
        message: "You must agree to terms and conditions",
    }),
    consent_photo: z.boolean().refine((val) => val === true, {
        message: "You must consent to photo sharing",
    }),
    // Dimensions and file type validation handled separately in the UI component usually, 
    // but we can validate the result here if we pass the file object or url.
    // For simplicity in RHF, we might just track "hasPhoto" or similar if handling upload separately.
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
