jest.mock('@expo/vector-icons', () => {
  const MockIcon = () => null;

  return {
    MaterialIcons: MockIcon,
    Ionicons: MockIcon,
    FontAwesome: MockIcon,
  };
});
