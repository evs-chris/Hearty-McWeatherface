function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Hour Color</Text>}>
        <ColorSelect label="Hour Color" settingsKey="hourColor" colors={[
            { color: "white" },
            { color: "blue" },
            { color: "red" },
            { color: "green" },
            { color: "turquoise" },
            { color: "orchid" },
            { color: "orange" },
            { color: "yellow" },
            { color: "gray" }
          ]}
        />
      </Section>
      <Section
        title={<Text bold align="center">Minute Color</Text>}>
        <ColorSelect label="Minute Color" settingsKey="minuteColor" colors={[
            { color: "blue" },
            { color: "red" },
            { color: "green" },
            { color: "turquoise" },
            { color: "orchid" },
            { color: "orange" },
            { color: "yellow" },
            { color: "white" },
            { color: "gray" }
          ]}
        />
      </Section>
      <Section
        title={<Text bold align="center">Heartrate Color</Text>}>
        <ColorSelect label="Heartrate Color" settingsKey="heartrateColor" colors={[
            { color: "red" },
            { color: "blue" },
            { color: "turquoise" },
            { color: "green" },
            { color: "orchid" },
            { color: "orange" },
            { color: "yellow" },
            { color: "white" },
          ]}
        />
      </Section>
      <Section
        title={<Text bold align="center">Graph Color</Text>}>
        <ColorSelect label="Heartrate Color" settingsKey="graphColor" colors={[
            { color: "lightgreen" },
            { color: "red" },
            { color: "lightblue" },
            { color: "turquoise" },
            { color: "orchid" },
            { color: "orange" },
            { color: "yellow" },
            { color: "white" },
          ]}
        />
      </Section>
      <Section
        title={<Text bold align="center">Settings</Text>}>
        <Toggle settingsKey="time" label="12 Hour Time" />
        <Toggle settingsKey="temp" label="Use imperial units" />
        <Toggle settingsKey="forceZip" label="Force Zip for weather" />
        <TextInput label="Alternative Zip" settingsKey="altZip" />
        <TextInput label="Optional OpenWeatherMap API Key" settingsKey="weatherKey" />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);