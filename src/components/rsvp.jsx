// RSVP — working form with validation, attending/regrets toggle, and
// success state. Submissions are saved through the Drizzle-backed API route;
// localStorage only keeps the thank-you state on this device.

import * as React from "react";
import { Daisy, Sprig } from "./florals";

export function RSVP() {
  const STORAGE_KEY = 'wj_rsvp_v1';

  const [submitted, setSubmitted] = React.useState(() => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch { return null; }
  });

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    attending: 'yes',     // 'yes' | 'no'
    plusOne: '',
    meal: 'chicken',
    dietary: '',
    song: '',
    note: '',
  });
  const [errors, setErrors] = React.useState({});
  const [pending, setPending] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setAttending = (v) => setForm(f => ({ ...f, attending: v }));

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter your name.";
    if (!form.email.trim()) errs.email = "We'll need an email to confirm.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = "Hmm, that email looks off.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPending(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "We couldn't save your RSVP. Please try again.");
      }
      const record = data.rsvp || { ...form, at: new Date().toISOString() };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); } catch {}
      setSubmitted(record);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "We couldn't save your RSVP. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const reset = () => {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    setSubmitted(null);
  };

  return (
    <section id="rsvp" data-screen-label="06 RSVP">
      <Sprig className="hero-sprig-left no-sway"
             style={{ position: 'absolute', left: '4%', top: '12%',
                      height: '70%', color: 'var(--c-honey)',
                      opacity: 0.35 }}/>
      <Sprig flip className="hero-sprig-right no-sway"
             style={{ position: 'absolute', right: '4%', top: '12%',
                      height: '70%', color: 'var(--c-honey)',
                      opacity: 0.35 }}/>
      <div className="section-inner">
        <div className="section-head reveal">
          <span className="eyebrow">Kindly Reply</span>
          <h2 className="section-title">RSVP</h2>
          <div className="section-sub">By April&nbsp;17,&nbsp;2027</div>
        </div>

        <div className="rsvp-shell reveal delay-1">
          {submitted ? (
            <div className="rsvp-success">
              <Daisy style={{ width: 56, height: 56, margin: '0 auto 8px',
                              color: 'var(--c-sage-dk)' }} className="no-sway"/>
              <h3>Thank you!</h3>
              {submitted.attending === 'yes' ? (
                <p>
                  We've got <strong>{submitted.name}</strong>
                  {submitted.plusOne ? <> &amp; <strong>{submitted.plusOne}</strong></> : null}
                  &nbsp;down for the big day. Can't wait to celebrate with you.
                </p>
              ) : (
                <p>
                  We'll miss you, <strong>{submitted.name}</strong> — thank you
                  for letting us know. We'll be thinking of you.
                </p>
              )}
              <button type="button" className="btn secondary" onClick={reset}>
                Edit reply
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="rsvp-toggle" role="tablist" aria-label="Attending?">
                <button type="button" role="tab"
                        className={form.attending === 'yes' ? 'on' : ''}
                        onClick={() => setAttending('yes')}>
                  Joyfully accept
                </button>
                <button type="button" role="tab"
                        className={form.attending === 'no' ? 'on' : ''}
                        onClick={() => setAttending('no')}>
                  Regretfully decline
                </button>
              </div>

              <div className="rsvp-row">
                <div className="rsvp-field">
                  <label htmlFor="r-name">Your name</label>
                  <input id="r-name" type="text" value={form.name}
                         onChange={set('name')} placeholder="First & last" />
                  {errors.name && <span className="err">{errors.name}</span>}
                </div>
                <div className="rsvp-field">
                  <label htmlFor="r-email">Email</label>
                  <input id="r-email" type="email" value={form.email}
                         onChange={set('email')} placeholder="you@example.com" />
                  {errors.email && <span className="err">{errors.email}</span>}
                </div>
              </div>

              {form.attending === 'yes' && (
                <>
                  <div className="rsvp-field">
                    <label htmlFor="r-plus">Plus-one name <span style={{textTransform:'none',letterSpacing:0}}>(if you have one)</span></label>
                    <input id="r-plus" type="text" value={form.plusOne}
                           onChange={set('plusOne')}
                           placeholder="Leave blank if just you" />
                  </div>

                  <div className="rsvp-row">
                    <div className="rsvp-field">
                      <label htmlFor="r-meal">Meal preference</label>
                      <select id="r-meal" value={form.meal} onChange={set('meal')}>
                        <option value="chicken">Herb-roasted chicken</option>
                        <option value="beef">Braised short rib</option>
                        <option value="fish">Pan-seared trout</option>
                        <option value="veg">Vegetarian (wild-mushroom risotto)</option>
                        <option value="vegan">Vegan plate</option>
                      </select>
                    </div>
                    <div className="rsvp-field">
                      <label htmlFor="r-diet">Allergies / dietary</label>
                      <input id="r-diet" type="text" value={form.dietary}
                             onChange={set('dietary')}
                             placeholder="Nut-free, gluten-free, etc." />
                    </div>
                  </div>

                  <div className="rsvp-field">
                    <label htmlFor="r-song">Song that'll get you on the dance floor</label>
                    <input id="r-song" type="text" value={form.song}
                           onChange={set('song')} placeholder="Artist — Title" />
                  </div>
                </>
              )}

              <div className="rsvp-field">
                <label htmlFor="r-note">
                  {form.attending === 'yes'
                    ? "A note for the couple (optional)"
                    : "Send your love (optional)"}
                </label>
                <textarea id="r-note" value={form.note}
                          onChange={set('note')}
                          placeholder="We'd love to hear from you…" />
              </div>

              <div className="rsvp-actions">
                {serverError && <span className="err">{serverError}</span>}
                <button type="submit" className="btn primary" disabled={pending}>
                  {pending
                    ? "Sending..."
                    : form.attending === 'yes' ? "Send our reply" : "Send regrets"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
