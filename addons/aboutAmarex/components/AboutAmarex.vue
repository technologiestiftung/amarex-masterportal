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
          alt: "Logo",
          link: "",
        },
        {
          src: "./resources/logos/KWB_logo_M_blau_211014.png",
          alt: "Logo",
          link: "",
        },
        {
          src: "./resources/logos/EI_logo_RGB_300ppi.png",
          alt: "Logo",
          link: "",
        },
        {
          src: "./resources/logos/Uni_Stuttgart.png",
          alt: "Logo",
          link: "",
        },
        {
          src: "./resources/logos/bwb-logo-farbig.svg",
          alt: "Logo",
          link: "",
        },
        {
          src: "./resources/logos/tsb.svg",
          alt: "Logo",
          link: "",
        },
        {
          src: "./resources/logos/StEB_Koeln_logo.svg",
          alt: "Logo",
          link: "",
        },
        {
          src: "./resources/logos/HELIX_Logo.png",
          alt: "Logo",
          link: "",
        },
        {
          src: "./resources/logos/Logo_Stadt_Köln.png",
          alt: "Logo",
          link: "",
        },
      ],
      logosBottom: [
        {
          src: "./resources/logos/BMBF_gefoerdert_deutsch.jpg",
          alt: "BMBF Logo",
          link: "https://www.bmbf.de/bmbf/de/home/home_node.html",
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
          alt: "Berlin Senat Logo",
          link: "",
        },
        {
          src: "./resources/logos/B_SEN_UMVK_Logo_DE_H_PW_RGB.png",
          alt: "Berlin Senat Logo",
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
      <h2 class="title">Über Amarex</h2>

      <p class="mb-4">
        Das
        <a
          :href="'https://www.amarex-projekt.de/de'"
          :target="'_blank'"
          >Projekt AMAREX</a
        >
        , kurz für "Anpassung des Managements von Regenwasser an
        Extremereignisse", untersucht Möglichkeiten zur Anpassung des
        Regenwassermanagements an die zunehmenden Extrembelastungen Starkregen
        und Trockenheit als Schlüsselbeitrag zur Klimafolgenanpassung.
        Zusätzlich wird der beeinträchtigte urbane Wasserhaushalt als zentraler
        Bewertungsindikator für Wasserextreme überprüft.
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

        <div class="mb-4 senStadtLogos">
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

        <ul class="mb-4">
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

      <p class="mb-4">Förderkennzeichen: 02WEE1624</p>
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
}
.senStadtLogos a img {
  height: 100%;
  max-height: 60px;
  width: 100%;
  object-fit: contain;
  display: block;
}

.title {
  color: $amarex_secondary;
  font-size: 16px;
  font-weight: 700;
  line-height: 32px;
}
</style>

