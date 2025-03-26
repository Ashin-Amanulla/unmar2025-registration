// Schema for registration form validation
import { z } from "zod";

// Base schema with common fields for all registration types
const BaseRegistrationSchema = z.object({
    registrationType: z.enum(["Alumni", "Staff", "Other"]),
    name: z.string().min(2, "Name is required"),
    contactNumber: z
        .string()
        .min(10, "Contact number should be at least 10 digits")
        .max(15, "Contact number should not exceed 15 digits")
        .regex(/^[0-9+\-\s]+$/, "Invalid contact number format"),
    email: z.string().email("Invalid email address"),
    emailVerified: z.boolean().refine(val => val === true, {
        message: "Email must be verified"
    }),
    captchaVerified: z.boolean().refine(val => val === true, {
        message: "CAPTCHA verification is required"
    }),
    whatsappNumber: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    stateUT: z.string().optional(),

    // Event attendance
    isAttending: z.boolean(),
    foodPreference: z.enum(["vegetarian", "non-vegetarian", "both"]).optional(),
    totalVeg: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
      totalNonVeg: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    // Financial contribution
    willContribute: z.boolean(),
    contributionAmount: z.number().int().min(0),
    email: z.string().email("Valid email is required"),
    emailVerified: z.boolean(),
    captchaVerified: z.boolean().optional(),
    country: z.string().min(2, "Country is required"),
    stateUT: z.string().optional(),
});

// Alumni-specific schema
const AlumniSchema = BaseRegistrationSchema.extend({
    // School & Year
    school: z.string().min(2, "School selection is required"),
    yearOfPassing: z.string().min(4, "Year of passing is required"),
    verificationQuizPassed: z.boolean().optional(),

    // Professional Information
    profession: z.string().optional(),
    businessDetails: z.string().optional(),
    areaOfExpertise: z.string().optional(),
    keySkills: z.string().max(500).optional(),

    // Event Attendance
    isAttending: z.boolean(),
    foodPreference: z.enum(["vegetarian", "non-vegetarian", "both"]).optional(),
    totalVeg: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    totalNonVeg: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    eventContribution: z.array(z.string()).optional(),
    contributionDetails: z.string().optional(),

    // Transportation
    travellingFrom: z.string().optional(),
    travelDateTime: z.string().optional(),
    modeOfTravel: z.enum(["Car", "Train", "Flight", "Other"]).optional(),
    needParking: z.boolean().optional(),
    carPooling: z.enum(["No", "Yes To Venue", "Yes From Venue", "Yes Both Ways"]).optional(),
    coShareSeats: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    landmarks: z.string().optional(),
    travelRemarks: z.string().optional(),

    // Accommodation
    accommodation: z.string().optional(),
    accommodationCapacity: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    accommodationLocation: z.string().optional(),
    accommodationRemarks: z.string().optional(),

    // Financial Contribution
    willContribute: z.boolean(),
    contributionAmount: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    proposedAmount: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    paymentStatus: z.enum(["Pending", "Completed", "Failed"]).optional(),
    paymentDetails: z.string().optional(),
    paymentRemarks: z.string().optional(),

    // Optional Fields
    spouseNavodayan: z.enum(["", "Yes", "No"]).optional(),
    unmaFamilyGroups: z.boolean().optional(),
    mentorshipOptions: z.array(z.string()).optional(),
    trainingOptions: z.array(z.string()).optional(),
    seminarOptions: z.array(z.string()).optional(),
    bloodGroup: z.enum(["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
}).refine(
    (data) => {
        if (data.isAttending) {
            return data.foodPreference !== undefined;
        }
        return true;
    },
    {
        message: "Please select your food preference",
        path: ["foodPreference"],
    }
).refine(
    (data) => {
        if (data.willContribute) {
            return data.contributionAmount && data.contributionAmount > 0;
        }
        return true;
    },
    {
        message: "Please specify contribution amount",
        path: ["contributionAmount"],
    }
).refine(
    (data) => {
        if (data.accommodation === "provide") {
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
        if (data.carPooling !== "No") {
            return data.coShareSeats && data.coShareSeats > 0;
        }
        return true;
    },
    {
        message: "Please specify number of seats for car pooling",
        path: ["coShareSeats"],
    }
);

// Staff-specific schema
const StaffSchema = BaseRegistrationSchema.extend({
    // Staff-specific fields
    schoolsWorked: z.string().min(1, "Please enter at least one school"),
    yearsOfWorking: z.string().min(1, "Please enter years of working"),

    // Event Attendance
    isAttending: z.boolean(),
    foodPreference: z.enum(["vegetarian", "non-vegetarian", "both"]).optional(),
    totalVeg: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    totalNonVeg: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),

    // Transportation
    travellingFrom: z.string().optional(),
    travelDateTime: z.string().optional(),
    modeOfTravel: z.enum(["Car", "Train", "Flight", "Other"]).optional(),
    needParking: z.boolean().optional(),
    carPooling: z.enum(["No", "Yes To Venue", "Yes From Venue", "Yes Both Ways"]).optional(),
    coShareSeats: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    landmarks: z.string().optional(),
    travelRemarks: z.string().optional(),

    // Accommodation
    accommodation: z.string().optional(),
    accommodationCapacity: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    accommodationLocation: z.string().optional(),
    accommodationRemarks: z.string().optional(),

    // Financial Contribution
    willContribute: z.boolean(),
    contributionAmount: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    proposedAmount: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    paymentStatus: z.enum(["Pending", "Completed", "Failed"]).optional(),
}).refine(
    (data) => {
        if (data.isAttending) {
            return data.foodPreference !== undefined;
        }
        return true;
    },
    {
        message: "Please select your food preference",
        path: ["foodPreference"],
    }
).refine(
    (data) => {
        if (data.willContribute) {
            return data.contributionAmount && data.contributionAmount > 0;
        }
        return true;
    },
    {
        message: "Please specify contribution amount",
        path: ["contributionAmount"],
    }
);

// Other-specific schema
const OtherSchema = BaseRegistrationSchema.extend({
    // Other-specific fields
    purpose: z.string().min(10, "Please explain your purpose for attending"),

    // Event Attendance
    isAttending: z.boolean(),
    foodPreference: z.enum(["vegetarian", "non-vegetarian", "both"]).optional(),
    totalVeg: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    totalNonVeg: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),

    // Transportation
    travellingFrom: z.string().optional(),
    travelDateTime: z.string().optional(),
    modeOfTravel: z.enum(["Car", "Train", "Flight", "Other"]).optional(),
    needParking: z.boolean().optional(),

    // Accommodation
    accommodation: z.string().optional(),

    // Financial Contribution
    willContribute: z.boolean(),
    contributionAmount: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
      ),
    paymentStatus: z.enum(["Pending", "Completed", "Failed"]).optional(),
}).refine(
    (data) => {
        if (data.isAttending) {
            return data.foodPreference !== undefined;
        }
        return true;
    },
    {
        message: "Please select your food preference",
        path: ["foodPreference"],
    }
).refine(
    (data) => {
        if (data.willContribute) {
            return data.contributionAmount && data.contributionAmount > 0;
        }
        return true;
    },
    {
        message: "Please specify contribution amount",
        path: ["contributionAmount"],
    }
);

// Export the schemas
export const RegistrationSchemas = {
    Alumni: AlumniSchema,
    Staff: StaffSchema,
    Other: OtherSchema,
};

// Default export for backward compatibility
export default RegistrationSchemas.Alumni;