import React, { useEffect, useState } from "react";
import { HandCoins, Heart, Info, Plus, Target, Users } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const categories = ["Water & food", "Medical aid", "Shelter", "Transport & rescue", "Other"];
const categoryTa = {
  "Water & food": "குடிநீர் மற்றும் உணவு",
  "Medical aid": "மருத்துவ உதவி",
  Shelter: "தங்குமிடம்",
  "Transport & rescue": "போக்குவரத்து மற்றும் மீட்பு",
  Other: "மற்றவை"
};
const money = value => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(value || 0);

export default function DonationBoard({ region, language = false }) {
  const t = (en, ta) => language ? ta : en;
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pledgingId, setPledgingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pledgeAmounts, setPledgeAmounts] = useState({});
  const [draft, setDraft] = useState({ title: "", description: "", category: categories[0], goalAmount: "" });

  async function loadCampaigns() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/donations?regionId=${encodeURIComponent(region.id)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load this server's fundraisers.");
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err.message || "Could not connect to the district server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCampaigns(); }, [region.id]);

  async function createCampaign(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, regionId: region.id, goalAmount: Number(draft.goalAmount) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create this fundraiser.");
      setDraft({ title: "", description: "", category: categories[0], goalAmount: "" });
      setSuccess(t("Fundraiser created for this district server.", "இந்த மாவட்டச் சேவையகத்திற்கான நிதி திரட்டல் உருவாக்கப்பட்டது."));
      await loadCampaigns();
    } catch (err) {
      setError(err.message || "Could not connect to the district server.");
    } finally {
      setSaving(false);
    }
  }

  async function pledge(event, campaign) {
    event.preventDefault();
    const amount = Number(pledgeAmounts[campaign.id]);
    setPledgingId(campaign.id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API}/api/donations/${encodeURIComponent(campaign.id)}/pledges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not record this pledge.");
      setPledgeAmounts(current => ({ ...current, [campaign.id]: "" }));
      setSuccess(t("Your pledge was added to the campaign total.", "உங்கள் உறுதிமொழித் தொகை நிதி திரட்டலில் சேர்க்கப்பட்டது."));
      await loadCampaigns();
    } catch (err) {
      setError(err.message || "Could not connect to the district server.");
    } finally {
      setPledgingId("");
    }
  }

  return <section className="panel fundraisingPage" id="fundraising">
    <div className="panelHead fundraiserHeading">
      <div><span className="kicker">{t("DISTRICT COMMUNITY FUNDRAISERS", "மாவட்டச் சமூக நிதி திரட்டல்")}</span><h2>{t("Raise support together", "ஒன்றிணைந்து உதவியைத் திரட்டுங்கள்")}</h2><p>{t("Campaigns for the selected district server", "தேர்ந்தெடுத்த மாவட்டச் சேவையகத்திற்கான நிதி திரட்டல்")} · <b>{language ? region.tamil : region.name}</b></p></div>
      <span className="fundraiserServer"><Heart size={15}/>{t("SERVER", "சேவையகம்")}</span>
    </div>
    <div className="pledgeNotice"><Info size={17}/><span><b>{t("Pledge tracking only", "உறுதிமொழி பதிவு மட்டும்")}</b>{t("No money is collected or transferred in this prototype. Verify fundraisers with their organizers before contributing through any separate channel.", "இந்த முன்மாதிரி எந்தப் பணத்தையும் வசூலிக்கவோ மாற்றவோாது. வேறு வழியில் பங்களிப்பதற்கு முன் நிதி திரட்டலை ஏற்பாட்டாளரிடம் சரிபார்க்கவும்.")}</span></div>
    {error && <p className="fundraiserMessage errorMessage" role="alert">{error}</p>}
    {success && <p className="fundraiserMessage successMessage" role="status">{success}</p>}
    <div className="fundraisingLayout">
      <form className="campaignForm" onSubmit={createCampaign}>
        <div className="campaignFormTitle"><span><Plus size={16}/></span><div><h3>{t("Start a fundraiser", "நிதி திரட்டலைத் தொடங்குங்கள்")}</h3><p>{t("Create a campaign for this server", "இந்தச் சேவையகத்திற்கான பிரச்சாரத்தை உருவாக்குங்கள்")}</p></div></div>
        <label>{t("Campaign title", "பிரச்சாரத் தலைப்பு")}<input required minLength="4" maxLength="90" value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder={t("e.g. Drinking water for affected families", "எ.கா. பாதிக்கப்பட்ட குடும்பங்களுக்குக் குடிநீர்")}/></label>
        <label>{t("What is the fundraiser for?", "நிதி எதற்காகத் திரட்டப்படுகிறது?")}<textarea required minLength="12" maxLength="600" value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder={t("Describe the need and how funds would be used.", "தேவையையும் நிதி எவ்வாறு பயன்படுத்தப்படும் என்பதையும் விவரிக்கவும்.")}/></label>
        <div className="campaignFormRow"><label>{t("Category", "வகை")}<select value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })}>{categories.map(category => <option key={category} value={category}>{language ? categoryTa[category] : category}</option>)}</select></label><label>{t("Target (₹)", "இலக்கு (₹)")}<input type="number" required min="100" max="100000000" step="100" value={draft.goalAmount} onChange={event => setDraft({ ...draft, goalAmount: event.target.value })} placeholder="50000"/></label></div>
        <button className="createCampaignButton" type="submit" disabled={saving}><HandCoins size={17}/>{saving ? t("Creating…", "உருவாக்குகிறது…") : t("Create district fundraiser", "மாவட்ட நிதி திரட்டலை உருவாக்கு")}</button>
        <small>{t("Campaigns are community-created and are not verified by TN-Alert.", "பிரச்சாரங்களைச் சமூகம் உருவாக்குகிறது; TN-Alert அவற்றைச் சரிபார்க்கவில்லை.")}</small>
      </form>

      <div className="campaignList">
        <div className="campaignListHeader"><div><span className="kicker">{t("OPEN CAMPAIGNS", "செயலில் உள்ள பிரச்சாரங்கள்")}</span><h3>{t("For", "மாவட்டம்:")} {language ? region.tamil : region.name}</h3></div><span className="campaignCount">{campaigns.length} {t("campaigns", "பிரச்சாரங்கள்")}</span></div>
        {loading ? <div className="campaignEmpty">{t("Loading district fundraisers…", "மாவட்ட நிதி திரட்டல்கள் ஏற்றப்படுகின்றன…")}</div> : campaigns.length ? <div className="campaignCards">{campaigns.map(campaign => {
          const progress = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
          return <article className="campaignCard" key={campaign.id}>
            <div className="campaignMeta"><span>{language ? categoryTa[campaign.category] : campaign.category}</span><small>{new Date(campaign.createdAt).toLocaleDateString(language ? "ta-IN" : "en-IN")}</small></div>
            <h4>{campaign.title}</h4><p>{campaign.description}</p>
            <div className="campaignTotals"><b>{money(campaign.raisedAmount)}</b><span>{t("pledged of", "உறுதியளிக்கப்பட்டது / இலக்கு")} {money(campaign.goalAmount)}</span></div>
            <div className="campaignProgress" role="progressbar" aria-label={`${progress}% of fundraising goal pledged`} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${progress}%` }}/></div>
            <div className="campaignFoot"><span><Users size={14}/>{campaign.supporterCount} {t("supporters", "ஆதரவாளர்கள்")}</span><span><Target size={14}/>{progress}%</span></div>
            <form className="pledgeForm" onSubmit={event => pledge(event, campaign)}><label className="srOnly" htmlFor={`pledge-${campaign.id}`}>{t("Pledge amount in rupees", "உறுதிமொழித் தொகை ரூபாயில்")}</label><span>₹</span><input id={`pledge-${campaign.id}`} type="number" min="1" max="10000000" step="1" required value={pledgeAmounts[campaign.id] || ""} onChange={event => setPledgeAmounts(current => ({ ...current, [campaign.id]: event.target.value }))} placeholder={t("Amount", "தொகை")}/><button disabled={pledgingId === campaign.id}>{pledgingId === campaign.id ? t("Saving…", "சேமிக்கிறது…") : t("Pledge support", "ஆதரவு உறுதி")}</button></form>
          </article>;
        })}</div> : <div className="campaignEmpty"><div><Heart size={19}/></div><b>{t("No fundraisers yet", "இன்னும் நிதி திரட்டல்கள் இல்லை")}</b><span>{t(`Start the first campaign for ${language ? region.tamil : region.name}.`, `${language ? region.tamil : region.name} மாவட்டத்திற்கான முதல் பிரச்சாரத்தைத் தொடங்குங்கள்.`)}</span></div>}
      </div>
    </div>
  </section>;
}
