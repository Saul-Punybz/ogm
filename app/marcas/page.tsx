import Link from "next/link";
import { site } from "@/lib/site";

export const metadata = { title: "Para marcas" };

const FORMATOS = [
  {
    titulo: "Activación local",
    texto:
      "Un torneo en tu tienda, centro comercial o evento. Lo producimos, lo transmitimos y lo recortamos en clips para tus redes. Tú pones el lugar; nosotros ponemos la gente.",
  },
  {
    titulo: "Torneo con tu marca",
    texto:
      "Una copa con tu nombre en uno de los juegos de la liga, llave en mano: inscripción, reglas, transmisión, premios y cobertura. Sale de nuestra plataforma con resultados y perfiles reales.",
  },
  {
    titulo: "Temporada",
    texto:
      "Tu marca en el nombre de la temporada, en los rankings, en el marcador de cada transmisión y en los premios. Es la presencia más larga: meses, no un fin de semana.",
  },
];

const MIDE = [
  "Jugadores inscritos, por juego y por pueblo",
  "Horas vistas y pico de espectadores en Kick y Twitch",
  "Clips publicados y su alcance en TikTok e Instagram",
  "Asistencia en sitio, cuando hay evento presencial",
];

export default function Marcas() {
  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Para marcas</div>
        <h1>
          Los gamers de Puerto Rico están en el <em>celular</em>.
        </h1>
        <p className="muted">
          OGM es la liga de esports móvil de Puerto Rico: Free Fire, Clash Royale y Brawlhalla,
          con inscripción gratis porque los premios los ponen las marcas. Tu marca no interrumpe
          el juego: es la razón por la que se juega.
        </p>
      </section>

      <section className="section wrap stack">
        <h2>Qué puedes auspiciar</h2>
        <div className="cards">
          {FORMATOS.map((f) => (
            <div key={f.titulo} className="card">
              <h3>{f.titulo}</h3>
              <p className="small muted">{f.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section wrap stack">
        <h2>Con creadores de aquí</h2>
        <p className="muted" style={{ maxWidth: "62ch" }}>
          Cada temporada tiene streamers de Puerto Rico como cara, no solo como invitados. Tu
          activación llega a la comunidad de ellos además de la de la liga.
        </p>
      </section>

      <section className="section wrap stack">
        <h2>Qué recibes</h2>
        <p className="muted small">
          Un reporte a las dos semanas de cada activación, con números de nuestra propia
          plataforma y de las transmisiones:
        </p>
        <ul className="checklist">
          {MIDE.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="section wrap stack">
        <h2>Hablemos</h2>
        {site.contactEmail ? (
          <a href={`mailto:${site.contactEmail}`} className="btn">
            Escríbenos a {site.contactEmail}
          </a>
        ) : site.discordInvite ? (
          <a href={site.discordInvite} className="btn" target="_blank" rel="noreferrer">
            Escríbenos en el Discord de OGM
          </a>
        ) : (
          <p className="note">Contacto comercial por anunciar.</p>
        )}
        <p className="small muted">
          ¿Prefieres ver primero cómo funciona? Mira el <Link href="/juegos">ranking</Link> y el{" "}
          <Link href="/torneos">calendario</Link>.
        </p>
      </section>
    </>
  );
}
