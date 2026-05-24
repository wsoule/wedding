// Countdown — live ticking countdown to the wedding day.
// Each digit flips when it changes, and a field of petals drifts behind.

function CountdownDigit({ d }) {
  const [prev, setPrev] = React.useState(d);
  const [flipping, setFlipping] = React.useState(false);
  React.useEffect(() => {
    if (d !== prev) {
      setFlipping(true);
      const t = setTimeout(() => { setPrev(d); setFlipping(false); }, 320);
      return () => clearTimeout(t);
    }
  }, [d, prev]);
  return <span className={`digit ${flipping ? 'flip' : ''}`}>{flipping ? prev : d}</span>;
}

function CountdownCell({ value, label }) {
  const padded = String(value).padStart(2, '0');
  return (
    <div className="cd-cell">
      <Daisy className="cd-bloom no-sway" />
      <div className="cd-num">
        {padded.split('').map((ch, i) => <CountdownDigit key={i + '-' + ch} d={ch} />)}
      </div>
      <div className="cd-label">{label}</div>
    </div>
  );
}

function Countdown({ targetISO }) {
  const target = React.useMemo(() => new Date(targetISO), [targetISO]);
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  // Random petal field, generated once so positions are stable across re-renders.
  const petals = React.useMemo(() => (
    Array.from({ length: 22 }).map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 14,
      dur: 9 + Math.random() * 9,
      size: 10 + Math.random() * 10,
      color: ['var(--c-blush)', 'var(--c-honey)', 'var(--c-terra)',
              'var(--c-sage)'][Math.floor(Math.random() * 4)],
      key: i,
    }))
  ), []);

  return (
    <section id="countdown" data-screen-label="04 Countdown">
      <div className="petal-field" aria-hidden="true">
        {petals.map(p => (
          <Petal key={p.key} className="no-sway"
                 color={p.color}
                 style={{
                   left: p.left + '%',
                   width: p.size, height: p.size * 1.5,
                   animationDelay: `-${p.delay}s`,
                   animationDuration: `${p.dur}s`,
                 }}/>
        ))}
      </div>
      <div className="section-inner countdown-wrap reveal">
        <span className="eyebrow">Save the date</span>
        <h2 className="section-title">Counting petals</h2>
        <div className="section-sub">Until we say "I do"</div>
        <div className="countdown-grid">
          <CountdownCell value={days} label="Days" />
          <CountdownCell value={hours} label="Hours" />
          <CountdownCell value={mins} label="Minutes" />
          <CountdownCell value={secs} label="Seconds" />
        </div>
        <div className="cd-tag">…and then forever.</div>
      </div>
    </section>
  );
}

window.Countdown = Countdown;
