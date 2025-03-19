// Schema for form validation
import { z } from "zod";

const RegistrationSchema = z.object({
    // Personal Data
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    nickName: z.string().optional(),
    contactNumber: z.string().min(10, "Valid contact number is required"),
    email: z.string().email("Valid email is required"),
    emailVerified: z.boolean(),
    captchaVerified: z.boolean().optional(),
    quizCompleted: z.boolean().optional(),
    whatsappNumber: z.string().optional(),
    school: z.string().min(2, "School selection is required"),
    yearOfPassing: z.string().min(4, "Year of passing is required"),
    country: z.string().min(2, "Country is required"),
    district: z.string().min(2, "District is required"),

    // Professional Data
    highestQualification: z.string().optional(),
    jobTitle: z.string().optional(),
    decisionMaker: z.string(),
    areaOfExpertise: z.string().optional(),

    // Skills
    keySkills: z.string().optional(),

    // Transportation
    travellingFrom: z.string().min(2, "Travel location is required"),
    travelDate: z.string().min(2, "Travel date is required"),
    modeOfTravel: z.string().min(2, "Mode of travel is required"),
    needTransport: z.string().min(2, "Transport requirement is required"),
    coShareSeats: z.number().optional(),

    // Accommodation
    accommodationStatus: z.string().min(2, "Accommodation status is required"),
    accommodationCapacity: z.number().optional(),
    location: z.string().optional(),

    // Finance
    sponsorHelp: z.string(),
    contributionAmount: z.number().optional(),
    paymentVerified: z.boolean().optional(),
    canSpendTime: z.string(),
}).refine(
    (data) => {
        if (data.needTransport === "CoShare") {
            return data.coShareSeats && data.coShareSeats > 0;
        }
        return true;
    },
    {
        message: "Please specify number of seats for co-sharing",
        path: ["coShareSeats"],
    }
).refine(
    (data) => {
        if (data.accommodationStatus === "provide") {
            return data.accommodationCapacity && data.accommodationCapacity > 0;
        }
        return true;
    },
    {
        message: "Please specify accommodation capacity",
        path: ["accommodationCapacity"],
    }
).refine(
    (data) => {
        if (data.sponsorHelp === "Yes") {
            return data.contributionAmount && data.contributionAmount > 0;
        }
        return true;
    },
    {
        message: "Please specify contribution amount",
        path: ["contributionAmount"],
    }
);

export default RegistrationSchema;