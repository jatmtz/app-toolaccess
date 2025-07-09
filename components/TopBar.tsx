import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function TopBar() {
  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Image source={require('@/assets/images/256x256.png')} style={styles.icon} />
      </TouchableOpacity>
      <Text style={styles.title}>ToolAccess</Text>
      <TouchableOpacity>
        {/*<Image source={require('@/assets/images/notification-icon.png')} style={styles.icon} />*/}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#002B5B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  icon: {
    width: 28,
    height: 28,
  },
});
