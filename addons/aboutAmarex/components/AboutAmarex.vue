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
          src: "./resources/logos/BMBF_gefoerdert_deutsch.jpg",
          alt: "BMBF Logo",
          link: "https://www.bmbf.de/bmbf/de/home/home_node.html",
        },
        // TODO: update logo
        {
          src: "https://www.amarex-projekt.de/media/site/e232a797db-1745413939/waxo.png",
          alt: "WAX Logo",
          link: "https://www.bmbf-wax.de/",
        },
        {
          src: "./resources/logos/BMBF_FONA_Logo_rgb.svg",
          alt: "Logo FONA",
          link: "https://www.fona.de/de/",
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
        Das Projekt AMAREX, kurz für "Anpassung des Managements von Regenwasser
        an Extremereignisse", untersucht Möglichkeiten zur Anpassung des
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
        <ul class="">
          <li
            v-for="(logo, index) in logos"
            :key="index"
            class=""
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
}

ul li {
  flex: 0 0 auto;
}

ul li a img {
  width: 120px;
  height: auto;
  max-height: 60px;
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

