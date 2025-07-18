import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Colors} from '../constants/Colors';

interface PlantLevelProps {
  active: boolean;
}

export const PlantLevel: React.FC<PlantLevelProps> = ({active}) => (
  <View style={styles.plantLevel}>
    <View
      style={[
        styles.plantPot,
        {
          backgroundColor: active ? Colors.plantGreen : Colors.surface,
          borderColor: active ? Colors.plantGreen : Colors.textSecondary,
        },
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  plantLevel: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantPot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
});
