jest.mock('@expo/vector-icons', () => {
  const MockIcon = () => null;

  return {
    MaterialIcons: MockIcon,
    Ionicons: MockIcon,
    FontAwesome: MockIcon,
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock')
);
