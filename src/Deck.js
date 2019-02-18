import React, { Component } from "react";
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  LayoutAnimation,
  UIManager
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.5 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  };
  constructor(props) {
    super(props);
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true, //executed any time a user presses or taps on the screen
      onPanResponderMove: (event, gesture) => {
        const { dx } = gesture;
        position.setValue({ x: dx });
      }, //callback is called any time the user their finger drags across the screen
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe("left");
        } else {
          this.resetPosition();
        }
      } //callback is called any time the user removes their finger from the screen
    });

    this.state = { panResponder, position, index: 0, prevProps: { data: [] } }; //not required. PanResponder never needs setState calls
  }

  forceSwipe(direction) {
    const x = direction === "right" ? SCREEN_WIDTH * 2 : -SCREEN_WIDTH * 2;
    //linear animation of timing vs bouncy animation of spring
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION //250ms
    }).start(() => this.onSwipeComplete(direction));
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];
    direction === "right" ? onSwipeRight(item) : onSwipeLeft(item);
    this.state.position.setValue({ x: 0, y: 0 });
    this.setState({ index: this.state.index + 1 });
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  componentDidUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);

    LayoutAnimation.spring();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({ index: 0 });
    }
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 2.0, 0, SCREEN_WIDTH * 2.0], //-500 ----- 500  0 = the mid point, can also be -300
      outputRange: ["-100deg", "0deg", "100deg"] // at -500 units = -120 deg, 500 units on the x-axis = 120 deg. 0 deg of translation = 0
    });
    return {
      ...position.getLayout(),
      transform: [
        {
          rotate
        }
      ]
    };
  }

  renderCards() {
    const { panResponder, index } = this.state;
    const { data, renderCard, renderNoMoreCards } = this.props;
    const { cardStyle, foregroundCardStyle } = styles;
    if (index >= data.length) {
      return renderNoMoreCards();
    }
    return data
      .map((item, i) => {
        if (i < index) {
          return null;
        }
        if (i === index) {
          return (
            <Animated.View
              key={`animated>${index}`}
              style={[this.getCardStyle(), cardStyle]}
              {...panResponder.panHandlers}
            >
              {renderCard(item)}
            </Animated.View>
          );
        }
        return (
          <Animated.View
            style={[cardStyle, { top: 10 * (i - this.state.index) }]}
            key={item.id}
          >
            {renderCard(item)}
          </Animated.View>
        );
      })
      .reverse();
  }

  render() {
    return <View>{this.renderCards()}</View>;
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    position: "absolute",
    width: SCREEN_WIDTH
  },
  foregroundCardStyle: {
    top: 50
  }
});

export default Deck;
