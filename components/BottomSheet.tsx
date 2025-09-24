
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Platform
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { colors } from '../styles/commonStyles';

interface SimpleBottomSheetProps {
  children?: React.ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Snap positions for the bottom sheet
const SNAP_POINTS = {
  HALF: SCREEN_HEIGHT * 0.5,
  FULL: SCREEN_HEIGHT * 0.8,
  CLOSED: SCREEN_HEIGHT,
};

const SimpleBottomSheet: React.FC<SimpleBottomSheetProps> = ({
  children,
  isVisible = false,
  onClose
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const gestureTranslateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [currentSnapPoint, setCurrentSnapPoint] = useState(SNAP_POINTS.HALF);
  const lastGestureY = useRef(0);
  const startPositionY = useRef(0);

  useEffect(() => {
    try {
      if (isVisible) {
        setCurrentSnapPoint(SNAP_POINTS.HALF);
        gestureTranslateY.setValue(0);
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT - SNAP_POINTS.HALF,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setCurrentSnapPoint(SNAP_POINTS.CLOSED);
        gestureTranslateY.setValue(0);
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error('BottomSheet animation error:', error);
    }
  }, [isVisible, translateY, backdropOpacity, gestureTranslateY]);

  const handleBackdropPress = useCallback(() => {
    try {
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('BottomSheet backdrop press error:', error);
    }
  }, [onClose]);

  const snapToPoint = useCallback((point: number) => {
    try {
      setCurrentSnapPoint(point);
      gestureTranslateY.setValue(0);
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT - point,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('BottomSheet snap to point error:', error);
    }
  }, [translateY, gestureTranslateY]);

  // Determines the closest snap point based on velocity and position
  const getClosestSnapPoint = useCallback((currentY: number, velocityY: number) => {
    try {
      const currentPosition = SCREEN_HEIGHT - currentY;

      if (velocityY > 1000) return SNAP_POINTS.CLOSED;
      if (velocityY < -1000) return SNAP_POINTS.FULL;

      const distances = [
        { point: SNAP_POINTS.HALF, distance: Math.abs(currentPosition - SNAP_POINTS.HALF) },
        { point: SNAP_POINTS.FULL, distance: Math.abs(currentPosition - SNAP_POINTS.FULL) },
      ];

      if (currentPosition < SNAP_POINTS.HALF * 0.5) {
        return SNAP_POINTS.CLOSED;
      }

      distances.sort((a, b) => a.distance - b.distance);
      return distances[0].point;
    } catch (error) {
      console.error('BottomSheet get closest snap point error:', error);
      return SNAP_POINTS.HALF;
    }
  }, []);

  // Handles pan gesture events with boundary clamping
  const onGestureEvent = useCallback((event: any) => {
    try {
      if (!event?.nativeEvent) {
        console.log('BottomSheet: Invalid gesture event - skipping');
        return;
      }

      const { translationY } = event.nativeEvent;
      
      // Validate translationY is a number
      if (typeof translationY !== 'number' || isNaN(translationY)) {
        console.log('BottomSheet: Invalid translationY value - skipping');
        return;
      }

      lastGestureY.current = translationY;

      const currentBasePosition = SCREEN_HEIGHT - currentSnapPoint;
      const intendedPosition = currentBasePosition + translationY;

      const minPosition = SCREEN_HEIGHT - SNAP_POINTS.FULL;
      const maxPosition = SCREEN_HEIGHT;

      const clampedPosition = Math.max(minPosition, Math.min(maxPosition, intendedPosition));
      const clampedTranslation = clampedPosition - currentBasePosition;

      gestureTranslateY.setValue(clampedTranslation);
    } catch (error) {
      console.error('BottomSheet gesture event error:', error);
    }
  }, [currentSnapPoint, gestureTranslateY]);

  // Handles gesture state changes (begin/end) for snapping behavior
  const onHandlerStateChange = useCallback((event: any) => {
    try {
      if (!event?.nativeEvent) {
        console.log('BottomSheet: Invalid handler state change event - skipping');
        return;
      }

      const { state, translationY, velocityY } = event.nativeEvent;

      // Validate state
      if (typeof state !== 'number') {
        console.log('BottomSheet: Invalid state value - skipping');
        return;
      }

      if (state === State.BEGAN) {
        startPositionY.current = SCREEN_HEIGHT - currentSnapPoint;
      } else if (state === State.END) {
        const safeTranslationY = typeof translationY === 'number' && !isNaN(translationY) ? translationY : 0;
        const safeVelocityY = typeof velocityY === 'number' && !isNaN(velocityY) ? velocityY : 0;

        const currentBasePosition = SCREEN_HEIGHT - currentSnapPoint;
        const intendedPosition = currentBasePosition + safeTranslationY;

        const minPosition = SCREEN_HEIGHT - SNAP_POINTS.FULL;
        const maxPosition = SCREEN_HEIGHT;

        const finalY = Math.max(minPosition, Math.min(maxPosition, intendedPosition));
        const targetSnapPoint = getClosestSnapPoint(finalY, safeVelocityY);

        gestureTranslateY.setValue(0);

        if (targetSnapPoint === SNAP_POINTS.CLOSED) {
          if (onClose) {
            onClose();
          }
        } else {
          snapToPoint(targetSnapPoint);
        }
      }
    } catch (error) {
      console.error('BottomSheet handler state change error:', error);
    }
  }, [currentSnapPoint, getClosestSnapPoint, onClose, snapToPoint, gestureTranslateY]);

  // Don't render if not visible to avoid unnecessary DOM elements
  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdropOpacity }
            ]}
          />
        </TouchableWithoutFeedback>

        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          enabled={Platform.OS !== 'web'} // Disable gestures on web to prevent warnings
        >
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [
                  { translateY: Animated.add(translateY, gestureTranslateY) }
                ],
              },
            ]}
          >
            <View style={styles.handle} />

            <View style={styles.contentContainer}>
              {children || (
                <View style={styles.defaultContent}>
                  <Text style={styles.title}>Bottom Sheet 🎉</Text>
                  <Text style={styles.description}>
                    This is a custom bottom sheet implementation.
                    {Platform.OS !== 'web' && ' Try dragging it up and down!'}
                  </Text>
                  <Button
                    title="Close"
                    onPress={handleBackdropPress}
                  />
                </View>
              )}
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
};

SimpleBottomSheet.displayName = 'SimpleBottomSheet';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  bottomSheet: {
    height: SNAP_POINTS.FULL,
    backgroundColor: colors.background || '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px -3px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textSecondary || '#cccccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  defaultContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default SimpleBottomSheet;
