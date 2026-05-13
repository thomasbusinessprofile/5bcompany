import { updateBuyerProfile } from "./actions";
import { getBuyerProfile } from "../../shared/buyer-data";
import { SubmitButton } from "../../shared/SubmitButton";
import { BUSINESS_TYPES } from "../../lib/constants";

const businessTypes = BUSINESS_TYPES;

export const metadata = {
  title: "Buyer Profile | 5B Trading",
  description: "Buyer company profile for sourcing request defaults."
};

type BuyerProfilePageProps = {
  searchParams: Promise<{ status?: string }>;
};

function messageFor(status?: string) {
  if (status === "saved") {
    return { tone: "success", text: "Profile saved." };
  }

  if (status === "save-error") {
    return { tone: "error", text: "Profile could not be saved. Please try again." };
  }

  return null;
}

export default async function BuyerProfilePage({ searchParams }: BuyerProfilePageProps) {
  const { status } = await searchParams;
  const profile = await getBuyerProfile();
  const message = messageFor(status);

  return (
    <div className="page-shell auth-shell">
      <section className="section-title">
        <p className="eyebrow">Company Profile</p>
        <h1>Buyer company profile</h1>
        <p>
          Profile details are stored in Supabase and used as defaults for buyer
          requests and admin review context.
        </p>
      </section>
      <form action={updateBuyerProfile} className="page-card request-form auth-form">
        {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
        <label>
          Full name
          <input defaultValue={profile?.fullName ?? ""} name="full_name" placeholder="Your name" />
        </label>
        <label>
          Company name
          <input defaultValue={profile?.companyName ?? ""} name="company_name" placeholder="Company legal or trade name" />
        </label>
        <label>
          Country
          <input defaultValue={profile?.country ?? ""} name="country" placeholder="Example: Germany" />
        </label>
        <label>
          Business type
          <select defaultValue={profile?.businessType ?? ""} name="business_type">
            <option value="">Select business type</option>
            {businessTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Phone
          <input defaultValue={profile?.phone ?? ""} name="phone" placeholder="+49..." />
        </label>
        <label>
          WhatsApp
          <input defaultValue={profile?.whatsapp ?? ""} name="whatsapp" placeholder="+49..." />
        </label>
        <SubmitButton pendingLabel="Saving...">Save profile</SubmitButton>
      </form>
    </div>
  );
}
