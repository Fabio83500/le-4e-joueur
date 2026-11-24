"use client";
import { useState } from "react";
import { PhotoInput } from "@/components/PhotoInput";

export function VerifForm() {
  const [method, setMethod] = useState("licence");
  return (
    <>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Comment veux-tu vérifier ton niveau ?</legend>
        <div className="choice">
          <label><input type="radio" name="method" value="licence" checked={method === "licence"} onChange={() => setMethod("licence")} />N° de licence</label>
          <label><input type="radio" name="method" value="capture" checked={method === "capture"} onChange={() => setMethod("capture")} />Capture TenUp</label>
        </div>
        <label style={{ fontWeight: 600, fontSize: 15, display: "flex", gap: 8, marginTop: 10 }}>
          <input type="radio" name="method" value="none" style={{ width: "auto" }} checked={method === "none"} onChange={() => setMethod("none")} />
          Je n'ai pas de licence ou je débute
        </label>
      </fieldset>
      {method === "licence" && (
        <div className="field">
          <label htmlFor="licence">Numéro de licence FFT</label>
          <input id="licence" name="licence" placeholder="Ex. 1234567 A" autoComplete="off" required />
          <span className="hint">Il est sur ta licence et dans ton profil TenUp.</span>
        </div>
      )}
      {method === "capture" && (
        <div className="field">
          <label htmlFor="capture">Capture d'écran de ton profil TenUp</label>
          <PhotoInput id="capture" name="capture" required />
          <span className="hint">Ton nom et ton classement padel doivent être lisibles.</span>
        </div>
      )}
      {method === "none" && <p className="sub">Pas de souci : tu rejoindras le groupe Débutants et non classés de ton secteur.</p>}
    </>
  );
}
