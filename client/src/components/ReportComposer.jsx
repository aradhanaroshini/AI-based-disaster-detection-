import React, { useState } from "react";
import { Camera, Send, MapPin, Users } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ReportComposer({ region, onPosted, tamil = false }) {
  const t = (en, ta) => tamil ? ta : en;
  const [text, setText] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState("Flood");
  const [file, setFile] = useState(null);
  const [needsHelp, setNeedsHelp] = useState(false);
  const [peopleAffected, setPeopleAffected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("regionId", region.id);
    form.append("type", type);
    form.append("text", text);
    form.append("area", area);
    form.append("needsHelp", String(needsHelp));
    form.append("peopleAffected", peopleAffected || "0");
    form.append("lat", String(region.lat));
    form.append("lng", String(region.lng));
    if (file) form.append("image", file);

    try {
      const response = await fetch(`${API}/api/reports`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not post this report.");
      setText("");
      setArea("");
      setFile(null);
      setNeedsHelp(false);
      setPeopleAffected("");
      await onPosted?.();
    } catch (err) {
      setError(err.message || "Could not connect to the regional server.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="composer" onSubmit={submit}>
    <div className="composerTitle"><Camera size={17}/> {t(`Post to ${region.name} community feed`, `${region.tamil || region.name} மாவட்ட சமூகப் பதிவில் பகிரவும்`)}</div>
    <select value={type} onChange={e => { setType(e.target.value); if (["Help needed", "People stranded"].includes(e.target.value)) setNeedsHelp(true); }}>
      <option value="Flood">{t("Flood","வெள்ளம்")}</option><option value="Waterlogging">{t("Waterlogging","நீர்த்தேக்கம்")}</option><option value="Landslide">{t("Landslide","நிலச்சரிவு")}</option><option value="Storm damage">{t("Storm damage","புயல் சேதம்")}</option><option value="Fire / smoke">{t("Fire / smoke","தீ / புகை")}</option><option value="Road blocked">{t("Road blocked","சாலை தடை")}</option><option value="Help needed">{t("Help needed","உதவி தேவை")}</option><option value="People stranded">{t("People stranded","மக்கள் சிக்கியுள்ளனர்")}</option><option value="Other">{t("Other","மற்றவை")}</option>
    </select>
    <input className="areaInput" value={area} onChange={e => setArea(e.target.value)} placeholder={t("Area, street or nearby landmark","பகுதி, தெரு அல்லது அருகிலுள்ள அடையாளம்")} maxLength={120}/>
    <textarea value={text} onChange={e => setText(e.target.value)} placeholder={t("What are you seeing in your area?","உங்கள் பகுதியில் என்ன நிலையைப் பார்க்கிறீர்கள்?")} required />
    <label className="helpToggle"><input type="checkbox" checked={needsHelp} onChange={e => setNeedsHelp(e.target.checked)}/><span><Users size={15}/> {t("People need urgent help or are stranded","மக்களுக்கு அவசர உதவி தேவை / சிக்கியுள்ளனர்")}</span></label>
    {needsHelp && <input className="areaInput" type="number" min="1" max="10000" value={peopleAffected} onChange={e => setPeopleAffected(e.target.value)} placeholder="How many people need help? (optional)"/>}
    <label className="upload"><Camera size={17}/> {file ? file.name : t("Add area image","பகுதி புகைப்படத்தைச் சேர்க்கவும்")}<input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0])}/></label>
    {error && <p className="composerError" role="alert">{error}</p>}
    <button disabled={busy}><Send size={16}/> {busy ? t("Posting...","பதிவிடுகிறது...") : t("Share area update","பகுதி தகவலைப் பகிரவும்")}</button>
    <small><MapPin size={13}/> {t(`This update is shared with the ${region.name} feed. Add an area name for a more precise location.`, `${region.tamil || region.name} மாவட்டப் பதிவில் பகிரப்படும். துல்லியமான இடத்திற்குப் பகுதி பெயரைச் சேர்க்கவும்.`)}</small>
  </form>
}
