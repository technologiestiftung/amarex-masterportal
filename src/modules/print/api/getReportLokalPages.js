/* makeHeader("Maßnahmenplanung: Lokale Betrachtung");
    text({
      text: `Betrachtete Blockteilfläche: Blockteilnummer ${payload.seite_6_betrachteteblockteilflaeche_blockteilnummer}`,
      extraMarginBottom: 14,
    });
    text({
      text: "Gewählte Maßnahmen in Ihrem Untersuchungsgebiet:",
    });
    text({
      text: ` • Dachbegrünung Anzahl: ${payload.seite_6_dachbegruenung_anzahl}`,
    });
    text({
      text: ` • Entsiegelung Anzahl: ${payload.seite_6_entsiegelung_anzahl}`,
    });
    text({
      text: ` • Muldenversickerung Anzahl: ${payload.seite_6_muldenversickerung_anzahl}`,
      extraMarginBottom: 28,
    });
    text({
      text: "Gesamtübersicht der Maßnahmenkombination im ausgewählten Blockteil:",
      extraMarginBottom: 20,
    });
    text({
      text: "Summe Mulde:",
      noLineBreak: true,
    });
    text({
      text: "Summe Dachbegrünung:",
      x: paddingVertical + pageInnerWidth / 2,
    });
    text({
      text: ` • Oberfläche: ${payload.seite_6_summe_mulde_flaeche} m²`,
      noLineBreak: true,
    });
    text({
      text: ` • Oberfläche: ${payload.seite_6_summe_dachbegruenung_flaeche} m²`,
      x: paddingVertical + pageInnerWidth / 2,
    });
    text({
      text: ` • Volumen: ${payload.seite_6_summe_mulde_volumen} m²`,
    });
    text({
      text: ` • angeschlossene Fläche: ${payload.seite_6_summe_mulde_angeschlosseneflaeche} m²`,
      noLineBreak: true,
    });
    text({
      text: "Summe Entsiegelung:",
      x: paddingVertical + pageInnerWidth / 2,
    });
    text({
      text: ` • Oberfläche: ${payload.seite_6_summe_entsiegelung_flaeche} m²`,
      x: paddingVertical + pageInnerWidth / 2,
    });

    // 7. Page
    makeHeader("Maßnahmenplanung: Lokale Betrachtung");

    text({
      text: "Status Quo/Simulation",
      size: 18,
      weight: "b",
      extraMarginBottom: 10,
    });
    text({
      text: "Flächenanteile:",
      noLineBreak: true,
    });
    text({
      text: "Flächenanteile (Ihre Simulation):",
      x: paddingVertical + pageInnerWidth / 2,
    });
    text({
      text: ` • Dachfläche: ${payload.seite_7_status_quo_dachflaeche_flaeche} m² (${payload.seite_7_status_quo_dachflaeche_prozente} %)`,
      noLineBreak: true,
    });
    text({
      text: ` • Dachfläche: ${payload.seite_7_simulation_dachflaeche_flaeche} m² (${payload.seite_7_simulation_dachflaeche_prozente} %)`,
      x: paddingVertical + pageInnerWidth / 2,
    });
    text({
      text: ` • Davon begrünt: ${payload.seite_7_status_quo_davonbegruent_flaeche} m² (${payload.seite_7_status_quo_davonbegruent_prozente} %)`,
      noLineBreak: true,
    });
    text({
      text: ` • Davon begrünt: ${payload.seite_7_simulation_davonbegruent_flaeche} m² (${payload.seite_7_simulation_davonbegruent_prozente} %)`,
      x: paddingVertical + pageInnerWidth / 2,
    });
    text({
      text: ` • Unbebaut Versiegelte Fläche: ${payload.seite_7_status_quo_versiegelteflaeche_flaeche} m² (${payload.seite_7_status_quo_versiegelteflaeche_prozente} %)`,
      noLineBreak: true,
    });
    text({
      text: ` • Unbebaut Versiegelte Fläche: ${payload.seite_7_simulation_versiegelteflaeche_flaeche} m² (${payload.seite_7_simulation_versiegelteflaeche_prozente} %)`,
      x: paddingVertical + pageInnerWidth / 2,
    });
    text({
      text: ` • Unversiegelte Fläche: ${payload.seite_7_status_quo_unversiegelteflaeche_flaeche} m² (${payload.seite_7_status_quo_unversiegelteflaeche_prozente} %)`,
      noLineBreak: true,
    });
    text({
      text: ` • Unversiegelte Fläche: ${payload.seite_7_simulation_unversiegelteflaeche_flaeche} m² (${payload.seite_7_simulation_unversiegelteflaeche_prozente} %)`,
      x: paddingVertical + pageInnerWidth / 2,
      extraMarginBottom: 28,
    });
    text({
      text: "Wasserhaushalt",
      size: 18,
      weight: "b",
      extraMarginBottom: 10,
    });
    text({
      text: "Durch die Variierung der Parameter für die Regenwasserbewirtschaftungsmaßnahmen haben Sie den Wasserhaushalt beeinflusst. Die Ergebnisse Ihrer Simulation sind im Folgenden dem Status Quo Wasserhaushalt für das Untersuchungsgebiet gegenübergestellt.",
      extraMarginBottom: 10,
    });
    text({
      text: "Status Quo-Szenario:",
      noLineBreak: true,
    });
    text({
      text: "Ihre Simulation:",
      x: paddingVertical + pageInnerWidth / 2,
    });
    text({
      text: ` • Oberflächenabfluss: ${payload.seite_7_status_quo_oberflaechenabfluss_mma} mm/a (${payload.seite_7_status_quo_oberflaechenabfluss_prozente} %)`,
      noLineBreak: true,
      maxWidth: pageInnerWidth / 2 - mm(24),
    });
    text({
      text: ` • Oberflächenabfluss: ${payload.seite_7_simulation_oberflaechenabfluss_mma} mm/a (${payload.seite_7_simulation_oberflaechenabfluss_prozente} %)`,
      x: paddingVertical + pageInnerWidth / 2,
    });
    text({
      text: ` • Infiltration: ${payload.seite_7_status_quo_versickerung_mma} mm/a (${payload.seite_7_status_quo_versickerung_prozente} %)`,
      noLineBreak: true,
      maxWidth: pageInnerWidth / 2 - mm(24),
    });
    text({
      text: ` • Infiltration: ${payload.seite_7_simulation_versickerung_mma} mm/a (${payload.seite_7_simulation_versickerung_prozente} %)`,
      x: paddingVertical + pageInnerWidth / 2,
    });
    text({
      text: ` • Verdunstung: ${payload.seite_7_status_quo_evapotranspiration_mma} mm/a (${payload.seite_7_status_quo_evapotranspiration_prozente} %)`,
      noLineBreak: true,
      maxWidth: pageInnerWidth / 2 - mm(24),
    });
    text({
      text: ` • Verdunstung: ${payload.seite_7_simulation_evapotranspiration_mma} mm/a (${payload.seite_7_simulation_evapotranspiration_prozente} %)`,
      x: paddingVertical + pageInnerWidth / 2,
      maxWidth: pageInnerWidth / 2 - mm(24),
    });
    text({
      text: ` • Delta W: ${payload.seite_7_status_quo_deltaw} %`,
      noLineBreak: true,
      maxWidth: pageInnerWidth / 2 - mm(24),
    });
    text({
      text: ` • Delta W: ${payload.seite_7_simulation_deltaw} %`,
      x: paddingVertical + pageInnerWidth / 2,
      maxWidth: pageInnerWidth / 2 - mm(24),
    }); */