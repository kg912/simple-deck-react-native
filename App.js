import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, Button } from "react-native-elements";

import DATA from "./src/dummyData";
import Deck from "./src/Deck";

export default class App extends Component {
  constructor() {
    super();
  }
  renderCard({ id, text, uri }) {
    return (
      <Card key={id} title={text} image={{ uri }}>
        <Text style={styles.textStyle}>I can customise this card further!</Text>
        <Button icon={{ name: "code" }} backgroundColor="#03A9F4" />
      </Card>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <Deck
          data={DATA}
          renderCard={this.renderCard}
          renderNoMoreCards={this.renderNoMoreCards}
        />
      </View>
    );
  }

  renderNoMoreCards() {
    return (
      <Card title="All Done!">
        <Text style={styles.textStyle}>There's no more content here</Text>
        <Button backgroundColor="#03A9F4" title="Get More" />
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e2e2e2",
    paddingTop: 30
  },
  textStyle: {
    marginBottom: 10
  }
});
