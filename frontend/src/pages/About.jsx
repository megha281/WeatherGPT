const FEATURES = [
  ['🌦️', 'Get Weather Forecasts', 'Check current weather conditions and upcoming forecasts for your location.'],
  ['🤖', 'Ask Weather Questions', 'Interact with WeatherGPT using natural language. Ask questions such as "Will it rain tomorrow?", "What should I wear today?", or "Is it safe to travel?"'],
  ['📍', 'Location-Based Weather Insights', 'Select a location and receive weather information and relevant risk insights for that area.'],
  ['⚠️', 'Stay Aware with Weather Alerts', 'Receive important information about severe weather conditions and potential hazards.'],
  ['🗺️', 'Explore Weather on Maps', 'Use interactive maps to explore locations and understand weather conditions geographically.'],
  ['🌍', 'Discover Climate Information', 'Learn about climate patterns, rainfall, seasons, and other meteorological information in an easy-to-understand way.'],
];

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="max-w-3xl">
        <span className="chip">ABOUT WEATHERGPT</span>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          Your intelligent companion for understanding the weather
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-mist-200">
          WeatherGPT is a modern, AI-powered weather platform that makes weather information easier to understand and use.
        </p>
        <p className="mt-4 leading-relaxed text-mist-300">
          Instead of navigating through complicated weather data, WeatherGPT brings forecasts, weather alerts,
          location-based insights, climate information, and conversational AI together in one simple platform.
        </p>
      </header>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">What You Can Do with WeatherGPT</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURES.map(([icon, title, body]) => (
            <article key={title} className="panel p-5">
              <span className="text-3xl" role="img" aria-label="">{icon}</span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 leading-relaxed text-mist-300">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel mt-12 p-6 sm:p-8">
        <h2 className="section-title">Designed Around You</h2>
        <p className="mt-4 leading-relaxed text-mist-200">
          WeatherGPT combines weather data and artificial intelligence to turn complex meteorological information into
          clear and useful insights.
        </p>
        <p className="mt-4 leading-relaxed text-mist-300">
          Whether you're planning your day, preparing for travel, monitoring changing weather conditions, or simply
          curious about the climate around you, WeatherGPT helps you understand the information that matters.
        </p>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Our Vision</h2>
        <p className="mt-4 text-xl font-semibold leading-relaxed text-signal-400">
          Make weather information simple, accessible, and actionable for everyone.
        </p>
        <p className="mt-4 leading-relaxed text-mist-300">
          WeatherGPT is designed to bring reliable weather information into a conversational experience so that users
          can spend less time interpreting weather data and more time making informed decisions.
        </p>
      </section>

      <footer className="mt-12 border-t border-white/10 pt-6 text-sm text-mist-400">
        WeatherGPT — Understand the weather. Plan with confidence.
      </footer>
    </div>
  );
}
