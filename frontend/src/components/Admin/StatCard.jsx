const accentStyles = {
  esmeralda: { bg: 'bg-esmeralda/10', text: 'text-esmeralda', border: 'border-l-esmeralda' },
  profundo: { bg: 'bg-profundo/10', text: 'text-profundo', border: 'border-l-profundo' },
  naranja: { bg: 'bg-naranja/10', text: 'text-naranja', border: 'border-l-naranja' },
}

function StatCard({ label, value, icon: Icon, accent = 'esmeralda', hint }) {
  const styles = accentStyles[accent]

  return (
    <div
      className={`group rounded-2xl bg-white border border-black/5 border-l-4 ${styles.border} p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-grafito/60 text-sm font-medium">{label}</p>
          <p className={`mt-2 text-3xl font-black ${styles.text}`}>{value}</p>
          {hint && <p className="mt-1 text-xs text-grafito/40">{hint}</p>}
        </div>
        {Icon && (
          <div className={`rounded-xl ${styles.bg} p-3 group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={20} className={styles.text} />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard