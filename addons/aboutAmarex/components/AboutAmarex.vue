<script>
/**
 * AboutAmarex
 * @module modules/AboutAmarex
 */
export default {
  name: "AboutAmarex",

  data() {
    return {
      logos: [
        {
          src: "./resources/logos/RPTU.svg",
          alt: "Rheinland-Pfälzische Technische Universität Logo",
          link: "",
        },
        {
          src: "./resources/logos/KWB_logo_M_blau_211014.png",
          alt: "KWB Logo",
          link: "",
        },
        {
          src: "./resources/logos/EI_logo_RGB_300ppi.png",
          alt: "Eco Logic Logo",
          link: "",
        },
        {
          src: "./resources/logos/Uni_Stuttgart.png",
          alt: "Universität Stuttgart Logo",
          link: "",
        },
        {
          src: "./resources/logos/bwb-logo-farbig.svg",
          alt: "Berliner Wasserbetriebe Logo",
          link: "",
        },
        {
          src: "./resources/logos/tsb.svg",
          alt: "Technologiestiftung Berlin Logo",
          link: "",
        },
        {
          src: "./resources/logos/StEB_Koeln_logo.svg",
          alt: "SteB Köln Logo",
          link: "",
        },
        {
          src: "./resources/logos/HELIX_Logo.png",
          alt: "Helix Logo",
          link: "",
        },
        {
          src: "./resources/logos/Logo_Stadt_Köln.png",
          alt: "Stadt Köln Logo",
          link: "",
        },
      ],
      logosBottom: [
        {
          src: "./resources/logos/BMFTR_de_Web_RGB_gef_durch.jpg",
          alt: "BMFTR Logo",
          link: "",
        },
        {
          src: "./resources/logos/BMBF_FONA_Logo_rgb.svg",
          alt: "Logo FONA",
          link: "https://www.fona.de/de/",
        },
        {
          src: "https://www.amarex-projekt.de/media/site/e232a797db-1745413939/waxo.png",
          alt: "WAX Logo",
          link: "https://www.bmbf-wax.de/",
        },
      ],
      senStadtLogos: [
        {
          src: "./resources/logos/B_SEN_SBW_Logo_DE_H_PW_RGB.png",
          alt: "Berlin Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Logo",
          link: "",
        },
        {
          src: "./resources/logos/B_SEN_UMVK_Logo_DE_H_PW_RGB.png",
          alt: "Berlin Senatsverwaltung für Umwelt, Mobilität, Verbraucher- und Klimaschutz Logo",
          link: "",
        },
      ],
    };
  },
};
</script>

<template lang="html">
  <div class="about-amarex-container">
    <div class="about-amarex">
      <div id="mobile-info">
        <img
          src="../../../portal/amarex/resources/img/amarex_logo_webtool.png"
          alt="Anpassung des Managements von Regenwasser an Extremereignisse"
        />
        <h2 class="title">Mobile Version</h2>
        <p class="mb-4">
          Das Amarex Webtool ist nur für die Nutzung auf dem Desktop vorgesehen,
          damit alle Funktionen vollumfänglich genutzt werden können.
        </p>
      </div>
      <h2 class="title">Über Amarex</h2>
      <p class="mb-4">
        Das
        <a
          :href="'https://www.amarex-projekt.de/de'"
          :target="'_blank'"
          >Projekt AMAREX</a
        >, kurz für "Anpassung des Managements von Regenwasser an
        Extremereignisse", untersucht Möglichkeiten zur Anpassung des
        Regenwassermanagements an die zunehmenden Extrembelastungen Starkregen
        und Trockenheit als Schlüsselbeitrag zur Klimafolgenanpassung.
        Zusätzlich wird der beeinträchtigte urbane Wasserhaushalt als zentraler
        Bewertungsindikator für Wasserextreme überprüft.
      </p>
      <p class="mb-4">
        Das AMAREX-Webtool als Prototyp für Berlin unterstützt dabei, sich
        besser auf Extremwetterereignisse wie Starkregen oder Trockenperioden
        vorzubereiten. Es ermöglicht eine Bewertung von Maßnahmen des
        dezentralen Regenwassermanagements im Hinblick auf ihren Einfluss auf
        den urbanen Wasserhaushalt und liefert eine fundierte Grundlage für
        klimaangepasste Planungsentscheidungen.
      </p>
      <p class="mb-4">Laufzeit: Februar 2022 bis Juli 2025</p>
    </div>

    <div class="logo-container">
      <p class="mb-4">Beteiligte Partner*innen:</p>

      <div class="mb-4">
        <ul class="mb-4">
          <li
            v-for="(logo, index) in logos"
            :key="index"
          >
            <a
              class="logo"
              :href="logo.link ? logo.link : '#'"
              :target="logo.link ? '_blank' : '_self'"
            >
              <img
                v-if="logo.src"
                :src="logo.src"
                :alt="logo.alt"
              />
            </a>
          </li>
        </ul>

        <div class="senStadtLogos">
          <div
            v-for="(logo, index) in senStadtLogos"
            :key="index"
          >
            <a
              class="logo"
              :href="logo.link ? logo.link : '#'"
              :target="logo.link ? '_blank' : '_self'"
            >
              <img
                v-if="logo.src"
                :src="logo.src"
                :alt="logo.alt"
              />
            </a>
          </div>
        </div>

        <ul class="mb-4 logosBottom">
          <li
            v-for="(logo, index) in logosBottom"
            :key="index"
          >
            <a
              class="logo"
              :href="logo.link ? logo.link : '#'"
              :target="logo.link ? '_blank' : '_self'"
            >
              <img
                v-if="logo.src"
                :src="logo.src"
                :alt="logo.alt"
              />
            </a>
          </li>
        </ul>
      </div>

      <p class="mb-4">Förderkennzeichen: 02WEE1624A-H</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.about-amarex-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

ul li {
  flex: 0 0 auto;
}

ul li a img {
  width: 130px;
  height: auto;
  max-height: 60px;
  object-fit: contain;
  display: block;
}

.senStadtLogos {
  display: flex;
  gap: 16px;
  width: 100%;
  margin-bottom: 36px;
}
.senStadtLogos a img {
  height: 100%;
  max-height: 60px;
  width: 100%;
  object-fit: contain;
  display: block;
}

.logosBottom {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}
.logosBottom a img {
  height: 100%;
  max-height: 200px;
  max-width: 200px;
  width: 100%;
  object-fit: contain;
  display: block;
}
.logosBottom li:last-child a img {
  max-width: 125px;
}

.title {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 700;
  line-height: 32px;
}

#mobile-info {
  img {
    width: 100%;
    max-width: 300px;
    height: auto;
    margin-bottom: 16px;
  }
}

@include media-breakpoint-up(lg) {
  #mobile-info {
    display: none !important;
  }
}
</style>

